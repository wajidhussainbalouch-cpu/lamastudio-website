/**
 * lamaPixelStudio - Image Compressor Engine
 * Handles batch compression with adjustable quality slider and WebP/JPEG formats.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewGrid = document.getElementById('previewGrid');
  const emptyNote = document.getElementById('emptyNote');
  const qualityRange = document.getElementById('qualityRange');
  const qualityVal = document.getElementById('qualityVal');
  const compressFormat = document.getElementById('compressFormat');
  const compressAllBtn = document.getElementById('compressAllBtn');

  let state = {
    files: [],
    isProcessing: false
  };

  let nextId = 1;

  if (qualityRange && qualityVal) {
    qualityRange.addEventListener('input', (e) => {
      qualityVal.textContent = e.target.value;
    });
  }

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
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files) handleFiles(e.target.files);
      fileInput.value = '';
    });
  }

  function handleFiles(incoming) {
    Array.from(incoming).forEach(file => {
      if (!file.type.match('image.*')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          state.files.push({
            id: nextId++,
            file: file,
            name: file.name,
            originalUrl: e.target.result,
            processedUrl: null,
            originalSize: file.size,
            processedSize: null,
            width: img.width,
            height: img.height,
            status: 'waiting'
          });
          renderUI();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderUI() {
    if (state.files.length > 0) {
      emptyNote.style.display = 'none';
      compressAllBtn.disabled = false;
      compressAllBtn.textContent = `Compress Batch (${state.files.length})`;
    } else {
      emptyNote.style.display = 'block';
      compressAllBtn.disabled = true;
      compressAllBtn.textContent = 'Compress Batch';
    }

    previewGrid.innerHTML = '';
    state.files.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'padding:16px; display:flex; flex-direction:column; gap:12px; background:var(--surface); border:1px solid var(--line); border-radius:10px;';
      
      const savedPct = item.processedSize ? Math.round((1 - item.processedSize / item.originalSize) * 100) : 0;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:600; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;" title="${item.name}">${item.name}</span>
          <button type="button" class="btn btn-small btn-ghost" data-action="remove" style="padding:2px 8px; font-size:12px;">✕</button>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <img src="${item.originalUrl}" style="width:70px; height:70px; object-fit:cover; border-radius:6px; border:1px solid var(--line);" />
          <div style="flex:1; font-size:12px; color:var(--ink-soft); line-height:1.5;">
            <div>Original: <strong>${formatBytes(item.originalSize)}</strong></div>
            <div>Compressed: <strong style="color:var(--emerald);">${item.processedSize ? formatBytes(item.processedSize) : 'Pending'}</strong></div>
            ${item.processedSize ? `<div style="color:var(--emerald); font-weight:600;">Saved ${savedPct}%</div>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-accent btn-small btn-block" data-action="download" ${!item.processedUrl ? 'disabled' : ''}>Download</button>
        </div>
      `;

      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        state.files = state.files.filter(f => f.id !== item.id);
        renderUI();
      });

      const dlBtn = card.querySelector('[data-action="download"]');
      dlBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = item.processedUrl;
        a.download = `compressed-${item.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });

      previewGrid.appendChild(card);
    });
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  if (compressAllBtn) {
    compressAllBtn.addEventListener('click', async () => {
      if (state.isProcessing || state.files.length === 0) return;
      state.isProcessing = true;
      compressAllBtn.textContent = 'Compressing...';

      const quality = parseInt(qualityRange.value) / 100;
      const format = compressFormat.value;

      for (let item of state.files) {
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = item.width;
            canvas.height = item.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
              item.processedUrl = URL.createObjectURL(blob);
              item.processedSize = blob.size;
              resolve();
            }, format, quality);
          };
          img.src = item.originalUrl;
        });
        renderUI();
      }

      state.isProcessing = false;
      compressAllBtn.textContent = 'Compress Batch';
    });
  }
});
