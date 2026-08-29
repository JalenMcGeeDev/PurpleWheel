'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const navLinks = [
  { href: '/schedule', label: 'Schedule' },
  { href: '/refills', label: 'Refills & Prices' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/requests', label: 'Request a Product' },
  { href: '/host', label: 'Host a Popup' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-lilac sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo — drop your SVG file at public/logo.svg and swap this placeholder */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="The Purple Wheel home">
          <Image
            src="/images/logo-spiral-purple.png"
            alt=""
            width={36}
            height={36}
            className="rounded-full"
            aria-hidden="true"
          />
          <span className="font-heading font-bold text-purple-deep text-lg leading-tight">
            The Purple Wheel
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink hover:text-purple transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reserve"
            className="ml-2 px-4 py-2 rounded-lg bg-purple text-white text-sm font-semibold hover:bg-purple-deep transition-colors"
          >
            Reserve Refills
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-ink hover:bg-lilac/40 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav id="mobile-nav" className="md:hidden border-t border-lilac bg-white px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-ink hover:text-purple py-1"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reserve"
            className="mt-2 px-4 py-3 rounded-lg bg-purple text-white text-base font-semibold text-center hover:bg-purple-deep transition-colors"
            onClick={() => setOpen(false)}
          >
            Reserve Refills
          </Link>
        </nav>
      )}
    </header>
  );
}
