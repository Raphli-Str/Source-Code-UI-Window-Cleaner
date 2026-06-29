const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Arah: UI (Renderer) mengirim perintah ke Backend (Main)
    connectMqtt: (ip) => ipcRenderer.send('connect-mqtt', ip),
    sendMqttCmd: (topic, message) => ipcRenderer.send('send-mqtt-cmd', { topic, message }),
    
    // Arah: Backend (Main) mengirim data/log kembali ke UI (Renderer)
    onMqttStatus: (callback) => ipcRenderer.on('mqtt-status', (event, value) => callback(value)),
    onMqttLog: (callback) => ipcRenderer.on('mqtt-log', (event, value) => callback(value))
});