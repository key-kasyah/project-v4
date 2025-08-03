const ui = require('./uiBlackjack.js');
const userManager = require('../../database/userManager.js');

async function handleBlackjackCommands(message, manager) {
    const command = message.text.split(' ')[0].toLowerCase();
    const args = message.text.split(' ').slice(1);
    
    let response = null;

    if (command === '.bj') {
        const subCommand = args[0] ? args[0].toLowerCase() : null;

        if (args.length === 0) {
            response = manager.createTable(message.chatId);
        } else if (subCommand === 'mulai') {
            response = await manager.manuallyStartGame(message.chatId, message.sender.id);
        } else if (subCommand === 'help') {
            response = { text: ui.sendHelpMessage() };
        } else if (subCommand === 'stat') {
            // Logika untuk .bj stat (sudah benar)
            const userData = userManager.getUser(message.sender);
            response = { text: ui.sendStatsMessage(userData, message.sender.name) };
        } else if (subCommand === 'rank') {
            // =======================================================
            // PERBAIKAN DI SINI: Panggil nama fungsi yang benar
            // =======================================================
            const topPlayers = userManager.getBlackjackTopPlayers(); 
            response = { text: ui.sendBlackjackRankMessage(topPlayers) };
        } else if (!isNaN(subCommand)) {
            const betAmount = parseInt(subCommand);
            if (betAmount <= 0) return { text: 'Jumlah taruhan tidak valid!' };
            response = manager.addPlayer(message.chatId, message.sender, betAmount);
        } else {
            response = { text: `Perintah tidak dikenali. Gunakan \`.bj help\` untuk bantuan.` };
        }
    } else if (command === '.hit') {
        await manager.playerHit(message.chatId, message.sender.id);
    } else if (command === '.stand') { // Perbaikan kecil: hapus titik agar konsisten
        await manager.playerStand(message.chatId, message.sender.id);
    }

    return response;
}

module.exports = { handleBlackjackCommands };