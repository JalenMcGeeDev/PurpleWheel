import type { Metadata } from 'next';
import Link from 'next/link';
import RequestForm from '../../components/RequestForm';

export const metadata: Metadata = {
  title: 'Request a Product',
  description: 'Tell The Purple Wheel what you\'d like to see available as a refillable. Every suggestion is read and considered.',
};

const EXAMPLES = [
  'Olive oil', 'Coconut oil', 'Maple syrup', 'Apple cider vinegar',
  'Hand lotion', 'Sunscreen', 'Mouthwash', 'Fabric spray',
  'Baking soda', 'Nutritional yeast', 'Chia seeds', 'Coffee',
];

export default function RequestsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-heading text-4xl text-purple-deep mb-4">Request a product</h1>
        <p className="text-ink/70 text-lg max-w-xl leading-relaxed">
          Don't see something you need? Tell Sunshine what you'd like to refill.
          Every request is read personally — popular asks become the next products added.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 items-start">
        {/* Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-lilac p-6 sm:p-8">
          <RequestForm />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-lilac/30 rounded-2xl p-6 border border-lilac">
            <h2 className="font-heading text-lg text-purple-deep mb-3">Things people have asked for</h2>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((item) => (
                <span key={item} className="text-sm px-3 py-1 bg-white rounded-full border border-lilac text-ink/70">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-lilac p-6">
            <h2 className="font-heading text-lg text-purple-deep mb-2">How it works</h2>
            <ul className="space-y-2 text-sm text-ink/70">
              {[
                'Sunshine reads every request personally.',
                'Popular requests get sourced first.',
                'Leave your email and we\'ll let you know when it\'s available.',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-purple shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-ink/50 text-center">
            See what we currently carry →{' '}
            <Link href="/refills" className="text-purple hover:underline">
              Refills & Prices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
