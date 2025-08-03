# ♠️ Fitur Game: Kasino Blackjack

Berikut adalah detail tahapan dan alur permainan Blackjack dari awal hingga akhir.

### **Tahap 1: Membuka Meja Permainan**

* **Perintah:** `.bj`
* [cite_start]**Tujuan:** Membuat sesi permainan baru yang dapat diikuti oleh pemain lain. [cite: 48]
* **Proses:**
    1.  [cite_start]Bot memeriksa apakah pengguna sudah memiliki sesi aktif. [cite: 48]
    2.  [cite_start]Jika tidak, bot akan membuat `tableId` unik dan memilih "Host" secara acak. [cite: 49]
    3.  [cite_start]Sebuah sesi meja baru dibuat dengan status `waiting`. [cite: 49]
    4.  [cite_start]Bot mengirimkan pesan undangan ke grup, mengumumkan bahwa meja telah dibuka dan memberikan waktu 30 detik bagi pemain lain untuk bergabung. [cite: 50, 51]

### **Tahap 2: Bergabung ke Meja**

* **Perintah:** `.bj <jumlah_taruhan>` (contoh: `.bj 100`)
* [cite_start]**Tujuan:** Mendaftarkan pengguna sebagai pemain di meja yang aktif. [cite: 52]
* **Proses:**
    1.  [cite_start]Bot memvalidasi jumlah taruhan dan memastikan saldo pengguna mencukupi. [cite: 52]
    2.  [cite_start]Bot memeriksa apakah ada meja dengan status `waiting` dan slot pemain masih tersedia (maksimal 3 pemain). [cite: 52]
    3.  [cite_start]Pengguna ditambahkan ke dalam daftar pemain di sesi meja tersebut. [cite: 52]
    4.  [cite_start]Saldo pengguna dikurangi sementara (taruhan dikunci). [cite: 53]
    5.  [cite_start]Bot mengirim pesan konfirmasi bahwa pemain telah berhasil duduk di meja. [cite: 53]

### **Tahap 3: Permainan Dimulai**

* [cite_start]**Pemicu:** Timer 30 detik untuk bergabung berakhir. [cite: 54]
* **Proses:**
    1.  [cite_start]Jika tidak ada pemain yang bergabung, meja dibatalkan. [cite: 55]
    2.  [cite_start]Jika ada minimal satu pemain, status meja diubah menjadi `playing`. [cite: 55]
    3.  [cite_start]Bot membagikan dua kartu kepada setiap pemain dan dua kartu kepada Dealer (satu kartu Dealer tertutup). [cite: 55]

### **Tahap 4: Tampilan Awal Permainan**

* [cite_start]**Proses:** Bot mengirimkan pesan yang menampilkan kartu awal setiap pemain beserta total nilainya, dan kartu Dealer yang terlihat. [cite: 56]
* [cite_start]**Aksi Pengguna:** Pemain diberikan pilihan untuk melakukan `.hit` (ambil kartu) atau `.stand` (berhenti). [cite: 56]

### **Tahap 5: Giliran Pemain**

* **Perintah:** `.hit` atau `.stand`
* **Proses:**
    * `.hit`: Pemain menerima satu kartu tambahan. [cite_start]Jika total nilai kartu melebihi 21, status pemain menjadi `bust` (kalah). [cite: 57]
    * [cite_start]`.stand`: Giliran pemain selesai. [cite: 57]
    * [cite_start]Setelah semua pemain `stand` atau `bust`, giliran berpindah ke Dealer. [cite: 57]

### **Tahap 6: Giliran Dealer**

* **Proses:**
    1.  [cite_start]Dealer membuka kartu keduanya. [cite: 57]
    2.  [cite_start]Dealer akan terus mengambil kartu (`hit`) hingga total nilainya mencapai 17 atau lebih. [cite: 57]

### **Tahap 7: Penilaian Akhir**

* **Proses:**
    1.  [cite_start]Total nilai kartu setiap pemain yang tidak `bust` akan dibandingkan dengan total nilai kartu Dealer. [cite: 57]
    2.  [cite_start]Bot menentukan status setiap pemain (menang, kalah, atau seri). [cite: 57]
    3.  [cite_start]Database diperbarui untuk mencatat hasil (kemenangan/kekalahan) dan menyesuaikan saldo pemain. [cite: 57]
    4.  [cite_start]Bot mengirimkan pesan berisi hasil akhir permainan ke grup. [cite: 58]

### **Tahap 8: Sesi Berakhir**

* [cite_start]**Proses:** Sesi meja permainan dihapus dari memori untuk memungkinkan permainan baru. [cite: 58]

### **Tahap 9: Papan Peringkat**

* **Perintah:** `.bjrank`
* **Tujuan:** Menampilkan peringkat pemain berdasarkan jumlah kemenangan.
* [cite_start]**Proses:** Bot akan mengambil data dari database dan mengirimkan daftar peringkat pemain. [cite: 58]

# 🎡 Fitur Game: Roulette Spin

Berikut adalah detail tahapan dan alur permainan Roulette (.spin).

### **1. Pemanggilan Game**

* **Perintah:** `.spin`
* **Tujuan:** Menampilkan menu utama permainan Roulette.
* **Proses:** Bot akan merespons dengan menampilkan berbagai jenis taruhan yang tersedia beserta potensi kemenangannya.

### **2. Pemrosesan Taruhan**

* **Perintah:** `.spin <jenis> <nilai> <taruhan>`
* **Contoh:**
    * `.spin number 17 100`
    * `.spin color red 200`
    * `.spin parity odd 50`
* **Proses:**
    1.  Bot memvalidasi format perintah dan input taruhan.
    2.  Memeriksa apakah saldo pengguna mencukupi.
    3.  Mengunci saldo pengguna sesuai jumlah taruhan.
    4.  Menyimpan sesi permainan spin pengguna.

### **3. Proses Spin**

* **Pemicu:** Setelah taruhan berhasil diproses.
* **Proses:**
    1.  Bot memberikan jeda sekitar 3 detik untuk membangun antisipasi.
    2.  Sebuah angka acak antara 0 hingga 36 akan dipilih.
    3.  Bot menentukan properti dari angka tersebut (warna: Merah/Hitam, paritas: Ganjil/Genap).

### **4. Hasil dan Pembayaran**

* **Proses:** Bot mengirimkan pesan yang berisi hasil angka yang keluar beserta propertinya (warna dan paritas).
* **Aksi:**
    * Jika taruhan pengguna cocok dengan hasil, bot akan mengumumkan kemenangan dan menambahkan hadiah ke saldo pengguna.
    * Jika tidak, bot akan mengumumkan kekalahan.

### **5. Pembaruan Database**

* **Proses:** Setelah permainan selesai, database akan diperbarui untuk mencatat status menang/kalah dan menyesuaikan saldo akhir pemain.

### **6. Statistik Pemain**

* **Perintah:** `.spin stat`
* **Tujuan:** Menampilkan statistik pribadi pemain dalam game Roulette.
* **Output:** Bot akan mengirimkan pesan berisi total menang, kalah, dan total profit/kerugian pengguna.

### **7. Papan Peringkat**

* **Perintah:** `.spin rank`
* **Tujuan:** Menampilkan peringkat pemain berdasarkan total profit.
* **Output:** Bot akan mengirimkan daftar pemain yang diurutkan berdasarkan profit tertinggi di game Roulette.

### **Rencana Pengembangan**

* **Multiplayer:** Menerapkan sistem di mana beberapa pemain bisa memasang taruhan dalam satu sesi spin bersama, mirip dengan game Blackjack. Satu putaran akan menentukan hasil untuk semua pemain yang berpartisipasi.