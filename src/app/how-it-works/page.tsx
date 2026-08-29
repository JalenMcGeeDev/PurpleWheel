import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Everything a first-timer needs to know about refilling at The Purple Wheel — containers, tare weights, what to bring, and the 10% own-container discount.',
};

const SECTIONS = [
  {
    id: 'what-is',
    heading: 'What is a refillery?',
    body: `A refillery is a store where you bring your own container and fill it from a bulk supply. There's no pre-packaged bottle to throw away — you take exactly what you need, pay for what you take, and go home with zero extra plastic.\n\nThe Purple Wheel is a mobile refillery: instead of a fixed shop, Sunshine loads up a van with bulk products and brings them directly to neighborhoods, farmers markets, and community spaces across Raleigh, Durham, and Chapel Hill.`,
  },
  {
    id: 'what-to-bring',
    heading: 'What to bring',
    body: `Almost any clean container works:\n• Mason jars and glass containers of any size\n• Old shampoo bottles, pump bottles, and dispensers\n• Reusable bags for dry goods like grains and flour\n• Any food-safe container with a lid\n\nThe container doesn't need to be new or pretty — it just needs to be clean and dry before you fill it.`,
  },
  {
    id: 'not-accepted',
    heading: "What we can't accept",
    body: `To keep products clean and safe, we can't fill:\n• Cracked, chipped, or damaged containers\n• Unwashed containers (anything with residue, mold, or strong odors)\n• Containers not rated for the product type (e.g. a water bottle for laundry detergent)\n\nIf you're unsure, rinse it out and let it dry completely before bringing it. When in doubt, bring it clean and we'll take a look.`,
  },
  {
    id: 'tare-weight',
    heading: 'What is tare weight — and why does it matter?',
    body: `Tare weight is the weight of your empty container. Before we fill anything, we put your jar on the scale, note its weight, and subtract it from the final total. That means you only pay for the product inside — not the glass.\n\nSo if your jar weighs 0.4 lb and you take 1 lb of oats, you pay for 1 lb of oats. No surprises.`,
  },
  {
    id: 'pricing',
    heading: 'How pricing works',
    body: `Everything is priced per pound, per ounce, or per fluid ounce — posted on a board at the popup. You decide how much to take. There are no fixed sizes.\n\nYou pay at the end, once we've weighed your filled container and subtracted the tare. The pre-order estimate on the website is based on the amount you requested — the actual price may vary slightly depending on how much you take.`,
  },
  {
    id: 'discount',
    heading: 'Bring your own container and save 10%',
    body: `If you bring your own container (any clean jar or bottle), we knock 10% off your total. It's our way of saying thank you for reducing waste — and it adds up quickly if you're buying a few items.\n\nIf you don't have a container, you can borrow a jar for a small refundable deposit. Return it at the next popup and get your deposit back.`,
  },
  {
    id: 'reserve',
    heading: 'Pre-ordering vs. walk-up',
    body: `You're always welcome to walk up at any popup — no reservation needed. Pre-ordering just means your products are set aside and measured out before you arrive, so you skip the queue and get in and out faster.\n\nPre-orders close 24 hours before each popup. After that, walk-up only.`,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-heading text-4xl text-purple-deep mb-4">How It Works</h1>
      <p className="text-ink/70 text-lg mb-12 max-w-xl">
        Everything you need to know before your first visit — especially if you've never been
        to a refillery before and are slightly worried about doing it wrong. (You won't.)
      </p>

      <div className="space-y-12">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="font-heading text-2xl text-purple-deep mb-4">{section.heading}</h2>
            <div className="text-ink/80 leading-relaxed space-y-3">
              {section.body.split('\n').map((para, i) =>
                para.startsWith('•') ? (
                  <ul key={i} className="list-none pl-0">
                    {para.split('\n').filter((l) => l.startsWith('•')).map((li, j) => (
                      <li key={j} className="flex gap-2 items-baseline">
                        <span className="text-purple mt-1">•</span>
                        <span>{li.replace('• ', '')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{para}</p>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 bg-lilac/30 rounded-2xl p-8 border border-lilac">
        <h2 className="font-heading text-2xl text-purple-deep mb-3">Ready to try it?</h2>
        <p className="text-ink/70 mb-6">
          Find the next popup near you and reserve your refills ahead of time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/schedule"
            className="px-5 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep transition-colors text-center"
          >
            View schedule
          </Link>
          <Link
            href="/reserve"
            className="px-5 py-3 border border-purple text-purple font-semibold rounded-xl hover:bg-lilac/30 transition-colors text-center"
          >
            Reserve refills
          </Link>
        </div>
      </div>
    </div>
  );
}
