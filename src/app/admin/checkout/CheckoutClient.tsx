'use client';
import { useState, useMemo, useEffect } from 'react';
import type { Product, Popup } from '../../../types';

interface Props { products: Product[]; popups: Popup[] }

type Phase = 'entry' | 'payment' | 'pairing';
type PayStatus = 'loading' | 'waiting' | 'completed' | 'cancelled' | 'failed';
type PairStep = 'idle' | 'generating' | 'waiting' | 'done' | 'error';

const TAX_RATES: Record<string, number> = {
  Raleigh: 0.0725,
  Durham: 0.075,
  'Chapel Hill': 0.075,
  Other: 0.075,
};

const CATEGORIES = ['Pantry', 'Home', 'Body'] as const;

export default function CheckoutClient({ products, popups }: Props) {
  // Entry state
  const [popupId,      setPopupId]      = useState(popups[0]?.id ?? '');
  const [ownContainer, setOwnContainer] = useState(false);
  const [amounts,      setAmounts]      = useState<Record<string, string>>({});

  // Payment state
  const [phase,           setPhase]           = useState<Phase>('entry');
  const [payStatus,       setPayStatus]       = useState<PayStatus>('loading');
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);
  const [squareCheckoutId, setSquareCheckoutId] = useState<string | null>(null);
  const [txId,            setTxId]            = useState<string | null>(null);

  // Pairing state
  const [pairStep,     setPairStep]     = useState<PairStep>('idle');
  const [pairCode,     setPairCode]     = useState('');
  const [pairCodeId,   setPairCodeId]   = useState('');
  const [pairLocId,    setPairLocId]    = useState('');
  const [pairError,    setPairError]    = useState('');
  const [pairPollRef,  setPairPollRef]  = useState<ReturnType<typeof setInterval> | null>(null);

  const selectedPopup = popups.find((p) => p.id === popupId);
  const taxRate = TAX_RATES[selectedPopup?.city ?? 'Other'] ?? 0.075;
  const discountRate = ownContainer ? 0.1 : 0;

  const lines = useMemo(() => products
    .filter((p) => p.available && parseFloat(amounts[p.id] || '0') > 0)
    .map((p) => {
      const amount = parseFloat(amounts[p.id]);
      const base   = amount * p.pricePerUnit;
      const sale   = base * (1 - discountRate);
      const tax    = p.taxable ? sale * taxRate : 0;
      return { product: p, amount, base, sale, tax };
    }), [products, amounts, discountRate, taxRate]);

  const subtotalRaw          = lines.reduce((s, l) => s + l.base, 0);
  const discountAmount       = subtotalRaw * discountRate;
  const subtotalAfterDiscount = subtotalRaw - discountAmount;
  const totalTax             = lines.reduce((s, l) => s + l.tax, 0);
  const grandTotal           = subtotalAfterDiscount + totalTax;
  const grandTotalCents      = Math.round(grandTotal * 100);

  function setAmount(id: string, val: string) {
    setAmounts((prev) => ({ ...prev, [id]: val }));
  }

  function clear() {
    setAmounts({});
    setOwnContainer(false);
  }

  function startPayment() {
    setPhase('payment');
    setPayStatus('loading');
    setErrorMsg(null);
    setSquareCheckoutId(null);
    setTxId(null);
  }

  async function generatePairCode() {
    setPairStep('generating');
    setPairError('');
    const res  = await fetch('/api/admin/pos/pair', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { setPairError(data.error); setPairStep('error'); return; }
    setPairCode(data.code);
    setPairCodeId(data.codeId);
    setPairLocId(data.locationId);
    setPairStep('waiting');
    const id = setInterval(async () => {
      const r = await fetch(`/api/admin/pos/pair/${data.codeId}?locationId=${data.locationId}`);
      const d = await r.json();
      if (d.status === 'PAIRED') {
        clearInterval(id);
        setPairStep('done');
        // After pairing, retry checkout automatically
        setTimeout(() => {
          setPairStep('idle');
          setPhase('payment');
          setPayStatus('loading');
          setSquareCheckoutId(null);
          setTxId(null);
        }, 1500);
      }
      if (d.status === 'EXPIRED') {
        clearInterval(id);
        setPairError('Code expired. Try again.');
        setPairStep('error');
      }
    }, 3000);
    setPairPollRef(id);
  }

  function cancelPairing() {
    if (pairPollRef) clearInterval(pairPollRef);
    setPairStep('idle');
    setPhase('entry');
  }

  // Create Terminal checkout when phase flips to payment
  useEffect(() => {
    if (phase !== 'payment') return;
    (async () => {
      const res  = await fetch('/api/admin/pos/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amountCents: grandTotalCents, popupId: popupId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes('No terminal')) {
          setPhase('pairing');
        } else {
          setErrorMsg(data.error ?? 'Failed to start checkout.');
          setPayStatus('failed');
        }
        return;
      }
      setSquareCheckoutId(data.squareCheckoutId);
      setTxId(data.txId);
      setPayStatus('waiting');
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Poll for payment result
  useEffect(() => {
    if (!squareCheckoutId || payStatus !== 'waiting') return;
    const interval = setInterval(async () => {
      const res  = await fetch(`/api/admin/pos/checkout/${squareCheckoutId}/status?txId=${txId ?? ''}`);
      const data = await res.json();
      if (data.status === 'completed') { setPayStatus('completed'); clearInterval(interval); }
      if (data.status === 'cancelled') { setPayStatus('cancelled'); clearInterval(interval); }
      if (data.status === 'failed')    { setPayStatus('failed'); setErrorMsg('Payment failed on Terminal.'); clearInterval(interval); }
    }, 3000);
    return () => clearInterval(interval);
  }, [squareCheckoutId, payStatus, txId]);

  // ── Pairing phase ────────────────────────────────────────────────────────
  if (phase === 'pairing') {
    return (
      <div className="space-y-5">
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <p className="font-medium text-amber-800 mb-1">No Terminal paired</p>
          <p className="text-sm text-amber-700">Pair your Square Terminal below to continue.</p>
        </div>

        {pairStep === 'idle' && (
          <button onClick={generatePairCode} className="w-full py-4 bg-purple text-white font-bold rounded-xl hover:bg-purple-deep transition-colors">
            Generate Pairing Code
          </button>
        )}

        {pairStep === 'generating' && (
          <div className="flex items-center justify-center py-8 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-lilac border-t-purple animate-spin" />
            <p className="text-sm text-ink/60">Generating code...</p>
          </div>
        )}

        {pairStep === 'waiting' && (
          <div className="bg-white rounded-2xl border border-lilac p-8 text-center space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Enter this code on your Terminal</p>
            <p className="font-heading text-5xl tracking-[0.2em] text-purple-deep font-bold">{pairCode}</p>
            <p className="text-sm text-ink/60">On the Terminal: Settings → Connect Device → enter the code</p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="w-4 h-4 rounded-full border-2 border-lilac border-t-purple animate-spin shrink-0" />
              <span className="text-sm text-ink/40">Waiting for Terminal to pair...</span>
            </div>
            <button onClick={cancelPairing} className="text-xs text-ink/30 hover:text-ink/60">Cancel</button>
          </div>
        )}

        {pairStep === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="font-semibold text-green-700">Terminal paired! Retrying checkout...</p>
          </div>
        )}

        {pairStep === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
            <p className="text-sm text-red-600">{pairError}</p>
            <button onClick={() => setPairStep('idle')} className="text-sm text-purple hover:underline">Try again</button>
          </div>
        )}

        {pairStep === 'idle' && (
          <button onClick={cancelPairing} className="w-full py-3 border border-lilac text-ink/50 text-sm rounded-xl hover:bg-lilac/20 transition-colors">
            Back to order
          </button>
        )}
      </div>
    );
  }

  // ── Payment phase ─────────────────────────────────────────────────────────
  if (phase === 'payment') {
    const amountDollars = (grandTotalCents / 100).toFixed(2);
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-lilac p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/50 mb-2">Amount Due</p>
          <p className="font-heading text-6xl text-purple-deep">${amountDollars}</p>
        </div>

        {payStatus === 'loading' && (
          <div className="bg-white rounded-2xl border border-lilac p-6 flex items-center justify-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-lilac border-t-purple animate-spin shrink-0" />
            <p className="text-sm text-ink/60">Sending to Terminal...</p>
          </div>
        )}

        {payStatus === 'waiting' && (
          <div className="bg-white rounded-2xl border border-lilac p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-6 h-6 rounded-full border-2 border-lilac border-t-purple animate-spin shrink-0" />
              <p className="font-medium text-ink">Waiting for payment on Terminal...</p>
            </div>
            <p className="text-sm text-ink/50">The payment screen has appeared on your Square Terminal.</p>
          </div>
        )}

        {payStatus === 'completed' && (
          <div className="bg-green-50 rounded-2xl border border-green-200 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-heading text-2xl text-green-700">Payment accepted!</p>
            <p className="text-green-600 mt-1">${amountDollars} collected.</p>
            <button
              onClick={() => { setPhase('entry'); clear(); }}
              className="mt-6 text-sm text-purple hover:underline"
            >
              New transaction
            </button>
          </div>
        )}

        {payStatus === 'cancelled' && (
          <div className="bg-white rounded-2xl border border-lilac p-6 text-center space-y-3">
            <p className="font-medium text-ink/70">Payment cancelled on Terminal.</p>
            <button onClick={() => setPhase('entry')} className="text-sm text-purple hover:underline">
              Back to order
            </button>
          </div>
        )}

        {payStatus === 'failed' && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 space-y-3">
            <p className="text-sm text-red-600">{errorMsg}</p>
            <button onClick={() => setPhase('entry')} className="text-sm text-purple hover:underline">
              Back to order
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Entry phase ───────────────────────────────────────────────────────────
  const inputCls = 'w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple';

  return (
    <div className="space-y-6">
      {/* Popup + container */}
      <div className="bg-white rounded-2xl border border-lilac p-5 grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-2">
            Popup location
          </label>
          <select value={popupId} onChange={(e) => setPopupId(e.target.value)} className={inputCls}>
            {popups.map((p) => (
              <option key={p.id} value={p.id}>{p.title} - {p.city}</option>
            ))}
          </select>
          <p className="text-xs text-ink/50 mt-1.5">
            Tax rate: <strong>{(taxRate * 100).toFixed(2)}%</strong> ({selectedPopup?.city ?? '-'})
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-3">
            Own container?
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setOwnContainer((v) => !v)}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${ownContainer ? 'bg-purple' : 'bg-lilac'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${ownContainer ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-medium text-ink">
              {ownContainer ? '10% discount applied' : 'No discount'}
            </span>
          </label>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-2xl border border-lilac overflow-hidden">
        {CATEGORIES.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat && p.available);
          if (!catProducts.length) return null;
          return (
            <div key={cat}>
              <div className="bg-lilac/20 px-5 py-2 border-b border-lilac">
                <p className="text-xs font-bold uppercase tracking-widest text-purple">{cat}</p>
              </div>
              {catProducts.map((product) => {
                const val = amounts[product.id] ?? '';
                const amount = parseFloat(val);
                const lineTotal = !isNaN(amount) && amount > 0
                  ? amount * product.pricePerUnit * (1 - discountRate)
                  : null;
                return (
                  <div key={product.id} className="flex items-center gap-4 px-5 py-3 border-b border-lilac/30 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{product.name}</p>
                      <p className="text-xs text-ink/50">
                        ${product.pricePerUnit.toFixed(2)} {product.unit}
                        {product.taxable && <span className="ml-1 text-ink/40">- taxable</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number" min="0" step="0.01" placeholder="0" value={val}
                        onChange={(e) => setAmount(product.id, e.target.value)}
                        className="w-20 border border-lilac rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:border-purple"
                        aria-label={`Amount of ${product.name}`}
                      />
                      <span className="text-xs text-ink/40 w-8">{product.unit.replace('per ', '')}</span>
                    </div>
                    {lineTotal !== null && (
                      <p className="shrink-0 w-16 text-right text-sm font-semibold text-purple">
                        ${lineTotal.toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Receipt */}
      <div className="bg-white rounded-2xl border border-lilac p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-4">Receipt</p>
        {lines.length === 0 ? (
          <p className="text-sm text-ink/40 text-center py-4">Enter amounts above to see the total.</p>
        ) : (
          <div className="space-y-1 text-sm">
            {lines.map((l) => (
              <div key={l.product.id} className="flex justify-between text-ink/70">
                <span>{l.product.name} <span className="text-ink/40">({l.amount} {l.product.unit.replace('per ', '')})</span></span>
                <span>${l.sale.toFixed(2)}</span>
              </div>
            ))}
            {ownContainer && (
              <div className="flex justify-between text-purple border-t border-lilac pt-2 mt-2">
                <span>Container discount (10%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-lilac pt-2 mt-2">
              <div className="flex justify-between text-ink/70">
                <span>Sales tax ({(taxRate * 100).toFixed(2)}%)</span>
                <span>${totalTax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-xl text-ink border-t-2 border-ink pt-3 mt-3">
              <span>Total due</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {lines.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={startPayment}
            className="w-full py-4 bg-purple text-white font-bold text-lg rounded-xl hover:bg-purple-deep transition-colors"
          >
            Charge ${grandTotal.toFixed(2)}
          </button>
          <button
            onClick={clear}
            className="w-full py-3 border border-lilac text-ink/50 text-sm rounded-xl hover:bg-lilac/20 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
