import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: "Sunshine's story — why she started The Purple Wheel and what a mobile refillery means for the Triangle.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Hero */}
      <div className="grid sm:grid-cols-2 gap-10 items-start mb-14">
        <div>
          <h1 className="font-heading text-4xl text-purple-deep mb-4">Hey, I'm Sunshine</h1>
          <p className="text-ink/80 text-lg leading-relaxed mb-4">
            I started The Purple Wheel because I couldn't find a way to buy laundry detergent
            without throwing away a plastic jug every few weeks — and I figured I wasn't the only one.
          </p>
          <p className="text-ink/70 leading-relaxed">
            Bulk refill stores exist, but they're usually one location on one side of town. That
            works for some people and not at all for others. A van that comes to you works for
            more people — at the farmers market, at your apartment complex, at your office.
          </p>
        </div>
        <div className="bg-lilac/30 rounded-2xl aspect-square flex items-center justify-center border border-lilac">
          {/* Replace this div with: <Image src="/images/about/sunshine.jpg" alt="Sunshine" fill className="object-cover rounded-2xl" /> */}
          <div className="text-center text-ink/30 text-sm p-8">
            <div className="text-5xl mb-3">🌻</div>
            <p>Photo coming soon</p>
            <p className="text-xs mt-1">(drop <code>public/images/about/sunshine.jpg</code>)</p>
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="space-y-5 text-ink/80 leading-relaxed mb-12">
        <h2 className="font-heading text-2xl text-purple-deep">The origin</h2>
        <p>
          The name came from the two things I love most: the color purple (obviously) and the
          idea of a wheel — something that keeps moving, keeps coming back, keeps showing up
          in your neighborhood. The logo is a wheel. The van is purple. The name stuck.
        </p>
        <p>
          I launched in 2024 with a handful of pantry staples and a farmers market booth.
          Within a few months I was getting messages from apartment managers, office HR teams,
          and local shops asking if I could come to them. That's when I understood what this
          could be.
        </p>
        <p>
          Now The Purple Wheel serves Raleigh, Durham, and Chapel Hill. I run every popup
          myself, I know most of my regulars by name, and I still get a small thrill every
          time someone refills a jar they've been using for two years.
        </p>
      </section>

      {/* Why refills */}
      <section className="bg-lilac/20 rounded-2xl p-8 border border-lilac mb-12">
        <h2 className="font-heading text-2xl text-purple-deep mb-4">Why refills?</h2>
        <div className="space-y-4 text-ink/80 leading-relaxed text-sm">
          <p>
            The average American throws away more than 100 plastic bottles a year — and that's
            just personal care products. Add cleaning supplies, pantry packaging, and single-use
            bags, and the number climbs fast.
          </p>
          <p>
            Refilling isn't a sacrifice. It's usually cheaper per ounce than branded alternatives,
            you get exactly the amount you need, and you end up with one jar you use forever
            instead of a recycling bin full of things you hope get recycled.
          </p>
          <p>
            I'm not asking anyone to overhaul their life. Just: next time you run out of dish
            soap, try filling the same bottle instead of buying a new one.
          </p>
        </div>
      </section>

      {/* Service area */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-purple-deep mb-4">Where we go</h2>
        <p className="text-ink/70 mb-6">
          The Purple Wheel currently serves the Triangle with regular stops in all three cities.
          Want a popup in your neighborhood or at your building?{' '}
          <a href="/host" className="text-purple underline">Get in touch</a>.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {['Raleigh', 'Durham', 'Chapel Hill'].map((city) => (
            <div key={city} className="bg-white rounded-xl border border-lilac p-5 text-center">
              <p className="font-heading text-lg text-purple-deep">{city}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-purple-deep text-white rounded-2xl p-8">
        <h2 className="font-heading text-2xl mb-2">Say hello</h2>
        <p className="text-lilac/80 mb-5 text-sm">
          Questions, press inquiries, partnership ideas, or just want to talk zero waste — I'd
          love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="mailto:sunshine.alv5@gmail.com"
            className="px-5 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple/80 transition-colors text-center text-sm"
          >
            sunshine.alv5@gmail.com
          </a>
          <a
            href="https://instagram.com/thepurplewheel"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-center text-sm"
          >
            @thepurplewheel
          </a>
        </div>
      </section>
    </div>
  );
}
