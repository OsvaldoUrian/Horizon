# Cluegg: Crack the Egg

Website statis (HTML + CSS + JavaScript), tanpa build. Akun pengguna memakai Supabase.

## Struktur
```
index.html            Halaman promosi untuk tamu (masalah, dampak SDG 4, cara kerja, coba demo, tim)
masuk.html            Masuk / daftar akun
dashboard.html        Dashboard member: level, kursus, misi, riwayat & statistik
privasi.html          Kebijakan privasi
kasus-parabola.html   Berkas #01 Fisika: gerak parabola
kasus-gelombang.html  Berkas #02 Matematika: fungsi sinus
kasus-arsip.html      Berkas #03 Informatika: binary search
css/style.css         Tampilan utama
css/dampak.css        Bagian SDG 4 + indikator kasus gelombang
css/akun.css          Halaman akun, mode tamu, privasi
css/dashboard.css     Dashboard
js/config.js          URL & anon key Supabase (kosong = mode demo saja)
js/akun.js            Login, sinkronisasi progres, aturan demo tamu
js/main.js            Telur retak, petunjuk, progres, pangkat detektif
js/dashboard.js       Isi dashboard
js/masuk.js           Form masuk / daftar
js/*.js               Simulasi tiap kasus
supabase/schema.sql   Tabel database + aturan keamanan (RLS)
img/logo.svg          Logo Cluegg
```

## Aturan akses
- **Tamu**: boleh memecahkan **satu** kasus di bidang pilihannya. Setelah itu kasus lain terkunci.
- **Member** (login): semua kasus terbuka, progres tersimpan di Supabase, beranda langsung diarahkan ke dashboard.
- Progres demo tamu ikut tersimpan saat ia mendaftar.

## Setup Supabase (sekali saja)
1. Buat project gratis di supabase.com. Simpan password database di tempat aman, **jangan** di repo.
2. **Authentication > Sign In / Providers > Email**: matikan **Confirm email**.
3. **SQL Editor > New query**: tempel isi `supabase/schema.sql`, lalu **Run**.
4. **Project Settings > API** (atau **API Keys**): salin **Project URL** dan **anon / publishable key**
   ke `js/config.js`. **Jangan** pernah memakai `service_role` / secret key.
5. Setelah website di-hosting: **Authentication > URL Configuration**, isi **Site URL** dengan alamat hosting.

Selama `js/config.js` kosong, website tetap jalan dalam mode demo, dan `dashboard.html`
bisa dibuka sebagai pratinjau dengan progres di browser.

Catatan: project Supabase gratis bisa di-pause otomatis jika lama tidak dipakai. Buka website
secara berkala selama masa penjurian. Demo tamu tetap jalan walaupun Supabase sedang mati.

## Layar permainan & membuat kasus baru
Halaman kasus tampil sebagai satu layar penuh tanpa scroll (`js/permainan.js` + `css/permainan.css`).
Kasus baru otomatis ikut asalkan:
- `<head>` memuat `css/permainan.css`, dan `<script src="js/permainan.js"></script>` diletakkan
  tepat sebelum `</body>` (tanpa `defer`).
- Struktur HTML sama dengan kasus yang ada: `.case-hero` (berisi `.back`, `.case-label`, `h1`, `.mystery`),
  `#solved`, `.lab`, dan `.clueboard` (berisi `#final`).
- Bagian simulasi yang harus selalu terlihat memakai `.canvas-box` / `.lockers`, atau diberi
  atribut `data-game="visual"`. Sisanya di dalam `.lab` otomatis masuk ke panel Kontrol.
- Simulasi canvas membaca ukuran dari `getBoundingClientRect()` dan mendengarkan event `resize`.
- Jangan beri menu atau tombol ke kasus/bidang lain di halaman kasus. Pemain fokus pada satu bidang;
  jalan keluar hanya "Kembali ke papan kasus" (otomatis ke dashboard untuk member).

## Menambah foto tim
Simpan foto di folder `img/` dengan nama `anggota-1.jpg`, `anggota-2.jpg`, dan `anggota-3.jpg`.
Foto akan muncul otomatis. Ganti nama dan peran di bagian `TIM` pada `index.html`.

## Publish
Upload seluruh folder ini ke Netlify, GitHub Pages, atau Vercel. Halaman pembukanya adalah `index.html`.
