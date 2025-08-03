const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

const { initDatabase } = require('./command/database/initDatabase.js');
const BlackjackManager = require('./command/games/blackjack/blackjackManager.js');
const RouletteManager = require('./command/games/roulette/spinManager.js');
const { handleBlackjackCommands } = require('./command/games/blackjack/blackjack.js');
const { handleSpinCommands } = require('./command/games/roulette/spin.js');

initDatabase();

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        browser: ['My-MultiGame-Bot', 'Chrome', '1.0.0'],
    });

    const bjManager = new BlackjackManager(sock);
    const rlManager = new RouletteManager(sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('⚠️ Pindai QR Code ini:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('✅ Koneksi WhatsApp berhasil!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!messageText.startsWith('.')) return;

        const chatId = msg.key.remoteJid;
        const senderId = jidNormalizedUser(msg.key.participant || chatId);
        
        const messageObject = {
            text: messageText,
            sender: { id: senderId, name: msg.pushName || 'User' },
            chatId: chatId,
        };

        const command = messageText.split(' ')[0].toLowerCase();
        let response = null;

        try {
            if (command.startsWith('.bj') || ['.hit', '.stand'].includes(command)) {
                response = await handleBlackjackCommands(messageObject, bjManager);
            } else if (command === '.spin') {
                response = await handleSpinCommands(messageObject, rlManager);
            }

            if (response && response.text) {
                await sock.sendMessage(messageObject.chatId, { 
                    text: response.text,
                    mentions: response.mentions || []
                }, { quoted: msg });
            }
        } catch (error) {
            console.error('Error di Command Handler:', error);
            await sock.sendMessage(messageObject.chatId, { text: '❌ Terjadi error internal.' }, { quoted: msg });
        }
    });
}

connectToWhatsApp();