import { format } from 'date-fns';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getAllPopups } from '../../../lib/db';

export const metadata: Metadata = {
  title: 'Admin - Popups',
  robots: { index: false, follow: false },
};

export default async function AdminPrepIndexPage() {
  const allPopups = await getAllPopups().catch(() => []);
  const upcoming = allPopups.filter((p) => new Date(p.startsAt) > new Date());

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl text-purple-deep mb-2">Admin - Prep Lists</h1>
      <p className="text-ink/60 mb-10 text-sm">Select a popup to view or print its prep list.</p>

      <div className="grid gap-4">
        {upcoming.map((popup) => (
          <Link
            key={popup.id}
            href={`/admin/prep/${popup.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-lilac p-5 hover:border-purple transition-colors"
          >
            <div>
              <p className="font-semibold text-ink">{popup.title}</p>
              <p className="text-sm text-ink/60 mt-0.5">
                {format(new Date(popup.startsAt), 'EEE, MMM d')} ·{' '}
                {format(new Date(popup.startsAt), 'h:mm a')}
              </p>
              <p className="text-xs text-ink/40 mt-0.5">{popup.city}</p>
            </div>
            <svg className="w-5 h-5 text-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
        {upcoming.length === 0 && (
          <p className="text-ink/50 text-center py-10">No upcoming popups.</p>
        )}
      </div>
    </div>
  );
}

