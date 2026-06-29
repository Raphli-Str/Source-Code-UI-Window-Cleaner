# Window Cleaner V-Plotter - User Interface Dashboard (Kelompok 11)

Aplikasi *Mission Control Dashboard* berbasis **Electron.js** dan **MQTT** untuk mengendalikan Robot Pembersih Kaca Gedung Bertingkat (*Window Cleaner V-Plotter*) secara nirkabel dan *real-time*. Aplikasi ini mengintegrasikan kontrol navigasi pergerakan mekanik, aktivasi alat pembersih (vakum, sikat, pompa), serta pemantauan visual langsung melalui *live video streaming*.

---

## 🚀 Fitur Utama

* **Kendali MQTT Nirkabel:** Pengiriman perintah gerak dan aksi dengan latensi ultra-rendah (<10ms) melalui protokol MQTT di jaringan lokal.
* **Live Video Streaming (POV):** Tampilan video langsung dari kamera robot (ESP32-CAM) langsung terintegrasi pada antarmuka *dashboard* untuk memantau area kerja secara *real-time* dan menghindari *blind spot*.
* **Dual-Mode Control:** Dukungan penuh pemrosesan paralel; mengontrol posisi robot dan alat pembersih secara simultan menggunakan pintasan keyboard.
* **Logika Aktuator Efisien:** * *Hold-to-Spray* (Tombol Z): Pompa air hanya menyemprot saat tombol ditahan untuk menghemat cairan.
    * *Toggle Control* (Tombol X & C): Aktivasi vakum dan sikat mekanik cukup dengan sekali tekan (ON/OFF).
* **Terminal Log Sistem:** Pemantauan status koneksi, pembacaan data umpan balik, dan aktivitas robot secara langsung dari antarmuka.

---

## 📋 Persyaratan Sistem (Prerequisites)

Sebelum menjalankan aplikasi di lingkungan lokal, pastikan perangkat Anda telah memenuhi spesifikasi berikut:

1.  **Node.js & npm:** Pastikan Node.js (versi 16 ke atas direkomendasikan) sudah terinstal. Cek dengan perintah:
    ```bash
    node -v
    npm -v
    ```
2.  **MQTT Broker:** Dibutuhkan broker lokal seperti **Eclipse Mosquitto** atau broker berbasis Node.js seperti **Aedes** yang berjalan di latar belakang.
3.  **Jaringan Wi-Fi Lokal:** Laptop dan perangkat keras robot (ESP32 & ESP32-CAM) harus berada dalam satu jaringan lokal (LAN/Hotspot) yang sama.
4.  **Konektivitas Port:** Pastikan firewall mengizinkan lalu lintas data pada **Port 1883** (MQTT) dan **Port 81** (HTTP Video Stream).

---

## ⚙️ Panduan Instalasi Lokal (Setup Guide)

Ikuti langkah-langkah berikut secara berurutan untuk memasang dan menjalankan proyek di laptop Anda:

### 1. Kloning Repositori
Unduh atau kloning repositori ini ke penyimpanan lokal Anda:
```bash
git clone [https://github.com/Raphli-Str/Source-Code-UI-Window-Cleaner.git](https://github.com/Raphli-Str/Source-Code-UI-Window-Cleaner.git)
cd Source-Code-UI-Window-Cleaner