const ui = require('./uiroulette.js');
const userManager = require('../../database/userManager.js');

async function handleSpinCommands(message, manager) {
    const args = message.text.split(' ').slice(1);
    const subCommand = args[0] ? args[0].toLowerCase() : null;

    // Perintah: .spin (menampilkan menu)
    if (args.length === 0) {
        return manager.showMenu(message.chatId);
    }
    
    // Perintah: .spin help (menampilkan panduan)
    if (subCommand === 'help') {
        return { text: ui.sendHelpMessage() };
    }

    // Perintah: .spin mulai
    if (subCommand === 'mulai') {
        return await manager.startGame(message.chatId, message.sender.id);
    }

    // Perintah: .spin stat
    if (subCommand === 'stat') {
        const userData = userManager.getUser(message.sender);
        return { text: ui.sendStatsMessage(userData, message.sender.name) };
    }

    // Perintah: .spin rank
    if (subCommand === 'rank') {
        const topPlayers = userManager.getRouletteTopPlayers();
        return { text: ui.sendRankMessage(topPlayers) };
    }

    // Perintah: .spin <jenis> <nilai> <taruhan>
    if (args.length === 3) {
        const [betType, betValue, betAmountStr] = args;
        const betAmount = parseInt(betAmountStr);

        if (isNaN(betAmount) || betAmount <= 0) return { text: '❌ Jumlah taruhan tidak valid.' };
        
        const betInfo = { type: betType, value: betValue, amount: betAmount };
        return manager.createOrJoinTable(message.chatId, message.sender, betInfo);
    }

    return { text: `Format perintah salah. Cek \`.spin help\` untuk bantuan.` };
}

module.exports = { handleSpinCommands };