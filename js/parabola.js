/* Berkas #01 — Simulasi gerak parabola */
(function () {
  const game = Cluegg.initCase("parabola");
  const $ = (s) => document.querySelector(s);
  const cv = $("#sim"), ctx = cv.getContext("2d");
  const angle = $("#angle"), speed = $("#speed"), grav = $("#gravity");
  const COLORS = ["#ffb703", "#4cc9f0", "#f72585", "#80ed99", "#fb8500", "#c77dff"];
  const M = { l: 46, r: 22, t: 26, b: 34 };
  const num = (n, d = 1) => n.toLocaleString("id-ID", { maximumFractionDigits: d });

  let trails = [], anim = null, colorIdx = 0, W = 0, H = 0;

  function calc(a, v, g) {
    const t = (a * Math.PI) / 180;
    return {
      R: (v * v * Math.sin(2 * t)) / g,
      Hm: (v * Math.sin(t)) ** 2 / (2 * g),
      T: (2 * v * Math.sin(t)) / g,
      vx: v * Math.cos(t),
      vy: v * Math.sin(t)
    };
  }

  function resize() {
    const r = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function scale() {
    let maxR = 20, maxH = 8;
    const list = anim ? trails.concat([anim.tr]) : trails;
    list.forEach((tr) => { maxR = Math.max(maxR, tr.R); maxH = Math.max(maxH, tr.Hm); });
    const pw = W - M.l - M.r, ph = H - M.t - M.b;
    return Math.min(pw / (maxR * 1.06), ph / (maxH * 1.2));
  }
  const px = (x, s) => M.l + x * s;
  const py = (y, s) => H - M.b - y * s;

  function niceStep(range) {
    const raw = range / 6, p = 10 ** Math.floor(Math.log10(raw)), n = raw / p;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
  }
  function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const s = scale();
    const wMax = (W - M.l - M.r) / s, hMax = (H - M.t - M.b) / s, step = niceStep(wMax);

    // grid
    ctx.font = "11px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "rgba(245,239,228,.45)";
    ctx.strokeStyle = "rgba(255,247,232,.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= wMax + 0.001; x += step) {
      line(px(x, s), M.t, px(x, s), H - M.b);
      ctx.fillText(num(x, 0) + " m", px(x, s) + 3, H - M.b + 18);
    }
    for (let y = step; y <= hMax; y += step) {
      line(M.l, py(y, s), W - M.r, py(y, s));
      ctx.fillText(num(y, 0), 8, py(y, s) + 4);
    }
    // ground
    ctx.strokeStyle = "rgba(255,183,3,.55)"; ctx.lineWidth = 2;
    line(M.l - 12, H - M.b, W - M.r, H - M.b);

    trails.forEach((tr) => drawTrail(tr, s, 1, false));
    if (anim) drawTrail(anim.tr, s, anim.p, true);
    drawCannon();
  }

  function drawCannon() {
    const a = (+angle.value * Math.PI) / 180;
    ctx.save();
    ctx.translate(M.l, H - M.b);
    ctx.rotate(-a);
    ctx.fillStyle = "#fff7e8";
    ctx.fillRect(-4, -6, 32, 12);
    ctx.fillStyle = "#2a241c";
    ctx.fillRect(24, -7, 6, 14);
    ctx.restore();
    ctx.fillStyle = "#ffb703";
    ctx.beginPath(); ctx.arc(M.l, H - M.b, 10, Math.PI, 0); ctx.fill();
  }

  function drawTrail(tr, s, p, live) {
    const tEnd = tr.T * p, N = 90;
    ctx.strokeStyle = tr.color; ctx.lineWidth = live ? 3 : 2.2;
    ctx.globalAlpha = live ? 1 : 0.85;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const t = (tEnd * i) / N;
      const x = tr.vx * t, y = Math.max(0, tr.vy * t - 0.5 * tr.g * t * t);
      i ? ctx.lineTo(px(x, s), py(y, s)) : ctx.moveTo(px(x, s), py(y, s));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    const bx = tr.vx * tEnd, by = Math.max(0, tr.vy * tEnd - 0.5 * tr.g * tEnd * tEnd);
    ctx.fillStyle = tr.color;
    ctx.beginPath(); ctx.arc(px(bx, s), py(by, s), live ? 7 : 4.5, 0, Math.PI * 2); ctx.fill();
    if (p >= 1) {
      ctx.font = "600 11px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${tr.a}° · ${tr.gName}`, px(tr.R / 2, s), py(tr.Hm, s) - 8);
      ctx.textAlign = "left";
    }
  }

  function readout(tr) {
    $("#r-range").textContent = num(tr.R) + " m";
    $("#r-height").textContent = num(tr.Hm) + " m";
    $("#r-time").textContent = num(tr.T, 2) + " s";
    $("#formula").innerHTML =
      `R = v² · sin(2θ) / g = ${tr.v}² · sin(${2 * tr.a}°) / ${num(tr.g, 2)} = <b>${num(tr.R)} m</b>`;
  }

  function fire() {
    if (anim) return;
    const a = +angle.value, v = +speed.value, g = +grav.value;
    const tr = Object.assign({ a, v, g, gName: grav.selectedOptions[0].dataset.name, color: COLORS[colorIdx++ % COLORS.length] }, calc(a, v, g));
    anim = { tr, p: 0, start: performance.now(), dur: Math.min(2600, Math.max(1100, tr.T * 220)) };
    $("#fire").disabled = true;
    requestAnimationFrame(tick);
  }
  function tick(now) {
    anim.p = Math.min(1, (now - anim.start) / anim.dur);
    draw();
    if (anim.p < 1) return requestAnimationFrame(tick);
    const tr = anim.tr;
    anim = null;
    trails.push(tr);
    if (trails.length > 6) trails.shift();
    draw();
    readout(tr);
    $("#fire").disabled = false;
    checkClues(tr);
  }

  function checkClues(tr) {
    game.unlock(0);
    const twin = trails.some((o) => o !== tr && o.v === tr.v && o.g === tr.g && o.a + tr.a === 90 && o.a !== tr.a);
    if (twin) game.unlock(1);
    if (tr.g !== 9.8) game.unlock(2);
  }

  angle.addEventListener("input", () => { $("#angle-out").textContent = angle.value + "°"; draw(); });
  speed.addEventListener("input", () => { $("#speed-out").textContent = speed.value + " m/s"; });
  $("#fire").addEventListener("click", fire);
  $("#clear").addEventListener("click", () => { if (!anim) { trails = []; draw(); } });
  window.addEventListener("resize", resize);
  resize();
  if (document.fonts) document.fonts.ready.then(draw);
})();
