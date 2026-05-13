import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import { sanitizeCsvField } from "@/lib/sanitize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { eventId } = await params;
  const prisma = getPrisma();

  // Verify ownership
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          user: true,
          promoCode: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!event || event.organizerId !== session.user.id) {
    return new NextResponse("Not Found or Unauthorized", { status: 404 });
  }

  // Generate CSV
  const headers = ["Ticket Code", "Name", "Email", "Status", "Checked In", "Check-in Time", "Promo Code", "Final Price", "Registration Date"];
  
  const rows = event.registrations.map(r => [
    sanitizeCsvField(r.ticketCode),
    sanitizeCsvField(r.user.name),
    sanitizeCsvField(r.user.email),
    sanitizeCsvField(r.status),
    r.checkedIn ? "Yes" : "No",
    r.checkedInAt ? sanitizeCsvField(r.checkedInAt.toISOString()) : "",
    sanitizeCsvField(r.promoCode?.code || "-"),
    r.finalPrice ? r.finalPrice.toString() : event.price.toString(),
    sanitizeCsvField(r.createdAt.toISOString())
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const response = new NextResponse(csvContent);
  response.headers.set("Content-Type", "text/csv; charset=utf-8");
  response.headers.set("Content-Disposition", `attachment; filename="${event.slug}-attendees.csv"`);

  return response;
}
