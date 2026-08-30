import type { Metadata } from 'next';
import ReservationForm from '../../components/ReservationForm';

export const dynamic = 'force-dynamic';
import { getUpcomingPopups, getProducts } from '../../lib/db';
import { siteSettings } from '../../data/siteSettings';

export const metadata: Metadata = {
  title: 'Reserve Refills',
  description: 'Pre-order your refills for the next popup. Choose products, set amounts, and pick up at the event. No payment until the popup.',
};

export default async function ReservePage() {
  const [popups, products] = await Promise.all([
    getUpcomingPopups().catch(() => []),
    getProducts().catch(() => []),
  ]);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10">
        <h1 className="font-heading text-4xl text-purple-deep mb-3">Reserve your refills</h1>
        <p className="text-ink/70 text-lg max-w-xl">
          Pre-order and skip the queue. Your order will be prepped and ready at the popup.{' '}
          <strong>No payment until you pick up</strong> - you pay by actual weight at the table.
        </p>
      </div>
      <ReservationForm
        popups={popups}
        products={products}
        discountPercentage={siteSettings.discountPercentage}
        jarDepositAmount={siteSettings.jarDepositAmount}
      />
    </div>
  );
}

