import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/site-header";

export const metadata: Metadata = {
  title: "Syarat Layanan | EventTix",
  description: "Syarat penggunaan aplikasi EventTix.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <p className="text-sm font-semibold text-teal-800">EventTix</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            Syarat Layanan
          </h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-stone-700">
            <p>
              EventTix adalah aplikasi portfolio untuk menunjukkan alur event management, tiket
              digital, check-in QR, dan dashboard organizer.
            </p>
            <p>
              Pengunjung dapat mencari event, mendaftar, melihat tiket, dan menunjukkan QR code
              untuk check-in. Organizer dapat membuat event, mengelola data pendaftaran, melakukan
              check-in, dan mengekspor data peserta.
            </p>
            <p>
              Fitur pembayaran pada versi portfolio ini digunakan untuk demonstrasi alur tiket
              berbayar. Untuk penggunaan komersial, integrasi payment gateway dan kebijakan refund
              perlu ditambahkan.
            </p>
            <p>
              Halaman ini bukan dokumen legal final. Jika EventTix digunakan sebagai produk bisnis,
              syarat layanan perlu ditinjau ulang sesuai operasional dan regulasi yang berlaku.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
