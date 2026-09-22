# Portal Survei Komunitas GESSIT (Generasi Sulteng Sadar IT)

Portal survei web interaktif, responsif (*mobile-first*), dan terhubung langsung ke **Notifikasi Bot Telegram** untuk penjadwalan kegiatan perdana **Komunitas GESSIT (Generasi Sulteng Sadar IT)**.

Hosting dapat menggunakan **Vercel** gratis yang terhubung otomatis dengan repositori GitHub ini.

---

## 🎯 Pertanyaan Survei & Pilihan Jadwal

> **"Pilihlah Jawaban berikut ini, jika anda bersedia mengikuti kegiatan Perdana Komunitas GESSIT (Generasi Sulteng Sadar IT)"**

Pilihan jawaban disediakan dalam bentuk 3 tombol interaktif *touch-friendly*:
1. **`Sabtu 26/9/2026, Jam 12.30 - 14.30`**
2. **`Minggu 27/9/2026 Jam 12.30 - 14.30`**
3. **`Terserah, Sabtu atau Minggu saya bisa`**

---

## ✨ Fitur Utama

- **Tahap Identitas Responden**: Form input untuk **Nama Lengkap** dan **Kelas / Instansi** dengan validasi form sebelum masuk ke pertanyaan.
- **Desain Mobile-First & Responsif**: Tampilan modern (*glassmorphism*, dark mode bernuansa IT, font Plus Jakarta Sans) yang nyaman dan ringan dibuka di smartphone/browser apa pun.
- **Serverless API Vercel (`api/submit.js`)**: Menerima data submit dan mengirimkannya ke Bot Telegram secara aman tanpa mengekspos token bot ke publik.
- **Notifikasi Bot Telegram Otomatis**: Setiap ada responden yang mengisi survei, notifikasi berformat rapi langsung masuk ke akun atau grup Telegram panitia.
- **Kartu Bukti Partisipasi**: Layar ucapan terima kasih lengkap dengan ringkasan nama, kelas, opsi yang dipilih, waktu submit, dan status pengiriman Telegram.
- **Integrasi WhatsApp**: Tombol instan untuk mengirimkan bukti pilihan via WhatsApp.
- **Penyimpanan Lokal (Offline Backup)**: Tersimpan di `localStorage` browser sehingga rekap data tetap bisa dilihat dan diekspor ke `.csv` (Excel).

---

## 🤖 Panduan Menghubungkan Bot Telegram di Vercel

### Langkah 1: Buat Bot Telegram & Dapatkan Token
1. Buka aplikasi Telegram, cari bot bernama **[@BotFather](https://t.me/Botfather)**.
2. Kirim perintah `/newbot`.
3. Masukkan nama bot (misal: `GESSIT Survey Bot`) dan username bot (misal: `gessit_survey_bot`).
4. BotFather akan memberikan **HTTP API Token**, contohnya:
   ```text
   7123456789:AAHk1234567890abcdefghijklmnopqrstuv
   ```

### Langkah 2: Dapatkan Chat ID (Tujuan Notifikasi)
Notifikasi bisa dikirim ke **chat pribadi Anda** atau ke **grup panitia GESSIT**:
- **Jika ke Chat Pribadi**:
  1. Buka bot yang baru Anda buat, lalu tekan **Start** (`/start`).
  2. Buka bot **[@userinfobot](https://t.me/userinfobot)** lalu tekan Start. Bot tersebut akan memberikan `Id` Anda (contoh: `123456789`).
- **Jika ke Grup Telegram**:
  1. Buat grup di Telegram atau buka grup panitia yang sudah ada.
  2. Masukkan bot Anda ke dalam grup tersebut.
  3. Masukkan juga bot **[@RawDataBot](https://t.me/RawDataBot)** ke grup untuk melihat ID grup (biasanya diawali tanda minus, contoh: `-1001987654321`), lalu keluarkan kembali `@RawDataBot`.

### Langkah 3: Pasang di Vercel
1. Buka dashboard proyek Anda di **[vercel.com](https://vercel.com)**.
2. Masuk ke tab **Settings** ➡️ **Environment Variables**.
3. Tambahkan 2 variabel berikut:
   - **Nama:** `TELEGRAM_BOT_TOKEN`  
     **Nilai:** `(Token bot dari BotFather)`
   - **Nama:** `TELEGRAM_CHAT_ID`  
     **Nilai:** `(Chat ID pribadi atau ID grup)`
4. Klik **Save**.
5. Jika proyek sudah terdeploy, lakukan **Redeploy** di menu *Deployments* (atau cukup lakukan push git baru) agar variabel lingkungan aktif.

---

## 🚀 Struktur Proyek

```text
├── .env.example       # Contoh referensi variabel lingkungan Vercel
├── .gitignore         # Mencegah file rahasia lokal ter-commit
├── README.md          # Dokumentasi proyek & panduan setup
├── index.html         # Frontend portal survei interaktif & responsif
└── api/
    └── submit.js      # Vercel Serverless Function pengirim notifikasi Telegram
```
