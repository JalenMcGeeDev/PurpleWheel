'use client';

import { useState } from 'react';

type LocationType = 'office' | 'apartment community' | 'retail' | 'other';

const VENUE_TYPES: { value: LocationType; label: string; desc: string }[] = [
  {
    value: 'office',
    label: 'Office or co-working space',
    desc: 'A great perk for employees - we set up in a common area or breakroom.',
  },
  {
    value: 'apartment community',
    label: 'Apartment community',
    desc: 'Residents shop without leaving home. We work well in courtyards and clubhouses.',
  },
  {
    value: 'retail',
    label: 'Retail shop or market',
    desc: "Partner with us for a pop-in event - brings new foot traffic to your space.",
  },
  {
    value: 'other',
    label: 'Something else',
    desc: 'School, church, community center - reach out and let\'s figure it out.',
  },
];

export default function HostForm() {
  const [form, setForm] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    locationType: '' as LocationType | '',
    estimatedAudience: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/host-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Something went wrong.');
      }
      setStatus('sent');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-purple flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-2xl text-purple-deep mb-2">Inquiry received!</h3>
        <p className="text-ink/70 max-w-sm mx-auto">
          Thanks, {form.name}. Sunshine will be in touch within a day or two to talk through the details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {/* Honeypot */}
      <input type="text" name="_trap" className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" tabIndex={-1} autoComplete="off" />

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="hi-name">
            Your name <span className="text-purple">*</span>
          </label>
          <input
            id="hi-name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="hi-org">
            Organization / venue name <span className="text-purple">*</span>
          </label>
          <input
            id="hi-org"
            type="text"
            required
            value={form.organization}
            onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
            className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="hi-email">
            Email <span className="text-purple">*</span>
          </label>
          <input
            id="hi-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="hi-phone">
            Phone <span className="text-ink/40">(optional)</span>
          </label>
          <input
            id="hi-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
          />
        </div>
      </div>

      <div>
        <p className="block text-sm font-medium text-ink mb-3">
          Venue type <span className="text-purple">*</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {VENUE_TYPES.map(({ value, label, desc }) => (
            <label
              key={value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                form.locationType === value
                  ? 'border-purple bg-lilac/20'
                  : 'border-lilac hover:border-purple/40 bg-white'
              }`}
            >
              <input
                type="radio"
                name="locationType"
                required
                value={value}
                checked={form.locationType === value}
                onChange={() => setForm((p) => ({ ...p, locationType: value }))}
                className="mt-0.5 accent-purple"
              />
              <div>
                <p className="font-medium text-sm text-ink">{label}</p>
                <p className="text-xs text-ink/50 mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="hi-audience">
          Estimated audience size <span className="text-ink/40">(optional)</span>
        </label>
        <input
          id="hi-audience"
          type="text"
          placeholder="e.g. 50–100 residents, about 200 employees"
          value={form.estimatedAudience}
          onChange={(e) => setForm((p) => ({ ...p, estimatedAudience: e.target.value }))}
          className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="hi-message">
          Tell us about your space <span className="text-purple">*</span>
        </label>
        <textarea
          id="hi-message"
          required
          rows={4}
          placeholder="Location, available space, preferred dates or frequency, anything else you'd like us to know."
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="px-7 py-4 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep disabled:opacity-40 transition-colors"
      >
        {status === 'sending' ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  );
}

