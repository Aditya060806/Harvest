'use client';

import { motion } from 'framer-motion';
import Starfield from './Starfield';
import { CommandLine } from './ui';
import { site } from '@/lib/site';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Starfield />
        <div className="grid-overlay absolute inset-0" />
      </div>

      <div className="relative mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center px-5 pt-24 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-line/10 bg-line/5 px-4 py-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-harvest-500 animate-pulse" />
            v1.0 · MIT · published on npm
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-7 text-6xl font-extrabold tracking-tight text-strong sm:text-7xl md:text-8xl"
        >
          harvest<span className="accent-gradient">-scan</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 max-w-2xl text-lg text-muted sm:text-xl"
        >
          {site.tagline} <span className="text-fg">{site.subtitle}</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a href="#install" className="rounded-xl bg-harvest-500 px-6 py-3 font-semibold text-white transition hover:bg-harvest-600">
            Get started
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-line/20 px-6 py-3 font-semibold text-strong transition hover:border-harvest-500/50"
          >
            View on GitHub →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-8 w-full max-w-md"
        >
          <CommandLine command={site.install} />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </section>
  );
}
