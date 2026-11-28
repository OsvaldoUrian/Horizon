/* =========================================================
   CLUEGG — Ruang Briefing (tahap materi sebelum TKP)

   Alur kasus:  Laporan misteri → 3 barang bukti → TKP (simulasi) → Deduksi
   Setiap barang bukti: penjelasan singkat + interaksi kecil + 1 pertanyaan
   cek pemahaman. Jawaban benar membuka bukti berikutnya.
   Pertama kali wajib; setelah selesai, pemain bisa langsung ke TKP dan
   membuka briefing lagi lewat tombol "🔍 Briefing".

   Isi tiap kasus ada di js/briefing-<kasus>.js, yang mengisi
   window.ClueggBriefingData = { id, evidence: [...], outro }.
   Dimuat tanpa defer SETELAH js/permainan.js (layar permainan sudah tersusun).
   ========================================================= */
(function () {
  const data = window.ClueggBriefingData;
  const main = document.querySelector("main.game-shell");
  if (!data || !main) return;

  const KEY = "cluegg-briefing-v2";
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  const progress = read("cluegg-progress-v1")[data.id] || {};
  const alreadyDone = !!(read(KEY)[data.id] || progress.solved);
  const ev = data.evidence;
  // Langkah: 0 = laporan misteri, 1..n = barang bukti, n+1 = penutup
  const LAST = ev.length + 1;
  const answered = new Set(alreadyDone ? ev.map((_, i) => i) : []);
  let idx = 0, cleanup = null;

  /* ---------- Kerangka ---------- */
  const root = el("section", "briefing");
  root.setAttribute("aria-label", "Ruang Briefing");
  const rail = el("nav", "brief-rail");
  rail.setAttribute("aria-label", "Langkah briefing");
  const stage = el("div", "brief-stage");
  root.append(rail, stage);
  main.append(root);

  const titleText = (document.querySelector(".game-title h1") || {}).textContent || "";
  const mysteryEl = document.querySelector(".game-dialog .mystery");
  const mysteryHtml = mysteryEl ? mysteryEl.innerHTML : "";

  const steps = [
    { icon: "📜", label: "Laporan misteri" },
    ...ev.map((e, i) => ({ icon: e.icon, label: `Bukti ${i + 1}: ${e.title}` })),
    { icon: "🔦", label: "Menuju TKP" }
  ];
  // Langkah bisa dibuka jika semua bukti sebelumnya sudah terjawab benar
  function frontier() { let n = 0; while (n < ev.length && answered.has(n)) n++; return n; }
  const reachable = (i) => i <= frontier() + 1;

  function renderRail() {
    rail.innerHTML = "";
    const ol = el("ol", "brief-steps-list");
    steps.forEach((s, i) => {
      const li = el("li");
      const b = el("button", "brief-step");
      b.type = "button";
      const isDone = i === 0 ? idx > 0 : (i <= ev.length ? answered.has(i - 1) : false);
      const locked = !reachable(i);
      b.classList.toggle("done", isDone);
      b.classList.toggle("current", i === idx);
      b.disabled = locked;
      if (i === idx) b.setAttribute("aria-current", "step");
      b.innerHTML = `<span class="bs-ico" aria-hidden="true">${locked ? "🔒" : s.icon}</span><span class="bs-label">${s.label}</span>${isDone ? '<span class="bs-check" aria-label="selesai">✓</span>' : ""}`;
      b.addEventListener("click", () => go(i));
      li.append(b);
      ol.append(li);
    });
    rail.append(el("p", "brief-rail-title", "Ruang Briefing"), ol);
  }

  /* ---------- Isi tiap langkah ---------- */
  function go(i) {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    idx = i;
    stage.innerHTML = "";
    stage.dataset.step = i === 0 ? "intro" : i === LAST ? "outro" : "evidence";
    if (i === 0) renderIntro();
    else if (i === LAST) renderOutro();
    else renderEvidence(i - 1);
    renderRail();
    const h = stage.querySelector("h2");
    if (h && started) h.focus({ preventScroll: true });
  }

  function nav(nextLabel, canNext, onNext) {
    const n = el("div", "brief-nav");
    const prev = el("button", "btn btn-ghost btn-sm", "← Sebelumnya");
    prev.type = "button";
    prev.disabled = idx === 0;
    prev.addEventListener("click", () => go(idx - 1));
    const dots = el("span", "brief-dots");
    dots.setAttribute("aria-hidden", "true");
    for (let k = 1; k <= ev.length; k++) dots.append(el("i", answered.has(k - 1) ? "on" : k === idx ? "cur" : ""));
    const next = el("button", "btn btn-primary btn-sm brief-next", nextLabel);
    next.type = "button";
    next.disabled = !canNext;
    next.addEventListener("click", onNext || (() => go(idx + 1)));
    n.append(prev, dots, next);
    if (alreadyDone && idx < LAST) {
      const skip = el("button", "brief-skip", "Lewati ke TKP →");
      skip.type = "button";
      skip.addEventListener("click", finish);
      n.append(skip);
    }
    return n;
  }

  function renderIntro() {
    const card = el("div", "brief-card intro");
    card.append(
      el("p", "eyebrow", "Ruang Briefing"),
      el("h2", "", titleText),
      el("div", "brief-report", `<strong>LAPORAN MISTERI</strong>${mysteryHtml.replace(/<strong>[\s\S]*?<\/strong>/, "")}`),
      el("p", "brief-lead", `Sebelum turun ke TKP, kumpulkan <b>${ev.length} barang bukti</b> di ruang briefing. Setiap bukti berisi satu konsep penting, satu percobaan kecil, dan satu pertanyaan. Jawab dengan benar untuk membuka bukti berikutnya.`)
    );
    card.querySelector("h2").tabIndex = -1;
    stage.append(card, nav("Mulai briefing →", true));
  }

  function renderEvidence(k) {
    const e = ev[k];
    const card = el("div", "brief-card evidence");
    const head = el("div", "brief-head");
    head.append(el("p", "eyebrow", `Barang Bukti #${k + 1} dari ${ev.length}`), el("h2", "", `${e.icon} ${e.title}`));
    head.querySelector("h2").tabIndex = -1;

    const body = el("div", "brief-body");
    const textCol = el("div", "brief-text");
    textCol.append(el("div", "brief-explain", e.text));

    // Pertanyaan cek pemahaman
    const q = el("div", "brief-q");
    q.append(el("p", "brief-q-prompt", `<b>❓ Cek pemahaman:</b> ${e.question.prompt}`));
    const choices = el("div", "brief-choices");
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-label", "Pilihan jawaban");
    const fb = el("p", "brief-feedback");
    fb.setAttribute("aria-live", "polite");
    const take = el("div", "brief-takeaway", `<b>🧩 Bukti tercatat:</b> ${e.takeaway}`);
    take.hidden = !answered.has(k);

    // Urutan pilihan diacak agar jawaban benar tidak selalu di posisi yang sama
    const shuffled = e.question.choices.slice();
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    shuffled.forEach((c) => {
      const b = el("button", "brief-choice", c.t);
      b.type = "button";
      if (answered.has(k) && c.ok) b.classList.add("right");
      b.addEventListener("click", () => {
        if (answered.has(k)) return;
        if (c.ok) {
          b.classList.add("right");
          answered.add(k);
          fb.textContent = "✔ Tepat!";
          fb.className = "brief-feedback ok";
          take.hidden = false;
          nextBtn.disabled = false;
          renderRail();
          if (window.Cluegg) Cluegg.toast(`🔍 Barang bukti #${k + 1} terkumpul!`);
        } else {
          b.classList.remove("wrong");
          void b.offsetWidth;
          b.classList.add("wrong");
          fb.textContent = "✘ " + (c.why || "Belum tepat. Coba amati percobaannya lagi.");
          fb.className = "brief-feedback no";
        }
      });
      choices.append(b);
    });
    q.append(choices, fb);
    textCol.append(q, take);

    const widget = el("div", "brief-widget");
    body.append(widget, textCol);
    card.append(head, body);
    const navEl = nav(k === ev.length - 1 ? "Selesai briefing →" : "Bukti berikutnya →", answered.has(k));
    const nextBtn = navEl.querySelector(".brief-next");
    stage.append(card, navEl);
    cleanup = e.widget(widget) || null;
  }

  function renderOutro() {
    const card = el("div", "brief-card outro");
    const list = el("ul", "brief-summary");
    ev.forEach((e) => list.append(el("li", "", `<span aria-hidden="true">${e.icon}</span> <span><b>${e.title}.</b> ${e.takeaway}</span>`)));
    card.append(
      el("p", "eyebrow", "Briefing selesai"),
      el("h2", "", "Semua barang bukti terkumpul."),
      el("p", "brief-lead", data.outro),
      list
    );
    card.querySelector("h2").tabIndex = -1;
    stage.append(card, nav("🔦 Menuju TKP", true, finish));
  }

  /* ---------- Pindah tahap ---------- */
  let started = false;
  let briefDone = alreadyDone;
  function enterBriefing(at) {
    main.classList.remove("stage-sidang");
    main.classList.add("stage-briefing");
    go(at);
    started = true;
    document.dispatchEvent(new Event("cluegg:stage"));
  }
  function finish() {
    const done = read(KEY);
    done[data.id] = true;
    write(KEY, done);
    briefDone = true;
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    main.classList.remove("stage-briefing", "stage-sidang");
    main.classList.add("entering-tkp");
    setTimeout(() => main.classList.remove("entering-tkp"), 700);
    window.dispatchEvent(new Event("resize")); // simulasi mengukur ulang canvas
    document.dispatchEvent(new Event("cluegg:stage"));
    const h = document.querySelector(".game-title h1");
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    if (window.Cluegg) Cluegg.toast("🔦 Selamat datang di TKP. Kumpulkan 3 petunjuk!");
  }

  /* ---------- Navigasi tahap di bar atas ----------
     Penanda tahap sekaligus tombol untuk berpindah tahap (tidak ada tombol duplikat):
       1 Briefing → buka Ruang Briefing (laporan misteri ada di layar pembukanya)
       2 TKP      → kembali ke simulasi
       3 Deduksi  → buka panel deduksi; bila kasus terpecahkan, buka "Rahasia"
       4 Sidang   → ditambahkan oleh js/sidang.js
     TKP & Deduksi terkunci sampai briefing pertama selesai. */
  const stepper = el("ol", "game-stepper");
  stepper.setAttribute("aria-label", "Tahap kasus");
  const STEPS = [
    { s: "briefing", n: 1, label: "Briefing", hint: "Buka Ruang Briefing & laporan misteri" },
    { s: "tkp", n: 2, label: "TKP", hint: "Kembali ke TKP (simulasi)" },
    { s: "deduksi", n: 3, label: "Deduksi", hint: "Buka deduksi akhir" }
  ];
  const stepBtn = {};
  STEPS.forEach((st) => {
    const li = el("li");
    li.dataset.s = st.s;
    const b = el("button", "step-btn", `<span class="step-n">${st.n}</span><span class="step-lbl">${st.label}</span>`);
    b.type = "button";
    b.title = st.hint;
    b.setAttribute("aria-label", `${st.n}. ${st.label}: ${st.hint}`);
    li.append(b);
    stepper.append(li);
    stepBtn[st.s] = b;
  });
  const bar = document.querySelector(".game-bar");
  const actions = document.querySelector(".game-actions");
  if (bar && actions) bar.insertBefore(stepper, actions);

  function toTKP() {
    if (main.classList.contains("stage-briefing")) { finish(); return; }
    if (main.classList.contains("stage-sidang")) {
      main.classList.remove("stage-sidang");
      window.dispatchEvent(new Event("resize"));
    }
    document.dispatchEvent(new Event("cluegg:stage"));
  }
  stepBtn.briefing.addEventListener("click", () => enterBriefing(0));
  stepBtn.tkp.addEventListener("click", toTKP);
  stepBtn.deduksi.addEventListener("click", () => {
    toTKP();
    const G = window.ClueggGame;
    if (!G) return;
    if (G.isSolved()) G.openSecret(); else G.focusDeduksi();
  });

  const final = document.getElementById("final");
  function updateStepper() {
    const inBrief = main.classList.contains("stage-briefing");
    const inCourt = main.classList.contains("stage-sidang");
    const dedOpen = final && !final.classList.contains("locked");
    const solved = document.getElementById("solved")?.classList.contains("show");
    const state = {
      briefing: inBrief ? "current" : "done",
      tkp: inBrief || inCourt ? (briefDone ? "done" : "") : dedOpen ? "done" : "current",
      deduksi: inBrief ? (solved ? "done" : "") : inCourt ? "done" : solved ? "done" : dedOpen ? "current" : ""
    };
    // Hanya langkah milik briefing; langkah lain (mis. Sidang) diatur file masing-masing
    stepper.querySelectorAll("li").forEach((li) => {
      if (!(li.dataset.s in state)) return;
      li.className = state[li.dataset.s];
      const b = li.querySelector(".step-btn");
      if (li.className === "current") b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    // Sebelum briefing pertama selesai, TKP & Deduksi belum bisa dibuka
    stepBtn.tkp.disabled = !briefDone;
    stepBtn.deduksi.disabled = !briefDone;
    stepBtn.tkp.title = briefDone ? "Kembali ke TKP (simulasi)" : "Selesaikan briefing dulu";
    stepBtn.deduksi.title = briefDone ? "Buka deduksi akhir" : "Selesaikan briefing dulu";
  }
  document.addEventListener("cluegg:stage", updateStepper);
  if (final) new MutationObserver(updateStepper).observe(final, { attributes: true, attributeFilter: ["class"] });
  const solvedEl = document.getElementById("solved");
  if (solvedEl) new MutationObserver(updateStepper).observe(solvedEl, { attributes: true, attributeFilter: ["class"] });

  /* ---------- Mulai ---------- */
  const lockedTrial = document.documentElement.classList.contains("trial-locked");
  if (!alreadyDone && !lockedTrial) enterBriefing(0);
  else updateStepper();
  document.addEventListener("DOMContentLoaded", updateStepper);
})();
