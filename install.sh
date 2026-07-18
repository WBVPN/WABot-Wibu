#!/bin/bash

# Warna
GREEN="\e[32m"
YELLOW="\e[33m"
CYAN="\e[36m"
ENDCOLOR="\e[0m"

clear
echo -e "${CYAN}=================================================${ENDCOLOR}"
echo -e "${GREEN}       WIBU WA BOT - AUTO INSTALLER VPS          ${ENDCOLOR}"
echo -e "${CYAN}=================================================${ENDCOLOR}"
echo ""

echo -e "${YELLOW}[1/4] Update & Install Dependencies...${ENDCOLOR}"
apt update && apt install -y curl git zip unzip > /dev/null 2>&1

echo -e "${YELLOW}[2/4] Install Node.js v18...${ENDCOLOR}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
apt install -y nodejs > /dev/null 2>&1

echo -e "${YELLOW}[3/4] Download Wibu WA Bot...${ENDCOLOR}"
cd /root
if [ -d "WABot-Wibu" ]; then
    rm -rf WABot-Wibu
fi
git clone https://github.com/WBVPN/WABot-Wibu.git
cd WABot-Wibu
echo -e "${YELLOW}[*] Installing NPM Packages (Harap Tunggu)...${ENDCOLOR}"
npm install > /dev/null 2>&1

echo ""
echo -e "${CYAN}=================================================${ENDCOLOR}"
echo -e "${YELLOW}      [OPSIONAL] NOTIFIKASI QR KE TELEGRAM       ${ENDCOLOR}"
echo -e "${CYAN}=================================================${ENDCOLOR}"
echo -e "Kosongkan (langsung tekan ENTER) jika tidak ingin dipakai."
read -p "Masukkan Token Bot Telegram: " tg_token
if [ -n "$tg_token" ]; then
    read -p "Masukkan Chat ID Telegram: " tg_chatid
    if [ -n "$tg_chatid" ]; then
        echo -e "${GREEN}Menyimpan pengaturan Telegram...${ENDCOLOR}"
        sed -i "s/ISI_TOKEN_BOT_TELEGRAM_DISINI/$tg_token/g" index.js
        sed -i "s/ISI_CHAT_ID_TELEGRAM_DISINI/$tg_chatid/g" index.js
    fi
fi
echo ""

echo -e "${YELLOW}[4/4] Install PM2 & Start Bot...${ENDCOLOR}"
npm install -g pm2 > /dev/null 2>&1
pm2 delete wibu-bot > /dev/null 2>&1
pm2 start index.js --name "wibu-bot" > /dev/null 2>&1
pm2 save > /dev/null 2>&1
pm2 startup > /dev/null 2>&1

echo ""
echo -e "${CYAN}=================================================${ENDCOLOR}"
echo -e "${GREEN}             INSTALASI SELESAI!                  ${ENDCOLOR}"
echo -e "${CYAN}=================================================${ENDCOLOR}"
echo -e "Menampilkan QR Code dalam 3 detik..."
sleep 3
pm2 logs wibu-bot --lines 50
