# Laporan Pengujian Cluegg

Dokumen ini mencatat pengujian yang **benar-benar dilakukan** selama pengembangan (27–28 November 2026),
termasuk bug yang ditemukan dan perbaikannya. Bagian terakhir mencatat apa yang **belum** diuji.

## Lingkungan pengujian

| Hal | Keterangan |
|---|---|
| Browser | Browser berbasis Chromium, dengan emulasi ukuran layar (viewport) |
| Server | Server statis lokal (`http://localhost:5173`) |
| Database | Project Supabase milik tim (tabel `profiles`, `progress`, RLS aktif) |
| Cara | Interaksi otomatis (skrip yang mengklik, menggeser slider, dan mengukur posisi elemen), tombol keyboard sungguhan, dan pengecekan visual lewat tangkapan layar. Pengujian dibantu AI (Claude) dan diperiksa oleh tim. |
| Login asli | Daftar, masuk, sinkronisasi, keluar–masuk lagi dicoba langsung oleh anggota tim dengan akunnya sendiri |

## 1. Tampilan responsif

| Ukuran layar | Halaman yang dicek | Hasil |
|---|---|---|
| 320 × 568 (HP kecil) | Beranda, masuk, privasi, dashboard, 3 kasus | ✅ Tidak ada elemen keluar layar; halaman kasus pas satu layar |
| 375 × 667 (HP) | Semua halaman | ✅ |
| 667 × 375 (HP miring) | Halaman kasus | ✅ Simulasi di kiri, panel di kanan |
| 1280 × 720 | Semua halaman | ✅ |
| 1440 × 900 | Halaman kasus, masuk | ✅ |
| 1912 × 945 dan 1920 × 1080 | Halaman kasus, masuk | ✅ |

Halaman kasus (layar permainan) diukur: tinggi dokumen = tinggi layar di semua ukuran di atas, artinya tidak ada scroll halaman.

## 2. Stabilitas simulasi (anti-getar)

Masalah awal: saat slider kasus gelombang digeser, layar "bergetar". Pengukuran menemukan slider C
berubah posisi/lebar **27 kali** (lebar 176–264 px) karena lebar kolom mengikuti panjang teks status.

| Uji | Cara | Hasil setelah perbaikan |
|---|---|---|
| Kasus gelombang | Semua **288 kombinasi** slider A × B × C, diukur di 1280×720, 1440×900, 1912×945, 375×667, 320×568 | ✅ Posisi & lebar ketiga slider tetap, ukuran grafik tetap, **0** event resize, tidak ada teks status terpotong |
| Kasus parabola | Sudut 5°–85°, kecepatan 10–30 m/s, 3 gravitasi, 3 tembakan | ✅ Tidak ada elemen yang bergeser; grafik tetap 856 × 283 px (1280×720) |
| Kasus arsip | 8 tebakan laci, tombol "tandai tengah", acak ulang | ✅ Papan laci tetap berukuran sama |

## 3. Kebenaran logika permainan

| Uji | Hasil |
|---|---|
| Skor kecocokan gelombang: setiap langkah slider ke arah jawaban | ✅ 732 dari 732 langkah menaikkan skor; 100% hanya pada jawaban yang benar |
| Indikator A, B, C | ✅ Menampilkan Pas / terlalu besar / terlalu kecil tanpa angka jawaban |
| Kasus arsip dengan strategi tengah | ✅ Berkas ditemukan ≤ 7 langkah; petunjuk "Detektif Kilat" terbuka |
| Pop-up "Rahasia di dalam cangkang" | ✅ Muncul saat kasus terpecahkan, bisa ditutup (tombol "Keliling TKP lagi", Esc) dan dibuka lagi lewat tombol 🥚 |

## 4. Ruang Briefing (materi sebelum TKP)

Ketiga kasus dimainkan dari laporan misteri sampai masuk TKP, termasuk mencoba jawaban salah.

| Kasus | Yang diperiksa | Hasil |
|---|---|---|
| Fisika | Sudut 70°, v = 20 m/s → mendatar 6,8 m/s, naik 18,8 m/s | ✅ Sesuai 20·cos 70° dan 20·sin 70° |
| Fisika | Lemparan 10 m/s: Bumi 2,0 s, Bulan 12,3 s | ✅ Sesuai rumus t = 2v/g |
| Fisika | Kalkulator jarak 15 m/s × 3 s | ✅ 45 m |
| Matematika | sin 0°, 90°, 180°, 270° | ✅ 0; 1; 0; −1 |
| Matematika | Penanda satu gelombang, grafik contoh | ✅ Tepat satu pola 2π; puncak contoh 1,50 |
| Informatika | Coret berkas ≤ 19 di rak urut vs acak | ✅ Rak urut tercoret rapi di satu sisi, rak acak tersebar |
| Informatika | 16 laci dibagi dua | ✅ Tepat 4 langkah |
| Semua | Jawaban salah → penjelasan; jawaban benar → bukti berikutnya terbuka | ✅ |
| Semua | Masuk TKP → ukuran canvas | ✅ Ukuran tampilan = ukuran gambar canvas (mis. 982 × 463) |
| Semua | Buka ulang halaman → langsung TKP; tombol Briefing & "Lewati ke TKP" | ✅ |
| Semua | Kartu bukti mengisi layar tanpa isi meluber: 3 kasus × 3 bukti × 7 ukuran layar (1280×720, 1366×768, 1440×900, 1536×864, 1600×850, 1686×927, 1920×1080) | ✅ 63 dari 63 tanpa luber; panel percobaan mengisi tinggi kartu (sisa bawah 8–16 px) |

## 5. Akun, keamanan data, dan mode tamu

| Uji | Hasil |
|---|---|
| Menambah data progres **tanpa login** ke database | ✅ Ditolak (`new row violates row-level security policy`) |
| Memanggil fungsi hapus akun **tanpa login** | ✅ Ditolak (`permission denied`) |
| Publishable key dari website | ✅ Diterima, hanya bisa mengakses sesuai RLS |
| Verifikasi email dimatikan | ✅ `mailer_autoconfirm = true` |
| Daftar, masuk, progres tersinkron, keluar lalu masuk lagi | ✅ Dicoba langsung oleh anggota tim |
| Tamu memecahkan 1 kasus → buka kasus lain | ✅ Layar "Berkas ini masih tersegel"; kartu di beranda terkunci |
| Tamu menyelesaikan demo | ✅ Ajakan "Daftar & simpan hasil" muncul di pop-up rahasia |
| Halaman kasus tidak punya jalan pintas ke kasus lain | ✅ Tidak ada link ke halaman kasus lain (dicek di desktop & HP) |

## 6. Aksesibilitas

Kontras warna diukur dengan rumus WCAG 2.1 (minimal 4,5 : 1 untuk teks biasa).

| Pasangan warna | Kontras | Status |
|---|---|---|
| Teks utama di latar gelap | 16,31 : 1 | ✅ |
| Teks redup di latar gelap / panel / kotak | 8,06 / 7,45 / 6,69 : 1 | ✅ |
| Teks tinta / tinta lembut di kertas | 12,84 / 5,22 : 1 | ✅ |
| Oranye di kertas | 2,08 → **5,08** : 1 | ❌ → ✅ diperbaiki |
| Hijau di kertas | 2,86 → **5,52** : 1 | ❌ → ✅ diperbaiki |
| Merah di kertas | 3,54 → **5,47** : 1 | ⚠️ → ✅ diperbaiki |

| Uji keyboard (tombol sungguhan) | Hasil |
|---|---|
| Tab pertama | ✅ Muncul tautan "Lewati ke konten utama" |
| Urutan fokus di halaman kasus | ✅ Logis: logo → masuk → daftar → kembali → misteri → langkah briefing → tombol mulai |
| Cincin fokus | ✅ Terlihat di semua elemen yang dilewati |
| Menyelesaikan 1 barang bukti hanya dengan keyboard | ✅ Enter, Tab, panah untuk slider, Enter untuk menjawab |
| Tab Masuk/Daftar (diuji lewat skrip) | ✅ Panah kiri/kanan berpindah tab; form tersembunyi ditandai `inert` sehingga tidak bisa di-Tab |

## 7. Bug yang ditemukan & diperbaiki

| Bug | Penyebab | Perbaikan |
|---|---|---|
| Skor kecocokan turun walau slider mendekati jawaban | Skor dihitung dari selisih seluruh gelombang | Skor = rata-rata kedekatan tiap slider |
| Layar bergetar saat slider melewati nilai benar | Label status beda tinggi 2 px | Tinggi tetap untuk teks yang berubah |
| Slider bergeser/memanjang saat di-drag | Lebar kolom mengikuti panjang teks | Kolom dikunci sama lebar |
| Panel menumpuk dan papan laci meluber di HP | Aturan CSS desktop mengalahkan aturan HP | Selector diperbaiki, panel bisa dilipat |
| Pop-up rahasia langsung tergulir ke bawah di HP | Fokus otomatis menggulir isi | Fokus tanpa menggulir, mulai dari atas |
| Sisa notifikasi terlihat di tepi atas | Hanya digeser sejauh tinggi dirinya | Digeser penuh + transparan |
| Kartu masuk/daftar melompat, teks kiri ikut turun | Tinggi berubah seketika, rata tengah | Animasi tinggi, rata atas |
| Footer naik-turun saat ganti tab masuk/daftar | Tinggi halaman berbeda | Area form minimal setinggi layar |
| Telur menampilkan garis retak sebelum retak | Sambungan dua potongan gambar | Potongan atas sedikit tumpang-tindih |
| Membuka kasus terkunci tercatat sebagai "dibuka" | Waktu dicatat sebelum cek kunci | Dicatat hanya jika tidak terkunci |
| Laci tetap menyala setelah berkas ditemukan | Rentang tidak diperbarui | Semua laci selain jawaban diredupkan |
| Kartu briefing menyisakan banyak ruang kosong | Isi menempel di atas kartu | Panel percobaan mengisi tinggi kartu, teks di tengah, ukuran menyesuaikan tinggi layar |
| Baris "Memecahkan…" di Aktivitas terakhir tidak terbaca | Nama class `solved` bentrok dengan gaya pop-up rahasia | Class diganti `ev-solved` / `ev-opened` |
| Tombol "Kembali ke lab" ambigu | Kata "lab" tidak sesuai alur | Diganti "Keliling TKP lagi" |

## 8. Console

Tidak ada error JavaScript di semua halaman. Satu-satunya error yang tersisa adalah 404 untuk foto tim
(`img/anggota-1.jpg` dst.) yang memang belum diunggah.

## Belum diuji

Dicatat jujur agar tim tahu apa yang masih perlu dicek:

- **HP asli** (Android/iOS): baru diuji lewat emulasi ukuran layar.
- **Browser lain**: Firefox dan Safari belum dicoba.
- **Pembaca layar** (NVDA/VoiceOver): belum dicoba langsung.
- **Uji coba ke siswa** (dampak belajar): belum dilakukan.
- **Website setelah di-hosting**: belum ada link hosting saat dokumen ini ditulis.
