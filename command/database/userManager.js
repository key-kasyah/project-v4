const { db } = require('./initDatabase.js');

function getUser(user) {
    let userData = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    if (!userData) {
        const initialBalance = 1000;
        const defaultData = { id: user.id, name: user.name, balance: initialBalance, bj_wins: 0, bj_losses: 0, rl_wins: 0, rl_losses: 0, rl_profit: 0 };
        const columns = Object.keys(defaultData).join(', ');
        const placeholders = Object.keys(defaultData).map(() => '?').join(', ');
        db.prepare(`INSERT INTO users (${columns}) VALUES (${placeholders})`).run(...Object.values(defaultData));
        return defaultData;
    }
    return userData;
}

function updateBalance(userId, amount) {
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, userId);
}

function recordBlackjackResult(userId, isWin) {
    const column = isWin ? 'bj_wins' : 'bj_losses';
    db.prepare(`UPDATE users SET ${column} = ${column} + 1 WHERE id = ?`).run(userId);
}

function getBlackjackTopPlayers() {
    return db.prepare('SELECT name, bj_wins FROM users WHERE bj_wins > 0 ORDER BY bj_wins DESC LIMIT 5').all();
}

function recordRouletteResult(userId, isWin, profit) {
    const winColumn = isWin ? 'rl_wins' : 'rl_losses';
    db.prepare(`UPDATE users SET ${winColumn} = ${winColumn} + 1, rl_profit = rl_profit + ? WHERE id = ?`).run(profit, userId);
}

function getRouletteTopPlayers() {
    return db.prepare('SELECT name, rl_profit FROM users WHERE rl_profit != 0 ORDER BY rl_profit DESC LIMIT 5').all();
}

module.exports = {
    getUser,
    updateBalance,
    recordBlackjackResult,
    getBlackjackTopPlayers,
    recordRouletteResult,
    getRouletteTopPlayers,
};