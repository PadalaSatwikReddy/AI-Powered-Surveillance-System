// js/chatbot.js

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
});

function toggleChat() {
    const panel = document.getElementById('chatPanel');
    const btn = document.getElementById('chatBtn');

    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        btn.classList.remove('glow');
        setTimeout(() => document.getElementById('chatInput').focus(), 300);
    } else {
        panel.classList.add('hidden');
        btn.innerHTML = '<i class="fa-solid fa-message"></i>';
        setTimeout(() => btn.classList.add('glow'), 2000);
    }
}

function sendChatMessage() {
    const inputField = document.getElementById('chatInput');
    const text = inputField.value.trim();
    if (!text) return;

    // Add User Message
    addMessage(text, 'user');
    inputField.value = '';

    // Simulate AI thinking delay
    setTimeout(() => {
        const response = generateAIResponse(text);
        addMessage(response, 'ai');
    }, 600);
}

function addMessage(text, sender) {
    const chatBody = document.getElementById('chatBody');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    chatBody.appendChild(msgDiv);

    // Auto scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

// --- INTENT MATCHING LOGIC ---
const intents = [
    {
        keywords: ['login', 'password', 'access', 'auth', 'sign in'],
        response: "To access the system, you must be an authorized officer (Satwik, Ganesh, Siva, or Jaswanth). Use the passcode 'admin'."
    },
    {
        keywords: ['feature', 'what can you do', 'capabilities', 'system'],
        response: "I am SmartSurveil AI. I can monitor 4 live feeds, auto-detect anomalies (Fire, Crowds, Intrusions), route alerts to authorities, and record event evidence in real-time."
    },
    {
        keywords: ['detect', 'ai', 'explain', 'how does it work', 'model', 'scan'],
        response: "I utilize Edge AI processing. A localized computer vision model scans each frame for anomalies without sending video feeds to external APIs. This ensures zero latency and high data privacy."
    },
    {
        keywords: ['emergency', 'sos', 'help', 'fire', 'intruder', 'police', 'medical'],
        response: "In an emergency, click the 'S.O.S' button, or use the Threat Simulation panel. I automatically route Fire to Medical/Fire depts, and Intrusion/Suspicious acts to Police & Security."
    },
    {
        keywords: ['api', 'tech', 'stack', 'edge', 'firebase', 'cloud'],
        response: "This dashboard strictly uses local AI simulation to prevent external API dependency. However, audit logs and video evidence are synchronized securely via Firebase Realtime Database and Storage."
    },
    {
        keywords: ['status', 'uptime', 'health', 'cameras', 'active'],
        response: () => {
            const upStr = document.getElementById('uptimeClock') ? document.getElementById('uptimeClock').textContent : 'Unknown';
            const cams = document.getElementById('activeCams') ? document.getElementById('activeCams').textContent : '0/0';
            const logCount = document.getElementById('totalAlerts') ? document.getElementById('totalAlerts').textContent : '0';
            return `System is ONLINE. Active Cameras: ${cams}. Current Uptime: ${upStr}. Total Critical Alerts: ${logCount}.`;
        }
    },
    {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: "Greetings Officer. System is operational. What parameters would you like to review?"
    },
    {
        keywords: ['clear', 'reset', 'delete logs'],
        response: "You can clear existing alerts or factory-reset the dashboard entirely using the System Actions buttons in the Control Panel."
    }
];

function generateAIResponse(inputText) {
    const lowerInput = inputText.toLowerCase();

    for (const intent of intents) {
        // If any keyword matches the input string
        if (intent.keywords.some(kw => lowerInput.includes(kw))) {
            return typeof intent.response === 'function' ? intent.response() : intent.response;
        }
    }

    // Default fallback
    return "I am processing your query. Please note, as an offline edge AI, my local parameters are defined around 'System Status', 'Login Help', 'AI Detection', and 'Emergency Handling'. Could you rephrase?";
}
