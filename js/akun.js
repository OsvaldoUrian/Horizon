/* =========================================================
   CLUEGG — akun, sinkronisasi progres, dan mode tamu (demo)

   Alur data:
   - Saat bermain, main.js tetap menyimpan progres di browser (localStorage)
     dan mengirim event "cluegg:progress".
   - Kalau pengguna login, file ini mengirim progres itu ke Supabase
     (tabel "progress") dan menariknya kembali saat login / membuka dashboard.
   - Tamu (belum login) boleh memecahkan SATU kasus. Setelah itu kasus lain
     terkunci sampai ia mendaftar. Progres demo ikut tersimpan saat mendaftar.

   File ini dimuat TANPA defer di <head>, supaya pengalihan halaman dan kunci
   trial terjadi sebelum halaman terlihat (tidak berkedip).
   ========================================================= */
(function () {
  const PROGRESS_KEY = "cluegg-progress-v1";
  const META_KEY = "cluegg-meta-v1";
  const QUIZ_KEY = "cluegg-quiz-v1";
  const CASES = {
    parabola: { no: "#01", file: "kasus-parabola.html", subject: "Fisika", title: "Misteri Tembakan Terjauh" },
    gelombang: { no: "#02", file: "kasus-gelombang.html", subject: "Matematika", title: "Sinyal Gelombang Misterius" },
    arsip: { no: "#03", file: "kasus-arsip.html", subject: "Informatika", title: "Berkas Hilang di Lemari Arsip" }
  };

  const cfg = window.CLUEGG_CONFIG || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseKey);

  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* mode privat */ } };
  const remove = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
  const now = () => new Date().toISOString();

  /* ---------- Halaman apa ini? ---------- */
  const path = location.pathname;
  const caseMatch = path.match(/kasus-(parabola|gelombang|arsip)/);
  const currentCase = caseMatch ? caseMatch[1] : null;
  const page = currentCase ? "case"
    : /dashboard/.test(path) ? "dashboard"
    : /masuk/.test(path) ? "masuk"
    : /privasi/.test(path) ? "privasi"
    : "home";

  /* ---------- Cek cepat sesi (tanpa jaringan) ---------- */
  // Supabase menyimpan sesi di localStorage dengan kunci "sb-<ref>-auth-token".
  function sessionKey() {
    try { return "sb-" + new URL(cfg.supabaseUrl).hostname.split(".")[0] + "-auth-token"; } catch (e) { return null; }
  }
  function hasStoredSession() {
    if (!enabled) return false;
    const k = sessionKey();
    try { return !!(k && localStorage.getItem(k)); } catch (e) { return false; }
  }

  /* ---------- Aturan trial tamu ---------- */
  // Kasus yang sudah dipecahkan saat menjadi tamu = kasus trial-nya.
  function trialCase() {
    const p = read(PROGRESS_KEY);
    return Object.keys(CASES).find((id) => p[id] && p[id].solved) || null;
  }
  const isLockedForGuest = (id) => { const t = trialCase(); return !!(t && t !== id); };

  const root = document.documentElement;
  let member = hasStoredSession();

  function applyRootState() {
    root.classList.toggle("is-member", member);
    root.classList.toggle("is-guest", !member);
    root.classList.toggle("trial-locked", !member && page === "case" && isLockedForGuest(currentCase));
  }
  applyRootState();

  // Pengalihan awal: beranda (promosi) hanya untuk tamu, dashboard hanya untuk member.
  if (page === "home" && member) location.replace("dashboard.html");
  // (Selama Supabase belum dikonfigurasi, dashboard bisa dibuka sebagai pratinjau.)
  if (page === "dashboard" && !member && enabled) location.replace("masuk.html");

  /* ---------- Catatan waktu (untuk riwayat di dashboard) ---------- */
  function touchMeta(id, fields) {
    const m = read(META_KEY);
    m[id] = Object.assign({}, m[id], fields);
    write(META_KEY, m);
  }
  // Kasus yang terkunci (tamu) tidak dihitung sebagai "dibuka"
  if (currentCase && !root.classList.contains("trial-locked")) touchMeta(currentCase, { opened_at: now() });

  /* ---------- Supabase ---------- */
  let client = null, session = null;

  const ready = new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", async () => {
      if (enabled && window.supabase && window.supabase.createClient) {
        try {
          client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
          const { data } = await client.auth.getSession();
          session = data.session;
        } catch (e) {
          client = null;
        }
      }
      // Sesi lama yang sudah tidak berlaku -> kembali jadi tamu
      if (member && !session) {
        member = false;
        applyRootState();
        if (page === "dashboard") return location.replace("masuk.html");
      }
      resolve();
    });
  });

  const latest = (a, b) => (!a ? b || null : !b ? a : a > b ? a : b);
  const earliest = (a, b) => (!a ? b || null : !b ? a : a < b ? a : b);

  function rowFor(id) {
    const p = read(PROGRESS_KEY)[id] || {};
    const m = read(META_KEY)[id] || {};
    return {
      user_id: session.user.id,
      case_id: id,
      clues: (p.clues || []).slice().sort((a, b) => a - b),
      solved: !!p.solved,
      misses: p.misses || 0,
      opened_at: m.opened_at || null,
      solved_at: m.solved_at || null,
      updated_at: m.updated_at || now()
    };
  }

  async function push(ids) {
    if (!client || !session || !ids.length) return { error: null };
    const { error } = await client.from("progress").upsert(ids.map(rowFor));
    if (error) console.warn("Cluegg: progres belum tersinkron", error.message);
    return { error };
  }

  // Gabungkan progres di cloud dengan progres di browser (tidak ada yang hilang):
  // petunjuk digabung, "terpecahkan" diambil yang true, jumlah salah diambil yang terbesar.
  async function pull() {
    if (!client || !session) return { error: null };
    const { data, error } = await client.from("progress").select("*");
    if (error) return { error };
    const p = read(PROGRESS_KEY), m = read(META_KEY);
    (data || []).forEach((r) => {
      const l = p[r.case_id] || { clues: [], solved: false };
      p[r.case_id] = {
        clues: Array.from(new Set([...(l.clues || []), ...(r.clues || [])])).sort((a, b) => a - b),
        solved: !!(l.solved || r.solved),
        misses: Math.max(l.misses || 0, r.misses || 0)
      };
      const lm = m[r.case_id] || {};
      m[r.case_id] = {
        opened_at: latest(lm.opened_at, r.opened_at),
        solved_at: earliest(lm.solved_at, r.solved_at),
        updated_at: latest(lm.updated_at, r.updated_at)
      };
    });
    write(PROGRESS_KEY, p);
    write(META_KEY, m);
    return push(Object.keys(p).filter((id) => CASES[id]));
  }

  const timers = {};
  function schedulePush(id) {
    clearTimeout(timers[id]);
    timers[id] = setTimeout(() => push([id]), 600);
  }

  /* ---------- Pesan error dalam bahasa Indonesia ---------- */
  function translate(error) {
    const msg = (error && (error.message || String(error))) || "";
    if (/invalid login credentials/i.test(msg)) return "Email atau kata sandi salah.";
    if (/already registered|already been registered|user already exists/i.test(msg)) return "Email ini sudah terdaftar. Silakan masuk.";
    if (/password should be at least/i.test(msg)) return "Kata sandi terlalu pendek.";
    if (/unable to validate email|invalid email|email address .* is invalid/i.test(msg)) return "Format email tidak valid.";
    if (/rate limit|too many requests/i.test(msg)) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
    if (/email not confirmed/i.test(msg)) return "Email belum dikonfirmasi. Cek kotak masuk emailmu.";
    if (/failed to fetch|network/i.test(msg)) return "Tidak bisa terhubung ke server. Periksa koneksi internetmu.";
    return "Terjadi kesalahan: " + msg;
  }

  /* ---------- Aksi akun (dipakai masuk.html & dashboard) ---------- */
  async function signUp(name, email, password) {
    await ready;
    if (!client) return { error: "Login belum tersedia." };
    const { data, error } = await client.auth.signUp({
      email, password, options: { data: { detective_name: name } }
    });
    if (error) return { error: translate(error) };
    if (!data.session) return { needsConfirm: true };
    session = data.session; member = true;
    await pull(); // progres demo ikut tersimpan ke akun baru
    return {};
  }

  async function signIn(email, password) {
    await ready;
    if (!client) return { error: "Login belum tersedia." };
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { error: translate(error) };
    session = data.session; member = true;
    await pull();
    return {};
  }

  // Saat keluar, progres di browser dibersihkan (sudah aman di cloud),
  // supaya pengguna berikutnya di perangkat yang sama mulai sebagai tamu baru.
  function clearLocal() { [PROGRESS_KEY, META_KEY, QUIZ_KEY].forEach(remove); }

  async function signOut() {
    await ready;
    if (client) await client.auth.signOut();
    clearLocal();
    location.href = "index.html";
  }

  async function deleteAccount() {
    await ready;
    if (!client || !session) return { error: "Belum masuk." };
    const { error } = await client.rpc("delete_my_account");
    if (error) return { error: translate(error) };
    await client.auth.signOut();
    clearLocal();
    return {};
  }

  async function profile() {
    await ready;
    if (!client || !session) return null;
    const { data } = await client.from("profiles").select("detective_name, created_at").eq("id", session.user.id).maybeSingle();
    return data;
  }

  /* ---------- Progres baru dari main.js ---------- */
  document.addEventListener("cluegg:progress", (e) => {
    const { id, state } = e.detail || {};
    if (!CASES[id]) return;
    const fields = { updated_at: now() };
    const m = read(META_KEY)[id] || {};
    if (state && state.solved && !m.solved_at) fields.solved_at = now();
    touchMeta(id, fields);
    if (member && session) schedulePush(id);
    if (!member && state && state.solved) showTrialDone();
  });

  /* ---------- Tampilan untuk tamu / member ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function updateHeader() {
    const btn = document.querySelector(".nav > .btn");
    if (!btn || page === "dashboard") return; // dashboard punya tombol "Keluar" sendiri
    if (member) {
      btn.textContent = "Dashboard";
      btn.href = "dashboard.html";
    } else if (page !== "masuk") {
      btn.textContent = "Masuk";
      btn.href = "masuk.html";
    }
  }

  function rewriteLinksForMember() {
    document.querySelectorAll('a[href="index.html#kasus"]').forEach((a) => {
      a.href = "dashboard.html#kursus";
      if (/papan kasus/i.test(a.textContent)) a.textContent = a.textContent.replace(/papan kasus/i, "dashboard");
    });
  }

  function guestBar() {
    if (document.querySelector(".guest-bar")) return;
    const bar = document.createElement("div");
    bar.className = "guest-bar";
    bar.innerHTML = '<div class="container"><span><b>Mode demo</b> · Sebagai tamu, kamu bisa memecahkan <b>satu</b> kasus. Progres demo ikut tersimpan saat kamu mendaftar.</span>'
      + '<a href="masuk.html#daftar">Daftar gratis →</a></div>';
    const header = document.querySelector(".site-header");
    if (header) header.after(bar);
  }

  function trialLockScreen() {
    const t = trialCase();
    if (!t || document.querySelector(".trial-lock")) return;
    const sec = document.createElement("section");
    sec.className = "trial-lock container";
    sec.innerHTML =
      '<div class="trial-lock-card">' +
      '<div class="lock-icon" aria-hidden="true">🔒</div>' +
      '<p class="eyebrow">Demo sudah dipakai</p>' +
      "<h1>Berkas ini masih tersegel.</h1>" +
      `<p>Kamu sudah memecahkan <b>Kasus ${CASES[t].no} (${esc(CASES[t].subject)})</b> sebagai tamu. Daftar gratis untuk membuka semua bidang. Hasil demomu ikut tersimpan.</p>` +
      '<div class="trial-actions">' +
      '<a class="btn btn-primary" href="masuk.html#daftar">Daftar gratis</a>' +
      '<a class="btn btn-ghost" href="masuk.html">Sudah punya akun? Masuk</a>' +
      "</div>" +
      `<a class="trial-back" href="${CASES[t].file}">← Lihat lagi Kasus ${CASES[t].no}</a>` +
      "</div>";
    const main = document.querySelector("main");
    if (main) main.before(sec);
  }

  // Setelah tamu memecahkan kasus: ajak mendaftar, dan tombol "Lanjut ke berkas berikutnya" diarahkan ke daftar.
  function showTrialDone() {
    const solved = document.getElementById("solved");
    if (solved && !solved.querySelector(".trial-cta")) {
      const box = document.createElement("div");
      box.className = "trial-cta";
      box.innerHTML = "<div><b>🎉 Demo selesai!</b> Daftar gratis supaya hasil ini tersimpan dan dua bidang lainnya terbuka.</div>"
        + '<a class="btn btn-primary" href="masuk.html#daftar">Daftar &amp; simpan hasil</a>';
      solved.querySelector(".solved-actions")?.before(box);
    }
    document.querySelectorAll(".solved-actions a").forEach((a) => {
      if (/kasus-/.test(a.getAttribute("href"))) {
        a.href = "masuk.html#daftar";
        a.textContent = "Daftar untuk lanjut →";
      }
    });
  }

  // Kartu "Coba demo" di beranda
  function markHomeCards() {
    const t = trialCase();
    document.querySelectorAll(".case-card[data-case]").forEach((card) => {
      const id = card.dataset.case;
      const locked = !!(t && t !== id);
      card.classList.toggle("is-locked", locked);
      const btn = card.querySelector(".btn");
      if (btn && locked) {
        btn.textContent = "🔒 Daftar untuk membuka";
        btn.href = "masuk.html#daftar";
      }
    });
    const note = document.getElementById("trial-note");
    if (note && t) {
      note.innerHTML = `Kamu sudah memakai demo di <b>Kasus ${CASES[t].no} (${esc(CASES[t].subject)})</b>. <a href="masuk.html#daftar">Daftar gratis</a> untuk membuka semua kasus.`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateHeader();
    if (!member) {
      if (page === "case") {
        if (isLockedForGuest(currentCase)) trialLockScreen();
        else guestBar();
        if (trialCase() === currentCase) showTrialDone();
      }
      if (page === "home") markHomeCards();
    } else {
      rewriteLinksForMember();
    }
  });

  // Setelah sesi dipastikan: kirim waktu "terakhir dibuka" untuk kasus ini
  ready.then(() => {
    updateHeader();
    if (!member && page === "case") {
      if (isLockedForGuest(currentCase)) trialLockScreen(); else guestBar();
    }
    if (member && session && currentCase) push([currentCase]);
  });

  window.ClueggAuth = {
    enabled, ready, CASES, page,
    get member() { return member; },
    get session() { return session; },
    get user() { return session ? session.user : null; },
    readProgress: () => read(PROGRESS_KEY),
    readMeta: () => read(META_KEY),
    readQuiz: () => read(QUIZ_KEY),
    trialCase, signUp, signIn, signOut, deleteAccount, profile, pull
  };
})();
