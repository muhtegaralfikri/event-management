"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { isOrganizerAuthorized } from "@/lib/organizer-auth";
import { stripHtmlTags, sanitizeUrl } from "@/lib/sanitize";
import type { Prisma } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/enums";

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  price: string;
  capacity: number;
  image: string | null;
  organizerName: string;
  registeredCount: number;
};

export type EventDetail = EventListItem & {
  organizerEmail: string;
};

const normalizeText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const normalizeOptionalText = (value: FormDataEntryValue | null) => {
  const text = normalizeText(value);

  return text.length > 0 ? text : null;
};

const createSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

const getEventSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  date: true,
  time: true,
  location: true,
  price: true,
  capacity: true,
  image: true,
  organizer: {
    select: {
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      registrations: true,
    },
  },
} as const;

type EventWithSummary = Prisma.EventGetPayload<{
  select: typeof getEventSelect;
}>;

const mapEvent = (event: EventWithSummary): EventListItem => ({
  id: event.id,
  title: event.title,
  slug: event.slug,
  description: event.description,
  date: event.date,
  time: event.time,
  location: event.location,
  price: event.price.toString(),
  capacity: event.capacity,
  image: event.image,
  organizerName: event.organizer.name,
  registeredCount: event._count.registrations,
});

export const getActiveEvents = async (): Promise<EventListItem[]> => {
  const prisma = getPrisma();
  const events = await prisma.event.findMany({
    orderBy: {
      date: "asc",
    },
    select: getEventSelect,
  });

  return events.map(mapEvent);
};

export const getEventDetailBySlug = async (slug: string): Promise<EventDetail | null> => {
  const prisma = getPrisma();
  const event = await prisma.event.findUnique({
    where: {
      slug,
    },
    select: getEventSelect,
  });

  if (!event) {
    return null;
  }

  return {
    ...mapEvent(event),
    organizerEmail: event.organizer.email,
  };
};

// ── Batas wajar untuk input numerik ────────────────────────────────
const MAX_CAPACITY = 10_000;
const MAX_PRICE = 100_000_000; // 100 juta IDR

export const createEvent = async (formData: FormData) => {
  if (!(await isOrganizerAuthorized())) {
    redirect("/organizer/events/new?auth=required");
  }

  // ── Sanitasi Input (Anti-XSS) ───────────────────────────────────
  // stripHtmlTags menghapus semua HTML tags dari input.
  // React JSX sudah otomatis escape entities, jadi cukup strip tags saja.
  const title = stripHtmlTags(normalizeText(formData.get("title")));
  const description = stripHtmlTags(normalizeText(formData.get("description")));
  const date = normalizeText(formData.get("date"));
  const time = normalizeText(formData.get("time"));
  const location = stripHtmlTags(normalizeText(formData.get("location")));
  const capacity = Number(normalizeText(formData.get("capacity")));
  const price = Number(normalizeText(formData.get("price")) || "0");

  // ── Validasi URL Banner (Anti-XSS & Protocol Injection) ─────────
  // Hanya menerima https:// — menolak javascript:, data:, file:, dsb.
  const rawImage = normalizeOptionalText(formData.get("image"));
  const image = rawImage ? sanitizeUrl(rawImage) : null;

  if (rawImage && !image) {
    throw new Error("URL banner tidak valid. Hanya URL https:// yang diizinkan.");
  }

  if (!title || !description || !date || !time || !location) {
    throw new Error("Semua field wajib diisi kecuali banner URL.");
  }

  // ── Batas Numerik (Anti-Abuse) ──────────────────────────────────
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new Error("Kapasitas minimal 1 peserta.");
  }

  if (capacity > MAX_CAPACITY) {
    throw new Error(`Kapasitas maksimal ${MAX_CAPACITY.toLocaleString("id-ID")} peserta.`);
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Harga tiket tidak valid.");
  }

  if (price > MAX_PRICE) {
    throw new Error(`Harga tiket maksimal ${MAX_PRICE.toLocaleString("id-ID")} rupiah.`);
  }

  const baseSlug = createSlug(title);
  const eventDate = new Date(`${date}T${time}:00`);

  if (!baseSlug || Number.isNaN(eventDate.getTime())) {
    throw new Error("Judul atau tanggal event tidak valid.");
  }

  const prisma = getPrisma();
  const organizer = await prisma.user.upsert({
    where: {
      email: "organizer@eventtix.local",
    },
    update: {
      role: UserRole.ORGANIZER,
    },
    create: {
      name: "EventTix Organizer",
      email: "organizer@eventtix.local",
      role: UserRole.ORGANIZER,
    },
  });

  const existingSlugCount = await prisma.event.count({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
  });

  const slug = existingSlugCount === 0 ? baseSlug : `${baseSlug}-${existingSlugCount + 1}`;

  await prisma.event.create({
    data: {
      title,
      slug,
      description,
      date: eventDate,
      time,
      location,
      price,
      capacity,
      image,
      organizerId: organizer.id,
    },
  });

  revalidatePath("/");
  redirect(`/events/${slug}`);
};
