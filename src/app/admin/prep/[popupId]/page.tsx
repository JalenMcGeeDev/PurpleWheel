import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import type { Metadata } from 'next';
import { getReservationsByPopup, getPopupById } from '../../../../lib/db';
import PrepListClient from './PrepListClient';

export const metadata: Metadata = {
  title: 'Prep List — Admin',
  robots: { index: false, follow: false },
};

export default async function PrepListPage({ params }: { params: Promise<{ popupId: string }> }) {
  const { popupId } = await params;

  const popup = await getPopupById(popupId);
  if (!popup) redirect('/admin/prep');

  const reservations = await getReservationsByPopup(popupId);
  const sorted = [...reservations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-start justify-between gap-4 mb-8 no-print">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin · Prep List</p>
          <h1 className="font-heading text-3xl text-purple-deep">{popup.title}</h1>
          <p className="text-ink/60 mt-1">
            {format(new Date(popup.startsAt), 'EEEE, MMMM d, yyyy')} ·{' '}
            {format(new Date(popup.startsAt), 'h:mm a')} – {format(new Date(popup.endsAt), 'h:mm a')}
          </p>
          <p className="text-ink/50 text-sm">{popup.address}</p>
        </div>
        <button
          onClick={() => typeof window !== 'undefined' && window.print()}
          className="shrink-0 px-4 py-2 border border-lilac text-purple text-sm font-semibold rounded-lg hover:bg-lilac/30 transition-colors no-print"
        >
          Print
        </button>
      </div>

      <div className="print-only mb-6">
        <h1 className="font-heading text-2xl">Prep List — {popup.title}</h1>
        <p className="text-sm text-ink/60">
          {format(new Date(popup.startsAt), 'EEEE, MMMM d, yyyy')} ·{' '}
          {format(new Date(popup.startsAt), 'h:mm a')} – {format(new Date(popup.endsAt), 'h:mm a')}
        </p>
        <p className="text-sm text-ink/60 mb-4">{popup.address}</p>
        <hr />
      </div>

      <PrepListClient reservations={sorted} popupId={popupId} />

      <a href="/admin/prep" className="mt-10 inline-block text-sm text-purple hover:underline no-print">← All popups</a>
    </div>
  );
}
