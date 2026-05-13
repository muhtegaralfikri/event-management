import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketByCode, payRegistration } from "@/app/actions/registrations";
import { RegistrationStatus } from "@/generated/prisma/enums";
import { SiteHeader } from "@/components/shared/site-header";
import { formatCurrency, formatEventDate } from "@/lib/format";

type PaymentPageProps = {
  params: Promise<{
    ticketCode: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { ticketCode } = await params;
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    notFound();
  }

  const isPaid = ticket.status === RegistrationStatus.PAID;

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
              Pembayaran tiket
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ini adalah pembayaran simulasi untuk MVP sebelum integrasi Midtrans sandbox.
            </p>
          </div>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5">
              <div>
                <p className="text-sm text-slate-500">Event</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{ticket.eventTitle}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {formatEventDate(ticket.eventDate)} at {ticket.eventTime}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Peserta</p>
                  <p className="mt-1 font-medium text-slate-950">{ticket.attendeeName}</p>
                  <p className="text-sm text-slate-600">{ticket.attendeeEmail}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total bayar</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">
                    {formatCurrency(ticket.eventPrice)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Kode tiket</p>
                <p className="mt-1 break-all font-mono font-semibold text-slate-950">
                  {ticket.ticketCode}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Status saat ini: <span className="font-medium text-slate-950">{ticket.status}</span>
                </p>
              </div>

              {isPaid ? (
                <Link
                  href={`/tickets/${ticket.ticketCode}`}
                  className="rounded-md bg-slate-950 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Lihat tiket
                </Link>
              ) : (
                <form action={payRegistration}>
                  <input type="hidden" name="ticketCode" value={ticket.ticketCode} />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Bayar sekarang
                  </button>
                </form>
              )}
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
