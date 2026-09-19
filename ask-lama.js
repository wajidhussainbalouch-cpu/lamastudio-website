// ask-lama.js — Connected to Google Apps Script & Gemini Backend
(function() {
  const style = document.createElement('style');
  style.innerHTML = `
    .asklama-widget-container {
      position: fixed;
      bottom: 25px;
      right: 25px;
      z-index: 2147483647;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .asklama-mascot-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      width: 75px;
      height: 75px;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }
    .asklama-mascot-btn:hover {
      transform: scale(1.1);
    }
    .asklama-mascot-btn img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));
    }
    .asklama-chat-box {
      position: absolute;
      bottom: 90px;
      right: 0;
      width: 340px;
      max-height: 480px;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #333);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.9);
      opacity: 0;
      pointer-events: none;
      transform-origin: bottom right;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .asklama-chat-box.active {
      transform: scale(1);
      opacity: 1;
      pointer-events: auto;
    }
    .asklama-header {
      background: linear-gradient(135deg, #2563eb, #174ea6);
      color: #fff;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .asklama-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .asklama-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      max-height: 320px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 0.85rem;
      background: var(--surface, #1e1e1e);
      scroll-behavior: smooth;
    }
    .asklama-msg {
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 85%;
      line-height: 1.4;
      word-break: break-word;
    }
    .asklama-msg.bot {
      background: rgba(255,255,255,0.08);
      color: var(--text, #fff);
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .asklama-msg.user {
      background: #2563eb;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .asklama-input-area {
      padding: 12px;
      border-top: 1px solid var(--border, #333);
      display: flex;
      gap: 8px;
      background: var(--surface, #1e1e1e);
    }
    .asklama-input-area input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border, #333);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text, #fff);
      font-size: 0.85rem;
      outline: none;
    }
    .asklama-input-area input:focus {
      border-color: #2563eb;
    }
    .asklama-input-area button {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0 14px;
      font-weight: 600;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'asklama-widget-container';
  widgetContainer.innerHTML = `
    <div class="asklama-chat-box" id="askLamaChatBox">
      <div class="asklama-header">
        <span>AskLama AI Guide</span>
        <button class="asklama-close" id="askLamaCloseBtn">&times;</button>
      </div>
      <div class="asklama-messages" id="askLamaMessages">
        <div class="asklama-msg bot">Hi there! 👋 I'm AskLama, powered by Gemini. Ask me anything in any language!</div>
      </div>
      <div class="asklama-input-area">
        <input type="text" id="askLamaInput" placeholder="Ask anything...">
        <button id="askLamaSendBtn">Send</button>
      </div>
    </div>
    <button class="asklama-mascot-btn" id="askLamaMascotBtn" title="Chat with AskLama">
      <img src="ask-lama-3d.png" alt="AskLama Mascot" id="askLamaImage" onerror="this.src='https://via.placeholder.com/75?text=Lama';">
    </button>
  `;
  document.body.appendChild(widgetContainer);

  const mascotBtn = document.getElementById('askLamaMascotBtn');
  const chatBox = document.getElementById('askLamaChatBox');
  const closeBtn = document.getElementById('askLamaCloseBtn');
  const sendBtn = document.getElementById('askLamaSendBtn');
  const inputField = document.getElementById('askLamaInput');
  const messagesContainer = document.getElementById('askLamaMessages');

  let isOpen = false;

  window.toggleLamaChat = function() {
    isOpen = !isOpen;
    if (isOpen) {
      chatBox.classList.add('active');
      inputField.focus();
    } else {
      chatBox.classList.remove('active');
    }
  };

  mascotBtn.addEventListener('click', window.toggleLamaChat);
  closeBtn.addEventListener('click', window.toggleLamaChat);

  async function handleUserMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'asklama-msg user';
    userMsg.innerText = text;
    messagesContainer.appendChild(userMsg);
    inputField.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const botMsg = document.createElement('div');
    botMsg.className = 'asklama-msg bot';
    botMsg.innerText = 'Thinking...';
    messagesContainer.appendChild(botMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      // Direct call to your active Google Apps Script Web App URL
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbzKX6oxKJH98jfdMOJt9597AKG4T6yBNttfTuO3eUtgLizdVmHKGZL6fEXyn3xYJ_ydBQ/exec';
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ prompt: text })
      });

      const data = await response.json();

      if (data && data.text) {
        botMsg.innerText = data.text;
      } else {
        botMsg.innerText = data.error || 'Sorry, I encountered an issue generating a response.';
      }
    } catch (err) {
      botMsg.innerText = 'Network connection error. Please try again.';
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendBtn.addEventListener('click', handleUserMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
  });
})();
