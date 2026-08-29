'use client';

import { useState } from 'react';

const CATEGORIES = ['Pantry', 'Home', 'Body', 'Not sure'];

export default function RequestForm() {
  const [form, setForm] = useState({
    productName: '',
    category: '',
    notes: '',
    submitterName: '',
    email: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  function set(key: keyof typeof form, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: form.productName,
          category: form.category || undefined,
          notes: form.notes || undefined,
          submitterName: form.submitterName || undefined,
          email: form.email || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? 'Something went wrong.');
      }
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-purple flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-2xl text-purple-deep mb-2">Request received!</h3>
        <p className="text-ink/70 max-w-sm mx-auto">
          Thanks for the suggestion — Sunshine reviews every request and considers them when sourcing new products.
        </p>
        <button
          onClick={() => { setForm({ productName: '', category: '', notes: '', submitterName: '', email: '' }); setStatus('idle'); }}
          className="mt-6 text-sm text-purple hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  const inputCls = 'w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple bg-white';
  const labelCls = 'block text-sm font-medium text-ink mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {/* Honeypot */}
      <input type="text" name="_trap" className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" tabIndex={-1} autoComplete="off" />

      <div>
        <label className={labelCls} htmlFor="req-product">
          What product would you like? <span className="text-purple">*</span>
        </label>
        <input
          id="req-product"
          type="text"
          required
          placeholder="e.g. Olive oil, hand lotion, baking soda…"
          value={form.productName}
          onChange={(e) => set('productName', e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="req-category">Category <span className="text-ink/40">(optional)</span></label>
        <select id="req-category" className={inputCls} value={form.category}
          onChange={(e) => set('category', e.target.value)}>
          <option value="">Choose one…</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls} htmlFor="req-notes">
          Any details? <span className="text-ink/40">(optional)</span>
        </label>
        <textarea
          id="req-notes"
          rows={3}
          placeholder="Brand you like, scent preferences, how often you buy it, anything helpful."
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className={inputCls + ' resize-none'}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls} htmlFor="req-name">
            Your name <span className="text-ink/40">(optional)</span>
          </label>
          <input id="req-name" type="text" autoComplete="name"
            placeholder="First name is fine"
            value={form.submitterName}
            onChange={(e) => set('submitterName', e.target.value)}
            className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="req-email">
            Email <span className="text-ink/40">(optional)</span>
          </label>
          <input id="req-email" type="email" autoComplete="email"
            placeholder="We'll let you know if it gets added"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputCls} />
        </div>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending' || !form.productName.trim()}
        className="px-7 py-4 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep disabled:opacity-40 transition-colors"
      >
        {status === 'sending' ? 'Sending…' : 'Submit request'}
      </button>
    </form>
  );
}
