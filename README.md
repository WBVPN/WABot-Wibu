<div align="center">
  <img src="https://img.shields.io/badge/WIBU_VPN_STORE-BOT_WA-blue?style=for-the-badge&logo=whatsapp&color=25D366" alt="Wibu WA Bot"/>
  <br/>
  <h1>🤖 WIBU WA BOT - PREMIUM AUTOMATION</h1>
  <p><strong>Pterodactyl & VPS Ready | Auto-Promosi | Broadcast Berantai</strong></p>
  
  <p>
    <a href="#"><img src="https://img.shields.io/badge/Version-1.0_Premium-blue.svg?style=flat-square" alt="Version"></a>
    <a href="#"><img src="https://img.shields.io/badge/Platform-Pterodactyl_|_VPS-brightgreen.svg?style=flat-square" alt="Platform"></a>
    <a href="#"><img src="https://img.shields.io/badge/Node-v18+-orange.svg?style=flat-square" alt="NodeJS"></a>
    <a href="#"><img src="https://img.shields.io/badge/Maintained-Yes-success.svg?style=flat-square" alt="Maintained"></a>
  </p>
</div>

---

<p align="center">
  Script WhatsApp Bot Auto-Promosi & Broadcast berfitur canggih yang dirancang khusus untuk mempermudah <b>marketing produk digital Anda secara otomatis 24 jam</b> tanpa henti.
</p>

---

## 🚀 Fitur Unggulan

| Fitur | Deskripsi |
|-------|-----------|
| **🛡️ Anti-Banned Lapis Baja** | Sistem *delay* acak, status "sedang mengetik", dan spintax karakter gaib (*zero-width*) agar tidak terdeteksi spam. |
| **📢 Broadcast Berantai (`.bclist`)** | Kirim teks promosi panjang, gambar, atau *file config* ke puluhan grup target secara berturut-turut otomatis. |
| **🧹 Auto-Cleanup Grup** | Deteksi otomatis dan pembersihan grup dari daftar target apabila bot di-kick oleh admin grup. |
| **🔄 Auto-Backup Database** | Mengamankan file konfigurasi penting ke WA pribadi pemilik setiap 12 jam (atau manual via `.backup`). |
| **🥷 Mode Siluman (Stealth)** | Saat daftar grup target baru (`.add`), bot akan menghapus pesan perintah agar tak mencurigakan admin. |
| **⏰ Jadwal & Auto-Loop** | Kirim promosi otomatis pada jam tertentu (misal 12:00) atau diulang secara periodik setiap sekian jam sekali. |
| **🤖 Auto-Respon Pintar** | Simpan balasan kustom (gambar/teks panjang) via `.addlist`, memudahkan pelayanan pelanggan secara cepat. |
| **👮 Satpam Grup** | Fitur tendang anggota (`.kick`), tutup/buka grup, perlindungan Anti-Spam / Anti-Forward untuk grup bisnis. |
| **📱 Auto-Kirim QR ke Telegram** | Tidak perlu pantau *console* Pterodactyl! QR Code login akan langsung meluncur ke chat Telegram Anda! |

---

## 🔑 Konfigurasi Auto-QR ke Telegram (Wajib)

Agar gambar QR Code langsung terkirim ke Telegram Anda saat instalasi, Anda **wajib** mengubah Token dan ID Telegram di dalam file `index.js` **sebelum** bot dijalankan.

1. Buka file `index.js`.
2. Cari kode di **Baris ke-120** (bagian `// Kirim ke Telegram`), tampilannya seperti ini:
   ```javascript
   const token = "ISI_TOKEN_BOT_TELEGRAM_DISINI"; // <-- GANTI DENGAN TOKEN BOT ANDA
   const chatId = "ISI_CHAT_ID_TELEGRAM_DISINI"; // <-- GANTI DENGAN CHAT ID ANDA
   ```
3. Ganti kedua nilai tersebut dengan Token Bot Telegram dan Chat ID Anda sendiri.
4. Klik **Save**.

---

## 🛠️ Cara Install di Pterodactyl

1. **Download Script:** Klik tombol hijau `<> Code` di atas, lalu pilih **Download ZIP**.
2. **Upload ke Panel:** Buka panel Pterodactyl Anda, masuk ke tab **Files**.
3. **Ekstrak File:** Upload file ZIP tersebut, klik titik tiga pada filenya, lalu pilih **Unarchive**.
4. **Pindahkan File (PENTING):** Masuk ke folder `WABot-Wibu-main` hasil ekstrak, centang semua file, lalu klik menu **Move** dan pindahkan ke `/` (direktori utama).
5. **Jalankan Mesin:** Pergi ke tab **Console** dan klik tombol **START**.
6. **Scan QR Code:** 
   - Jika konfigurasi Telegram benar, cek chat Telegram Anda untuk scan QR Code.
   - Atau tunggu di *Console* hingga QR Code raksasa muncul.
7. Buka aplikasi WhatsApp di HP > **Perangkat Tertaut (Linked Devices)** > Scan QR Code.
8. **Selesai!** Ketik `.menu` di WhatsApp Anda untuk mulai.

---

## 🖥️ Cara Install di VPS (Ubuntu / Debian)

Jika Anda ingin menjalankan bot ini di VPS Anda sendiri secara 24 jam penuh tanpa panel Pterodactyl, **cukup jalankan 1 Baris Perintah** di bawah ini melalui terminal SSH:

```bash
apt update && apt install -y curl && curl -sSL https://raw.githubusercontent.com/WBVPN/WABot-Wibu/main/install.sh | bash
```
> 💡 *Script ini akan menginstall Node.js, Bot, PM2, dan memunculkan QR Code secara otomatis.*  
> 💡 *(Tekan **CTRL + C** untuk keluar dari tampilan log jika sudah berhasil terhubung).*

---

## 🗑️ Cara Uninstall di VPS

Jika sewaktu-waktu Anda ingin menghapus bot beserta seluruh datanya dari VPS Anda, jalankan 1 Baris Perintah ini:

```bash
curl -sSL https://raw.githubusercontent.com/WBVPN/WABot-Wibu/main/uninstall.sh | bash
```

<br/>

<div align="center">
  <sub>© 2026 - Dioptimalkan eksklusif untuk <b>WibuVpnStore</b></sub>
</div>
