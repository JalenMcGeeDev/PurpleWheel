import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getPopupById } from '../../../../lib/db';
import EditPopupClient from './EditPopupClient';

export const metadata: Metadata = { title: 'Edit Popup — Admin', robots: { index: false, follow: false } };

export default async function EditPopupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const popup = await getPopupById(id);
  if (!popup) redirect('/admin/popups');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin · Popups</p>
      <h1 className="font-heading text-3xl text-purple-deep mb-8">Edit popup</h1>
      <div className="bg-white rounded-2xl border border-lilac p-6 sm:p-8">
        <EditPopupClient popup={popup} />
      </div>
      <a href="/admin/popups" className="mt-6 inline-block text-sm text-purple hover:underline">← All popups</a>
    </div>
  );
}
