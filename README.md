# Smart Inventory System (Next.js, Go, PostgreSQL, Gemini AI)

Sistem Inventaris Pintar yang dibangun menggunakan **Next.js** di frontend, **Go (Gin)** di backend, **PostgreSQL** sebagai database, dan diintegrasikan dengan **Google Gemini AI** untuk memproses data inventaris pintar secara cerdas.

---

## Fitur Utama
* **Dashboard & KPI Analitik**: Ringkasan persediaan barang, total nilai aset (harga beli), total kategori, dan alert stok kritis.
* **Manajemen Barang (CRUD)**: Inventarisasi barang, harga, SKU, dan kategori dengan integrasi auto-seeding data awal.
* **Gemini AI Helper**: Melakukan pengisian Deskripsi Produk dan Kategori secara otomatis hanya berdasarkan input Nama Produk.
* **Asisten Chat AI Pintar**: Chatbot interaktif menggunakan *Gemini Function Calling* yang bisa mengambil data real-time dari database PostgreSQL (stok kritis, info barang, nilai aset).
* **Ledger Riwayat Transaksi**: Laporan audit stok masuk dan keluar secara rinci.

---

## Prasyarat (Prerequisites)
Sebelum menjalankan, pastikan Anda telah memasang:
* **Go (v1.22 atau lebih baru)**
* **Node.js (v18 atau lebih baru) & npm**
* **Docker & Docker Compose** (untuk database PostgreSQL)

---

## Langkah Cara Menjalankan

### 1. Jalankan Database PostgreSQL
Gunakan Docker Compose untuk menyalakan PostgreSQL:
```bash
docker compose up -d
```
*Port database Docker adalah `5433` (diarahkan ke port internal 5432 container). Password: `postgrespassword`, nama db: `inventory`.*

### 2. Konfigurasi Kunci API Gemini (Opsional, untuk fitur AI)
Ekspor kunci API Gemini Anda di terminal (ganti `YOUR_API_KEY` dengan kunci API Gemini asli Anda):
```bash
export GEMINI_API_KEY="YOUR_API_KEY"
```
*Catatan: Jika kunci API tidak diatur, backend akan tetap berjalan normal dengan fallback data tiruan (mocked data).*

### 3. Jalankan Aplikasi Secara Bersamaan (Frontend & Backend)
Dari root direktori (`/home/reyfuu/inventory`), jalankan perintah berikut untuk menjalankan backend dan frontend sekaligus:
```bash
npm run dev
```

Aplikasi Anda kini berjalan pada:
* **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
* **Backend API (Go)**: [http://localhost:8080](http://localhost:8080)
