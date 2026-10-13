# HireLoop — Expo UI

Implementasi frontend React Native + Expo + TypeScript untuk desain awal HireLoop.

## Menjalankan

Gunakan Node.js 22.13+ (Node 24 LTS disarankan).

```sh
npm ci
npm run web
```

Untuk perangkat: `npm start`, lalu buka dengan Expo Go yang mendukung SDK 57; atau jalankan `npm run android` dengan emulator Android. Simulator iOS memerlukan macOS. Jika versi Expo Go tidak sesuai, gunakan development build untuk SDK proyek ini.

```sh
npm run typecheck
npm run build:web
```

## Cakupan UI

- Splash otomatis menuju onboarding setelah 1,8 detik.
- Empat onboarding: lanjut, kembali, lewati, dan pemilih halaman.
- Login: email, password, toggle visibilitas, checkbox ingat saya, validasi wajib isi.
- Lupa password: validasi email dan halaman konfirmasi simulasi.
- Layar konfirmasi login simulasi; dashboard belum dibuat.
- Login Google dan daftar menampilkan informasi fitur yang belum diimplementasikan.
- Tombol kembali Android ditangani untuk onboarding, reset, dan konfirmasi.
- Layout mobile dengan batas lebar 440 px di browser desktop; form bisa digulir.

## Batasan yang disengaja

Belum ada request API, autentikasi, penyimpanan token, persistensi sesi, atau email yang dikirim. Login menerima email berformat valid dan password tidak kosong, khusus untuk demonstrasi UI. Ingat saya hanya state UI. Jangan gunakan versi ini untuk autentikasi produksi.

Ilustrasi menggunakan gambar referensi yang diberikan, ditampilkan melalui viewport terpotong di `src/components/Artwork.tsx`. Berkas gambar asli disertakan di `assets/design-reference.png`. Resolusi sumber 1040 × 355 px memuat tujuh layar, sehingga ilustrasi tampak buram saat diperbesar. Ganti dengan ekspor PNG/SVG tiap ilustrasi dari Figma untuk ketajaman penuh. Logo berupa teks pendekatan desain.

Onboarding ditampilkan ulang setelah reload. PWA install/offline (manifest dan service worker) belum termasuk tahap UI ini. Versi web dapat diekspor tetapi belum merupakan PWA offline siap produksi.

## Struktur

- `App.tsx`: komponen UI, state layar, form, dan gaya.
- `src/components/Artwork.tsx`: viewport ilustrasi referensi untuk onboarding dan reset.
- `app.json`: konfigurasi Expo.
- `package-lock.json`: versi dependensi terkunci.

## Integrasi API tahap berikutnya

Ganti handler `login` dan `reset` di App.tsx dengan pemanggilan service API, tambahkan status loading/error, lalu arahkan login sukses ke dashboard. Konfigurasikan base URL melalui variabel `EXPO_PUBLIC_API_URL` (nilai publik, bukan secret). Metode autentikasi serta penyimpanan sesi mengikuti kontrak backend. Jangan cache respons autentikasi di service worker.

Dokumentasi Expo: https://docs.expo.dev/workflow/web/

## Verifikasi versi ini

- TypeScript `tsc --noEmit`: berhasil.
- Ekspor web `expo export --platform web`: berhasil.
- Pengujian interaksi browser belum dilakukan karena unduhan browser pengujian gagal di lingkungan pembuatan.
- Android/iOS belum diuji pada emulator/perangkat; jalankan smoke test di perangkat sebelum integrasi API.
