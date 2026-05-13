import Link from "next/link";
import { findTicket, getTicketsByEmail } from "@/app/actions/registrations";
import { SiteHeader } from "@/components/shared/site-header";
import { formatEventDate } from "@/lib/format";

type TicketsLookupPageProps = {
  searchParams: Promise<{
    email?: string;
    result?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function TicketsLookupPage({ searchParams }: TicketsLookupPageProps) {
  const { email, result } = await searchParams;
  const tickets = email ? await getTicketsByEmail(email) : [];

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Cari tiket</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gunakan kode tiket jika masih tersimpan. Jika lupa, masukkan email yang dipakai saat
              registrasi untuk melihat daftar tiket.
            </p>

            <form action={findTicket} className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Kode tiket</span>
                  <input
                    name="ticketCode"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-teal-700"
                    placeholder="EVT-XXX-12345678"
                  />
                </label>

                <div className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                  atau
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email registrasi</span>
                  <input
                    name="email"
                    type="email"
                    defaultValue={email}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                    placeholder="nama@email.com"
                  />
                </label>
              </div>

              {result === "empty" ? (
                <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Isi kode tiket atau email terlebih dahulu.
                </p>
              ) : null}

              <button
                type="submit"
                className="mt-5 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Cari tiket
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Hasil pencarian</h2>
            {!email ? (
              <p className="mt-2 text-sm text-slate-600">
                Masukkan email untuk menampilkan tiket yang pernah didaftarkan.
              </p>
            ) : tickets.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">
                Tidak ada tiket untuk email <span className="font-medium">{email}</span>.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {tickets.map((ticket) => (
                  <article
                    key={ticket.ticketCode}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-950">{ticket.eventTitle}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatEventDate(ticket.eventDate)} at {ticket.eventTime}
                        </p>
                        <p className="mt-2 font-mono text-sm font-medium text-slate-950">
                          {ticket.ticketCode}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {ticket.status} / {ticket.checkedIn ? "Sudah check-in" : "Belum check-in"}
                        </p>
                      </div>
                      <Link
                        href={`/tickets/${ticket.ticketCode}`}
                        className="rounded-md bg-slate-950 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Buka tiket
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
