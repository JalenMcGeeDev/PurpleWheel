import Link from 'next/link';
import type { Metadata } from 'next';
import NextPopupCard from '../components/NextPopupCard';
import EmailSignupForm from '../components/EmailSignupForm';

export const dynamic = 'force-dynamic';
import { getUpcomingPopups } from '../lib/db';
import { siteSettings } from '../data/siteSettings';

export const metadata: Metadata = {
  title: 'The Purple Wheel - Refillery serving Raleigh, Durham & Chapel Hill',
  description:
    'A mobile refillery bringing zero-waste pantry, home, and body products to the Triangle. Bring your jar, fill what you need, pay by weight.',
};

const HOW_IT_WORKS = [
  {
    icon: '🫙',
    title: 'Bring your own jar',
    body: 'Any clean container works - mason jar, old shampoo bottle, whatever you have. We weigh it empty first so you only pay for what goes inside.',
  },
  {
    icon: '⚖️',
    title: 'Fill what you need',
    body: 'Take as much or as little as you want. No fixed sizes, no packaging waste - just the amount that makes sense for your household.',
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
  email: 'hello@purplewheel.store',
  sameAs: ['https://instagram.com/thepurplewheel'],
  areaServed: [
    { '@type': 'City', name: 'Raleigh', containedInPlace: { '@type': 'State', name: 'North Carolina' } },
    { '@type': 'City', name: 'Durham', containedInPlace: { '@type': 'State', name: 'North Carolina' } },
    { '@type': 'City', name: 'Chapel Hill', containedInPlace: { '@type': 'State', name: 'North Carolina' } },
  ],
  knowsAbout: ['zero waste', 'refillery', 'bulk goods', 'sustainable shopping'],
};

export default async function HomePage() {
  const upcoming = await getUpcomingPopups().catch(() => []);
  const nextPopup = upcoming[0];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero.jpg)' }} />
        <div className="absolute inset-0 bg-purple-deep/85" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-lilac text-sm font-semibold mb-4">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clipRule="evenodd" />
              </svg>
              The Triangle
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              The Purple Wheel
            </h1>
            <p className="text-lilac text-xl sm:text-2xl mt-3 font-heading">
              {siteSettings.tagline}
            </p>
            <p className="text-white/70 mt-5 text-base sm:text-lg max-w-lg leading-relaxed">
              Less Packaging. Less Waste. Same Essentials.
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

      {/* ── Host a popup banner ───────────────────────────────────────────── */}
      <section className="bg-purple-deep text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl mb-3">Host a popup at your space</h2>
            <p className="text-lilac/80 leading-relaxed">
              Offices, apartment communities, and local shops - bring zero-waste shopping directly
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
          Get notified when new popup dates are added. No spam - just dates, locations, and
          occasional new products.
        </p>
        <EmailSignupForm />
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

