"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { isOrganizerAuthorized } from "@/lib/organizer-auth";
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

export const createEvent = async (formData: FormData) => {
  if (!(await isOrganizerAuthorized())) {
    redirect("/organizer/events/new?auth=required");
  }

  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const date = normalizeText(formData.get("date"));
  const time = normalizeText(formData.get("time"));
  const location = normalizeText(formData.get("location"));
  const image = normalizeOptionalText(formData.get("image"));
  const capacity = Number(normalizeText(formData.get("capacity")));
  const price = Number(normalizeText(formData.get("price")) || "0");

  if (!title || !description || !date || !time || !location) {
    throw new Error("Semua field wajib diisi kecuali banner URL.");
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new Error("Kapasitas minimal 1 peserta.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Harga tiket tidak valid.");
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
