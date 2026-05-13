# Product Requirements Document (PRD) - Event Management System

## 1. Project Overview
**Nama Proyek:** EventTix (Event Management System)
**Deskripsi:** Platform web untuk membuat, mengelola, dan mendaftar event/seminar. Proyek ini bertujuan untuk menunjukkan kemampuan fullstack menggunakan Next.js.
**Target Pengguna:**
- **Organizer:** Orang yang membuat dan mengelola event.
- **Attendee:** Orang yang mencari dan mendaftar event.
- **Admin:** Mengawasi seluruh sistem.

## 2. Core Features (MVP)
### A. User Management
- Registrasi dan Login (OAuth Google & Email).
- Role-based Access Control (RBAC): Organizer & Attendee.

### B. Event Management (Organizer)
- Form Create Event: Judul, deskripsi, tanggal, lokasi (hybrid/offline), harga tiket, kapasitas.
- Image Upload untuk banner event.
- Dashboard Organizer: Melihat daftar event yang dibuat dan jumlah pendaftar.

### C. Discovery & Registration (Attendee)
- Landing Page: Menampilkan list event yang aktif.
- Event Detail Page: Informasi lengkap event.
- Sistem Pendaftaran: User bisa mendaftar event dengan validasi kapasitas.
- E-Ticket: Generate tiket setelah pendaftaran berhasil.

## 3. Advanced Features (Portfolio Boosters)
- **Sistem Tiket QR Code:** Generate QR Code unik untuk setiap peserta.
- **Payment Gateway Integration:** Simulasi pembayaran menggunakan Midtrans (Sandbox).
- **Check-in System:** Fitur bagi organizer untuk men-scan QR tiket (ubah status kehadiran).
- **Export Data:** Download daftar peserta dalam format CSV/Excel.

## 4. Technical Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (via Supabase/Neon)
- **ORM:** Prisma or Drizzle
- **Auth:** NextAuth.js or Clerk
- **State Management:** React Context or TanStack Query

## 5. Arsitektur Sistem & Alur Data

Sistem ini menggunakan arsitektur **Monolith Modern** dengan Next.js App Router, di mana sisi Client dan Server berada dalam satu *codebase* namun dieksekusi di lingkungan yang terpisah.

```mermaid
flowchart TD
    Client[Browser / User] -->|HTTP/HTTPS| NextJS[Next.js App Router]
    
    subgraph Frontend
        NextJS -->|Renders| UI[React Server & Client Components]
        UI -->|Styling| TW[Tailwind CSS v4]
    end
    
    subgraph Backend logic
        UI -->|Calls| SA[Server Actions / API Routes]
        SA -->|Queries| ORM[Prisma ORM]
    end
    
    subgraph Data & External Services
        ORM -->|Connection Pool| DB[(PostgreSQL Database)]
        SA -->|API Call| Pay[Payment Gateway - Midtrans]
        SA -->|SMTP| Mail[Email Service - Nodemailer]
    end
```

## 6. Entity Relationship Diagram (ERD)

Desain database ini menggunakan skema relasional. Seorang **User** (dengan role Organizer) bisa membuat banyak **Event**. Seorang **User** (dengan role Attendee) bisa memiliki banyak **Registration** (Tiket). Sebuah **Event** bisa memiliki banyak **Registration**.

```mermaid
erDiagram
    USER {
        string id PK "UUID"
        string name
        string email
        string password "Hashed"
        string role "ENUM: ADMIN, ORGANIZER, ATTENDEE"
        datetime createdAt
        datetime updatedAt
    }

    EVENT {
        string id PK "UUID"
        string title
        string slug "Unique URL"
        text description
        datetime date
        string time
        string location "Offline Address or Online Link"
        float price
        int capacity
        string image "Banner URL"
        string organizerId FK "Relasi ke tabel USER"
        datetime createdAt
    }

    REGISTRATION {
        string id PK "UUID"
        string userId FK "Relasi ke tabel USER"
        string eventId FK "Relasi ke tabel EVENT"
        string ticketCode "Unique, format: EVT-XXX-YYY"
        string status "ENUM: PENDING, PAID, CANCELLED"
        boolean checkedIn "Default: false"
        datetime createdAt
    }

    %% Relasi antar tabel
    USER ||--o{ EVENT : "organizes"
    USER ||--o{ REGISTRATION : "registers / owns ticket"
    EVENT ||--o{ REGISTRATION : "has attendees"
```

## 7. Non-Functional Requirements
- **Performance:** Skor Lighthouse > 90.
- **SEO:** Metadata dinamis untuk setiap halaman event.
- **Responsive:** Mobile-first design.