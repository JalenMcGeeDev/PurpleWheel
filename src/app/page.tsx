import Link from 'next/link';
import type { Metadata } from 'next';
import NextPopupCard from '../components/NextPopupCard';

export const dynamic = 'force-dynamic';
import { getUpcomingPopups, getProducts } from '../lib/db';
import { siteSettings } from '../data/siteSettings';

export const metadata: Metadata = {
  title: 'The Purple Wheel — Refillery serving Raleigh, Durham & Chapel Hill',
  description:
    'A mobile refillery bringing zero-waste pantry, home, and body products to the Triangle. Bring your jar, fill what you need, pay by weight.',
};

const HOW_IT_WORKS = [
  {
    icon: '🫙',
    title: 'Bring your own jar',
    body: 'Any clean container works — mason jar, old shampoo bottle, whatever you have. We weigh it empty first so you only pay for what goes inside.',
  },
  {
    icon: '⚖️',
    title: 'Fill what you need',
    body: 'Take as much or as little as you want. No fixed sizes, no packaging waste — just the amount that makes sense for your household.',
  },
  {
    icon: '💜',
    title: 'Pay by weight',
    body: "You pay for exactly what you take, at a posted price per pound or ounce. Reserve ahead and your order will be ready when you arrive.",
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'The Purple Wheel',
  description: 'Mobile refillery serving Raleigh, Durham, and Chapel Hill, NC.',
  url: 'https://purplewheel.store',
  telephone: '+19196386692',
  email: 'sunshine.alv5@gmail.com',
  sameAs: ['https://instagram.com/thepurplewheel'],
  areaServed: [
    { '@type': 'City', name: 'Raleigh', containedInPlace: { '@type': 'State', name: 'North Carolina' } },
    { '@type': 'City', name: 'Durham', containedInPlace: { '@type': 'State', name: 'North Carolina' } },
    { '@type': 'City', name: 'Chapel Hill', containedInPlace: { '@type': 'State', name: 'North Carolina' } },
  ],
  knowsAbout: ['zero waste', 'refillery', 'bulk goods', 'sustainable shopping'],
};

export default async function HomePage() {
  const [upcoming, allProducts] = await Promise.all([
    getUpcomingPopups().catch(() => []),
    getProducts().catch(() => []),
  ]);
  const nextPopup = upcoming[0];
  const featuredProducts = allProducts.filter((p) => p.available).slice(0, 6);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-purple-deep text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lilac text-sm font-semibold uppercase tracking-widest mb-4">
              Raleigh · Durham · Chapel Hill
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              The Purple Wheel
            </h1>
            <p className="text-lilac text-xl sm:text-2xl mt-3 font-heading">
              {siteSettings.tagline}
            </p>
            <p className="text-white/70 mt-5 text-base sm:text-lg max-w-lg leading-relaxed">
              We bring bulk pantry staples, home goods, and body care straight to your neighborhood.
              Bring your own jar, fill what you need, and pay by weight — no packaging, no waste.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/reserve"
                className="px-7 py-4 bg-purple text-white font-semibold rounded-xl hover:bg-purple/90 transition-colors text-center"
              >
                Reserve your refills
              </Link>
              <Link
                href="/schedule"
                className="px-7 py-4 border border-lilac/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-center"
              >
                See upcoming popups
              </Link>
            </div>
          </div>

          {/* Next popup card */}
          <div>
            {nextPopup ? (
              <NextPopupCard popup={nextPopup} />
            ) : (
              <div className="bg-white/10 rounded-2xl p-8 text-center border border-white/20">
                <p className="font-heading text-xl text-white mb-2">Next dates coming soon</p>
                <p className="text-lilac text-sm">Sign up below to be the first to know.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl text-purple-deep">How it works</h2>
          <p className="text-ink/60 mt-3 max-w-md mx-auto">
            Three steps, no account needed, no plastic bags to throw away.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-lilac flex items-center justify-center text-3xl mx-auto mb-5">
                {step.icon}
              </div>
              <h3 className="font-heading text-xl text-purple-deep mb-2">{step.title}</h3>
              <p className="text-ink/70 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/how-it-works" className="text-purple font-medium hover:underline">
            Full guide for first-timers →
          </Link>
        </div>
      </section>

      {/* ── Discount callout ─────────────────────────────────────────────── */}
      <section className="bg-lilac/30 border-y border-lilac">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-purple flex items-center justify-center shrink-0 text-2xl">
            🫙
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="font-heading text-2xl text-purple-deep">
              Bring your own container, save {siteSettings.discountPercentage}%
            </h2>
            <p className="text-ink/70 mt-2 max-w-lg">
              Any clean jar, bottle, or bag works. We weigh it empty first — you only pay for
              what goes inside.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="shrink-0 px-5 py-3 border-2 border-purple text-purple rounded-xl font-semibold hover:bg-purple hover:text-white transition-colors"
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* ── Product teaser ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl text-purple-deep">What we carry</h2>
            <p className="text-ink/60 mt-2">Pantry staples, home goods, and body care — all refillable.</p>
          </div>
          <Link href="/refills" className="text-purple font-medium hover:underline text-sm hidden sm:block">
            Full price list →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-lilac/50 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple/70 mb-1">
                    {product.category}
                  </p>
                  <p className="font-semibold text-ink">{product.name}</p>
                  <p className="text-sm text-ink/60 mt-1 line-clamp-2">{product.description}</p>
                </div>
                <p className="shrink-0 font-semibold text-purple">
                  ${product.pricePerUnit.toFixed(2)}
                  <span className="text-xs font-normal text-ink/40 block text-right">
                    {product.unit}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
          <Link
            href="/refills"
            className="text-center px-6 py-3 border border-purple text-purple rounded-xl font-semibold hover:bg-lilac/30 transition-colors"
          >
            View all products & prices
          </Link>
          <Link
            href="/reserve"
            className="text-center px-6 py-3 bg-purple text-white rounded-xl font-semibold hover:bg-purple-deep transition-colors"
          >
            Reserve your refills
          </Link>
        </div>
      </section>

      {/* ── Host a popup banner ───────────────────────────────────────────── */}
      <section className="bg-purple-deep text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl mb-3">Host a popup at your space</h2>
            <p className="text-lilac/80 leading-relaxed">
              Offices, apartment communities, and local shops — bring zero-waste shopping directly
              to your people. We handle everything; you just show up.
            </p>
          </div>
          <div className="sm:text-right">
            <Link
              href="/host"
              className="inline-block px-7 py-4 bg-purple text-white font-semibold rounded-xl hover:bg-purple/80 transition-colors"
            >
              Get in touch →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Email signup ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="font-heading text-3xl text-purple-deep mb-3">Stay in the loop</h2>
        <p className="text-ink/60 mb-8 max-w-md mx-auto">
          Get notified when new popup dates are added. No spam — just dates, locations, and
          occasional new products.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="#" method="POST">
          {/* Honeypot */}
          <input type="text" name="_trap" className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" tabIndex={-1} autoComplete="off" />
          <label htmlFor="signup-email" className="sr-only">Email address</label>
          <input
            id="signup-email"
            type="email"
            name="email"
            required
            placeholder="your@email.com"
            className="flex-1 border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep transition-colors"
          >
            Notify me
          </button>
        </form>
        <p className="text-xs text-ink/40 mt-3">
          Or follow{' '}
          <a
            href={`https://instagram.com/${siteSettings.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple hover:underline"
          >
            @{siteSettings.instagramHandle}
          </a>{' '}
          on Instagram.
        </p>
      </section>
    </>
  );
}
