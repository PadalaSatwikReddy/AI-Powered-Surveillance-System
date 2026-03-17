// js/event-system.js

const CAMERAS = ['cam1', 'cam2', 'cam3', 'cam4'];
let autoAiInterval;

document.addEventListener('DOMContentLoaded', () => {
    // Listen for Auto AI Switch
    const aiToggle = document.getElementById('aiModeToggle');
    if (aiToggle) {
        aiToggle.addEventListener('change', (e) => {
            const labelManual = document.getElementById('label-manual');
            const labelAuto = document.getElementById('label-auto');
            const modeDesc = document.getElementById('modeDesc');

            if (e.target.checked) {
                // Auto Mode ON
                labelManual.classList.remove('active');
                labelAuto.classList.add('active');
                modeDesc.textContent = "System actively scanning anomalies every 8-12s.";
                document.querySelectorAll('.btn-sim').forEach(b => b.disabled = true);
                startAutoAI();
            } else {
                // Manual Mode ON
                labelAuto.classList.remove('active');
                labelManual.classList.add('active');
                modeDesc.textContent = "Manual trigger via controls below.";
                document.querySelectorAll('.btn-sim').forEach(b => b.disabled = false);
                stopAutoAI();
            }
        });
    }
});

// --- CORE EVENT TRIGGER ---
function triggerEvent(eventType, forcedCamNum = null) {
    // 1. Pick a camera
    let camNum = forcedCamNum;
    if (!camNum) {
        camNum = Math.floor(Math.random() * 4) + 1; // 1-4
    }
    const camId = `cam${camNum}`;

    // 2. Play Sound
    playAlertSound(eventType);

    // 3. Update Camera UI
    const camContainer = document.getElementById(`${camId}_container`);
    if (camContainer) {
        camContainer.classList.add('alert');
        camContainer.classList.add('scanning');

        const alertLabel = document.getElementById(`${camId}_alert`);
        alertLabel.textContent = `DETECTED: ${eventType.replace('_', ' ')}`;
        alertLabel.classList.add('show');

        // Randomize target box position slightly
        const targetBox = document.getElementById(`${camId}_target`);
        targetBox.style.display = 'block';
        targetBox.style.width = Math.floor(Math.random() * 100 + 50) + 'px';
        targetBox.style.height = Math.floor(Math.random() * 100 + 50) + 'px';
        targetBox.style.top = Math.floor(Math.random() * 60 + 10) + '%';
        targetBox.style.left = Math.floor(Math.random() * 60 + 10) + '%';

        // Auto-clear UI after 6 seconds
        setTimeout(() => {
            camContainer.classList.remove('alert');
            camContainer.classList.remove('scanning');
            alertLabel.classList.remove('show');
            targetBox.style.display = 'none';
        }, 6000);
    }

    // 4. Smart Routing
    routeAlert(eventType);

    // 5. Database Logging & Evidence Simulation
    simulateEvidenceRecording(eventType, camId);
}

// --- SMART ROUTING ---
function routeAlert(eventType) {
    // Reset visual routes first
    document.querySelectorAll('.dest').forEach(d => d.className = 'dest glass-panel');
    document.querySelector('.route-lines').classList.add('active');

    const security = document.getElementById('dest-security');
    const police = document.getElementById('dest-police');
    const medical = document.getElementById('dest-medical');

    let severity = 'warning';

    // Routing Logic based on user requirements
    setTimeout(() => {
        switch (eventType) {
            case 'FIRE':
                medical.classList.add('routed-medical');
                severity = 'critical';
                break;
            case 'OVERCROWDING':
                security.classList.add('routed-security');
                severity = 'warning';
                break;
            case 'INTRUSION':
                police.classList.add('routed-police');
                severity = 'critical';
                break;
            case 'SUSPICIOUS_ACTIVITY':
                security.classList.add('routed-security');
                police.classList.add('routed-police');
                severity = 'warning';
                break;
            case 'EMERGENCY_SOS':
                security.classList.add('routed-security');
                police.classList.add('routed-police');
                medical.classList.add('routed-medical');
                severity = 'critical';
                break;
        }

        // Stop animation line after route established
        setTimeout(() => {
            const line = document.querySelector('.route-lines');
            if (line) line.classList.remove('active');
        }, 1500);

    }, 500); // 500ms processing delay logic simulation

    return severity;
}

// --- EVIDENCE RECORDING / LOGGING SIMULATION ---
function simulateEvidenceRecording(eventType, camId) {
    let severity = 'warning';
    if (['FIRE', 'INTRUSION', 'EMERGENCY_SOS'].includes(eventType)) severity = 'critical';

    // 1. Initial Log to Firebase
    const newLogRef = firebase.database().ref('logs').push();

    newLogRef.set({
        time: new Date().toLocaleTimeString(),
        type: eventType.replace('_', ' '),
        location: camId.toUpperCase(),
        severity: severity,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    // 2. Simulate 4s Firebase Storage Upload Wait
    setTimeout(() => {
        newLogRef.update({
            // "Uploaded" link simulation (using dummy video link for demo)
            evidenceUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        });
    }, 4000);
}

// --- SOUND SYSTEM ---
function playAlertSound(eventType) {
    let audioEl;
    if (['FIRE', 'INTRUSION', 'EMERGENCY_SOS'].includes(eventType)) {
        audioEl = document.getElementById('sirenSound');
    } else {
        audioEl = document.getElementById('alertSound');
    }

    if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(e => console.log("Audio autoplay prevented"));
    }
}

// --- AUTO AI MODE ---
function startAutoAI() {
    const events = ['FIRE', 'OVERCROWDING', 'INTRUSION', 'SUSPICIOUS_ACTIVITY'];

    function scheduleNext() {
        // Random interval between 8 and 12 seconds
        const delay = Math.floor(Math.random() * 4000) + 8000;
        autoAiInterval = setTimeout(() => {
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            triggerEvent(randomEvent);
            scheduleNext();
        }, delay);
    }

    scheduleNext();
}

function stopAutoAI() {
    clearTimeout(autoAiInterval);
}

// --- EMERGENCY BUTTON ---
function triggerEmergency() {
    const btn = document.getElementById('emergencyBtn');
    btn.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> <span>SENDING</span>';

    const audio = document.getElementById('sosSound');
    if (audio) audio.play().catch(e => console.log(e));

    // Trigger SOS event on all cameras visually
    CAMERAS.forEach((cam, i) => {
        setTimeout(() => triggerEvent('EMERGENCY_SOS', i + 1), i * 200);
    });

    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-phone-volume"></i> <span>S.O.S</span>';
    }, 3000);
}
