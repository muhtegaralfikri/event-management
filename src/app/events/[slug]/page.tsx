import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventDetailBySlug } from "@/app/actions/events";
import { registerForEvent } from "@/app/actions/registrations";
import { SiteHeader } from "@/components/shared/site-header";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { formatEventCategory } from "@/lib/event-category";
import { ArrowLeft, CalendarClock, CheckCircle2, MapPin, ShieldCheck, Ticket, Users } from "lucide-react";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }: EventDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  try {
    const event = await getEventDetailBySlug(slug);

    if (!event) {
      return {
        title: "Event tidak ditemukan | EventTix",
      };
    }

    return {
      title: `${event.title} | EventTix`,
      description: event.description,
    };
  } catch {
    return {
      title: "Event Tix | EventTix",
    };
  }
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  let event: Awaited<ReturnType<typeof getEventDetailBySlug>> = null;
  let databaseUnavailable = false;

  try {
    event = await getEventDetailBySlug(slug);
  } catch {
    databaseUnavailable = true;
  }

  if (!event) {
    if (!databaseUnavailable) {
      return notFound();
    }

    return (
      <>
        <SiteHeader />
        <main className="min-h-screen">
          <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
              <h1 className="text-2xl font-semibold">Detail event belum bisa dimuat</h1>
              <p className="mt-2 text-sm leading-6">
                Cek koneksi database di Vercel. Jika <code>DATABASE_URL</code> tidak tersedia atau
                database tidak bisa diakses, halaman ini akan berhenti di sini.
              </p>
            </div>
          </section>
        </main>
      </>
    );
  }

  const remainingSeats = Math.max(event.capacity - event.registeredCount, 0);
  const isFreeEvent = Number(event.price) === 0;
  const isOnlineEvent = event.location.startsWith("http");

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <section className="border-b border-stone-200/80">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.18fr_0.82fr] lg:py-10">
            <div className="space-y-6">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 hover:text-teal-950">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Kembali ke daftar event
              </Link>
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-900 shadow-xl">
                <div
                  className="aspect-[16/10] bg-cover bg-center sm:aspect-[16/7]"
                  style={{
                    backgroundImage: event.image
                      ? `linear-gradient(180deg,rgba(24,32,29,0.05),rgba(24,32,29,0.62)),url(${event.image})`
                      : "linear-gradient(135deg,#14342f,#0f766e,#b45309)",
                  }}
                />
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <p className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-900">
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    {formatEventDate(event.date)} at {event.time}
                  </p>
                  <p className="inline-flex items-center rounded-md bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-800">
                    {formatEventCategory(event.category)}
                  </p>
                  <p className="inline-flex items-center rounded-md bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">
                    {isFreeEvent ? "Gratis" : "Berbayar"}
                  </p>
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  {event.title}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-stone-600">{event.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-stone-200 bg-[#fffdf8] p-4 shadow-sm">
                  <p className="flex items-center gap-2 text-sm text-stone-500">
                    <Ticket className="h-4 w-4" aria-hidden="true" />
                    Harga
                  </p>
                  <p className="mt-2 font-semibold text-stone-950">{formatCurrency(event.price)}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fffdf8] p-4 shadow-sm">
                  <p className="flex items-center gap-2 text-sm text-stone-500">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Kapasitas
                  </p>
                  <p className="mt-2 font-semibold text-stone-950">{event.capacity} peserta</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fffdf8] p-4 shadow-sm">
                  <p className="text-sm text-stone-500">Sisa kursi</p>
                  <p className="mt-2 font-semibold text-stone-950">{remainingSeats}</p>
                </div>
              </div>
            </div>
            <aside id="registration" className="scroll-mt-24 h-fit rounded-lg border border-stone-200 bg-[#fffdf8] p-5 shadow-xl lg:sticky lg:top-24">
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <p className="text-sm text-stone-500">Harga tiket</p>
                <p className="mt-1 text-2xl font-semibold text-stone-950">
                  {isFreeEvent ? "Gratis" : formatCurrency(event.price)}
                </p>
                <p className="mt-1 text-sm text-stone-500">{remainingSeats} kursi tersisa</p>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-stone-950">Daftar event</h2>
              <p className="mt-1 text-sm text-stone-600">
                {isFreeEvent
                  ? "Event gratis akan langsung menerbitkan tiket digital."
                  : "Event berbayar akan masuk ke pembayaran simulasi sebelum tiket aktif."}
              </p>
              <form action={registerForEvent} className="mt-5 space-y-4">
                <input type="hidden" name="eventId" value={event.id} />
                {/* Honeypot: field tersembunyi anti-bot. Hanya bot yang mengisinya. */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}>
                  <label htmlFor="website">Jangan diisi</label>
                  <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>
                <label className="block">
                  <span className="text-sm font-medium text-stone-700">Nama</span>
                  <input
                    name="name"
                    required
                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                    placeholder="Nama peserta"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-stone-700">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                    placeholder="nama@email.com"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-stone-700">Kode Promo (Opsional)</span>
                  <input
                    name="promoCode"
                    type="text"
                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700 uppercase"
                    placeholder="Contoh: PROMO50"
                  />
                </label>
                <button
                  type="submit"
                  disabled={remainingSeats === 0}
                  className="w-full rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {remainingSeats === 0
                    ? "Kapasitas penuh"
                    : isFreeEvent
                      ? "Daftar gratis"
                      : "Lanjut ke pembayaran"}
                </button>
              </form>
              <div className="mt-5 space-y-3 border-t border-stone-100 pt-4 text-sm text-stone-600">
                <p className="flex gap-2 font-medium text-stone-950">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                  <span>Tiket QR digital tersedia setelah registrasi berhasil.</span>
                </p>
                <p className="flex gap-2 font-medium text-stone-950">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                  <span>Check-in diverifikasi oleh organizer di lokasi event.</span>
                </p>
                <p className="flex gap-2 font-medium text-stone-950">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{isOnlineEvent ? "Online event" : event.location}</span>
                </p>
                <p className="mt-2">Organizer: {event.organizerName}</p>
              </div>
            </aside>
          </div>
        </section>
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(24,32,29,0.08)] backdrop-blur lg:hidden">
          <a
            href="#registration"
            className="flex items-center justify-center rounded-md bg-stone-950 px-4 py-3 text-sm font-semibold text-white"
          >
            {remainingSeats === 0 ? "Kapasitas penuh" : isFreeEvent ? "Daftar gratis" : "Daftar dan bayar"}
          </a>
        </div>
      </main>
    </>
  );
}
