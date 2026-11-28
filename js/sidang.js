/* =========================================================
   CLUEGG — Sidang (tes akhir setelah kasus terpecahkan)

   Alur kasus:  Briefing → TKP → Deduksi → SIDANG
   Pemain menjadi saksi ahli. Jaksa mengajukan 3 pertanyaan berupa
   situasi baru. Jawaban pertama yang dihitung:
     benar → cap "DITERIMA", salah → cap "KEBERATAN!" + penjelasan.
   Akhirnya hakim membacakan vonis (Saksi Ahli / Saksi Terpercaya /
   Kesaksian Diragukan).

   Hasil disimpan di browser: localStorage "cluegg-quiz-v1"
     { <kasus>: { best, last, total, attempts, at } }
   lalu ditampilkan di dashboard. Isi soal ada di js/sidang-<kasus>.js.
   Dimuat tanpa defer setelah js/briefing.js.
   ========================================================= */
(function () {
  const data = window.ClueggSidangData;
  const main = document.querySelector("main.game-shell");
  if (!data || !main) return;

  const KEY = "cluegg-quiz-v1";
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const Q = data.questions, N = Q.length;
  const VERDICT = [
    { min: N, title: "Saksi Ahli", icon: "🏆", text: "Pengadilan menerima seluruh kesaksianmu. Kamu benar-benar memahami kasus ini." },
    { min: N - 1, title: "Saksi Terpercaya", icon: "⚖️", text: "Kesaksianmu hampir sempurna. Pelajari lagi bagian yang keliru, lalu ulangi sidang untuk meraih gelar Saksi Ahli." },
    { min: 0, title: "Kesaksian Diragukan", icon: "🔁", text: "Pengadilan belum yakin. Buka lagi Ruang Briefing dan coba TKP sekali lagi sebelum bersaksi ulang." }
  ];

  /* ---------- Kerangka ruang sidang ---------- */
  const root = el("section", "sidang");
  root.setAttribute("aria-label", "Ruang sidang");
  const titleText = (document.querySelector(".game-title h1") || {}).textContent || "";
  root.innerHTML = `
    <div class="court-scene" aria-hidden="true">
      <div class="court-person jaksa"><span class="cp-ico">🕵️</span><span class="cp-name">Jaksa</span></div>
      <div class="court-person hakim"><span class="cp-ico">👩‍⚖️</span><span class="cp-name">Hakim</span><span class="gavel">🔨</span></div>
      <div class="court-person saksi"><span class="egg cp-egg"></span><span class="cp-name">Kamu · Saksi</span></div>
    </div>
    <div class="court-body"></div>`;
  main.append(root);
  const body = root.querySelector(".court-body");

  let idx = 0, results = [], order = [];

  function progress() {
    const dots = el("div", "court-progress");
    dots.setAttribute("aria-label", `Pertanyaan ${Math.min(idx + 1, N)} dari ${N}`);
    for (let i = 0; i < N; i++) dots.append(el("i", results[i] === true ? "ok" : results[i] === false ? "no" : i === idx ? "cur" : ""));
    return dots;
  }

  function renderIntro() {
    body.innerHTML = "";
    const best = (read(KEY)[data.id] || {}).best;
    body.append(
      el("p", "eyebrow", "🏛️ Sidang Pembuktian"),
      el("h2", "court-title", titleText),
      el("div", "court-bubble hakim-say", `<b>Hakim:</b> ${data.intro} Jawab ${N} pertanyaan jaksa. Jawaban pertamamu yang dicatat.`),
      best != null ? el("p", "court-note", `Catatan sebelumnya: <b>${best}/${N}</b> kesaksian diterima.`) : el("span")
    );
    const go = el("button", "btn btn-primary court-go", "⚖️ Mulai bersaksi");
    go.type = "button";
    go.addEventListener("click", () => { idx = 0; results = []; ask(); });
    const back = el("button", "btn btn-ghost court-back", "Kembali ke TKP");
    back.type = "button";
    back.addEventListener("click", leave);
    const row = el("div", "court-actions");
    row.append(go, back);
    body.append(row);
    body.querySelector("h2").tabIndex = -1;
    body.querySelector("h2").focus({ preventScroll: true });
  }

  function ask() {
    const q = Q[idx];
    order = shuffle(q.choices); // urutan pilihan diacak agar jawaban benar tidak selalu di posisi yang sama
    body.innerHTML = "";
    body.append(progress());
    const bubble = el("div", "court-bubble jaksa-say", `<b>Jaksa · Pertanyaan ${idx + 1} dari ${N}:</b> ${q.q}`);
    bubble.tabIndex = -1;
    body.append(bubble);
    const grid = el("div", "court-choices");
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", "Jawaban saksi");
    order.forEach((c) => {
      const b = el("button", "court-choice", c.t);
      b.type = "button";
      b.addEventListener("click", () => answer(c, b, grid));
      grid.append(b);
    });
    body.append(grid, el("div", "court-result"));
    body.scrollTop = 0;
    bubble.focus({ preventScroll: true });
  }

  function answer(choice, btn, grid) {
    if (results[idx] !== undefined) return;
    const ok = !!choice.ok;
    results[idx] = ok;
    grid.querySelectorAll(".court-choice").forEach((b, i) => {
      b.disabled = true;
      if (order[i].ok) b.classList.add("right");
    });
    if (!ok) btn.classList.add("wrong");
    const res = body.querySelector(".court-result");
    res.className = "court-result show " + (ok ? "ok" : "no");
    res.setAttribute("aria-live", "assertive");
    res.innerHTML = `<span class="court-stamp">${ok ? "DITERIMA" : "KEBERATAN!"}</span>
      <p><b>${ok ? "Hakim: Kesaksian diterima." : "Jaksa: Keberatan, Yang Mulia!"}</b> ${Q[idx].explain}</p>`;
    const next = el("button", "btn btn-primary", idx < N - 1 ? "Pertanyaan berikutnya →" : "⚖️ Dengarkan vonis");
    next.type = "button";
    next.addEventListener("click", () => { idx++; idx < N ? ask() : verdict(); });
    res.append(next);
    body.querySelector(".court-progress").replaceWith(progress());
    next.focus({ preventScroll: true });
    // Di layar kecil hasil bisa berada di bawah pilihan: gulir panel sampai hasil terlihat
    requestAnimationFrame(() => res.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  function verdict() {
    const score = results.filter(Boolean).length;
    const v = VERDICT.find((x) => score >= x.min);
    const all = read(KEY), prev = all[data.id] || {};
    all[data.id] = {
      best: Math.max(prev.best || 0, score), last: score, total: N,
      attempts: (prev.attempts || 0) + 1, at: new Date().toISOString()
    };
    write(KEY, all);
    document.dispatchEvent(new CustomEvent("cluegg:quiz", { detail: { id: data.id, score, total: N } }));

    root.classList.add("gavel-hit");
    setTimeout(() => root.classList.remove("gavel-hit"), 900);
    body.innerHTML = "";
    body.append(progress());
    const card = el("div", "court-verdict");
    card.innerHTML = `
      <p class="eyebrow">Vonis pengadilan</p>
      <div class="verdict-icon" aria-hidden="true">${v.icon}</div>
      <h2>${v.title}</h2>
      <p class="verdict-score"><b>${score}/${N}</b> kesaksian diterima</p>
      <p>${v.text}</p>`;
    card.querySelector("h2").tabIndex = -1;
    const acts = el("div", "court-actions");
    const again = el("button", "btn btn-ghost", "🔁 Ulangi sidang");
    again.type = "button";
    again.addEventListener("click", () => { idx = 0; results = []; ask(); });
    const done = el("a", "btn btn-primary", "Kembali ke papan kasus →");
    done.href = "index.html#kasus";
    // Untuk member, tautan papan kasus diarahkan ke dashboard (sama seperti akun.js)
    if (document.documentElement.classList.contains("is-member")) { done.href = "dashboard.html#kursus"; done.textContent = "Kembali ke dashboard →"; }
    if (score < N - 1) {
      const brief = el("button", "btn btn-ghost", "🔍 Buka briefing");
      brief.type = "button";
      brief.addEventListener("click", () => { leave(); document.querySelector('.game-actions [aria-label="Buka lagi Ruang Briefing"]')?.click(); });
      acts.append(brief);
    }
    acts.append(again, done);
    card.append(acts);
    body.append(card);
    card.querySelector("h2").focus({ preventScroll: true });
    if (window.Cluegg) Cluegg.toast(`⚖️ Vonis: ${v.title} (${score}/${N})`);
    updateStepper();
  }

  /* ---------- Masuk / keluar ruang sidang ---------- */
  function enter() {
    const solved = document.getElementById("solved");
    if (solved) solved.classList.add("dismissed");
    main.classList.remove("stage-briefing");
    main.classList.add("stage-sidang");
    if (window.Cluegg) Cluegg.setEgg(Cluegg.mountEgg(root.querySelector(".cp-egg")), 3, true);
    renderIntro();
    updateStepper();
  }
  function leave() {
    main.classList.remove("stage-sidang");
    window.dispatchEvent(new Event("resize"));
    updateStepper();
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && main.classList.contains("stage-sidang")) leave(); });

  /* ---------- Tombol masuk sidang ---------- */
  const solvedEl = document.getElementById("solved");
  const isSolved = () => !!(solvedEl && solvedEl.classList.contains("show"));
  // 1) di pop-up "Rahasia di dalam cangkang"
  const acts = solvedEl && solvedEl.querySelector(".solved-actions");
  if (acts) {
    const b = el("button", "btn btn-primary court-entry", "🏛️ Maju ke Sidang");
    b.type = "button";
    b.addEventListener("click", enter);
    acts.prepend(b);
  }
  // 2) di bar atas (muncul setelah kasus terpecahkan)
  const actions = document.querySelector(".game-actions");
  const barBtn = el("button", "btn btn-ghost btn-sm", "🏛️ <span>Sidang</span>");
  barBtn.type = "button";
  barBtn.setAttribute("aria-label", "Masuk ruang sidang");
  barBtn.hidden = true;
  barBtn.addEventListener("click", enter);
  if (actions) actions.insertBefore(barBtn, actions.lastElementChild);

  /* ---------- Penanda tahap: tambah langkah ke-4 ---------- */
  const stepper = document.querySelector(".game-stepper");
  const li = el("li", "", "<span>4</span> Sidang");
  li.dataset.s = "sidang";
  if (stepper) stepper.append(li);
  function updateStepper() {
    const inCourt = main.classList.contains("stage-sidang");
    const rec = read(KEY)[data.id];
    li.className = inCourt ? "current" : rec ? "done" : isSolved() ? "current" : "";
    barBtn.hidden = !isSolved() || inCourt;
    if (inCourt && stepper) stepper.querySelectorAll('li:not([data-s="sidang"])').forEach((x) => (x.className = "done"));
  }
  if (solvedEl) new MutationObserver(updateStepper).observe(solvedEl, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("DOMContentLoaded", updateStepper);
  updateStepper();
})();
