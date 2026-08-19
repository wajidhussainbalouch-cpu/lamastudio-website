// ask-lama.js - Injects AskLama globally into any page automatically
(function() {
  // CONFIGURATION: Path to your generated 3D Lama image
  const LAMA_IMAGE_SRC = '/ask-lama-3d.png'; // <-- CHANGE THIS if image is in a subfolder like '/images/ask-lama-3d.png'

  const widgetHTML = `
  <div id="askLamaWidget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: 'Inter', sans-serif;">
    <!-- Trigger Button with subtle glow -->
    <button id="lamaToggleBtn" onclick="toggleLamaChat()" style="background: var(--category-color, #174ea6); color: #fff; border: none; width: 60px; height: 60px; border-radius: 50%; box-shadow: 0 4px 20px rgba(0,0,0,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; transition: transform 0.2s;">
      lama
    </button>

    <!-- Chat Box Container -->
    <div id="lamaChatBox" style="display: none; width: 340px; height: 480px; background: var(--surface, #1e1e1e); border: 1px solid var(--border, #333); border-radius: 16px; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4); margin-bottom: 10px; transform-origin: bottom right; animation: lamaScaleIn 0.3s ease forwards;">
      
      <!-- Header with 3D Model Image -->
      <div style="background: var(--category-color, #174ea6); color: #fff; padding: 15px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <!-- The 3D Image -->
        <img src="${LAMA_IMAGE_SRC}" alt="AskLama AI" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.2);">
        <div>
          <strong style="font-size: 1.1rem;">AskLama AI</strong>
          <div style="font-size: 0.8rem; opacity: 0.9;">Your Intelligent Site Assistant</div>
        </div>
        <button onclick="toggleLamaChat()" style="background: none; border: none; color: #fff; font-size: 1.4rem; cursor: pointer; margin-left: auto; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">&times;</button>
      </div>

      <!-- Messages Area -->
      <div id="lamaMessages" style="flex: 1; padding: 15px; overflow-y: auto; font-size: 0.95rem; color: var(--text, #fff); display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin; scrollbar-color: var(--border) var(--surface);">
        <!-- Initial Greeting -->
        <div style="background: rgba(255,255,255,0.07); padding: 10px 14px; border-radius: 12px; border-top-left-radius: 4px; max-width: 85%; align-self: flex-start;">
          👋 Hello! I am AskLama. I'm here to help you explore LamaStudio. What can I tell you about today?
        </div>
      </div>

      <!-- Input Area -->
      <div style="padding: 12px; border-top: 1px solid var(--border, #333); display: flex; gap: 8px; background: var(--bg, #121212);">
        <input type="text" id="lamaInput" placeholder="Ask about tools, courses, or pricing..." onkeypress="handleLamaEnter(event)" style="flex: 1; background: var(--surface, #1e1e1e); border: 1px solid var(--border, #333); color: var(--text, #fff); padding: 10px 12px; border-radius: 8px; font-size: 0.95rem; outline: none;">
        <button onclick="sendToAskLama()" style="background: var(--category-color, #174ea6); color: #fff; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: opacity 0.2s;">Send</button>
      </div>
    </div>
  </div>

  <!-- Simple Animation Keyframes -->
  <style>
    @keyframes lamaScaleIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    #lamaToggleBtn:hover {
      transform: translateY(-2px);
    }
    /* Minimalist Scrollbar for webkit */
    #lamaMessages::-webkit-scrollbar { width: 6px; }
    #lamaMessages::-webkit-scrollbar-track { background: transparent; }
    #lamaMessages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  </style>
  `;

  // Inject HTML into page automatically on load
  document.addEventListener("DOMContentLoaded", () => {
    // Prevent injection if mobile screen is too small (optional)
    // if (window.innerWidth < 400) return; 
    
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'askLamaWrapper';
    chatbotContainer.innerHTML = widgetHTML;
    document.body.appendChild(chatbotContainer);
  });
})();

// =========================================
// Chat Logic Functions (Global Scope)
// =========================================

function toggleLamaChat() {
  const box = document.getElementById('lamaChatBox');
  const btn = document.getElementById('lamaToggleBtn');
  if (box.style.display === 'none' || box.style.display === '') {
    box.style.display = 'flex';
    btn.innerHTML = '&times;'; // Change icon to X when open
    btn.style.fontSize = '1.8rem';
    document.getElementById('lamaInput').focus(); // Focus input automatically
  } else {
    box.style.display = 'none';
    btn.innerHTML = 'lama'; // Change icon back
    btn.style.fontSize = '1.2rem';
  }
}

function handleLamaEnter(e) {
  if (e.key === 'Enter') sendToAskLama();
}

async function sendToAskLama() {
  const input = document.getElementById('lamaInput');
  const messages = document.getElementById('lamaMessages');
  const userQuery = input.value.trim();

  if (!userQuery) return;

  // 1. Append user message visually
  const userBubble = document.createElement('div');
  userBubble.style.cssText = 'background: rgba(23,78,166,0.4); color: #e0e7ff; padding: 10px 14px; border-radius: 12px; border-top-right-radius: 4px; align-self: flex-end; max-width: 85%; margin-top: 5px;';
  userBubble.textContent = userQuery;
  messages.appendChild(userBubble);
  
  input.value = '';
  messages.scrollTop = messages.scrollHeight; // Auto-scroll down

  // 2. Add loading indicator
  const loadingBubble = document.createElement('div');
  loadingBubble.id = 'lama-loading';
  loadingBubble.style.cssText = 'background: rgba(255,255,255,0.07); padding: 10px 14px; border-radius: 12px; border-top-left-radius: 4px; max-width: 85%; align-self: flex-start; opacity: 0.7; font-style: italic;';
  loadingBubble.textContent = 'AskLama is thinking...';
  messages.appendChild(loadingBubble);
  messages.scrollTop = messages.scrollHeight;

  // 3. Define Context for Gemini
  const websiteContext = `
    You are "AskLama", the official, friendly, and knowledgeable AI assistant for LamaStudio (lamastudio.pk).
    Your goal is to help users understand our educational platform.
    LamaStudio offers: Research Paper Generators, Study Tools, Academic writing assistance, and various educational utilities.
    Keep answers concise, helpful, and encouraging. Use emojis occasionally. Direct users to specific tools if they ask about them.
  `;

  const fullPrompt = `${websiteContext}\n\nUser Question: "${userQuery}"`;

  try {
    // 4. Send to your SECURE Vercel Backend
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt })
    });

    const data = await response.json();
    
    // Remove loading indicator
    const loadingElem = document.getElementById('lama-loading');
    if(loadingElem) loadingElem.remove();

    // 5. Display AI Response or Error
    const aiBubble = document.createElement('div');
    aiBubble.style.cssText = 'background: rgba(255,255,255,0.07); padding: 10px 14px; border-radius: 12px; border-top-left-radius: 4px; max-width: 85%; align-self: flex-start; animation: lamaScaleIn 0.3s ease;';

    if (data.text) {
      // Basic formatting for line breaks from AI
      aiBubble.innerHTML = data.text.replace(/\n/g, '<br>');
    } else {
      aiBubble.textContent = "Sorry, I encountered a glitch. Please try again in a moment.";
      aiBubble.style.color = '#fca5a5'; // Light red for errors
    }
    
    messages.appendChild(aiBubble);
    messages.scrollTop = messages.scrollHeight;

  } catch (err) {
    // Handle Fetch/Network errors
    const loadingElem = document.getElementById('lama-loading');
    if(loadingElem) loadingElem.remove();
    
    const errorBubble = document.createElement('div');
    errorBubble.style.cssText = 'background: rgba(239,68,68,0.2); color: #fca5a5; padding: 10px 14px; border-radius: 12px; border-top-left-radius: 4px; max-width: 85%; align-self: flex-start;';
    errorBubble.textContent = "Connection error. Please check your internet.";
    messages.appendChild(errorBubble);
    messages.scrollTop = messages.scrollHeight;
    console.error("AskLama Error:", err);
  }
}
