# HireLoop Mobile

Aplikasi kandidat HireLoop berbasis Expo, React Native, TypeScript, Expo Router, Axios, dan TanStack Query.

## Persyaratan

- Node.js 22.13 atau lebih baru
- Expo Go yang kompatibel dengan SDK 57 untuk fitur biasa
- Development build atau APK untuk menguji Google Login
- Backend Laravel HireLoop
- MySQL untuk backend local

## Menjalankan dengan backend local

Gunakan alamat IPv4 komputer, bukan `127.0.0.1`, saat aplikasi dibuka dari ponsel.

```env
# .env.local
EXPO_PUBLIC_API_URL=http://192.168.0.109:8000/api
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.109
```

Laravel development server menggunakan HTTP. Jalankan backend agar dapat dijangkau melalui jaringan lokal:

```powershell
cd D:\Hireloop\hireloop-talentpool-BackEnd
php artisan serve --host=0.0.0.0 --port=8000
```

Pastikan MySQL aktif, kemudian jalankan aplikasi:

```powershell
cd D:\Hireloop\hireloop-expo\hireloop-expo
npm ci
npx expo start --clear
```

Perangkat dan komputer harus berada pada jaringan yang sama. Firewall Windows perlu mengizinkan port `8000` dan port Metro.

## Production

Build production memperoleh URL API dari profil `production` atau `production-apk` di `eas.json`:

```text
https://hireloop.superapp-provenforceindonesia.com/api
```

`.env.local` tidak dikirim ke EAS dan tidak boleh menjadi sumber konfigurasi build production.

## Alur autentikasi kandidat

1. `POST /login`
2. Validasi token pada respons
3. Simpan token melalui Expo SecureStore
4. `GET /auth/me` dengan header Bearer
5. Pastikan akun memiliki role `user`
6. Arahkan kandidat ke onboarding atau dashboard

Error setiap tahap dibedakan agar kegagalan kredensial tidak tertukar dengan token yang ditolak oleh `/auth/me`.

### Google Login

Google Login menggunakan alur OAuth berikut:

1. `GET /google/mobile/redirect?return_url=hireloop://auth/google/callback`
2. Browser membuka halaman persetujuan Google.
3. Backend memvalidasi `state`, lalu mengarahkan aplikasi dengan kode sekali pakai.
4. Aplikasi menukar kode melalui `POST /google/mobile/exchange`.
5. Token Sanctum disimpan, lalu diverifikasi melalui `GET /auth/me` dan role `user`.

Token Sanctum tidak dikirim melalui URL. Kode callback berlaku dua menit dan hanya dapat dipakai sekali.

Backend harus mengatur konfigurasi berikut dan callback Google Console tetap menunjuk ke endpoint Laravel:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://domain-backend/api/google/callback
GOOGLE_MOBILE_CALLBACK=hireloop://auth/google/callback
GOOGLE_ALLOWED_RETURN_URLS=hireloop://auth/google/callback,http://localhost:8081/auth/google/callback
```

Untuk pengujian dari ponsel dengan backend local, jangan memakai `127.0.0.1` sebagai `GOOGLE_REDIRECT_URI` karena alamat itu menunjuk ke ponsel. Publikasikan callback Laravel melalui HTTPS tunnel, daftarkan URL persisnya di Google Cloud Console, lalu gunakan URL tunnel tersebut sebagai `GOOGLE_REDIRECT_URI`. API aplikasi masih dapat memakai IPv4 LAN komputer.

Google Login tidak dijalankan di Expo Go karena callback OAuth dengan custom scheme tidak stabil di sana. Gunakan development build atau APK baru. Karena `expo-web-browser` adalah modul native, APK lama perlu dibangun ulang.

## Validasi

```powershell
npm run validate
npx expo-doctor
```

`npm run validate` menjalankan lint, pemeriksaan TypeScript, dan test Jest.

## Build APK

```powershell
npx eas-cli@latest build --platform android --profile production-apk --non-interactive
```

Sebelum mendistribusikan APK, lakukan smoke test login, pemulihan session, onboarding, dan pemuatan dashboard pada perangkat Android fisik.
