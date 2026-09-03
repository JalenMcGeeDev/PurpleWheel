'use client';
import { useState } from 'react';
import { format } from 'date-fns';

interface Signup { id: string; email: string; source: string; createdAt: string }
interface Props { signups: Signup[] }

export default function EmailListClient({ signups }: Props) {
  const [subject,  setSubject]  = useState('');
  const [body,     setBody]     = useState('');
  const [sending,  setSending]  = useState(false);
  const [result,   setResult]   = useState<{ ok: boolean; message: string } | null>(null);

  const allEmails = signups.map((s) => s.email).join(', ');

  async function sendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    const res = await fetch('/api/admin/email-broadcast', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setResult({ ok: res.ok, message: data.message ?? (res.ok ? 'Sent!' : data.error ?? 'Failed.') });
    if (res.ok) { setSubject(''); setBody(''); }
    setSending(false);
  }

  return (
    <div className="space-y-8">
      {/* Subscriber list */}
      <div className="bg-white rounded-2xl border border-lilac overflow-hidden">
        {signups.length === 0 ? (
          <p className="text-center text-ink/40 py-10">No subscribers yet.</p>
        ) : (
          <>
            <div className="divide-y divide-lilac/40">
              {signups.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-ink">{s.email}</span>
                  <span className="text-xs text-ink/40">{format(new Date(s.createdAt), 'MMM d, yyyy')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-lilac px-5 py-3 flex items-center justify-between">
              <p className="text-xs text-ink/40">All emails</p>
              <button
                onClick={() => navigator.clipboard.writeText(allEmails)}
                className="text-xs text-purple hover:underline"
              >
                Copy all addresses
              </button>
            </div>
          </>
        )}
      </div>

      {/* Broadcast email */}
      {signups.length > 0 && (
        <div className="bg-white rounded-2xl border border-lilac p-6">
          <h2 className="font-heading text-xl text-purple-deep mb-4">Send broadcast email</h2>
          <form onSubmit={sendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="New popup dates added!"
                className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                Message <span className="normal-case font-normal text-ink/40">(plain text)</span>
              </label>
              <textarea
                required
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hey! We just added new popup dates for September..."
                className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink/40">Sends to {signups.length} subscriber{signups.length !== 1 ? 's' : ''}</p>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep transition-colors disabled:opacity-40"
              >
                {sending ? 'Sending...' : 'Send email'}
              </button>
            </div>
            {result && (
              <p className={`text-sm ${result.ok ? 'text-green-600' : 'text-red-500'}`}>{result.message}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
