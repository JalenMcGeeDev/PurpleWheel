'use client';
import { useState } from 'react';
import { siteSettings } from '../data/siteSettings';

export default function EmailSignupForm() {
  const [email,     setEmail]     = useState('');
  const [status,    setStatus]    = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg,  setErrorMsg]  = useState('');
  const [trap,      setTrap]      = useState(''); // honeypot

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const res  = await fetch('/api/email-signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, _trap: trap }),
    });
    if (res.ok) {
      setStatus('success');
    } else {
      const d = await res.json().catch(() => ({}));
      setErrorMsg((d as { error?: string }).error ?? 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-purple font-medium">
        You're on the list! We'll let you know when new popup dates are added.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      {/* Honeypot - hidden from real users */}
      <input
        type="text"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="absolute opacity-0 h-0 w-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
      />
      <label htmlFor="signup-email" className="sr-only">Email address</label>
      <input
        id="signup-email"
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Saving...' : 'Notify me'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-red-500 w-full text-center">{errorMsg}</p>
      )}
    </form>
  );
}
