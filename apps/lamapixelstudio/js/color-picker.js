/**
 * lamaPixelStudio - Color Picker Engine
 * Loads an image onto a canvas and allows users to click anywhere to inspect and copy color codes.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const canvasContainer = document.getElementById('canvasContainer');
  const emptyNote = document.getElementById('emptyNote');
  const colorPreviewBox = document.getElementById('colorPreviewBox');
  const hexInput = document.getElementById('hexInput');
  const rgbInput = document.getElementById('rgbInput');
  const copyColorBtn = document.getElementById('copyColorBtn');

  let state = {
    image: null,
    canvas: null,
    ctx: null,
    currentHex: '#000000',
    currentRgb: 'rgb(0, 0, 0)'
  };

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
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

    // Scale canvas nicely to fit container
    const maxDisplayW = Math.min(state.image.width, 700);
    const scale = maxDisplayW / state.image.width;
    canvas.width = state.image.width * scale;
    canvas.height = state.image.height * scale;

    state.ctx.drawImage(state.image, 0, 0, canvas.width, canvas.height);

    // Pick color on click
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

      state.currentHex = hex;
      state.currentRgb = rgb;

      // Update sidebar preview
      colorPreviewBox.style.background = hex;
      hexInput.value = hex;
      rgbInput.value = rgb;
      copyColorBtn.disabled = false;
    });
  }

  if (copyColorBtn) {
    copyColorBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(state.currentHex).then(() => {
        const originalText = copyColorBtn.textContent;
        copyColorBtn.textContent = 'Copied to Clipboard!';
        setTimeout(() => {
          copyColorBtn.textContent = originalText;
        }, 2000);
      });
    });
  }
});
