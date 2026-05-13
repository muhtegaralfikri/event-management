import Link from "next/link";
import { createEvent } from "@/app/actions/events";
import { logoutOrganizer } from "@/app/actions/organizer";
import { OrganizerAccess } from "@/components/shared/organizer-access";
import { SiteHeader } from "@/components/shared/site-header";
import { hasOrganizerPinConfigured, isOrganizerAuthorized } from "@/lib/organizer-auth";

type CreateEventPageProps = {
  searchParams: Promise<{
    auth?: string;
  }>;
};

export default async function CreateEventPage({ searchParams }: CreateEventPageProps) {
  const { auth } = await searchParams;
  const isAuthorized = await isOrganizerAuthorized();
  const hasPin = hasOrganizerPinConfigured();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen ">
        <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          {!hasPin ? (
            <OrganizerAccess
              redirectTo="/organizer/events/new"
              title="PIN organizer belum dikonfigurasi"
              description="Set `ORGANIZER_CHECKIN_PIN` di environment agar halaman organizer tidak bisa dipakai bebas."
            />
          ) : !isAuthorized ? (
            <OrganizerAccess
              redirectTo="/organizer/events/new"
              authState={auth}
              title="Akses organizer diperlukan"
              description="Masukkan PIN organizer sebelum membuat event atau mengakses halaman operasional."
            />
          ) : (
            <>
              <div className="mb-6">
                <Link href="/" className="text-sm font-medium text-teal-700 hover:text-teal-900">
                  Kembali ke daftar event
                </Link>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
                  Buat event baru
                </h1>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Form organizer sementara untuk melanjutkan MVP sebelum autentikasi penuh ditambahkan.
                </p>
                <form action={logoutOrganizer} className="mt-4">
                  <button
                    type="submit"
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Keluar dari mode organizer
                  </button>
                </form>
              </div>

              <form
                action={createEvent}
                className="rounded-lg border border-stone-200 bg-[#fffdf8] p-5 shadow-sm"
              >
                <div className="grid gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">Judul</span>
                    <input
                      name="title"
                      required
                      className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                      placeholder="Next.js Conference Makassar"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">Deskripsi</span>
                    <textarea
                      name="description"
                      required
                      rows={5}
                      className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                      placeholder="Jelaskan topik, target peserta, dan agenda utama event."
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-stone-700">Tanggal</span>
                      <input
                        name="date"
                        type="date"
                        required
                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-stone-700">Waktu</span>
                      <input
                        name="time"
                        type="time"
                        required
                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">Lokasi</span>
                    <input
                      name="location"
                      required
                      className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                      placeholder="Alamat offline atau link online"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-stone-700">Harga tiket</span>
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="1000"
                        defaultValue="0"
                        required
                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-stone-700">Kapasitas</span>
                      <input
                        name="capacity"
                        type="number"
                        min="1"
                        defaultValue="50"
                        required
                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">Banner URL</span>
                    <input
                      name="image"
                      type="url"
                      className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                      placeholder="https://..."
                    />
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
                  >
                    Simpan event
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </>
  );
}

