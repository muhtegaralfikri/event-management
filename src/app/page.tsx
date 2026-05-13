import { getActiveEvents } from "@/app/actions/events";
import { SiteHeader } from "@/components/shared/site-header";
import { EventCard } from "@/components/ui/event-card";
import { CalendarCheck, CreditCard, QrCode, Ticket, Search as SearchIcon } from "lucide-react";
import { EventCategory } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const { search = "", category = "ALL" } = await searchParams;
  
  let events: Awaited<ReturnType<typeof getActiveEvents>> = [];
  let databaseError: string | null = null;

  try {
    events = await getActiveEvents(search, category);
  } catch (error) {
    databaseError = error instanceof Error ? error.message : "Koneksi database gagal.";
  }

  const paidEvents = events.filter((event) => Number(event.price) > 0).length;
  const freeEvents = events.length - paidEvents;
  const registeredCount = events.reduce((total, event) => total + event.registeredCount, 0);

  const categories = ["ALL", ...Object.values(EventCategory)];

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#fffdf8]">
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
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-stone-500">Event aktif</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-950">{events.length}</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-stone-500">Registrasi</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-950">{registeredCount}</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-stone-500">Gratis / bayar</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-950">
                    {freeEvents}/{paidEvents}
                  </p>
                </div>
              </div>
              {databaseError ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <p className="font-semibold">Data event belum bisa dimuat.</p>
                  <p className="mt-1">
                    Periksa environment Vercel, terutama <code>DATABASE_URL</code> dan koneksi PostgreSQL.
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-amber-900">{databaseError}</p>
                </div>
              ) : null}
            </div>
            <div className="grid gap-3 rounded-xl border border-stone-200 bg-stone-950 p-6 text-white shadow-xl sm:grid-cols-2">
              <div className="rounded-lg bg-white/10 p-5">
                <Ticket className="h-6 w-6 text-amber-300" aria-hidden="true" />
                <p className="mt-8 text-sm text-stone-300">Registrasi</p>
                <p className="mt-1 text-lg font-semibold">Tiket digital langsung tersedia</p>
              </div>
              <div className="rounded-lg bg-white/10 p-5">
                <CreditCard className="h-6 w-6 text-teal-300" aria-hidden="true" />
                <p className="mt-8 text-sm text-stone-300">Pembayaran</p>
                <p className="mt-1 text-lg font-semibold">Flow gratis dan berbayar terpisah</p>
              </div>
              <div className="rounded-lg bg-white/10 p-5 sm:col-span-2">
                <QrCode className="h-6 w-6 text-white" aria-hidden="true" />
                <p className="mt-8 text-sm text-stone-300">Check-in</p>
                <p className="mt-1 text-lg font-semibold">
                  Organizer memvalidasi QR dengan mode scanner ber-PIN
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Event tersedia</h2>
              <p className="mt-1 text-sm text-stone-600">Pilih event untuk melihat detail dan mendaftar.</p>
            </div>
            
            {/* Search and Filter */}
            <form className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Cari event..."
                  className="w-full rounded-md border border-stone-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 md:w-64"
                />
              </div>
              <select
                name="category"
                defaultValue={category}
                className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "Semua Kategori" : c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Category Chips (Mobile friendly) */}
          <div className="mb-8 flex flex-wrap gap-2 md:hidden">
            {categories.slice(0, 5).map((c) => (
              <a
                key={c}
                href={`/?category=${c}`}
                className={`rounded-full px-3 py-1 text-xs font-medium border ${
                  category === c 
                    ? "bg-teal-700 border-teal-700 text-white" 
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {c === "ALL" ? "Semua" : c}
              </a>
            ))}
          </div>

          {databaseError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
              <h3 className="text-lg font-semibold">Database belum terhubung</h3>
              <p className="mt-2 text-sm leading-6">
                Halaman ini membutuhkan <code>DATABASE_URL</code> yang valid di Vercel dan database
                PostgreSQL yang bisa diakses dari internet.
              </p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-stone-950">Belum ada event.</h3>
              <p className="mt-2 text-sm text-stone-600">
                {search || category !== "ALL" 
                  ? "Coba sesuaikan kata kunci atau filter kategori Anda." 
                  : "Buat event pertama dari menu organizer untuk mulai mengisi landing page."}
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
