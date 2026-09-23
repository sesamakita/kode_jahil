# Portal Survei Komunitas GESSIT (Generasi Sulteng Sadar IT)

Portal survei web interaktif, responsif (*mobile-first*), dan terhubung langsung ke **Notifikasi Bot Telegram** untuk penjadwalan kegiatan perdana **Komunitas GESSIT (Generasi Sulteng Sadar IT)**.

Hosting menggunakan **Vercel** gratis yang terhubung otomatis dengan repositori GitHub ini.

---

## 🎯 Pertanyaan Survei & Pilihan Jadwal

> **"Pilihlah Jawaban berikut ini, jika anda bersedia mengikuti kegiatan Perdana Komunitas GESSIT (Generasi Sulteng Sadar IT)"**

Pilihan jawaban disediakan dalam bentuk 3 tombol interaktif *touch-friendly*:
1. **`Sabtu 26/9/2026, Jam 12.30 - 14.30, Smansa Balut`**
2. **`Minggu 27/9/2026 Jam 12.30 - 14.30, Smansa Balut`**
3. **`Terserah, Sabtu atau Minggu saya bisa, Smansa Balut`**

---

## ✨ Fitur Utama

- **Tahap Identitas Responden**: Form input untuk **Nama Lengkap** dan **Kelas / Instansi** dengan validasi agar tidak ada data yang kosong.
- **Desain Mobile-First & Responsif**: Tampilan modern (*glassmorphism*, tema gelap bernuansa IT, font Plus Jakarta Sans) yang nyaman dibuka di smartphone siswa/anggota.
- **Serverless API Vercel (`api/submit.js` & `api/stats.js`)**: 
  - Menerima suara responden dan mengirimkan notifikasi ke Telegram secara aman tanpa mengekspos token bot.
  - Menyediakan endpoint agregasi data statistik perolehan suara.
- **Grafik Rekapitulasi Suara (Live)**: 
  - Ditampilkan langsung setelah responden menyelesaikan survei.
  - **Hanya menampilkan grafik dan persentase suara** demi menjaga privasi nama/kelas peserta.
- **Aman dari Reset Pengguna**:
  - Tombol reset publik dan daftar nama responden telah dihapus agar survei yang dibagikan secara luas ke seluruh anggota tidak bisa dimanipulasi/dihapus oleh peserta.
  - Responden yang sudah memilih akan tersimpan statusnya sehingga tidak dapat mengisi berulang kali di browser yang sama.
- **Notifikasi Bot Telegram Otomatis**: Setiap suara yang masuk langsung dikirim ke chat Telegram panitia secara *real-time*.

---

## 💾 Penyimpanan Data Global di Vercel (Vercel KV)

Agar perolehan suara dari **seluruh anggota di berbagai perangkat** terkumpul dan terakumulasi secara terpusat pada grafik live:
1. Buka dashboard proyek Anda di **[vercel.com](https://vercel.com)**.
2. Klik tab **Storage** di menu navigasi atas.
3. Klik tombol **Create Database** ➡️ pilih **KV** (Redis).
4. Klik **Continue** ➡️ pilih **Connect to Project** (pilih repositori ini).
5. Vercel akan otomatis menyambungkan database KV ke proyek Anda tanpa perlu copy-paste token manual!

---

## 🤖 Konfigurasi Bot Telegram

Variabel lingkungan yang wajib ada di **Vercel Settings ➡️ Environment Variables**:
- `TELEGRAM_BOT_TOKEN`: Token bot dari `@BotFather`
- `TELEGRAM_CHAT_ID`: Chat ID Telegram panitia
