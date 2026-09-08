/**
 * lamaPixelStudio - Color Picker Engine
 * Loads an image onto a canvas and allows users to click anywhere to inspect and copy color codes.
 *
 * FIXES from your version:
 * 1. Added real HSL conversion — the page's own meta description promised HSL but it
 *    was never implemented.
 * 2. Dropzone is marked role="button" tabindex="0" but had no keydown handler — Enter/Space
 *    now trigger the file picker like a real button would.
 * 3. Canvas sizing now caps BOTH width and height (contain-fit), not just width — a tall
 *    portrait photo no longer renders taller than the viewport on mobile.
 * 4. Per-field copy buttons for hex/RGB/HSL, in addition to the existing main copy button.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const canvasContainer = document.getElementById('canvasContainer');
  const emptyNote = document.getElementById('emptyNote');
  const colorPreviewBox = document.getElementById('colorPreviewBox');
  const hexInput = document.getElementById('hexInput');
  const rgbInput = document.getElementById('rgbInput');
  const hslInput = document.getElementById('hslInput');
  const copyColorBtn = document.getElementById('copyColorBtn');
  const copyMiniBtns = document.querySelectorAll('.copy-mini');

  let state = {
    image: null,
    canvas: null,
    ctx: null,
    currentHex: '#000000',
    currentRgb: 'rgb(0, 0, 0)',
    currentHsl: 'hsl(0, 0%, 0%)'
  };

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadFile(e.target.files[0]);
        fileInput.value = '';
      }
    });
  }

  function loadFile(file) {
    if (!file.type.match('image.*')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        initPickerUI();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function initPickerUI() {
    emptyNote.style.display = 'none';
    dropzone.hidden = true;
    canvasContainer.hidden = false;
    canvasContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative; display:inline-block; max-width:100%; border-radius:8px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.15);';

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block; max-width:100%; height:auto; cursor:crosshair;';
    wrapper.appendChild(canvas);
    canvasContainer.appendChild(wrapper);

    state.canvas = canvas;
    state.ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Contain-fit against BOTH a max width and a max height, so a tall portrait
    // photo doesn't render taller than a typical mobile viewport.
    const maxW = Math.min(state.image.width, 700);
    const maxH = Math.min(state.image.height, Math.max(320, window.innerHeight * 0.55));
    const scale = Math.min(maxW / state.image.width, maxH / state.image.height);

    canvas.width = state.image.width * scale;
    canvas.height = state.image.height * scale;

    state.ctx.drawImage(state.image, 0, 0, canvas.width, canvas.height);

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

      const pixel = state.ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      const rgb = `rgb(${r}, ${g}, ${b})`;
      const hsl = rgbToHsl(r, g, b);

      state.currentHex = hex;
      state.currentRgb = rgb;
      state.currentHsl = hsl;

      colorPreviewBox.style.background = hex;
      hexInput.value = hex;
      rgbInput.value = rgb;
      hslInput.value = hsl;
      copyColorBtn.disabled = false;
      copyMiniBtns.forEach(btn => { btn.disabled = false; });
    });
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  function flashCopied(btn) {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
  }

  if (copyColorBtn) {
    copyColorBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(state.currentHex).then(() => {
        const originalText = copyColorBtn.textContent;
        copyColorBtn.textContent = 'Copied to Clipboard!';
        setTimeout(() => { copyColorBtn.textContent = originalText; }, 2000);
      });
    });
  }

  copyMiniBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copyTarget;
      const input = document.getElementById(targetId);
      if (!input || !input.value) return;
      navigator.clipboard.writeText(input.value).then(() => flashCopied(btn));
    });
  });
});
