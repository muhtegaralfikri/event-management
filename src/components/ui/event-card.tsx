import Link from "next/link";
import { ArrowUpRight, CalendarClock, MapPin, Users } from "lucide-react";
import type { EventListItem } from "@/app/actions/events";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { formatEventCategory } from "@/lib/event-category";

type EventCardProps = {
  event: EventListItem;
};

export const EventCard = ({ event }: EventCardProps) => {
  const remainingSeats = Math.max(event.capacity - event.registeredCount, 0);
  const isFree = Number(event.price) === 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-stone-200 bg-[#fffdf8] shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-stone-900">
        {event.image ? (
          <div
            className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${event.image})` }}
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#14342f,#0f766e,#d97706)]" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-md bg-white/95 px-3 py-1 text-xs font-semibold text-stone-950 shadow-sm">
            {formatEventCategory(event.category)}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-stone-950/80 to-transparent p-4">
          <span className="rounded-md bg-white/92 px-3 py-1 text-xs font-semibold text-stone-950">
            {isFree ? "Gratis" : "Berbayar"}
          </span>
          <span className="rounded-md bg-stone-950/70 px-3 py-1 text-xs font-medium text-white">
            {formatCurrency(event.price)}
          </span>
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-teal-800">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            {formatEventDate(event.date)} at {event.time}
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-stone-950">
            <Link href={`/events/${event.slug}`} className="hover:text-teal-800">
              {event.title}
            </Link>
          </h2>
          <p className="line-clamp-2 text-sm leading-6 text-stone-600">{event.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-stone-100/70 p-3">
            <p className="text-stone-500">Terdaftar</p>
            <p className="font-semibold text-stone-950">{event.registeredCount} peserta</p>
          </div>
          <div className="rounded-md bg-stone-100/70 p-3">
            <p className="text-stone-500">Sisa kursi</p>
            <p className="flex items-center gap-1 font-semibold text-stone-950">
              <Users className="h-4 w-4" aria-hidden="true" />
              {remainingSeats}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex min-w-0 items-center gap-2 truncate text-sm text-stone-500">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </p>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Detail
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};
