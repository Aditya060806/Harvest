'use client';

import { features } from '@/lib/site';
import { Reveal, SectionLabel } from './ui';

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="text-center">
        <SectionLabel>Why harvest-scan</SectionLabel>
        <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
          Three tools&apos; worth of signal, <span className="accent-gradient">one number.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
          Most teams juggle a linter, a dependency auditor, and a SAST scanner. harvest-scan runs
          them together and answers one question: is this code better or worse than last time?
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={(i % 4) * 0.06}>
            <div className="card h-full p-6 transition duration-300 hover:border-harvest-500/40 hover:bg-white/[0.04]">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
