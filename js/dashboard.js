// js/dashboard.js

let systemUptimeSeconds = 0;
let crowdSimInterval;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize System Clock
    startSystemClock();

    // 2. Initialize Camera Feeds
    initCameras();

    // 3. Start Crowd Simulation
    startCrowdSimulation();

    // 4. Load Initial Logs from Firebase
    initFirebaseLogs();
});

// --- SYSTEM CLOCK ---
function startSystemClock() {
    const clockEl = document.getElementById('uptimeClock');

    setInterval(() => {
        systemUptimeSeconds++;

        const hrs = Math.floor(systemUptimeSeconds / 3600);
        const mins = Math.floor((systemUptimeSeconds % 3600) / 60);
        const secs = systemUptimeSeconds % 60;

        clockEl.textContent =
            `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// --- CAMERAS ---
async function initCameras() {
    // Request Webcam for CAM 1
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const cam1 = document.getElementById('cam1_feed');
        if (cam1) {
            cam1.srcObject = stream;
        }
    } catch (err) {
        console.error("Webcam access denied or unavailable:", err);
        // Fallback or leave blank with error
        const cam1Container = document.getElementById('cam1_container');
        if (cam1Container) {
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '50%';
            overlay.style.left = '50%';
            overlay.style.transform = 'translate(-50%, -50%)';
            overlay.style.color = 'var(--accent-red)';
            overlay.innerHTML = '<i class="fa-solid fa-video-slash fa-2x"></i><br>NO SIGNAL';
            overlay.style.textAlign = 'center';
            cam1Container.appendChild(overlay);
        }
    }
}

// --- CROWD SIMULATION ---
function startCrowdSimulation() {
    // Update every 2.5 seconds
    crowdSimInterval = setInterval(() => {
        // Base numbers
        const cam1Count = Math.floor(Math.random() * 8) + 2; // 2-9
        const cam2Count = Math.floor(Math.random() * 4);      // 0-3
        const cam3Count = Math.floor(Math.random() * 15) + 5; // 5-19
        const cam4Count = Math.floor(Math.random() * 6);      // 0-5

        updateCrowdCount('cam1_crowd', cam1Count);
        updateCrowdCount('cam2_crowd', cam2Count);
        updateCrowdCount('cam3_crowd', cam3Count);
        updateCrowdCount('cam4_crowd', cam4Count);
    }, 2500);
}

function updateCrowdCount(elementId, count) {
    const el = document.getElementById(elementId);
    if (el) {
        // Add a little pop effect when it changes
        if (el.textContent !== count.toString()) {
            el.textContent = count;
            el.style.color = '#fff';
            setTimeout(() => el.style.color = '', 300);
        }
    }
}

// --- LOGS RENDERING (FIREBASE) ---
function initFirebaseLogs() {
    // Query last 50 logs sorted by timestamp
    const logsRef = firebase.database().ref('logs').orderByChild('timestamp').limitToLast(50);

    logsRef.on('value', (snapshot) => {
        const logsBody = document.getElementById('logsTableBody');
        if (!logsBody) return;

        logsBody.innerHTML = '';

        const logs = [];
        snapshot.forEach((childSnapshot) => {
            logs.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });

        // Reverse array to show newest first
        logs.reverse();

        // Update total alerts counter (only critical/warning)
        const totalAlertsEl = document.getElementById('totalAlerts');
        const alertCount = logs.filter(l => l.severity === 'critical' || l.severity === 'warning').length;
        if (totalAlertsEl) totalAlertsEl.textContent = alertCount;

        if (logs.length === 0) {
            logsBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted)">No events logged. System is operating normally.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement('tr');

            let badgeClass = 'badge-info';
            if (log.severity === 'critical') badgeClass = 'badge-critical';
            if (log.severity === 'warning') badgeClass = 'badge-warning';

            let actionCell = '<span style="color:var(--text-muted)">Logged</span>';
            if (log.evidenceUrl) {
                actionCell = `<a href="${log.evidenceUrl}" target="_blank" style="color:var(--accent-blue); text-decoration:none;"><i class="fa-solid fa-cloud-arrow-down"></i> View Clip</a>`;
            }

            tr.innerHTML = `
                <td>${log.time || ''}</td>
                <td><strong>${log.type || ''}</strong></td>
                <td>${log.location || ''}</td>
                <td><span class="badge ${badgeClass}">${(log.severity || '').toUpperCase()}</span></td>
                <td>${actionCell}</td>
            `;
            logsBody.appendChild(tr);
        });
    });
}

function clearLogs() {
    if (confirm("Are you sure you want to clear system logs from Firebase?")) {
        // Clear Firebase logs
        firebase.database().ref('logs').remove();
    }
}

function clearAlerts() {
    // Reset any active UI alerts
    document.querySelectorAll('.camera-container').forEach(c => {
        c.classList.remove('alert');
        c.classList.remove('scanning');
        const alertLabel = c.querySelector('.detection-label');
        if (alertLabel) alertLabel.classList.remove('show');
        const targetBox = c.querySelector('.target-box');
        if (targetBox) targetBox.style.display = 'none';
    });

    // Reset routing UI
    document.querySelectorAll('.dest').forEach(d => {
        d.className = 'dest glass-panel';
    });
    document.querySelector('.route-lines').classList.remove('active');
}

function resetDashboard() {
    if (confirm("WARNING: This will erase all system logs and reset the session. Continue?")) {
        firebase.database().ref('logs').remove().then(() => {
            window.location.reload();
        });
    }
}
