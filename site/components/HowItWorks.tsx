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
    <section id="how" className="border-y border-white/5 bg-white/[0.015]">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="text-center">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">A small orchestrator around composable plugins</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="card h-full p-6">
                <div className="font-mono text-sm text-harvest-400">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <div className="card p-8">
            <h3 className="text-center text-lg font-semibold text-white">Scoring model</h3>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-400">
              Start at 100, subtract a weight per issue. A single critical finding fails outright.
            </p>
            <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Exit code</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.grade} className="border-t border-white/5">
                      <td className="px-4 py-3 font-mono text-zinc-300">{g.range}</td>
                      <td className="px-4 py-3 text-zinc-400">{g.rating}</td>
                      <td className={`px-4 py-3 font-bold ${g.color}`}>{g.grade}</td>
                      <td className="px-4 py-3 font-mono text-zinc-400">{g.exit}</td>
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
