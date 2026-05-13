import Link from "next/link";
import { createEvent } from "@/app/actions/events";
import { SiteHeader } from "@/components/shared/site-header";

export default function CreateEventPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <Link href="/" className="text-sm font-medium text-teal-700 hover:text-teal-900">
              Kembali ke daftar event
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Buat event baru
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Form organizer sementara untuk melanjutkan MVP sebelum autentikasi penuh ditambahkan.
            </p>
          </div>

          <form action={createEvent} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Judul</span>
                <input
                  name="title"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                  placeholder="Next.js Conference Makassar"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Deskripsi</span>
                <textarea
                  name="description"
                  required
                  rows={5}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                  placeholder="Jelaskan topik, target peserta, dan agenda utama event."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Tanggal</span>
                  <input
                    name="date"
                    type="date"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Waktu</span>
                  <input
                    name="time"
                    type="time"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Lokasi</span>
                <input
                  name="location"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                  placeholder="Alamat offline atau link online"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Harga tiket</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    defaultValue="0"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Kapasitas</span>
                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    defaultValue="50"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Banner URL</span>
                <input
                  name="image"
                  type="url"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Simpan event
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
