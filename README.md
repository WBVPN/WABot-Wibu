# 🤖 WIBU WA BOT - PTERODACTYL READY

![Version](https://img.shields.io/badge/Version-1.0_Premium-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Pterodactyl_|_VPS-brightgreen.svg)
![NodeJS](https://img.shields.io/badge/Node-v18+-orange.svg)

Script WhatsApp Bot Auto-Promosi & Broadcast berfitur canggih yang dirancang khusus untuk mempermudah *marketing* produk digital Anda secara otomatis 24 jam.

## 🚀 Fitur Unggulan

*   **🛡️ Anti-Banned Lapis Baja:** Dilengkapi sistem *delay* acak, status "sedang mengetik", dan injeksi spintax karakter gaib (*zero-width*) agar pesan broadcast tidak terdeteksi spam oleh WhatsApp.
*   **📢 Broadcast Berantai (`.bclist`):** Mampu mengirimkan teks promosi panjang, gambar, atau *file config* sekaligus ke puluhan grup target secara berturut-turut.
*   **🧹 Auto-Cleanup Grup:** Sistem pintar otomatis mendeteksi dan membersihkan grup dari daftar target apabila bot di-kick oleh admin.
*   **🔄 Auto-Backup Database:** Mengamankan semua file konfigurasi penting dengan mengirimkannya ke WhatsApp pribadi pemilik setiap 12 jam (bisa juga manual via `.backup`).
*   **🥷 Mode Siluman (Stealth):** Setiap mendaftarkan grup target baru (`.add`), bot akan otomatis menghapus pesan perintahnya sendiri agar tidak memancing kecurigaan admin grup.
*   **⏰ Jadwal & Auto-Loop:** Bisa mengirim promosi otomatis pada jam tertentu (misal 12:00) atau diulang secara periodik setiap sekian jam sekali.
*   **🤖 Auto-Respon Pintar:** Menyimpan balasan kustom (gambar/teks panjang) menggunakan `.addlist`, memudahkan pelayanan pelanggan secara cepat.
*   **👮 Satpam Grup:** Dilengkapi fitur tendang anggota (`.kick`), tutup/buka grup, dan perlindungan Anti-Spam / Anti-Forward untuk mengamankan grup bisnis Anda.

---

## 🛠️ Cara Install di Pterodactyl

1.  **Download Script:** Klik tombol hijau `Code` di atas, lalu pilih **Download ZIP**.
2.  **Upload ke Panel:** Buka panel Pterodactyl Anda, masuk ke tab **Files**.
3.  **Ekstrak File:** Upload file ZIP tersebut, klik titik tiga pada filenya, lalu pilih **Unarchive**.
4.  **Pindahkan File (PENTING):** Buka folder `WABot-Wibu-main` hasil ekstrak tadi, centang semua file di dalamnya, lalu pilih menu **Move** dan pindahkan ke `/` (direktori utama).
5.  **Jalankan Mesin:** Pergi ke tab **Console** dan klik tombol **START**.
6.  **Scan QR Code:** Tunggu 1-2 menit hingga proses instalasi (*npm install*) selesai. Sebuah **QR Code raksasa** akan muncul di layar hitam (Console).
7.  Buka aplikasi WhatsApp di HP Anda > **Perangkat Tertaut (Linked Devices)** > Scan QR Code tersebut.
8.  **Selesai!** Ketik `.menu` di WhatsApp Anda untuk mulai menggunakan bot.

## 🖥️ Cara Install di VPS (Ubuntu / Debian)

Jika Anda ingin menjalankan bot ini di VPS Anda sendiri secara 24 jam penuh tanpa panel Pterodactyl, **Cukup jalankan 1 Baris Perintah** di bawah ini melalui terminal SSH:

```bash
apt update && apt install -y curl && curl -sSL https://raw.githubusercontent.com/WBVPN/WABot-Wibu/main/install.sh | bash
```
*(Script ini akan menginstall Node.js, Bot, PM2, dan memunculkan QR Code secara otomatis).*
*(Tekan **CTRL + C** untuk keluar dari tampilan log jika sudah berhasil terhubung).*

---

## 🗑️ Cara Uninstall di VPS

Jika sewaktu-waktu Anda ingin menghapus bot beserta seluruh datanya dari VPS Anda, jalankan 1 Baris Perintah ini:

```bash
curl -sSL https://raw.githubusercontent.com/WBVPN/WABot-Wibu/main/uninstall.sh | bash
```

> *© 2026 - Dioptimalkan eksklusif untuk WibuVpnStore*
