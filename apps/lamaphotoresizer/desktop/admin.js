/* =========================================================
   lamaPhotoResizer — admin.js
   Talks to the Laravel backend's /api/admin/* endpoints.
   Auth token is kept in sessionStorage (cleared when the tab closes)
   rather than localStorage, since this is an admin credential.
   ========================================================= */

(() => {
  "use strict";

  const API_BASE_URL = "https://api.lamastudio.pk"; // must match app.js — keep both in sync
  const TOKEN_KEY = "lamaPhotoResizer.admin.token";

  const $ = (sel) => document.querySelector(sel);

  const loginView = $("#loginView");
  const dashboardView = $("#dashboardView");
  const loginForm = $("#loginForm");
  const loginEmail = $("#loginEmail");
  const loginPassword = $("#loginPassword");
  const loginBtn = $("#loginBtn");
  const loginStatus = $("#loginStatus");
  const adminName = $("#adminName");
  const logoutBtn = $("#logoutBtn");

  const statGrid = $("#statGrid");
  const claimTabs = $("#claimTabs");
  const claimsTableBody = $("#claimsTableBody");
  const claimsEmptyNote = $("#claimsEmptyNote");
  const licensesTableBody = $("#licensesTableBody");
  const licenseSearch = $("#licenseSearch");

  let currentClaimStatus = "pending";
  let searchDebounce = null;

  init();

  function init() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      showDashboard();
    } else {
      showLogin();
    }

    loginForm.addEventListener("submit", handleLogin);
    logoutBtn.addEventListener("click", handleLogout);

    claimTabs.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        claimTabs.querySelectorAll(".tab-btn").forEach((b) => b.setAttribute("aria-selected", "false"));
        btn.setAttribute("aria-selected", "true");
        currentClaimStatus = btn.dataset.status;
        loadClaims();
      });
    });

    licenseSearch.addEventListener("input", () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(loadLicenses, 300);
    });
  }

  async function handleLogin(e) {
    e.preventDefault();
    loginBtn.disabled = true;
    loginStatus.textContent = "Signing in…";
    loginStatus.className = "claim-status";

    try {
      const res = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail.value.trim(), password: loginPassword.value }),
      }, false);

      sessionStorage.setItem(TOKEN_KEY, res.token);
      adminName.textContent = res.admin?.name || res.admin?.email || "Admin";
      showDashboard();
    } catch (err) {
      loginStatus.textContent = err.message || "Sign-in failed.";
      loginStatus.className = "claim-status error";
    } finally {
      loginBtn.disabled = false;
    }
  }

  function handleLogout() {
    apiFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    sessionStorage.removeItem(TOKEN_KEY);
    showLogin();
  }

  function showLogin() {
    loginView.hidden = false;
    dashboardView.hidden = true;
  }

  function showDashboard() {
    loginView.hidden = true;
    dashboardView.hidden = false;
    loadStats();
    loadClaims();
    loadLicenses();
  }

  async function loadStats() {
    try {
      const stats = await apiFetch("/api/admin/stats");
      const cards = [
        ["Total licenses", stats.total_licenses],
        ["Active trials", stats.active_trials],
        ["Paid & active", stats.active_paid],
        ["Pending claims", stats.pending_claims],
        ["Approved this month", stats.approved_claims_this_month],
        ["Revenue this month", `Rs. ${Number(stats.revenue_this_month).toLocaleString()}`],
      ];
      statGrid.innerHTML = cards.map(([label, value]) => `
        <div class="stat-card">
          <div class="stat-value">${escapeHtml(String(value))}</div>
          <div class="stat-label">${escapeHtml(label)}</div>
        </div>
      `).join("");
    } catch (err) {
      if (err.status === 401) return handleUnauthorized();
      statGrid.innerHTML = `<p class="claim-status error">Could not load stats: ${escapeHtml(err.message)}</p>`;
    }
  }

  async function loadClaims() {
    claimsTableBody.innerHTML = `<tr><td colspan="8">Loading…</td></tr>`;
    try {
      const res = await apiFetch(`/api/admin/payment-claims?status=${encodeURIComponent(currentClaimStatus)}`);
      const claims = res.data || [];
      claimsEmptyNote.hidden = claims.length > 0;
      claimsTableBody.innerHTML = claims.map(renderClaimRow).join("");
      claimsTableBody.querySelectorAll("[data-approve]").forEach((btn) =>
        btn.addEventListener("click", () => approveClaim(btn.dataset.approve)));
      claimsTableBody.querySelectorAll("[data-reject]").forEach((btn) =>
        btn.addEventListener("click", () => rejectClaim(btn.dataset.reject)));
    } catch (err) {
      if (err.status === 401) return handleUnauthorized();
      claimsTableBody.innerHTML = `<tr><td colspan="8">Could not load claims: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  function renderClaimRow(claim) {
    const badge = `<span class="badge badge-${claim.status}">${escapeHtml(claim.status)}</span>`;
    const actions = claim.status === "pending"
      ? `<div class="row-actions">
           <button class="btn btn-small btn-primary" data-approve="${claim.id}">Approve</button>
           <button class="btn btn-small btn-ghost" data-reject="${claim.id}">Reject</button>
         </div>`
      : badge;

    return `
      <tr>
        <td>${escapeHtml(formatDate(claim.created_at))}</td>
        <td><code>${escapeHtml(claim.license?.license_key || "—")}</code></td>
        <td>${escapeHtml(claim.method)}</td>
        <td><code>${escapeHtml(claim.tx_id)}</code></td>
        <td>Rs. ${escapeHtml(String(claim.amount))}</td>
        <td>${escapeHtml(claim.plan_requested)}</td>
        <td>${escapeHtml(claim.payer_name || "")} ${escapeHtml(claim.payer_contact || "")}</td>
        <td>${actions}</td>
      </tr>`;
  }

  async function approveClaim(id) {
    if (!confirm("Approve this claim and activate the license?")) return;
    try {
      await apiFetch(`/api/admin/payment-claims/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
      loadClaims();
      loadStats();
      loadLicenses();
    } catch (err) {
      alert(`Could not approve: ${err.message}`);
    }
  }

  async function rejectClaim(id) {
    const note = prompt("Reason for rejecting this claim (shown internally, required):");
    if (!note) return;
    try {
      await apiFetch(`/api/admin/payment-claims/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ admin_note: note }),
      });
      loadClaims();
      loadStats();
    } catch (err) {
      alert(`Could not reject: ${err.message}`);
    }
  }

  async function loadLicenses() {
    licensesTableBody.innerHTML = `<tr><td colspan="5">Loading…</td></tr>`;
    try {
      const params = new URLSearchParams();
      if (licenseSearch.value.trim()) params.set("search", licenseSearch.value.trim());
      const res = await apiFetch(`/api/admin/licenses?${params.toString()}`);
      const licenses = res.data || [];
      licensesTableBody.innerHTML = licenses.length
        ? licenses.map(renderLicenseRow).join("")
        : `<tr><td colspan="5">No licenses found.</td></tr>`;
    } catch (err) {
      if (err.status === 401) return handleUnauthorized();
      licensesTableBody.innerHTML = `<tr><td colspan="5">Could not load licenses: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  function renderLicenseRow(lic) {
    return `
      <tr>
        <td><code>${escapeHtml(lic.license_key)}</code></td>
        <td><span class="badge badge-${lic.status}">${escapeHtml(lic.status)}</span></td>
        <td>${escapeHtml(lic.plan)}</td>
        <td>${lic.status === "trial" ? `${lic.photos_used}/${lic.trial_photo_limit}` : "—"}</td>
        <td>${escapeHtml(formatDate(lic.created_at))}</td>
      </tr>`;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function handleUnauthorized() {
    sessionStorage.removeItem(TOKEN_KEY);
    showLogin();
    loginStatus.textContent = "Your session expired — please sign in again.";
    loginStatus.className = "claim-status error";
  }

  async function apiFetch(path, options = {}, useAuth = true) {
    const headers = { "Content-Type": "application/json" };
    if (useAuth) {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = (data && (data.message || (data.errors && Object.values(data.errors)[0]?.[0]))) || `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    return data;
  }
})();
