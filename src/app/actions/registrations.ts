"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isOrganizerAuthorized } from "@/lib/organizer-auth";
import { isHoneypotFilled, stripHtmlTags } from "@/lib/sanitize";
import { normalizeText, getClientIdentifier } from "@/lib/form-utils";
import { registrationLimiter } from "@/lib/rate-limiter";
import { sendTicketEmail } from "@/lib/email";
import { validatePromoCode } from "./promo";
import type { Prisma } from "@/generated/prisma/client";
import { EventStatus, RegistrationStatus, UserRole } from "@/generated/prisma/enums";

export type TicketDetail = {
  id: string;
  ticketCode: string;
  status: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
  createdAt: Date;
  eventPrice: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  organizerName: string;
};

export type TicketLookupItem = {
  ticketCode: string;
  status: string;
  checkedIn: boolean;
  createdAt: Date;
  eventTitle: string;
  eventSlug: string;
  eventDate: Date;
  eventTime: string;
};

const createTicketCode = (slug: string) => {
  const prefix = slug
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  return `EVT-${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ticketSelect = {
  id: true,
  ticketCode: true,
  status: true,
  checkedIn: true,
  checkedInAt: true,
  createdAt: true,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  event: {
    select: {
      title: true,
      slug: true,
      date: true,
      time: true,
      location: true,
      price: true,
      organizer: {
        select: {
          name: true,
        },
      },
      status: true,
    },
  },
} as const;

type TicketWithRelations = Prisma.RegistrationGetPayload<{
  select: typeof ticketSelect;
}>;

const mapTicket = (ticket: TicketWithRelations): TicketDetail => ({
  id: ticket.id,
  ticketCode: ticket.ticketCode,
  status: ticket.status,
  checkedIn: ticket.checkedIn,
  checkedInAt: ticket.checkedInAt,
  createdAt: ticket.createdAt,
  eventPrice: ticket.event.price.toString(),
  attendeeName: ticket.user.name,
  attendeeEmail: ticket.user.email,
  eventTitle: ticket.event.title,
  eventSlug: ticket.event.slug,
  eventDate: ticket.event.date,
  eventTime: ticket.event.time,
  eventLocation: ticket.event.location,
  organizerName: ticket.event.organizer.name,
});

export const registerForEvent = async (formData: FormData) => {
  // ── Honeypot Check (Anti-Bot) ───────────────────────────────────
  if (isHoneypotFilled(formData)) {
    throw new Error("Registrasi tidak dapat diproses.");
  }

  const eventId = normalizeText(formData.get("eventId"));
  const attendeeName = stripHtmlTags(normalizeText(formData.get("name")));
  const attendeeEmail = normalizeText(formData.get("email")).toLowerCase();
  const promoCodeInput = normalizeText(formData.get("promoCode"));

  if (!eventId || !attendeeName || !isValidEmail(attendeeEmail)) {
    throw new Error("Nama dan email valid wajib diisi.");
  }

  // ── Rate Limiting (Anti-Spam) ───────────────────────────────────
  const clientId = await getClientIdentifier();
  const rateLimitKey = `registration:${clientId}`;
  const rateCheck = registrationLimiter.check(rateLimitKey);

  if (!rateCheck.allowed) {
    throw new Error(
      "Terlalu banyak percobaan pendaftaran. Coba lagi dalam beberapa menit.",
    );
  }

  const prisma = getPrisma();
  
  let validPromoId: string | null = null;
  let promoResult: Awaited<ReturnType<typeof validatePromoCode>> | null = null;

  if (promoCodeInput) {
    promoResult = await validatePromoCode(promoCodeInput, eventId);
    if (!promoResult?.valid || !promoResult.promo) {
      throw new Error(promoResult?.message || "Kode promo tidak valid");
    }
    validPromoId = promoResult.promo.id;
  }

  const ticketCode = await prisma.$transaction(async (tx) => {
    // ── Race Condition Fix (Atomic Capacity Check) ────────────────
    const lockedEvents = await tx.$queryRaw<
      Array<{ id: string; slug: string; price: string; capacity: number; status: EventStatus }>
    >`SELECT id, slug, price::text, capacity, status FROM events WHERE id = ${eventId}::uuid FOR UPDATE`;

    const event = lockedEvents[0];

    if (!event) {
      throw new Error("Event tidak ditemukan.");
    }

    if (event.status !== EventStatus.ACTIVE) {
      throw new Error("Event sudah tidak aktif.");
    }

    const activeCount = await tx.registration.count({
      where: {
        eventId,
        status: {
          not: RegistrationStatus.CANCELLED,
        },
      },
    });

    if (activeCount >= event.capacity) {
      throw new Error("Kapasitas event sudah penuh.");
    }

    // Check if promo code max usage exceeded in transaction
    if (validPromoId && promoResult?.promo && promoResult.promo.maxUses > 0) {
      const lockedPromo = await tx.$queryRaw<
        Array<{ id: string; currentUses: number; maxUses: number }>
      >`SELECT id, "currentUses", "maxUses" FROM promo_codes WHERE id = ${validPromoId}::uuid FOR UPDATE`;
      
      const p = lockedPromo[0];
      if (p && p.currentUses >= p.maxUses) {
        throw new Error("Kode promo sudah mencapai batas penggunaan.");
      }
    }

    const user = await tx.user.upsert({
      where: {
        email: attendeeEmail,
      },
      update: {
        name: attendeeName,
      },
      create: {
        name: attendeeName,
        email: attendeeEmail,
        role: UserRole.ATTENDEE,
      },
    });

    const existingRegistration = await tx.registration.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
      select: {
        ticketCode: true,
        status: true,
        event: { select: { title: true, date: true, time: true, location: true } },
        user: { select: { name: true, email: true } }
      },
    });

    if (existingRegistration) {
      return existingRegistration;
    }

    const eventPrice = Number(event.price);
    let finalPrice = eventPrice;

    if (validPromoId && promoResult?.promo) {
      if (promoResult.promo.discountPercent) {
        finalPrice = eventPrice - (eventPrice * promoResult.promo.discountPercent / 100);
      } else if (promoResult.promo.discountAmount) {
        finalPrice = eventPrice - Number(promoResult.promo.discountAmount);
      }
      finalPrice = Math.max(0, finalPrice);
    }

    const isFree = finalPrice === 0 || Number.isNaN(finalPrice);
    const newTicketCode = createTicketCode(event.slug);
    const status = isFree ? RegistrationStatus.PAID : RegistrationStatus.PENDING;

    const registration = await tx.registration.create({
      data: {
        userId: user.id,
        eventId,
        ticketCode: newTicketCode,
        status,
        promoCodeId: validPromoId,
        finalPrice: finalPrice,
      },
      select: {
        ticketCode: true,
        status: true,
        event: { select: { title: true, date: true, time: true, location: true } },
        user: { select: { name: true, email: true } }
      },
    });

    if (validPromoId) {
      await tx.promoCode.update({
        where: { id: validPromoId },
        data: { currentUses: { increment: 1 } }
      });
    }

    return registration;
  });

  // Async send email (fire and forget)
  sendTicketEmail(
    ticketCode.user.email,
    ticketCode.user.name,
    ticketCode.event,
    ticketCode.ticketCode,
    ticketCode.status
  ).catch(console.error);

  revalidatePath("/");
  redirect(
    ticketCode.status === RegistrationStatus.PENDING
      ? `/payments/${ticketCode.ticketCode}`
      : `/tickets/${ticketCode.ticketCode}`,
  );
};

export const getTicketByCode = async (ticketCode: string): Promise<TicketDetail | null> => {
  const prisma = getPrisma();
  const ticket = await prisma.registration.findUnique({
    where: {
      ticketCode,
    },
    select: ticketSelect,
  });

  return ticket ? mapTicket(ticket) : null;
};

export const getTicketsByEmail = async (email: string): Promise<TicketLookupItem[]> => {
  const attendeeEmail = email.trim().toLowerCase();

  if (!isValidEmail(attendeeEmail)) {
    return [];
  }

  const session = await auth();
  const sessionEmail = session?.user?.email?.toLowerCase();

  if (!sessionEmail || sessionEmail !== attendeeEmail) {
    return [];
  }

  const prisma = getPrisma();
  const tickets = await prisma.registration.findMany({
    where: {
      user: {
        email: attendeeEmail,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      ticketCode: true,
      status: true,
      checkedIn: true,
      createdAt: true,
      event: {
        select: {
          title: true,
          slug: true,
          date: true,
          time: true,
        },
      },
    },
  });

  return tickets.map((ticket) => ({
    ticketCode: ticket.ticketCode,
    status: ticket.status,
    checkedIn: ticket.checkedIn,
    createdAt: ticket.createdAt,
    eventTitle: ticket.event.title,
    eventSlug: ticket.event.slug,
    eventDate: ticket.event.date,
    eventTime: ticket.event.time,
  }));
};

export const findTicket = async (formData: FormData) => {
  const ticketCode = normalizeText(formData.get("ticketCode")).toUpperCase();
  const email = normalizeText(formData.get("email")).toLowerCase();

  if (ticketCode) {
    redirect(`/tickets/${ticketCode}`);
  }

  if (email) {
    redirect(`/tickets?email=${encodeURIComponent(email)}`);
  }

  redirect("/tickets?result=empty");
};

export const payRegistration = async (formData: FormData) => {
  const ticketCode = normalizeText(formData.get("ticketCode"));

  if (!ticketCode) {
    throw new Error("Kode tiket wajib ada.");
  }

  const prisma = getPrisma();

  // ── Payment Hardening ───────────────────────────────────────────
  // Cek status tiket sebelum mengubah ke PAID.
  // Hanya tiket PENDING yang boleh dibayar.
  // Ini mencegah double-payment atau pembayaran tiket CANCELLED.
  const ticket = await prisma.registration.findUnique({
    where: {
      ticketCode,
    },
    select: {
      status: true,
      event: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("Tiket tidak ditemukan.");
  }

  if (ticket.event.status !== EventStatus.ACTIVE) {
    throw new Error("Event sudah dibatalkan dan tiket tidak bisa dibayar.");
  }

  if (ticket.status !== RegistrationStatus.PENDING) {
    throw new Error(
      ticket.status === RegistrationStatus.PAID
        ? "Tiket sudah dibayar sebelumnya."
        : "Tiket sudah dibatalkan dan tidak bisa dibayar.",
    );
  }

  await prisma.registration.update({
    where: {
      ticketCode,
    },
    data: {
      status: RegistrationStatus.PAID,
    },
  });

  const updatedTicket = await prisma.registration.findUnique({
    where: { ticketCode },
    select: {
      ticketCode: true,
      status: true,
      user: { select: { email: true, name: true } },
      event: { select: { title: true, date: true, time: true, location: true } }
    }
  });

  if (updatedTicket) {
    sendTicketEmail(
      updatedTicket.user.email,
      updatedTicket.user.name,
      updatedTicket.event,
      updatedTicket.ticketCode,
      updatedTicket.status
    ).catch(console.error);
  }

  revalidatePath(`/payments/${ticketCode}`);
  revalidatePath(`/tickets/${ticketCode}`);
  redirect(`/tickets/${ticketCode}`);
};

export const checkInTicket = async (formData: FormData) => {
  if (!(await isOrganizerAuthorized())) {
    redirect("/organizer/check-in?auth=required");
  }

  const ticketCode = normalizeText(formData.get("ticketCode")).toUpperCase();

  if (!ticketCode) {
    redirect("/organizer/check-in?result=empty");
  }

  const prisma = getPrisma();
  const ticket = await prisma.registration.findUnique({
    where: {
      ticketCode,
    },
    select: {
      ticketCode: true,
      status: true,
      checkedIn: true,
      checkedInAt: true,
      event: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!ticket) {
    redirect(`/organizer/check-in?result=not-found&code=${encodeURIComponent(ticketCode)}`);
  }

  if (ticket.status !== RegistrationStatus.PAID) {
    redirect(`/organizer/check-in?result=unpaid&code=${encodeURIComponent(ticketCode)}`);
  }

  if (ticket.event.status !== EventStatus.ACTIVE) {
    redirect(`/organizer/check-in?result=cancelled&code=${encodeURIComponent(ticketCode)}`);
  }

  if (ticket.checkedIn) {
    // Sertakan timestamp check-in sebelumnya agar Organizer tahu
    // kapan tiket ini terakhir kali digunakan.
    const checkedInTime = ticket.checkedInAt
      ? `&time=${encodeURIComponent(ticket.checkedInAt.toISOString())}`
      : "";
    redirect(
      `/organizer/check-in?result=duplicate&code=${encodeURIComponent(ticketCode)}${checkedInTime}`,
    );
  }

  // ── Simpan timestamp check-in ─────────────────────────────────
  await prisma.registration.update({
    where: {
      ticketCode,
    },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
    },
  });

  revalidatePath(`/tickets/${ticketCode}`);
  redirect(`/organizer/check-in?result=success&code=${encodeURIComponent(ticketCode)}`);
};
