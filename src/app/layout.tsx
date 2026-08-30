import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import { unstable_cache } from 'next/cache';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { siteSettings } from '../data/siteSettings';
import { getUpcomingPopups } from '../lib/db';

const getCachedNextPopup = unstable_cache(
  async () => { const all = await getUpcomingPopups(); return all[0] ?? null; },
  ['layout-next-popup'],
  { revalidate: 300 }, // re-fetch at most every 5 minutes
);

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'The Purple Wheel - Refillery serving Raleigh, Durham & Chapel Hill',
    template: '%s | The Purple Wheel',
  },
  icons: {
    icon: [
      { url: '/images/logo-spiral-purple.png', media: '(prefers-color-scheme: light)' },
      { url: '/images/logo-spiral-white.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
  description:
    'A mobile refillery bringing bulk pantry staples, home goods, and body care to Raleigh, Durham, and Chapel Hill. Bring your own jar - pay by weight.',
  keywords: ['refill store Raleigh', 'zero waste Durham', 'refillery Chapel Hill', 'bulk refill NC', 'zero waste grocery'],
  openGraph: {
    siteName: 'The Purple Wheel',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/images/logo-og.png', width: 1080, height: 1080, alt: 'The Purple Wheel' }],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nextPopup = await getCachedNextPopup().catch(() => null) ?? undefined;
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer nextPopup={nextPopup} settings={siteSettings} />
      </body>
    </html>
  );
}

