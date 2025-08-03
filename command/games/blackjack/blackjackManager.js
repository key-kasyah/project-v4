const { getRandomHost } = require('./hosts.js');
const ui = require('./uiBlackjack.js');
const userManager = require('../../database/userManager.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class BlackjackManager {
    constructor(sock) {
        this.sock = sock;
        this.activeTables = new Map();
        console.log('✅ Blackjack Manager (Class) telah diinisialisasi.');
    }

    _createDeck() {
        const suits = ['♠️', '♥️', '♦️', '♣️'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                let value = parseInt(rank);
                if (['J', 'Q', 'K'].includes(rank)) value = 10;
                if (rank === 'A') value = 11;
                deck.push({ suit, rank, value });
            }
        }
        return deck;
    }

    _shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    _calculateHandValue(cards) {
        let total = 0;
        let aceCount = 0;
        cards.forEach(card => {
            total += card.value;
            if (card.rank === 'A') aceCount++;
        });
        while (total > 21 && aceCount > 0) {
            total -= 10;
            aceCount--;
        }
        return total;
    }
    
    _startTurnTimer(chatId, playerId) {
        const table = this.activeTables.get(chatId);
        if (!table) return;
        table.turnTimeout = setTimeout(() => {
            this._forceStand(chatId, playerId);
        }, 20000);
    }

    async _forceStand(chatId, playerId) {
        const table = this.activeTables.get(chatId);
        if (!table || table.status !== 'playing') return;
        const currentPlayer = table.players[table.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== playerId) return;
        currentPlayer.status = 'bust';
        const message = ui.sendPlayerAFKMessage(currentPlayer.name);
        await this.sock.sendMessage(chatId, { text: message });
        await sleep(1000);
        await this._nextTurn(chatId);
    }

    async _nextTurn(chatId) {
        const table = this.activeTables.get(chatId);
        if (!table) return;
        table.currentPlayerIndex++;
        if (table.currentPlayerIndex < table.players.length) {
            const nextPlayer = table.players[table.currentPlayerIndex];
            await this.sock.sendMessage(chatId, { text: ui.sendNextTurnMessage(nextPlayer) });
            this._startTurnTimer(chatId, nextPlayer.id);
        } else {
            await this._dealerTurn(chatId);
        }
    }
    
    async _dealerTurn(chatId) {
        const table = this.activeTables.get(chatId);
        if (!table) return;
        table.dealer.cards[1].rank = table.dealer.hiddenCard.rank;
        table.dealer.cards[1].suit = table.dealer.hiddenCard.suit;
        table.dealer.total = this._calculateHandValue(table.dealer.cards);
        await this.sock.sendMessage(chatId, { text: ui.sendDealerTurnMessage(table) });
        await sleep(2000);
        while (table.dealer.total < 17) {
            const newCard = table.deck.pop();
            table.dealer.cards.push(newCard);
            table.dealer.total = this._calculateHandValue(table.dealer.cards);
            await this.sock.sendMessage(chatId, { text: `🤖 Dealer mengambil kartu... Total sekarang *${table.dealer.total}*` });
            await sleep(2000);
        }
        if (table.dealer.total > 21) {
            await this.sock.sendMessage(chatId, { text: `💥 Dealer BUST!` });
        } else {
            await this.sock.sendMessage(chatId, { text: `🛑 Dealer STAND dengan total *${table.dealer.total}*.` });
        }
        await sleep(1000);
        await this._calculateResults(chatId);
    }

    async _calculateResults(chatId) {
        const table = this.activeTables.get(chatId);
        if (!table) return;
        const dealerTotal = table.dealer.total;
        table.dealer.finalTotal = dealerTotal;
        for (const player of table.players) {
            const playerTotal = player.total;
            let result = { status: '', payout: 0 };
            const isPlayerBlackjack = playerTotal === 21 && player.cards.length === 2;
            if (player.status === 'bust') {
                result = { status: 'KALAH (BUST)', payout: -player.bet };
            } else if (dealerTotal > 21) {
                result = { status: 'MENANG (Dealer BUST)', payout: player.bet };
            } else if (isPlayerBlackjack && dealerTotal !== 21) {
                result = { status: 'BLACKJACK!', payout: player.bet * 1.5 };
            } else if (playerTotal > dealerTotal) {
                result = { status: 'MENANG', payout: player.bet };
            } else if (playerTotal === dealerTotal) {
                result = { status: 'SERI (PUSH)', payout: 0 };
            } else {
                result = { status: 'KALAH', payout: -player.bet };
            }
            player.result = result;
            userManager.updateBalance(player.id, result.payout);
            if (result.status.includes('MENANG') || result.status.includes('BLACKJACK')) {
                userManager.recordBlackjackResult(player.id, true);
            } else if (result.status.includes('KALAH')) {
                userManager.recordBlackjackResult(player.id, false);
            }
        }
        const message = ui.sendFinalResultsMessage(table);
        await this.sock.sendMessage(chatId, { text: message });
        this.activeTables.delete(chatId);
    }

    createTable(chatId) {
        if (this.activeTables.has(chatId)) {
            return { text: '❌ Meja di grup ini sudah ada. Kirim `.bj <jumlah>` untuk bergabung.' };
        }
        const host = getRandomHost();
        const newTable = {
            tableId: `BJ-${Date.now()}`,
            host: host,
            chatId: chatId,
            status: 'waiting',
            ownerId: null,
            players: [],
            timeout: setTimeout(() => {
                const table = this.activeTables.get(chatId);
                if (table && table.players.length === 0) {
                    this.sock.sendMessage(chatId, { text: ui.sendTableCancelledMessage() });
                    this.activeTables.delete(chatId);
                }
            }, 30000),
        };
        this.activeTables.set(chatId, newTable);
        return { text: ui.sendTableCreatedMessage(host) };
    }
    
    addPlayer(chatId, user, betAmount) {
        const userData = userManager.getUser(user);
        if (userData.balance < betAmount) {
            return { text: `❌ Saldo Anda tidak cukup! Saldo Anda saat ini: ${userData.balance} Yuki.` };
        }
        const table = this.activeTables.get(chatId);
        if (!table) {
            return { text: 'ℹ️ Tidak ada meja yang sedang menunggu pemain. Ketik `.bj` untuk membuat meja baru.' };
        }
        if (table.status !== 'waiting') {
            return { text: '❌ Permainan sudah dimulai, tidak bisa bergabung.' };
        }
        if (table.players.length >= 3) {
            return { text: '❌ Meja sudah penuh.' };
        }
        if (table.players.some(p => p.id === user.id)) {
            return { text: `✋ ${user.name}, kamu sudah duduk di meja ini.` };
        }
        const isFirstPlayer = table.players.length === 0;
        if (isFirstPlayer) {
            clearTimeout(table.timeout);
            table.ownerId = user.id;
        }
        table.players.push({ id: user.id, name: user.name, bet: betAmount, cards: [], total: 0, status: 'playing' });
        return { text: ui.sendPlayerJoinedMessage(user, betAmount, table.players.length, isFirstPlayer) };
    }

    async manuallyStartGame(chatId, userId) {
        const table = this.activeTables.get(chatId);
        if (!table || table.ownerId !== userId || table.status !== 'waiting' || table.players.length === 0) {
            return { text: ui.sendStartGamePermissionError(table && table.ownerId !== userId) };
        }
        table.status = 'playing';
        table.currentPlayerIndex = 0;
        const deck = this._createDeck();
        this._shuffleDeck(deck);
        table.deck = deck;

        table.dealer = { cards: [] };
        for (let i = 0; i < 2; i++) {
            for (const player of table.players) player.cards.push(table.deck.pop());
            table.dealer.cards.push(table.deck.pop());
        }
        table.players.forEach(p => p.total = this._calculateHandValue(p.cards));
        table.dealer.hiddenCard = table.dealer.cards[1];
        table.dealer.total = table.dealer.cards[0].value;
        
        await this.sock.sendMessage(chatId, { text: ui.sendInitialGameMessage({
            ...table,
            dealer: { ...table.dealer, cards: [table.dealer.cards[0], {rank: '❓', suit: ''}]}
        })});
        
        const firstPlayer = table.players[0];
        if (firstPlayer) {
            this._startTurnTimer(chatId, firstPlayer.id);
        }
        return null;
    }

    async playerHit(chatId, userId) {
        const table = this.activeTables.get(chatId);
        if (!table || table.status !== 'playing') return;
        const currentPlayer = table.players[table.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== userId) return;
        clearTimeout(table.turnTimeout);
        const newCard = table.deck.pop();
        currentPlayer.cards.push(newCard);
        currentPlayer.total = this._calculateHandValue(currentPlayer.cards);
        let action = "mengambil kartu";
        if (currentPlayer.total > 21) {
            currentPlayer.status = 'bust';
            action = "BUST";
        }
        await this.sock.sendMessage(chatId, { text: ui.sendPlayerUpdate(currentPlayer, action) });
        if (currentPlayer.status === 'bust') {
            await this._nextTurn(chatId);
        } else {
            this._startTurnTimer(chatId, currentPlayer.id);
        }
    }
    
    async playerStand(chatId, userId) {
        const table = this.activeTables.get(chatId);
        if (!table || table.status !== 'playing') return;
        const currentPlayer = table.players[table.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== userId) return;
        clearTimeout(table.turnTimeout);
        currentPlayer.status = 'stand';
        await this.sock.sendMessage(chatId, { text: ui.sendPlayerUpdate(currentPlayer, "memilih STAND") });
        await this._nextTurn(chatId);
    }
}

module.exports = BlackjackManager;