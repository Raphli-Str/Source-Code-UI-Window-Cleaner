// ==========================================
// 1. INISIALISASI VARIABEL & TOPIK
// ==========================================
const btnConnect = document.getElementById('btnConnect');
const inputIp = document.getElementById('brokerIp');
const statusIndicator = document.getElementById('statusIndicator');
const logTerminal = document.getElementById('logTerminal');
const cameraStream = document.getElementById('cameraStream'); 

const TOPIK_AKSI = 'vplotter/action/cmd';
const TOPIK_NAV  = 'vplotter/nav/cmd';

function tulisLog(pesan) {
    const waktu = new Date().toLocaleTimeString('id-ID');
    logTerminal.value += `> ${waktu} - ${pesan}\n`;
    logTerminal.scrollTop = logTerminal.scrollHeight;
}

tulisLog("System Ready");

// ==========================================
// 2. KONEKSI BROKER & KAMERA (FITUR SINKRONISASI)
// ==========================================
btnConnect.addEventListener('click', () => {
    const ipBroker = inputIp.value.trim();
    const ipEspCam = "10.164.252.14"; 
    
    if (ipBroker !== "") {
        window.api.connectMqtt(ipBroker);
        // Memuat video dari Port 81
        cameraStream.src = `http://${ipEspCam}:81/stream`;
        tulisLog(`[VIDEO] Memuat live video dari ESP32-CAM...`);
    } else {
        alert("Harap masukkan IP Address Broker!");
    }
});

window.api.onMqttStatus((status) => {
    if (status === 'connected') {
        statusIndicator.textContent = 'CONNECTED';
        statusIndicator.className = 'connected';
        
        // --- SINKRONISASI OTOMATIS SAAT TERHUBUNG ---
        const initSpeed = document.getElementById('motorSpeedSlider').value;
        window.api.sendMqttCmd(TOPIK_NAV, `NAV_SPEED:${initSpeed}`);
        
        const initVacSpeed = document.getElementById('vacuumSpeedSlider').value;
        window.api.sendMqttCmd(TOPIK_AKSI, `VACUUM_SPEED:${initVacSpeed}`);
        
        const initCleanerSpeed = document.getElementById('slider-cleaner').value;
        window.api.sendMqttCmd(TOPIK_AKSI, `M1_SPEED:${initCleanerSpeed}`);

        tulisLog("[SISTEM] Sinkronisasi otomatis nilai slider berhasil dikirim!");
    } else {
        statusIndicator.textContent = 'DISCONNECTED';
        statusIndicator.className = 'disconnected';
        cameraStream.src = ""; 
    }
});

window.api.onMqttLog((pesan) => { tulisLog(pesan); });

// ==========================================
// 3. NODE AKSI (POMPA & VAKUM)
// ==========================================
let isPumpActive = false;
let isVacuumOn = false;
const btnTogglePump = document.getElementById('btnTogglePump');
const btnToggleVacuum = document.getElementById('btnToggleVacuum'); 
const vacuumSpeedSlider = document.getElementById('vacuumSpeedSlider');
const vacuumSpeedValue = document.getElementById('vacuumSpeedValue');

if (vacuumSpeedSlider) {
    vacuumSpeedSlider.addEventListener('input', () => {
        vacuumSpeedValue.textContent = vacuumSpeedSlider.value;
        if (isVacuumOn) {
            window.api.sendMqttCmd(TOPIK_AKSI, `VACUUM_SPEED:${vacuumSpeedSlider.value}`);
        }
    });
}

function pompaOn() {
    if (isPumpActive) return; 
    isPumpActive = true;
    
    if(btnTogglePump) {
        btnTogglePump.style.backgroundColor = "#4CAF50";
        btnTogglePump.style.borderColor = "#fff";
    }
    const pumpStatusTop = document.getElementById('pumpStatusTop');
    if(pumpStatusTop) {
        pumpStatusTop.textContent = "ON";
        pumpStatusTop.style.color = "#4CAF50"; 
    }

    window.api.sendMqttCmd(TOPIK_AKSI, "PUMP_ON");
    tulisLog(`[AKSI] -> PUMP_ON`);
}

function pompaOff() {
    if (!isPumpActive) return; 
    isPumpActive = false;
    
    if(btnTogglePump) {
        btnTogglePump.style.backgroundColor = "#f44336";
        btnTogglePump.style.borderColor = "";
    }
    const pumpStatusTop = document.getElementById('pumpStatusTop');
    if(pumpStatusTop) {
        pumpStatusTop.textContent = "OFF";
        pumpStatusTop.style.color = "#ff4444"; 
    }

    window.api.sendMqttCmd(TOPIK_AKSI, "PUMP_OFF");
    tulisLog(`[AKSI] -> PUMP_OFF`);
}

function eksekusiVakum() {
    isVacuumOn = !isVacuumOn; 
    
    if(btnToggleVacuum) {
        btnToggleVacuum.textContent = isVacuumOn ? "(*) VAKUM [X]" : "( ) VAKUM [X]";
        btnToggleVacuum.style.backgroundColor = isVacuumOn ? "#4CAF50" : "#f44336"; 
    }
    
    const vacuumStatusTop = document.getElementById('vacuumStatusTop');
    if(vacuumStatusTop) {
        vacuumStatusTop.textContent = isVacuumOn ? "ON" : "OFF";
        vacuumStatusTop.style.color = isVacuumOn ? "#4CAF50" : "#ff4444"; 
    }

    let perintah = isVacuumOn ? `VACUUM_SPEED:${vacuumSpeedSlider.value}` : "VACUUM_OFF";
    window.api.sendMqttCmd(TOPIK_AKSI, perintah);
    let logMessage = isVacuumOn ? "VACUUM_ON" : "VACUUM_OFF";
    tulisLog(`[AKSI] -> ${logMessage}`);
}

// Listener Mouse untuk Pompa
if (btnTogglePump) {
    btnTogglePump.addEventListener('mousedown', pompaOn);
    btnTogglePump.addEventListener('mouseup', pompaOff);
    btnTogglePump.addEventListener('mouseleave', pompaOff);
}
// Listener Mouse untuk Vakum
if (btnToggleVacuum) btnToggleVacuum.addEventListener('click', eksekusiVakum);


// ==========================================
// 4. NODE NAVIGASI & SLIDER MOTOR DC
// ==========================================
const motorSpeedSlider = document.getElementById('motorSpeedSlider');
const motorSpeedValue = document.getElementById('motorSpeedValue');

if (motorSpeedSlider) {
    motorSpeedSlider.addEventListener('input', () => {
        motorSpeedValue.textContent = motorSpeedSlider.value;
        window.api.sendMqttCmd(TOPIK_NAV, `NAV_SPEED:${motorSpeedSlider.value}`);
    });
}

document.getElementById('btnUp').addEventListener('click', () => eksekusiNav("UP"));
document.getElementById('btnDown').addEventListener('click', () => eksekusiNav("DOWN"));
document.getElementById('btnLeft').addEventListener('click', () => eksekusiNav("LEFT"));
document.getElementById('btnRight').addEventListener('click', () => eksekusiNav("RIGHT"));

function eksekusiStop() {
    window.api.sendMqttCmd(TOPIK_NAV, "STOP"); 
    tulisLog("[NAV] -> STOP"); 
}
document.getElementById('btnStop').addEventListener('click', eksekusiStop);

function eksekusiNav(arah) {
    window.api.sendMqttCmd(TOPIK_NAV, arah);
    tulisLog(`[NAV] -> ${arah}`);
}


// ==========================================
// 5. KONTROL KEYBOARD
// ==========================================
window.addEventListener('keydown', (event) => {
    if (document.activeElement.tagName === 'INPUT') return; 
    if (event.code === 'Space' || event.key.startsWith('Arrow')) event.preventDefault(); 

    const key = event.key.toUpperCase();
    if (event.code === 'Space' || key === 'ESCAPE') {
        eksekusiStop();
        highlightButton('btnStop');
        return; 
    }

    switch (key) {
        // --- Navigasi Utama ---
        case 'ARROWUP': case 'W': eksekusiNav("UP"); highlightButton('btnUp'); break;
        case 'ARROWDOWN': case 'S': eksekusiNav("DOWN"); highlightButton('btnDown'); break;
        case 'ARROWLEFT': case 'A': eksekusiNav("LEFT"); highlightButton('btnLeft'); break;
        case 'ARROWRIGHT': case 'D': eksekusiNav("RIGHT"); highlightButton('btnRight'); break;
        
        // --- Aksi Pembersih ---
        case 'Z': 
            if (!event.repeat) pompaOn(); // highlightButton dihapus agar tidak merusak warna Hijau/Merah
            break;
        case 'X': 
            eksekusiVakum(); 
            break;
        case 'C': 
            eksekusiCleaner(); // Tombol shortcut baru untuk sikat
            break;

        // --- Manual Motor (Tarik/Ulur) ---
        case 'U': manualMotor("ML_CCW"); highlightButton('btnMLCCW'); break; 
        case 'I': manualMotor("ML_CW"); highlightButton('btnMLCW'); break;   
        case 'O': manualMotor("MR_CW"); highlightButton('btnMRCW'); break;   
        case 'P': manualMotor("MR_CCW"); highlightButton('btnMRCCW'); break; 
    }
});

// Deteksi saat tombol Z dilepas untuk Pompa
window.addEventListener('keyup', (event) => {
    if (document.activeElement.tagName === 'INPUT') return; 

    const key = event.key.toUpperCase();
    if (key === 'Z') {
        pompaOff();
    }
});

function highlightButton(id) {
    const btn = document.getElementById(id);
    if (btn) {
        btn.style.backgroundColor = "#555";
        btn.style.borderColor = "#4fc1ff";
        setTimeout(() => { btn.style.backgroundColor = ""; btn.style.borderColor = ""; }, 150);
    }
}


// ==========================================
// 6. KONTROL MANUAL MOTOR INDIVIDUAL
// ==========================================
const btnMLCW = document.getElementById('btnMLCW');
const btnMLCCW = document.getElementById('btnMLCCW');
const btnMRCW = document.getElementById('btnMRCW');
const btnMRCCW = document.getElementById('btnMRCCW');

function manualMotor(perintah) {
    window.api.sendMqttCmd(TOPIK_NAV, perintah);
    tulisLog(`[MANUAL] -> ${perintah}`);
}

if(btnMLCW) btnMLCW.addEventListener('click', () => manualMotor("ML_CW"));
if(btnMLCCW) btnMLCCW.addEventListener('click', () => manualMotor("ML_CCW"));
if(btnMRCW) btnMRCW.addEventListener('click', () => manualMotor("MR_CW"));
if(btnMRCCW) btnMRCCW.addEventListener('click', () => manualMotor("MR_CCW"));


// ==========================================
// 7. KONTROL MOTOR SIKAT PEMBERSIH (ESP32-CAM)
// ==========================================
let isCleanerOn = false;
const btnCleaner = document.getElementById('btn-cleaner');
const sliderCleaner = document.getElementById('slider-cleaner');
const labelCleanerSpeed = document.getElementById('label-cleaner-speed');

// FUNGSI SIKAT: DIPISAH AGAR BISA DIPANGGIL KEYBOARD "C"
function eksekusiCleaner() {
    isCleanerOn = !isCleanerOn;
    
    const cleanerStatusTop = document.getElementById('cleanerStatusTop');
    
    if (isCleanerOn) {
        if(btnCleaner) {
            btnCleaner.textContent = '(*) SIKAT: ON';
            btnCleaner.style.backgroundColor = '#4CAF50'; 
        }
        if(cleanerStatusTop) {
            cleanerStatusTop.textContent = 'ON';
            cleanerStatusTop.style.color = '#4CAF50';
        }
        
        window.api.sendMqttCmd(TOPIK_AKSI, 'M1_FWD'); // Perintah asli MQTT
        tulisLog('[AKSI] -> BRUSH_ON');                 // Tampilan baru di Log
    } else {
        if(btnCleaner) {
            btnCleaner.textContent = '( ) SIKAT: OFF';
            btnCleaner.style.backgroundColor = '#f44336'; 
        }
        if(cleanerStatusTop) {
            cleanerStatusTop.textContent = 'OFF';
            cleanerStatusTop.style.color = '#ff4444';
        }
        
        window.api.sendMqttCmd(TOPIK_AKSI, 'M1_STOP'); // Perintah asli MQTT
        tulisLog('[AKSI] -> BRUSH_OFF');                // Tampilan baru di Log
    }
}

if (btnCleaner) {
    btnCleaner.addEventListener('click', eksekusiCleaner);
}

if (sliderCleaner) {
    sliderCleaner.addEventListener('input', (event) => {
        const speed = event.target.value;
        labelCleanerSpeed.textContent = speed;
        window.api.sendMqttCmd(TOPIK_AKSI, `M1_SPEED:${speed}`);
    });
}