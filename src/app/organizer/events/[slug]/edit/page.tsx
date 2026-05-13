import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { EventCategory, UserRole } from "@/generated/prisma/enums";
import { SiteHeader } from "@/components/shared/site-header";
import { updateEvent } from "@/app/actions/event-management";
import { InputField } from "@/components/ui/input-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { format } from "date-fns";

export const metadata = {
  title: "Edit Event | EventTix",
};

const eventCategories = [
  { value: EventCategory.TECHNOLOGY, label: "Technology" },
  { value: EventCategory.BUSINESS, label: "Business" },
  { value: EventCategory.DESIGN, label: "Design" },
  { value: EventCategory.COMMUNITY, label: "Community" },
  { value: EventCategory.WORKSHOP, label: "Workshop" },
  { value: EventCategory.SEMINAR, label: "Seminar" },
  { value: EventCategory.NETWORKING, label: "Networking" },
  { value: EventCategory.OTHER, label: "Other" },
];

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    redirect("/login");
  }

  const { slug } = await params;
  const prisma = getPrisma();
  
  const event = await prisma.event.findUnique({
    where: { slug }
  });

  if (!event || event.organizerId !== session.user.id) {
    notFound();
  }

  const formattedDate = format(event.date, "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 border-b border-stone-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
            Edit Event
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Ubah detail event <span className="font-medium text-stone-900">{event.title}</span>.
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await updateEvent(event.id, formData);
          }}
          className="space-y-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <InputField
                label="Nama Event"
                name="title"
                defaultValue={event.title}
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
                defaultValue={event.description}
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
              defaultValue={formattedDate}
              required
            />
            
            <InputField
              label="Waktu"
              name="time"
              type="time"
              defaultValue={event.time}
              required
            />

            <div className="sm:col-span-2">
              <InputField
                label="Lokasi"
                name="location"
                defaultValue={event.location}
                required
                placeholder="Contoh: Gedung Serbaguna, Jakarta"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-stone-700">Kategori Event</label>
              <select
                name="category"
                defaultValue={event.category}
                required
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              >
                {eventCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label="Harga Tiket (Rp)"
              name="price"
              type="number"
              min="0"
              step="1000"
              defaultValue={event.price.toString()}
              required
              helperText="Isi 0 untuk event gratis"
            />

            <InputField
              label="Kapasitas"
              name="capacity"
              type="number"
              min="1"
              defaultValue={event.capacity.toString()}
              required
              helperText="Jumlah maksimal peserta"
            />

            <div className="sm:col-span-2">
              <InputField
                label="URL Banner / Gambar (Opsional)"
                name="image"
                type="url"
                defaultValue={event.image || ""}
                placeholder="https://example.com/image.jpg"
                helperText="Link gambar untuk banner event"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
            <a
              href="/organizer/dashboard"
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Batal
            </a>
            <SubmitButton
              pendingText="Menyimpan..."
              className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-75"
            >
              Simpan Perubahan
            </SubmitButton>
          </div>
        </form>
      </main>
    </div>
  );
}
