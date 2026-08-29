import { format } from 'date-fns';
import type { Metadata } from 'next';
import { getProductRequests } from '../../../lib/db';

export const metadata: Metadata = {
  title: 'Product Requests — Admin',
  robots: { index: false, follow: false },
};

export default async function AdminRequestsPage() {

  const requests = await getProductRequests().catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
      <h1 className="font-heading text-3xl text-purple-deep mb-2">Product Requests</h1>
      <p className="text-sm text-ink/60 mb-8">{requests.length} request{requests.length !== 1 ? 's' : ''} total — newest first.</p>

      <div className="grid gap-4">
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-lilac p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-ink text-lg">{r.productName}</p>
                {r.category && (
                  <span className="text-xs px-2 py-0.5 bg-lilac text-purple-darker rounded-full mt-1 inline-block">
                    {r.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink/40 shrink-0">
                {format(new Date(r.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            {r.notes && (
              <p className="text-sm text-ink/70 mt-3 leading-relaxed">{r.notes}</p>
            )}
            {(r.submitterName || r.email) && (
              <p className="text-xs text-ink/40 mt-3">
                From: {r.submitterName ?? ''}{r.email ? ` (${r.email})` : ''}
              </p>
            )}
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-center text-ink/40 py-10">No requests yet.</p>
        )}
      </div>

      <a href="/admin" className="mt-8 inline-block text-sm text-purple hover:underline">← Dashboard</a>
    </div>
  );
}
