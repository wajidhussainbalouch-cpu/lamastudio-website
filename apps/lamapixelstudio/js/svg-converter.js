/**
 * lamaPixelStudio - SVG Converter Engine
 * Handles rasterizing vector SVG files into high-resolution PNG or JPG formats.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewGrid = document.getElementById('previewGrid');
  const emptyNote = document.getElementById('emptyNote');
  const convertAllBtn = document.getElementById('convertAllBtn');
  const downloadZipBtn = document.getElementById('downloadZipBtn');
  const outputFormat = document.getElementById('outputFormat');
  const scaleMultiplier = document.getElementById('scaleMultiplier');

  let state = {
    files: [],
    isProcessing: false
  };

  let nextId = 1;

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
      if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          state.files.push({
            id: nextId++,
            file: file,
            name: file.name,
            originalUrl: url,
            svgText: text,
            convertedUrl: null,
            originalWidth: img.naturalWidth || 300,
            originalHeight: img.naturalHeight || 150,
            convertedSize: null,
            status: 'waiting'
          });
          renderUI();
        };
        img.src = url;
      };
      reader.readAsText(file);
    });
  }

  function renderUI() {
    if (state.files.length > 0) {
      emptyNote.style.display = 'none';
      convertAllBtn.disabled = false;
      convertAllBtn.textContent = `Convert SVGs (${state.files.length})`;
    } else {
      emptyNote.style.display = 'block';
      convertAllBtn.disabled = true;
      convertAllBtn.textContent = 'Convert SVGs';
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
          <img src="${item.originalUrl}" style="width:70px; height:70px; object-fit:contain; border-radius:6px; border:1px solid var(--line); background:#f9f9f9;" />
          <div style="flex:1; font-size:12px; color:var(--ink-soft); line-height:1.5;">
            <div>Vector: <strong>${item.originalWidth}×${item.originalHeight}px</strong></div>
            <div>Status: <strong style="color:var(--emerald);">${item.convertedUrl ? 'Ready' : 'Waiting'}</strong></div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-accent btn-small btn-block" data-action="download" ${!item.convertedUrl ? 'disabled' : ''}>Download Raster</button>
        </div>
      `;

      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        state.files = state.files.filter(f => f.id !== item.id);
        renderUI();
      });

      card.querySelector('[data-action="download"]').addEventListener('click', () => {
        const ext = outputFormat.value === 'image/jpeg' ? 'jpg' : 'png';
        const a = document.createElement('a');
        a.href = item.convertedUrl;
        a.download = `${item.name.substring(0, item.name.lastIndexOf('.')) || item.name}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });

      previewGrid.appendChild(card);
    });
  }

  if (convertAllBtn) {
    convertAllBtn.addEventListener('click', async () => {
      if (state.isProcessing || state.files.length === 0) return;
      state.isProcessing = true;
      convertAllBtn.textContent = 'Rasterizing...';

      const format = outputFormat ? outputFormat.value : 'image/png';
      const scale = parseInt(scaleMultiplier ? scaleMultiplier.value : 2) || 2;

      for (let item of state.files) {
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const w = (img.naturalWidth || 300) * scale;
            const h = (img.naturalHeight || 150) * scale;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');

            if (format === 'image/jpeg') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, w, h);
            }

            ctx.drawImage(img, 0, 0, w, h);

            canvas.toBlob((blob) => {
              item.convertedUrl = URL.createObjectURL(blob);
              item.convertedSize = blob.size;
              resolve();
            }, format, 0.95);
          };
          img.src = item.originalUrl;
        });
        renderUI();
      }

      state.isProcessing = false;
      convertAllBtn.textContent = 'Convert SVGs';
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
      const folder = zip.folder('lamapixelstudio-svgs');
      const ext = outputFormat.value === 'image/jpeg' ? 'jpg' : 'png';

      for (let item of state.files) {
        if (item.convertedUrl) {
          const response = await fetch(item.convertedUrl);
          const blob = await response.blob();
          const cleanName = `${item.name.substring(0, item.name.lastIndexOf('.')) || item.name}.${ext}`;
          folder.file(cleanName, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'lamapixelstudio-svgs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
});
