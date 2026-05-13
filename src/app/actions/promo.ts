"use server";

import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import { normalizeText } from "@/lib/form-utils";
import { Prisma } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const createPromoCode = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    throw new Error("Akses ditolak");
  }

  const code = normalizeText(formData.get("code"))?.toUpperCase();
  const discountType = normalizeText(formData.get("discountType")); // PERCENT or AMOUNT
  const discountValueStr = normalizeText(formData.get("discountValue"));
  const maxUsesStr = normalizeText(formData.get("maxUses"));
  const expiresAtStr = normalizeText(formData.get("expiresAt"));
  const eventId = normalizeText(formData.get("eventId")); // Opsional

  if (!code || !discountType || !discountValueStr) {
    throw new Error("Kode promo dan nilai diskon wajib diisi.");
  }

  const discountValue = Number(discountValueStr);
  if (isNaN(discountValue) || discountValue <= 0) {
    throw new Error("Nilai diskon tidak valid.");
  }

  let discountPercent = null;
  let discountAmount = null;

  if (discountType === "PERCENT") {
    if (discountValue > 100) throw new Error("Diskon persentase maksimal 100%.");
    discountPercent = discountValue;
  } else {
    discountAmount = new Prisma.Decimal(discountValue);
  }

  const maxUses = maxUsesStr ? parseInt(maxUsesStr, 10) : 0;
  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

  const prisma = getPrisma();

  // Validate if code exists
  const existingCode = await prisma.promoCode.findUnique({
    where: { code }
  });

  if (existingCode) {
    throw new Error("Kode promo sudah digunakan.");
  }

  if (eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.organizerId !== session.user.id) {
      throw new Error("Event tidak ditemukan atau bukan milik Anda.");
    }
  }

  await prisma.promoCode.create({
    data: {
      code,
      discountPercent,
      discountAmount,
      maxUses,
      expiresAt,
      eventId: eventId || null,
      organizerId: session.user.id,
    }
  });

  revalidatePath("/organizer/dashboard");
  redirect("/organizer/dashboard");
};

export const validatePromoCode = async (code: string, eventId: string) => {
  const prisma = getPrisma();
  
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
    select: {
      id: true,
      code: true,
      discountPercent: true,
      discountAmount: true,
      maxUses: true,
      currentUses: true,
      expiresAt: true,
      eventId: true,
      organizerId: true,
    },
  });

  if (!promo) {
    return { valid: false, message: "Kode promo tidak ditemukan." };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      organizerId: true,
    },
  });

  if (!event) {
    return { valid: false, message: "Event tidak ditemukan." };
  }

  if (promo.eventId && promo.eventId !== eventId) {
    return { valid: false, message: "Kode promo tidak berlaku untuk event ini." };
  }

  if (!promo.eventId && promo.organizerId !== event.organizerId) {
    return { valid: false, message: "Kode promo tidak berlaku untuk organizer event ini." };
  }

  if (promo.expiresAt && new Date() > promo.expiresAt) {
    return { valid: false, message: "Kode promo sudah kadaluarsa." };
  }

  if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
    return { valid: false, message: "Kode promo sudah mencapai batas penggunaan." };
  }

  return { valid: true, promo };
};
