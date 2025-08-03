.# Struktur Proyek Bot WhatsApp

Struktur ini dirancang untuk skalabilitas dan kejelasan, memisahkan logika inti, manajemen game, data, dan antarmuka pengguna.

## 📁 `command/`

Folder utama untuk semua perintah bot.

### 📁 `games/`

Modul yang berhubungan dengan game.

#### 📁 `blackjack/`

* [cite_start]**`blackjack.js`**: Otak utama game yang berisi semua aturan dan logika dasar Blackjack. [cite: 2, 3, 4] [cite_start]File ini tidak bergantung pada modul lain. [cite: 2]
* [cite_start]**`blackjackManager.js`**: Bertindak sebagai "wasit" atau sutradara yang menghubungkan `blackjack.js` dengan pengguna (bot) dan database (`statsManager.js`). [cite: 6] [cite_start]Ia mengelola alur dan sesi permainan. [cite: 9]
* [cite_start]**`statsManager.js`**: Fokus mengelola data statistik pemain seperti kemenangan dan kekalahan, berinteraksi langsung dengan database. [cite: 13, 16]
* [cite_start]**`uiBlackjack.js`**: Bertanggung jawab untuk memformat semua pesan dan teks yang dilihat oleh pengguna terkait game Blackjack. [cite: 17, 42] [cite_start]Penggunaan nama spesifik ini lebih baik untuk kejelasan dan skalabilitas proyek. [cite: 41, 43, 46]

### 📁 `database/`

[cite_start]Fondasi untuk penyimpanan data, dapat digunakan oleh berbagai modul. [cite: 22]

* [cite_start]**`initDatabase.js`**: Menyiapkan file database (`bot.db`) dan membuat tabel yang diperlukan saat bot pertama kali dijalankan. [cite: 23, 24, 25]
* [cite_start]**`userManager.js`**: Pintu gerbang utama untuk semua operasi terkait data pengguna umum, seperti menambah pengguna baru, mengambil profil, dan memperbarui saldo. [cite: 26, 27, 28]
* [cite_start]**`bot.db`**: File database fisik berformat SQLite tempat semua data disimpan. [cite: 29, 30]