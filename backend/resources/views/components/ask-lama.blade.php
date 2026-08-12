cat << 'EOF' > resources/views/components/ask-lama.blade.php
<!-- AskLama Floating Chat Widget Styles -->
<style>
#ask-lama-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    font-family: sans-serif;
}
#ask-lama-btn {
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 20px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s;
}
#ask-lama-btn:hover {
    transform: scale(1.05);
}
#ask-lama-box {
    display: none;
    position: absolute;
    bottom: 60px;
    right: 0;
    width: 320px;
    height: 420px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 25px rgba(0,0,0,0.2);
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e5e7eb;
}
#ask-lama-header {
    background: #4f46e5;
    color: white;
    padding: 12px 16px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
#ask-lama-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
}
#ask-lama-messages {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #f9fafb;
}
.lama-msg {
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 80%;
    line-height: 1.4;
}
.user-msg {
    background: #4f46e5;
    color: white;
    align-self: flex-end;
}
.ai-msg {
    background: #e5e7eb;
    color: #1f2937;
    align-self: flex-start;
}
#ask-lama-input-area {
    display: flex;
    padding: 10px;
    background: white;
    border-top: 1px solid #e5e7eb;
}
#ask-lama-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    outline: none;
    font-size: 14px;
}
#ask-lama-send {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 8px 14px;
    margin-left: 6px;
    border-radius: 6px;
    cursor: pointer;
}
</style>

<!-- Widget HTML Structure -->
<div id="ask-lama-widget">
    <div id="ask-lama-box">
        <div id="ask-lama-header">
            <span>AskLama Assistant</span>
            <button id="ask-lama-close" onclick="toggleAskLama()">&times;</button>
        </div>
        <div id="ask-lama-messages">
            <div class="lama-msg ai-msg">Hello! I'm AskLama. How can I help you today?</div>
        </div>
        <div id="ask-lama-input-area">
            <input type="text" id="ask-lama-input" placeholder="Ask me anything..." onkeypress="handleLamaEnter(event)">
            <button id="ask-lama-send" onclick="sendToAskLama()">Send</button>
        </div>
    </div>
    <button id="ask-lama-btn" onclick="toggleAskLama()">💬 AskLama</button>
</div>

<!-- Widget JavaScript Logic -->
<script>
function toggleAskLama() {
    const box = document.getElementById('ask-lama-box');
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

function handleLamaEnter(e) {
    if (e.key === 'Enter') sendToAskLama();
}

async function sendToAskLama() {
    const inputField = document.getElementById('ask-lama-input');
    const messageContainer = document.getElementById('ask-lama-messages');
    const userText = inputField.value.trim();
    
    if (!userText) return;

    messageContainer.innerHTML += `<div class="lama-msg user-msg">${escapeHtml(userText)}</div>`;
    inputField.value = '';
    messageContainer.scrollTop = messageContainer.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    messageContainer.innerHTML += `<div id="${loadingId}" class="lama-msg ai-msg">Thinking...</div>`;
    messageContainer.scrollTop = messageContainer.scrollHeight;

    try {
        const response = await fetch('/api/ask-lama', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({ prompt: userText })
        });
        
        const data = await response.json();
        document.getElementById(loadingId).remove();

        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
        messageContainer.innerHTML += `<div class="lama-msg ai-msg">${escapeHtml(aiReply)}</div>`;
    } catch (error) {
        document.getElementById(loadingId).remove();
        messageContainer.innerHTML += `<div class="lama-msg ai-msg">Connection error. Please try again.</div>`;
    }
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
</script>
EOF