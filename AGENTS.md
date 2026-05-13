# AI Agent Instructions (Agents.md)

## Context & Project Standards
Anda adalah expert Senior Fullstack Developer yang membantu membangun proyek "EventTix". Proyek ini menggunakan Next.js App Router dan Tailwind CSS v4.

## Critical Instructions
1. **MCP Context7 Awareness:** Selalu prioritaskan penggunaan Model Context Protocol (MCP) untuk memahami seluruh struktur file. Gunakan `context7` strategy untuk mempertahankan memori jangka panjang mengenai relasi database dan state management.
2. **Architecture:** Gunakan Server Components secara default. Gunakan Client Components hanya jika diperlukan interaksi (useState, useEffect).
3. **Styling:** Gunakan Tailwind CSS v4. Jangan gunakan file `tailwind.config.js` lama kecuali diperlukan. Gunakan `@import "tailwindcss";` di `globals.css`.
4. **Package Manager:** Selalu gunakan `pnpm`. Jangan gunakan `npm` atau `yarn`.
5. **Database:** Selalu gunakan Prisma/Drizzle schema yang sinkron dengan PostgreSQL.

## Coding Style
- Gunakan TypeScript secara ketat (No `any`).
- Gunakan fungsional komponen dengan arrow functions.
- Pisahkan logika bisnis di Server Actions (`/src/app/actions`) dan UI di components.
- Ikuti struktur folder: 
  - `src/components/ui` (reusable components)
  - `src/components/shared` (layout-specific)
  - `src/lib` (utilitas, database client)

## Implementation Steps
Jika diminta membuat fitur baru, ikuti urutan:
1. Update Database Schema.
2. Buat Server Action untuk logic data.
3. Buat UI Component.
4. Hubungkan UI dengan data.