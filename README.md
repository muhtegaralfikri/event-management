# EventTix

Event management system built with Next.js App Router, Tailwind CSS v4, PostgreSQL, and Prisma.

Current MVP slice:

- Event discovery landing page
- Event detail page with dynamic metadata
- Temporary organizer form to create events
- Server-side attendee registration
- Free event flow: registration directly issues a paid/active ticket
- Paid event flow: registration creates a pending ticket and redirects to simulated payment
- Digital ticket page with unique ticket code and QR code
- Ticket lookup page by ticket code or attendee email
- Organizer check-in page for QR scanning and manual ticket validation
- Organizer routes protected by `ORGANIZER_CHECKIN_PIN`

## Local Development

Install dependencies:

```bash
pnpm install
```

Create `.env` from `.env.example`, then point `DATABASE_URL` to your PostgreSQL database.

For FlyEnv PostgreSQL on this machine:

```env
DATABASE_URL="postgresql://root:root@localhost:5432/eventtix?schema=public"
ORGANIZER_CHECKIN_PIN="123456"
```

Run migrations and start the app:

```bash
pnpm db:migrate
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
pnpm clean
```

Use `pnpm db:migrate` for local development and `pnpm db:deploy` for production databases.

## Vercel Deployment

Vercel cannot connect to a local FlyEnv database. Create a hosted PostgreSQL database first, for example Neon, Supabase, or Vercel Postgres.

Set this environment variable in Vercel for Production and Preview:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
ORGANIZER_CHECKIN_PIN="strong-secret-pin"
```

Recommended Vercel settings:

- Framework Preset: Next.js
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: default

Prisma Client is generated automatically through `postinstall` and before `next build`.

Before the first production deploy, apply migrations to the hosted database:

```bash
pnpm db:deploy
```

## GitHub Push

From the project root:

```bash
git init
git add .
git commit -m "Initial EventTix setup"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```
