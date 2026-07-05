'use client';

import { Reveal, SectionLabel } from './ui';
import { grades } from '@/lib/site';

const steps = [
  { n: '01', title: 'Discover', body: 'Globs the target respecting .gitignore, skipping node_modules, binaries, and files over 512 KB.' },
  { n: '02', title: 'Load plugins', body: 'Every plugin in the plugins directory is auto-discovered and filtered by scan mode (fast / default / complete).' },
  { n: '03', title: 'Run in parallel', body: 'Active plugins run concurrently with per-plugin error isolation — one failure never aborts the scan.' },
  { n: '04', title: 'Score', body: 'Issues are weighted into a 0–100 score. Any critical finding fails the scan outright.' },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-y border-line/5 bg-line/[0.015]">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="text-center">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 text-4xl font-bold text-strong sm:text-5xl">A small orchestrator around composable plugins</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="card h-full p-6">
                <div className="font-mono text-sm text-harvest-500">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold text-strong">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <div className="card p-8">
            <h3 className="text-center text-lg font-semibold text-strong">Scoring model</h3>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted">
              Start at 100, subtract a weight per issue. A single critical finding fails outright.
            </p>
            <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-xl border border-line/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-line/[0.03] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Exit code</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.grade} className="border-t border-line/5">
                      <td className="px-4 py-3 font-mono text-fg">{g.range}</td>
                      <td className="px-4 py-3 text-muted">{g.rating}</td>
                      <td className={`px-4 py-3 font-bold ${g.color}`}>{g.grade}</td>
                      <td className="px-4 py-3 font-mono text-muted">{g.exit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
