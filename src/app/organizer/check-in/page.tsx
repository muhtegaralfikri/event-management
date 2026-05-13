import Link from "next/link";
import { checkInTicket, getTicketByCode } from "@/app/actions/registrations";
import { CheckInScanner } from "@/components/ui/check-in-scanner";
import { SiteHeader } from "@/components/shared/site-header";
import { formatEventDate } from "@/lib/format";

type CheckInPageProps = {
  searchParams: Promise<{
    result?: string;
    code?: string;
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
  const { result, code } = await searchParams;
  const resultCopy = getResultCopy(result);
  const ticket = code ? await getTicketByCode(code) : null;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div>
              <Link href="/" className="text-sm font-medium text-teal-700 hover:text-teal-900">
                Kembali ke daftar event
              </Link>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Scan tiket peserta
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Gunakan kamera untuk membaca QR code di tiket digital. Jika kamera tidak tersedia,
                masukkan kode tiket secara manual.
              </p>
            </div>

            {resultCopy ? (
              <div className={`rounded-lg border p-4 ${resultCopy.className}`}>
                <h2 className="font-semibold">{resultCopy.title}</h2>
                <p className="mt-1 text-sm">{resultCopy.description}</p>
              </div>
            ) : null}

            {ticket ? (
              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Tiket terakhir</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{ticket.eventTitle}</h2>
                <div className="mt-4 grid gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Peserta</p>
                    <p className="font-medium text-slate-950">{ticket.attendeeName}</p>
                    <p className="text-slate-600">{ticket.attendeeEmail}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Jadwal</p>
                    <p className="font-medium text-slate-950">
                      {formatEventDate(ticket.eventDate)} at {ticket.eventTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className="font-medium text-slate-950">
                      {ticket.status} / {ticket.checkedIn ? "Sudah check-in" : "Belum check-in"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Kode</p>
                    <p className="break-all font-mono font-semibold text-slate-950">
                      {ticket.ticketCode}
                    </p>
                  </div>
                </div>
              </article>
            ) : null}
          </div>

          <CheckInScanner action={checkInTicket} />
        </section>
      </main>
    </>
  );
}
