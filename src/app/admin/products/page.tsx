import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { getProducts } from '../../../lib/db';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = { title: 'Products - Admin', robots: { index: false, follow: false } };

export default async function AdminProductsPage() {
  const products = await getProducts().catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
      <h1 className="font-heading text-3xl text-purple-deep mb-3">Products</h1>
      <p className="text-sm text-ink/60 mb-8">
        Toggle the switch to mark a product out of stock. Tap the price to edit it. Changes take effect immediately.
      </p>
      <ProductsClient products={products} />
      <a href="/admin" className="mt-4 inline-block text-sm text-purple hover:underline">← Dashboard</a>
    </div>
  );
}

