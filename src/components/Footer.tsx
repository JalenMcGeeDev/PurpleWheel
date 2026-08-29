import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Popup, SiteSettings } from '../types';

interface FooterProps {
  nextPopup?: Popup;
  settings: SiteSettings;
}

export default function Footer({ nextPopup, settings }: FooterProps) {
  return (
    <footer className="bg-purple-deep text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/images/logo-spiral-white.png"
              alt=""
              width={32}
              height={32}
              className="rounded-full opacity-90"
              aria-hidden="true"
            />
            <p className="font-heading font-bold text-xl">The Purple Wheel</p>
          </div>
          <p className="text-lilac mt-2 text-sm leading-relaxed max-w-xs">
            A mobile refillery bringing zero-waste pantry, home, and body products to the Triangle.
          </p>
          <p className="mt-4 text-sm text-lilac/70">Raleigh · Durham · Chapel Hill</p>
        </div>

        {/* Next popup */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-lilac/60 mb-3">Next popup</p>
          {nextPopup ? (
            <Link href="/schedule" className="group">
              <p className="text-white font-semibold group-hover:text-lilac transition-colors">
                {nextPopup.title}
              </p>
              <p className="text-sm text-lilac/80 mt-1">
                {format(new Date(nextPopup.startsAt), 'EEE, MMM d')}
              </p>
              <p className="text-sm text-lilac/80">
                {format(new Date(nextPopup.startsAt), 'h:mm a')}
              </p>
            </Link>
          ) : (
            <p className="text-sm text-lilac/70">Dates coming soon</p>
          )}
        </div>

        {/* Links */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-lilac/60 mb-3">Links</p>
          <nav className="flex flex-col gap-2">
            {[
              ['/schedule', 'Schedule'],
              ['/refills', 'Refills & Prices'],
              ['/how-it-works', 'How It Works'],
              ['/requests', 'Request a Product'],
              ['/host', 'Host a Popup'],
              ['/about', 'About'],
              ['/privacy', 'Privacy'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="text-sm text-lilac/80 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between gap-3 text-sm text-lilac/50">
          <span>© {new Date().getFullYear()} The Purple Wheel · {settings.contactEmail}</span>
          <a
            href={`https://instagram.com/${settings.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-lilac transition-colors"
          >
            @{settings.instagramHandle}
          </a>
        </div>
      </div>
    </footer>
  );
}
