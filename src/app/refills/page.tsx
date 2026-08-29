import Link from 'next/link';
import type { Metadata } from 'next';
import { getProducts } from '../../lib/db';

export const metadata: Metadata = {
  title: 'Refills & Prices',
  description: 'Full price list for The Purple Wheel. Pantry, home, and body products sold by weight — bring your own container and save 10%.',
};

const CATEGORIES = ['Pantry', 'Home', 'Body'] as const;

export default async function RefillsPage() {
  const products = await getProducts().catch(() => []);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-heading text-4xl text-purple-deep mb-3">Refills & Prices</h1>
      <p className="text-ink/70 text-lg mb-4 max-w-xl">
        Browse what we carry and the price per unit. At the popup, you pay only for what you
        take — weighed in your own container.
      </p>
      <div className="bg-lilac/30 rounded-xl p-4 text-sm text-purple-darker mb-10 border border-lilac">
        <strong>How pricing works:</strong> prices are per pound, per ounce, or per fluid ounce.
        We weigh your empty container first (tare weight), then fill it. You pay only for the
        product inside. Bring your own container and{' '}
        <Link href="/how-it-works" className="underline text-purple">
          save 10%
        </Link>.
      </div>

      {CATEGORIES.map((cat) => {
        const catProducts = products.filter((p) => p.category === cat);
        if (catProducts.length === 0) return null;
        return (
          <section key={cat} className="mb-14">
            <h2 className="font-heading text-2xl text-purple-deep border-b border-lilac pb-3 mb-6">
              {cat}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {catProducts.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border p-5 flex justify-between gap-4 ${
                    product.available ? 'border-lilac/50' : 'border-lilac/20 opacity-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-ink">{product.name}</p>
                      {!product.available && (
                        <span className="text-xs px-2 py-0.5 bg-lilac text-purple-darker rounded-full">
                          Out of stock
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink/60 leading-relaxed">{product.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-purple text-lg">
                      ${product.pricePerUnit.toFixed(2)}
                    </p>
                    <p className="text-xs text-ink/50">{product.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="bg-purple-deep text-white rounded-2xl p-8 text-center mt-8">
        <h2 className="font-heading text-2xl mb-3">Ready to refill?</h2>
        <p className="text-lilac/80 mb-6 max-w-md mx-auto">
          Reserve ahead and your order will be prepped and waiting when you arrive. No payment
          until the popup.
        </p>
        <Link
          href="/reserve"
          className="inline-block px-7 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple/80 transition-colors"
        >
          Reserve your refills
        </Link>
      </div>
    </div>
  );
}
