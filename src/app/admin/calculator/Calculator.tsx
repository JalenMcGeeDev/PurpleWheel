'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, Popup } from '../../../types';

interface CalculatorProps {
  products: Product[];
  popups: Popup[];
}

// NC sales tax rates by county
const TAX_RATES: Record<string, number> = {
  Raleigh: 0.0725,      // Wake County
  Durham: 0.075,        // Durham County
  'Chapel Hill': 0.075, // Orange County
  Other: 0.075,
};

const CATEGORIES = ['Pantry', 'Home', 'Body'] as const;

export default function Calculator({ products, popups }: CalculatorProps) {
  const router = useRouter();
  const [popupId, setPopupId] = useState(popups[0]?.id ?? '');
  const [ownContainer, setOwnContainer] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const selectedPopup = popups.find((p) => p.id === popupId);
  const taxRate = TAX_RATES[selectedPopup?.city ?? 'Other'] ?? 0.075;
  const discountRate = ownContainer ? 0.1 : 0;

  const lines = useMemo(() => {
    return products
      .filter((p) => p.available && parseFloat(amounts[p.id] || '0') > 0)
      .map((p) => {
        const amount = parseFloat(amounts[p.id]);
        const base = amount * p.pricePerUnit;
        const sale = base * (1 - discountRate);
        const tax = p.taxable ? sale * taxRate : 0;
        return { product: p, amount, base, sale, tax };
      });
  }, [products, amounts, discountRate, taxRate]);

  const subtotalRaw = lines.reduce((s, l) => s + l.base, 0);
  const discountAmount = subtotalRaw * discountRate;
  const subtotalAfterDiscount = subtotalRaw - discountAmount;
  const taxableBase = lines.filter((l) => l.product.taxable).reduce((s, l) => s + l.sale, 0);
  const totalTax = lines.reduce((s, l) => s + l.tax, 0);
  const grandTotal = subtotalAfterDiscount + totalTax;

  function setAmount(id: string, val: string) {
    setAmounts((prev) => ({ ...prev, [id]: val }));
  }

  function clear() {
    setAmounts({});
    setOwnContainer(false);
  }

  return (
    <div className="space-y-6">

      {/* Popup + container row */}
      <div className="bg-white rounded-2xl border border-lilac p-5 grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-2">
            Popup location
          </label>
          <select
            value={popupId}
            onChange={(e) => setPopupId(e.target.value)}
            className="w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple"
          >
            {popups.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.city}
              </option>
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
          <button
            onClick={() => setOwnContainer((v) => !v)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-colors font-medium text-sm ${
              ownContainer
                ? 'border-purple bg-lilac/30 text-purple-deep'
                : 'border-lilac text-ink/60 hover:border-purple/40'
            }`}
          >
            <span className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${ownContainer ? 'bg-purple' : 'bg-lilac'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${ownContainer ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
            {ownContainer ? '10% discount applied' : 'No discount'}
          </button>
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
                        {product.taxable && <span className="ml-1 text-ink/40">· taxable</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={val}
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
                <span>
                  {l.product.name}{' '}
                  <span className="text-ink/40">
                    ({l.amount} {l.product.unit.replace('per ', '')})
                  </span>
                </span>
                <span>${l.sale.toFixed(2)}</span>
              </div>
            ))}

            {ownContainer && (
              <div className="flex justify-between text-purple border-t border-lilac pt-2 mt-2">
                <span>Container discount (10%)</span>
                <span>−${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-lilac pt-2 mt-2 space-y-1">
              {taxableBase > 0 && (
                <div className="flex justify-between text-ink/50 text-xs">
                  <span>Taxable items subtotal</span>
                  <span>${taxableBase.toFixed(2)}</span>
                </div>
              )}
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

      {/* Charge + Clear buttons */}
      {lines.length > 0 && (
        <>
          <button
            onClick={() =>
              router.push(`/admin/pos?amount=${Math.round(grandTotal * 100)}&popup=${popupId}`)
            }
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
        </>
      )}
    </div>
  );
}

