# Cluegg: Crack the Egg

Website statis (HTML + CSS + sedikit JavaScript), tanpa instalasi dan tanpa build.

## Struktur
```
index.html            Halaman utama (konsep, cara kerja, papan kasus, tim)
kasus-parabola.html   Berkas #01 Fisika: gerak parabola
kasus-gelombang.html  Berkas #02 Matematika: fungsi sinus
kasus-arsip.html      Berkas #03 Informatika: binary search
css/style.css         Semua tampilan
js/main.js            Telur retak, petunjuk, progres, pangkat detektif
js/*.js               Simulasi tiap kasus
img/logo.svg          Logo Cluegg
```

## Menambah foto tim
Simpan foto di folder `img/` dengan nama `anggota-1.jpg`, `anggota-2.jpg`, dan `anggota-3.jpg`.
Foto akan muncul otomatis. Ganti nama dan peran di bagian `TIM` pada `index.html`.

## Publish
Upload seluruh folder ini ke Netlify Drop (app.netlify.com/drop), GitHub Pages, atau Vercel.
Halaman pembukanya adalah `index.html`.

Progres pemain disimpan di browser masing-masing (localStorage).
Tombol "Reset progres" di halaman utama menghapus progres tersebut.
