import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketByCode, payRegistration } from "@/app/actions/registrations";
import { RegistrationStatus } from "@/generated/prisma/enums";
import { SiteHeader } from "@/components/shared/site-header";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { ArrowLeft, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Pembayaran Tiket | EventTix",
  description: "Selesaikan pembayaran tiket event Anda.",
};

type PaymentPageProps = {
  params: Promise<{
    ticketCode: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { ticketCode } = await params;
  let ticket: Awaited<ReturnType<typeof getTicketByCode>> = null;
  let databaseUnavailable = false;

  try {
    ticket = await getTicketByCode(ticketCode);
  } catch {
    databaseUnavailable = true;
  }

  if (!ticket) {
    if (!databaseUnavailable) {
      return notFound();
    }

    return (
      <>
        <SiteHeader />
        <main className="min-h-screen">
          <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
              <h1 className="text-2xl font-semibold">Pembayaran belum bisa dimuat</h1>
              <p className="mt-2 text-sm leading-6">
                Coba muat ulang halaman dalam beberapa saat.
              </p>
            </div>
          </section>
        </main>
      </>
    );
  }

  const isPaid = ticket.status === RegistrationStatus.PAID;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <Link
              href={`/events/${ticket.eventSlug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 hover:text-teal-950"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali ke detail event
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Pembayaran tiket
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Konfirmasi pembayaran untuk mengaktifkan tiket QR Anda.
            </p>
          </div>

          <article className="rounded-lg border border-stone-200 bg-[#fffdf8] p-5 shadow-xl">
            <div className="grid gap-5">
              <div>
                <p className="text-sm text-stone-500">Event</p>
                <h2 className="mt-1 text-xl font-semibold text-stone-950">{ticket.eventTitle}</h2>
                <p className="mt-1 text-sm text-stone-600">
                  {formatEventDate(ticket.eventDate)} at {ticket.eventTime}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-stone-200 bg-stone-50/80 p-4">
                  <p className="text-sm text-stone-500">Peserta</p>
                  <p className="mt-1 font-medium text-stone-950">{ticket.attendeeName}</p>
                  <p className="text-sm text-stone-600">{ticket.attendeeEmail}</p>
                </div>
                <div className="rounded-lg border border-teal-700/20 bg-teal-50 p-4">
                  <p className="flex items-center gap-2 text-sm text-teal-900">
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                    Total bayar
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-stone-950">
                    {formatCurrency(ticket.eventPrice)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 p-4">
                <p className="text-sm text-stone-500">Kode tiket</p>
                <p className="mt-1 break-all font-mono font-semibold text-stone-950">
                  {ticket.ticketCode}
                </p>
                <p className="mt-3 text-sm text-stone-600">
                  Status saat ini: <span className="font-medium text-stone-950">{ticket.status}</span>
                </p>
              </div>

              {isPaid ? (
                <Link
                  href={`/tickets/${ticket.ticketCode}`}
                  className="rounded-md bg-stone-950 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-stone-800"
                >
                  Lihat tiket
                </Link>
              ) : (
                <form action={payRegistration}>
                  <input type="hidden" name="ticketCode" value={ticket.ticketCode} />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
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
