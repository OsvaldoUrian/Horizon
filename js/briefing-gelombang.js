/* Ruang Briefing — Berkas #02 Matematika: Sinyal Gelombang Misterius
   Mengajarkan dasar sinus (lingkaran, periode 2π, membaca grafik)
   TANPA menyebut nilai A, B, C sinyal misterius. Grafik contoh sengaja
   memakai angka yang berbeda dari jawaban. */
(function () {
  const num = (n, d = 2) => n.toLocaleString("id-ID", { maximumFractionDigits: d, minimumFractionDigits: d });
  const PI_LABEL = (k) => (k === 0 ? "0" : k === 4 ? "π" : k % 4 === 0 ? `${k / 4}π` : k % 2 === 0 ? `${k / 2 === 1 ? "" : k / 2}π/2` : `${k === 1 ? "" : k}π/4`);

  // Grafik sinus kecil di dalam SVG: x 0..xmax dipetakan ke [X0, X1], y ke sekitar Yc
  function path(fn, xmax, X0, X1, Yc, amp, n = 160) {
    let d = "";
    for (let i = 0; i <= n; i++) {
      const x = (xmax * i) / n, px = X0 + (x / xmax) * (X1 - X0), py = Yc - fn(x) * amp;
      d += (i ? "L" : "M") + px.toFixed(1) + " " + py.toFixed(1);
    }
    return d;
  }

  window.ClueggBriefingData = {
    id: "gelombang",
    outro: "Kamu sekarang tahu asal-usul gelombang sinus, bahwa satu gelombang sin(x) panjangnya 2π, dan cara membaca puncak serta jarak antarpuncak dari grafik. Di TKP, ubah A, B, dan C untuk meniru sinyal misterius.",
    evidence: [
      {
        icon: "⭕",
        title: "Lingkaran yang Berputar",
        text:
          "<p>Bayangkan sebuah titik yang berputar di lingkaran berjari-jari 1. <b>Sinus</b> dari sudutnya adalah <b>tinggi titik itu</b>.</p>" +
          "<p>Saat titik terus berputar, tingginya naik, turun, lalu naik lagi. Kalau tinggi itu digambar dari waktu ke waktu, terbentuklah <b>gelombang</b>.</p>",
        takeaway: "Sinus = tinggi titik pada lingkaran. Nilainya selalu di antara −1 dan 1.",
        question: {
          prompt: "Saat titik berada tepat di <b>puncak</b> lingkaran (sudut 90°), berapa nilai sin 90°?",
          choices: [
            { t: "1", ok: true },
            { t: "0", why: "0 adalah tinggi titik di sudut 0° (di samping kanan). Geser sudutnya ke 90°." },
            { t: "−1", why: "−1 adalah tinggi titik di bagian paling bawah (270°)." },
            { t: "90", why: "Sinus adalah tinggi pada lingkaran berjari-jari 1, jadi tidak mungkin lebih dari 1." }
          ]
        },
        widget(box) {
          const CX = 80, CY = 115, R = 62, GX0 = 170, GX1 = 390;
          box.innerHTML = `
            <svg class="bw-svg" viewBox="0 0 400 230" role="img" aria-label="Titik berputar di lingkaran dan grafik sinusnya">
              <line class="ln-axis" x1="10" y1="${CY}" x2="390" y2="${CY}"/>
              <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" class="ln-grid" style="stroke-width:2"/>
              <line class="ln-grid" x1="${GX0}" y1="${CY - R}" x2="${GX1}" y2="${CY - R}"/>
              <line class="ln-grid" x1="${GX0}" y1="${CY + R}" x2="${GX1}" y2="${CY + R}"/>
              <text x="${GX0 - 6}" y="${CY - R + 4}" text-anchor="end">1</text>
              <text x="${GX0 - 6}" y="${CY + R + 4}" text-anchor="end">−1</text>
              <line data-k="rad" class="ln-shell"/>
              <line data-k="h" class="ln-cyan"/>
              <line data-k="link" class="ln-grid ln-dash" style="stroke:rgba(255,183,3,.5)"/>
              <path data-k="trace" class="ln-yolk"/>
              <circle data-k="pt" r="7" class="fill-yolk"/>
              <circle data-k="gpt" r="6" class="fill-yolk"/>
            </svg>
            <label class="bw-control"><span>Sudut putar <output>30°</output></span><input type="range" min="0" max="360" step="5" value="30" aria-label="Sudut putar"></label>
            <p class="bw-readout" aria-live="polite"></p>`;
          const q = (k) => box.querySelector(`[data-k="${k}"]`);
          const inp = box.querySelector("input"), out = box.querySelector("output"), ro = box.querySelector(".bw-readout");
          const set = (e, a) => Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v));
          function upd() {
            const a = +inp.value, r = (a * Math.PI) / 180, s = Math.sin(r);
            const px = CX + R * Math.cos(r), py = CY - R * s;
            const gx = GX0 + (a / 360) * (GX1 - GX0);
            set(q("rad"), { x1: CX, y1: CY, x2: px, y2: py });
            set(q("h"), { x1: px, y1: CY, x2: px, y2: py });
            set(q("pt"), { cx: px, cy: py });
            set(q("gpt"), { cx: gx, cy: py });
            set(q("link"), { x1: px, y1: py, x2: gx, y2: py });
            q("trace").setAttribute("d", a === 0 ? "" : path(Math.sin, r, GX0, gx, CY, R, Math.max(2, Math.round(a / 3))));
            out.textContent = a + "°";
            ro.innerHTML = `sin ${a}° = <b style="color:var(--cyan)">${num(s === 0 || Math.abs(s) < 1e-9 ? 0 : s)}</b> (tinggi titik)`;
          }
          inp.addEventListener("input", upd);
          upd();
        }
      },
      {
        icon: "🔁",
        title: "Satu Putaran = 2π",
        text:
          "<p>Dalam matematika, sudut sering ditulis dalam <b>radian</b>. Satu putaran penuh (360°) sama dengan <b>2π</b> radian, kira-kira 6,28.</p>" +
          "<p>Setelah titik berputar satu kali penuh, grafik sinus <b>mengulang dirinya</b>. Geser penanda di bawah untuk mengukur panjang satu gelombang y = sin(x).</p>",
        takeaway: "Satu gelombang penuh y = sin(x) panjangnya 2π. Setelah itu polanya berulang.",
        question: {
          prompt: "Berapa panjang <b>satu gelombang penuh</b> y = sin(x), misalnya dari satu puncak ke puncak berikutnya?",
          choices: [
            { t: "2π", ok: true },
            { t: "π", why: "Dari 0 sampai π grafik baru naik lalu turun ke 0; lembahnya belum dilewati. Perhatikan area kuning." },
            { t: "4π", why: "Dalam 4π ada dua gelombang penuh. Coba hitung puncaknya." },
            { t: "1", why: "Panjang gelombang diukur pada sumbu x dalam radian. Lihat label π di bawah grafik." }
          ]
        },
        widget(box) {
          const X0 = 25, X1 = 385, YC = 100, AMP = 60, XMAX = 4 * Math.PI;
          const X = (x) => X0 + (x / XMAX) * (X1 - X0);
          let ticks = "";
          for (let k = 1; k <= 4; k++) ticks += `<line class="ln-grid" x1="${X(k * Math.PI)}" y1="30" x2="${X(k * Math.PI)}" y2="170"/><text x="${X(k * Math.PI)}" y="190" text-anchor="middle">${k === 1 ? "" : k}π</text>`;
          box.innerHTML = `
            <svg class="bw-svg" viewBox="0 0 400 230" role="img" aria-label="Grafik y = sin(x) dengan penanda satu gelombang">
              ${ticks}
              <text x="${X0}" y="190" text-anchor="middle">0</text>
              <rect data-k="band" class="band" y="30" height="140"/>
              <line class="ln-axis" x1="${X0}" y1="${YC}" x2="${X1}" y2="${YC}"/>
              <path class="ln-yolk" d="${path(Math.sin, XMAX, X0, X1, YC, AMP, 240)}"/>
              <line data-k="m1" class="ln-cyan" y1="30" y2="170"/>
              <line data-k="m2" class="ln-cyan ln-dash" y1="30" y2="170"/>
              <text data-k="w" y="215" text-anchor="middle" class="t-strong"></text>
            </svg>
            <label class="bw-control"><span>Awal penanda <output></output></span><input type="range" min="0" max="8" step="1" value="2" aria-label="Posisi awal penanda"></label>`;
          const q = (k) => box.querySelector(`[data-k="${k}"]`);
          const inp = box.querySelector("input"), out = box.querySelector("output");
          function upd() {
            const k = +inp.value, a = (k * Math.PI) / 4, b = a + 2 * Math.PI;
            q("m1").setAttribute("x1", X(a)); q("m1").setAttribute("x2", X(a));
            q("m2").setAttribute("x1", X(b)); q("m2").setAttribute("x2", X(b));
            q("band").setAttribute("x", X(a)); q("band").setAttribute("width", X(b) - X(a));
            q("w").setAttribute("x", (X(a) + X(b)) / 2);
            q("w").textContent = `dari ${PI_LABEL(k)} sampai ${PI_LABEL(k + 8)}: satu pola utuh`;
            out.textContent = "x = " + PI_LABEL(k);
          }
          inp.addEventListener("input", upd);
          upd();
        }
      },
      {
        icon: "📈",
        title: "Membaca Grafik",
        text:
          "<p>Detektif sinyal harus pandai <b>membaca grafik</b>: seberapa tinggi puncaknya, seberapa dalam lembahnya, dan berapa jarak antarpuncaknya.</p>" +
          "<p>Ini <b>grafik contoh</b>, bukan sinyal misterius. Geser garis baca untuk menemukan titik tertingginya.</p>",
        takeaway: "Tinggi puncak dan jarak antarpuncak bisa dibaca langsung dari grafik. Keduanya kunci untuk meniru sinyal di TKP.",
        question: {
          prompt: "Berapa <b>tinggi puncak</b> grafik contoh ini?",
          choices: [
            { t: "1,5", ok: true },
            { t: "1", why: "Geser garis baca ke titik paling atas, lalu lihat nilai y-nya." },
            { t: "3", why: "3 adalah jarak dari puncak ke lembah. Tinggi puncak diukur dari garis 0." },
            { t: "2π", why: "2π adalah ukuran pada sumbu x (jarak antarpuncak), bukan tinggi." }
          ]
        },
        widget(box) {
          const A = 1.5, X0 = 40, X1 = 385, YC = 105, U = 40, XMAX = 4 * Math.PI;
          const f = (x) => A * Math.sin(x);
          const X = (x) => X0 + (x / XMAX) * (X1 - X0);
          let grid = "";
          for (let y = -2; y <= 2; y++) grid += `<line class="${y === 0 ? "ln-axis" : "ln-grid"}" x1="${X0}" y1="${YC - y * U}" x2="${X1}" y2="${YC - y * U}"/><text x="${X0 - 8}" y="${YC - y * U + 4}" text-anchor="end">${y}</text>`;
          for (let k = 1; k <= 4; k++) grid += `<text x="${X(k * Math.PI)}" y="205" text-anchor="middle">${k === 1 ? "" : k}π</text>`;
          box.innerHTML = `
            <svg class="bw-svg" viewBox="0 0 400 220" role="img" aria-label="Grafik contoh dengan garis baca">
              ${grid}
              <path class="ln-yolk" d="${path(f, XMAX, X0, X1, YC, U, 240)}"/>
              <line data-k="cur" class="ln-cyan ln-dash" y1="20" y2="190"/>
              <circle data-k="dot" r="6" class="fill-cyan"/>
            </svg>
            <label class="bw-control"><span>Garis baca <output></output></span><input type="range" min="0" max="16" step="1" value="0" aria-label="Posisi garis baca"></label>
            <p class="bw-readout" aria-live="polite"></p>`;
          const q = (k) => box.querySelector(`[data-k="${k}"]`);
          const inp = box.querySelector("input"), out = box.querySelector("output"), ro = box.querySelector(".bw-readout");
          function upd() {
            const k = +inp.value, x = (k * Math.PI) / 4, y = f(x);
            q("cur").setAttribute("x1", X(x)); q("cur").setAttribute("x2", X(x));
            q("dot").setAttribute("cx", X(x)); q("dot").setAttribute("cy", YC - y * U);
            out.textContent = "x = " + PI_LABEL(k);
            ro.innerHTML = `Pada x = ${PI_LABEL(k)}, tinggi grafik y = <b style="color:var(--cyan)">${num(Math.abs(y) < 1e-9 ? 0 : y)}</b>`;
          }
          inp.addEventListener("input", upd);
          upd();
        }
      }
    ]
  };
})();
