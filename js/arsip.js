/* Berkas #03 — Simulasi binary search */
(function () {
  const game = Cluegg.initCase("arsip");
  const $ = (s) => document.querySelector(s);
  const grid = $("#lockers"), status = $("#status"), log = $("#log"), showMid = $("#show-mid");
  const N = 100, LIMIT = 7;
  const cells = [];
  let secret, lo, hi, steps, done;

  for (let i = 1; i <= N; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "locker";
    b.textContent = i;
    b.setAttribute("aria-label", "Laci " + i);
    b.addEventListener("click", () => guess(i));
    grid.appendChild(b);
    cells.push(b);
  }

  const mid = () => Math.floor((lo + hi) / 2);

  function render() {
    cells.forEach((c, idx) => {
      const n = idx + 1, out = done ? n !== secret : n < lo || n > hi;
      c.classList.toggle("out", out && !c.classList.contains("found"));
      c.disabled = done || out;
      c.classList.toggle("mid", !done && showMid.checked && n === mid());
    });
    const left = done ? 1 : hi - lo + 1;
    $("#r-steps").textContent = steps;
    $("#r-left").textContent = left;
    const bar = $("#range-bar");
    bar.style.left = ((lo - 1) / N) * 100 + "%";
    bar.style.width = (left / N) * 100 + "%";
  }

  function newRound() {
    secret = 1 + Math.floor(Math.random() * N);
    lo = 1; hi = N; steps = 0; done = false;
    cells.forEach((c) => c.classList.remove("guessed", "found", "out"));
    log.innerHTML = "";
    status.textContent = "Berkas tersembunyi di salah satu laci 1–100. Pilih laci pertamamu!";
    render();
  }

  function guess(n) {
    if (done || n < lo || n > hi) return;
    const m = mid(), wasMiddle = Math.abs(n - m) <= 1 && hi - lo >= 3;
    steps++;
    game.unlock(0);
    if (steps >= 2 && wasMiddle) game.unlock(1);

    if (n === secret) {
      done = true;
      cells[n - 1].classList.add("found");
      if (steps <= LIMIT) {
        status.textContent = `🎉 Ketemu! Berkas ada di laci ${n}. Hanya ${steps} langkah, setara detektif kilat!`;
        game.unlock(2);
      } else {
        status.textContent = `Ketemu di laci ${n} setelah ${steps} langkah. Detektif terbaik selalu bisa ≤ ${LIMIT} langkah. Coba kasus baru?`;
      }
    } else {
      cells[n - 1].classList.add("guessed");
      if (n < secret) {
        lo = n + 1;
        status.textContent = `Laci ${n} kosong. Penjaga: "Nomornya LEBIH BESAR dari ${n}."`;
      } else {
        hi = n - 1;
        status.textContent = `Laci ${n} kosong. Penjaga: "Nomornya LEBIH KECIL dari ${n}."`;
      }
      if (steps >= LIMIT && !done) status.textContent += ` (Batas ${LIMIT} langkah sudah lewat.)`;
    }
    const li = document.createElement("li");
    li.innerHTML = `#${steps} laci <b>${n}</b> → sisa ${done ? 1 : hi - lo + 1}`;
    log.appendChild(li);
    render();
  }

  showMid.addEventListener("change", render);
  $("#restart").addEventListener("click", newRound);
  newRound();
})();
