const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, 'bot.db');
const db = new Database(dbPath, { verbose: console.log });

function initDatabase() {
    console.log(`Menginisialisasi database di: ${dbPath}`);
    
    const createUsersTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            balance INTEGER DEFAULT 1000,
            bj_wins INTEGER DEFAULT 0,
            bj_losses INTEGER DEFAULT 0,
            rl_wins INTEGER DEFAULT 0,
            rl_losses INTEGER DEFAULT 0,
            rl_profit INTEGER DEFAULT 0
        )
    `);
    
    createUsersTable.run();

    const columns = db.pragma('table_info(users)').map(col => col.name);
    if (!columns.includes('rl_wins')) {
        db.exec('ALTER TABLE users ADD COLUMN rl_wins INTEGER DEFAULT 0');
    }
    if (!columns.includes('rl_losses')) {
        db.exec('ALTER TABLE users ADD COLUMN rl_losses INTEGER DEFAULT 0');
    }
    if (!columns.includes('rl_profit')) {
        db.exec('ALTER TABLE users ADD COLUMN rl_profit INTEGER DEFAULT 0');
    }

    console.log('Tabel "users" siap.');
}

module.exports = { initDatabase, db };