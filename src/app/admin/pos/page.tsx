import { Suspense } from 'react';
import type { Metadata } from 'next';
import POSClient from './POSClient';

export const metadata: Metadata = {
  title: 'Point of Sale — Admin',
  robots: { index: false, follow: false },
};

export default function POSPage() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
      <h1 className="font-heading text-3xl text-purple-deep mb-8">Point of Sale</h1>
      <Suspense>
        <POSClient />
      </Suspense>
      <a href="/admin" className="mt-8 inline-block text-sm text-purple hover:underline">
        ← Dashboard
      </a>
    </div>
  );
}
