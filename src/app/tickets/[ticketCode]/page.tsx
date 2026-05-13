import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketByCode } from "@/app/actions/registrations";
import { SiteHeader } from "@/components/shared/site-header";
import { formatEventDate } from "@/lib/format";

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

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <Link
              href={`/events/${ticket.eventSlug}`}
              className="text-sm font-medium text-teal-700 hover:text-teal-900"
            >
              Kembali ke detail event
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Tiket digital
            </h1>
          </div>

          <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-950 px-5 py-6 text-white">
              <p className="text-sm text-slate-300">Kode tiket</p>
              <p className="mt-2 break-all font-mono text-2xl font-semibold">{ticket.ticketCode}</p>
            </div>
            <div className="grid gap-5 p-5">
              <div>
                <p className="text-sm text-slate-500">Event</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{ticket.eventTitle}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Peserta</p>
                  <p className="mt-1 font-medium text-slate-950">{ticket.attendeeName}</p>
                  <p className="text-sm text-slate-600">{ticket.attendeeEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="mt-1 font-medium text-slate-950">{ticket.status}</p>
                  <p className="text-sm text-slate-600">
                    {ticket.checkedIn ? "Sudah check-in" : "Belum check-in"}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Jadwal</p>
                  <p className="mt-1 font-medium text-slate-950">
                    {formatEventDate(ticket.eventDate)} at {ticket.eventTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lokasi</p>
                  <p className="mt-1 font-medium text-slate-950">{ticket.eventLocation}</p>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="font-mono text-sm font-semibold text-slate-950">{ticket.ticketCode}</p>
                <p className="mt-2 text-sm text-slate-600">
                  QR code akan memakai kode ini pada iterasi check-in berikutnya.
                </p>
              </div>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
