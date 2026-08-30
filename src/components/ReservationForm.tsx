'use client';

import { useState, useMemo } from 'react';
import type { Popup, Product, ReservationItem } from '../types';

interface ReservationFormProps {
  popups: Popup[];
  products: Product[];
  discountPercentage: number;
  jarDepositAmount: number;
}

type Step = 'popup' | 'items' | 'container' | 'contact' | 'confirm' | 'closed';

interface FormState {
  popupId: string;
  items: ReservationItem[];
  bringingOwnContainer: boolean;
  customerName: string;
  email: string;
  phone: string;
  orderCode: string;
}

const STEPS: Step[] = ['popup', 'items', 'container', 'contact', 'confirm'];

function StepBar({ current }: { current: Step }) {
  const labels = ['Choose popup', 'Add items', 'Container?', 'Your info', 'Done'];
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-0 mb-8" aria-label="Reservation steps">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < idx
                  ? 'bg-purple text-white'
                  : i === idx
                  ? 'bg-purple-deep text-white ring-2 ring-purple/40'
                  : 'bg-lilac text-purple-darker'
              }`}
            >
              {i < idx ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs hidden sm:block ${i === idx ? 'text-purple-deep font-semibold' : 'text-ink/50'}`}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < idx ? 'bg-purple' : 'bg-lilac'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ReservationForm({
  popups,
  products,
  discountPercentage,
  jarDepositAmount,
}: ReservationFormProps) {
  const now = new Date();

  const availablePopups = popups.filter(
    (p) => p.status === 'scheduled' && p.preordersEnabled && new Date(p.preorderCutoff) > now,
  );

  const [step, setStep] = useState<Step>(availablePopups.length > 0 ? 'popup' : 'closed');
  const [form, setForm] = useState<FormState>({
    popupId: availablePopups[0]?.id ?? '',
    items: [],
    bringingOwnContainer: false,
    customerName: '',
    email: '',
    phone: '',
    orderCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Per-item amount inputs (local, not part of form state until added)
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const selectedPopup = popups.find((p) => p.id === form.popupId);

  const subtotal = useMemo(
    () => form.items.reduce((sum, i) => sum + i.estimatedCost, 0),
    [form.items],
  );

  const discount = 0;
  const estimatedTotal = subtotal + (form.bringingOwnContainer ? 0 : jarDepositAmount);

  function setAmount(productId: string, value: string) {
    setAmounts((prev) => ({ ...prev, [productId]: value }));
  }

  function upsertItem(product: Product) {
    const raw = amounts[product.id] ?? '';
    const amount = parseFloat(raw);
    if (!raw || isNaN(amount) || amount <= 0) return;

    const estimatedCost = parseFloat((amount * product.pricePerUnit).toFixed(2));
    const newItem: ReservationItem = {
      productId: product.id,
      productName: product.name,
      requestedAmount: amount,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit,
      estimatedCost,
    };

    setForm((prev) => {
      const existing = prev.items.findIndex((i) => i.productId === product.id);
      const items =
        existing >= 0
          ? prev.items.map((item, idx) => (idx === existing ? newItem : item))
          : [...prev.items, newItem];
      return { ...prev, items };
    });
    setAmounts((prev) => ({ ...prev, [product.id]: '' }));
  }

  function removeItem(productId: string) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) }));
  }

  async function submitReservation() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId: form.popupId,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone || undefined,
          items: form.items,
          bringingOwnContainer: form.bringingOwnContainer,
          estimatedTotal,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Something went wrong. Please try again.');
      }
      const data = (await res.json()) as { orderCode: string };
      setForm((prev) => ({ ...prev, orderCode: data.orderCode }));
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Closed state ─────────────────────────────────────────────────────────
  if ((step as string) === 'closed' || availablePopups.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-lilac flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12A9 9 0 113 12a9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-heading text-2xl text-purple-deep mb-3">Pre-orders are closed</h2>
        <p className="text-ink/70 mb-6">
          There are no upcoming popups with open pre-orders right now. Walk-ups are always welcome at
          the popup - check the schedule for the next date.
        </p>
        <a href="/schedule" className="inline-block px-6 py-3 bg-purple text-white rounded-xl font-semibold hover:bg-purple-deep transition-colors">
          View schedule
        </a>
      </div>
    );
  }

  const categories = ['Pantry', 'Home', 'Body'] as const;

  return (
    <div className="max-w-2xl mx-auto">
      <StepBar current={step} />

      {/* ── Step 1: Choose popup ─────────────────────────────────────────── */}
      {step === 'popup' && (
        <div>
          <h2 className="font-heading text-2xl text-purple-deep mb-6">Choose a popup</h2>
          <div className="grid gap-4">
            {availablePopups.map((popup) => {
              const cutoff = new Date(popup.preorderCutoff);
              return (
                <label
                  key={popup.id}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-colors ${
                    form.popupId === popup.id
                      ? 'border-purple bg-lilac/20'
                      : 'border-lilac hover:border-purple/40 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="popup"
                    value={popup.id}
                    checked={form.popupId === popup.id}
                    onChange={() => setForm((prev) => ({ ...prev, popupId: popup.id }))}
                    className="mt-1 accent-purple"
                  />
                  <div>
                    <p className="font-semibold text-ink">{popup.title}</p>
                    <p className="text-sm text-ink/70 mt-0.5">
                      {new Date(popup.startsAt).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(popup.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {' – '}
                      {new Date(popup.endsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-ink/60 mt-0.5">{popup.address}</p>
                    <p className="text-xs text-ink/40 mt-1">
                      Pre-order deadline: {cutoff.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                      {cutoff.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep('items')}
              disabled={!form.popupId}
              className="px-6 py-3 bg-purple text-white rounded-xl font-semibold hover:bg-purple-deep disabled:opacity-40 transition-colors"
            >
              Next: Add items →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Add items ────────────────────────────────────────────── */}
      {step === 'items' && (
        <div>
          <h2 className="font-heading text-2xl text-purple-deep mb-2">Add products</h2>
          <p className="text-sm text-ink/60 mb-6">
            Enter how much of each product you'd like. Prices are estimates - you pay by actual weight at the popup.
          </p>

          {categories.map((cat) => {
            const catProducts = products.filter((p) => p.category === cat && p.available);
            if (catProducts.length === 0) return null;
            return (
              <div key={cat} className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-3">{cat}</h3>
                <div className="grid gap-3">
                  {catProducts.map((product) => {
                    const inCart = form.items.find((i) => i.productId === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`rounded-xl border p-4 bg-white transition-colors ${inCart ? 'border-purple/40' : 'border-lilac'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-ink">{product.name}</p>
                            <p className="text-sm text-ink/60 mt-0.5">{product.description}</p>
                            <p className="text-sm font-medium text-purple mt-1">
                              ${product.pricePerUnit.toFixed(2)} {product.unit}
                            </p>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                placeholder="Amount"
                                value={amounts[product.id] ?? ''}
                                onChange={(e) => setAmount(product.id, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && upsertItem(product)}
                                className="w-24 border border-lilac rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:border-purple"
                                aria-label={`Amount of ${product.name} in ${product.unit.replace('per ', '')}`}
                              />
                              <span className="text-xs text-ink/50 w-6">{product.unit.replace('per ', '')}</span>
                              <button
                                onClick={() => upsertItem(product)}
                                className="px-3 py-1.5 bg-purple text-white text-sm rounded-lg hover:bg-purple-deep transition-colors"
                              >
                                Add
                              </button>
                            </div>
                            {inCart && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-purple font-medium">
                                  {inCart.requestedAmount} {inCart.unit.replace('per ', '')} · ~${inCart.estimatedCost.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => removeItem(product.id)}
                                  className="text-ink/40 hover:text-red-500 transition-colors"
                                  aria-label={`Remove ${product.name}`}
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Cart summary */}
          {form.items.length > 0 && (
            <div className="sticky bottom-4 bg-white rounded-2xl border border-lilac shadow-md p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{form.items.length} item{form.items.length !== 1 ? 's' : ''} selected</p>
                  <p className="text-xs text-ink/50">Estimated subtotal: ~${subtotal.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setStep('container')}
                  className="px-5 py-2.5 bg-purple text-white rounded-xl font-semibold hover:bg-purple-deep transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button onClick={() => setStep('popup')} className="text-sm text-purple hover:underline">
              ← Back
            </button>
            {form.items.length > 0 && (
              <button
                onClick={() => setStep('container')}
                className="px-6 py-3 bg-purple text-white rounded-xl font-semibold hover:bg-purple-deep transition-colors"
              >
                Next: Container →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Container question ───────────────────────────────────── */}
      {step === 'container' && (
        <div>
          <h2 className="font-heading text-2xl text-purple-deep mb-3">Bringing your own container?</h2>
          <p className="text-sm text-ink/60 mb-6">
            Bring a clean jar or bottle and save {discountPercentage}% on your order.
            If you don't have one, you can borrow a jar for a ${jarDepositAmount.toFixed(2)} refundable deposit.
          </p>

          <div className="grid gap-4">
            {[
              {
                value: true,
                label: `Yes - I'm bringing my own`,
                sub: `${discountPercentage}% discount applied to your estimate`,
                icon: '🫙',
              },
              {
                value: false,
                label: `No - I'll use one of yours`,
                sub: `$${jarDepositAmount.toFixed(2)} jar deposit collected at the popup`,
                icon: '🛒',
              },
            ].map(({ value, label, sub, icon }) => (
              <label
                key={String(value)}
                className={`flex items-center gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-colors ${
                  form.bringingOwnContainer === value
                    ? 'border-purple bg-lilac/20'
                    : 'border-lilac hover:border-purple/40 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="container"
                  checked={form.bringingOwnContainer === value}
                  onChange={() => setForm((prev) => ({ ...prev, bringingOwnContainer: value }))}
                  className="accent-purple"
                />
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-semibold text-ink">{label}</p>
                  <p className="text-sm text-ink/60 mt-0.5">{sub}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Estimate preview */}
          <div className="mt-6 bg-lilac/30 rounded-xl p-4 text-sm">
            <p className="font-semibold text-purple-deep mb-2">Estimated total</p>
            <div className="space-y-1 text-ink/80">
              <div className="flex justify-between">
                <span>Subtotal ({form.items.length} items)</span>
                <span>~${subtotal.toFixed(2)}</span>
              </div>
              {!form.bringingOwnContainer && (
                <div className="flex justify-between">
                  <span>Jar deposit (refundable)</span>
                  <span>${jarDepositAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-lilac pt-2 mt-2 text-ink">
                <span>Estimated total</span>
                <span>~${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-ink/40 mt-2">Estimate only - you pay by actual weight at the popup.</p>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep('items')} className="text-sm text-purple hover:underline">
              ← Back
            </button>
            <button
              onClick={() => setStep('contact')}
              className="px-6 py-3 bg-purple text-white rounded-xl font-semibold hover:bg-purple-deep transition-colors"
            >
              Next: Your info →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Contact info ─────────────────────────────────────────── */}
      {step === 'contact' && (
        <div>
          <h2 className="font-heading text-2xl text-purple-deep mb-2">Your information</h2>
          <p className="text-sm text-ink/60 mb-6">
            No account needed. You'll receive a confirmation email with your order code.
          </p>

          <div className="grid gap-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="name">
                Full name <span className="text-purple">*</span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.customerName}
                onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="email">
                Email address <span className="text-purple">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
                placeholder="you@example.com"
              />
              <p className="text-xs text-ink/40 mt-1">Confirmation and reminder sent here.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="phone">
                Phone number <span className="text-ink/40">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
                placeholder="(919) 000-0000"
              />
            </div>
          </div>

          {/* Honeypot - hidden from real users */}
          <input
            type="text"
            name="_trap"
            tabIndex={-1}
            autoComplete="off"
            className="absolute opacity-0 h-0 w-0 pointer-events-none"
            aria-hidden="true"
          />

          {/* Order summary */}
          <div className="mt-6 bg-white rounded-xl border border-lilac p-4 text-sm">
            <p className="font-semibold text-purple-deep mb-2">Order summary</p>
            {form.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-ink/70 py-0.5">
                <span>{item.productName} (~{item.requestedAmount} {item.unit.replace('per ', '')})</span>
                <span>~${item.estimatedCost.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold border-t border-lilac pt-2 mt-2 text-ink">
              <span>Estimated total</span>
              <span>~${estimatedTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-ink/40 mt-2">No payment taken now - you pay at the popup.</p>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep('container')} className="text-sm text-purple hover:underline">
              ← Back
            </button>
            <button
              onClick={submitReservation}
              disabled={submitting || !form.customerName.trim() || !form.email.trim()}
              className="px-6 py-3 bg-purple text-white rounded-xl font-semibold hover:bg-purple-deep disabled:opacity-40 transition-colors"
            >
              {submitting ? 'Reserving…' : 'Confirm reservation'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: Confirmation ─────────────────────────────────────────── */}
      {step === 'confirm' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-3xl text-purple-deep mb-2">You're reserved!</h2>
          <p className="text-ink/70 mb-8">
            A confirmation email is on its way to <strong>{form.email}</strong>.
            We'll also send a reminder the morning of the popup.
          </p>

          <div className="bg-white rounded-2xl border border-lilac p-8 max-w-sm mx-auto mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-2">Your order code</p>
            <p className="font-heading text-4xl font-bold text-purple-deep tracking-widest">{form.orderCode}</p>
            <p className="text-xs text-ink/40 mt-3">Bring this to the popup - they'll have your order ready.</p>
          </div>

          {selectedPopup && (
            <div className="text-sm text-ink/70 mb-8">
              <p className="font-semibold text-ink">{selectedPopup.title}</p>
              <p>
                {new Date(selectedPopup.startsAt).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}
              </p>
              <p>{selectedPopup.address}</p>
              {selectedPopup.notes && <p className="mt-1 text-ink/50">{selectedPopup.notes}</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={selectedPopup ? `/api/ics/${selectedPopup.id}` : '#'}
              className="px-5 py-3 border border-purple text-purple rounded-xl font-semibold hover:bg-lilac/30 transition-colors"
            >
              Add to calendar
            </a>
            <a
              href="/schedule"
              className="px-5 py-3 bg-lilac/50 text-purple-darker rounded-xl font-semibold hover:bg-lilac transition-colors"
            >
              View full schedule
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

