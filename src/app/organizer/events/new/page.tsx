import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createEvent } from "@/app/actions/events";
import { auth } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/enums";
import { SiteHeader } from "@/components/shared/site-header";
import { InputField } from "@/components/ui/input-field";

export const metadata: Metadata = {
  title: "Buat Event Baru | EventTix",
  description: "Form organizer untuk membuat event baru di EventTix.",
};

export default async function CreateEventPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    redirect("/login");
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#fffdf8]">
        <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6 border-b border-stone-200 pb-6">
            <Link href="/organizer/dashboard" className="text-sm font-medium text-teal-700 hover:text-teal-900">
              &larr; Kembali ke Dashboard
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
              Buat Event Baru
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Isi formulir di bawah ini untuk mempublikasikan event Anda.
            </p>
          </div>

          <form
            action={createEvent}
            className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 space-y-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField
                  label="Nama Event"
                  name="title"
                  required
                  placeholder="Contoh: Tech Conference 2024"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-stone-700">
                  Deskripsi Event
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  required
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                  placeholder="Jelaskan detail event Anda..."
                />
              </div>

              <InputField
                label="Tanggal"
                name="date"
                type="date"
                required
              />
              
              <InputField
                label="Waktu"
                name="time"
                type="time"
                required
              />

              <div className="sm:col-span-2">
                <InputField
                  label="Lokasi"
                  name="location"
                  required
                  placeholder="Contoh: Gedung Serbaguna, Jakarta"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-stone-700">Kategori Event</label>
                <select
                  name="category"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 bg-white"
                >
                  <option value="TECHNOLOGY">Technology</option>
                  <option value="BUSINESS">Business</option>
                  <option value="DESIGN">Design</option>
                  <option value="COMMUNITY">Community</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="SEMINAR">Seminar</option>
                  <option value="NETWORKING">Networking</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <InputField
                label="Harga Tiket (Rp)"
                name="price"
                type="number"
                min="0"
                step="1000"
                defaultValue="0"
                required
                helperText="Isi 0 untuk event gratis"
              />

              <InputField
                label="Kapasitas"
                name="capacity"
                type="number"
                min="1"
                defaultValue="50"
                required
                helperText="Jumlah maksimal peserta"
              />

              <div className="sm:col-span-2">
                <InputField
                  label="URL Banner / Gambar (Opsional)"
                  name="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  helperText="Link gambar untuk banner event"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
              >
                Buat Event
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
