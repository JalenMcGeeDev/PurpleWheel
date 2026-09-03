import type { Metadata } from 'next';
import { getEmailSignups } from '../../../lib/db';
import EmailListClient from './EmailListClient';

export const metadata: Metadata = {
  title: 'Email List — Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EmailListPage() {
  const signups = await getEmailSignups().catch(() => []);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
          <h1 className="font-heading text-3xl text-purple-deep">Email List</h1>
        </div>
        <span className="text-sm text-ink/50">{signups.length} subscriber{signups.length !== 1 ? 's' : ''}</span>
      </div>
      <EmailListClient signups={signups} />
      <a href="/admin" className="mt-8 inline-block text-sm text-purple hover:underline">← Dashboard</a>
    </div>
  );
}
