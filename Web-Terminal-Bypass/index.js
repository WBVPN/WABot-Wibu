const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

const TTYD_URL = 'https://github.com/tsl0922/ttyd/releases/download/1.7.3/ttyd.x86_64';
const CLOUDFLARED_URL = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64';

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) return resolve();
        console.log(`⏳ Mendownload ${path.basename(dest)}...`);
        const file = fs.createWriteStream(dest);
        https.get(url, response => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                fs.chmodSync(dest, 0o777);
                console.log(`✅ ${path.basename(dest)} Berhasil didownload!`);
                resolve();
            });
        }).on('error', err => {
            fs.unlinkSync(dest);
            reject(err);
        });
    });
}

async function start() {
    console.log('\n=============================================');
    console.log('🌸 WIBU WEB TERMINAL - PTERODACTYL BYPASS 🌸');
    console.log('=============================================\n');

    await downloadFile(TTYD_URL, './ttyd');
    await downloadFile(CLOUDFLARED_URL, './cloudflared');

    console.log('🚀 Menyalakan Anime Web Terminal...');
    
    // TTYD Anime/Cyberpunk Theme
    const ttyd = spawn('./ttyd', [
        '-p', '8080',
        '-t', 'titleFixed=Wibu Terminal',
        '-t', 'fontSize=15',
        '-t', 'fontFamily=Consolas, monospace',
        '-t', 'theme={"background": "#1a1b26", "foreground": "#c0caf5", "cursor": "#f7768e", "black": "#15161E", "red": "#f7768e", "green": "#9ece6a", "yellow": "#e0af68", "blue": "#7aa2f7", "magenta": "#bb9af7", "cyan": "#7dcfff", "white": "#a9b1d6"}',
        'bash'
    ]);

    ttyd.stdout.on('data', d => console.log(`[TTYD] ${d.toString().trim()}`));
    ttyd.stderr.on('data', d => console.log(`[TTYD] ${d.toString().trim()}`));

    console.log('🌐 Membuka Terowongan Cloudflare (Tunnel)...');
    const cf = spawn('./cloudflared', ['tunnel', '--url', 'http://localhost:8080']);

    cf.stderr.on('data', data => {
        const str = data.toString();
        if (str.includes('trycloudflare.com')) {
            const urlMatch = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
            if (urlMatch) {
                console.log('\n======================================================');
                console.log('🎉 TERMINAL ONLINE BOSKU SUDAH SIAP! 🎉');
                console.log('Buka link ini di browser HP / Laptop Bos:');
                console.log(`👉 ${urlMatch[0]} 👈`);
                console.log('======================================================\n');
            }
        }
    });

    cf.on('close', code => console.log(`Cloudflared exited with code ${code}`));
}

start();
