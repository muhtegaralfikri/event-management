import Link from "next/link";
import { logoutOrganizer } from "@/app/actions/organizer";
import { checkInTicket, getTicketByCode } from "@/app/actions/registrations";
import { OrganizerAccess } from "@/components/shared/organizer-access";
import { CheckInScanner } from "@/components/ui/check-in-scanner";
import { SiteHeader } from "@/components/shared/site-header";
import { formatEventDate } from "@/lib/format";
import { hasOrganizerPinConfigured, isOrganizerAuthorized } from "@/lib/organizer-auth";
import { ArrowLeft } from "lucide-react";

type CheckInPageProps = {
  searchParams: Promise<{
    result?: string;
    code?: string;
    auth?: string;
  }>;
};

export const dynamic = "force-dynamic";

const getResultCopy = (result?: string) => {
  if (result === "success") {
    return {
      title: "Check-in berhasil",
      description: "Tiket valid dan status kehadiran sudah diperbarui.",
      className: "border-emerald-200 bg-emerald-50 text-emerald-950",
    };
  }

  if (result === "duplicate") {
    return {
      title: "Tiket sudah pernah check-in",
      description: "Kode ini valid, tetapi peserta sudah ditandai hadir sebelumnya.",
      className: "border-amber-200 bg-amber-50 text-amber-950",
    };
  }

  if (result === "unpaid") {
    return {
      title: "Tiket belum aktif",
      description: "Registrasi masih menunggu pembayaran.",
      className: "border-rose-200 bg-rose-50 text-rose-950",
    };
  }

  if (result === "not-found") {
    return {
      title: "Tiket tidak ditemukan",
      description: "Kode QR tidak cocok dengan tiket yang tersimpan.",
      className: "border-rose-200 bg-rose-50 text-rose-950",
    };
  }

  if (result === "empty") {
    return {
      title: "Kode tiket kosong",
      description: "Scan QR code atau isi kode tiket secara manual.",
      className: "border-amber-200 bg-amber-50 text-amber-950",
    };
  }

  return null;
};

export default async function CheckInPage({ searchParams }: CheckInPageProps) {
  const { result, code, auth } = await searchParams;
  const isAuthorized = await isOrganizerAuthorized();
  const hasPin = hasOrganizerPinConfigured();
  const resultCopy = getResultCopy(result);
  let ticket = null as Awaited<ReturnType<typeof getTicketByCode>>;

  try {
    ticket = isAuthorized && code ? await getTicketByCode(code) : null;
  } catch {
    ticket = null;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          {!hasPin ? (
            <OrganizerAccess
              redirectTo="/organizer/check-in"
              title="PIN organizer belum dikonfigurasi"
              description="Set `ORGANIZER_CHECKIN_PIN` di environment agar halaman scan tiket tidak bisa diakses pengunjung."
            />
          ) : !isAuthorized ? (
            <OrganizerAccess
              redirectTo="/organizer/check-in"
              authState={auth}
              title="Akses organizer diperlukan"
              description="Scanner check-in hanya boleh dipakai di meja penyelenggara. Masukkan PIN organizer untuk membuka scanner."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-5">
                <div>
                  <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 hover:text-teal-950">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Kembali ke daftar event
                  </Link>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                    Scan tiket peserta
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Gunakan kamera untuk membaca QR code di tiket digital. Jika kamera tidak tersedia,
                    masukkan kode tiket secara manual.
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

                {resultCopy ? (
                  <div className={`rounded-lg border p-4 ${resultCopy.className}`}>
                    <h2 className="font-semibold">{resultCopy.title}</h2>
                    <p className="mt-1 text-sm">{resultCopy.description}</p>
                  </div>
                ) : null}

                {ticket ? (
                  <article className="rounded-lg border border-stone-200 bg-[#fffdf8] p-5 shadow-sm">
                    <p className="text-sm text-stone-500">Tiket terakhir</p>
                    <h2 className="mt-1 text-xl font-semibold text-stone-950">{ticket.eventTitle}</h2>
                    <div className="mt-4 grid gap-3 text-sm">
                      <div>
                        <p className="text-stone-500">Peserta</p>
                        <p className="font-medium text-stone-950">{ticket.attendeeName}</p>
                        <p className="text-stone-600">{ticket.attendeeEmail}</p>
                      </div>
                      <div>
                        <p className="text-stone-500">Jadwal</p>
                        <p className="font-medium text-stone-950">
                          {formatEventDate(ticket.eventDate)} at {ticket.eventTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-500">Status</p>
                        <p className="font-medium text-stone-950">
                          {ticket.status} / {ticket.checkedIn ? "Sudah check-in" : "Belum check-in"}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-500">Kode</p>
                        <p className="break-all font-mono font-semibold text-stone-950">
                          {ticket.ticketCode}
                        </p>
                      </div>
                    </div>
                  </article>
                ) : code ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
                    <p className="font-semibold">Detail tiket tidak bisa dimuat.</p>
                    <p className="mt-1 text-sm">
                      Periksa koneksi database di Vercel atau coba scan ulang setelah database aktif.
                    </p>
                  </div>
                ) : null}
              </div>

              <CheckInScanner action={checkInTicket} />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
