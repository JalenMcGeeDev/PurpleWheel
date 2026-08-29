'use client';

import { useRouter } from 'next/navigation';
import PopupForm from '../PopupForm';

export default function NewPopupPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin · Popups</p>
      <h1 className="font-heading text-3xl text-purple-deep mb-8">New popup</h1>
      <div className="bg-white rounded-2xl border border-lilac p-6 sm:p-8">
        <PopupForm onSuccess={() => router.push('/admin/popups')} />
      </div>
      <a href="/admin/popups" className="mt-6 inline-block text-sm text-purple hover:underline">← All popups</a>
    </div>
  );
}
