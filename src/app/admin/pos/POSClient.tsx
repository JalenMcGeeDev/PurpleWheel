'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Status = 'loading' | 'waiting' | 'completed' | 'cancelled' | 'failed' | 'no_terminal';

export default function POSClient() {
  const searchParams    = useSearchParams();
  const amountCents     = parseInt(searchParams.get('amount') ?? '0', 10);
  const popupId         = searchParams.get('popup') ?? undefined;
  const amountDollars   = (amountCents / 100).toFixed(2);

  const [status,           setStatus]           = useState<Status>('loading');
  const [errorMsg,         setErrorMsg]         = useState<string | null>(null);
  const [squareCheckoutId, setSquareCheckoutId] = useState<string | null>(null);
  const [txId,             setTxId]             = useState<string | null>(null);

  // Create Terminal checkout on mount
  useEffect(() => {
    if (!amountCents) return;
    (async () => {
      const res  = await fetch('/api/admin/pos/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amountCents, popupId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes('No terminal')) {
          setStatus('no_terminal');
        } else {
          setErrorMsg(data.error ?? 'Failed to start checkout.');
          setStatus('failed');
        }
        return;
      }
      setSquareCheckoutId(data.squareCheckoutId);
      setTxId(data.txId);
      setStatus('waiting');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll Square for payment result every 3 seconds
  useEffect(() => {
    if (!squareCheckoutId || status !== 'waiting') return;
    const interval = setInterval(async () => {
      const res  = await fetch(
        `/api/admin/pos/checkout/${squareCheckoutId}/status?txId=${txId ?? ''}`,
      );
      const data = await res.json();
      if (data.status === 'completed') { setStatus('completed'); clearInterval(interval); }
      if (data.status === 'cancelled') { setStatus('cancelled'); clearInterval(interval); }
      if (data.status === 'failed')    { setStatus('failed'); setErrorMsg('Payment failed on Terminal.'); clearInterval(interval); }
    }, 3000);
    return () => clearInterval(interval);
  }, [squareCheckoutId, status, txId]);

  if (!amountCents) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/50 mb-4">No amount specified.</p>
        <a href="/admin/calculator" className="text-sm text-purple hover:underline">← Go to calculator</a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Amount */}
      <div className="bg-white rounded-2xl border border-lilac p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/50 mb-2">Amount Due</p>
        <p className="font-heading text-6xl text-purple-deep">${amountDollars}</p>
      </div>

      {status === 'loading' && (
        <div className="bg-white rounded-2xl border border-lilac p-6 flex items-center justify-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-lilac border-t-purple animate-spin shrink-0" />
          <p className="text-sm text-ink/60">Sending to Terminal…</p>
        </div>
      )}

      {status === 'waiting' && (
        <div className="bg-white rounded-2xl border border-lilac p-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-6 h-6 rounded-full border-2 border-lilac border-t-purple animate-spin shrink-0" />
            <p className="font-medium text-ink">Waiting for payment on Terminal…</p>
          </div>
          <p className="text-sm text-ink/50">The payment screen has appeared on your Square Terminal.</p>
        </div>
      )}

      {status === 'completed' && (
        <div className="bg-green-50 rounded-2xl border border-green-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-heading text-2xl text-green-700">Payment accepted!</p>
          <p className="text-green-600 mt-1">${amountDollars} collected.</p>
          <a href="/admin/calculator" className="mt-6 inline-block text-sm text-purple hover:underline">← New transaction</a>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="bg-white rounded-2xl border border-lilac p-6 text-center">
          <p className="font-medium text-ink/70">Payment cancelled on Terminal.</p>
          <a href="/admin/calculator" className="mt-3 inline-block text-sm text-purple hover:underline">← Back to calculator</a>
        </div>
      )}

      {status === 'failed' && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
          <p className="text-sm text-red-600">{errorMsg}</p>
          <a href="/admin/calculator" className="mt-3 inline-block text-sm text-purple hover:underline">← Back to calculator</a>
        </div>
      )}

      {status === 'no_terminal' && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-amber-800">No Terminal paired yet.</p>
          <a
            href="/admin/pos/pair"
            className="inline-block px-5 py-2.5 bg-purple text-white text-sm font-semibold rounded-xl hover:bg-purple-deep transition-colors"
          >
            Pair a Terminal →
          </a>
        </div>
      )}
    </div>
  );
}
