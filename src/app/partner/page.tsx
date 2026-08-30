import Link from 'next/link';
import type { Metadata } from 'next';
import HostForm from '../../components/HostForm';

export const metadata: Metadata = {
  title: 'Partner With Us',
  description:
    'Bring The Purple Wheel to your apartment community, office, or building. No fees, no minimums - we bring everything and come back on a set schedule.',
};

const STEPS = [
  {
    number: '1',
    heading: 'We bring everything, you provide the space.',
    body: 'Dispensers, scales, signage, and jars - all we need is a table-sized spot for two hours.',
  },
  {
    number: '2',
    heading: 'Residents shop or pre-order.',
    body: 'Fill on the spot, or order ahead on our site and grab a bag that\'s ready. Bring your own container, save 10%.',
  },
  {
    number: '3',
    heading: 'We come back on a set schedule.',
    body: 'Same day, same time, weekly or biweekly - so your residents always know when we\'re there.',
  },
  {
    number: '4',
    heading: 'Your community shapes what we carry.',
    body: 'Residents request products through our site, and we tailor the lineup to your building.',
  },
  {
    number: '5',
    heading: 'It costs you nothing.',
    body: 'No fees, no minimum, no long-term commitment. We handle setup, payment, and cleanup.',
  },
];

const WHAT_YOU_GET = [
  'A recurring zero-waste amenity residents talk about',
  'Pre-made flyers and digital content you can share',
  'A dedicated prep list so your event runs smoothly',
  'Products sourced to match your community\'s requests',
  'Zero effort on your end - we set up, sell, and clean up',
];

export default function PartnerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-3">Partnership</p>
        <h1 className="font-heading text-5xl sm:text-6xl text-purple-deep mb-4 leading-tight">
          How Partnership Works
        </h1>
        <p className="text-xl text-ink/70 max-w-xl mx-auto">
          Partnering with The Purple Wheel takes almost nothing on your end.
        </p>
      </div>

      {/* Steps */}
      <section className="mb-16">
        <div className="space-y-4">
          {STEPS.map(({ number, heading, body }) => (
            <div
              key={number}
              className="flex gap-5 bg-white rounded-2xl border border-lilac p-6"
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-purple flex items-center justify-center text-white font-bold text-sm">
                {number}
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">{heading}</p>
                <p className="text-sm text-ink/70 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="mb-16 bg-purple rounded-3xl p-8 sm:p-10">
        <h2 className="font-heading text-3xl text-white mb-6">What your community gets</h2>
        <ul className="space-y-3">
          {WHAT_YOU_GET.map((item) => (
            <li key={item} className="flex gap-3 text-white/90">
              <svg className="w-5 h-5 text-lilac shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm sm:text-base">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Venue types */}
      <section className="mb-16">
        <h2 className="font-heading text-3xl text-purple-deep mb-8 text-center">Who we partner with</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: '🏠', label: 'Apartment communities', body: 'A sustainable amenity that residents love - and a reason to renew.' },
            { icon: '🏢', label: 'Offices & co-working', body: 'Zero-waste shopping as a workplace perk, right in the break room.' },
            { icon: '🛍️', label: 'Markets & retail shops', body: 'Bring new foot traffic and align your brand with sustainability.' },
          ].map(({ icon, label, body }) => (
            <div key={label} className="bg-white rounded-2xl border border-lilac p-6 text-center">
              <div className="text-4xl mb-3">{icon}</div>
              <p className="font-heading text-lg text-purple-deep mb-2">{label}</p>
              <p className="text-sm text-ink/60 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquire">
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl text-purple-deep mb-2">Ready to bring us in?</h2>
          <p className="text-ink/60">Tell us a bit about your space and we'll follow up within two business days.</p>
        </div>
        <HostForm />
      </section>

    </div>
  );
}

