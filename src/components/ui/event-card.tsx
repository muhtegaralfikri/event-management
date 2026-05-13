import Link from "next/link";
import type { EventListItem } from "@/app/actions/events";
import { formatCurrency, formatEventDate } from "@/lib/format";

type EventCardProps = {
  event: EventListItem;
};

export const EventCard = ({ event }: EventCardProps) => {
  const remainingSeats = Math.max(event.capacity - event.registeredCount, 0);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex aspect-[16/7] items-end bg-slate-900">
        {event.image ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${event.image})` }}
          />
        ) : (
          <div className="flex h-full w-full items-end bg-[linear-gradient(135deg,#0f172a,#155e75,#16a34a)] p-5">
            <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900">
              EventTix
            </span>
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-teal-700">
            {formatEventDate(event.date)} at {event.time}
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            <Link href={`/events/${event.slug}`} className="hover:text-teal-700">
              {event.title}
            </Link>
          </h2>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{event.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Harga</p>
            <p className="font-semibold text-slate-950">{formatCurrency(event.price)}</p>
          </div>
          <div>
            <p className="text-slate-500">Sisa kursi</p>
            <p className="font-semibold text-slate-950">{remainingSeats}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="min-w-0 truncate text-sm text-slate-500">{event.location}</p>
          <Link
            href={`/events/${event.slug}`}
            className="shrink-0 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
};
