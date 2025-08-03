function sendMenuMessage(table, chatId) {
    if (table) {
        const players = table.players.map(p => p.name).join(', ');
        return `🎡 *MEJA ROULETTE AKTIF* 🎡\n\n` +
               `Pemain di meja: *${players}* (${table.players.length}/5)\n\n` +
               `Ketik \`.spin <jenis> <nilai> <taruhan>\` untuk bergabung.`;
    } else {
        return `🎡 *ROULETTE SPIN* 🎰\n\n` +
               `Belum ada meja permainan.\n` +
               `Jadilah yang pertama bertaruh untuk membuka meja baru!\n\n` +
               `*Cara Bertaruh:*\n` +
               `Ketik: \`.spin <jenis> <nilai> <taruhan>\`\n\n` +
               `*Contoh:*\n` +
               `\`.spin angka 17 100\`\n` +
               `\`.spin warna merah 200\`\n` +
               `\`.spin paritas ganjil 50\`\n\n`+
               `Butuh penjelasan lebih? Ketik \`.spin help\``;
    }
}

function sendHelpMessage() {
    return `📖 *PANDUAN ROULETTE UNTUK PEMULA* 📖

*Apa itu Roulette?*
Kamu pasang taruhan pada sebuah angka, warna, atau jenis angka (Ganjil/Genap). Lalu, roda akan diputar. Jika bola berhenti di tebakanmu, kamu menang!

*Jenis-Jenis Taruhan:*
1️⃣ *Taruhan Angka (0-36)*
   Tebak 1 angka pasti. Kalau kena, hadiahnya paling besar (35x lipat taruhan)!
   Contoh: \`.spin angka 17 100\`

🔴⚫ *Taruhan Warna*
   Cuma tebak warnanya: **Merah** atau **Hitam**. Peluang menangnya hampir 50%.
   Contoh: \`.spin warna merah 200\`

➊➋ *Taruhan Ganjil/Genap (Paritas)*
   Tebak apakah angkanya akan Ganjil atau Genap. Peluangnya juga hampir 50%.
   Contoh: \`.spin paritas ganjil 50\`

*Langkah-Langkah Bermain:*
1️⃣ *Buka Meja & Bertaruh*
   Ketik taruhanmu untuk membuka meja. Meja akan terbuka selama 20 detik untuk pemain lain.

2️⃣ *Tunggu Pemain Lain*
   Pemain lain bisa ikut bertaruh di meja yang sama. Maksimal 5 pemain.

3️⃣ *Mulai Putaran*
   Jika pemain kurang dari 5, Host (pemain pertama) harus mengetik \`.spin mulai\` untuk memutar roda. Jika meja penuh, roda berputar otomatis.

*Perintah Lainnya:*
- \`.spin stat\` : Cek statistik pribadimu.
- \`.spin rank\` : Lihat 5 pemain terbaik.
- \`.spin help\` : Menampilkan pesan ini lagi.`;
}

function sendPlayerJoinedMessage(user, betInfo, playerCount) {
    return `✅ *${user.name}* bergabung ke meja dengan taruhan *${betInfo.amount} Yuki* pada *${betInfo.type} ${betInfo.value}*.\n` +
           `Pemain saat ini: (${playerCount}/5)`;
}

function sendBettingClosedMessage(hostName, playerCount) {
    if (playerCount < 5) {
        return `⏱️ Waktu bergabung habis! Meja ditutup dengan *${playerCount}* pemain.\n\n` +
               `👑 *${hostName}*, kamu punya waktu 1 menit untuk memulai permainan dengan mengetik \`.spin mulai\`.`;
    } else {
        return `👥 Meja penuh! Roda akan segera berputar...`;
    }
}

function sendNewHostMessage(newHostName) {
    return `⌛ Host sebelumnya tidak memulai permainan.\n` +
           `👑 Hak host sekarang berpindah ke *${newHostName}*. Silakan ketik \`.spin mulai\`.`;
}

function sendSpinResultMessage(result, bets) {
    const { winningNumber, color, parity } = result;
    const colorEmoji = color === 'Merah' ? '🔴' : (color === 'Hitam' ? '⚫' : '🟢');
    let message = `🎡 Roda telah berputar... dan berhenti di:\n\n` +
                  `🎯 *HASIL: ${winningNumber} ${colorEmoji} ${parity}* 🎯\n\n` +
                  `--------------------\n\n`;
    bets.forEach(bet => {
        const player = bet.player;
        message += `*Taruhan ${player.name}:* ${bet.type} ${bet.value} (${bet.amount} Yuki)\n`;
        if (bet.isWin) {
            message += `✅ *Menang!* (+${bet.payout} Yuki)\n\n`;
        } else {
            message += `❌ *Kalah!*\n\n`;
        }
    });
    message += `Sesi permainan selesai.`;
    return message;
}

function sendStatsMessage(userData, userName) {
    const { balance, rl_wins, rl_losses, rl_profit } = userData;
    const totalGames = rl_wins + rl_losses;
    const winRate = totalGames === 0 ? 0 : ((rl_wins / totalGames) * 100).toFixed(1);

    return `📈 *STATISTIK ROULETTE - ${userName}* 📈

💰 Saldo Yuki: *${balance}*
✅ Menang: *${rl_wins}*
❌ Kalah: *${rl_losses}*
📈 Total Main: *${totalGames}*
🎯 Win Rate: *${winRate}%*
💸 Total Profit: *${rl_profit > 0 ? '+' : ''}${rl_profit}* Yuki`;
}

function sendRankMessage(topPlayers) {
    let message = `🏆 *PAPAN PERINGKAT ROULETTE* 🏆\n(Berdasarkan Total Profit)\n\n`;
    if (topPlayers.length === 0) {
        return message + `Belum ada data peringkat. Ayo main!`;
    }
    topPlayers.forEach((player, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = index < 3 ? `${medals[index]} ` : `  ${index + 1}. `;
        message += `${medal}*${player.name}* - Profit: ${player.rl_profit > 0 ? '+' : ''}${player.rl_profit} Yuki\n`;
    });
    return message;
}

module.exports = {
    sendMenuMessage,
    sendHelpMessage,
    sendPlayerJoinedMessage,
    sendBettingClosedMessage,
    sendNewHostMessage,
    sendSpinResultMessage,
    sendStatsMessage,
    sendRankMessage,
};