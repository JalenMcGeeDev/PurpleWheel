import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getAllPopups, getActiveTerminal } from '../../../lib/db';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout — Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const [products, allPopups, terminal] = await Promise.all([
    getProducts().catch(() => []),
    getAllPopups().catch(() => []),
    getActiveTerminal().catch(() => null),
  ]);

  const now = new Date();
  const upcoming = allPopups.filter((p) => new Date(p.endsAt) > now);
  const popups = upcoming.length > 0 ? upcoming : allPopups;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
          <h1 className="font-heading text-3xl text-purple-deep">Checkout</h1>
        </div>
        <Link href="/admin/pos/pair" className="text-xs text-purple hover:underline">Pair Terminal</Link>
      </div>
      {terminal ? (
        <p className="text-xs text-green-600 mb-8 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          Terminal: {terminal.name}
        </p>
      ) : (
        <p className="text-xs text-amber-600 mb-8">No terminal paired</p>
      )}
      <CheckoutClient products={products} popups={popups} />
      <a href="/admin" className="mt-8 inline-block text-sm text-purple hover:underline">← Dashboard</a>
    </div>
  );
}
