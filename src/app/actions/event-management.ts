"use server";

import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { UserRole, EventCategory, EventStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

import { normalizeText, normalizeOptionalText } from "@/lib/form-utils";
import { Prisma } from "@/generated/prisma/client";

export const cancelEvent = async (eventId: string) => {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    throw new Error("Akses ditolak");
  }

  const prisma = getPrisma();
  
  // Verify ownership
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event || event.organizerId !== session.user.id) {
    throw new Error("Event tidak ditemukan atau Anda tidak memiliki akses");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: EventStatus.CANCELLED }
  });

  // Optionally we could cancel all pending registrations here
  await prisma.registration.updateMany({
    where: { eventId, status: "PENDING" },
    data: { status: "CANCELLED" }
  });

  revalidatePath("/organizer/dashboard");
  revalidatePath("/");
};

export const updateEvent = async (eventId: string, formData: FormData) => {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    throw new Error("Akses ditolak");
  }

  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const dateStr = normalizeText(formData.get("date"));
  const time = normalizeText(formData.get("time"));
  const location = normalizeText(formData.get("location"));
  const priceStr = normalizeText(formData.get("price"));
  const capacityStr = normalizeText(formData.get("capacity"));
  const categoryValue = normalizeText(formData.get("category"));
  const image = normalizeOptionalText(formData.get("image"));

  if (!title || !description || !dateStr || !time || !location || !capacityStr || !categoryValue) {
    throw new Error("Semua field wajib diisi");
  }

  const category = categoryValue as EventCategory;
  if (!Object.values(EventCategory).includes(category)) {
    throw new Error("Kategori tidak valid");
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error("Format tanggal tidak valid");
  }

  const capacity = parseInt(capacityStr, 10);
  if (isNaN(capacity) || capacity <= 0) {
    throw new Error("Kapasitas harus berupa angka positif");
  }

  let price = new Prisma.Decimal(0);
  if (priceStr) {
    const parsedPrice = parseFloat(priceStr);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw new Error("Harga tidak valid");
    }
    price = new Prisma.Decimal(parsedPrice);
  }

  const prisma = getPrisma();
  
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event || event.organizerId !== session.user.id) {
    throw new Error("Event tidak ditemukan atau Anda tidak memiliki akses");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      description,
      date,
      time,
      location,
      category,
      price,
      capacity,
      image,
    }
  });

  revalidatePath("/organizer/dashboard");
  revalidatePath(`/events/${event.slug}`);
};
