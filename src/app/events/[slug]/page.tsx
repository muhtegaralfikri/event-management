import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventDetailBySlug } from "@/app/actions/events";
import { registerForEvent } from "@/app/actions/registrations";
import { SiteHeader } from "@/components/shared/site-header";
import { formatCurrency, formatEventDate } from "@/lib/format";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }: EventDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
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
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventDetailBySlug(slug);

  if (!event) {
    notFound();
  }

  const remainingSeats = Math.max(event.capacity - event.registeredCount, 0);
  const isFreeEvent = Number(event.price) === 0;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Link href="/" className="text-sm font-medium text-teal-700 hover:text-teal-900">
                Kembali ke daftar event
              </Link>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                  {formatEventDate(event.date)} at {event.time}
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {event.title}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600">{event.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Harga</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatCurrency(event.price)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Kapasitas</p>
                  <p className="mt-1 font-semibold text-slate-950">{event.capacity} peserta</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Sisa kursi</p>
                  <p className="mt-1 font-semibold text-slate-950">{remainingSeats}</p>
                </div>
              </div>
            </div>
            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Daftar event</h2>
              <p className="mt-1 text-sm text-slate-600">
                {isFreeEvent
                  ? "Event gratis akan langsung menerbitkan tiket digital."
                  : "Event berbayar akan masuk ke pembayaran simulasi sebelum tiket aktif."}
              </p>
              <form action={registerForEvent} className="mt-5 space-y-4">
                <input type="hidden" name="eventId" value={event.id} />
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Nama</span>
                  <input
                    name="name"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                    placeholder="Nama peserta"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                    placeholder="nama@email.com"
                  />
                </label>
                <button
                  type="submit"
                  disabled={remainingSeats === 0}
                  className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {remainingSeats === 0
                    ? "Kapasitas penuh"
                    : isFreeEvent
                      ? "Daftar gratis"
                      : "Lanjut ke pembayaran"}
                </button>
              </form>
              <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <p className="font-medium text-slate-950">{event.location}</p>
                <p className="mt-2">Organizer: {event.organizerName}</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
