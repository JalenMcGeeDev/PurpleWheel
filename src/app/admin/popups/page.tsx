import Link from 'next/link';
import { format } from 'date-fns';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import { getAllPopups } from '../../../lib/db';

export const metadata: Metadata = { title: 'Popups — Admin', robots: { index: false, follow: false } };

export default async function AdminPopupsPage() {
  const allPopups = await getAllPopups().catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
          <h1 className="font-heading text-3xl text-purple-deep">Popups</h1>
        </div>
        <Link href="/admin/popups/new"
          className="px-4 py-2.5 bg-purple text-white text-sm font-semibold rounded-xl hover:bg-purple-deep transition-colors">
          + Add popup
        </Link>
      </div>

      <div className="grid gap-4">
        {allPopups.map((popup) => (
          <Link key={popup.id} href={`/admin/popups/${popup.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-lilac p-5 hover:border-purple transition-colors">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="font-semibold text-ink">{popup.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  popup.status === 'scheduled' ? 'bg-purple text-white' : 'bg-red-100 text-red-700'
                }`}>
                  {popup.status}
                </span>
              </div>
              <p className="text-sm text-ink/60 mt-0.5">
                {format(new Date(popup.startsAt), 'EEE, MMM d · h:mm a')} · {popup.city}
              </p>
            </div>
            <svg className="w-5 h-5 text-purple shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
        {allPopups.length === 0 && (
          <p className="text-center text-ink/40 py-10">No popups yet. Add one!</p>
        )}
      </div>

      <a href="/admin" className="mt-8 inline-block text-sm text-purple hover:underline">← Dashboard</a>
    </div>
  );
}
