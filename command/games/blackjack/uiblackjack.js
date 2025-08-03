function sendTableCreatedMessage(host) {
    return `🃏 *[KASINO BLACKJACK]* 🃏\n\n` +
           `🪑 Meja baru telah dibuka!\n` +
           `💁‍♀️ Host kamu: *${host.name} ${host.emoji}*\n\n` +
           `💰 Kirim \`.bj <jumlah>\` untuk duduk & ikut bermain.\n` +
           `⏳ Meja akan dibatalkan dalam *30 detik* jika tidak ada pemain.`;
}

function sendPlayerJoinedMessage(user, betAmount, playerCount, isFirstPlayer) {
    let message = `🎫 *${user.name}* duduk di meja dengan taruhan *${betAmount} Yuki*.\n` +
                  `Pemain saat ini: (${playerCount}/3)`;
    if (isFirstPlayer) {
        message += `\n\n👑 *${user.name}*, kamu adalah pemilik meja. Ketik \`.bj mulai\` untuk memulai permainan!`;
    }
    return message;
}

function sendTableCancelledMessage() {
    return `❌ Tidak ada pemain yang mendaftar.\nMeja permainan dibatalkan.`;
}

function sendInitialGameMessage(table) {
    let message = `🃏 *BLACKJACK DIMULAI!* 🎰\n\n` +
                  `💁‍♀️ Dealer: *${table.host.name} ${table.host.emoji}*\n\n`;
    table.players.forEach(player => {
        const cardsText = player.cards.map(c => c.rank + c.suit).join(', ');
        message += `🧑 *${player.name}*: ${cardsText} (Total: *${player.total}*)\n`;
    });
    const dealerCardsText = table.dealer.cards.map(c => c.rank + c.suit).join(', ');
    message += `🤖 *Dealer*: ${dealerCardsText}\n\n`;
    const currentPlayer = table.players[0];
    message += `Giliran *${currentPlayer.name}*.\nKetik:\n👉 \`.hit\` - Ambil kartu\n🛑 \`.stand\` - Berhenti`;
    return message;
}

function sendPlayerUpdate(player, action) {
    const cardsText = player.cards.map(c => c.rank + c.suit).join(', ');
    let message = `🃏 *${player.name}* ${action}.\n` +
                  `Kartu kamu: ${cardsText}\n` +
                  `Total: *${player.total}*`;
    if (player.status === 'bust') message += `\n\n💥 **BUST!** Kamu kalah taruhan ini.`;
    else if (player.status === 'stand') message += `\n\n🛑 Kamu memilih untuk **STAND**.`;
    return message;
}

function sendNextTurnMessage(nextPlayer) {
    return `▶️ Sekarang giliran *${nextPlayer.name}*.\nKartu: ${nextPlayer.cards.map(c => c.rank + c.suit).join(', ')} (Total: *${nextPlayer.total}*)\n\nKetik \`.hit\` atau \`.stand\``;
}

function sendDealerTurnMessage(table) {
    const dealerCards = table.dealer.cards.map(c => c.rank + c.suit).join(', ');
    let message = `Semua pemain telah selesai.\n\n` +
                  `🤖 Giliran *Dealer* (${table.host.name}).\n` +
                  `Kartu awal: ${dealerCards}\n` +
                  `Total: *${table.dealer.total}*`;
    return message;
}

function sendFinalResultsMessage(table) {
    const dealerTotal = table.dealer.finalTotal;
    const dealerCards = table.dealer.cards.map(c => c.rank + c.suit).join(', ');
    let message = `🏁 *HASIL AKHIR MEJA* 🏁\n\n` +
                  `🤖 *Dealer* (${dealerTotal > 21 ? 'BUST' : dealerTotal}):\n` +
                  `${dealerCards}\n\n` +
                  `--------------------\n\n`;
    table.players.forEach(player => {
        const playerTotal = player.total;
        const playerCards = player.cards.map(c => c.rank + c.suit).join(', ');
        message += `🧑 *${player.name}* (${playerTotal > 21 ? 'BUST' : playerTotal}):\n` +
                   `${playerCards}\n` +
                   `Hasil: *${player.result.status}* (${player.result.payout > 0 ? '+' : ''}${player.result.payout} Yuki)\n\n`;
    });
    message += `Sesi permainan selesai.`;
    return message;
}

function sendPlayerAFKMessage(playerName) {
    return `⌛ *${playerName}* tidak melakukan aksi dalam 20 detik dan dianggap STAND.\nTaruhanmu hangus!`;
}

function sendHelpMessage() {
    return `📖 *PANDUAN BERMAIN BLACKJACK* 📖\n\n*Tujuan Permainan:*\nDapatkan total nilai kartu sedekat mungkin dengan 21, tanpa melewatinya (BUST). Kamu bermain melawan Dealer.\n\n*Nilai Kartu:*\n- Kartu 2-10: Sesuai angkanya.\n- Kartu J, Q, K: Bernilai 10.\n- Kartu As (A): Bernilai 1 atau 11 (yang paling menguntungkan).\n\n*Daftar Perintah:*\n- \`.bj\`\n  Membuka meja permainan baru di grup.\n\n- \`.bj <jumlah>\`\n  Bergabung ke meja yang ada dengan sejumlah taruhan. Cth: \`.bj 100\`\n\n- \`.bj mulai\`\n  (Hanya pemilik meja) Memulai permainan jika sudah ada pemain.\n\n- \`.bj help\`\n  Menampilkan panduan ini.\n\n- \`.bj stat\`\n  Melihat statistik pribadimu.\n\n- \`.bj rank\`\n  Melihat papan peringkat.\n\n- \`.hit\`\n  (Saat giliranmu) Mengambil satu kartu tambahan.\n\n- \`.stand\`\n  (Saat giliranmu) Berhenti mengambil kartu dan mengakhiri giliranmu.\n\nSemoga beruntung! 🃏`;
}

function sendStartGamePermissionError(isNotOwner) {
    if (isNotOwner) {
        return `❌ Hanya pemilik meja yang bisa memulai permainan.`;
    }
    return `❌ Tidak ada permainan yang bisa dimulai. Pastikan minimal ada 1 pemain.`;
}

function sendStatsMessage(userData, userName) {
    const { balance, bj_wins, bj_losses } = userData;
    const totalGames = bj_wins + bj_losses;
    const winRate = totalGames === 0 ? 0 : ((bj_wins / totalGames) * 100).toFixed(1);

    return `📊 *STATISTIK BLACKJACK - ${userName}* 📊

💰 Saldo Yuki: *${balance}*
✅ Kemenangan: *${bj_wins}*
❌ Kekalahan: *${bj_losses}*
📈 Total Main: *${totalGames}*
🎯 Win Rate: *${winRate}%*`;
}

// =======================================================
// FUNGSI YANG HILANG DI FILE ANDA ADA DI SINI
// =======================================================
function sendBlackjackRankMessage(topPlayers) {
    let message = `🏆 *PAPAN PERINGKAT BLACKJACK* 🏆\n(Berdasarkan Jumlah Kemenangan)\n\n`;
    if (topPlayers.length === 0) {
        message += `Belum ada data peringkat. Ayo main!`;
        return message;
    }

    topPlayers.forEach((player, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = index < 3 ? `${medals[index]} ` : `  ${index + 1}. `;
        message += `${medal}*${player.name}* - ${player.bj_wins} Kemenangan\n`;
    });

    return message;
}


module.exports = {
    sendTableCreatedMessage,
    sendPlayerJoinedMessage,
    sendTableCancelledMessage,
    sendInitialGameMessage,
    sendPlayerUpdate,
    sendNextTurnMessage,
    sendDealerTurnMessage,
    sendFinalResultsMessage,
    sendPlayerAFKMessage,
    sendHelpMessage,
    sendStartGamePermissionError,
    sendStatsMessage,
    sendBlackjackRankMessage, // Pastikan ini diekspor
};