/* Sidang — Berkas #01 Fisika. Soal berupa situasi BARU yang menguji pemahaman
   rumus R = v² · sin(2θ) / g (bukan mengulang pertanyaan briefing/deduksi). */
window.ClueggSidangData = {
  id: "parabola",
  intro: "Pengadilan memanggilmu sebagai saksi ahli dalam Kasus Tembakan Terjauh. Jaksa akan menguji apakah temuanmu tentang gerak parabola benar-benar kamu pahami.",
  questions: [
    {
      q: "Saksi, sebuah bola ditembakkan dengan sudut 20°. Pada kecepatan dan gravitasi yang sama, sudut berapa lagi yang menghasilkan jarak tembak yang SAMA?",
      choices: [{ t: "70°", ok: true }, { t: "40°" }, { t: "45°" }, { t: "160°" }],
      explain: "Pasangan sudut yang jumlahnya 90° memberi jarak yang sama, karena sin(2 × 20°) = sin(40°) = sin(140°) = sin(2 × 70°)."
    },
    {
      q: "Kecepatan awal bola dijadikan 2 kali lipat, sementara sudut dan gravitasinya tetap. Jarak tembaknya menjadi…",
      choices: [{ t: "4 kali lipat", ok: true }, { t: "2 kali lipat" }, { t: "Tetap sama" }, { t: "Setengahnya" }],
      explain: "Dalam R = v² · sin(2θ) / g, kecepatan dikuadratkan: (2v)² = 4v², sehingga jaraknya menjadi 4 kali lipat."
    },
    {
      q: "Meriam yang sama ditembakkan di sebuah planet yang gravitasinya 2 kali gravitasi Bumi. Jarak tembaknya menjadi…",
      choices: [{ t: "Setengahnya", ok: true }, { t: "2 kali lipat" }, { t: "Tetap sama" }, { t: "4 kali lipat" }],
      explain: "Gravitasi berada di penyebut rumus R = v² · sin(2θ) / g. Jika g menjadi 2 kali, jaraknya menjadi setengah."
    }
  ]
};
