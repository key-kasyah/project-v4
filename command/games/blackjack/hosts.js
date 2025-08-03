// File ini hanya berisi array data untuk para host/dealer.
// Bisa dengan mudah ditambah atau diubah tanpa menyentuh logika game.

const hosts = [
  { name: 'Yor Forger', emoji: '🖤' },
  { name: 'Loid Forger', emoji: '🔫' },
  { name: 'Anya Forger', emoji: '🥜' },
  { name: 'Levi Ackerman', emoji: '⚔️' },
  { name: 'Gojo Satoru', emoji: '👁️' },
];

// Fungsi untuk memilih host secara acak
function getRandomHost() {
  const randomIndex = Math.floor(Math.random() * hosts.length);
  return hosts[randomIndex];
}

module.exports = { getRandomHost };
