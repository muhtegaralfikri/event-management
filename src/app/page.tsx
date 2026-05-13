import { getActiveEvents } from "@/app/actions/events";
import { SiteHeader } from "@/components/shared/site-header";
import { EventCard } from "@/components/ui/event-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getActiveEvents();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                Event management system
              </p>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Temukan event, daftar, dan dapatkan tiket digital dalam satu alur.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  EventTix membantu organizer mengelola event dan attendee mendaftar tanpa proses
                  manual yang berulang.
                </p>
              </div>
            </div>
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <div className="rounded-md bg-white/10 p-4">
                <p className="text-sm text-slate-300">Event aktif</p>
                <p className="mt-2 text-3xl font-semibold">{events.length}</p>
              </div>
              <div className="rounded-md bg-white/10 p-4">
                <p className="text-sm text-slate-300">Fitur MVP</p>
                <p className="mt-2 font-medium">Discovery, detail event, registrasi, e-ticket</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Event terbaru</h2>
              <p className="mt-1 text-sm text-slate-600">Daftar event yang tersedia untuk peserta.</p>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-950">Belum ada event.</h3>
              <p className="mt-2 text-sm text-slate-600">
                Buat event pertama dari menu organizer untuk mulai mengisi landing page.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
