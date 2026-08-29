'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../../lib/supabase-browser';
import Image from 'next/image';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('sunshine.alv5@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  async function handleMagicLink() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicSent(true);
      setLoading(false);
    }
  }

  if (magicSent) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-purple flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-heading text-lg text-purple-deep mb-2">Check your email</p>
        <p className="text-sm text-ink/60">A sign-in link was sent to <strong>{email}</strong>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="grid gap-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep disabled:opacity-40 transition-colors"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-lilac" /></div>
        <div className="relative text-center"><span className="bg-cream px-3 text-xs text-ink/40">or</span></div>
      </div>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading}
        className="w-full py-3 border border-lilac text-ink/70 text-sm font-medium rounded-xl hover:bg-lilac/20 disabled:opacity-40 transition-colors"
      >
        Send sign-in link to my email
      </button>
    </form>
  );
}
