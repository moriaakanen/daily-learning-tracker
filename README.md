# 📘 Daily LearnLog — Today I Learned (TIL) & Learning Tracker

Aplikasi web modern dan minimalis untuk mencatat, mengorganisir, dan memantau materi serta wawasan baru yang Anda pelajari setiap hari (*Today I Learned*), terintegrasi dengan **Supabase (PostgreSQL)** dan dibangun menggunakan **Next.js (App Router)** & **Tailwind CSS**.

---

## ✨ Fitur Utama

- 📝 **Pencatatan Harian Cepat**: Input judul, kategori, poin inti (*Key Takeaways*), durasi belajar, deskripsi lengkap, code snippet, dan multi-tags.
- 🔍 **Filter & Pencarian Instan**: Cari berdasarkan kata kunci judul/isi, filter kategori, multi-tag filter, rentang tanggal, atau catatan favorit.
- ⚡ **Markdown & Code Snippets**: Dukungan penulisan format Markdown dengan Live Preview dan box kode dengan tombol copy instan.
- 🔥 **Streak & Visualizer Aktivitas**: Hitungan streak hari beruntun dan visualisasi heatmap aktivitas 7 hari terakhir.
- 🗄️ **Supabase (PostgreSQL) Cloud Sync**: Sinkronisasi database cloud realtime dengan keamanan Row Level Security (RLS).
- 💾 **Offline-First & Local Storage Fallback**: Langsung bisa digunakan tanpa database eksternal (data disimpan di browser), dan otomatis tersinkronisasi ketika kredensial Supabase diisi.
- 🔄 **Backup & Restore**: Fitur Export & Import data backup berformat JSON.

---

## 🚀 Cara Menjalankan Project Secara Lokal

### 1. Masuk ke Folder Project
```bash
cd daily-learning-tracker
```

### 2. Install Dependencies (Jika belum)
```bash
npm install
```

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser dan akses **[http://localhost:3000](http://localhost:3000)**.

---

## 🗄️ Panduan Setup Supabase Database (3 Menit)

1. Buat akun gratis di **[supabase.com](https://supabase.com)**.
2. Buat project baru (misal: `daily-learning-tracker`).
3. Masuk ke menu **SQL Editor** di dashboard Supabase.
4. Salin isi file `supabase-schema.sql` (atau klik tombol **Salin SQL Schema** di menu Pengaturan aplikasi), tempel ke SQL Editor, lalu klik **Run**.
5. Masuk ke **Project Settings** &rarr; **API**:
   - Salin **Project URL**
   - Salin **Project API Anon Key**
6. Buat file `.env.local` di folder `daily-learning-tracker/` (atau masukkan lewat menu Pengaturan di UI web):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

---

## 🐙 Cara Upload Project ke GitHub

Untuk mengunggah project ini sebagai repository baru di GitHub:

```bash
# 1. Masuk ke folder project
cd daily-learning-tracker

# 2. Inisialisasi Git (jika ingin repository terpisah)
git init
git add .
git commit -m "feat: initial release Daily LearnLog with Supabase & Next.js"

# 3. Buat repository baru di github.com/new
# 4. Hubungkan remote dan push ke GitHub
git remote add origin https://github.com/USERNAME/daily-learning-tracker.git
git branch -M main
git push -u origin main
```

> **Catatan Keamanan**: File `.env.local` sudah otomatis masuk ke dalam `.gitignore` sehingga kunci rahasia Anda aman dan tidak akan ter-upload ke publik.

---

## ☁️ Deployment Gratis ke Vercel

1. Buka **[vercel.com](https://vercel.com)** dan login dengan akun GitHub Anda.
2. Klik **Add New** &rarr; **Project** lalu pilih repository `daily-learning-tracker`.
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**! Web Anda akan aktif dan dapat diakses dari mana saja.
