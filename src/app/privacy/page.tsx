import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-heading text-4xl text-purple-deep mb-4">Privacy Policy</h1>
      <p className="text-ink/50 text-sm mb-10">Last updated: August 2026</p>

      <div className="space-y-8 text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-purple-deep mb-3">What we collect</h2>
          <p>
            When you make a reservation, we collect your name, email address, and optionally your
            phone number. When you submit a hosting inquiry, we collect your name, organization,
            email, and optionally your phone number.
          </p>
          <p className="mt-3">
            We don't collect payment information. No payment is taken through this website.
          </p>
          <p className="mt-3">
            We use Vercel Analytics for basic page-view statistics. It is cookie-free and collects
            no personally identifiable information.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-purple-deep mb-3">How we use it</h2>
          <ul className="space-y-2">
            {[
              'To send you a confirmation email and a day-of reminder for your reservation.',
              'To prepare your order ahead of the popup.',
              'To follow up on hosting inquiries.',
              'We do not sell, share, or rent your information to anyone.',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-purple mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-purple-deep mb-3">How long we keep it</h2>
          <p>
            Reservation records are kept for one year, then deleted. Hosting inquiries are kept
            until they're resolved or for one year, whichever comes first.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-purple-deep mb-3">Your rights</h2>
          <p>
            To request deletion of your information, email{' '}
            <a href="mailto:hello@purplewheel.store" className="text-purple underline">
              hello@purplewheel.store
            </a>{' '}
            with the subject line "Data deletion request" and the email address you used.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-purple-deep mb-3">Questions</h2>
          <p>
            Email{' '}
            <a href="mailto:hello@purplewheel.store" className="text-purple underline">
              hello@purplewheel.store
            </a>{' '}
            with any privacy questions.
          </p>
        </section>
      </div>
    </div>
  );
}
