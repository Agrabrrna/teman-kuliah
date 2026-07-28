# TemanKuliah - Aplikasi Manajemen Kuliah

Aplikasi TemanKuliah terdiri dari **Backend (Node.js/Express + Prisma)** dan **Frontend (React + Vite + TailwindCSS)**. 

## Persiapan Menjalankan Secara Lokal (Local Development)

### 1. Backend
Masuk ke dalam folder `backend`:
```bash
cd backend
```
- Salin file konfigurasi *environment*:
  ```bash
  cp .env.example .env
  ```
- Buka file `.env` dan isi kredensial *database* (Supabase PostgreSQL) dan Cloudinary Anda.
- Instal dependensi:
  ```bash
  npm install
  ```
- Sinkronisasi skema *database* dengan Prisma:
  ```bash
  npx prisma db push
  ```
- Jalankan *server* (akan berjalan di http://localhost:3000):
  ```bash
  npm run dev
  ```

### 2. Frontend
Buka terminal baru dan masuk ke dalam folder `frontend`:
```bash
cd frontend
```
- Salin file konfigurasi *environment*:
  ```bash
  cp .env.example .env
  ```
- Secara *default*, `VITE_API_URL` di dalam file `.env` sudah diatur ke `http://localhost:3000/api` (mengarah ke *backend* lokal Anda).
- Instal dependensi:
  ```bash
  npm install
  ```
- Jalankan *server frontend* (akan berjalan di http://localhost:5173):
  ```bash
  npm run dev
  ```

---

## Panduan Deployment (Produksi)

### 1. Deploy Backend ke Render
1. Hubungkan repositori GitHub Anda ke **Render**.
2. Buat **New Web Service**.
3. Atur **Root Directory** ke `backend`.
4. Atur **Build Command** ke `npm install && npm run build`
5. Atur **Start Command** ke `npm start`
6. Masukkan semua Environment Variables (dari file `.env` Anda).
7. Klik **Deploy**.

### 2. Deploy Frontend ke Vercel
1. Hubungkan repositori GitHub Anda ke **Vercel**.
2. Buat **New Project** dan pilih repositori Anda.
3. Atur **Root Directory** ke `frontend`.
4. Tambahkan *Environment Variable*: `VITE_API_URL` dengan nilai berisi tautan URL *backend* Anda di Render (misalnya: `https://temankuliah-backend.onrender.com/api`).
5. Klik **Deploy**.
