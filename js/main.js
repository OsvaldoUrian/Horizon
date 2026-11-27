/* =========================================================
   CLUEGG — inti gamifikasi
   - Telur yang retak bertahap (1 petunjuk = 1 retakan)
   - Progres tersimpan di browser (localStorage)
   ========================================================= */
(function () {
  const KEY = "cluegg-progress-v1";
  const RANKS = ["Detektif Magang", "Penyelidik Muda", "Inspektur Konsep", "Master Detektif"];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* mode privat: abaikan */ }
  }

  /* ---------- Telur (SVG) ---------- */
  let uid = 0;
  const EGG = "M60 4C30 4 8 58 8 92c0 34 24 54 52 54s52-20 52-54C112 58 90 4 60 4Z";
  const ZIG = "0,88 14,94 26,82 38,94 50,82 62,94 74,82 86,94 98,82 110,90 120,90";
  // Bagian atas sedikit tumpang-tindih (2px) agar tidak ada garis sambungan saat telur masih utuh
  const ZIG_TOP = ZIG.split(" ").reverse().map((pt) => {
    const [x, y] = pt.split(",").map(Number);
    return x + "," + (y + 2);
  }).join(" ");

  function eggMarkup() {
    const id = "egg" + ++uid;
    return `
<svg viewBox="0 0 120 150" aria-hidden="true">
  <defs>
    <clipPath id="${id}t"><polygon points="0,-30 120,-30 ${ZIG_TOP}"/></clipPath>
    <clipPath id="${id}b"><polygon points="${ZIG} 120,170 0,170"/></clipPath>
  </defs>
  <g clip-path="url(#${id}b)">
    <path class="shell" d="${EGG}" stroke="#2a241c" stroke-width="2.5"/>
    <ellipse cx="80" cy="122" rx="20" ry="12" fill="#2a241c" opacity=".06"/>
  </g>
  <circle class="yolk-core" cx="60" cy="96" r="22"/>
  <g class="sparkle" stroke="#ffb703" stroke-width="3.5" stroke-linecap="round">
    <path d="M60 58v-12M34 68l-9-7M86 68l9-7M22 92h-10M98 92h10"/>
  </g>
  <g class="egg-top">
    <g clip-path="url(#${id}t)">
      <path class="shell" d="${EGG}" stroke="#2a241c" stroke-width="2.5"/>
      <ellipse cx="40" cy="44" rx="8" ry="16" fill="#fff" opacity=".7" transform="rotate(22 40 44)"/>
    </g>
    <path pathLength="1" class="crack k1" d="M44 20l6 12-6 9 8 10"/>
    <path pathLength="1" class="crack k2" d="M86 38l-8 12 8 8-6 10"/>
  </g>
  <path pathLength="1" class="crack k3" d="M9 89l5 5 12-12 12 12 12-12 12 12 12-12 12 12 12-12 12 8"/>
</svg>`;
  }

  function mountEgg(el) {
    if (el && !el.querySelector("svg")) el.innerHTML = eggMarkup();
    return el;
  }
  function setEgg(el, stage, cracked) {
    if (!el) return;
    el.dataset.stage = stage;
    el.classList.toggle("is-cracked", !!cracked);
  }
  function shakeEgg(el) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }

  /* ---------- Toast ---------- */
  let toastEl, queue = [], busy = false;
  function toast(msg) {
    queue.push(msg);
    if (!busy) nextToast();
  }
  function nextToast() {
    if (!queue.length) { busy = false; return; }
    busy = true;
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = queue.shift();
    requestAnimationFrame(() => toastEl.classList.add("show"));
    setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(nextToast, 450);
    }, 2600);
  }

  /* ---------- Mesin "kasus" ---------- */
  function initCase(id) {
    const all = load();
    const st = all[id] || { clues: [], solved: false };
    const egg = mountEgg(document.getElementById("case-egg"));
    const clueEls = Array.from(document.querySelectorAll(".clue"));
    const total = clueEls.length;
    const finalEl = document.getElementById("final");
    const solvedEl = document.getElementById("solved");
    const countEl = document.getElementById("clue-progress");
    const feedback = finalEl ? finalEl.querySelector(".feedback") : null;

    function persist() {
      const p = load();
      p[id] = st;
      save(p);
    }
    function render() {
      clueEls.forEach((el, i) => el.classList.toggle("unlocked", st.clues.includes(i)));
      setEgg(egg, Math.min(3, st.clues.length), st.solved);
      if (finalEl) finalEl.classList.toggle("locked", st.clues.length < total && !st.solved);
      if (countEl) countEl.textContent = st.solved ? "Kasus terpecahkan!" : `${st.clues.length} dari ${total} petunjuk ditemukan`;
      if (solvedEl) solvedEl.classList.toggle("show", st.solved);
    }

    const api = {
      isUnlocked: (i) => st.clues.includes(i),
      get solved() { return st.solved; },
      unlock(i) {
        if (st.clues.includes(i)) return;
        st.clues.push(i);
        persist();
        render();
        shakeEgg(egg);
        const title = clueEls[i] ? clueEls[i].querySelector("h4").textContent.trim() : "";
        toast("🔍 Petunjuk ditemukan: " + title);
        if (st.clues.length === total && !st.solved) toast("🧠 Semua petunjuk terkumpul — saatnya deduksi akhir!");
      },
      solve() {
        if (st.solved) return;
        st.solved = true;
        persist();
        render();
        toast("🥚 Cangkang pecah! Kasus terpecahkan.");
        setTimeout(() => solvedEl && solvedEl.scrollIntoView({ behavior: "smooth", block: "start" }), 900);
      },
      say(msg) { if (feedback) feedback.textContent = msg; }
    };

    // Pilihan ganda (deduksi akhir) — otomatis jika ada .choice
    document.querySelectorAll(".choice").forEach((btn) => {
      if (st.solved && btn.hasAttribute("data-correct")) btn.classList.add("right");
      btn.addEventListener("click", () => {
        if (finalEl.classList.contains("locked") || st.solved) return;
        if (btn.hasAttribute("data-correct")) {
          btn.classList.add("right");
          api.say("✔ Deduksi tepat!");
          api.solve();
        } else {
          btn.classList.remove("wrong");
          void btn.offsetWidth;
          btn.classList.add("wrong");
          api.say(btn.dataset.why || "Bukan itu. Baca lagi petunjukmu.");
        }
      });
    });

    render();
    return api;
  }

  /* ---------- Beranda ---------- */
  function initHome() {
    const p = load();
    let solved = 0;
    document.querySelectorAll(".case-card").forEach((card) => {
      const st = p[card.dataset.case] || { clues: [], solved: false };
      const egg = mountEgg(card.querySelector(".egg"));
      setEgg(egg, Math.min(3, st.clues.length), st.solved);
      card.classList.toggle("is-solved", !!st.solved);
      card.querySelector(".clue-count b").textContent = st.clues.length;
      if (st.solved) {
        solved++;
        card.querySelector(".btn").textContent = "Buka Lagi";
      }
    });

    const bar = document.getElementById("rank-bar");
    if (bar) {
      bar.style.width = (solved / 3) * 100 + "%";
      document.getElementById("rank-name").textContent = RANKS[solved];
      document.querySelectorAll(".rank-levels span").forEach((s, i) => s.classList.toggle("on", i <= solved));
    }

    const reset = document.getElementById("reset");
    if (reset) reset.addEventListener("click", () => {
      if (confirm("Hapus semua progres investigasi di browser ini?")) {
        try { localStorage.removeItem(KEY); } catch (e) {}
        location.reload();
      }
    });

    // Telur di hero: ketuk 4x untuk memecahkannya
    const hero = mountEgg(document.getElementById("hero-egg"));
    const hint = document.getElementById("egg-hint");
    const lines = [
      "Ketuk telurnya untuk mencari petunjuk…",
      "Retakan pertama! Ada sesuatu di dalam…",
      "Petunjuk kedua… cangkangnya mulai rapuh.",
      "Satu ketukan lagi untuk kebenaran!",
      "Rahasianya: konsep sulit jadi mudah kalau kamu MELIHAT & MENCOBANYA."
    ];
    let taps = 0;
    if (hero) {
      const tap = () => {
        taps = taps >= 4 ? 0 : taps + 1;
        setEgg(hero, Math.min(3, taps), taps === 4);
        hero.classList.toggle("is-cracked", taps === 4);
        if (taps < 4) shakeEgg(hero);
        hint.textContent = lines[taps];
      };
      hero.addEventListener("click", tap);
      hero.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); }
      });
    }
  }

  window.Cluegg = { mountEgg, setEgg, toast, initCase, load };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".egg").forEach(mountEgg);
    if (document.body.dataset.page === "home") initHome();
  });
})();
