// ask-lama.js — Multilingual AskLama AI Assistant & Mascot Controller
(function() {
  // Inject required styling for right-side floating popup with high z-index stacking
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
        <div class="asklama-msg bot">Hi there! 👋 I'm AskLama, your guide. Ask me anything in English, Urdu, or Roman Urdu! / آپ مجھ سے کسی بھی زبان میں پوچھ سکتے ہیں!</div>
      </div>
      <div class="asklama-input-area">
        <input type="text" id="askLamaInput" placeholder="Type a question / سوال یہاں لکھیں...">
        <button id="askLamaSendBtn">Send</button>
      </div>
    </div>
    <button class="asklama-mascot-btn" id="askLamaMascotBtn" title="Chat with AskLama">
      <img src="ask-lama-3d.png" alt="AskLama Mascot" id="askLamaImage" onerror="this.src='https://via.placeholder.com/75?text=Lama';">
    </button>
  `;
  document.body.appendChild(widgetContainer);

  const mascotBtn = document.getElementById('askLamaMascotBtn');
  const mascotImg = document.getElementById('askLamaImage');
  const sidebarMascotImg = document.getElementById('sidebarAskLamaImage');
  const chatBox = document.getElementById('askLamaChatBox');
  const closeBtn = document.getElementById('askLamaCloseBtn');
  const sendBtn = document.getElementById('askLamaSendBtn');
  const inputField = document.getElementById('askLamaInput');
  const messagesContainer = document.getElementById('askLamaMessages');

  let isOpen = false;
  let lastTopic = null;

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
    botMsg.innerText = 'Thinking... / سوچ رہا ہوں...';
    messagesContainer.appendChild(botMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const q = text.toLowerCase();
      let responseText = '';

      // Live Backend Database Queries (English + Urdu/Roman Urdu keywords)
      if (typeof LamaAPI !== 'undefined' && LamaAPI.isLoggedIn()) {
        if (q.includes('student') || q.includes('bachay') || q.includes('talib') || q.includes('pupil') || q.includes('kids')) {
          lastTopic = 'students';
          const students = await LamaAPI.list('students');
          responseText = `You currently have ${students.length} student records registered. / آپ کے پاس اس وقت ${students.length} طلباء رجسٹرڈ ہیں۔`;
        } else if (q.includes('teacher') || q.includes('ustad') || q.includes('staff') || q.includes('faculty')) {
          lastTopic = 'teachers';
          const teachers = await LamaAPI.list('teachers');
          responseText = `There are ${teachers.length} teachers in your school directory. / سکول ڈائریکٹری میں ${teachers.length} اساتذہ موجود ہیں۔`;
        } else if (q.includes('fee') || q.includes('payment') || q.includes('due') || q.includes('pisa') || q.includes('amount')) {
          lastTopic = 'fees';
          responseText = 'You can check individual student fee summaries directly through the dashboard fee panels. / آپ ڈیش بورڈ سے فیس کی تفصیلات چیک کر سکتے ہیں۔';
        } else if (q.includes('school') || q.includes('config') || q.includes('settings')) {
          lastTopic = 'school';
          const school = await LamaAPI.getActiveSchool();
          responseText = school ? `Current School: ${school.schoolName} (ID: ${school.schoolId})` : 'No active school session found.';
        }
      }

      // General Ecosystem & App Queries (Multilingual support)
      if (!responseText) {
        if (q.includes('vpn') || q.includes('lama vpn') || (lastTopic === 'vpn' && (q.includes('free') || q.includes('cost') || q.includes('price') || q.includes('muft')))) {
          lastTopic = 'vpn';
          responseText = 'Yes! <b>LamaVPN Pro</b> offers free core features for secure browsing right from the apps section. / جی ہاں، یہ بالکل مفت دستیاب ہے!';
        } else if (q.includes('weather') || q.includes('sky') || q.includes('prayer') || q.includes('mausam')) {
          lastTopic = 'weather';
          responseText = 'Looking for local weather and prayer schedules? Check out <a href="apps/lamasky/" style="color:#60a5fa;">LamaSky</a>! / موسم اور نماز کے اوقات کے لیے LamaSky استعمال کریں۔';
        } else if (q.includes('contact') || q.includes('email') || q.includes('support') || q.includes('help') || q.includes('rabta')) {
          responseText = 'You can reach the team at contact@lamastudio.pk. / آپ ہم سے اس ای میل پر رابطہ کر سکتے ہیں: contact@lamastudio.pk';
        } else if (q.includes('free') || q.includes('pricing') || q.includes('cost') || q.includes('muft') || q.includes('pese')) {
          responseText = 'Most core web utilities and tools on LamaStudio are completely free to use! / زیادہ تر ٹولز بالکل مفت ہیں!';
        } else if (q.includes('hi') || q.includes('hello') || q.includes('salam')) {
          responseText = 'Hello! 👋 How can I help you today? / السلام علیکم! میں آپ کی کیا مدد کر سکتا ہوں؟';
        } else {
          responseText = 'I can help you navigate LamaStudio or check school records. Try asking about "students", "teachers", "fees", or "LamaVPN"! / آپ مجھ سے طلباء، اساتذہ یا فیس کے بارے میں پوچھ سکتے ہیں۔';
        }
      }

      botMsg.innerHTML = responseText;
    } catch (err) {
      botMsg.innerText = 'Sorry, I encountered an error. / معذرت، سرور سے رابطہ کرنے میں مسئلہ پیش آیا۔';
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendBtn.addEventListener('click', handleUserMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
  });
})();
