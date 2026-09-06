// ask-lama.js — Functional AskLama AI Assistant & Mascot Controller
(function() {
  // Inject required styling for right-side floating popup with high z-index stacking
  const style = document.createElement('style');
  style.innerHTML = `
    .asklama-widget-container {
      position: fixed;
      bottom: 25px;
      right: 25px;
      z-index: 2147483647; /* Maximum z-index so it overlays text completely */
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

  // Construct widget DOM structure anchored to the bottom right
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'asklama-widget-container';
  widgetContainer.innerHTML = `
    <div class="asklama-chat-box" id="askLamaChatBox">
      <div class="asklama-header">
        <span>AskLama AI Guide</span>
        <button class="asklama-close" id="askLamaCloseBtn">&times;</button>
      </div>
      <div class="asklama-messages" id="askLamaMessages">
        <div class="asklama-msg bot">Hi there! 👋 I'm AskLama, your personal guide to LamaStudio. How can I help you navigate our ecosystem today?</div>
      </div>
      <div class="asklama-input-area">
        <input type="text" id="askLamaInput" placeholder="Ask about tools, apps, or links...">
        <button id="askLamaSendBtn">Send</button>
      </div>
    </div>
    <button class="asklama-mascot-btn" id="askLamaMascotBtn" title="Chat with AskLama">
      <img src="ask-lama-3d.png" alt="AskLama Mascot" id="askLamaImage" onerror="this.src='https://via.placeholder.com/75?text=Lama';">
    </button>
  `;
  document.body.appendChild(widgetContainer);

  // Element references
  const mascotBtn = document.getElementById('askLamaMascotBtn');
  const mascotImg = document.getElementById('askLamaImage');
  const sidebarMascotImg = document.getElementById('sidebarAskLamaImage');
  const chatBox = document.getElementById('askLamaChatBox');
  const closeBtn = document.getElementById('askLamaCloseBtn');
  const sendBtn = document.getElementById('askLamaSendBtn');
  const inputField = document.getElementById('askLamaInput');
  const messagesContainer = document.getElementById('askLamaMessages');

  let isOpen = false;

  // Global toggle function referenced by external trigger buttons
  window.toggleLamaChat = function() {
    isOpen = !isOpen;
    if (isOpen) {
      chatBox.classList.add('active');
      if (mascotImg) mascotImg.src = 'walking-lama.gif';
      if (sidebarMascotImg) sidebarMascotImg.src = 'walking-lama.gif';
      inputField.focus();
    } else {
      chatBox.classList.remove('active');
      if (mascotImg) mascotImg.src = 'ask-lama-3d.png';
      if (sidebarMascotImg) sidebarMascotImg.src = 'ask-lama-3d.png';
    }
  };

  mascotBtn.addEventListener('click', window.toggleLamaChat);
  closeBtn.addEventListener('click', window.toggleLamaChat);

  // Handle message dispatch and smart responses
  function handleUserMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'asklama-msg user';
    userMsg.innerText = text;
    messagesContainer.appendChild(userMsg);
    inputField.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'asklama-msg bot';
      
      const query = text.toLowerCase();
      if (query.includes('vpn') || query.includes('app') || query.includes('security')) {
        botMsg.innerHTML = 'You can check out our flagship utility <a href="apps/lamavpnpro/" style="color:#60a5fa;">LamaVPN Pro</a> right from the apps ecosystem section!';
      } else if (query.includes('contact') || query.includes('email') || query.includes('support')) {
        botMsg.innerText = 'You can reach the team directly at contact@lamastudio.pk or through our community footer links.';
      } else if (query.includes('free') || query.includes('pricing')) {
        botMsg.innerText = 'Yes! Most core web utilities and developer research generators on LamaStudio are completely free to use.';
      } else if (query.includes('weather') || query.includes('sky')) {
        botMsg.innerHTML = 'Looking for local weather and prayer scheduling? Try out <a href="apps/lamasky/" style="color:#60a5fa;">LamaSky</a>!';
      } else {
        botMsg.innerText = 'I can help you locate apps, answer FAQs, or navigate documentation across LamaStudio. Feel free to ask specifics!';
      }

      messagesContainer.appendChild(botMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 600);
  }

  sendBtn.addEventListener('click', handleUserMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
  });
})();
