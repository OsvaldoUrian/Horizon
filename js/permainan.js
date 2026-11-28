/* =========================================================
   CLUEGG — layar permainan (halaman kasus tidak bisa di-scroll)

   File ini menyusun ulang halaman kasus menjadi satu layar penuh:
     bar atas  : kembali, nomor berkas, judul, tombol Misteri & Rahasia
     visual    : simulasi (canvas / papan laci) — selalu terlihat
     kontrol   : slider, tombol, angka hasil
     petunjuk  : telur + daftar petunjuk
     deduksi   : pertanyaan akhir
   Di desktop semuanya tampil bersamaan; di HP kontrol/petunjuk/deduksi
   menjadi tab di bawah simulasi. Laporan misteri tampil sebagai jendela
   briefing, dan "Rahasia di dalam cangkang" sebagai pop-up.

   KASUS BARU otomatis ikut, asalkan memakai struktur yang sama:
     .case-hero (berisi .back, .case-label, h1, .mystery)
     #solved, .lab, .clueboard (berisi #final)
   Bagian simulasi yang harus selalu terlihat: .lab-head, .canvas-box,
   .legend, .lockers, .range-bar, .bs-status, atau beri atribut
   data-game="visual".

   Dimuat TANPA defer di akhir <body>, supaya susunan baru sudah siap
   sebelum file simulasi mengukur ukuran canvas.
   ========================================================= */
(function () {
  const main = document.querySelector("main");
  const hero = document.querySelector(".case-hero");
  const lab = document.querySelector(".lab");
  const board = document.querySelector(".clueboard");
  if (!main || !hero || !lab || !board) return;

  const caseId = (location.pathname.match(/kasus-([a-z]+)/) || [])[1] || "kasus";
  const solved = document.getElementById("solved");
  const final = document.getElementById("final");
  const BRIEF_KEY = "cluegg-briefing-v1";
  const VISUAL = ".lab-head, .canvas-box, .legend, .lockers, .range-bar, .bs-status, [data-game='visual']";

  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function button(cls, html, label) {
    const b = el("button", cls, html);
    b.type = "button";
    if (label) b.setAttribute("aria-label", label);
    return b;
  }

  document.body.classList.add("game");

  /* ---------- 1. Bar atas ---------- */
  const bar = el("div", "game-bar");
  const back = hero.querySelector(".back");
  const label = hero.querySelector(".case-label");
  const title = hero.querySelector("h1");
  const mystery = hero.querySelector(".mystery");
  const titleBox = el("div", "game-title");
  if (label) titleBox.append(label);
  if (title) titleBox.append(title);
  const actions = el("div", "game-actions");
  const btnBrief = button("btn btn-ghost btn-sm", "📜 <span>Misteri</span>", "Buka laporan misteri");
  const btnSecret = button("btn btn-primary btn-sm", "🥚 <span>Rahasia</span>", "Lihat rahasia di dalam cangkang");
  btnSecret.hidden = true;
  actions.append(btnBrief, btnSecret);
  if (back) bar.append(back);
  bar.append(titleBox, actions);

  /* ---------- 2. Area visual (simulasi) ---------- */
  const visual = el("section", "game-visual");
  visual.setAttribute("aria-label", "Simulasi");
  const fit = el("div", "visual-fit");
  Array.from(lab.children).filter((c) => c.matches(VISUAL)).forEach((c) => {
    // Canvas / papan laci mengisi sisa ruang; sisanya (judul, legenda, status) ukuran biasa
    if (c.matches(".canvas-box, .lockers")) { fit.append(c); visual.append(fit); }
    else visual.append(c);
  });

  /* ---------- 3. Panel: kontrol, petunjuk, deduksi ---------- */
  function panel(name, cls) {
    const p = el("div", "dock-panel " + cls);
    p.id = "panel-" + name;
    p.dataset.tab = name;
    p.setAttribute("role", "tabpanel");
    p.setAttribute("aria-labelledby", "tab-" + name);
    return p;
  }
  const pKontrol = panel("kontrol", "panel-dark");
  Array.from(lab.children).forEach((c) => pKontrol.append(c));

  const pPetunjuk = panel("petunjuk", "panel-paper");
  const pDeduksi = panel("deduksi", "panel-paper");
  Array.from(board.children).forEach((c) => (c === final ? pDeduksi : pPetunjuk).append(c));

  const side = el("aside", "game-side");
  side.append(pPetunjuk, pDeduksi);

  // Tab (hanya terlihat di HP)
  const tabs = el("div", "dock-tabs");
  tabs.setAttribute("role", "tablist");
  const TAB_LABEL = { kontrol: "🎛️ Kontrol", petunjuk: "🔍 Petunjuk", deduksi: "⚖️ Deduksi" };
  const tabBtns = {};
  Object.keys(TAB_LABEL).forEach((name) => {
    const b = button("dock-tab", `${TAB_LABEL[name]} <small class="tab-note"></small>`);
    b.id = "tab-" + name;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", "panel-" + name);
    b.addEventListener("click", () => showTab(name));
    tabs.append(b);
    tabBtns[name] = b;
  });
  const panels = { kontrol: pKontrol, petunjuk: pPetunjuk, deduksi: pDeduksi };
  // Di HP panel bisa dilipat: ketuk tab yang sedang aktif untuk menutupnya,
  // supaya simulasi mendapat seluruh ruang layar.
  let dockOpen = true;
  function setDock(open) {
    dockOpen = open;
    main.classList.toggle("dock-closed", !open);
    Object.values(tabBtns).forEach((b) => b.setAttribute("aria-expanded", String(open && b.getAttribute("aria-selected") === "true")));
  }
  function showTab(name) {
    const same = panels[name].classList.contains("active");
    Object.keys(panels).forEach((k) => {
      const on = k === name;
      panels[k].classList.toggle("active", on);
      tabBtns[k].setAttribute("aria-selected", String(on));
      if (on) tabBtns[k].classList.remove("ping");
    });
    setDock(same ? !dockOpen : true);
  }
  tabs.title = "Ketuk tab yang aktif untuk melipat panel";
  showTab("kontrol");
  // Kasus yang dimainkan langsung di simulasinya (tanpa slider/pilihan) mulai dengan panel terlipat
  if (!pKontrol.querySelector("input[type='range'], select")) setDock(false);

  /* ---------- 4. Susun ulang <main> ---------- */
  main.classList.remove("container");
  main.classList.add("game-shell");
  main.textContent = "";
  main.append(bar, visual, tabs, pKontrol, side);

  /* ---------- 5. Jendela briefing (laporan misteri) ---------- */
  const dlg = el("dialog", "game-dialog");
  dlg.setAttribute("aria-labelledby", "brief-title");
  const card = el("div", "brief-card");
  const briefLabel = label ? label.cloneNode(true) : el("p");
  const briefTitle = el("h2", "", title ? title.textContent : "Berkas baru");
  briefTitle.id = "brief-title";
  card.append(briefLabel, briefTitle);
  if (mystery) card.append(mystery);
  card.append(
    el("ol", "brief-steps",
      "<li><b>Bereksperimen</b> di laboratorium.</li>" +
      "<li><b>Kumpulkan 3 petunjuk</b>. Setiap petunjuk meretakkan cangkang.</li>" +
      "<li><b>Deduksi akhir</b> untuk memecahkan cangkangnya.</li>")
  );
  const start = button("btn btn-primary", "Mulai investigasi →");
  start.addEventListener("click", () => dlg.close());
  card.append(start);
  dlg.append(card);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => {
    const seen = read(BRIEF_KEY);
    seen[caseId] = true;
    write(BRIEF_KEY, seen);
  });
  document.body.append(dlg);
  btnBrief.addEventListener("click", () => dlg.showModal());

  /* ---------- 6. Pop-up "Rahasia di dalam cangkang" ---------- */
  const progress = read("cluegg-progress-v1")[caseId] || {};
  let ready = false;
  if (solved) {
    const backdrop = el("div", "solved-backdrop");
    const closeBtn = button("btn btn-ghost solved-close", "Kembali ke lab");
    const dismiss = () => solved.classList.add("dismissed");
    closeBtn.addEventListener("click", dismiss);
    backdrop.addEventListener("click", dismiss);
    const acts = solved.querySelector(".solved-actions");
    (acts || solved).append(closeBtn);
    main.append(backdrop, solved);

    // Kasus yang sudah terpecahkan sebelumnya: jangan langsung menutupi lab
    if (progress.solved) solved.classList.add("dismissed");
    let wasShown = false;
    new MutationObserver(() => {
      const shown = solved.classList.contains("show");
      btnSecret.hidden = !shown;
      // Baru saja terpecahkan saat bermain -> tampilkan pop-up
      if (shown && !wasShown && ready) openSecret();
      wasShown = shown;
      backdrop.classList.toggle("on", shown && !solved.classList.contains("dismissed"));
    }).observe(solved, { attributes: true, attributeFilter: ["class"] });

    // Buka pop-up dari atas (judul rahasia dulu), fokus ke tombol tutup tanpa menggulir
    function openSecret() {
      solved.classList.remove("dismissed");
      solved.scrollTop = 0;
      setTimeout(() => { closeBtn.focus({ preventScroll: true }); solved.scrollTop = 0; }, 100);
    }
    btnSecret.addEventListener("click", openSecret);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && solved.classList.contains("show") && !solved.classList.contains("dismissed")) dismiss();
    });
  }

  /* ---------- 7. Tanda di tab (HP) ---------- */
  function updateNotes() {
    const clues = pPetunjuk.querySelectorAll(".clue");
    const found = pPetunjuk.querySelectorAll(".clue.unlocked").length;
    tabBtns.petunjuk.querySelector(".tab-note").textContent = `${found}/${clues.length}`;
    const locked = final && final.classList.contains("locked");
    tabBtns.deduksi.querySelector(".tab-note").textContent = locked ? "🔒" : "";
    return { found, locked };
  }
  let last = updateNotes();
  new MutationObserver(() => {
    const now = updateNotes();
    if (!ready) { last = now; return; }
    if (now.found > last.found && !panels.petunjuk.classList.contains("active")) tabBtns.petunjuk.classList.add("ping");
    if (last.locked && !now.locked && !panels.deduksi.classList.contains("active")) tabBtns.deduksi.classList.add("ping");
    last = now;
  }).observe(side, { attributes: true, attributeFilter: ["class"], subtree: true });

  /* ---------- 8. Ukuran canvas mengikuti ruang yang tersedia ---------- */
  // File simulasi mengukur ulang canvas saat event "resize", jadi cukup dipicu ulang.
  let raf = 0;
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }).observe(fit);
  }

  /* ---------- 9. Setelah semua skrip siap ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    ready = true;
    last = updateNotes();
    // Briefing otomatis saat pertama kali membuka kasus ini
    const locked = document.documentElement.classList.contains("trial-locked");
    if (!locked && !progress.solved && !read(BRIEF_KEY)[caseId] && dlg.showModal) dlg.showModal();
  });
})();
