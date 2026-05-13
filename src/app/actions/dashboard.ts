"use server";

import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";

export const getOrganizerEvents = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    throw new Error("Akses ditolak");
  }

  const prisma = getPrisma();
  
  const events = await prisma.event.findMany({
    where: { organizerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { registrations: true }
      },
      registrations: {
        select: {
          status: true,
          checkedIn: true,
          finalPrice: true
        }
      }
    }
  });

  return events.map(event => {
    const paidRegs = event.registrations.filter((registration) => registration.status === "PAID");
    const checkedInCount = event.registrations.filter(r => r.checkedIn).length;
    
    // Calculate revenue based on finalPrice if available, otherwise fallback to event.price
    const revenue = paidRegs.reduce((acc, curr) => {
      const price = curr.finalPrice !== null ? curr.finalPrice.toNumber() : event.price.toNumber();
      return acc + price;
    }, 0);

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      date: event.date,
      status: event.status,
      totalRegistrants: event._count.registrations,
      paidCount: paidRegs.length,
      checkedInCount,
      revenue
    };
  });
};
