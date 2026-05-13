import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import { createPromoCode } from "@/app/actions/promo";
import { SiteHeader } from "@/components/shared/site-header";
import { InputField } from "@/components/ui/input-field";

export const metadata = {
  title: "Buat Promo Code | EventTix",
};

export default async function CreatePromoPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    redirect("/login");
  }

  const prisma = getPrisma();
  const events = await prisma.event.findMany({
    where: { organizerId: session.user.id, status: "ACTIVE" },
    select: { id: true, title: true }
  });

  return (
    <div className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 border-b border-stone-200 pb-6">
          <Link href="/organizer/dashboard" className="text-sm font-medium text-teal-700 hover:text-teal-900">
            &larr; Kembali ke Dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
            Buat Kode Promo
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Berikan diskon kepada peserta untuk event Anda.
          </p>
        </div>

        <form
          action={createPromoCode}
          className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <InputField
            label="Kode Promo"
            name="code"
            required
            placeholder="EARLYBIRD50"
            helperText="Gunakan huruf dan angka tanpa spasi."
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Tipe Diskon</label>
              <select
                name="discountType"
                className="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 bg-white"
              >
                <option value="PERCENT">Persentase (%)</option>
                <option value="AMOUNT">Potongan Harga (Rp)</option>
              </select>
            </div>
            
            <InputField
              label="Nilai Diskon"
              name="discountValue"
              type="number"
              min="1"
              required
              placeholder="Contoh: 50 atau 10000"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <InputField
              label="Batas Penggunaan"
              name="maxUses"
              type="number"
              min="0"
              defaultValue="0"
              helperText="Isi 0 untuk penggunaan tanpa batas"
            />

            <InputField
              label="Tanggal Kadaluarsa (Opsional)"
              name="expiresAt"
              type="date"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Berlaku untuk Event</label>
            <select
              name="eventId"
              className="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 bg-white"
            >
              <option value="">Semua Event Saya</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Simpan Promo
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
