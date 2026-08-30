import Link from 'next/link';
import { format } from 'date-fns';
import type { Popup } from '../types';

interface NextPopupCardProps {
  popup: Popup;
}

export default function NextPopupCard({ popup }: NextPopupCardProps) {
  const now = new Date();
  const cutoff = new Date(popup.preorderCutoff);
  const preordersOpen = popup.preordersEnabled && cutoff > now;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-lilac/50 overflow-hidden">
      <div className="bg-purple px-6 py-4">
        <p className="text-lilac text-xs font-semibold uppercase tracking-widest">Next popup</p>
        <h2 className="text-white font-heading font-bold text-xl mt-1">{popup.title}</h2>
      </div>

      <div className="px-6 py-5">
        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-purple mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-ink">
              {format(new Date(popup.startsAt), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-purple mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            <span className="text-ink">
              {format(new Date(popup.startsAt), 'h:mm a')} – {format(new Date(popup.endsAt), 'h:mm a')}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-purple mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21C12 21 5 14.5 5 9a7 7 0 0114 0c0 5.5-7 12-7 12z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="text-ink">{popup.address}</span>
          </div>
          {popup.notes && (
            <p className="text-ink/60 text-xs pl-7">{popup.notes}</p>
          )}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {preordersOpen ? (
            <Link
              href="/reserve"
              className="flex-1 text-center px-5 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep transition-colors"
            >
              Reserve your refills
            </Link>
          ) : (
            <span className="flex-1 text-center px-5 py-3 bg-lilac text-purple-deeper font-semibold rounded-xl text-sm">
              Pre-orders closed - walk-ups welcome
            </span>
          )}
          <Link
            href="/schedule"
            className="flex-1 text-center px-5 py-3 border border-purple text-purple font-semibold rounded-xl hover:bg-lilac/30 transition-colors"
          >
            Full schedule
          </Link>
        </div>

        {preordersOpen && (
          <p className="text-xs text-ink/50 mt-3 text-center">
            Pre-order deadline: {format(cutoff, 'MMM d')} at {format(cutoff, 'h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}

