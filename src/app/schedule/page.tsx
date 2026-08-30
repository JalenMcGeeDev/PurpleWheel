import Link from 'next/link';
import type { Metadata } from 'next';
import { format, isFuture } from 'date-fns';

export const dynamic = 'force-dynamic';
import { getAllPopups } from '../../lib/db';

export const metadata: Metadata = {
  title: 'Popup Schedule',
  description: 'Upcoming Purple Wheel popup locations and dates across Raleigh, Durham, and Chapel Hill.',
};

export default async function SchedulePage() {
  const allPopups = await getAllPopups().catch(() => []);
  const upcoming = allPopups.filter((p) => isFuture(new Date(p.startsAt)) && p.isPublic);
  const now = new Date();

  // Group by month
  const byMonth: Record<string, typeof upcoming> = {};
  for (const popup of upcoming) {
    const key = format(new Date(popup.startsAt), 'MMMM yyyy');
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(popup);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-heading text-4xl text-purple-deep mb-3">Popup Schedule</h1>
      <p className="text-ink/70 mb-10 text-lg">
        All upcoming locations across the Triangle. Each popup is open to walk-ups, and most
        offer pre-orders so your order is ready when you arrive.
      </p>

      {Object.keys(byMonth).length === 0 && (
        <div className="text-center py-16">
          <p className="font-heading text-2xl text-purple-deep mb-3">No upcoming dates yet</p>
          <p className="text-ink/60 mb-6">Check back soon, or follow us on Instagram for announcements.</p>
          <a
            href="https://instagram.com/thepurplewheel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-3 bg-purple text-white rounded-xl font-semibold hover:bg-purple-deep transition-colors"
          >
            @thepurplewheel on Instagram
          </a>
        </div>
      )}

      {Object.entries(byMonth).map(([month, monthPopups]) => (
        <div key={month} className="mb-12">
          <h2 className="font-heading text-xl text-ink/50 border-b border-lilac pb-2 mb-6">
            {month}
          </h2>
          <div className="grid gap-5">
            {monthPopups.map((popup) => {
              const preordersOpen =
                popup.preordersEnabled && new Date(popup.preorderCutoff) > now;
              const cutoffPassed =
                popup.preordersEnabled && new Date(popup.preorderCutoff) <= now;
              const mapUrl = popup.geo
                ? `https://maps.google.com/?q=${popup.geo.lat},${popup.geo.lng}`
                : `https://maps.google.com/?q=${encodeURIComponent(popup.address)}`;

              return (
                <div
                  key={popup.id}
                  className="bg-white rounded-2xl border border-lilac/50 overflow-hidden"
                >
                  <div className="bg-lilac/20 px-6 py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-purple-deep">
                        {popup.title}
                      </h3>
                      <p className="text-sm text-ink/60 mt-0.5">
                        {format(new Date(popup.startsAt), 'EEEE, MMMM d')}
                        {' · '}
                        {format(new Date(popup.startsAt), 'h:mm a')}
                        {' – '}
                        {format(new Date(popup.endsAt), 'h:mm a')}
                      </p>
                    </div>
                    {popup.status === 'cancelled' ? (
                      <span className="shrink-0 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        Cancelled
                      </span>
                    ) : preordersOpen ? (
                      <span className="shrink-0 px-3 py-1 bg-purple text-white rounded-full text-xs font-semibold">
                        Pre-orders open
                      </span>
                    ) : cutoffPassed ? (
                      <span className="shrink-0 px-3 py-1 bg-lilac text-purple-darker rounded-full text-xs font-semibold">
                        Walk-ups welcome
                      </span>
                    ) : null}
                  </div>

                  <div className="px-6 py-4 text-sm text-ink/70">
                    <p>
                      <span className="text-purple mr-1">📍</span>
                      {popup.venueName} · {popup.address}
                    </p>
                    {popup.notes && (
                      <p className="mt-1 text-ink/50">{popup.notes}</p>
                    )}
                    {preordersOpen && (
                      <p className="mt-1 text-ink/50">
                        Pre-order deadline:{' '}
                        {format(new Date(popup.preorderCutoff), 'MMM d')} at{' '}
                        {format(new Date(popup.preorderCutoff), 'h:mm a')}
                      </p>
                    )}
                  </div>

                  <div className="px-6 pb-5 flex flex-wrap gap-3">
                    {preordersOpen && popup.status === 'scheduled' && (
                      <Link
                        href={`/reserve?popup=${popup.id}`}
                        className="px-4 py-2 bg-purple text-white text-sm font-semibold rounded-lg hover:bg-purple-deep transition-colors"
                      >
                        Reserve refills
                      </Link>
                    )}
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-lilac text-purple text-sm font-semibold rounded-lg hover:bg-lilac/30 transition-colors"
                    >
                      Map
                    </a>
                    <a
                      href={`/api/ics/${popup.id}`}
                      className="px-4 py-2 border border-lilac text-purple text-sm font-semibold rounded-lg hover:bg-lilac/30 transition-colors"
                    >
                      Add to calendar
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
