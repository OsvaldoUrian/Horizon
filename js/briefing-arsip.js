/* Ruang Briefing — Berkas #03 Informatika: Berkas Hilang di Lemari Arsip
   Mengajarkan dasar pencarian (data terurut, pencarian linear, membagi dua)
   TANPA menyebut jawaban misteri (7 langkah untuk 100 laci, 10 untuk 1.000). */
(function () {
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  window.ClueggBriefingData = {
    id: "arsip",
    outro: "Kamu sekarang tahu bahwa data terurut memungkinkan strategi yang lebih cerdas, bahwa mencari satu per satu bisa sangat lama, dan bahwa membagi dua memangkas kemungkinan dengan cepat. Di TKP, cari berkas di antara 100 laci dengan langkah sesedikit mungkin.",
    evidence: [
      {
        icon: "🗄️",
        title: "Arsip yang Terurut",
        text:
          "<p>Petunjuk penjaga arsip hanya berbunyi <b>\"lebih besar\"</b> atau <b>\"lebih kecil\"</b>. Petunjuk seperti ini hanya berguna kalau nomor berkas <b>tersusun urut</b>.</p>" +
          "<p>Di rak yang urut, jawaban \"lebih besar dari 19\" berarti semua berkas di sebelah kiri 19 pasti bukan jawabannya. Di rak acak, kita tidak bisa menyimpulkan apa pun.</p>",
        takeaway: "Strategi cerdas butuh data yang terurut. Tanpa urutan, petunjuk \"lebih besar/kecil\" tidak membantu.",
        question: {
          prompt: "Penjaga berkata: <i>\"Nomornya lebih besar dari 19.\"</i> Di rak mana kamu bisa <b>langsung mencoret</b> sebagian berkas?",
          choices: [
            { t: "Rak A (terurut)", ok: true },
            { t: "Rak B (acak)", why: "Di rak acak, nomor yang lebih besar dari 19 bisa ada di mana saja. Tekan \"Coret\" untuk melihatnya." },
            { t: "Keduanya sama saja", why: "Coba tekan tombol \"Coret\" dan bandingkan hasil kedua rak." },
            { t: "Tidak keduanya", why: "Salah satu rak memungkinkan kita mencoret berkas berurutan sekaligus. Coba tekan \"Coret\"." }
          ]
        },
        widget(box) {
          const A = [3, 8, 12, 19, 24, 31, 40, 47];
          const B = shuffle(A);
          const shelf = (name, arr) => `<div class="bw-shelf"><span class="bw-shelf-label">${name}</span><div class="bw-boxes" style="--n:8">${arr.map((n) => `<span class="bw-box" data-n="${n}">${n}</span>`).join("")}</div></div>`;
          box.innerHTML = `
            ${shelf("Rak A · terurut", A)}
            ${shelf("Rak B · acak", B)}
            <div class="bw-row"><button type="button" class="bw-btn primary">✏️ Coret yang ≤ 19</button><button type="button" class="bw-btn" data-r>Ulangi</button></div>
            <p class="bw-readout" aria-live="polite">Tekan tombol untuk mencoret berkas yang pasti bukan jawabannya.</p>`;
          const ro = box.querySelector(".bw-readout");
          box.querySelector(".primary").addEventListener("click", () => {
            box.querySelectorAll(".bw-box").forEach((b) => b.classList.toggle("out", +b.dataset.n <= 19));
            ro.innerHTML = "Rak A: berkas yang tersisa <b>berkumpul rapi</b> di sebelah kanan. Rak B: sisanya <b>tersebar</b>, jadi kita tetap harus memeriksa di mana-mana.";
          });
          box.querySelector("[data-r]").addEventListener("click", () => {
            box.querySelectorAll(".bw-box").forEach((b) => b.classList.remove("out"));
            ro.textContent = "Tekan tombol untuk mencoret berkas yang pasti bukan jawabannya.";
          });
        }
      },
      {
        icon: "🚶",
        title: "Cari Satu per Satu",
        text:
          "<p>Cara paling sederhana adalah <b>pencarian linear</b>: buka laci pertama, lalu kedua, lalu ketiga, dan seterusnya sampai berkas ketemu.</p>" +
          "<p>Cara ini selalu berhasil, tapi kalau berkasnya ada di laci terakhir, <b>semua laci</b> harus dibuka. Coba sendiri pada 10 laci di samping.</p>",
        takeaway: "Pencarian satu per satu bisa butuh langkah sebanyak jumlah lacinya.",
        question: {
          prompt: "Ada <b>100 laci</b> dan kamu membukanya satu per satu dari awal. Dalam kasus <b>terburuk</b>, berapa laci yang harus dibuka?",
          choices: [
            { t: "100", ok: true },
            { t: "1", why: "1 laci hanya kalau beruntung (berkas di laci pertama). Kasus terburuk adalah kebalikannya." },
            { t: "50", why: "50 adalah rata-ratanya. Kasus terburuk terjadi saat berkas ada di laci paling akhir." },
            { t: "10", why: "Dengan 100 laci, berkas bisa saja ada di laci ke-100." }
          ]
        },
        widget(box) {
          const N = 10;
          let secret, steps, found;
          box.innerHTML = `
            <div class="bw-boxes" style="--n:10">${Array.from({ length: N }, (_, i) => `<button type="button" class="bw-box" data-i="${i + 1}" aria-label="Laci ${i + 1}">${i + 1}</button>`).join("")}</div>
            <p class="bw-readout" aria-live="polite"></p>
            <div class="bw-row"><button type="button" class="bw-btn" data-r>🔄 Sembunyikan ulang</button></div>
            <p class="bw-hint">Buka laci berurutan dari kiri, seperti pencarian linear.</p>`;
          const boxes = [...box.querySelectorAll(".bw-box")], ro = box.querySelector(".bw-readout");
          function reset() {
            secret = 1 + Math.floor(Math.random() * N); steps = 0; found = false;
            boxes.forEach((b) => { b.className = "bw-box"; b.disabled = b.dataset.i !== "1"; b.textContent = b.dataset.i; });
            ro.innerHTML = "Langkah: <b>0</b>. Mulai dari laci 1.";
          }
          boxes.forEach((b) => b.addEventListener("click", () => {
            if (found) return;
            const i = +b.dataset.i;
            steps++;
            b.disabled = true;
            if (i === secret) {
              found = true; b.classList.add("hit"); b.textContent = "📁";
              ro.innerHTML = `Ketemu di laci ${i}! Langkah: <b>${steps}</b>. ${i === N ? "Laci terakhir: semua laci harus dibuka." : "Kalau berkasnya di laci terakhir, butuh " + N + " langkah."}`;
            } else {
              b.classList.add("open"); b.textContent = "∅";
              if (boxes[i]) boxes[i].disabled = false;
              ro.innerHTML = `Langkah: <b>${steps}</b>. Laci ${i} kosong, lanjut ke laci berikutnya.`;
            }
          }));
          box.querySelector("[data-r]").addEventListener("click", reset);
          reset();
        }
      },
      {
        icon: "✂️",
        title: "Membagi Dua",
        text:
          "<p>Di arsip yang terurut, setiap petunjuk \"lebih besar/kecil\" bisa <b>membuang setengah</b> laci sekaligus, asalkan kita bertanya tepat di tengah.</p>" +
          "<p>Tekan <b>Bagi dua</b> berulang kali pada 16 laci di samping, lalu hitung berapa langkah sampai tersisa satu laci.</p>",
        takeaway: "Membagi dua memangkas kemungkinan dengan sangat cepat. Simpan cara menghitung ini untuk deduksi akhir.",
        question: {
          prompt: "Mulai dari <b>16 laci</b>, berapa kali harus dibagi dua sampai tersisa <b>1 laci</b>?",
          choices: [
            { t: "4 kali", ok: true },
            { t: "8 kali", why: "8 adalah jumlah laci setelah pembagian pertama. Hitung jumlah tekanan tombolnya." },
            { t: "16 kali", why: "16 kali adalah cara satu per satu. Membagi dua jauh lebih cepat." },
            { t: "2 kali", why: "Setelah 2 kali, masih tersisa 4 laci. Teruskan membagi." }
          ]
        },
        widget(box) {
          const N = 16;
          let lo, hi, steps;
          box.innerHTML = `
            <div class="bw-boxes" style="--n:8">${Array.from({ length: N }, (_, i) => `<span class="bw-box" data-i="${i}">${i + 1}</span>`).join("")}</div>
            <p class="bw-readout" aria-live="polite"></p>
            <div class="bw-row"><button type="button" class="bw-btn primary">✂️ Bagi dua</button><button type="button" class="bw-btn" data-r>Ulangi</button></div>`;
          const boxes = [...box.querySelectorAll(".bw-box")], ro = box.querySelector(".bw-readout"), cut = box.querySelector(".primary");
          function paint() {
            boxes.forEach((b, i) => { b.classList.toggle("out", i < lo || i > hi); b.classList.toggle("keep", i >= lo && i <= hi && hi > lo); });
            const left = hi - lo + 1;
            ro.innerHTML = `Langkah: <b>${steps}</b> · Sisa laci: <b>${left}</b>${left === 1 ? " · Tinggal satu! 🎯" : ""}`;
            cut.disabled = left === 1;
          }
          function reset() { lo = 0; hi = N - 1; steps = 0; paint(); }
          cut.addEventListener("click", () => {
            const mid = Math.floor((lo + hi) / 2);
            if (Math.random() < 0.5) hi = mid; else lo = mid + 1; // penjaga menjawab "lebih kecil" atau "lebih besar"
            steps++;
            paint();
          });
          box.querySelector("[data-r]").addEventListener("click", reset);
          reset();
        }
      }
    ]
  };
})();
