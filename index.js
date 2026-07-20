const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const qrImage = require('qrcode');
const fs = require('fs');

const GROUPS_FILE = './target_groups.json';
let targetGroups = [];
if(fs.existsSync(GROUPS_FILE)) {
    targetGroups = JSON.parse(fs.readFileSync(GROUPS_FILE));
}
function saveGroups() {
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(targetGroups, null, 2));
}

const ANTIFWD_FILE = './anti_forward.json';
let antiForwardGroups = [];
if(fs.existsSync(ANTIFWD_FILE)) {
    antiForwardGroups = JSON.parse(fs.readFileSync(ANTIFWD_FILE));
}
function saveAntiFwd() {
    fs.writeFileSync(ANTIFWD_FILE, JSON.stringify(antiForwardGroups, null, 2));
}

const CUSTOM_LIST_FILE = './custom_list.json';
let customList = {};
let allowedMenuGroups = [];
if (fs.existsSync('./allowed_menu_groups.json')) {
    allowedMenuGroups = JSON.parse(fs.readFileSync('./allowed_menu_groups.json'));
}
if(fs.existsSync(CUSTOM_LIST_FILE)) {
    customList = JSON.parse(fs.readFileSync(CUSTOM_LIST_FILE));
}
function saveCustomList() {
    fs.writeFileSync(CUSTOM_LIST_FILE, JSON.stringify(customList, null, 2));
}

const SCHEDULE_FILE = './schedule.json';
let schedules = {};
if(fs.existsSync(SCHEDULE_FILE)) {
    schedules = JSON.parse(fs.readFileSync(SCHEDULE_FILE));
}
function saveSchedules() {
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedules, null, 2));
}

const LOOPS_FILE = './loops.json';
let loops = {};
if(fs.existsSync(LOOPS_FILE)) {
    loops = JSON.parse(fs.readFileSync(LOOPS_FILE));
}
function saveLoops() {
    fs.writeFileSync(LOOPS_FILE, JSON.stringify(loops, null, 2));
}

// Helper: Delay acak untuk simulasi ketikan manusia
const randomDelay = (min, max) => new Promise(res => setTimeout(res, (Math.floor(Math.random() * (max - min + 1)) + min) * 1000));

// Helper: Penambah Karakter Transparan (Anti-Spam Hash Bypass)
const addInvisibleRandomizer = (text) => {
    const chars = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
    let randomAppend = '';
    const length = Math.floor(Math.random() * 5) + 1; // 1-5 karakter gaib
    for(let i=0; i<length; i++) {
        randomAppend += chars[Math.floor(Math.random() * chars.length)];
    }
    return text + randomAppend;
};

// Helper: Cek apakah grup dikunci (Hanya Admin) dan apakah bot punya akses
async function canSendToGroup(sock, groupJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid);
        if (!metadata.announce) return true; // Grup Terbuka
        
        const botJid = jidNormalizedUser(sock.user.id);
        const amIAdmin = metadata.participants.some(p => 
            jidNormalizedUser(p.id) === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
        );
        return amIAdmin; // Grup Tertutup, hanya boleh jika bot adalah Admin
    } catch(e) {
        return false; // Error (mungkin bot dikeluarkan)
    }
}

let lastBroadcastTime = "";

async function connectToWhatsApp () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['WibuVPNBot', 'Safari', '1.0.0']
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if(qr) {
            qrcode.generate(qr, { small: true });
            console.log('Scan QR Code di atas untuk login ke WhatsApp.');
            
            // Simpan QR Text (Opsional)
            fs.writeFileSync('qr-code.txt', qr);
            
            // Simpan QR Image (PNG)
            qrImage.toFile('qr-code.png', qr, {
                color: { dark: '#000000', light: '#ffffff' }
            }, (err) => {
                if (err) {
                    console.error('Gagal membuat qr-code.png:', err);
                } else {
                    console.log('✅ QR Code berhasil disimpan sebagai gambar.');
                    console.log('👉 qr-code.png');
                    
                    // Kirim ke Telegram
                    try {
                        const { execSync } = require('child_process');
                        const token = "8698620976:AAFyMDnH7GE1SkX3Y141sr7YN5LGmvBm4Bo"; // <-- GANTI DENGAN TOKEN BOT ANDA
                        const chatId = "5851934765"; // <-- GANTI DENGAN CHAT ID ANDA
                        console.log('Mengirim QR Code ke Telegram...');
                        execSync(`curl -s -X POST "https://api.telegram.org/bot${token}/sendPhoto" -F chat_id="${chatId}" -F photo="@qr-code.png" -F caption="📷 *SCAN QR CODE BOT WA*\n\nSilakan buka WhatsApp di HP Anda, buka menu Perangkat Tautkan, lalu scan gambar QR Code ini." -F parse_mode="Markdown"`);
                        console.log('✅ QR Code berhasil dikirim ke Telegram!');
                    } catch (e) {
                        console.log('❌ Gagal mengirim QR ke Telegram:', e.message);
                    }
                }
            });
            console.log('\n==================================================');
            console.log('🖼️ OPSI SCAN LEWAT GAMBAR / FILE 🖼️');
            console.log('Buka tab [Files] di panel Pterodactyl, lalu klik file bernama:');
            console.log('👉 qr-code.png');
            console.log('Gambarnya akan terbuka. Tinggal scan dari layar Pterodactyl!');
            console.log('==================================================\n');
        }
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if(shouldReconnect) connectToWhatsApp();
        } else if(connection === 'open') {
            console.log('✅ Bot WhatsApp Promosi Berhasil Terhubung!');
            // Auto Backup setiap 12 Jam (43200000 ms)
            setInterval(async () => {
                try {
                    const myNumber = jidNormalizedUser(sock.user.id);
                    const filesToBackup = [GROUPS_FILE, ANTIFWD_FILE, CUSTOM_LIST_FILE, SCHEDULE_FILE, LOOPS_FILE];
                    await sock.sendMessage(myNumber, { text: '🔄 *Auto-Backup Rutin 12 Jam:* Mengamankan data konfigurasi ke chat pribadi...' });
                    for (const file of filesToBackup) {
                        if (fs.existsSync(file)) {
                            await sock.sendMessage(myNumber, {
                                document: fs.readFileSync(file),
                                mimetype: 'application/json',
                                fileName: file.replace('./', '')
                            });
                        }
                    }
                } catch (e) {
                    console.log("Auto-backup failed:", e);
                }
            }, 12 * 60 * 60 * 1000);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // SISTEM AUTO-BROADCAST (TERJADWAL & LOOPING)
    setInterval(async () => {
        try {
            const now = new Date();
            const nowMs = now.getTime();
            const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false };
            const currentTime = now.toLocaleTimeString('id-ID', options).replace('.', ':'); // "12:00"

            if (targetGroups.length > 0) {
                // 1. Cek Auto-Broadcast Terjadwal (Berdasarkan Jam Tertentu)
                if (currentTime !== lastBroadcastTime && schedules[currentTime]) {
                    lastBroadcastTime = currentTime;
                    console.log(`⏰ Menjalankan Auto-Broadcast Jadwal untuk jam ${currentTime}`);
                    const bcPesan = schedules[currentTime];
                    
                    for (let i = 0; i < targetGroups.length; i++) {
                        const groupJid = targetGroups[i];
                        try {
                            const canSend = await canSendToGroup(sock, groupJid);
                            if (!canSend) continue; // Skip jika grup ditutup & bot bukan admin

                            if (i > 0 && i % 10 === 0) {
                                await randomDelay(20, 40); 
                            }
                            await sock.sendPresenceUpdate('composing', groupJid);
                            await randomDelay(4, 8);
                            const safeBcText = addInvisibleRandomizer(bcPesan);
                            await sock.sendMessage(groupJid, { text: safeBcText });
                            await sock.sendPresenceUpdate('paused', groupJid);
                            await randomDelay(5, 10);
                        } catch(e) {}
                    }
                    console.log(`✅ Jadwal BC jam ${currentTime} Selesai.`);
                }

                // 2. Cek Auto-Loop (Berdasarkan Interval Per Jam)
                for (const [hoursStr, loopData] of Object.entries(loops)) {
                    const hours = parseInt(hoursStr);
                    const intervalMs = hours * 60 * 60 * 1000;
                    
                    if (!loopData.lastRun || (nowMs - loopData.lastRun >= intervalMs)) {
                        console.log(`🔁 Menjalankan Auto-Loop BC untuk interval ${hours} jam`);
                        
                        loopData.lastRun = nowMs;
                        saveLoops();
                        
                        const bcPesan = loopData.message;
                        for (let i = 0; i < targetGroups.length; i++) {
                            const groupJid = targetGroups[i];
                            try {
                                const canSend = await canSendToGroup(sock, groupJid);
                                if (!canSend) continue; // Skip jika grup ditutup & bot bukan admin

                                if (i > 0 && i % 10 === 0) await randomDelay(20, 40);
                                await sock.sendPresenceUpdate('composing', groupJid);
                                await randomDelay(4, 8);
                                const safeBcText = addInvisibleRandomizer(bcPesan);
                                await sock.sendMessage(groupJid, { text: safeBcText });
                                await sock.sendPresenceUpdate('paused', groupJid);
                                await randomDelay(5, 10);
                            } catch(e) {}
                        }
                        console.log(`✅ Loop BC interval ${hours} jam Selesai.`);
                    }
                }
            }
        } catch (err) {}
    }, 30000); // Cek setiap 30 detik

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if(!msg.message) return;

        const sender = msg.key.remoteJid;
        const isFromMe = msg.key.fromMe; 
        const isGroup = sender.endsWith('@g.us');

        let text = '';
        if (msg.message.conversation) {
            text = msg.message.conversation;
        } else if (msg.message.extendedTextMessage) {
            text = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage?.caption) {
            text = msg.message.imageMessage.caption;
        } else if (msg.message.documentMessage?.caption) {
            text = msg.message.documentMessage.caption;
        }
        
        const textLower = text.toLowerCase().trim();

        
        if (isFromMe && isGroup) {
            if (textLower === '.menuon') {
                if (!allowedMenuGroups.includes(sender)) {
                    allowedMenuGroups.push(sender);
                    fs.writeFileSync('./allowed_menu_groups.json', JSON.stringify(allowedMenuGroups, null, 2));
                    await sock.sendMessage(sender, { text: '✅ Fitur Menu PUBLIK diaktifkan di grup ini!\nSemua anggota sekarang bisa mengetik .menu' });
                } else {
                    await sock.sendMessage(sender, { text: '⚠️ Fitur Menu Publik sudah aktif di grup ini.' });
                }
                return;
            }
            if (textLower === '.menuoff') {
                allowedMenuGroups = allowedMenuGroups.filter(id => id !== sender);
                fs.writeFileSync('./allowed_menu_groups.json', JSON.stringify(allowedMenuGroups, null, 2));
                await sock.sendMessage(sender, { text: '🚫 Fitur Menu PUBLIK dimatikan.\nAnggota grup tidak bisa lagi memanggil bot.' });
                return;
            }
        }
        if(textLower === '.menu' || textLower === 'menu' || textLower === 'help' || textLower === '.help') {
            // Logika Anti-Spam Grup
            if (isGroup && !isFromMe) {
                // Abaikan jika grup ini belum diizinkan oleh admin
                if (!allowedMenuGroups.includes(sender)) return;
            }
            let menuText = "╭━〔 🤖 *WIBU VPN BOT* 〕━\n┃\n";
            
            if(!isFromMe) {
                menuText += "┣ 📚 *DAFTAR LAYANAN*\n";
                const keys = Object.keys(customList);
                if (keys.length > 0) {
                    keys.forEach(k => { menuText += `┃ ⊳ *.${k}*\n`; });
                } else {
                    menuText += "┃ ⊳ *.katalog*\n";
                }
                menuText += "┃ ⊳ *.ping*\n┃\n";
                menuText += "╰━━━━━━━━━━━━━━━━━━━\n";
                menuText += "👉 _Ketik salah satu perintah di atas_";
            } else {
                menuText += "┣ 👑 *MENU KHUSUS ADMIN*\n┃\n";
                menuText += "┣ 📢 *BROADCAST & GRUP*\n";
                menuText += "┃ ⊳ *.add* / *.dell* (Atur target)\n";
                menuText += "┃ ⊳ *.addall* / *.dellall* (Sapu jagat)\n";
                menuText += "┃ ⊳ *.listgrup* (Cek target)\n";
                menuText += "┃ ⊳ *.cekgrup* (Cek total grup)\n";
                menuText += "┃ ⊳ *.bc* <teks> (Kirim pesan)\n";
                menuText += "┃ ⊳ *.bclist* <f1> <f2> (Berantai)\n";
                menuText += "┃ ⊳ *.sendlist* <f1> <f2> (Ke grup ini)\n";
                menuText += "┃ ⊳ *.hidetag* / *.tagall* <teks>\n┃\n";
                
                menuText += "┣ ⏰ *JADWAL OTOMATIS*\n";
                menuText += "┃ ⊳ *.addjadwal 12:00* <teks>\n";
                menuText += "┃ ⊳ *.deljadwal 12:00*\n";
                menuText += "┃ ⊳ *.addloop 3* (Tiap 3 jam)\n";
                menuText += "┃ ⊳ *.delloop 3*\n";
                menuText += "┃ ⊳ *.listjadwal* / *.listloop*\n┃\n";
                
                menuText += "┣ 🛡️ *SATPAM GRUP*\n";
                menuText += "┃ ⊳ *.menuon* / *.menuoff*\n";
                menuText += "┃ ⊳ *.antispam* on/off\n";
                menuText += "┃ ⊳ *.kick* (Sambil Reply)\n";
                menuText += "┃ ⊳ *.tutup* / *.buka*\n┃\n";
                
                menuText += "┣ 📝 *AUTO-RESPON (FILE/TEKS)*\n";
                menuText += "┃ ⊳ *.addlist* <nama> (Reply pesan)\n";
                menuText += "┃ ⊳ *.dellist* <nama>\n";
                menuText += "┃ ⊳ *.listmenu*\n┃\n";
                
                menuText += "┣ 📖 *BANTUAN & PANDUAN*\n";
                menuText += "┃ ⊳ *.panduan* (Cara pakai bot)\n┃\n";
                
                menuText += "╰━━━━━━━━━━━━━━━━━━━";
            }
            await sock.sendMessage(sender, { text: menuText });
        }
        
        if (isFromMe && textLower === '.panduan') {
            const panduanText = `📖 *BUKU PANDUAN WIBU BOT* 📖

*1. CARA BROADCAST KE GRUP*
• Buka grup target satu per satu, ketik \`.add\` di masing-masing grup (bot otomatis keluar masuk & menghapus chat-nya).
• Jika bos capek manual, ketik \`.addall\` di salah satu grup, bot akan otomatis menjadikan SEMUA grup yang bos ikuti saat ini sebagai target.
• Untuk hapus grup dari target, ketik \`.dell\` di grup tersebut, atau \`.dellall\` untuk menghapus semua memori grup.
• Ketik \`.listgrup\` untuk melihat daftar grup yang sukses ditambahkan.

*2. CARA KIRIM PESAN BROADCAST*
• Ketik \`.bc Isi pesan promosi bos disini\` (Mengirim teks biasa ke semua grup target).
• *Rekomendasi:* Gunakan Auto-Respon agar bisa ngirim gambar/teks panjang sekaligus.

*3. CARA BIKIN AUTO-RESPON (.addlist)*
• Siapkan pesan panjang atau gambar + caption.
• *Reply/Balas* pesan tersebut, lalu ketik \`.addlist promo1\`
• Sekarang bos bisa tes ketik \`.promo1\`, bot akan merespon dengan gambar/teks tadi.
• Untuk menghapus, ketik \`.dellist promo1\`.
• Untuk melihat semua list yang tersimpan, ketik \`.listmenu\`.

*4. CARA BROADCAST BERANTAI (.bclist)*
• Pastikan bos sudah bikin list seperti langkah ke-3 (misal \`.addlist vpn\` dan \`.addlist banner\`).
• Ketik \`.bclist vpn banner\`
• Bot akan otomatis mengirim list 'vpn' lalu disusul list 'banner' ke puluhan grup target secara perlahan dan aman dari banned.

*5. CARA BIKIN BROADCAST JADWAL/BERULANG*
• \`.addjadwal 12:00 .bclist vpn\` (Jam 12 siang setiap hari bot otomatis ngirim list vpn ke semua grup).
• \`.addloop 2 .bclist vpn\` (Bot otomatis ngirim list vpn ke semua grup setiap 2 jam tanpa henti).
• \`.listjadwal\` atau \`.listloop\` untuk mengecek jadwal aktif.
• \`.deljadwal 12:00\` atau \`.delloop 2\` untuk menghentikan.

*6. KEAMANAN GRUP*
• \`.tutup\` (Hanya admin yg bisa chat grup).
• \`.buka\` (Semua peserta bisa chat).
• \`.antispam on\` (Otomatis hapus link/forward dari anggota grup).
• \`.kick\` (Sambil reply chat orangnya untuk menendang).`;
            await sock.sendMessage(sender, { text: panduanText });
        }

        if (isGroup && antiForwardGroups.includes(sender) && !isFromMe) {
            const isForwarded = msg.message?.extendedTextMessage?.contextInfo?.isForwarded || 
                                msg.message?.imageMessage?.contextInfo?.isForwarded ||
                                msg.message?.videoMessage?.contextInfo?.isForwarded;
            
            const containsLink = /(https?:\/\/[^\s]+|wa\.me|chat\.whatsapp\.com|t\.me)/gi.test(text);
                                
            if (isForwarded || containsLink) {
                try {
                    await sock.sendMessage(sender, { delete: msg.key });
                } catch (e) {}
                return;
            }
        }

        if(textLower === '.ping') {
            if (isGroup && !isFromMe && !allowedMenuGroups.includes(sender)) return;
            await sock.sendMessage(sender, { text: 'Pong! 🏓 Bot Promosi sedang aktif.' });
        }
        else if(textLower.startsWith('.')) {
            const keyword = textLower.substring(1).trim();
            if(customList[keyword]) {
                if (isGroup && !isFromMe && !allowedMenuGroups.includes(sender)) return;
                await sock.readMessages([msg.key]);
                await sock.sendPresenceUpdate('composing', sender);
                if(!isFromMe) await randomDelay(1, 3);
                
                const savedData = customList[keyword];
                if (typeof savedData === 'string') {
                    await sock.sendMessage(sender, { text: savedData });
                } else {
                    await sock.sendMessage(sender, { forward: { key: { remoteJid: sender, id: 'RAHASIA' }, message: savedData } });
                }
                
                if(isFromMe) {
                    try { await sock.sendMessage(sender, { delete: msg.key }); } catch(e){}
                }
            }
        }

        if(isFromMe) {
            
            if(textLower.startsWith('.addloop ')) {
                const args = text.substring(9).trim().split(' ');
                const hoursStr = args[0];
                
                if(isNaN(hoursStr) || parseInt(hoursStr) <= 0) {
                    await sock.sendMessage(sender, { text: '⚠️ Format jam salah. Gunakan angka (contoh: *.addloop 3* untuk setiap 3 jam).' });
                    return;
                }

                const quotedContext = msg.message?.extendedTextMessage?.contextInfo;
                const quotedMessage = quotedContext?.quotedMessage;
                
                let savedText = "";
                if (quotedMessage) {
                    if (quotedMessage.conversation) savedText = quotedMessage.conversation;
                    else if (quotedMessage.extendedTextMessage) savedText = quotedMessage.extendedTextMessage.text;
                } else {
                    savedText = args.slice(1).join(' ');
                }

                if (savedText) {
                    loops[hoursStr] = {
                        message: savedText,
                        lastRun: Date.now()
                    };
                    saveLoops();
                    await sock.sendMessage(sender, { text: `🔁 Jadwal Loop berhasil disimpan!\nBot akan otomatis menyebar pesan tersebut secara rutin **setiap ${hoursStr} jam** (dihitung mulai dari sekarang).` });
                } else {
                    await sock.sendMessage(sender, { text: `⚠️ Pesan kosong! Ketik '.addloop 3 Pesan promosi' ATAU Reply sebuah pesan dengan '.addloop 3'` });
                }
            }
            
            if(textLower.startsWith('.delloop ')) {
                const hoursStr = textLower.substring(9).trim();
                if (loops[hoursStr]) {
                    delete loops[hoursStr];
                    saveLoops();
                    await sock.sendMessage(sender, { text: `🗑️ Jadwal Loop per *${hoursStr} jam* berhasil dihapus.` });
                } else {
                    await sock.sendMessage(sender, { text: `⚠️ Jadwal Loop per *${hoursStr} jam* tidak ditemukan.` });
                }
            }

            if(textLower === '.listloop') {
                const keys = Object.keys(loops);
                if (keys.length === 0) {
                    await sock.sendMessage(sender, { text: `📊 Belum ada jadwal Loop (Per Jam) yang dibuat.` });
                } else {
                    let txt = `🔁 *Daftar Jadwal Loop (Otomatis Kirim):*\n\n`;
                    keys.sort((a,b)=>parseInt(a)-parseInt(b)).forEach(k => {
                        txt += `• Otomatis ngirim setiap *${k} jam*\n`;
                    });
                    await sock.sendMessage(sender, { text: txt });
                }
            }

            if(textLower.startsWith('.addjadwal ')) {
                const args = text.substring(11).trim().split(' ');
                const timeStr = args[0];
                
                if(!/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr)) {
                    await sock.sendMessage(sender, { text: '⚠️ Format waktu salah. Gunakan HH:MM (contoh: 12:00 atau 08:30).' });
                    return;
                }

                const quotedContext = msg.message?.extendedTextMessage?.contextInfo;
                const quotedMessage = quotedContext?.quotedMessage;
                
                let savedText = "";
                if (quotedMessage) {
                    if (quotedMessage.conversation) savedText = quotedMessage.conversation;
                    else if (quotedMessage.extendedTextMessage) savedText = quotedMessage.extendedTextMessage.text;
                } else {
                    savedText = args.slice(1).join(' ');
                }

                if (savedText) {
                    schedules[timeStr] = savedText;
                    saveSchedules();
                    await sock.sendMessage(sender, { text: `✅ Jadwal BC otomatis berhasil disimpan!\nBot akan menyebar pesan tersebut setiap jam *${timeStr} WIB*.` });
                } else {
                    await sock.sendMessage(sender, { text: `⚠️ Pesan kosong! Ketik '.addjadwal 12:00 Pesan saya' ATAU Reply sebuah pesan dengan '.addjadwal 12:00'` });
                }
            }
            
            if(textLower.startsWith('.deljadwal ')) {
                const timeStr = textLower.substring(11).trim();
                if (schedules[timeStr]) {
                    delete schedules[timeStr];
                    saveSchedules();
                    await sock.sendMessage(sender, { text: `🗑️ Jadwal BC untuk jam *${timeStr} WIB* berhasil dihapus.` });
                } else {
                    await sock.sendMessage(sender, { text: `⚠️ Jadwal jam *${timeStr}* tidak ditemukan.` });
                }
            }

            if(textLower === '.listjadwal') {
                const keys = Object.keys(schedules);
                if (keys.length === 0) {
                    await sock.sendMessage(sender, { text: `📊 Belum ada jadwal BC otomatis yang dibuat.` });
                } else {
                    let txt = `⏰ *Daftar Jadwal Auto-Broadcast (WIB):*\n\n`;
                    keys.sort().forEach(k => txt += `• Pukul *${k}*\n`);
                    await sock.sendMessage(sender, { text: txt });
                }
            }

            if(textLower.startsWith('.addlist ')) {
                const keyword = textLower.substring(9).trim().toLowerCase();
                const quotedContext = msg.message?.extendedTextMessage?.contextInfo;
                const quotedMessage = quotedContext?.quotedMessage;
                
                let savedData = null;
                if (quotedMessage) {
                    if (quotedMessage.imageMessage || quotedMessage.videoMessage || quotedMessage.documentMessage || quotedMessage.audioMessage) {
                        savedData = quotedMessage;
                    } else if (quotedMessage.conversation) {
                        savedData = quotedMessage.conversation;
                    } else if (quotedMessage.extendedTextMessage) {
                        // Cek apakah pesan teks ini mengandung Preview Link / Thumbnail Gambar
                        if (quotedMessage.extendedTextMessage.matchedText || quotedMessage.extendedTextMessage.canonicalUrl || quotedMessage.extendedTextMessage.title || quotedMessage.extendedTextMessage.description || quotedMessage.extendedTextMessage.jpegThumbnail) {
                            savedData = quotedMessage; // Simpan sebagai objek utuh untuk di-forward
                        } else {
                            savedData = quotedMessage.extendedTextMessage.text; // Teks biasa
                        }
                    }
                }

                if (savedData) {
                    customList[keyword] = savedData;
                    saveCustomList();
                    await sock.sendMessage(sender, { text: `✅ Berhasil menyimpan menu!\nSekarang Bos/Pelanggan tinggal ngetik: *.${keyword}*` });
                } else {
                    await sock.sendMessage(sender, { text: `⚠️ Bos harus *Me-Reply* sebuah PESAN (Teks/Gambar/Video) yang ingin disimpan, lalu ketik perintah *.addlist <nama>*` });
                }
            }
            
            if(textLower.startsWith('.dellist ')) {
                const keyword = textLower.substring(9).trim().toLowerCase();
                if (customList[keyword]) {
                    delete customList[keyword];
                    saveCustomList();
                    await sock.sendMessage(sender, { text: `🗑️ Menu *.${keyword}* berhasil dihapus dari sistem.` });
                } else {
                    await sock.sendMessage(sender, { text: `⚠️ Menu *.${keyword}* tidak ditemukan.` });
                }
            }

            if(textLower === '.listmenu') {
                const keys = Object.keys(customList);
                if (keys.length === 0) {
                    await sock.sendMessage(sender, { text: `📊 Belum ada menu custom yang dibuat.` });
                } else {
                    let txt = `📊 *Daftar Menu Auto-Respon:*\n\n`;
                    keys.forEach(k => txt += `• .${k}\n`);
                    await sock.sendMessage(sender, { text: txt });
                }
            }

            if(textLower === '.addall') {
                const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                await sock.sendMessage(myNumber, { text: '⏳ Sedang menarik semua grup...' });
                try {
                    const groups = await sock.groupFetchAllParticipating();
                    const groupIds = Object.keys(groups);
                    let count = 0;
                    for (const jid of groupIds) {
                        if(!targetGroups.includes(jid)) {
                            targetGroups.push(jid);
                            count++;
                        }
                    }
                    saveGroups();
                    await sock.sendMessage(myNumber, { text: `✅ Berhasil menambahkan *${count} grup baru* secara massal ke daftar target Broadcast!` });
                } catch(e) {
                    await sock.sendMessage(myNumber, { text: '⚠️ Gagal mengambil daftar grup.' });
                }
            }

            if(textLower === '.dellall') {
                const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const total = targetGroups.length;
                targetGroups = [];
                saveGroups();
                await sock.sendMessage(myNumber, { text: `🗑️ Berhasil menghapus semua (*${total} grup*) dari daftar target Broadcast.` });
            }

            if(textLower === '.add' && isGroup) {
                const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                if(!targetGroups.includes(sender)) {
                    targetGroups.push(sender);
                    saveGroups();
                    let groupName = "Tidak Diketahui";
                    try {
                        const metadata = await sock.groupMetadata(sender);
                        groupName = metadata.subject;
                    } catch(e){}
                    await sock.sendMessage(myNumber, { text: `🤫 ✅ *Ssstt...* Grup *${groupName}* berhasil diam-diam ditambahkan ke target Broadcast.` });
                } else {
                    await sock.sendMessage(myNumber, { text: `⚠️ Grup sudah ada di target.` });
                }
                try { await sock.sendMessage(sender, { delete: msg.key }); } catch(e){}
            }
            
            if(textLower.startsWith('.dell') && textLower !== '.dellall' && textLower !== '.dellist') {
                const parts = textLower.split(' ');
                const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                
                if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
                    let nums = [];
                    for (let i = 1; i < parts.length; i++) {
                        let n = parseInt(parts[i]);
                        if (!isNaN(n) && n > 0 && n <= targetGroups.length) {
                            if (!nums.includes(n)) nums.push(n);
                        }
                    }
                    
                    if (nums.length > 0) {
                        nums.sort((a, b) => b - a);
                        
                        let deletedNames = [];
                        for (let num of nums) {
                            const removedId = targetGroups[num - 1];
                            let groupName = "Tidak Diketahui";
                            try {
                                const metadata = await sock.groupMetadata(removedId);
                                groupName = metadata.subject;
                            } catch(e){}
                            deletedNames.push(`- *${groupName}* (No.${num})`);
                            targetGroups.splice(num - 1, 1);
                        }
                        saveGroups();
                        
                        let replyMsg = `🗑️ ✅ Berhasil mencoret ${nums.length} grup dari target Broadcast:\n` + deletedNames.reverse().join('\n');
                        await sock.sendMessage(myNumber, { text: replyMsg });
                    } else {
                        await sock.sendMessage(myNumber, { text: `⚠️ Nomor grup tidak valid. Cek pakai *.listgrup*` });
                    }
                } 
                else if (isGroup && textLower === '.dell') {
                    targetGroups = targetGroups.filter(g => g !== sender);
                    saveGroups();
                    let groupName = "Tidak Diketahui";
                    try {
                        const metadata = await sock.groupMetadata(sender);
                        groupName = metadata.subject;
                    } catch(e){}
                    await sock.sendMessage(myNumber, { text: `🤫 🗑️ Grup *${groupName}* dihapus dari target promosi.` });
                    try { await sock.sendMessage(sender, { delete: msg.key }); } catch(e){}
                }
            }

            if (textLower === '.del') {
                const quotedContext = msg.message?.extendedTextMessage?.contextInfo;
                if (quotedContext && quotedContext.stanzaId) {
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const participantJid = quotedContext.participant || sender;
                    const isQuotedFromMe = participantJid === botJid;
                    const key = {
                        remoteJid: sender,
                        fromMe: isQuotedFromMe,
                        id: quotedContext.stanzaId,
                        participant: quotedContext.participant || undefined
                    };
                    try {
                        await sock.sendMessage(sender, { delete: key });
                        try { await sock.sendMessage(sender, { delete: msg.key }); } catch(e){}
                    } catch (err) {
                        await sock.sendMessage(sender, { text: '⚠️ Gagal menghapus pesan. Pastikan bot adalah Admin grup.' });
                    }
                } else {
                    await sock.sendMessage(sender, { text: '⚠️ Silakan balas (Reply) pesan yang ingin dihapus dengan ketik .del' });
                }
            }

            if(textLower === '.listgrup') {
                if (targetGroups.length === 0) {
                    await sock.sendMessage(sender, { text: '📊 Belum ada grup dalam daftar target Broadcast.' });
                } else {
                    await sock.sendMessage(sender, { text: '🔍 Sedang memindai dan membersihkan database target grup...' });
                    let txt = `📊 *Daftar Target Broadcast:*\n\n`;
                    let validGroups = [];
                    let removedCount = 0;
                    
                    for (let i = 0; i < targetGroups.length; i++) {
                        const jid = targetGroups[i];
                        try {
                            const metadata = await sock.groupMetadata(jid);
                            validGroups.push(jid);
                            txt += `${validGroups.length}. *${metadata.subject}*\n`;
                        } catch(e) {
                            removedCount++;
                        }
                    }
                    
                    if (removedCount > 0) {
                        targetGroups = validGroups;
                        saveGroups();
                        txt += `\n🧹 *Pembersihan Otomatis:* ${removedCount} grup dihapus dari database karena bot telah dikeluarkan.\n✅ *Total target sekarang: ${targetGroups.length} grup.*`;
                    } else {
                        txt += `\n✅ *Total target: ${targetGroups.length} grup.*`;
                    }
                    
                    await sock.sendMessage(sender, { text: txt });
                }
            }

            if(textLower === '.cekgrup') {
                await sock.sendMessage(sender, { text: '🔍 Sedang memindai semua grup yang Bos ikuti...' });
                try {
                    const groups = await sock.groupFetchAllParticipating();
                    const groupIds = Object.keys(groups);
                    if(groupIds.length === 0) {
                        await sock.sendMessage(sender, { text: '📊 Bos sepertinya belum bergabung ke grup manapun.' });
                    } else {
                        let txt = `📊 *Daftar Semua Grup WhatsApp Bos (${groupIds.length} Grup):*\n\n`;
                        let i = 1;
                        for (const jid of groupIds) {
                            txt += `${i}. *${groups[jid].subject}*\n`;
                            i++;
                        }
                        await sock.sendMessage(sender, { text: txt });
                    }
                } catch(e) {
                    await sock.sendMessage(sender, { text: '⚠️ Gagal mengambil daftar grup.' });
                }
            }

            if(textLower === '.antispam on' && isGroup) {
                if(!antiForwardGroups.includes(sender)) {
                    antiForwardGroups.push(sender);
                    saveAntiFwd();
                    await sock.sendMessage(sender, { text: '🛡️ Fitur Anti-Spam AKTIF di grup ini. Segala pesan terusan (Forward) dan pengiriman LINK akan otomatis dihapus.' });
                } else {
                    await sock.sendMessage(sender, { text: '⚠️ Anti-Spam sudah aktif.' });
                }
            }
            if(textLower === '.antispam off' && isGroup) {
                antiForwardGroups = antiForwardGroups.filter(g => g !== sender);
                saveAntiFwd();
                await sock.sendMessage(sender, { text: '🔓 Fitur Anti-Spam DIMATIKAN.' });
            }

            if(textLower === '.kick' && isGroup) {
                const quotedContext = msg.message?.extendedTextMessage?.contextInfo;
                if(quotedContext && quotedContext.participant) {
                    try {
                        await sock.groupParticipantsUpdate(sender, [quotedContext.participant], "remove");
                        await sock.sendMessage(sender, { text: '👢 Sayonara! Anggota berhasil ditendang dari grup.' });
                    } catch(e) {
                        await sock.sendMessage(sender, { text: '⚠️ Gagal menendang anggota. Pastikan Bot adalah Admin Grup!' });
                    }
                } else {
                    await sock.sendMessage(sender, { text: '⚠️ Bos harus Me-Reply pesan orang yang mau di-kick dengan perintah *.kick*' });
                }
            }

            if(textLower === '.tutup' && isGroup) {
                try {
                    await sock.groupSettingUpdate(sender, 'announcement');
                    await sock.sendMessage(sender, { text: '🔒 *Grup DITUTUP.*\nHanya Admin yang bisa mengirim pesan saat ini.\n\n> *© 2026 - Eksklusif by WibuVpnStore*' });
                } catch(e) {
                    await sock.sendMessage(sender, { text: '⚠️ Gagal menutup grup. Pastikan Bot adalah Admin!' });
                }
            }
            if(textLower === '.buka' && isGroup) {
                try {
                    await sock.groupSettingUpdate(sender, 'not_announcement');
                    await sock.sendMessage(sender, { text: '🔓 *Grup DIBUKA.*\nSemua anggota sudah bisa mengirim pesan.\n\n> *© 2026 - Eksklusif by WibuVpnStore*' });
                } catch(e) {
                    await sock.sendMessage(sender, { text: '⚠️ Gagal membuka grup. Pastikan Bot adalah Admin!' });
                }
            }

            if(textLower === '.backup') {
                await sock.sendMessage(sender, { text: '🔄 Sedang menyiapkan file backup...' });
                const filesToBackup = [GROUPS_FILE, ANTIFWD_FILE, CUSTOM_LIST_FILE, SCHEDULE_FILE, LOOPS_FILE];
                for (const file of filesToBackup) {
                    if (fs.existsSync(file)) {
                        await sock.sendMessage(sender, {
                            document: fs.readFileSync(file),
                            mimetype: 'application/json',
                            fileName: file.replace('./', '')
                        });
                        await randomDelay(1, 2);
                    }
                }
                await sock.sendMessage(sender, { text: '✅ Semua file konfigurasi berhasil dikirim! Bos bisa menyimpannya dengan aman.' });
            }

            if(textLower === '.bc' || textLower.startsWith('.bc ')) {
                if(targetGroups.length === 0) {
                    await sock.sendMessage(sender, { text: '⚠️ Belum ada grup yang ditandai. Ketik .add di dalam grup.' });
                    return;
                }
                
                const bcPesan = text.substring(4).trim();
                const quotedContext = msg.message?.extendedTextMessage?.contextInfo;
                const quotedMessage = quotedContext?.quotedMessage;

                await sock.sendMessage(sender, { text: `🚀 Memulai Broadcast ke ${targetGroups.length} grup...` });
                let sukses = 0;
                let failedGroups = [];
                
                for (let i = 0; i < targetGroups.length; i++) {
                    const groupJid = targetGroups[i];
                    let groupName = "Tidak Diketahui";
                    try {
                        const metadata = await sock.groupMetadata(groupJid);
                        groupName = metadata.subject;
                    } catch(e) {}

                    try {
                        const canSend = await canSendToGroup(sock, groupJid);
                        if (!canSend) {
                            failedGroups.push(`- *${groupName}* (Ditutup/Bukan Admin)`);
                            continue;
                        }

                        if (i > 0 && i % 10 === 0) {
                            await randomDelay(15, 30);
                        }

                        await sock.sendPresenceUpdate('composing', groupJid);
                        await randomDelay(3, 7);

                        if (quotedMessage) {
                            const messageToForward = {
                                key: { remoteJid: sender, id: quotedContext.stanzaId },
                                message: quotedMessage
                            };
                            await sock.sendMessage(groupJid, { forward: messageToForward });
                        } else {
                            if(bcPesan) {
                                const safeBcText = addInvisibleRandomizer(bcPesan);
                                await sock.sendMessage(groupJid, { text: safeBcText });
                            }
                        }
                        await sock.sendPresenceUpdate('paused', groupJid);
                        sukses++;
                        await randomDelay(5, 10);
                    } catch(e) { 
                        failedGroups.push(`- *${groupName}* (Error Terkirim)`);
                    }
                }
                
                let report = `✅ Broadcast Selesai! Berhasil terkirim ke ${sukses}/${targetGroups.length} grup.`;
                if(failedGroups.length > 0) {
                    report += `\n\n❌ *Gagal mengirim ke ${failedGroups.length} grup karena dikunci/error:*\n` + failedGroups.join('\n');
                }
                await sock.sendMessage(sender, { text: report });
            }

            // ==========================================
            // FITUR KIRIM BERANTAI KE 1 GRUP INI SAJA (.sendlist)
            // ==========================================
            if(textLower.startsWith('.sendlist ')) {
                const args = textLower.substring(10).trim().split(' ');
                let validItems = [];
                for (const arg of args) {
                    if (arg && customList[arg]) validItems.push(customList[arg]);
                }

                if (validItems.length === 0) {
                    await sock.sendMessage(sender, { text: '⚠️ Nama file/config tidak ditemukan!' });
                    return;
                }

                await sock.sendMessage(sender, { text: `🚀 Mengirim ${validItems.length} file ke grup ini...` });
                
                try {
                    for (const item of validItems) {
                        await sock.sendPresenceUpdate('composing', sender);
                        await randomDelay(2, 5); // jeda ngetik biar natural
                        
                        if (item.type === 'text') {
                            const textToSend = item.text || item.content;
                            await sock.sendMessage(sender, { text: textToSend });
                        } else if (item.type === 'image') {
                            const buffer = Buffer.from(item.content, 'base64');
                            await sock.sendMessage(sender, { image: buffer, caption: item.caption });
                        } else if (item.type === 'document') {
                            const buffer = Buffer.from(item.content, 'base64');
                            await sock.sendMessage(sender, { document: buffer, fileName: item.fileName, mimetype: item.mimetype, caption: item.caption });
                        }
                    }
                } catch(e) {
                    await sock.sendMessage(sender, { text: '⚠️ Gagal mengirim beberapa file.' });
                }
            }

            // ==========================================
            // FITUR BROADCAST MULTI-FILE BERANTAI (.bclist)
            // ==========================================
            if(textLower.startsWith('.bclist ')) {
                if(targetGroups.length === 0) {
                    await sock.sendMessage(sender, { text: '⚠️ Belum ada grup target. Ketik .addall terlebih dahulu.' });
                    return;
                }

                const args = textLower.substring(8).trim().split(' ');
                let validItems = [];
                for (const arg of args) {
                    if (arg && customList[arg]) validItems.push(customList[arg]);
                }

                if (validItems.length === 0) {
                    await sock.sendMessage(sender, { text: '⚠️ Nama file/config tidak ditemukan! Pastikan sudah disimpan pakai .addlist' });
                    return;
                }

                await sock.sendMessage(sender, { text: `🚀 Memulai pengiriman massal (${validItems.length} file) ke ${targetGroups.length} grup...` });
                let sukses = 0;
                let failedGroups = [];

                for (let i = 0; i < targetGroups.length; i++) {
                    const groupJid = targetGroups[i];
                    let groupName = "Tidak Diketahui";
                    try {
                        const metadata = await sock.groupMetadata(groupJid);
                        groupName = metadata.subject;
                    } catch(e) {}

                    try {
                        const canSend = await canSendToGroup(sock, groupJid);
                        if (!canSend) {
                            failedGroups.push(`- *${groupName}* (Ditutup/Bukan Admin)`);
                            continue;
                        }

                        if (i > 0 && i % 10 === 0) await randomDelay(15, 30);

                        await sock.sendPresenceUpdate('composing', groupJid);
                        await randomDelay(3, 7);

                        for (const item of validItems) {
                            if (typeof item === 'string') {
                                const safeBcText = addInvisibleRandomizer(item);
                                await sock.sendMessage(groupJid, { text: safeBcText });
                            } else {
                                await sock.sendMessage(groupJid, { forward: { key: { remoteJid: sender, id: 'RAHASIA' }, message: item } });
                            }
                            await randomDelay(1, 3); // Jeda kecil antar file
                        }
                        
                        await sock.sendPresenceUpdate('paused', groupJid);
                        sukses++;
                        await randomDelay(4, 9);
                    } catch(e) {
                        failedGroups.push(`- *${groupName}* (Error Terkirim)`);
                    }
                }
                
                let report = `✅ Broadcast Berantai Selesai! Terkirim ke ${sukses}/${targetGroups.length} grup.`;
                if(failedGroups.length > 0) {
                    report += `\n\n❌ *Gagal mengirim ke ${failedGroups.length} grup karena dikunci/error:*\n` + failedGroups.join('\n');
                }
                await sock.sendMessage(sender, { text: report });
            }
            
            // ==========================================
            // FITUR HIDETAG (TAG ALL)
            // ==========================================
            if ((textLower.startsWith('.hidetag ') || textLower.startsWith('.tagall ')) && isGroup) {
                const messageText = textLower.startsWith('.tagall ') ? text.substring(8).trim() : text.substring(9).trim();
                try {
                    const groupMetadata = await sock.groupMetadata(sender);
                    const participants = groupMetadata.participants.map(p => p.id);
                    
                    await sock.sendMessage(sender, {
                        text: messageText,
                        mentions: participants
                    });
                } catch (e) {
                    await sock.sendMessage(sender, { text: '⚠️ Gagal mengirim hidetag. Pastikan bot adalah Admin!' });
                }
            }
        }
    });

    // ==========================================
    // FITUR AUTO-WELCOME (SAMBUTAN)
    // ==========================================
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        try {
            // Hanya jalankan sambutan/perpisahan di Grup Milik Sendiri (yang sudah di .menuon)
            if (!allowedMenuGroups.includes(id)) return;

            const now = new Date();
            const timeOptions = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false };
            const dateOptions = { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'long', year: 'numeric' };
            const jam = now.toLocaleTimeString('id-ID', timeOptions).replace('.', ':');
            const tanggal = now.toLocaleDateString('id-ID', dateOptions);

            for (let participant of participants) {
                // Pastikan participant berupa string JID
                if (typeof participant !== 'string') {
                    participant = participant.id || participant.jid || '';
                }
                if (!participant) continue;
                
                const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                if(participant !== botNumber) {
                    if (action === 'add') {
                        const welcomeText = `Halo @${participant.split('@')[0]}! 👋\nSelamat bergabung di Grup.\n\n📅 *Tanggal:* ${tanggal}\n⏰ *Jam:* ${jam} WIB\n\n_Ketik *.menu* atau *.katalog* untuk melihat daftar layanan dan harga WIBU VPN._`;
                        await sock.sendMessage(id, { text: welcomeText, mentions: [participant] });
                    } else if (action === 'remove') {
                        const goodbyeText = `Sayonara @${participant.split('@')[0]} 👋\nTelah keluar dari Grup.\n\n📅 *Tanggal:* ${tanggal}\n⏰ *Jam:* ${jam} WIB`;
                        await sock.sendMessage(id, { text: goodbyeText, mentions: [participant] });
                    }
                }
            }
        } catch (err) {
            console.error('[ERROR] Gagal mengirim pesan sambutan/perpisahan:', err.message);
        }
    });
}

connectToWhatsApp();
