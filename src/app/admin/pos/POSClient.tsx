'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildSquarePOSData } from '../../../lib/square';

type State = 'loading' | 'ready' | 'opening' | 'failed';

export default function POSClient() {
  const searchParams  = useSearchParams();
  const amountCents   = parseInt(searchParams.get('amount') ?? '0', 10);
  const popupId       = searchParams.get('popup') ?? undefined;
  const amountDollars = (amountCents / 100).toFixed(2);

  const [state,    setState]   = useState<State>('loading');
  const [txId,     setTxId]    = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!amountCents) return;
    (async () => {
      const res = await fetch('/api/admin/pos/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amountCents, popupId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Failed to prepare transaction.');
        setState('failed');
        return;
      }
      setTxId(data.txId);
      setState('ready');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openSquare() {
    if (!txId) return;
    setState('opening');

    const origin      = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const callbackUrl = `${origin}/admin/pos/result?txId=${txId}`;
    const encoded     = buildSquarePOSData(amountCents, callbackUrl, txId);
    const isAndroid   = /android/i.test(navigator.userAgent);

    const url = isAndroid
      ? `intent:#Intent;action=com.squareup.register.action.CHARGE;package=com.squareup;S.data=${encoded};end`
      : `squarecommerce://v1/charge?data=${encoded}`;

    window.location.href = url;
  }

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

      {state === 'loading' && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-lilac border-t-purple animate-spin" />
        </div>
      )}

      {state === 'ready' && (
        <button
          onClick={openSquare}
          className="w-full py-5 bg-purple text-white font-bold text-lg rounded-xl hover:bg-purple-deep transition-colors"
        >
          Open Square
        </button>
      )}

      {state === 'opening' && (
        <div className="bg-white rounded-2xl border border-lilac p-6 text-center space-y-1">
          <p className="font-medium text-ink">Opening Square app…</p>
          <p className="text-sm text-ink/50">Complete the payment there. The result will appear when you return.</p>
        </div>
      )}

      {state === 'failed' && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
          <p className="text-sm text-red-600">{errorMsg}</p>
          <a href="/admin/calculator" className="mt-3 inline-block text-sm text-purple hover:underline">← Back to calculator</a>
        </div>
      )}
    </div>
  );
}
