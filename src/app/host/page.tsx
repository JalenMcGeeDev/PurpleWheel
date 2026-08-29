import type { Metadata } from 'next';
import HostForm from '../../components/HostForm';

export const metadata: Metadata = {
  title: 'Host a Popup',
  description: 'Bring The Purple Wheel to your office, apartment community, or shop. Inquire about hosting a refillery popup event.',
};

const VENUE_TYPES = [
  {
    icon: '🏢',
    title: 'Offices & co-working spaces',
    body: 'Zero-waste shopping as a workplace perk. We set up in a breakroom, lobby, or common area. Employees shop on their lunch break without leaving the building.',
  },
  {
    icon: '🏠',
    title: 'Apartment communities',
    body: 'Residents love the convenience of a popup right in their courtyard or clubhouse. It\'s a selling point for eco-conscious renters — and a reason to stay.',
  },
  {
    icon: '🛍️',
    title: 'Retail shops & local markets',
    body: 'A pop-in event brings new foot traffic and aligns your brand with sustainability. We handle everything — just provide the space.',
  },
];

export default function HostPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-heading text-4xl text-purple-deep mb-4">Host a popup</h1>
      <p className="text-ink/70 text-lg mb-12 max-w-xl">
        Bring zero-waste refilling directly to your community. Sunshine does all the heavy
        lifting — you just provide the space and the people.
      </p>

      {/* What it looks like */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl text-purple-deep mb-6">What hosting involves</h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-lilac/20 rounded-2xl p-6 border border-lilac">
            <p className="text-xs font-bold uppercase tracking-widest text-purple mb-3">What you provide</p>
            <ul className="space-y-2 text-sm text-ink/80">
              {['A space of roughly 10×10 ft (a table and a little room to move)', 'Access to electricity (optional but helpful)', 'Communication to your residents, employees, or customers'].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-purple mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-lilac">
            <p className="text-xs font-bold uppercase tracking-widest text-purple mb-3">What we bring</p>
            <ul className="space-y-2 text-sm text-ink/80">
              {['Everything — the van, products, scale, signage, bags, and jars', 'Setup and teardown in under 30 minutes', 'A friendly, knowledgeable host to answer questions', 'A prep list of pre-orders so the line moves fast'].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-purple mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-lilac p-5 text-sm text-ink/70">
          <strong className="text-ink">Typical popup:</strong> 2–4 hours, depending on location and crowd size. No hosting fee — it&apos;s free to host. We appreciate you spreading the word.
        </div>
      </section>

      {/* Venue types */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl text-purple-deep mb-6">Who hosts our popups</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {VENUE_TYPES.map(({ icon, title, body }) => (
            <div key={title} className="bg-white rounded-2xl border border-lilac/50 p-6">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-heading text-lg text-purple-deep mb-2">{title}</h3>
              <p className="text-sm text-ink/70 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section>
        <h2 className="font-heading text-2xl text-purple-deep mb-2">Get in touch</h2>
        <p className="text-ink/60 mb-8 text-sm">
          Fill out the form and Sunshine will reach out within a day or two. No commitment required.
        </p>
        <div className="bg-white rounded-2xl border border-lilac p-6 sm:p-8">
          <HostForm />
        </div>
      </section>
    </div>
  );
}
