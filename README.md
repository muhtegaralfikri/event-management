<p align="center">
  <img src="./public/eventtix-logo.png" alt="EventTix" width="240" />
</p>

# EventTix

EventTix adalah proyek portfolio full-stack untuk platform manajemen event dan tiket digital. Aplikasi ini menampilkan alur publik untuk mencari event, mendaftar tanpa akun, mendapatkan tiket QR, serta alur organizer untuk membuat event, check-in peserta, dan export data peserta.

> Status: MVP portfolio dan demo teknis. Belum diposisikan sebagai SaaS production penuh karena payment gateway asli, email production, monitoring, backup, dan legal final belum diintegrasikan.

## Preview

### Homepage

![Homepage EventTix](./public/screenshots/home.png)

### Detail Event

![Detail Event EventTix](./public/screenshots/event-detail.png)

### Dashboard Organizer

![Dashboard Organizer EventTix](./public/screenshots/dashboard.png)

### Check-in Scanner

![Check-in Scanner EventTix](./public/screenshots/check-in.png)

## Fitur Utama

- Landing page event publik dengan pencarian dan filter kategori.
- Detail event dengan harga, kapasitas, kategori, dan form pendaftaran.
- Registrasi peserta tanpa login.
- Tiket digital dengan kode unik dan QR code.
- Pencarian tiket berdasarkan kode tiket atau email registrasi.
- Login organizer dengan email/password.
- Login organizer dengan Google OAuth yang dibatasi melalui whitelist env.
- Dashboard organizer dengan ringkasan event, peserta, check-in, dan pendapatan estimasi.
- Create/edit event, termasuk kategori event.
- Check-in tiket menggunakan scanner QR, feedback beep, dan vibrate mobile.
- Export data peserta ke Excel `.xlsx`.
- Halaman privacy dan terms sederhana untuk konteks portfolio.
- Responsive layout untuk desktop dan mobile.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4
- Prisma 7
- PostgreSQL
- Auth.js / NextAuth
- html5-qrcode
- xlsx
- pnpm

## Local Development

Install dependencies:

```bash
pnpm install
```

Create `.env` from `.env.example`, then point `DATABASE_URL` to your PostgreSQL database.

For FlyEnv PostgreSQL on this machine:

```env
DATABASE_URL="postgresql://root:root@localhost:5432/eventtix?schema=public"
DIRECT_URL="postgresql://root:root@localhost:5432/eventtix?schema=public"
AUTH_SECRET="generate-random-secret-here"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_ORGANIZER_GOOGLE_EMAILS="organizer@example.com"
```

Run migrations and start the app:

```bash
pnpm db:migrate
pnpm db:seed-events
pnpm dev
```

`pnpm dev` uses webpack for a lighter and more stable local dev server on Windows. To test Turbopack explicitly, use:

```bash
pnpm dev:turbo
```

## Database Commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
pnpm db:studio
pnpm db:seed-events
pnpm clean
```

Use `pnpm db:migrate` for local development and `pnpm db:deploy` for production databases.

## Google Organizer Login

Google login is intentionally restricted. Only emails listed in this env can sign in as organizer:

```env
AUTH_ORGANIZER_GOOGLE_EMAILS="organizer@example.com,another-organizer@example.com"
```

If this env is empty, Google sign-in is rejected even when Google OAuth credentials are configured.

Required Google OAuth redirect URI:

```text
http://localhost:3000/api/auth/callback/google
https://your-domain.com/api/auth/callback/google
```

## Vercel Deployment

Vercel cannot connect to a local FlyEnv database. Use a hosted PostgreSQL database first, for example Neon, Supabase, or Vercel Postgres.

Set these environment variables in Vercel for Production and Preview:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
AUTH_SECRET="generate-random-secret-here"
AUTH_GOOGLE_ID="google-client-id"
AUTH_GOOGLE_SECRET="google-client-secret"
AUTH_ORGANIZER_GOOGLE_EMAILS="organizer@example.com"
```

For Neon, use the pooled URL for `DATABASE_URL` in Vercel runtime. Use the direct non-pooled URL for `DIRECT_URL` when running Prisma migrations.

Recommended Vercel settings:

- Framework Preset: Next.js
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: default

Before the first production deploy, apply migrations to the hosted database:

```bash
pnpm db:deploy
```

## Portfolio Scope

Included in this repository:

- Working event/ticketing workflow.
- Demo payment confirmation flow.
- Organizer workflow with QR check-in.
- Excel export.
- Basic privacy and terms pages.

Not included as production-ready features:

- Real payment gateway integration.
- Production transactional email provider setup.
- Legal documents reviewed by a professional.
- Admin approval workflow for organizers.
- Production-grade external rate limiting.
- Monitoring/error tracking service.
- Automated test suite.
- Backup and restore workflow.

## GitHub Push

From the project root:

```bash
git add .
git commit -m "Describe your change"
git push origin main
```
