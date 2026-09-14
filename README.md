# Simulasi Diagnostik Browser (Prank Edukatif & Uji Akademik)

Proyek simulasi antarmuka berbasis web untuk menguji reaksi psikologis pengguna terhadap antarmuka peringatan sistem (*scareware interface*), sekaligus mendemonstrasikan batasan keamanan **Browser Sandbox**.

## 📌 Fitur
- **Bait Screen:** Layar pemicu interaksi awal berkedok pengujian diagnostik browser untuk memenuhi syarat *User Activation Policy* browser modern.
- **Prank Lock Screen:** Simulasi penguncian visual sementara dengan hitung mundur 15 detik, animasi peringatan, dan efek audio sirene/bip menggunakan Web Audio API murni (tanpa file eksternal).
- **Reveal Screen:** Pengungkapan lelucon ramah di detik ke-0 yang melepaskan mode layar penuh (*Fullscreen*) dan menampilkan edukasi teknis mengenai model keamanan browser.
- **Tanpa Malware / Aman:** Tidak ada data yang diambil, tidak merusak perangkat, dan tidak ada loop tanpa akhir (*infinite loop*).

## 🚀 Cara Menjalankan
Cukup buka file `index.html` di browser web modern (Google Chrome, Mozilla Firefox, Microsoft Edge, dll.).
