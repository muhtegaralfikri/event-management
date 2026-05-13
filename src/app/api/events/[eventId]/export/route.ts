import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";

const sanitizeExcelText = (value: string) => {
  const trimmed = value.trim();
  const firstChar = trimmed.charAt(0);

  return ["=", "+", "-", "@", "\t", "\r"].includes(firstChar) ? `'${trimmed}` : trimmed;
};

const formatDateTime = (date: Date | null) => date?.toISOString() ?? "";

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

  const headers = [
    "Ticket Code",
    "Name",
    "Email",
    "Status",
    "Checked In",
    "Check-in Time",
    "Promo Code",
    "Final Price",
    "Registration Date",
  ];
  
  const rows = event.registrations.map(r => [
    sanitizeExcelText(r.ticketCode),
    sanitizeExcelText(r.user.name),
    sanitizeExcelText(r.user.email),
    r.status,
    r.checkedIn ? "Yes" : "No",
    formatDateTime(r.checkedInAt),
    sanitizeExcelText(r.promoCode?.code || "-"),
    Number(r.finalPrice ? r.finalPrice.toString() : event.price.toString()),
    formatDateTime(r.createdAt),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 24 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 24 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");
  const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

  const response = new NextResponse(excelBuffer);
  response.headers.set(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  response.headers.set("Content-Disposition", `attachment; filename="${event.slug}-attendees.xlsx"`);

  return response;
}
