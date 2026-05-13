"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stripHtmlTags, sanitizeUrl } from "@/lib/sanitize";
import { normalizeText, normalizeOptionalText } from "@/lib/form-utils";
import type { Prisma } from "@/generated/prisma/client";
import { UserRole, EventCategory, EventStatus } from "@/generated/prisma/enums";

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
  category: EventCategory;
  organizerName: string;
  registeredCount: number;
};

export type EventDetail = EventListItem & {
  organizerEmail: string;
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
  category: true,
  status: true,
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
  category: event.category,
  organizerName: event.organizer.name,
  registeredCount: event._count.registrations,
});

export const getActiveEvents = async (search?: string, category?: string): Promise<EventListItem[]> => {
  const prisma = getPrisma();
  
  const whereClause: Prisma.EventWhereInput = {
    status: EventStatus.ACTIVE,
    date: {
      gte: new Date(),
    },
  };

  if (search) {
    whereClause.title = { contains: search, mode: "insensitive" };
  }

  if (category && category !== "ALL" && Object.values(EventCategory).includes(category as EventCategory)) {
    whereClause.category = category as EventCategory;
  }

  const events = await prisma.event.findMany({
    where: whereClause,
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
      status: EventStatus.ACTIVE,
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

const MAX_CAPACITY = 10_000;
const MAX_PRICE = 100_000_000;

export const createEvent = async (formData: FormData) => {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    redirect("/login");
  }

  const title = stripHtmlTags(normalizeText(formData.get("title")));
  const description = stripHtmlTags(normalizeText(formData.get("description")));
  const date = normalizeText(formData.get("date"));
  const time = normalizeText(formData.get("time"));
  const location = stripHtmlTags(normalizeText(formData.get("location")));
  const capacityStr = normalizeText(formData.get("capacity"));
  const priceStr = normalizeText(formData.get("price") || "0");
  const categoryValue = normalizeText(formData.get("category"));

  const capacity = Number(capacityStr);
  const price = Number(priceStr);

  const rawImage = normalizeOptionalText(formData.get("image"));
  const image = rawImage ? sanitizeUrl(rawImage) : null;

  if (rawImage && !image) {
    throw new Error("URL banner tidak valid. Hanya URL https:// yang diizinkan.");
  }

  if (!title || !description || !date || !time || !location || !categoryValue) {
    throw new Error("Semua field wajib diisi kecuali banner URL.");
  }

  const category = categoryValue as EventCategory;
  if (!Object.values(EventCategory).includes(category)) {
    throw new Error("Kategori tidak valid.");
  }

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

  const existingSlug = await prisma.event.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });

  const slug = existingSlug ? `${baseSlug}-${randomUUID().slice(0, 8)}` : baseSlug;

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
      category,
      status: EventStatus.ACTIVE,
      organizerId: session.user.id,
    },
  });

  revalidatePath("/");
  redirect(`/events/${slug}`);
};
