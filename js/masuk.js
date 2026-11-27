/* Halaman masuk / daftar */
(function () {
  const A = window.ClueggAuth;
  const $ = (s) => document.querySelector(s);
  const tabs = { masuk: $("#tab-masuk"), daftar: $("#tab-daftar") };
  const forms = { masuk: $("#form-masuk"), daftar: $("#form-daftar") };

  const tabBar = document.querySelector(".auth-tabs");
  const stack = $("#auth-forms");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = null, settleTimer = 0;

  // Ganti tab dengan mulus: pil tab bergeser, form lama pudar ke samping,
  // form baru masuk dari arah tab-nya, dan tinggi kartu berubah perlahan.
  function show(which, animate) {
    if (which === current) return;
    const from = stack.offsetHeight;
    Object.keys(tabs).forEach((k) => {
      const on = k === which;
      tabs[k].setAttribute("aria-selected", String(on));
      tabs[k].tabIndex = on ? 0 : -1;
      forms[k].classList.toggle("is-active", on);
      forms[k].setAttribute("aria-hidden", String(!on));
      forms[k].inert = !on; // form tersembunyi tidak bisa di-Tab
    });
    tabBar.dataset.active = which;
    current = which;

    clearTimeout(settleTimer);
    if (!animate || reduceMotion) { stack.style.height = ""; return; }
    // Animasi tinggi: kunci tinggi lama -> ukur tinggi baru -> transisi -> lepas lagi (auto)
    stack.style.height = "auto";
    const to = stack.offsetHeight;
    stack.style.height = from + "px";
    void stack.offsetHeight;
    stack.style.height = to + "px";
    settleTimer = setTimeout(() => { stack.style.height = ""; }, 450);
  }
  function choose(which) {
    show(which, true);
    history.replaceState(null, "", "#" + which);
  }
  tabs.masuk.addEventListener("click", () => choose("masuk"));
  tabs.daftar.addEventListener("click", () => choose("daftar"));
  // Panah kiri/kanan untuk pindah tab (pola standar tablist)
  tabBar.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = e.key === "ArrowRight" ? "daftar" : "masuk";
    choose(next);
    tabs[next].focus();
  });
  // Posisi awal langsung tepat (tanpa animasi meluncur saat halaman baru dibuka)
  tabBar.classList.add("instant");
  stack.classList.add("instant");
  show(location.hash === "#daftar" ? "daftar" : "masuk", false);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    tabBar.classList.remove("instant");
    stack.classList.remove("instant");
  }));
  window.addEventListener("hashchange", () => show(location.hash === "#daftar" ? "daftar" : "masuk", true));

  // Telur di samping: setengah retak, menunggu dipecahkan
  Cluegg.setEgg(Cluegg.mountEgg(document.querySelector(".auth-egg")), 2, false);

  if (!A.enabled) {
    $("#auth-off").hidden = false;
    document.querySelectorAll(".auth-form button[type=submit]").forEach((b) => (b.disabled = true));
  }

  // Sudah login? Langsung ke dashboard.
  A.ready.then(() => { if (A.member) location.replace("dashboard.html"); });

  function say(form, msg, ok) {
    const el = form.querySelector(".form-msg");
    el.textContent = msg;
    el.className = "form-msg " + (ok ? "ok" : "error");
  }
  function busy(form, on, label) {
    const b = form.querySelector("button[type=submit]");
    b.disabled = on;
    if (label) b.textContent = label;
  }
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  forms.masuk.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = forms.masuk;
    const email = f.email.value.trim(), password = f.password.value;
    if (!validEmail(email)) return say(f, "Masukkan email yang valid.");
    if (!password) return say(f, "Masukkan kata sandi.");
    busy(f, true, "Memeriksa…");
    say(f, "", true);
    const res = await A.signIn(email, password);
    if (res.error) { busy(f, false, "Masuk"); return say(f, res.error); }
    say(f, "Berhasil! Membuka dashboard…", true);
    location.href = "dashboard.html";
  });

  forms.daftar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = forms.daftar;
    const name = f.name.value.trim(), email = f.email.value.trim(), password = f.password.value;
    if (name.length < 2 || name.length > 30) return say(f, "Nama detektif 2 sampai 30 karakter.");
    if (!validEmail(email)) return say(f, "Masukkan email yang valid.");
    if (password.length < 8) return say(f, "Kata sandi minimal 8 karakter.");
    if (!$("#daftar-setuju").checked) return say(f, "Centang persetujuan kebijakan privasi dulu.");
    busy(f, true, "Membuat akun…");
    say(f, "", true);
    const res = await A.signUp(name, email, password);
    if (res.error) { busy(f, false, "Buat akun gratis"); return say(f, res.error); }
    if (res.needsConfirm) {
      busy(f, false, "Buat akun gratis");
      return say(f, "Akun dibuat. Cek emailmu untuk konfirmasi, lalu masuk.", true);
    }
    say(f, "Akun dibuat! Membuka dashboard…", true);
    location.href = "dashboard.html";
  });
})();
