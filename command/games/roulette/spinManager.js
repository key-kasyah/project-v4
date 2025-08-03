const userManager = require('../../database/userManager.js');
const ui = require('./uiroulette.js');

// =======================================================
// PERBAIKAN BUG: Data Roda Roulette sekarang lengkap
// =======================================================
const ROULETTE_NUMBERS = {
    0: { color: 'Hijau', parity: 'N/A' }, 1: { color: 'Merah', parity: 'Ganjil' },
    2: { color: 'Hitam', parity: 'Genap' }, 3: { color: 'Merah', parity: 'Ganjil' },
    4: { color: 'Hitam', parity: 'Genap' }, 5: { color: 'Merah', parity: 'Ganjil' },
    6: { color: 'Hitam', parity: 'Genap' }, 7: { color: 'Merah', parity: 'Ganjil' },
    8: { color: 'Hitam', parity: 'Genap' }, 9: { color: 'Merah', parity: 'Ganjil' },
    10: { color: 'Hitam', parity: 'Genap' }, 11: { color: 'Hitam', parity: 'Ganjil' },
    12: { color: 'Merah', parity: 'Genap' }, 13: { color: 'Hitam', parity: 'Ganjil' },
    14: { color: 'Merah', parity: 'Genap' }, 15: { color: 'Hitam', parity: 'Ganjil' },
    16: { color: 'Merah', parity: 'Genap' }, 17: { color: 'Hitam', parity: 'Ganjil' },
    18: { color: 'Merah', parity: 'Genap' }, 19: { color: 'Merah', parity: 'Ganjil' },
    20: { color: 'Hitam', parity: 'Genap' }, 21: { color: 'Merah', parity: 'Ganjil' },
    22: { color: 'Hitam', parity: 'Genap' }, 23: { color: 'Merah', parity: 'Ganjil' },
    24: { color: 'Hitam', parity: 'Genap' }, 25: { color: 'Merah', parity: 'Ganjil' },
    26: { color: 'Hitam', parity: 'Genap' }, 27: { color: 'Merah', parity: 'Ganjil' },
    28: { color: 'Hitam', parity: 'Genap' }, 29: { color: 'Hitam', parity: 'Ganjil' },
    30: { color: 'Merah', parity: 'Genap' }, 31: { color: 'Hitam', parity: 'Ganjil' },
    32: { color: 'Merah', parity: 'Genap' }, 33: { color: 'Hitam', parity: 'Ganjil' },
    34: { color: 'Merah', parity: 'Genap' }, 35: { color: 'Hitam', parity: 'Ganjil' },
    36: { color: 'Merah', parity: 'Genap' },
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class RouletteManager {
    constructor(sock) {
        this.sock = sock;
        this.activeTables = new Map();
        console.log('✅ Roulette Manager (Class) telah diinisialisasi.');
    }
    
    showMenu(chatId) {
        const table = this.activeTables.get(chatId);
        return { text: ui.sendMenuMessage(table, chatId) };
    }

    createOrJoinTable(chatId, user, betInfo) {
        const userData = userManager.getUser(user);
        if (userData.balance < betInfo.amount) {
            return { text: `❌ Saldo Anda tidak cukup! Saldo saat ini: ${userData.balance} Yuki.` };
        }

        let table = this.activeTables.get(chatId);

        if (!table) {
            table = {
                id: `RL-${Date.now()}`,
                chatId: chatId,
                status: 'waiting',
                players: [],
                bets: [],
                hostIndex: 0,
                // =======================================================
                // PERUBAHAN WAKTU TUNGGU: dari 30 detik menjadi 20 detik
                // =======================================================
                joinTimeout: setTimeout(() => this._endBettingPhase(chatId), 20000),
                startTimeout: null,
            };
            this.activeTables.set(chatId, table);
            console.log(`Meja Roulette baru dibuat di: ${chatId}`);
        }

        if (table.status !== 'waiting') return { text: '❌ Waktu taruhan sudah habis, tidak bisa bergabung.' };
        if (table.players.some(p => p.id === user.id)) return { text: `✋ Anda sudah berada di meja ini.` };
        if (table.players.length >= 5) return { text: '❌ Meja sudah penuh.' };

        table.players.push(user);
        table.bets.push({ player: user, ...betInfo });
        userManager.updateBalance(user.id, -betInfo.amount);

        if (table.players.length === 5) {
            clearTimeout(table.joinTimeout);
            this._endBettingPhase(chatId);
        }

        return { text: ui.sendPlayerJoinedMessage(user, betInfo, table.players.length) };
    }

    async _endBettingPhase(chatId) {
        const table = this.activeTables.get(chatId);
        if (!table || table.status !== 'waiting') return;
        if (table.players.length === 0) { // Jika tidak ada pemain, batalkan saja
             this.activeTables.delete(chatId);
             return;
        }

        const host = table.players[0];
        await this.sock.sendMessage(chatId, { text: ui.sendBettingClosedMessage(host.name, table.players.length) });

        if (table.players.length === 5) {
            await sleep(2000);
            await this._runSpin(chatId);
        } else {
            table.status = 'starting';
            table.startTimeout = setTimeout(() => this._rotateHost(chatId), 60000);
        }
    }

    async _rotateHost(chatId) {
        const table = this.activeTables.get(chatId);
        if (!table || table.status !== 'starting') return;
        table.hostIndex = (table.hostIndex + 1) % table.players.length;
        const newHost = table.players[table.hostIndex];
        await this.sock.sendMessage(chatId, { text: ui.sendNewHostMessage(newHost.name) });
        clearTimeout(table.startTimeout);
        table.startTimeout = setTimeout(() => this._rotateHost(chatId), 60000);
    }
    
    async startGame(chatId, userId) {
        const table = this.activeTables.get(chatId);
        if (!table || table.status !== 'starting') return { text: `❌ Tidak ada permainan yang bisa dimulai.`};
        const currentHost = table.players[table.hostIndex];
        if (currentHost.id !== userId) return { text: `❌ Hanya host saat ini (*${currentHost.name}*) yang bisa memulai permainan.`};
        clearTimeout(table.startTimeout);
        await this._runSpin(chatId);
        return null;
    }
    
    async _runSpin(chatId) {
        const table = this.activeTables.get(chatId);
        if (!table) return;
        table.status = 'spinning';
        await this.sock.sendMessage(chatId, { text: 'Semua taruhan diterima. Roda berputar sekarang... 🎡' });
        await sleep(3000);
        const winningNumber = Math.floor(Math.random() * 37);
        const winningProperties = ROULETTE_NUMBERS[winningNumber];
        table.bets.forEach(bet => {
            let isWin = false;
            let payout = 0;
            switch (bet.type.toLowerCase()) {
                case 'angka': if (parseInt(bet.value) === winningNumber) { isWin = true; payout = bet.amount * 35; } break;
                case 'warna': if (bet.value.toLowerCase() === winningProperties.color.toLowerCase()) { isWin = true; payout = bet.amount * 2; } break;
                case 'paritas': if (winningNumber !== 0 && bet.value.toLowerCase() === winningProperties.parity.toLowerCase()) { isWin = true; payout = bet.amount * 2; } break;
            }
            bet.isWin = isWin;
            bet.payout = payout;
            if (isWin) {
                userManager.updateBalance(bet.player.id, bet.amount + payout);
            }
            const profit = payout - bet.amount;
            userManager.recordRouletteResult(bet.player.id, isWin, profit);
        });
        const resultInfo = { winningNumber, ...winningProperties };
        await this.sock.sendMessage(chatId, { text: ui.sendSpinResultMessage(resultInfo, table.bets) });
        this.activeTables.delete(chatId);
    }
}

module.exports = RouletteManager;