/**
 * lamaPixelStudio - Image Cropper Engine
 * Handles interactive image loading, aspect ratio selection, and cropping canvas rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const cropContainer = document.getElementById('cropContainer');
  const emptyNote = document.getElementById('emptyNote');
  const aspectRatioSelect = document.getElementById('aspectRatio');
  const cropBtn = document.getElementById('cropBtn');

  let state = {
    image: null,
    fileName: '',
    originalUrl: '',
    canvas: null,
    ctx: null,
    cropBox: { x: 0, y: 0, w: 200, h: 200 },
    isDragging: false,
    dragType: null, // 'move', 'nw', 'ne', 'sw', 'se'
    startX: 0,
    startY: 0
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
    state.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      state.originalUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        state.image = img;
        initCropperUI();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function initCropperUI() {
    emptyNote.style.display = 'none';
    dropzone.hidden = true;
    cropContainer.hidden = false;
    cropBtn.disabled = false;

    cropContainer.innerHTML = '';
    
    // Create interactive cropping workspace wrapper
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative; display:inline-block; max-width:100%; overflow:hidden; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.15);';

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block; max-width:100%; height:auto; cursor:crosshair;';
    wrapper.appendChild(canvas);

    // Crop box overlay element
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute; border:2px dashed #fff; box-shadow:0 0 0 9999px rgba(0,0,0,0.5); cursor:move; box-sizing:border-box;';
    wrapper.appendChild(overlay);

    cropContainer.appendChild(wrapper);

    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');

    // Set initial canvas sizing matching image dimensions scaled to fit screen
    const maxDisplayW = Math.min(state.image.width, 700);
    const scale = maxDisplayW / state.image.width;
    canvas.width = state.image.width * scale;
    canvas.height = state.image.height * scale;

    // Initialize crop box to center 60%
    state.cropBox = {
      x: canvas.width * 0.2,
      y: canvas.height * 0.2,
      w: canvas.width * 0.6,
      h: canvas.height * 0.6
    };

    drawCanvas();
    updateOverlayPos(overlay);

    // Setup interactive drag handlers
    let isMouseDown = false;
    let startX, startY, startBox;

    overlay.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
      startBox = { ...state.cropBox };
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      state.cropBox.x = Math.max(0, Math.min(canvas.width - state.cropBox.w, startBox.x + dx));
      state.cropBox.y = Math.max(0, Math.min(canvas.height - state.cropBox.h, startBox.y + dy));
      updateOverlayPos(overlay);
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    // Handle Aspect Ratio changes
    if (aspectRatioSelect) {
      aspectRatioSelect.onchange = () => {
        const val = aspectRatioSelect.value;
        if (val === 'free') return;
        const ratio = parseFloat(val);
        if (state.cropBox.w / state.cropBox.h !== ratio) {
          state.cropBox.h = state.cropBox.w / ratio;
          if (state.cropBox.y + state.cropBox.h > canvas.height) {
            state.cropBox.h = canvas.height - state.cropBox.y;
            state.cropBox.w = state.cropBox.h * ratio;
          }
          updateOverlayPos(overlay);
        }
      };
    }
  }

  function drawCanvas() {
    if (!state.ctx || !state.image) return;
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.ctx.drawImage(state.image, 0, 0, state.canvas.width, state.canvas.height);
  }

  function updateOverlayPos(overlay) {
    overlay.style.left = `${state.cropBox.x}px`;
    overlay.style.top = `${state.cropBox.y}px`;
    overlay.style.width = `${state.cropBox.w}px`;
    overlay.style.height = `${state.cropBox.h}px`;
  }

  // Crop & Download action
  if (cropBtn) {
    cropBtn.addEventListener('click', () => {
      if (!state.image) return;

      const scale = state.image.width / state.canvas.width;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = state.cropBox.w * scale;
      exportCanvas.height = state.cropBox.h * scale;

      const ctx = exportCanvas.getContext('2d');
      ctx.drawImage(
        state.image,
        state.cropBox.x * scale,
        state.cropBox.y * scale,
        state.cropBox.w * scale,
        state.cropBox.h * scale,
        0,
        0,
        exportCanvas.width,
        exportCanvas.height
      );

      exportCanvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `cropped-${state.fileName}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 'image/png');
    });
  }
});
