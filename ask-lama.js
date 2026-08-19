/**
 * AskLama Global AI Agent & Walking Robotic Mascot
 * Automatically injects the assistant widget and walking character into any page.
 */
(function() {
  // CONFIGURATION: Asset paths
  const CONFIG = {
    avatarImg: '/ask-lama-3d.png',
    walkingImg: '/walking-lama.png'
  };

  // 1. Combined HTML & CSS Template
  const widgetHTML = `
  <!-- Walking Robotic Mascot -->
  <div id="walkingLamaContainer">
    <img src="${CONFIG.walkingImg}" alt="Walking Robotic Lama" id="walkingLamaImg">
  </div>

  <!-- Chat Widget Container -->
  <div id="askLamaWidget">
    <!-- Trigger Button -->
    <button id="lamaToggleBtn" onclick="toggleLamaChat()">lama</button>

    <!-- Chat Box Window -->
    <div id="lamaChatBox">
      <!-- Header -->
      <div class="lama-header">
        <img src="${CONFIG.avatarImg}" alt="AskLama AI" class="lama-avatar">
        <div>
          <strong style="font-size: 1.05rem;">AskLama AI</strong>
          <div style="font-size: 0.75rem; opacity: 0.9;">Your Site Assistant</div>
        </div>
        <button onclick="toggleLamaChat()" class="lama-close-btn">&times;</button>
      </div>

      <!-- Messages Area -->
      <div id="lamaMessages">
        <div class="lama-bubble lama-incoming">
          👋 Hello! I'm AskLama. Ask me anything about LamaStudio's tools or pages!
        </div>
      </div>

      <!-- Input Bar -->
      <div class="lama-input-bar">
        <input type="text" id="lamaInput" placeholder="Ask a question..." onkeypress="handleLamaEnter(event)">
        <button onclick="sendToAskLama()" class="lama-send-btn">Send</button>
      </div>
    </div>
  </div>

  <!-- Stylesheet -->
  <style>
    /* Walking Mascot Styles */
    #walkingLamaContainer {
      position: fixed;
      bottom: 0;
      left: -120px;
      z-index: 9998;
      pointer-events: none;
      animation: walkAcross 20s linear infinite;
    }
    #walkingLamaImg {
      width: 85px;
      height: auto;
      filter: drop-shadow(0 5px 8px rgba(0,0,0,0.3));
    }
    @keyframes walkAcross {
      0% { left: -120px; transform: scaleX(1); }
      49% { transform: scaleX(1); }
      50% { left: calc(100vw + 20px); transform: scaleX(-1); }
      99% { transform: scaleX(-1); }
      100% { left: -120px; transform: scaleX(1); }
    }

    /* Chat Widget Styles */
    #askLamaWidget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    }
    #lamaToggleBtn {
      background: var(--category-color, #174ea6);
      color: #fff;
      border: none;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      transition: transform 0.2s;
    }
    #lamaToggleBtn:hover {
      transform: translateY(-2px);
    }
    #lamaChatBox {
      display: none;
      width: 340px;
      height: 460px;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #333);
      border-radius: 16px;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      margin-bottom: 10px;
      transform-origin: bottom right;
      animation: lamaScaleIn 0.3s ease forwards;
    }
    .lama-header {
      background: var(--category-color, #174ea6);
      color: #fff;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .lama-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.3);
      background: rgba(0,0,0,0.2);
    }
    .lama-close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.4rem;
      cursor: pointer;
      margin-left: auto;
      opacity: 0.7;
    }
    .lama-close-btn:hover { opacity: 1; }
    #lamaMessages {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      font-size: 0.9rem;
      color: var(--text, #fff);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .lama-bubble {
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 85%;
      line-height: 1.4;
    }
    .lama-incoming {
      background: rgba(255,255,255,0.07);
      border-top-left-radius: 4px;
      align-self: flex-start;
    }
    .lama-outgoing {
      background: rgba(23,78,166,0.4);
      color: #e0e7ff;
      border-top-right-radius: 4px;
      align-self: flex-end;
    }
    .lama-input-bar {
      padding: 10px;
      border-top: 1px solid var(--border, #333);
      display: flex;
      gap: 8px;
      background: var(--bg, #121212);
    }
    #lamaInput {
      flex: 1;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #333);
      color: var(--text, #fff);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
    }
    .lama-send-btn {
      background: var(--category-color, #174ea6);
      color: #fff;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    @keyframes lamaScaleIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  </style>`;

  // Inject elements on page load
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);
  });
})();

// =========================================
// Functional Logic
// =========================================
function toggleLamaChat() {
  const box = document.getElementById('lamaChatBox');
  const btn = document.getElementById('lamaToggleBtn');
  if (box.style.display === 'none' || box.style.display === '') {
    box.style.display = 'flex';
    btn.innerHTML = '&times;';
    btn.style.fontSize = '1.6rem';
    document.getElementById('lamaInput').focus();
  } else {
    box.style.display = 'none';
    btn.innerHTML = 'lama';
    btn.style.fontSize = '1.2rem';
  }
}

function handleLamaEnter(e) {
  if (e.key === 'Enter') sendToAskLama();
}

async function sendToAskLama() {
  const input = document.getElementById('lamaInput');
  const messages = document.getElementById('lamaMessages');
  const query = input.value.trim();

  if (!query) return;

  // User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'lama-bubble lama-outgoing';
  userBubble.textContent = query;
  messages.appendChild(userBubble);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  // Loading Bubble
  const loading = document.createElement('div');
  loading.id = 'lama-loading';
  loading.className = 'lama-bubble lama-incoming';
  loading.style.opacity = '0.7';
  loading.textContent = 'AskLama is thinking...';
  messages.appendChild(loading);
  messages.scrollTop = messages.scrollHeight;

  const websiteContext = `
    You are "AskLama", the official AI assistant for LamaStudio (lamastudio.pk).
    Your job is to help users navigate tools, research generators, and educational pages. Keep responses concise and friendly.
  `;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `${websiteContext}\n\nUser Question: "${query}"` })
    });

    const data = await response.json();
    document.getElementById('lama-loading')?.remove();

    const aiBubble = document.createElement('div');
    aiBubble.className = 'lama-bubble lama-incoming';
    
    if (data.text) {
      aiBubble.innerHTML = data.text.replace(/\n/g, '<br>');
    } else {
      aiBubble.textContent = "Sorry, I hit a snag. Try again shortly!";
      aiBubble.style.color = '#fca5a5';
    }

    messages.appendChild(aiBubble);
    messages.scrollTop = messages.scrollHeight;

  } catch (err) {
    document.getElementById('lama-loading')?.remove();
    const errBubble = document.createElement('div');
    errBubble.className = 'lama-bubble lama-incoming';
    errBubble.style.color = '#fca5a5';
    errBubble.textContent = "Network error. Check your connection.";
    messages.appendChild(errBubble);
    messages.scrollTop = messages.scrollHeight;
  }
}
