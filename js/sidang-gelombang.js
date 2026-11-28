/* Sidang — Berkas #02 Matematika. Soal berupa fungsi sinus BARU
   (bukan sinyal misterius) untuk menguji arti A, B, dan C. */
window.ClueggSidangData = {
  id: "gelombang",
  intro: "Pengadilan memanggilmu sebagai saksi ahli dalam Kasus Sinyal Gelombang. Jaksa akan menguji pemahamanmu tentang amplitudo, periode, dan pergeseran fase.",
  questions: [
    {
      q: "Saksi, sebuah sinyal baru berbentuk y = 3 · sin(x). Berapa tinggi puncak gelombang ini?",
      choices: [{ t: "3", ok: true }, { t: "1" }, { t: "6" }, { t: "3π" }],
      explain: "Pada y = A · sin(Bx + C), tinggi puncak sama dengan amplitudo A. Di sini A = 3, jadi puncaknya di y = 3."
    },
    {
      q: "Berapa panjang satu gelombang penuh (periode) dari y = sin(2x)?",
      choices: [{ t: "π", ok: true }, { t: "2π" }, { t: "4π" }, { t: "2" }],
      explain: "Periode = 2π / B. Dengan B = 2, periodenya 2π / 2 = π. Gelombangnya dua kali lebih rapat daripada sin(x)."
    },
    {
      q: "Grafik y = sin(x + C) tampak bergeser ke KIRI sejauh π/2 dibandingkan y = sin(x). Berapa nilai C?",
      choices: [{ t: "π/2", ok: true }, { t: "−π/2" }, { t: "2" }, { t: "0" }],
      explain: "Menambahkan C positif di dalam sinus menggeser grafik ke kiri sejauh C / B. Dengan B = 1, geser kiri π/2 berarti C = π/2."
    }
  ]
};
