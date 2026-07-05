'use client';

import { plugins } from '@/lib/site';
import { Reveal, SectionLabel } from './ui';

export default function Plugins() {
  return (
    <section id="plugins" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="text-center">
        <SectionLabel>Plugin catalog</SectionLabel>
        <h2 className="mt-5 text-4xl font-bold text-strong sm:text-5xl">Ten checks, one score</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Each plugin decides which files it applies to and returns structured issues. Add your own
          by dropping a file in <code className="rounded bg-line/10 px-1.5 py-0.5 text-harvest-600 dark:text-harvest-300">plugins/</code>.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {plugins.map((p, i) => (
          <Reveal key={p.name} delay={(i % 2) * 0.05}>
            <div className="card flex h-full items-start gap-4 p-5 transition hover:border-harvest-500/40">
              <span className="mt-0.5 shrink-0 rounded-md border border-harvest-500/30 bg-harvest-500/10 px-2.5 py-1 font-mono text-xs text-harvest-600 dark:text-harvest-300">
                {p.name}
              </span>
              <div>
                <p className="text-sm text-fg">{p.catches}</p>
                <p className="mt-1 text-xs text-muted">applies to: {p.applies}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
