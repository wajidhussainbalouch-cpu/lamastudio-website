/* =========================================================
   lamaPhotoResizer — app.js
   lamaStudio.pk — 100% client-side image processing.

   v2 fixes (this revision):
   - Resize now CROPS to fill the exact target dimensions ("cover" fit)
     instead of padding/letterboxing ("contain" fit). This is what makes
     a "413x531 passport" selection actually produce a 413x531 photo
     that fills the frame, matching what a passport/CNIC form expects.
   - Background changer now does real subject/background separation using
     an on-device AI model (MediaPipe Selfie Segmenter, via CDN, runs
     entirely in the browser — no server, no upload) instead of only
     filling empty letterbox padding. See applyBackgroundReplace() below.
   - Processing errors now always clear the spinner and mark the card
     clearly instead of leaving it stuck on "Processed…" forever.
   ========================================================= */

(() => {
  "use strict";

  /* ---------------- Constants ---------------- */
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const PRESET_KEY = "lamaPhotoResizer.preset.v1";
  const THEME_KEY = "lamaPhotoResizer.theme";

  // MediaPipe Tasks Vision — loaded lazily, only the first time a
  // background replacement is actually requested, and cached afterwards.
  const MEDIAPIPE_VERSION = "0.10.14";
  const VISION_BUNDLE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/vision_bundle.mjs`;
// ---- lamaPhotoResizer API (Laravel backend) — trial/license + payment claims.
  // Dynamically switches between local development server and central production backend.
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : 'https://lamastudio.pk/backend/public/api';

  const DEVICE_ID_KEY = "lamaPhotoResizer.deviceId";
  const LICENSE_KEY_KEY = "lamaPhotoResizer.licenseKey";
  const SELFIE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

  // ---- lamaPhotoResizer API (Laravel backend) — trial/license + payment claims.
  // Change this to your deployed API origin (see backend README).
  const API_BASE_URL = "https://api.lamastudio.pk";
  const DEVICE_ID_KEY = "lamaPhotoResizer.deviceId";
  const LICENSE_KEY_KEY = "lamaPhotoResizer.licenseKey";

  // ---- remove.bg cloud engine — key stays in this browser and is sent
  // directly to remove.bg; lamaStudio.pk's own server never sees it.
  const REMOVEBG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";
  const REMOVEBG_KEY_STORAGE = "lamaPhotoResizer.removebg.key";

  /* ---------------- DOM refs ---------------- */
  const $ = (sel) => document.querySelector(sel);

  const dropzone       = $("#dropzone");
  const fileInput      = $("#fileInput");
  const grid           = $("#previewGrid");
  const emptyNote      = $("#emptyNote");
  const batchBar       = $("#batchBar");
  const batchCountEl   = $("#batchCount");
  const batchStatusEl  = $("#batchStatus");
  const clearAllBtn    = $("#clearAllBtn");
  const processAllBtn  = $("#processAllBtn");
  const downloadZipBtn = $("#downloadZipBtn");
  const cardTemplate   = $("#cardTemplate");

  const bgSwatches   = document.querySelectorAll("#bgSwatches .swatch");
  const bgAiStatus   = $("#bgAiStatus");
  const dimPreset    = $("#dimPreset");
  const widthInput   = $("#widthInput");
  const heightInput  = $("#heightInput");
  const lockAspect   = $("#lockAspect");
  const minKBInput   = $("#minKB");
  const maxKBInput   = $("#maxKB");
  const outputFormat = $("#outputFormat");
  const savePresetBtn = $("#savePresetBtn");
  const presetStatus  = $("#presetStatus");
  const themeToggle   = $("#themeToggle");

  const licenseChip     = $("#licenseChip");
  const licenseDot      = $("#licenseDot");
  const licenseChipText = $("#licenseChipText");
  const upgradeBtn      = $("#upgradeBtn");
  const privacyChipText = $("#privacyChipText");

  const engineOnDevice  = $("#engineOnDevice");
  const engineRemoveBg  = $("#engineRemoveBg");
  const removeBgKeyRow  = $("#removeBgKeyRow");
  const removeBgKeyInput = $("#removeBgKeyInput");

  const upgradeModal      = $("#upgradeModal");
  const closeUpgradeModal = $("#closeUpgradeModal");
  const licenseDetailText = $("#licenseDetailText");
  const planBtns          = document.querySelectorAll(".plan-btn");
  const paymentClaimForm  = $("#paymentClaimForm");
  const claimMethod   = $("#claimMethod");
  const claimAmount   = $("#claimAmount");
  const claimTxId     = $("#claimTxId");
  const claimName     = $("#claimName");
  const claimContact  = $("#claimContact");
  const submitClaimBtn = $("#submitClaimBtn");
  const claimStatus   = $("#claimStatus");

  /* ---------------- State ---------------- */
  let settings = {
    bgMode: "none",     // none | white | blue | navy
    bgColor: "transparent",
    bgEngine: "on_device", // on_device | remove_bg
    width: 800,
    height: 600,
    lockAspect: false,
    minKB: 10,
    maxKB: 25,
    format: "image/jpeg",
  };

  // batch items: { id, file, originalUrl, img, status, resultBlob, resultUrl, resultBytes, cardEl }
  let items = [];
  let idCounter = 0;

  // Lazily-created MediaPipe ImageSegmenter, shared across every photo in
  // the batch so the (multi-MB) model is only downloaded/initialized once.
  let segmenterPromise = null;

  // Trial/license state, fetched from the lamaPhotoResizer backend. Null
  // until initLicense() resolves; the UI treats "unknown yet" as "allow
  // processing" so a flaky network doesn't block a first-time visitor —
  // the server still enforces the real limit via /license/consume.
  let license = null;
  let selectedPlan = "pro_monthly";
  let photosProcessedThisRun = 0;

  /* ---------------- Init ---------------- */
  loadTheme();
  loadPreset();
  loadRemoveBgKey();
  bindEvents();
  refreshBatchBar();
  initLicense();

  /* =====================================================
     Settings panel wiring
     ===================================================== */
  function bindEvents() {
    themeToggle.addEventListener("click", toggleTheme);

    bgSwatches.forEach((btn) => {
      btn.addEventListener("click", () => {
        bgSwatches.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        settings.bgMode = btn.dataset.bg;
        settings.bgColor = btn.dataset.color;
        // Warm the AI model up as soon as the user shows intent to use it,
        // so the first photo in the batch doesn't eat the whole load time.
        if (settings.bgMode !== "none") warmUpSegmenter();
      });
    });

    dimPreset.addEventListener("change", () => {
      if (dimPreset.value === "custom") return;
      const [w, h] = dimPreset.value.split("x").map(Number);
      widthInput.value = w;
      heightInput.value = h;
      settings.width = w;
      settings.height = h;
    });

    widthInput.addEventListener("input", () => {
      settings.width = clampInt(widthInput.value, 16, 6000, 800);
      dimPreset.value = "custom";
    });
    heightInput.addEventListener("input", () => {
      settings.height = clampInt(heightInput.value, 16, 6000, 600);
      dimPreset.value = "custom";
    });

    lockAspect.addEventListener("change", () => {
      settings.lockAspect = lockAspect.checked;
      heightInput.disabled = lockAspect.checked;
      heightInput.style.opacity = lockAspect.checked ? 0.5 : 1;
    });

    minKBInput.addEventListener("input", () => {
      settings.minKB = clampInt(minKBInput.value, 1, 10000, 10);
    });
    maxKBInput.addEventListener("input", () => {
      settings.maxKB = clampInt(maxKBInput.value, 1, 10000, 25);
      if (settings.maxKB < settings.minKB) {
        settings.minKB = settings.maxKB;
        minKBInput.value = settings.minKB;
      }
    });

    outputFormat.addEventListener("change", () => {
      settings.format = outputFormat.value;
    });

    savePresetBtn.addEventListener("click", savePreset);

    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
    });
    dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener("change", (e) => {
      handleFiles(e.target.files);
      fileInput.value = "";
    });

    clearAllBtn.addEventListener("click", clearAll);
    processAllBtn.addEventListener("click", processAll);
    downloadZipBtn.addEventListener("click", downloadAllAsZip);

    // ---- Background removal engine ----
    engineOnDevice.addEventListener("click", () => setEngine("on_device"));
    engineRemoveBg.addEventListener("click", () => setEngine("remove_bg"));
    removeBgKeyInput.addEventListener("input", () => {
      localStorage.setItem(REMOVEBG_KEY_STORAGE, removeBgKeyInput.value.trim());
    });

    // ---- Upgrade / payment claim modal ----
    upgradeBtn.addEventListener("click", openUpgradeModal);
    closeUpgradeModal.addEventListener("click", closeModal);
    upgradeModal.addEventListener("click", (e) => { if (e.target === upgradeModal) closeModal(); });
    planBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        planBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        selectedPlan = btn.dataset.plan;
      });
    });
    paymentClaimForm.addEventListener("submit", submitPaymentClaim);
  }

  function setEngine(engine) {
    settings.bgEngine = engine;
    engineOnDevice.setAttribute("aria-pressed", String(engine === "on_device"));
    engineRemoveBg.setAttribute("aria-pressed", String(engine === "remove_bg"));
    removeBgKeyRow.hidden = engine !== "remove_bg";
    if (engine === "on_device" && settings.bgMode !== "none") warmUpSegmenter();
  }

  function loadRemoveBgKey() {
    const saved = localStorage.getItem(REMOVEBG_KEY_STORAGE) || "";
    removeBgKeyInput.value = saved;
  }

  function clampInt(val, min, max, fallback) {
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  /* =====================================================
     Theme
     ===================================================== */
  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }

  /* =====================================================
     License / trial / payment claims
     ===================================================== */
  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  async function initLicense() {
    try {
      const savedKey = localStorage.getItem(LICENSE_KEY_KEY);
      const res = savedKey
        ? await apiPost("/api/license/verify", { license_key: savedKey })
        : await apiPost("/api/license/trial-start", { device_id: getDeviceId() });

      if (res && res.license_key) {
        license = res;
        localStorage.setItem(LICENSE_KEY_KEY, res.license_key);
      }
    } catch (err) {
      console.warn("lamaPhotoResizer: could not reach the license server, allowing local use for now.", err);
      license = null;
    }
    refreshLicenseUI();
  }

  function refreshLicenseUI() {
    if (!license) {
      licenseChip.className = "license-chip";
      licenseChipText.textContent = "Trial status unavailable (offline?)";
      upgradeBtn.hidden = false;
      return;
    }

    licenseChip.className = `license-chip ${license.status}`;
    if (license.status === "trial") {
      licenseChipText.textContent = `Trial — ${license.remaining_trial_photos} photo(s) left`;
      upgradeBtn.hidden = false;
    } else if (license.status === "active") {
      licenseChipText.textContent = license.plan === "lifetime" ? "Pro — lifetime" : `Pro — active`;
      upgradeBtn.hidden = true;
    } else {
      licenseChipText.textContent = "Trial expired";
      upgradeBtn.hidden = false;
    }
  }

  function openUpgradeModal() {
    licenseDetailText.textContent = license
      ? (license.status === "trial"
          ? `You've used ${license.photos_used} of ${license.trial_photo_limit} trial photos.`
          : "Your license has expired. Renew to keep using lamaPhotoResizer.")
      : "Activate a license to keep processing photos.";
    claimStatus.textContent = "";
    claimStatus.className = "claim-status";
    upgradeModal.hidden = false;
  }

  function closeModal() {
    upgradeModal.hidden = true;
  }

  async function submitPaymentClaim(e) {
    e.preventDefault();
    if (!license) {
      claimStatus.textContent = "Can't reach the license server right now — please try again shortly.";
      claimStatus.className = "claim-status error";
      return;
    }

    submitClaimBtn.disabled = true;
    claimStatus.textContent = "Submitting…";
    claimStatus.className = "claim-status";

    try {
      const payload = {
        license_key: license.license_key,
        method: claimMethod.value,
        tx_id: claimTxId.value.trim(),
        amount: Number(claimAmount.value),
        payer_name: claimName.value.trim() || undefined,
        payer_contact: claimContact.value.trim() || undefined,
        plan_requested: selectedPlan,
      };
      const res = await apiPost("/api/payment-claims", payload);
      claimStatus.textContent = res.message || "Submitted — an admin will review it shortly.";
      claimStatus.className = "claim-status ok";
      paymentClaimForm.reset();
    } catch (err) {
      claimStatus.textContent = err.message || "Could not submit — please check your details and try again.";
      claimStatus.className = "claim-status error";
    } finally {
      submitClaimBtn.disabled = false;
    }
  }

  /** Reports usage to the server after a batch so trial counting can't just be reset by clearing localStorage. */
  async function consumeUsage(photoCount, engine) {
    if (!license || photoCount <= 0) return;
    try {
      const res = await apiPost("/api/license/consume", {
        license_key: license.license_key,
        photo_count: photoCount,
        engine,
      });
      if (res && res.license) {
        license = res.license;
        refreshLicenseUI();
      }
    } catch (err) {
      console.warn("lamaPhotoResizer: could not report usage to the license server.", err);
    }
  }

  async function apiPost(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = (data && (data.message || (data.errors && Object.values(data.errors)[0]?.[0]))) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data;
  }

  /* =====================================================
     Presets (persistent settings)
     ===================================================== */
  function loadPreset() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(PRESET_KEY)); } catch (_) { /* ignore */ }
    if (saved) settings = { ...settings, ...saved };
    applySettingsToUI();
  }

  function savePreset() {
    localStorage.setItem(PRESET_KEY, JSON.stringify(settings));
    presetStatus.textContent = "Saved — new photos will use this configuration automatically.";
    setTimeout(() => { presetStatus.textContent = ""; }, 4000);
  }

  function applySettingsToUI() {
    bgSwatches.forEach((b) => {
      const active = b.dataset.bg === settings.bgMode;
      b.setAttribute("aria-pressed", String(active));
    });
    widthInput.value = settings.width;
    heightInput.value = settings.height;
    lockAspect.checked = settings.lockAspect;
    heightInput.disabled = settings.lockAspect;
    heightInput.style.opacity = settings.lockAspect ? 0.5 : 1;
    minKBInput.value = settings.minKB;
    maxKBInput.value = settings.maxKB;
    outputFormat.value = settings.format;

    const presetKeyGuess = `${settings.width}x${settings.height}`;
    dimPreset.value = [...dimPreset.options].some((o) => o.value === presetKeyGuess) ? presetKeyGuess : "custom";

    if (settings.bgMode !== "none") warmUpSegmenter();
  }

  /* =====================================================
     File intake
     ===================================================== */
  function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (!files.length) return;

    files.forEach((file) => {
      const id = `img_${++idCounter}`;
      const originalUrl = URL.createObjectURL(file);
      const item = {
        id, file, originalUrl,
        img: null,
        status: "pending", // pending | processing | done | error
        resultBlob: null, resultUrl: null, resultBytes: 0,
        cardEl: null,
      };
      items.push(item);
      renderCard(item);
    });

    emptyNote.hidden = items.length > 0;
    processAllBtn.disabled = items.length === 0;
    refreshBatchBar();
  }

  function renderCard(item) {
    const node = cardTemplate.content.firstElementChild.cloneNode(true);
    item.cardEl = node;

    const beforeImg = node.querySelector(".before-img");
    beforeImg.src = item.originalUrl;

    node.querySelector(".card-name").textContent = item.file.name;
    node.querySelector(".card-name").title = item.file.name;
    node.querySelector(".stat-dim").textContent = "…";
    node.querySelector(".stat-size").textContent = formatBytes(item.file.size) + " → …";

    node.querySelector(".btn-remove").addEventListener("click", () => removeItem(item.id));
    node.querySelector(".btn-download").addEventListener("click", () => downloadSingle(item.id));

    grid.appendChild(node);

    const im = new Image();
    im.onload = () => { item.img = im; };
    im.onerror = () => { console.error("lamaPhotoResizer: could not load", item.file.name); };
    im.src = item.originalUrl;
  }

  function removeItem(id) {
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return;
    const [item] = items.splice(idx, 1);
    if (item.cardEl) item.cardEl.remove();
    URL.revokeObjectURL(item.originalUrl);
    if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    emptyNote.hidden = items.length > 0;
    processAllBtn.disabled = items.length === 0;
    refreshBatchBar();
  }

  function clearAll() {
    items.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    items = [];
    grid.innerHTML = "";
    emptyNote.hidden = false;
    processAllBtn.disabled = true;
    downloadZipBtn.disabled = true;
    refreshBatchBar();
  }

  function refreshBatchBar() {
    if (items.length === 0) { batchBar.hidden = true; return; }
    batchBar.hidden = false;
    batchCountEl.textContent = `${items.length} photo${items.length === 1 ? "" : "s"}`;
    const done = items.filter((i) => i.status === "done").length;
    const errored = items.filter((i) => i.status === "error").length;
    batchStatusEl.textContent = errored
      ? `${done} of ${items.length} processed, ${errored} failed`
      : done === items.length
        ? "all processed"
        : `${done} of ${items.length} processed`;
  }

  /* =====================================================
     Processing pipeline
     ===================================================== */
  async function processAll() {
    if (license && !license.is_usable) {
      openUpgradeModal();
      return;
    }

    processAllBtn.disabled = true;
    batchStatusEl.textContent = "processing…";
    photosProcessedThisRun = 0;

    for (const item of items) {
      if (item.status === "done") continue;
      try {
        await processOne(item);
        photosProcessedThisRun++;
      } catch (err) {
        console.error("lamaPhotoResizer processing error:", err);
        markCardFailed(item, err);
      }
    }

    processAllBtn.disabled = false;
    downloadZipBtn.disabled = !items.some((i) => i.status === "done");
    refreshBatchBar();

    if (photosProcessedThisRun > 0) {
      consumeUsage(photosProcessedThisRun, settings.bgMode !== "none" ? settings.bgEngine : "on_device");
    }
  }

  // Ensures a failed photo never leaves the UI stuck on the spinner: the
  // spinner is always hidden, and the card is clearly marked as failed
  // with a reason, whatever went wrong.
  function markCardFailed(item, err) {
    item.status = "error";
    const card = item.cardEl;
    if (!card) return;
    const spinner = card.querySelector(".spinner");
    const afterImg = card.querySelector(".after-img");
    spinner.hidden = true;
    afterImg.hidden = true;
    const stat = card.querySelector(".stat-size");
    stat.textContent = (err && err.message) ? `Failed: ${err.message}` : "Could not process this file";
    stat.classList.remove("ok");
    stat.classList.add("warn");
  }

  async function processOne(item) {
    item.status = "processing";
    const card = item.cardEl;
    const afterImg = card.querySelector(".after-img");
    const spinner = card.querySelector(".spinner");
    const stamp = card.querySelector(".stamp-badge");

    const img = item.img || (await waitForImage(item));
    if (!img || !img.naturalWidth) {
      throw new Error("image failed to decode");
    }

    // 1. Work out target dimensions for THIS photo.
    const targetW = settings.width;
    const targetH = settings.lockAspect
      ? Math.round(settings.width * (img.naturalHeight / img.naturalWidth))
      : settings.height;

    // 2. Crop-to-fill ("cover" fit) onto a targetW x targetH canvas — this
    //    is what makes a "413x531 passport" selection actually produce a
    //    413x531 photo with no empty padding, instead of a smaller photo
    //    padded inside that box.
    let finalCanvas = coverFitCanvas(img, targetW, targetH);

    // 3. Background replacement: only meaningful once we know what's
    //    "background" vs "subject", which needs real segmentation — a
    //    flat color fill behind an opaque, frame-filling photo would
    //    never be visible otherwise.
    if (settings.bgMode !== "none") {
      try {
        finalCanvas = settings.bgEngine === "remove_bg"
          ? await applyBackgroundReplaceCloud(finalCanvas, settings.bgColor)
          : await applyBackgroundReplace(finalCanvas, settings.bgColor);
      } catch (err) {
        console.warn("lamaPhotoResizer: background removal unavailable, keeping original background.", err);
        card.querySelector(".pane-tag-accent").textContent =
          settings.bgEngine === "remove_bg" ? "Processed (remove.bg failed)" : "Processed (BG AI unavailable)";
      }
    }

    // 4. Compress iteratively until we land inside [minKB, maxKB].
    const minBytes = settings.minKB * 1024;
    const maxBytes = settings.maxKB * 1024;
    const { blob, withinRange } = await compressToTarget(finalCanvas, settings.format, minBytes, maxBytes);

    // 5. Update state + UI.
    if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    item.resultBlob = blob;
    item.resultBytes = blob.size;
    item.resultUrl = URL.createObjectURL(blob);
    item.status = "done";

    spinner.hidden = true;
    afterImg.src = item.resultUrl;
    afterImg.hidden = false;
    stamp.hidden = false;

    card.querySelector(".stat-dim").textContent = `${targetW}×${targetH}px`;
    const sizeStat = card.querySelector(".stat-size");
    sizeStat.textContent = `${formatBytes(item.file.size)} → ${formatBytes(item.resultBytes)}`;
    sizeStat.classList.toggle("ok", withinRange);
    sizeStat.classList.toggle("warn", !withinRange);

    const dlBtn = card.querySelector(".btn-download");
    dlBtn.disabled = false;

    refreshBatchBar();
  }

  function waitForImage(item) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      const timeout = setTimeout(() => reject(new Error("image load timed out")), 15000);
      im.onload = () => { clearTimeout(timeout); item.img = im; resolve(im); };
      im.onerror = () => { clearTimeout(timeout); reject(new Error("image failed to load")); };
      im.src = item.originalUrl;
    });
  }

  /* =====================================================
     Cover-fit crop (resize to EXACTLY targetW x targetH, cropping overflow)
     ===================================================== */
  function coverFitCanvas(img, targetW, targetH) {
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");

    // "cover" scale: fill the whole box, crop whatever spills over the edges.
    const scale = Math.max(targetW / img.naturalWidth, targetH / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const dx = (targetW - drawW) / 2; // <= 0
    const dy = (targetH - drawH) / 2; // <= 0
    ctx.drawImage(img, dx, dy, drawW, drawH);
    return canvas;
  }

  /* =====================================================
     Background replacement via on-device AI segmentation
     ===================================================== */
  function warmUpSegmenter() {
    getSegmenter().catch((err) => {
      console.warn("lamaPhotoResizer: could not preload background-removal model.", err);
    });
  }

  async function getSegmenter() {
    if (segmenterPromise) return segmenterPromise;

    segmenterPromise = (async () => {
      if (bgAiStatus) bgAiStatus.textContent = "Loading background-removal AI (one-time, needs internet)…";
      const vision = await import(/* webpackIgnore: true */ VISION_BUNDLE_URL);
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_ROOT);
      const segmenter = await vision.ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: SELFIE_MODEL_URL, delegate: "GPU" },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
      if (bgAiStatus) bgAiStatus.textContent = "";
      return segmenter;
    })().catch((err) => {
      segmenterPromise = null; // allow retrying on the next attempt
      if (bgAiStatus) bgAiStatus.textContent = "Background AI failed to load — check your internet connection.";
      throw err;
    });

    return segmenterPromise;
  }

  // Cuts the subject out of `sourceCanvas` using the segmenter's mask, then
  // composites it over a solid `bgColorCss` fill. Returns a NEW canvas.
  async function applyBackgroundReplace(sourceCanvas, bgColorCss) {
    const segmenter = await getSegmenter();
    const w = sourceCanvas.width, h = sourceCanvas.height;

    const result = await Promise.resolve(segmenter.segment(sourceCanvas));
    const mask = result.categoryMask;
    if (!mask) throw new Error("segmentation returned no mask");

    const maskW = mask.width, maskH = mask.height;
    const maskData = mask.getAsUint8Array(); // 0 = background, 1 = subject
    if (mask.close) mask.close();

    // Build a soft (feathered) alpha matte at the source canvas' resolution.
    const matteCanvas = document.createElement("canvas");
    matteCanvas.width = w;
    matteCanvas.height = h;
    const matteCtx = matteCanvas.getContext("2d");
    const matteData = matteCtx.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      const my = Math.min(maskH - 1, Math.floor((y * maskH) / h));
      for (let x = 0; x < w; x++) {
        const mx = Math.min(maskW - 1, Math.floor((x * maskW) / w));
        const isSubject = maskData[my * maskW + mx] === 1;
        const idx = (y * w + x) * 4;
        matteData.data[idx + 3] = isSubject ? 255 : 0; // only alpha matters here
      }
    }
    matteCtx.putImageData(matteData, 0, 0);

    // Feather the matte edges slightly so the cutout doesn't look jagged.
    const featheredCanvas = document.createElement("canvas");
    featheredCanvas.width = w;
    featheredCanvas.height = h;
    const featheredCtx = featheredCanvas.getContext("2d");
    featheredCtx.filter = "blur(2px)";
    featheredCtx.drawImage(matteCanvas, 0, 0);
    featheredCtx.filter = "none";

    // Cut the subject out of the original photo using the feathered matte.
    const cutCanvas = document.createElement("canvas");
    cutCanvas.width = w;
    cutCanvas.height = h;
    const cutCtx = cutCanvas.getContext("2d");
    cutCtx.drawImage(sourceCanvas, 0, 0);
    cutCtx.globalCompositeOperation = "destination-in";
    cutCtx.drawImage(featheredCanvas, 0, 0);

    // Composite: solid background color, then the cutout subject on top.
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = w;
    finalCanvas.height = h;
    const finalCtx = finalCanvas.getContext("2d");
    finalCtx.fillStyle = bgColorCss;
    finalCtx.fillRect(0, 0, w, h);
    finalCtx.drawImage(cutCanvas, 0, 0);

    return finalCanvas;
  }

  // Sends the cropped photo to remove.bg, which returns the subject already
  // composited over the requested solid background color — no local
  // segmentation needed. The API key never touches lamaStudio.pk's own
  // server; the browser calls api.remove.bg directly.
  async function applyBackgroundReplaceCloud(sourceCanvas, bgColorCss) {
    const apiKey = (localStorage.getItem(REMOVEBG_KEY_STORAGE) || "").trim();
    if (!apiKey) {
      throw new Error("no remove.bg API key set — add one in the Background fill panel");
    }

    const sourceBlob = await new Promise((resolve) => sourceCanvas.toBlob(resolve, "image/png"));
    const form = new FormData();
    form.append("image_file", sourceBlob, "photo.png");
    form.append("size", "auto");
    // remove.bg accepts a hex color (no '#') for a solid-fill result directly.
    if (bgColorCss && bgColorCss.startsWith("#")) {
      form.append("bg_color", bgColorCss.slice(1));
    }

    const res = await fetch(REMOVEBG_ENDPOINT, {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
    });

    if (!res.ok) {
      let detail = `remove.bg request failed (${res.status})`;
      try {
        const errJson = await res.json();
        detail = errJson?.errors?.[0]?.title || detail;
      } catch (_) { /* ignore parse failure, keep default detail */ }
      throw new Error(detail);
    }

    const resultBlob = await res.blob();
    const resultUrl = URL.createObjectURL(resultBlob);
    try {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error("could not decode remove.bg response"));
        im.src = resultUrl;
      });
      // Normalize back to the exact target canvas size — remove.bg's output
      // dimensions can differ slightly depending on plan/size parameter.
      return coverFitCanvas(img, sourceCanvas.width, sourceCanvas.height);
    } finally {
      URL.revokeObjectURL(resultUrl);
    }
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  }

  async function compressToTarget(canvas, mime, minBytes, maxBytes) {
    if (mime === "image/png") {
      const blob = await canvasToBlob(canvas, mime, 1);
      return { blob, withinRange: blob.size >= minBytes && blob.size <= maxBytes };
    }

    let lo = 0.02, hi = 0.97;
    let best = await canvasToBlob(canvas, mime, hi);
    let bestDiff = distanceToRange(best.size, minBytes, maxBytes);

    for (let i = 0; i < 9; i++) {
      if (bestDiff === 0) break;
      const mid = (lo + hi) / 2;
      const blob = await canvasToBlob(canvas, mime, mid);
      const diff = distanceToRange(blob.size, minBytes, maxBytes);

      if (diff < bestDiff) { best = blob; bestDiff = diff; }

      if (blob.size > maxBytes) {
        hi = mid;
      } else if (blob.size < minBytes) {
        lo = mid;
      } else {
        break;
      }
    }

    return { blob: best, withinRange: best.size >= minBytes && best.size <= maxBytes };
  }

  function distanceToRange(size, min, max) {
    if (size < min) return min - size;
    if (size > max) return size - max;
    return 0;
  }

  /* =====================================================
     Downloads
     ===================================================== */
  function extensionFor(mime) {
    return { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[mime] || "jpg";
  }

  function outputName(item) {
    const base = item.file.name.replace(/\.[^.]+$/, "");
    return `${base}-lamaResized.${extensionFor(settings.format)}`;
  }

  function downloadSingle(id) {
    const item = items.find((i) => i.id === id);
    if (!item || !item.resultBlob) return;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = outputName(item);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function downloadAllAsZip() {
    const ready = items.filter((i) => i.status === "done" && i.resultBlob);
    if (!ready.length) return;

    downloadZipBtn.disabled = true;
    const originalLabel = downloadZipBtn.textContent;
    downloadZipBtn.textContent = "Zipping…";

    try {
      const zip = new JSZip();
      const usedNames = new Set();
      ready.forEach((item) => {
        let name = outputName(item);
        let i = 2;
        while (usedNames.has(name)) {
          name = outputName(item).replace(/(\.[^.]+)$/, `-${i++}$1`);
        }
        usedNames.add(name);
        zip.file(name, item.resultBlob);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lamaPhotoResizer-batch.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } finally {
      downloadZipBtn.textContent = originalLabel;
      downloadZipBtn.disabled = false;
    }
  }

  /* =====================================================
     Utils
     ===================================================== */
  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }
})();
