import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketByCode } from "@/app/actions/registrations";
import { RegistrationStatus } from "@/generated/prisma/enums";
import { SiteHeader } from "@/components/shared/site-header";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { createTicketQrSvg } from "@/lib/qr-code";
import { ArrowLeft, CalendarClock, MapPin, QrCode } from "lucide-react";

type TicketPageProps = {
  params: Promise<{
    ticketCode: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: TicketPageProps) {
  const { ticketCode } = await params;
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    notFound();
  }

  const isPendingPayment = ticket.status === RegistrationStatus.PENDING;
  const qrSvg = isPendingPayment ? null : await createTicketQrSvg(ticket.ticketCode);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <Link
              href="/tickets"
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 hover:text-teal-950"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Cari tiket lain
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Tiket digital
            </h1>
          </div>

          <article className="overflow-hidden rounded-lg border border-stone-200 bg-[#fffdf8] shadow-xl">
            <div className="bg-stone-950 px-5 py-6 text-white">
              <p className="text-sm text-stone-300">Kode tiket</p>
              <p className="mt-2 break-all font-mono text-2xl font-semibold">{ticket.ticketCode}</p>
            </div>
            <div className="grid gap-5 p-5">
              <div>
                <p className="text-sm text-stone-500">Event</p>
                <h2 className="mt-1 text-xl font-semibold text-stone-950">{ticket.eventTitle}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-stone-500">Peserta</p>
                  <p className="mt-1 font-medium text-stone-950">{ticket.attendeeName}</p>
                  <p className="text-sm text-stone-600">{ticket.attendeeEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Status</p>
                  <p className="mt-1 font-medium text-stone-950">{ticket.status}</p>
                  <p className="text-sm text-stone-600">
                    {isPendingPayment
                      ? "Menunggu pembayaran"
                      : ticket.checkedIn
                        ? "Sudah check-in"
                        : "Belum check-in"}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50/80 p-4">
                <p className="text-sm text-stone-500">Harga tiket</p>
                <p className="mt-1 font-semibold text-stone-950">
                  {formatCurrency(ticket.eventPrice)}
                </p>
              </div>
              <div className="grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 text-sm text-stone-500">
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    Jadwal
                  </p>
                  <p className="mt-1 font-medium text-stone-950">
                    {formatEventDate(ticket.eventDate)} at {ticket.eventTime}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm text-stone-500">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Lokasi
                  </p>
                  <p className="mt-1 font-medium text-stone-950">{ticket.eventLocation}</p>
                </div>
              </div>
              {qrSvg ? (
                <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50/80 p-5 text-center">
                  <div
                    className="mx-auto flex h-64 w-64 max-w-full items-center justify-center rounded-md bg-white p-3 shadow-sm"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                  <p className="mt-4 font-mono text-sm font-semibold text-stone-950">
                    {ticket.ticketCode}
                  </p>
                  <p className="mt-2 inline-flex items-center justify-center gap-2 text-sm text-stone-600">
                    <QrCode className="h-4 w-4" aria-hidden="true" />
                    Tunjukkan QR code ini ke organizer saat check-in.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50/80 p-5 text-center">
                  <p className="font-mono text-sm font-semibold text-stone-950">
                    {ticket.ticketCode}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    Selesaikan pembayaran simulasi agar QR code aktif untuk check-in.
                  </p>
                </div>
              )}
              {isPendingPayment ? (
                <Link
                  href={`/payments/${ticket.ticketCode}`}
                  className="rounded-md bg-stone-950 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-stone-800"
                >
                  Lanjutkan pembayaran
                </Link>
              ) : null}
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
