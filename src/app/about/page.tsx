import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About',
  description: "Our story - why we started The Purple Wheel and what a mobile refillery means for the Triangle.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Hero */}
      <div className="grid sm:grid-cols-2 gap-10 items-start mb-14">
        <div>
          <h1 className="font-heading text-4xl text-purple-deep mb-4">About The Purple Wheel</h1>
          <p className="text-ink/80 text-lg leading-relaxed mb-4">
            The Purple Wheel was started by Durham local Sunshine Alvarez. Sunshine has been a sustainability advocate her whole life, always researching and learning ways to live more sustainably - for herself and for the world. The Purple Wheel is what happened when she decided to take that advocacy further.
          </p>
          <p className="text-ink/70 leading-relaxed mb-4">
            Refill stores exist, but they&apos;re usually one shop on one side of town. That works for some people and not at all for others.
          </p>
          <p className="text-ink/70 leading-relaxed mb-4">
            Coming to you works for more of them. At the farmers market, at your apartment building, at your office.
          </p>
          <p className="text-ink/70 leading-relaxed">
            A storefront of our own is the goal, and we&apos;re working toward it. But going mobile first means we&apos;re not asking anyone to drive across town to shop sustainably - we&apos;re bringing refills to the places people already are. When the shop opens, we&apos;ll keep coming to you.
          </p>
        </div>
        <div>
          <div className="relative rounded-2xl overflow-hidden aspect-square">
            <Image
              src="/images/about/sunshine.jpg"
              alt="Sunshine Alvarez, founder of The Purple Wheel"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-xs text-ink/50 text-center mt-2">Purple Wheel Founder, Sunshine Alvarez</p>
        </div>
      </div>

      {/* Story */}
      <section className="space-y-5 text-ink/80 leading-relaxed mb-12">
        <h2 className="font-heading text-2xl text-purple-deep">The origin</h2>
        <p>
          The name came from the two things I love most: the color purple and the idea of a
          wheel - something that keeps moving, keeps coming back, keeps showing up in your
          neighborhood. The Purple Wheel launched in 2026 with a handful of pantry staples,
          and we're excited to keep growing our offerings, and our partners!
        </p>
      </section>

      {/* Why refills */}
      <section className="bg-lilac/20 rounded-2xl p-8 border border-lilac mb-12">
        <h2 className="font-heading text-2xl text-purple-deep mb-4">Why refills?</h2>
        <div className="space-y-4 text-ink/80 leading-relaxed text-sm">
          <p>
            The average American throws away more than 100 plastic bottles a year - and that's
            just personal care products. Add cleaning supplies, pantry packaging, and single-use
            bags, and the number climbs fast.
          </p>
          <p>
            Refilling isn't a sacrifice. It's usually cheaper per ounce than branded alternatives,
            you get exactly the amount you need, and you end up with one jar you use forever
            instead of a recycling bin full of things you hope get recycled.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-purple-deep text-white rounded-2xl p-8">
        <h2 className="font-heading text-2xl mb-2">Say hello</h2>
        <p className="text-lilac/80 mb-5 text-sm">
          Questions, press inquiries, partnership ideas, or just want to talk zero waste - I'd
          love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="mailto:hello@purplewheel.store"
            className="px-5 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple/80 transition-colors text-center text-sm"
          >
            hello@purplewheel.store
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

