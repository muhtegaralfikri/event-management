import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/enums";
import { getOrganizerEvents } from "@/app/actions/dashboard";
import { SiteHeader } from "@/components/shared/site-header";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { PlusCircle, FileDown, Edit, BarChart3, Users, CheckCircle2, Ticket, CalendarDays, QrCode } from "lucide-react";
import { formatEventCategory } from "@/lib/event-category";

export const metadata = {
  title: "Dashboard Organizer | EventTix",
};

export default async function OrganizerDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ORGANIZER) {
    redirect("/login");
  }

  const events = await getOrganizerEvents();

  // Aggregate stats
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === "ACTIVE").length;
  const totalRegistrants = events.reduce((sum, e) => sum + e.totalRegistrants, 0);
  const totalCheckedIn = events.reduce((sum, e) => sum + e.checkedInCount, 0);
  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
  const upcomingEvent = events
    .filter((event) => event.status === "ACTIVE" && event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  return (
    <div className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />
      
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
              Dashboard Organizer
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Selamat datang, {session.user.name}. Berikut adalah ringkasan event Anda.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/organizer/check-in"
              className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
            >
              <QrCode className="h-4 w-4" />
              Scan Tiket
            </Link>
            <Link
              href="/organizer/promo/new"
              className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
            >
              <Ticket className="h-4 w-4" />
              Buat Promo
            </Link>
            <Link
              href="/organizer/events/new"
              className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              <PlusCircle className="h-4 w-4" />
              Buat Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <CalendarDays className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Event</h3>
            </div>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{totalEvents}</p>
            <p className="mt-1 text-xs text-stone-500">{activeEvents} Event Aktif</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <Users className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Peserta</h3>
            </div>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{totalRegistrants}</p>
            <p className="mt-1 text-xs text-stone-500">Dari semua event</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Check-in</h3>
            </div>
            <p className="mt-2 text-2xl font-semibold text-stone-950">
              {totalCheckedIn}
            </p>
            <p className="mt-1 text-xs text-stone-500">Peserta hadir</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <BarChart3 className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Pendapatan</h3>
            </div>
            <p className="mt-2 text-2xl font-semibold text-teal-700">{formatCurrency(totalRevenue)}</p>
            <p className="mt-1 text-xs text-stone-500">Estimasi kotor</p>
          </div>
        </div>

        {upcomingEvent ? (
          <div className="mb-8 rounded-xl border border-teal-100 bg-teal-50/70 p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-teal-800">Event terdekat</p>
                <h2 className="mt-1 text-lg font-semibold text-stone-950">{upcomingEvent.title}</h2>
                <p className="mt-1 text-sm text-stone-600">
                  {formatEventDate(upcomingEvent.date)} · {formatEventCategory(upcomingEvent.category)}
                </p>
              </div>
              <Link
                href="/organizer/check-in"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <QrCode className="h-4 w-4" />
                Buka Scanner
              </Link>
            </div>
          </div>
        ) : null}

        {/* Events Table */}
        <h2 className="mb-4 text-xl font-semibold text-stone-900">Daftar Event</h2>
        
        {events.length === 0 ? (
          <div className="rounded-xl border border-stone-200 border-dashed bg-stone-50 p-12 text-center">
            <h3 className="text-sm font-medium text-stone-900">Belum ada event</h3>
            <p className="mt-1 text-sm text-stone-500">Mulai dengan membuat event pertama Anda.</p>
            <div className="mt-6">
              <Link
                href="/organizer/events/new"
                className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800"
              >
                <PlusCircle className="h-4 w-4" />
                Buat Event Baru
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Event</th>
                    <th className="px-6 py-4 font-medium">Kategori</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Peserta (Paid)</th>
                    <th className="px-6 py-4 font-medium">Check-in</th>
                    <th className="px-6 py-4 font-medium">Pendapatan</th>
                    <th className="px-6 py-4 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-stone-900">{event.title}</p>
                        <p className="text-xs text-stone-500">{formatEventDate(event.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                          {formatEventCategory(event.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${event.status === "ACTIVE" ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {event.totalRegistrants} <span className="text-stone-400">({event.paidCount})</span>
                      </td>
                      <td className="px-6 py-4">
                        {event.checkedInCount}
                      </td>
                      <td className="px-6 py-4 font-medium text-stone-900">
                        {formatCurrency(event.revenue)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/organizer/events/${event.slug}/edit`}
                            className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                            title="Edit Event"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <a 
                            href={`/api/events/${event.id}/export`}
                            className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                            title="Export Data Peserta (CSV)"
                          >
                            <FileDown className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
