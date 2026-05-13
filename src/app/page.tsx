import { getActiveEvents } from "@/app/actions/events";
import { SiteHeader } from "@/components/shared/site-header";
import { EventCard } from "@/components/ui/event-card";
import { CalendarCheck, CreditCard, QrCode, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getActiveEvents();
  const paidEvents = events.filter((event) => Number(event.price) > 0).length;
  const freeEvents = events.length - paidEvents;
  const registeredCount = events.reduce((total, event) => total + event.registeredCount, 0);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <section className="border-b border-stone-200/80">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
            <div className="flex flex-col justify-center gap-6">
              <div className="space-y-4">
                <p className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-700/20 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-900">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  Event operations platform
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
                  Kelola pendaftaran event tanpa antrean manual.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                  Peserta menemukan event, mendaftar, membayar bila perlu, lalu menunjukkan tiket QR
                  untuk check-in di meja organizer.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-stone-200 bg-[#fffdf8] p-4 shadow-sm">
                  <p className="text-sm text-stone-500">Event aktif</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-950">{events.length}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fffdf8] p-4 shadow-sm">
                  <p className="text-sm text-stone-500">Registrasi</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-950">{registeredCount}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fffdf8] p-4 shadow-sm">
                  <p className="text-sm text-stone-500">Gratis / bayar</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-950">
                    {freeEvents}/{paidEvents}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-950 p-4 text-white shadow-xl sm:grid-cols-2">
              <div className="rounded-md bg-white/10 p-4">
                <Ticket className="h-5 w-5 text-amber-300" aria-hidden="true" />
                <p className="mt-8 text-sm text-stone-300">Registrasi</p>
                <p className="mt-1 text-lg font-semibold">Tiket digital langsung tersedia</p>
              </div>
              <div className="rounded-md bg-white/10 p-4">
                <CreditCard className="h-5 w-5 text-teal-300" aria-hidden="true" />
                <p className="mt-8 text-sm text-stone-300">Pembayaran</p>
                <p className="mt-1 text-lg font-semibold">Flow gratis dan berbayar terpisah</p>
              </div>
              <div className="rounded-md bg-white/10 p-4 sm:col-span-2">
                <QrCode className="h-5 w-5 text-white" aria-hidden="true" />
                <p className="mt-8 text-sm text-stone-300">Check-in</p>
                <p className="mt-1 text-lg font-semibold">
                  Organizer memvalidasi QR dengan mode scanner ber-PIN
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Event tersedia</h2>
              <p className="mt-1 text-sm text-stone-600">Pilih event untuk melihat detail dan mendaftar.</p>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-[#fffdf8] p-8 text-center">
              <h3 className="text-lg font-semibold text-stone-950">Belum ada event.</h3>
              <p className="mt-2 text-sm text-stone-600">
                Buat event pertama dari menu organizer untuk mulai mengisi landing page.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
