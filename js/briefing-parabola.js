/* Ruang Briefing — Berkas #01 Fisika: Misteri Tembakan Terjauh
   Mengajarkan konsep dasar (komponen kecepatan, gravitasi, jarak = vx × t)
   TANPA menyebut jawaban misteri (sudut terjauh). */
(function () {
  const num = (n, d = 1) => n.toLocaleString("id-ID", { maximumFractionDigits: d, minimumFractionDigits: d });
  const rad = (deg) => (deg * Math.PI) / 180;

  window.ClueggBriefingData = {
    id: "parabola",
    outro: "Kamu sekarang tahu bahwa sudut tembak membagi kecepatan menjadi gerak maju dan gerak naik, bahwa gravitasi menentukan lama bola melayang, dan bahwa jarak adalah hasil keduanya. Di TKP, uji sudut-sudut berbeda dan temukan sendiri sudut terjauhnya.",
    evidence: [
      {
        icon: "🧭",
        title: "Gerak Dua Arah",
        text:
          "<p>Begitu ditembakkan, kecepatan bola terbagi menjadi <b>dua bagian</b>: bagian <b>mendatar</b> yang membawa bola maju, dan bagian <b>naik</b> yang membawa bola ke atas.</p>" +
          "<p>Besar kedua bagian itu ditentukan oleh <b>sudut tembak</b>: mendatar = v · cos θ, naik = v · sin θ.</p>",
        takeaway: "Sudut besar = lebih banyak naik, sedikit maju. Sudut kecil = banyak maju, sedikit naik.",
        question: {
          prompt: "Jika sudut tembak diperbesar, bagian <b>naik</b> dari kecepatan bola akan…",
          choices: [
            { t: "Makin besar", ok: true },
            { t: "Makin kecil", why: "Coba geser sudutnya ke kanan dan perhatikan garis biru (naik)." },
            { t: "Tetap sama", why: "Perhatikan: panjang garis biru berubah saat sudut digeser." },
            { t: "Hilang", why: "Bagian naik hanya hilang kalau sudutnya 0°. Coba geser sudutnya." }
          ]
        },
        widget(box) {
          const V = 20, X0 = 40, Y0 = 200, L = 150;
          box.innerHTML = `
            <svg class="bw-svg" viewBox="0 0 400 230" role="img" aria-label="Panah kecepatan bola dan dua bagiannya">
              <defs><marker id="bp-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fill-shell"/></marker></defs>
              <line class="ln-axis" x1="20" y1="${Y0}" x2="390" y2="${Y0}"/>
              <line class="ln-yolk ln-dash" data-k="vx"/>
              <line class="ln-cyan ln-dash" data-k="vy"/>
              <line class="ln-shell" data-k="v" marker-end="url(#bp-arr)"/>
              <circle class="fill-yolk" cx="${X0}" cy="${Y0}" r="7"/>
              <text data-k="lx" text-anchor="middle"></text>
              <text data-k="ly"></text>
              <text data-k="la" class="t-strong"></text>
            </svg>
            <label class="bw-control"><span>Sudut tembak <output>30°</output></span><input type="range" min="5" max="85" step="1" value="30" aria-label="Sudut tembak"></label>
            <p class="bw-readout" aria-live="polite"></p>`;
          const q = (k) => box.querySelector(`[data-k="${k}"]`);
          const inp = box.querySelector("input"), out = box.querySelector("output"), ro = box.querySelector(".bw-readout");
          function upd() {
            const a = +inp.value, ex = X0 + L * Math.cos(rad(a)), ey = Y0 - L * Math.sin(rad(a));
            q("v").setAttribute("x1", X0); q("v").setAttribute("y1", Y0); q("v").setAttribute("x2", ex); q("v").setAttribute("y2", ey);
            q("vx").setAttribute("x1", X0); q("vx").setAttribute("y1", Y0); q("vx").setAttribute("x2", ex); q("vx").setAttribute("y2", Y0);
            q("vy").setAttribute("x1", ex); q("vy").setAttribute("y1", Y0); q("vy").setAttribute("x2", ex); q("vy").setAttribute("y2", ey);
            q("lx").setAttribute("x", (X0 + ex) / 2); q("lx").setAttribute("y", Y0 + 18); q("lx").textContent = "mendatar";
            q("ly").setAttribute("x", ex + 8); q("ly").setAttribute("y", (Y0 + ey) / 2); q("ly").textContent = "naik";
            q("la").setAttribute("x", X0 + 30); q("la").setAttribute("y", Y0 - 8); q("la").textContent = a + "°";
            out.textContent = a + "°";
            ro.innerHTML = `v = ${V} m/s → mendatar <b style="color:var(--yolk)">${num(V * Math.cos(rad(a)))} m/s</b> · naik <b style="color:var(--cyan)">${num(V * Math.sin(rad(a)))} m/s</b>`;
          }
          inp.addEventListener("input", upd);
          upd();
        }
      },
      {
        icon: "🌍",
        title: "Tarikan Gravitasi",
        text:
          "<p>Gravitasi terus menarik bola ke bawah. Gerak naiknya makin lambat, berhenti di puncak, lalu bola jatuh kembali.</p>" +
          "<p>Lamanya bola melayang bergantung pada <b>bagian naik</b> dan <b>besarnya gravitasi</b> (g). Bandingkan Bumi (g = 9,8 m/s²) dengan Bulan (g = 1,62 m/s²).</p>",
        takeaway: "Waktu melayang = 2 × bagian naik ÷ g. Gravitasi kecil membuat bola melayang lebih lama.",
        question: {
          prompt: "Bola dilempar lurus ke atas dengan kecepatan yang <b>sama</b> di Bumi dan di Bulan. Di mana bola melayang lebih lama?",
          choices: [
            { t: "Di Bulan", ok: true },
            { t: "Di Bumi", why: "Gravitasi Bumi lebih kuat, jadi bola lebih cepat ditarik turun. Coba lempar lagi." },
            { t: "Sama saja", why: "Lihat pencatat waktunya: angkanya berbeda jauh." },
            { t: "Bola tidak turun di Bulan", why: "Bulan tetap punya gravitasi, hanya lebih kecil. Bola tetap jatuh kembali." }
          ]
        },
        widget(box) {
          const V = 10, G = { bumi: 9.8, bulan: 1.62 };
          const T = { bumi: (2 * V) / G.bumi, bulan: (2 * V) / G.bulan };
          const HMAX = (V * V) / (2 * G.bulan), SCALE = 165 / HMAX, BASE = 205, DUR = 4200;
          box.innerHTML = `
            <svg class="bw-svg" viewBox="0 0 400 230" role="img" aria-label="Bola dilempar ke atas di Bumi dan di Bulan">
              <line class="ln-axis" x1="20" y1="${BASE}" x2="380" y2="${BASE}"/>
              <line class="ln-grid" x1="200" y1="20" x2="200" y2="${BASE}"/>
              <text x="100" y="224" text-anchor="middle" class="t-strong">Bumi · g = 9,8</text>
              <text x="300" y="224" text-anchor="middle" class="t-strong">Bulan · g = 1,62</text>
              <circle class="fill-cyan" data-k="bumi" cx="100" cy="${BASE - 8}" r="8"/>
              <circle class="fill-yolk" data-k="bulan" cx="300" cy="${BASE - 8}" r="8"/>
              <text data-k="tb" x="100" y="40" text-anchor="middle">0,0 s</text>
              <text data-k="tm" x="300" y="40" text-anchor="middle">0,0 s</text>
            </svg>
            <div class="bw-row"><button type="button" class="bw-btn primary">🤾 Lempar ke atas (10 m/s)</button></div>
            <p class="bw-hint">Waktu diperlambat agar kedua lemparan terlihat.</p>`;
          const ball = { bumi: box.querySelector('[data-k="bumi"]'), bulan: box.querySelector('[data-k="bulan"]') };
          const lbl = { bumi: box.querySelector('[data-k="tb"]'), bulan: box.querySelector('[data-k="tm"]') };
          const btn = box.querySelector("button");
          let raf = 0;
          function frame(t0) {
            return (now) => {
              const s = Math.min(1, (now - t0) / DUR) * T.bulan; // detik simulasi
              ["bumi", "bulan"].forEach((k) => {
                const t = Math.min(s, T[k]);
                const h = Math.max(0, V * t - 0.5 * G[k] * t * t);
                ball[k].setAttribute("cy", BASE - 8 - h * SCALE);
                lbl[k].textContent = num(t) + " s" + (s >= T[k] ? " ✓ mendarat" : "");
              });
              if (s < T.bulan) raf = requestAnimationFrame(frame(t0));
              else btn.disabled = false;
            };
          }
          btn.addEventListener("click", () => {
            cancelAnimationFrame(raf);
            btn.disabled = true;
            raf = requestAnimationFrame(frame(performance.now()));
          });
          return () => cancelAnimationFrame(raf);
        }
      },
      {
        icon: "📏",
        title: "Jarak = Kecepatan Mendatar × Waktu",
        text:
          "<p>Selama melayang, bola terus maju dengan bagian <b>mendatar</b> kecepatannya. Jadi jarak tembak dihitung dari dua hal: <b>seberapa cepat bola maju</b> dan <b>seberapa lama ia melayang</b>.</p>" +
          "<p>Coba atur keduanya dan lihat jaraknya.</p>",
        takeaway: "Jarak = mendatar × waktu melayang. Keduanya harus cukup besar untuk tembakan yang jauh.",
        question: {
          prompt: "Sudut tembak dibuat <b>sangat kecil</b> (hampir mendatar). Apa yang terjadi pada bola?",
          choices: [
            { t: "Maju cepat, tapi cepat jatuh, jadi jaraknya pendek", ok: true },
            { t: "Melayang lama dan terbang sangat jauh", why: "Sudut kecil berarti bagian naiknya kecil (Bukti #1), jadi waktu melayangnya singkat (Bukti #2)." },
            { t: "Tidak bergerak sama sekali", why: "Bola tetap maju karena bagian mendatarnya besar." },
            { t: "Naik lurus ke atas", why: "Itu terjadi kalau sudutnya mendekati 90°, bukan sudut kecil." }
          ]
        },
        widget(box) {
          box.innerHTML = `
            <svg class="bw-svg" viewBox="0 0 400 150" role="img" aria-label="Diagram jarak tembak">
              <line class="ln-axis" x1="20" y1="110" x2="390" y2="110"/>
              <rect data-k="bar" x="20" y="92" height="18" rx="4" class="fill-yolk"/>
              <text data-k="lbl" x="20" y="80" class="t-strong"></text>
              <text x="20" y="132">0 m</text><text x="370" y="132" text-anchor="end">80 m</text>
            </svg>
            <label class="bw-control"><span>Kecepatan mendatar <output data-o="vx"></output></span><input data-i="vx" type="range" min="2" max="20" step="1" value="10" aria-label="Kecepatan mendatar"></label>
            <label class="bw-control"><span>Waktu melayang <output data-o="t"></output></span><input data-i="t" type="range" min="0.5" max="4" step="0.5" value="2" aria-label="Waktu melayang"></label>`;
          const vx = box.querySelector('[data-i="vx"]'), t = box.querySelector('[data-i="t"]');
          function upd() {
            const d = +vx.value * +t.value;
            box.querySelector('[data-o="vx"]').textContent = vx.value + " m/s";
            box.querySelector('[data-o="t"]').textContent = num(+t.value) + " s";
            box.querySelector('[data-k="bar"]').setAttribute("width", Math.max(2, (d / 80) * 350));
            box.querySelector('[data-k="lbl"]').textContent = `Jarak = ${vx.value} × ${num(+t.value)} = ${num(d)} m`;
          }
          vx.addEventListener("input", upd);
          t.addEventListener("input", upd);
          upd();
        }
      }
    ]
  };
})();
