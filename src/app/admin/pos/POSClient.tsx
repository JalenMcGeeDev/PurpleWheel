'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../../lib/supabase-browser';
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
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';

      const res = await fetch('/api/admin/pos/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

const STATUS_LABEL: Record<Status, string> = {
  idle:        '',
  creating:    'Sending to reader\u2026',
  pending:     'Waiting for customer\u2026',
  in_progress: 'Processing payment\u2026',
  completed:   'Payment complete!',
  cancelled:   'Payment cancelled.',
  failed:      'Payment failed.',
};

const ACTIVE_STATUSES   = new Set<Status>(['creating', 'pending', 'in_progress']);
const TERMINAL_STATUSES = new Set<Status>(['completed', 'cancelled', 'failed']);

export default function POSClient() {
  const searchParams  = useSearchParams();
  const amountCents   = parseInt(searchParams.get('amount') ?? '0', 10);
  const popupId       = searchParams.get('popup') ?? undefined;

  const [status,     setStatus]   = useState<Status>('idle');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [errorMsg,   setErrorMsg] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const amountDollars = (amountCents / 100).toFixed(2);

  async function getToken(): Promise<string> {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  }

  async function startCheckout() {
    setStatus('creating');
    setErrorMsg(null);

    const token = await getToken();
    let res: Response;
    try {
      res = await fetch('/api/admin/pos/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ amountCents, popupId }),
      });
    } catch {
      setStatus('failed');
      setErrorMsg('Network error. Please try again.');
      return;
    }

    const data = await res.json();
    if (!res.ok) {
      setStatus('failed');
      setErrorMsg(data.error ?? 'Failed to create checkout.');
      return;
    }

    setCheckoutId(data.checkoutId);
    setStatus('pending');

    const es = new EventSource(`/api/admin/pos/events/${data.checkoutId}`);
    esRef.current = es;
    es.onmessage = (e) => {
      const payload = JSON.parse(e.data) as { status: Status };
      setStatus(payload.status);
      if (TERMINAL_STATUSES.has(payload.status)) es.close();
    };
    es.onerror = () => es.close();
  }

  async function cancelCheckout() {
    if (!checkoutId) return;
    const token = await getToken();
    await fetch(`/api/admin/pos/checkout/${checkoutId}/cancel`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    // Status update will arrive via webhook → SSE
  }

  useEffect(() => {
    if (amountCents > 0) startCheckout();
    return () => { esRef.current?.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!amountCents) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/50 mb-4">No amount specified.</p>
        <a href="/admin/calculator" className="text-sm text-purple hover:underline">
          ← Go to calculator
        </a>
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

      {/* Status */}
      <div className="bg-white rounded-2xl border border-lilac p-6 flex items-center gap-4 min-h-[80px]">
        <StatusIndicator status={status} />
        <div>
          <p className="font-medium text-ink">{STATUS_LABEL[status]}</p>
          {errorMsg && <p className="text-sm text-red-500 mt-1">{errorMsg}</p>}
        </div>
      </div>

      {/* Cancel */}
      {ACTIVE_STATUSES.has(status) && (
        <button
          onClick={cancelCheckout}
          className="w-full py-3 border border-lilac text-ink/50 text-sm rounded-xl hover:bg-lilac/20 transition-colors"
        >
          Cancel payment
        </button>
      )}

      {/* Done actions */}
      {TERMINAL_STATUSES.has(status) && (
        <a
          href="/admin/calculator"
          className="block w-full py-3 text-center border border-lilac text-ink/60 text-sm rounded-xl hover:bg-lilac/20 transition-colors"
        >
          ← New transaction
        </a>
      )}
    </div>
  );
}

function StatusIndicator({ status }: { status: Status }) {
  if (status === 'completed') {
    return (
      <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'cancelled') {
    return (
      <div className="shrink-0 w-10 h-10 rounded-full bg-lilac/40 flex items-center justify-center">
        <svg className="w-5 h-5 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
    );
  }
  // Active states — spinner
  return (
    <div className="shrink-0 w-10 h-10 rounded-full border-2 border-lilac border-t-purple animate-spin" />
  );
}
