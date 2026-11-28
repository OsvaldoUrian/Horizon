/* =========================================================
   CLUEGG — dashboard detektif
   Semua angka dihitung dari progres pengguna (tidak ada data contoh):
   - XP: 10 per petunjuk, 50 per kasus terpecahkan, +20 jika tanpa salah deduksi
   - Pangkat: sama dengan main.js, naik setiap satu kasus terpecahkan
   ========================================================= */
(function () {
  const A = window.ClueggAuth;
  const RANKS = Cluegg.RANKS;
  const $ = (s) => document.querySelector(s);
  const CASE_IDS = Object.keys(A.CASES);
  const XP = { clue: 10, solve: 50, perfect: 20 };
  const XP_MAX = CASE_IDS.length * (3 * XP.clue + XP.solve + XP.perfect);

  const COURSES = [
    { subject: "Fisika", id: "parabola", icon: '<path d="M3 20c4-14 14-14 18 0"/><circle cx="12" cy="9.5" r="2"/>' },
    { subject: "Matematika", id: "gelombang", icon: '<path d="M2 12c2.5-6 5-6 7.5 0s5 6 7.5 0 3-4 5-2"/>' },
    { subject: "Informatika", id: "arsip", icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' }
  ];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = (iso, withTime) => {
    if (!iso) return "–";
    const opt = withTime
      ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
      : { day: "numeric", month: "long", year: "numeric" };
    return new Date(iso).toLocaleString("id-ID", opt);
  };

  function compute() {
    const p = A.readProgress(), m = A.readMeta();
    const cases = CASE_IDS.map((id) => {
      const st = p[id] || {}, meta = m[id] || {};
      const clues = (st.clues || []).length;
      const solved = !!st.solved, misses = st.misses || 0;
      const opened = !!meta.opened_at || clues > 0 || solved;
      const status = solved ? "solved" : clues > 0 || opened ? "active" : "new";
      return { id, ...A.CASES[id], clues, solved, misses, opened, status, meta };
    });
    const solvedCount = cases.filter((c) => c.solved).length;
    const clueCount = cases.reduce((s, c) => s + c.clues, 0);
    const xp = cases.reduce((s, c) => s + c.clues * XP.clue + (c.solved ? XP.solve + (c.misses === 0 ? XP.perfect : 0) : 0), 0);
    const missions = [
      { title: "Mata Elang", desc: "Temukan petunjuk pertamamu.", now: Math.min(1, clueCount), goal: 1, icon: "🔍" },
      { title: "Cangkang Pertama", desc: "Pecahkan satu kasus.", now: Math.min(1, solvedCount), goal: 1, icon: "🥚" },
      { title: "Deduksi Sempurna", desc: "Pecahkan kasus tanpa sekali pun salah deduksi.", now: cases.some((c) => c.solved && c.misses === 0) ? 1 : 0, goal: 1, icon: "🎯" },
      { title: "Penjelajah Bidang", desc: "Buka kasus di ketiga bidang.", now: cases.filter((c) => c.opened).length, goal: 3, icon: "🧭" },
      { title: "Pengumpul Bukti", desc: "Kumpulkan semua 9 petunjuk.", now: clueCount, goal: 9, icon: "🗂️" },
      { title: "Master Detektif", desc: "Pecahkan semua kasus.", now: solvedCount, goal: 3, icon: "🏆" }
    ];
    return { cases, solvedCount, clueCount, xp, missions };
  }

  function render(data, name) {
    const { cases, solvedCount, clueCount, xp, missions } = data;

    // Ringkasan
    if (name) $("#detective-name").textContent = name;
    $("#level-no").textContent = "Level " + (solvedCount + 1);
    $("#rank-title").textContent = RANKS[solvedCount];
    $("#xp-now").textContent = xp;
    $("#xp-max").textContent = XP_MAX;
    $("#xp-bar").style.width = (xp / XP_MAX) * 100 + "%";
    const left = CASE_IDS.length - solvedCount;
    $("#xp-next").textContent = left
      ? `Pecahkan ${left === CASE_IDS.length ? "kasus pertamamu" : "1 kasus lagi"} untuk naik menjadi ${RANKS[solvedCount + 1]}.`
      : "Semua kasus terpecahkan. Kasus baru akan segera hadir!";
    Cluegg.setEgg(Cluegg.mountEgg($("#avatar-egg")), Math.min(3, solvedCount), solvedCount === CASE_IDS.length);

    // Tombol "lanjutkan": kasus yang sedang diselidiki, lalu yang belum dibuka
    const next = cases.find((c) => c.status === "active") || cases.find((c) => c.status === "new");
    const cont = $("#continue");
    if (next) {
      cont.href = next.file;
      cont.textContent = `${next.status === "active" ? "Lanjutkan" : "Mulai"} Kasus ${next.no} →`;
    } else {
      cont.href = "#statistik";
      cont.textContent = "Lihat catatan investigasi →";
    }

    const earned = missions.filter((ms) => ms.now >= ms.goal).length;
    $("#qs-clues").textContent = `${clueCount}/9`;
    $("#qs-solved").textContent = `${solvedCount}/3`;
    $("#qs-badges").textContent = `${earned}/${missions.length}`;
    $("#qs-fields").textContent = `${cases.filter((c) => c.opened).length}/3`;

    // Kursus
    const statusText = { solved: "Terpecahkan", active: "Sedang diselidiki", new: "Belum dibuka" };
    const btnText = { solved: "Buka lagi", active: "Lanjutkan", new: "Mulai" };
    $("#courses").innerHTML = COURSES.map((co) => {
      const c = cases.find((x) => x.id === co.id);
      return `
      <article class="course">
        <div class="course-head">
          <span class="course-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${co.icon}</svg></span>
          <div><h3>${co.subject}</h3><p>${c.solved ? 1 : 0} dari 1 kasus terpecahkan</p></div>
        </div>
        <div class="course-bar"><i style="width:${c.solved ? 100 : (c.clues / 3) * 75}%"></i></div>
        <a class="lesson is-${c.status}" href="${c.file}">
          <span class="egg lesson-egg" data-case-egg="${c.id}"></span>
          <span class="lesson-body">
            <small>Kasus ${c.no}</small>
            <b>${esc(c.title)}</b>
            <span class="lesson-status">${statusText[c.status]} · ${c.clues}/3 petunjuk</span>
          </span>
          <span class="lesson-go">${btnText[c.status]}</span>
        </a>
        <div class="lesson is-soon" aria-disabled="true">
          <span class="soon-ico" aria-hidden="true">🔒</span>
          <span class="lesson-body">
            <small>Kasus berikutnya</small>
            <b>Segera hadir</b>
            <span class="lesson-status">Sedang disiapkan tim Cluegg</span>
          </span>
        </div>
      </article>`;
    }).join("");
    document.querySelectorAll("[data-case-egg]").forEach((el) => {
      const c = cases.find((x) => x.id === el.dataset.caseEgg);
      Cluegg.setEgg(Cluegg.mountEgg(el), Math.min(3, c.clues), c.solved);
    });

    // Misi
    $("#missions").innerHTML = missions.map((ms) => {
      const done = ms.now >= ms.goal;
      return `
      <li class="mission${done ? " done" : ""}">
        <span class="badge-ico" aria-hidden="true">${ms.icon}</span>
        <span class="mission-body">
          <b>${ms.title}</b>
          <span>${ms.desc}</span>
          <span class="mission-bar"><i style="width:${(Math.min(ms.now, ms.goal) / ms.goal) * 100}%"></i></span>
        </span>
        <span class="mission-state">${done ? "✓ Lencana didapat" : `${Math.min(ms.now, ms.goal)}/${ms.goal}`}</span>
      </li>`;
    }).join("");

    // Statistik per kasus
    $("#case-table").innerHTML = `
      <div class="ct-row ct-head"><span>Kasus</span><span>Petunjuk</span><span>Salah</span><span>Status</span></div>` +
      cases.map((c) => `
      <div class="ct-row">
        <span><b>${c.no}</b> ${c.subject}</span>
        <span>${c.clues}/3</span>
        <span>${c.misses}</span>
        <span class="st-${c.status}">${statusText[c.status]}</span>
      </div>`).join("");

    // Riwayat: dari waktu membuka & memecahkan kasus
    const events = [];
    cases.forEach((c) => {
      if (c.meta.solved_at) events.push({ t: c.meta.solved_at, txt: `Memecahkan <b>Kasus ${c.no}</b> · ${c.subject}`, kind: "solved" });
      if (c.meta.opened_at) events.push({ t: c.meta.opened_at, txt: `Membuka <b>Kasus ${c.no}</b> · ${c.subject}`, kind: "opened" });
    });
    events.sort((a, b) => (a.t < b.t ? 1 : -1));
    $("#timeline").innerHTML = events.length
      ? events.slice(0, 6).map((e) => `<li class="${e.kind}"><span>${e.txt}</span><time datetime="${e.t}">${fmtDate(e.t, true)}</time></li>`).join("")
      : '<li class="empty">Belum ada aktivitas. Mulai kasus pertamamu!</li>';
  }

  // Tampilkan dulu dari data di browser, lalu perbarui setelah sinkron dengan cloud
  render(compute());

  // Di mode pratinjau tombol ini hanya kembali ke beranda (progres di browser tidak dihapus)
  $("#logout").addEventListener("click", () => (A.enabled ? A.signOut() : (location.href = "index.html")));

  $("#delete-account").addEventListener("click", async () => {
    if (!A.member) return alert("Mode pratinjau: belum ada akun yang bisa dihapus.");
    const ok = confirm("Hapus akun secara permanen?\n\nEmail, nama detektif, dan semua progres akan dihapus dan TIDAK bisa dikembalikan.");
    if (!ok) return;
    const res = await A.deleteAccount();
    if (res.error) return alert("Gagal menghapus akun. " + res.error);
    alert("Akun sudah dihapus. Terima kasih sudah belajar bersama Cluegg.");
    location.href = "index.html";
  });

  A.ready.then(async () => {
    const sync = $("#sync-status");
    if (!A.enabled) {
      // Pratinjau: Supabase belum diisi di js/config.js
      $("#greet").textContent = "Mode pratinjau";
      $("#acc-email").textContent = "Belum ada akun (Supabase belum dikonfigurasi)";
      sync.textContent = "Progres hanya tersimpan di browser ini.";
      $("#logout").textContent = "Beranda";
      return;
    }
    if (!A.member) return; // akun.js sudah mengalihkan ke halaman masuk

    const user = A.user;
    $("#acc-email").textContent = user.email;
    const [prof, res] = await Promise.all([A.profile(), A.pull()]);
    const name = (prof && prof.detective_name) || (user.user_metadata && user.user_metadata.detective_name) || "Detektif";
    $("#acc-since").textContent = fmtDate((prof && prof.created_at) || user.created_at);
    render(compute(), name);
    if (res && res.error) {
      sync.textContent = "⚠ Belum bisa tersinkron dengan cloud. Progres tetap aman di browser ini dan akan dikirim lagi nanti.";
      sync.classList.add("warn");
    } else {
      sync.textContent = "✓ Progres tersinkron dengan akunmu.";
    }
  });
})();
