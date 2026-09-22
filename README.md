# SMK N 3 Balige — Monorepo

Satu repositori berisi frontend (React + Vite) dan backend (NestJS microservices),
dijalankan penuh dengan Docker Compose dan **hanya membuka satu port**.

```
frontend/          SPA React (Vite)
backend/           NestJS monorepo: api-gateway + 5 service
docker/gateway/    Nginx edge gateway (Dockerfile + konfigurasi)
docker-compose.yml Seluruh stack
```

## Kenapa satu port

Service `gateway` (Nginx) adalah satu-satunya container yang mem-publish port ke host.
Semua yang lain hanya bisa diakses dari jaringan internal Docker.

| Path        | Diteruskan ke          |
| ----------- | ---------------------- |
| `/`         | file statis SPA React  |
| `/api/`     | `api-gateway` (NestJS) |
| `/uploads/` | `service-berita`       |
| `/health`   | health check gateway   |

Karena frontend dan API berbagi origin yang sama, tidak ada masalah
CORS maupun cookie lintas domain.

## Menjalankan

```bash
cp .env.example .env      # lalu isi semua nilai "ganti-..."
docker compose up -d --build
```

Aplikasi terbuka di `http://localhost:8080` (ubah lewat `APP_PORT`).

### Variabel yang wajib benar

- `APP_PORT` — port di host.
- `PUBLIC_ORIGIN` — alamat yang dipakai pengguna di browser, **persis** termasuk
  skema dan port. Nilai ini dipakai untuk `CORS_ORIGIN`.
- `JWT_SECRET` — kunci penandatangan token login, minimal 32 karakter acak.
  Api-gateway menolak start bila kosong atau terlalu pendek.

Contoh di belakang reverse proxy/HTTPS:

```
APP_PORT=8080
PUBLIC_ORIGIN=https://smkn3balige.sch.id
```

## Akun master admin

Akun master admin dibuat otomatis saat api-gateway pertama kali jalan, memakai
`MASTER_ADMIN_USERNAME`, `MASTER_ADMIN_PASSWORD`, dan `MASTER_ADMIN_NAMA` di `.env`.
Bila akun dengan username itu sudah ada, tidak ada yang diubah.

Login lewat tombol **Masuk** di navbar situs (`/masuk`). Akun guru dan siswa
dibuat dari menu **Kelola Akun** di panel admin.

## Perintah harian

```bash
docker compose ps                 # status
docker compose logs -f gateway    # log edge gateway
docker compose logs -f api-gateway
docker compose down               # stop (data tetap di volume)
docker compose down -v            # stop + hapus semua data
```

## Pengembangan tanpa Docker

```bash
cd frontend && npm install && npm run dev     # http://localhost:5173
cd backend  && npm install && npm run start:dev api-gateway
```

Dev server Vite otomatis menunjuk ke gateway; set `VITE_GATEWAY_URL` bila
gateway berjalan di alamat lain.

## Catatan keamanan

- `.env` tidak ikut ter-commit. Semua nilai `ganti-...` wajib diganti sebelum deploy.
- `JWT_SECRET` dan `MASTER_ADMIN_PASSWORD` adalah rahasia utama sistem. Ganti
  `JWT_SECRET` akan membuat semua sesi login yang aktif langsung berakhir.
- Folder `backend/uploads` berisi data runtime pengguna dan tidak ikut ter-commit.
