'use client';

import { useState } from 'react';
import type { Product } from '../../../types';
import { createSupabaseBrowserClient } from '../../../lib/supabase-browser';

interface ProductsClientProps {
  products: Product[];
}

export default function ProductsClient({ products: initial }: ProductsClientProps) {
  const [products, setProducts] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  async function patch(id: string, fields: { available?: boolean; pricePerUnit?: number; taxable?: boolean }) {
    setSaving(id);
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(fields),
    });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...fields } : p)),
    );
    setSaving(null);
  }

  async function savePrice(product: Product) {
    const val = parseFloat(priceInput);
    if (isNaN(val) || val <= 0) return;
    await patch(product.id, { pricePerUnit: val });
    setEditing(null);
  }

  const categories = ['Pantry', 'Home', 'Body'] as const;

  return (
    <div>
      {categories.map((cat) => {
        const catProducts = products.filter((p) => p.category === cat);
        if (!catProducts.length) return null;
        return (
          <section key={cat} className="mb-10">
            <h2 className="font-heading text-xl text-purple-deep border-b border-lilac pb-2 mb-4">{cat}</h2>
            <div className="grid gap-3">
              {catProducts.map((product) => (
                <div key={product.id}
                  className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-opacity ${
                    product.available ? 'border-lilac' : 'border-lilac/30 opacity-60'
                  }`}
                >
                  <button
                    onClick={() => patch(product.id, { available: !product.available })}
                    disabled={saving === product.id}
                    title={product.available ? 'Mark out of stock' : 'Mark available'}
                    className={`shrink-0 relative w-12 h-7 rounded-full transition-colors ${
                      product.available ? 'bg-purple' : 'bg-lilac'
                    } disabled:opacity-40`}
                  >
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      product.available ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink">{product.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-ink/50">{product.unit}</p>
                      <button
                        onClick={() => patch(product.id, { taxable: !product.taxable })}
                        disabled={saving === product.id}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors disabled:opacity-40 ${
                          product.taxable
                            ? 'border-ink/20 text-ink/50 hover:border-red-300 hover:text-red-500'
                            : 'border-green-300 text-green-700 bg-green-50'
                        }`}
                      >
                        {product.taxable ? 'taxable' : 'tax-exempt'}
                      </button>
                    </div>
                  </div>

                  {editing === product.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-ink/60">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        autoFocus
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && savePrice(product)}
                        className="w-20 border border-purple rounded-lg px-2 py-1 text-sm text-right focus:outline-none"
                      />
                      <button onClick={() => savePrice(product)} disabled={saving === product.id}
                        className="text-xs px-3 py-1 bg-purple text-white rounded-lg disabled:opacity-40">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="text-xs text-ink/40 hover:text-ink">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditing(product.id); setPriceInput(product.pricePerUnit.toFixed(2)); }}
                      className="shrink-0 text-sm font-semibold text-purple hover:underline"
                    >
                      ${product.pricePerUnit.toFixed(2)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
