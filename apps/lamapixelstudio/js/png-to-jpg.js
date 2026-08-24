/**
 * lamaPixelStudio - PNG to JPG Converter Engine
 * Handles transparent PNG flattening with chosen background color and batch export to JPG.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewGrid = document.getElementById('previewGrid');
  const emptyNote = document.getElementById('emptyNote');
  const convertAllBtn = document.getElementById('convertAllBtn');
  const downloadZipBtn = document.getElementById('downloadZipBtn');
  const bgSwatches = document.querySelectorAll('#bgSwatches .swatch');

  let state = {
    files: [],
    bgColor: '#ffffff',
    isProcessing: false
  };

  let nextId = 1;

  // Background color swatch selector
  bgSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      bgSwatches.forEach(s => s.setAttribute('aria-pressed', 'false'));
      swatch.setAttribute('aria-pressed', 'true');
      state.bgColor = swatch.getAttribute('data-color');
    });
  });

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
      if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          state.files.push({
            id: nextId++,
            file: file,
            name: file.name,
            originalUrl: e.target.result,
            convertedUrl: null,
            originalSize: file.size,
            convertedSize: null,
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
      convertAllBtn.disabled = false;
      convertAllBtn.textContent = `Convert All to JPG (${state.files.length})`;
    } else {
      emptyNote.style.display = 'block';
      convertAllBtn.disabled = true;
      convertAllBtn.textContent = 'Convert All to JPG';
      downloadZipBtn.disabled = true;
    }

    previewGrid.innerHTML = '';
    state.files.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'padding:16px; display:flex; flex-direction:column; gap:12px; background:var(--surface); border:1px solid var(--line); border-radius:10px;';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:600; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;" title="${item.name}">${item.name}</span>
          <button type="button" class="btn btn-small btn-ghost" data-action="remove" style="padding:2px 8px; font-size:12px;">✕</button>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <img src="${item.originalUrl}" style="width:70px; height:70px; object-fit:cover; border-radius:6px; border:1px solid var(--line); background:#fff;" />
          <div style="flex:1; font-size:12px; color:var(--ink-soft); line-height:1.5;">
            <div>Original: <strong>${formatBytes(item.originalSize)}</strong> (${item.width}×${item.height})</div>
            <div>JPG Size: <strong style="color:var(--emerald);">${item.convertedSize ? formatBytes(item.convertedSize) : 'Pending'}</strong></div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-accent btn-small btn-block" data-action="download" ${!item.convertedUrl ? 'disabled' : ''}>Download JPG</button>
        </div>
      `;

      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        state.files = state.files.filter(f => f.id !== item.id);
        renderUI();
      });

      card.querySelector('[data-action="download"]').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = item.convertedUrl;
        a.download = `${item.name.substring(0, item.name.lastIndexOf('.')) || item.name}.jpg`;
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

  if (convertAllBtn) {
    convertAllBtn.addEventListener('click', async () => {
      if (state.isProcessing || state.files.length === 0) return;
      state.isProcessing = true;
      convertAllBtn.textContent = 'Converting...';

      for (let item of state.files) {
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = item.width;
            canvas.height = item.height;
            const ctx = canvas.getContext('2d');

            // Fill background color for transparent areas
            ctx.fillStyle = state.bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
              item.convertedUrl = URL.createObjectURL(blob);
              item.convertedSize = blob.size;
              resolve();
            }, 'image/jpeg', 0.9);
          };
          img.src = item.originalUrl;
        });
        renderUI();
      }

      state.isProcessing = false;
      convertAllBtn.textContent = 'Convert All to JPG';
      downloadZipBtn.disabled = false;
    });
  }

  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', async () => {
      if (typeof JSZip === 'undefined') {
        alert('JSZip library not loaded.');
        return;
      }
      const zip = new JSZip();
      const folder = zip.folder('lamapixelstudio-jpgs');

      for (let item of state.files) {
        if (item.convertedUrl) {
          const response = await fetch(item.convertedUrl);
          const blob = await response.blob();
          const cleanName = `${item.name.substring(0, item.name.lastIndexOf('.')) || item.name}.jpg`;
          folder.file(cleanName, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'lamapixelstudio-jpgs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
});
