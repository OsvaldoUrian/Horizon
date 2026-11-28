/* Sidang — Berkas #03 Informatika. Soal berupa situasi BARU (jumlah laci berbeda)
   untuk menguji pemahaman binary search. Jumlah langkah maksimum = ⌈log₂(n)⌉
   untuk n yang bukan pangkat dua (500 → 9). */
window.ClueggSidangData = {
  id: "arsip",
  intro: "Pengadilan memanggilmu sebagai saksi ahli dalam Kasus Lemari Arsip. Jaksa akan menguji pemahamanmu tentang strategi pencarian yang kamu temukan.",
  questions: [
    {
      q: "Saksi, ada angka rahasia antara 1 dan 100 dan penjaga hanya menjawab \"lebih besar\" atau \"lebih kecil\". Strategi paling cepat adalah selalu menebak…",
      choices: [{ t: "Angka di tengah rentang yang tersisa", ok: true }, { t: "Angka terkecil yang tersisa" }, { t: "Angka acak" }, { t: "Angka terbesar yang tersisa" }],
      explain: "Menebak di tengah selalu membuang setengah kemungkinan, apa pun jawaban penjaga. Inilah binary search."
    },
    {
      q: "Lemari arsip berisi 500 laci yang terurut. Dengan strategi membagi dua, berapa langkah MAKSIMUM untuk menemukan satu berkas?",
      choices: [{ t: "9", ok: true }, { t: "50" }, { t: "250" }, { t: "500" }],
      explain: "500 → 250 → 125 → 63 → 32 → 16 → 8 → 4 → 2 → 1. Karena 2⁹ = 512 ≥ 500, sembilan langkah selalu cukup."
    },
    {
      q: "Dalam keadaan apa binary search TIDAK bisa dipakai?",
      choices: [{ t: "Saat datanya tidak terurut", ok: true }, { t: "Saat datanya sangat banyak" }, { t: "Saat datanya berupa angka" }, { t: "Saat datanya sedikit" }],
      explain: "Binary search hanya bekerja pada data terurut. Tanpa urutan, jawaban \"lebih besar/kecil\" tidak bisa membuang setengah data."
    }
  ]
};
