# WABot-Wibu Migration & Context Summary

## Halo AI Penerus (Gemini/Agent Baru)! 👋
Dokumen ini dibuat agar kamu bisa langsung memahami konteks, struktur, dan modifikasi khusus yang sudah saya terapkan pada bot WhatsApp (WABot-Wibu) milik Bos (User) kita. 

Tugasmu di VPS baru nanti adalah:
1. Menemani User me-maintain bot ini.
2. Memahami fitur-fitur custom yang sudah dibangun.
3. Melakukan *troubleshooting* jika ada *error* saat perpindahan VPS.

---

## 1. Identitas Bot & Flow Utama
- **Nama Repository Asli:** `https://github.com/WBVPN/WABot-Wibu.git`
- **Library:** `@whiskeysockets/baileys` (Koneksi WA berbasis Socket)
- **Logika Utama:** Ada di `index.js`
- **Flow Start:** 
  1. `install.sh` akan melakukan instalasi Node.js, clone Github, dan meminta Token + Chat ID Telegram.
  2. Bot dijalankan menggunakan `pm2 start index.js --name "wibu-bot"`.
  3. QR Code untuk login WA akan dikirim otomatis ke Telegram bot milik User.

---

## 2. Fitur-Fitur Custom (Wajib Dipahami)
Bot ini bukan bot WA biasa, ini adalah mesin *Marketing & Auto-Broadcast* tingkat lanjut. Berikut logika modifikasi krusial yang harus kamu jaga:

### A. Sistem Looping & Jadwal (`.addloop` & `.addjadwal`)
- Disimpan di `loops.json` dan `schedules.json`.
- Dieksekusi melalui `setInterval` setiap 30 detik di dalam `index.js`.
- **Modifikasi Penting:** `lastRun` di-set menjadi `-1` saat pertama kali `.addloop` dibuat, agar putaran pertama **langsung tereksekusi detik itu juga** (tidak perlu menunggu X jam).
- Fitur ini sudah di-upgrade agar bisa mengeksekusi perintah `.bclist` langsung dari dalam *background interval*.

### B. Broadcast Berantai Siluman (`.sendlist`)
- Berbeda dengan `.bclist` yang menyebar ke seluruh *database* grup, `.sendlist` HANYA mengirim secara berantai ke **Grup Tempat Perintah Diketik**.
- **Fitur Siluman:** Begitu perintah diketik (`.sendlist config1`), pesan asli User tersebut akan otomatis dihapus oleh bot (`sock.sendMessage(sender, { delete: msg.key })`) sehingga orang di grup tidak tahu bot sedang dikendalikan.

### C. Auto-Welcome & Goodbye
- Ter-trigger oleh `group-participants.update`.
- Menggunakan `sock.groupMetadata(id)` untuk menarik **Nama Grup Asli** secara dinamis, sehingga sapaan menjadi: *"Selamat bergabung di Grup WIBU VPN OFFICIAL"*.

### D. Group Whitelisting (`.menuon` & `.menuoff`)
- Semua fitur interaktif (termasuk sambutan member baru dan `.menu`) HANYA berfungsi di grup yang sudah di-whitelist (`allowed_menu_groups.json`).
- Jika User pindah VPS dan mereset file ini, ingatkan mereka untuk mengetik `.menuon` di grup targetnya kembali.

---

## 3. Data-Data JSON Penting (Database)
- `custom_list.json` : Database Auto-respon & Config file untuk `.bclist`.
- `target_groups.json` : Daftar grup sasaran `.bc` dan Auto-Loop.
- `allowed_menu_groups.json` : Daftar grup yang di-whitelist.
- `anti_forward_groups.json` : Grup yang mengaktifkan `.antispam on`.
- `loops.json` & `schedules.json` : Database auto-pilot.
*(Semua file ini penting dan merupakan urat nadi bot, jadi wajib di-backup/dibawa saat pindah VPS).*

---

## 4. Instruksi Migrasi untuk VPS Baru
Jika file zip ini sudah di-ekstrak di VPS baru:
1. Pastikan folder `auth_info_baileys/` ikut terbawa (agar tidak perlu scan QR lagi).
2. Install ulang *dependencies* jika perlu: `npm install`
3. Install PM2: `npm install -g pm2`
4. Jalankan bot: `pm2 start index.js --name "wibu-bot" && pm2 save && pm2 startup`

Semoga sukses, AI Penerus! Jaga baik-baik bos kita! 🚀🤖
