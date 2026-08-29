import Link from 'next/link';
import type { Metadata } from 'next';
import SignOutButton from '../../components/SignOutButton';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const SECTIONS = [
  { href: '/admin/calculator', emoji: '🧮', title: 'Price Calculator', desc: 'Calculate totals with tax at the table.' },
  { href: '/admin/pos',        emoji: '💳', title: 'Point of Sale',    desc: 'Charge a customer via Square reader.' },
  { href: '/admin/popups', emoji: '📅', title: 'Manage Popups', desc: 'Add, edit, or cancel popup events.' },
  { href: '/admin/products', emoji: '🧴', title: 'Manage Products', desc: 'Toggle availability and update prices.' },
  { href: '/admin/prep', emoji: '📋', title: 'Prep Lists', desc: 'View and print order lists by popup.' },
  { href: '/admin/requests', emoji: '💡', title: 'Product Requests', desc: 'See what customers want to refill.' },
];

export default function AdminPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
          <h1 className="font-heading text-3xl text-purple-deep">Dashboard</h1>
        </div>
        <SignOutButton />
      </div>

      <div className="grid gap-4">
        {SECTIONS.map(({ href, emoji, title, desc }) => (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className="flex items-center gap-5 bg-white rounded-2xl border border-lilac p-6 hover:border-purple transition-colors"
          >
            <span className="text-3xl">{emoji}</span>
            <div>
              <p className="font-semibold text-ink">{title}</p>
              <p className="text-sm text-ink/60 mt-0.5">{desc}</p>
            </div>
            <svg className="w-5 h-5 text-purple ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
