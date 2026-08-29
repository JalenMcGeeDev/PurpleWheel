import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import { getProducts, getAllPopups } from '../../../lib/db';
import Calculator from './Calculator';

export const metadata: Metadata = {
  title: 'Price Calculator — Admin',
  robots: { index: false, follow: false },
};

export default async function CalculatorPage() {

  const [products, allPopups] = await Promise.all([
    getProducts().catch(() => []),
    getAllPopups().catch(() => []),
  ]);

  // Show upcoming popups first; fall back to all if none upcoming
  const now = new Date();
  const upcoming = allPopups.filter((p) => new Date(p.startsAt) > now);
  const popups = upcoming.length > 0 ? upcoming : allPopups;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
      <h1 className="font-heading text-3xl text-purple-deep mb-2">Price Calculator</h1>
      <p className="text-sm text-ink/60 mb-8">
        Select the popup, enter weights, and see the total with tax. Use this at the table.
      </p>
      <Calculator products={products} popups={popups} />
      <a href="/admin" className="mt-8 inline-block text-sm text-purple hover:underline">← Dashboard</a>
    </div>
  );
}
