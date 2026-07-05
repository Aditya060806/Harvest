'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { site } from '@/lib/site';

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it works' },
  { href: '/#plugins', label: 'Plugins' },
  { href: '/#install', label: 'Install' },
  { href: '/docs', label: 'Docs' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/10 bg-ink-950/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-harvest-500/15 text-lg">🌾</span>
          <span>harvest<span className="text-harvest-400">-scan</span></span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-zinc-400 transition hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a href={site.github} target="_blank" rel="noreferrer" className="text-sm text-zinc-400 transition hover:text-white">
            GitHub
          </a>
          <a
            href={site.npm}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-harvest-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-harvest-400"
          >
            npm
          </a>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink-950/95 px-5 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-zinc-300"
            >
              {l.label}
            </a>
          ))}
          <a href={site.npm} target="_blank" rel="noreferrer" className="mt-2 block rounded-lg bg-harvest-500 px-4 py-2 text-center font-medium text-ink-950">
            Get it on npm
          </a>
        </div>
      )}
    </header>
  );
}
