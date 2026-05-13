"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isOrganizerAuthorized } from "@/lib/organizer-auth";
import type { Prisma } from "@/generated/prisma/client";
import { RegistrationStatus, UserRole } from "@/generated/prisma/enums";

export type TicketDetail = {
  id: string;
  ticketCode: string;
  status: string;
  checkedIn: boolean;
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

const normalizeText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createTicketCode = (slug: string) => {
  const prefix = slug
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  return `EVT-${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
};

const ticketSelect = {
  id: true,
  ticketCode: true,
  status: true,
  checkedIn: true,
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
  const eventId = normalizeText(formData.get("eventId"));
  const attendeeName = normalizeText(formData.get("name"));
  const attendeeEmail = normalizeText(formData.get("email")).toLowerCase();

  if (!eventId || !attendeeName || !isValidEmail(attendeeEmail)) {
    throw new Error("Nama dan email valid wajib diisi.");
  }

  const ticketCode = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        slug: true,
        price: true,
        capacity: true,
        registrations: {
          where: {
            status: {
              not: RegistrationStatus.CANCELLED,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event tidak ditemukan.");
    }

    if (event.registrations.length >= event.capacity) {
      throw new Error("Kapasitas event sudah penuh.");
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
      },
    });

    if (existingRegistration) {
      return existingRegistration;
    }

    const registration = await tx.registration.create({
      data: {
        userId: user.id,
        eventId,
        ticketCode: createTicketCode(event.slug),
        status: event.price.equals(0) ? RegistrationStatus.PAID : RegistrationStatus.PENDING,
      },
      select: {
        ticketCode: true,
        status: true,
      },
    });

    return registration;
  });

  revalidatePath("/");
  redirect(
    ticketCode.status === RegistrationStatus.PENDING
      ? `/payments/${ticketCode.ticketCode}`
      : `/tickets/${ticketCode.ticketCode}`,
  );
};

export const getTicketByCode = async (ticketCode: string): Promise<TicketDetail | null> => {
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

  await prisma.registration.update({
    where: {
      ticketCode,
    },
    data: {
      status: RegistrationStatus.PAID,
    },
  });

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

  const ticket = await prisma.registration.findUnique({
    where: {
      ticketCode,
    },
    select: {
      ticketCode: true,
      status: true,
      checkedIn: true,
    },
  });

  if (!ticket) {
    redirect(`/organizer/check-in?result=not-found&code=${encodeURIComponent(ticketCode)}`);
  }

  if (ticket.status !== RegistrationStatus.PAID) {
    redirect(`/organizer/check-in?result=unpaid&code=${encodeURIComponent(ticketCode)}`);
  }

  if (ticket.checkedIn) {
    redirect(`/organizer/check-in?result=duplicate&code=${encodeURIComponent(ticketCode)}`);
  }

  await prisma.registration.update({
    where: {
      ticketCode,
    },
    data: {
      checkedIn: true,
    },
  });

  revalidatePath(`/tickets/${ticketCode}`);
  redirect(`/organizer/check-in?result=success&code=${encodeURIComponent(ticketCode)}`);
};
