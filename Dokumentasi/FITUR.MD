blackjack.js (Otak Permainan / The Game Engine)
Peran Utama: Seperti yang Anda katakan, ini adalah otak dari permainan. File ini tidak tahu-menahu tentang WhatsApp, database, atau siapa pemainnya. Ia hanya tahu aturan Blackjack.

Tanggung Jawab:

Membuat dan mengocok dek kartu.

Menarik kartu (dealCard).

Menghitung total nilai kartu di tangan (termasuk logika kartu As yang bisa bernilai 1 atau 11).

Mengecek kondisi menang, kalah (bust), atau seri (push).

Menyimpan status satu sesi permainan: kartu pemain, kartu bandar (dealer), dan status permainan saat ini (sedang berjalan, selesai).

Contoh Fungsi di dalamnya: createDeck(), shuffleDeck(), calculateHandValue(), isBust(), determineWinner().

blackjackManager.js (Wasit / The Game Director)
Peran Utama: Ini adalah "wasit" atau sutradara permainan. File inilah yang menghubungkan logika game (blackjack.js) dengan pengguna (bot WA) dan data (statsManager.js).

Tanggung Jawab:

Menerima perintah dari file bot utama (misalnya, saat pengguna mengetik !blackjack).

Memeriksa apakah pemain sudah memiliki game yang sedang berjalan.

Memulai sesi permainan baru dengan memanggil fungsi dari blackjack.js.

Mengelola alur permainan: kapan giliran pemain, kapan giliran bandar.

Menerima input dari pemain (misalnya, hit atau stand).

Setelah permainan selesai, ia memanggil statsManager.js untuk mencatat hasilnya (menang/kalah).

Ia juga memanggil ui.js untuk memformat tampilan yang akan dikirim ke pengguna.

Analogi: Jika blackjack.js adalah papan catur dan bidaknya, maka blackjackManager.js adalah kedua pemain yang menggerakkan bidak sesuai giliran dan aturan.

statsManager.js (Manajer Statistik)
Peran Utama: Fokus utamanya adalah mengelola data statistik pemain yang berhubungan dengan game Blackjack.

Tanggung Jawab:

Menyediakan fungsi untuk mencatat kemenangan (incrementWin()) dan kekalahan (incrementLoss()) seorang pemain.

Mengambil data statistik (WR, jumlah main, dll.) dari database untuk pemain tertentu.

Berinteraksi langsung dengan file database (userManager.js atau langsung ke bot.db) untuk menyimpan dan mengambil data.

Contoh Fungsi: recordWin(userId), recordLoss(userId), getPlayerStats(userId).

ui.js (Tampilan / The User Interface)
Peran Utama: Bertanggung jawab atas semua teks dan format pesan yang akan dilihat oleh pengguna. Ini memisahkan logika dari presentasi.

Tanggung Jawab:

Membuat pesan untuk menampilkan kartu di tangan pemain dan bandar.

Membuat pesan untuk memberitahu status permainan (misalnya, "Anda menang!", "Bust! Anda kalah.").

Menampilkan papan peringkat (leaderboard) jika ada.

Keuntungan: Jika Anda ingin mengubah tampilan pesan (misalnya, dari teks biasa menjadi lebih menarik dengan emoji 🃏💰), Anda hanya perlu mengubah file ini tanpa menyentuh logika permainan sama sekali.

🗄️ Modul Database: command/database/
Folder ini adalah fondasi untuk penyimpanan data. Dengan memisahkannya, modul lain seperti games atau modul masa depan lainnya dapat menggunakan fungsi yang sama untuk berinteraksi dengan database.

initDatabase.js (Inisialisasi Database)
Peran Utama: Menyiapkan database saat bot pertama kali dijalankan.

Tanggung Jawab:

Membuat file bot.db jika belum ada.

Membuat tabel-tabel yang dibutuhkan di dalam database. Misalnya, tabel users dengan kolom userId, name, balance, blackjack_wins, blackjack_losses.

Fungsi ini biasanya hanya dijalankan sekali saat aplikasi dimulai.

userManager.js (Manajer Pengguna)
Peran Utama: Sebagai pintu gerbang utama untuk semua operasi yang berkaitan dengan data pengguna secara umum.

Tanggung Jawab:

Menambahkan pengguna baru ke database saat mereka pertama kali berinteraksi dengan bot.

Mengambil data profil pengguna (getUser(userId)).

Mengubah data pengguna, misalnya mengurangi atau menambah saldo (updateBalance(userId, amount)).

Menyediakan fungsi-fungsi yang akan dipanggil oleh statsManager.js untuk memperbarui data kemenangan/kekalahan di tabel users.

bot.db
Peran Utama: Ini adalah file database fisiknya yang menggunakan format SQLite. Semua data pengguna, statistik, dan informasi lainnya akan disimpan di sini dalam bentuk tabel.