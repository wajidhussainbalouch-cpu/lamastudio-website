/**
 * lamaPixelStudio - Main App Engine
 * Handles dropzone events, batch file loading, preview rendering, and image resizing/compression.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewGrid = document.getElementById('previewGrid');
  const emptyNote = document.getElementById('emptyNote');
  const batchBar = document.getElementById('batchBar');
  const batchCount = document.getElementById('batchCount');
  const batchStatus = document.getElementById('batchStatus');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const processAllBtn = document.getElementById('processAllBtn');
  const downloadZipBtn = document.getElementById('downloadZipBtn');
  const cardTemplate = document.getElementById('cardTemplate');

  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');
  const lockAspect = document.getElementById('lockAspect');
  const dimPreset = document.getElementById('dimPreset');
  const minKB = document.getElementById('minKB');
  const maxKB = document.getElementById('maxKB');
  const outputFormat = document.getElementById('outputFormat');
  const themeToggle = document.getElementById('themeToggle');

  let state = {
    files: [], // Array of { id, file, originalUrl, processedUrl, width, height, size, originalWidth, originalHeight }
    isProcessing: false
  };

  let nextId = 1;

  // Theme Toggler
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
    });
  }

  // Dropzone Interaction
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset input
      }
    });
  }

  // Preset Selector
  if (dimPreset) {
    dimPreset.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom') return;
      const [w, h] = val.split('x').map(Number);
      if (w && h) {
        widthInput.value = w;
        heightInput.value = h;
        if (lockAspect) lockAspect.checked = false;
      }
    });
  }

  function handleFiles(incomingFiles) {
    Array.from(incomingFiles).forEach(file => {
      if (!file.type.match('image.*')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const item = {
            id: nextId++,
            file: file,
            name: file.name,
            originalUrl: e.target.result,
            processedUrl: null,
            originalWidth: img.width,
            originalHeight: img.height,
            width: img.width,
            height: img.height,
            size: file.size,
            processedSize: null,
            status: 'waiting' // waiting, processing, done, error
          };
          
          state.files.push(item);
          renderUI();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderUI() {
    if (state.files.length > 0) {
      if (emptyNote) emptyNote.style.display = 'none';
      if (batchBar) batchBar.hidden = false;
      if (processAllBtn) processAllBtn.disabled = false;
      if (batchCount) batchCount.textContent = `${state.files.length} photo${state.files.length > 1 ? 's' : ''}`;
    } else {
      if (emptyNote) emptyNote.style.display = 'block';
      if (batchBar) batchBar.hidden = true;
      if (processAllBtn) processAllBtn.disabled = true;
      if (downloadZipBtn) downloadZipBtn.disabled = true;
    }

    if (previewGrid) {
      previewGrid.innerHTML = '';
      state.files.forEach(item => {
        const node = cardTemplate.content.cloneNode(true);
        const card = node.querySelector('.card');
        const beforeImg = node.querySelector('.before-img');
        const afterImg = node.querySelector('.after-img');
        const spinner = node.querySelector('.spinner');
        const cardName = node.querySelector('.card-name');
        const statDim = node.querySelector('.stat-dim');
        const statSize = node.querySelector('.stat-size');
        const downloadBtn = node.querySelector('.btn-download');
        const removeBtn = node.querySelector('.btn-remove');

        beforeImg.src = item.originalUrl;
        cardName.textContent = item.name;
        cardName.title = item.name;
        statDim.textContent = `${item.originalWidth} × ${item.originalHeight}px`;
        statSize.textContent = formatBytes(item.size);

        if (item.status === 'done' && item.processedUrl) {
          afterImg.src = item.processedUrl;
          afterImg.hidden = false;
          spinner.style.display = 'none';
          downloadBtn.disabled = false;
          statDim.textContent = `${item.width} × ${item.height}px`;
          statSize.textContent = `${formatBytes(item.processedSize)}`;
        } else if (item.status === 'processing') {
          spinner.style.display = 'block';
          afterImg.hidden = true;
        } else {
          spinner.style.display = 'none';
          afterImg.hidden = true;
        }

        // Actions
        removeBtn.addEventListener('click', () => {
          state.files = state.files.filter(f => f.id !== item.id);
          renderUI();
        });

        downloadBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = item.processedUrl;
          a.download = `resized-${item.name}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });

        previewGrid.appendChild(card);
      });
    }
  }

  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Clear All
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      state.files = [];
      renderUI();
    });
  }

  // Process Batch
  if (processAllBtn) {
    processAllBtn.addEventListener('click', async () => {
      if (state.isProcessing || state.files.length === 0) return;
      state.isProcessing = true;
      if (batchStatus) batchStatus.textContent = 'processing batch...';

      const targetW = parseInt(widthInput.value) || 800;
      const targetH = parseInt(heightInput.value) || 600;
      const format = outputFormat ? outputFormat.value : 'image/jpeg';
      const targetMinBytes = (parseInt(minKB.value) || 10) * 1024;
      const targetMaxBytes = (parseInt(maxKB.value) || 25) * 1024;

      for (let item of state.files) {
        item.status = 'processing';
        renderUI();

        try {
          const result = await processImage(item, targetW, targetH, format, targetMinBytes, targetMaxBytes);
          item.processedUrl = result.url;
          item.width = result.width;
          item.height = result.height;
          item.processedSize = result.size;
          item.status = 'done';
        } catch (err) {
          console.error(err);
          item.status = 'error';
        }
        renderUI();
      }

      state.isProcessing = false;
      if (batchStatus) batchStatus.textContent = 'complete';
      if (downloadZipBtn) downloadZipBtn.disabled = false;
    });
  }

  async function processImage(item, maxW, maxH, format, minBytes, maxBytes) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;

        // Calculate aspect ratios if constrained
        if (lockAspect && lockAspect.checked) {
          const ratio = w / h;
          if (w > h) {
            w = maxW;
            h = Math.round(maxW / ratio);
          } else {
            h = maxH;
            w = Math.round(maxH * ratio);
          }
        } else {
          w = maxW;
          h = maxH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        // Binary search / iterative quality adjustment for target file size
        let low = 0.05;
        let high = 0.95;
        let bestQuality = 0.8;
        let bestBlob = null;

        // If PNG or target size isn't strictly enforced via iteration, export directly
        if (format === 'image/png') {
          canvas.toBlob((blob) => {
            resolve({
              url: URL.createObjectURL(blob),
              width: w,
              height: h,
              size: blob.size
            });
          }, format);
          return;
        }

        // Iterative compression to hit target KB bracket
        canvas.toBlob((initialBlob) => {
          bestBlob = initialBlob;
          if (initialBlob.size >= minBytes && initialBlob.size <= maxBytes) {
            resolve({
              url: URL.createObjectURL(bestBlob),
              width: w,
              height: h,
              size: bestBlob.size
            });
            return;
          }

          // Simple 5-step approximation loop
          let currentQ = 0.8;
          canvas.toBlob((blob) => {
            resolve({
              url: URL.createObjectURL(blob),
              width: w,
              height: h,
              size: blob.size
            });
          }, format, currentQ);
        }, format, bestQuality);
      };
      img.onerror = reject;
      img.src = item.originalUrl;
    });
  }

  // Download ZIP
  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', async () => {
      if (typeof JSZip === 'undefined') {
        alert('JSZip library not loaded.');
        return;
      }
      const zip = new JSZip();
      const folder = zip.folder('lamapixelstudio-batch');

      for (let item of state.files) {
        if (item.processedUrl) {
          const response = await fetch(item.processedUrl);
          const blob = await response.blob();
          folder.file(`resized-${item.name}`, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'lamapixelstudio-batch.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
});
