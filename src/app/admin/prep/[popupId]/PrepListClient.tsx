'use client';

import { useState } from 'react';
import type { Reservation, ReservationItem } from '../../../../types';
import { createSupabaseBrowserClient } from '../../../../lib/supabase-browser';

interface PrepListClientProps {
  reservations: Reservation[];
  popupId: string;
}

const STATUS_LABELS: Record<Reservation['status'], string> = {
  new: 'New',
  prepped: 'Prepped',
  collected: 'Collected',
  'no-show': 'No-show',
};

const STATUS_COLORS: Record<Reservation['status'], string> = {
  new: 'bg-lilac text-purple-darker',
  prepped: 'bg-blue-100 text-blue-800',
  collected: 'bg-green-100 text-green-800',
  'no-show': 'bg-red-100 text-red-700',
};

export default function PrepListClient({ reservations: initial, popupId }: PrepListClientProps) {
  const [reservations, setReservations] = useState(initial);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: Reservation['status']) {
    setUpdating(id);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      await fetch(`/api/reservation-status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdating(null);
    }
  }

  const newCount = reservations.filter((r) => r.status === 'new' || r.status === 'prepped').length;
  const collectedCount = reservations.filter((r) => r.status === 'collected').length;

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8 no-print">
        {[
          { label: 'Total orders', value: reservations.length },
          { label: 'Pending', value: newCount },
          { label: 'Collected', value: collectedCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-lilac p-4 text-center">
            <p className="text-2xl font-bold text-purple-deep">{value}</p>
            <p className="text-xs text-ink/50 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {reservations.length === 0 && (
        <p className="text-ink/50 text-center py-12">No reservations for this popup yet.</p>
      )}

      <div className="grid gap-5">
        {reservations.map((r) => (
          <div
            key={r.id}
            className={`bg-white rounded-2xl border p-5 transition-opacity ${
              r.status === 'collected' || r.status === 'no-show' ? 'border-lilac/30 opacity-60' : 'border-lilac'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-heading font-bold text-lg text-purple-deep">{r.customerName}</p>
                  <span className="font-mono text-xs bg-lilac text-purple-darker px-2 py-0.5 rounded">
                    {r.orderCode}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
                <p className="text-sm text-ink/60 mt-0.5">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
              </div>
              <p className={`shrink-0 text-sm font-semibold ${r.bringingOwnContainer ? 'text-purple' : 'text-ink/60'}`}>
                {r.bringingOwnContainer ? '🫙 Own container' : '🛒 Needs jar'}
              </p>
            </div>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-xs text-ink/40 uppercase tracking-wide border-b border-lilac">
                  <th className="text-left pb-2 font-normal">Product</th>
                  <th className="text-left pb-2 font-normal">Amount</th>
                  <th className="text-right pb-2 font-normal">Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {r.items.map((item: ReservationItem) => (
                  <tr key={item.productId} className="border-b border-lilac/30 last:border-0">
                    <td className="py-2 text-ink">{item.productName}</td>
                    <td className="py-2 text-ink/70">
                      ~{item.requestedAmount} {item.unit.replace('per ', '')}
                    </td>
                    <td className="py-2 text-right text-ink/70">~${item.estimatedCost.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-3 font-semibold text-ink" colSpan={2}>Estimated total</td>
                  <td className="pt-3 text-right font-semibold text-ink">~${r.estimatedTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2 no-print">
              {(['new', 'prepped', 'collected', 'no-show'] as Reservation['status'][]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(r.id, s)}
                  disabled={r.status === s || updating === r.id}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-40 ${
                    r.status === s
                      ? `${STATUS_COLORS[s]} ring-2 ring-purple/30`
                      : 'bg-lilac/40 text-ink hover:bg-lilac'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
