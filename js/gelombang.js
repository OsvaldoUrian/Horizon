/* Berkas #02 — Simulasi fungsi sinus */
(function () {
  const game = Cluegg.initCase("gelombang");
  const $ = (s) => document.querySelector(s);
  const cv = $("#sim"), ctx = cv.getContext("2d");
  const amp = $("#amp"), freq = $("#freq"), phase = $("#phase");
  const TARGET = { A: 2, B: 1.5, C: 2 }; // C dalam kelipatan π/4
  const START = { A: 1, B: 1, C: 0 };
  const XMAX = 4 * Math.PI, YMAX = 3.5;
  const M = { l: 34, r: 14, t: 14, b: 28 };
  const PHASE_LABEL = ["0", "π/4", "π/2", "3π/4", "π", "5π/4", "3π/2", "7π/4"];
  const num = (n, d = 2) => n.toLocaleString("id-ID", { maximumFractionDigits: d });
  const piText = (n) => (num(n) === "1" ? "" : num(n)) + "π"; // "π", bukan "1π"
  let W = 0, H = 0;

  const val = () => ({ A: +amp.value, B: +freq.value, C: +phase.value });
  const f = (p, x) => p.A * Math.sin(p.B * x + (p.C * Math.PI) / 4);

  function resize() {
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const X = (x) => M.l + (x / XMAX) * (W - M.l - M.r);
  const Y = (y) => M.t + ((YMAX - y) / (2 * YMAX)) * (H - M.t - M.b);

  function curve(p, color, width, dash) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []);
    ctx.beginPath();
    for (let i = 0; i <= 400; i++) {
      const x = (XMAX * i) / 400;
      i ? ctx.lineTo(X(x), Y(f(p, x))) : ctx.moveTo(X(x), Y(f(p, x)));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function draw(time) {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    ctx.font = "11px 'Space Grotesk', sans-serif";
    ctx.lineWidth = 1;
    // grid
    for (let y = -3; y <= 3; y++) {
      ctx.strokeStyle = y === 0 ? "rgba(255,247,232,.3)" : "rgba(255,247,232,.07)";
      ctx.beginPath(); ctx.moveTo(M.l, Y(y)); ctx.lineTo(W - M.r, Y(y)); ctx.stroke();
      ctx.fillStyle = "rgba(245,239,228,.45)";
      ctx.fillText(String(y), 10, Y(y) + 4);
    }
    for (let k = 1; k <= 4; k++) {
      ctx.strokeStyle = "rgba(255,247,232,.07)";
      ctx.beginPath(); ctx.moveTo(X(k * Math.PI), M.t); ctx.lineTo(X(k * Math.PI), H - M.b); ctx.stroke();
      ctx.fillText((k === 1 ? "" : k) + "π", X(k * Math.PI) - 8, H - 8);
    }
    const p = val();
    curve(TARGET, "#e5383b", 2.5, [8, 7]);
    ctx.shadowColor = "rgba(255,183,3,.6)"; ctx.shadowBlur = 10;
    curve(p, "#ffb703", 3);
    ctx.shadowBlur = 0;

    // titik "pemindai" yang berjalan di gelombang
    const x = ((time || 0) / 4000 % 1) * XMAX, y = f(p, x);
    ctx.strokeStyle = "rgba(76,201,240,.5)"; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(y)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#4cc9f0";
    ctx.beginPath(); ctx.arc(X(x), Y(y), 6, 0, Math.PI * 2); ctx.fill();
  }

  function loop(t) { draw(t); requestAnimationFrame(loop); }

  function score(p) {
    let s = 0;
    for (let i = 0; i <= 200; i++) {
      const x = (XMAX * i) / 200, d = f(p, x) - f(TARGET, x);
      s += d * d;
    }
    const rms = Math.sqrt(s / 201);
    return Math.round(Math.max(0, 1 - rms / 2.2) * 100);
  }

  function update(e) {
    const p = val();
    $("#amp-out").textContent = num(p.A, 1);
    $("#freq-out").textContent = num(p.B, 1);
    $("#phase-out").textContent = PHASE_LABEL[p.C];
    $("#eq").textContent = `y = ${num(p.A, 1)} · sin(${num(p.B, 1)}x + ${PHASE_LABEL[p.C]})`;
    $("#r-peak").textContent = "y = " + num(p.A, 1);
    $("#r-period").textContent = piText(2 / p.B);
    $("#r-shift").textContent = p.C === 0 ? "0" : piText(p.C / 4 / p.B);
    const sc = score(p);
    $("#score").textContent = sc + "%";
    $("#score-bar").style.width = sc + "%";
    $("#score-bar").style.backgroundPosition = -(300 - sc * 3) + "px 0";

    if (e) {
      if (p.A !== START.A) game.unlock(0);
      if (p.B !== START.B) game.unlock(1);
      if (p.C !== START.C) game.unlock(2);
    }
  }

  $("#submit").addEventListener("click", () => {
    if (game.solved) return game.say("Kasus ini sudah terpecahkan. Kerja bagus!");
    if (document.getElementById("final").classList.contains("locked")) return;
    const p = val(), off = [];
    if (p.A !== TARGET.A) off.push(p.A > TARGET.A ? "terlalu tinggi" : "terlalu pendek");
    if (p.B !== TARGET.B) off.push(p.B > TARGET.B ? "terlalu rapat" : "terlalu renggang");
    if (p.C !== TARGET.C) off.push("posisinya masih bergeser");
    if (!off.length) {
      game.say("✔ Sinyal cocok 100%! Asal sinyal terbukti.");
      game.solve();
    } else {
      game.say("✘ Belum cocok: gelombangmu " + off.join(", ") + ".");
    }
  });

  [amp, freq, phase].forEach((el) => el.addEventListener("input", update));
  window.addEventListener("resize", resize);
  resize();
  update();
  requestAnimationFrame(loop);
})();
