/* AskLama v2 — accessible, opaque chat powered by the same-origin AI endpoint. */
(() => {
  'use strict';
  if (document.getElementById('askLamaChatBox')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/ask-lama.css?v=2';
  document.head.appendChild(stylesheet);

  const root = document.createElement('div');
  root.className = 'asklama-widget-container';
  root.innerHTML = [
    "<div class='asklama-scrim' id='askLamaScrim' aria-hidden='true'></div>",
    "<section class='asklama-chat-box' id='askLamaChatBox' role='dialog' aria-modal='true' aria-label='AskLama chat' aria-hidden='true'>",
      "<div class='asklama-header'>",
        "<div class='asklama-heading'><strong>AskLama AI Guide</strong><small>LAMA Studio · Your digital assistant</small></div>",
        "<div class='asklama-header-actions'>",
          "<button type='button' id='askLamaClearBtn' title='Clear chat' aria-label='Clear conversation'>Clear</button>",
          "<button type='button' class='asklama-close' id='askLamaCloseBtn' aria-label='Close AskLama chat'>×</button>",
        "</div>",
      "</div>",
      "<div class='asklama-messages' id='askLamaMessages' role='log' aria-live='polite' aria-relevant='additions text'>",
        "<div class='asklama-msg bot'>Hello! 👋 I’m AskLama, your LAMA Studio guide. How can I help you today?</div>",
      "</div>",
      "<form class='asklama-compose' id='askLamaForm'>",
        "<input type='text' id='askLamaInput' name='question' placeholder='Type your question…' aria-label='Message to AskLama' autocomplete='off' maxlength='1200' required>",
        "<button type='submit' id='askLamaSendBtn'>Send</button>",
      "</form>",
      "<div class='asklama-status' id='askLamaStatus' role='status' aria-live='polite'>Do not share passwords or personal school records.</div>",
    "</section>",
    "<button type='button' class='asklama-mascot-btn' id='askLamaMascotBtn' aria-label='Open AskLama chat' title='Chat with AskLama'>",
      "<img src='/ask-lama-3d.png' alt='' loading='lazy'>",
    "</button>"
  ].join('');
  document.body.appendChild(root);

  const get = id => document.getElementById(id);
  const chatBox = get('askLamaChatBox');
  const scrim = get('askLamaScrim');
  const messages = get('askLamaMessages');
  const form = get('askLamaForm');
  const input = get('askLamaInput');
  const send = get('askLamaSendBtn');
  const clear = get('askLamaClearBtn');
  const close = get('askLamaCloseBtn');
  const mascot = get('askLamaMascotBtn');
  const status = get('askLamaStatus');
  const welcome = messages.firstElementChild.textContent;
  let open = false;
  let busy = false;
  let returnFocus = null;
  let history = [];

  function mobile() {
    return window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  }

  function fitMobileKeyboard() {
    if (!open || !mobile() || !window.visualViewport) {
      chatBox.style.height = '';
      chatBox.style.top = '';
      chatBox.style.bottom = '';
      return;
    }
    const viewport = window.visualViewport;
    const top = Math.max(8, Math.round(viewport.offsetTop + 8));
    const height = Math.max(180, Math.round(viewport.height - 16));
    chatBox.style.top = top + 'px';
    chatBox.style.height = height + 'px';
    chatBox.style.bottom = 'auto';
  }

  function setOpen(next) {
    if (open === next) return;
    open = next;
    if (next) returnFocus = document.activeElement;
    root.classList.toggle('is-open', next);
    chatBox.classList.toggle('active', next);
    scrim.classList.toggle('active', next);
    chatBox.setAttribute('aria-hidden', String(!next));
    mascot.setAttribute('aria-expanded', String(next));
    document.body.classList.toggle('asklama-open', next);
    fitMobileKeyboard();
    if (next) {
      // Don't open the on-screen keyboard over chat when opening on Android.
      if (!mobile()) input.focus();
      messages.scrollTop = messages.scrollHeight;
    } else {
      if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
      returnFocus = null;
    }
  }

  window.toggleLamaChat = function(force) {
    setOpen(typeof force === 'boolean' ? force : !open);
  };

  function bubble(text, kind) {
    const node = document.createElement('div');
    node.className = 'asklama-msg ' + (kind || 'bot');
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  }

  async function handleUserMessage(event) {
    if (event) event.preventDefault();
    if (busy) return;
    const question = input.value.trim();
    if (!question) return;
    if (question.length > 1200) {
      status.textContent = 'Please shorten your question to 1,200 characters.';
      return;
    }

    busy = true;
    send.disabled = true;
    clear.disabled = true;
    send.textContent = 'Sending…';
    bubble(question, 'user');
    input.value = '';
    const reply = bubble('Thinking…', 'bot loading');
    status.textContent = 'Generating a reply…';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 34000);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({prompt: question, history: history.slice(-6)})
      });
      let data = {};
      try { data = await response.json(); }
      catch (error) { throw new Error('The AI service returned an invalid response.'); }
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'AI service unavailable.');
      }
      const answer = typeof data.text === 'string' ? data.text.trim() : '';
      if (!answer) throw new Error('No reply was returned. Please try again.');
      reply.textContent = answer;
      reply.classList.remove('loading');
      history.push({role:'user',text:question}, {role:'model',text:answer});
      history = history.slice(-8);
      status.textContent = 'Reply received. Ask a follow-up question.';
    } catch (error) {
      reply.classList.remove('loading');
      reply.classList.add('error');
      reply.textContent = error.name === 'AbortError'
        ? 'This request took too long. Please check your connection and try again.'
        : error instanceof TypeError
          ? 'Could not connect to AskLama. Check your connection and try again.'
          : String(error.message || 'Unable to get a reply. Please try again.');
      status.textContent = 'Reply not received. You can try again.';
    } finally {
      clearTimeout(timeout);
      busy = false;
      send.disabled = false;
      clear.disabled = false;
      send.textContent = 'Send';
      messages.scrollTop = messages.scrollHeight;
    }
  }

  mascot.addEventListener('click', () => setOpen(!open));
  close.addEventListener('click', () => setOpen(false));
  scrim.addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', handleUserMessage);
  clear.addEventListener('click', () => {
    if (busy) return;
    messages.replaceChildren();
    bubble(welcome, 'bot');
    history = [];
    status.textContent = 'Conversation cleared. Ask a new question.';
    input.value = '';
  });
  document.addEventListener('keydown', event => {
    if (open && event.key === 'Escape') setOpen(false);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitMobileKeyboard);
    window.visualViewport.addEventListener('scroll', fitMobileKeyboard);
  }
  window.addEventListener('resize', fitMobileKeyboard);

  // Expose a minimal test interface; this contains no credentials or secrets.
  window.__askLamaUI = {setOpen, handleUserMessage, isOpen:()=>open, isBusy:()=>busy};
})();
