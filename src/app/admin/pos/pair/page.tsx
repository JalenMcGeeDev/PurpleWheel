import type { Metadata } from 'next';
import PairClient from './PairClient';
import { getAllTerminals } from '../../../../lib/db';

export const metadata: Metadata = {
  title: 'Pair Terminal — Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function PairPage() {
  const terminals = await getAllTerminals().catch(() => []);
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin · POS</p>
      <h1 className="font-heading text-3xl text-purple-deep mb-2">Pair Terminal</h1>
      <p className="text-sm text-ink/60 mb-8">
        Generate a pairing code, then enter it on your Square Terminal to connect it.
        Pairing a new terminal automatically sets it as the active one.
      </p>
      <PairClient terminals={terminals} />
      <a href="/admin/pos" className="mt-8 inline-block text-sm text-purple hover:underline">← Back to POS</a>
    </div>
  );
}
