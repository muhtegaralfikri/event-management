import "dotenv/config";
import { randomUUID } from "node:crypto";
import pg from "pg";

const { Client } = pg;

const targetEventCount = 10;
const organizerEmail = "organizer@eventtix.local";

const eventTemplates = [
  {
    title: "Next.js Builder Summit Jakarta",
    slug: "nextjs-builder-summit-jakarta",
    description:
      "Konferensi satu hari untuk frontend engineer dan product team yang membahas App Router, deployment, dan praktik performa modern.",
    date: "2026-06-12T09:00:00+07:00",
    time: "09:00",
    location: "Balai Kartini, Jakarta",
    category: "TECHNOLOGY",
    price: "250000.00",
    capacity: 180,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Product Design Sprint Bandung",
    slug: "product-design-sprint-bandung",
    description:
      "Workshop intensif untuk tim desain dan PM dalam menyusun eksperimen produk, design critique, dan prototyping cepat.",
    date: "2026-06-19T10:00:00+07:00",
    time: "10:00",
    location: "The Hallway Space, Bandung",
    category: "DESIGN",
    price: "0.00",
    capacity: 90,
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "AI for Operations Surabaya",
    slug: "ai-for-operations-surabaya",
    description:
      "Sesi praktis tentang automasi operasional, knowledge workflow, dan penggunaan AI untuk tim internal perusahaan.",
    date: "2026-06-26T13:30:00+07:00",
    time: "13:30",
    location: "Grand Darmo Suite, Surabaya",
    category: "TECHNOLOGY",
    price: "175000.00",
    capacity: 140,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Community Meetup Makassar Tech",
    slug: "community-meetup-makassar-tech",
    description:
      "Meetup komunitas untuk developer lokal dengan lightning talk, networking, dan sharing peluang kolaborasi produk digital.",
    date: "2026-07-03T18:30:00+08:00",
    time: "18:30",
    location: "Nipah Park, Makassar",
    category: "COMMUNITY",
    price: "0.00",
    capacity: 120,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "SaaS Growth Forum Yogyakarta",
    slug: "saas-growth-forum-yogyakarta",
    description:
      "Forum untuk founder dan growth team membahas pricing, retention, funnel analysis, dan operasional scale-up.",
    date: "2026-07-10T09:30:00+07:00",
    time: "09:30",
    location: "Royal Ambarrukmo, Yogyakarta",
    category: "BUSINESS",
    price: "300000.00",
    capacity: 160,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Cloud Native Bootcamp Bali",
    slug: "cloud-native-bootcamp-bali",
    description:
      "Bootcamp untuk engineer backend dan DevOps yang membahas container workflow, observability, dan deployment pipeline.",
    date: "2026-07-17T08:30:00+08:00",
    time: "08:30",
    location: "Jimbaran Hub, Bali",
    category: "WORKSHOP",
    price: "450000.00",
    capacity: 100,
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Data Analytics Clinic Medan",
    slug: "data-analytics-clinic-medan",
    description:
      "Klinik hands-on untuk analyst dan ops lead dalam membangun dashboard, KPI, dan alur analitik untuk bisnis harian.",
    date: "2026-07-24T14:00:00+07:00",
    time: "14:00",
    location: "Cambridge Hotel, Medan",
    category: "SEMINAR",
    price: "125000.00",
    capacity: 110,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Startup Finance Basics Online",
    slug: "startup-finance-basics-online",
    description:
      "Sesi online untuk founder early-stage memahami cashflow, runway, budgeting, dan pelaporan sederhana untuk startup.",
    date: "2026-08-01T19:30:00+07:00",
    time: "19:30",
    location: "https://meet.eventtix.local/startup-finance-basics",
    category: "BUSINESS",
    price: "0.00",
    capacity: 250,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Enterprise UX Roundtable Semarang",
    slug: "enterprise-ux-roundtable-semarang",
    description:
      "Roundtable untuk designer sistem internal, membahas decision-heavy interfaces, workflow density, dan usability review.",
    date: "2026-08-08T15:00:00+07:00",
    time: "15:00",
    location: "PO Hotel, Semarang",
    category: "DESIGN",
    price: "220000.00",
    capacity: 80,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Founder Networking Night Batam",
    slug: "founder-networking-night-batam",
    description:
      "Sesi santai untuk founder dan operator membangun jaringan, berbagi tantangan bisnis, dan mencari peluang partnership.",
    date: "2026-08-15T18:00:00+07:00",
    time: "18:00",
    location: "Nagoya Hill, Batam",
    category: "NETWORKING",
    price: "50000.00",
    capacity: 130,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  },
];

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const organizerResult = await client.query(
      `
        INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5::"UserRole", NOW(), NOW())
        ON CONFLICT (email)
        DO UPDATE SET role = EXCLUDED.role, "updatedAt" = NOW()
        RETURNING id
      `,
      [randomUUID(), "EventTix Organizer", organizerEmail, null, "ORGANIZER"],
    );

    const organizerId = organizerResult.rows[0]?.id;

    if (!organizerId) {
      throw new Error("Failed to resolve organizer user");
    }

    const countResult = await client.query('SELECT COUNT(*)::int AS count FROM events');
    const currentCount = countResult.rows[0]?.count ?? 0;
    const needed = Math.max(targetEventCount - currentCount, 0);

    if (needed === 0) {
      console.log(`Events already at ${currentCount}. No seed needed.`);
      return;
    }

    const eventsToInsert = eventTemplates.slice(0, needed);

    for (const event of eventsToInsert) {
      await client.query(
        `
          INSERT INTO events (
            id, title, slug, description, date, time, location, category, price, capacity, image,
            "organizerId", "createdAt", "updatedAt"
          )
          VALUES (
            $1, $2, $3, $4, $5::timestamp, $6, $7, $8::"EventCategory", $9::decimal, $10, $11, $12, NOW(), NOW()
          )
          ON CONFLICT (slug) DO NOTHING
        `,
        [
          randomUUID(),
          event.title,
          event.slug,
          event.description,
          event.date,
          event.time,
          event.location,
          event.category,
          event.price,
          event.capacity,
          event.image,
          organizerId,
        ],
      );
    }

    const finalCountResult = await client.query('SELECT COUNT(*)::int AS count FROM events');
    const finalCount = finalCountResult.rows[0]?.count ?? currentCount;

    console.log(`Seeded events. Count before: ${currentCount}, after: ${finalCount}.`);
  } finally {
    await client.end();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
