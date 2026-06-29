const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mqtt = require('mqtt');
const net = require('net');

// ==========================================
// 1. INISIALISASI BROKER MQTT LOKAL (AEDES v1.0+)
// ==========================================
// KUNCI UTAMA: Menggunakan kurung kurawal untuk mengekstrak class 'Aedes'
const { Aedes } = require('aedes');

let mainWindow;
let mqttClient = null;

async function startSystem() {
    try {
        const aedes = await Aedes.createBroker();
        const brokerServer = net.createServer(aedes.handle);
        const MQTT_PORT = 1883;

        brokerServer.listen(MQTT_PORT, function () {
            console.log(`[BROKER] MQTT Server lokal sukses berjalan di port ${MQTT_PORT}`);
        });

        aedes.on('client', function (client) {
            console.log(`[BROKER] Klien Terhubung: ${client ? client.id : 'Unknown'}`);
        });

        aedes.on('clientDisconnect', function (client) {
            console.log(`[BROKER] Klien Terputus: ${client ? client.id : 'Unknown'}`);
        });

    } catch (error) {
        console.error("[BROKER] Gagal menjalankan peladen lokal:", error);
    }

    // ==========================================
    // 2. PEMBUATAN JENDELA APLIKASI (UI)
    // ==========================================
    // UI baru dimuat setelah Broker di atas 100% siap
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    mainWindow.loadFile('index.html');
}

// Menjalankan fungsi startSystem saat Electron sudah siap
app.whenReady().then(startSystem);

// ==========================================
// 3. KENDALI KONEKSI MQTT (DARI UI KE BROKER)
// ==========================================
ipcMain.on('connect-mqtt', (event, brokerIp) => {
    if (mqttClient) {
        mqttClient.end();
    }

    let brokerUrl = brokerIp;
    if (!brokerUrl.startsWith('mqtt://')) {
        brokerUrl = `mqtt://${brokerIp}:1883`;
    }

    mainWindow.webContents.send('mqtt-log', `[SISTEM] Menghubungi: ${brokerUrl}`);
    mqttClient = mqtt.connect(brokerUrl);

    mqttClient.on('connect', () => {
        mainWindow.webContents.send('mqtt-status', 'connected');
        mainWindow.webContents.send('mqtt-log', '[SISTEM] SUKSES! Terhubung ke Broker lokal.');
    });

    mqttClient.on('error', (err) => {
        mainWindow.webContents.send('mqtt-status', 'disconnected');
        mainWindow.webContents.send('mqtt-log', `[ERROR] Koneksi gagal: ${err.message}`);
    });

    mqttClient.on('close', () => {
        mainWindow.webContents.send('mqtt-status', 'disconnected');
    });
});

// ==========================================
// 4. KENDALI PENGIRIMAN PESAN (PUBLISH)
// ==========================================
ipcMain.on('send-mqtt-cmd', (event, { topic, message }) => {
    if (mqttClient && mqttClient.connected) {
        const payload = typeof message === 'string' ? message : JSON.stringify(message);
        mqttClient.publish(topic, payload);
    } else {
        mainWindow.webContents.send('mqtt-log', '[ERROR] Pesan gagal dikirim: Broker terputus.');
    }
});