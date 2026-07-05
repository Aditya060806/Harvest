'use client';

import { site } from '@/lib/site';
import { CommandLine, Reveal, SectionLabel } from './ui';

const usage = [
  { cmd: 'harvest -f', note: 'fast scan (critical + heuristics + lint)' },
  { cmd: 'harvest src/ -c', note: 'complete scan (every plugin)' },
  { cmd: 'harvest . --fix', note: 'autofix, then scan' },
  { cmd: 'harvest . --sarif -o harvest.sarif', note: 'SARIF for GitHub Code Scanning' },
  { cmd: 'harvest baseline .', note: 'accept current issues; fail only on new ones' },
];

export default function Install() {
  return (
    <section id="install" className="border-t border-line/5 bg-line/[0.015]">
      <div className="mx-auto max-w-4xl px-5 py-24">
        <Reveal className="text-center">
          <SectionLabel>Install</SectionLabel>
          <h2 className="mt-5 text-4xl font-bold text-strong sm:text-5xl">Running in ten seconds</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">Requires Node.js 18+. Zero config to start.</p>
        </Reveal>

        <Reveal className="mt-10 space-y-3">
          <CommandLine command={site.install} />
          <CommandLine command={site.installGlobal} />
        </Reveal>

        <Reveal className="mt-10">
          <div className="card overflow-hidden">
            <div className="border-b border-line/10 px-5 py-3 text-sm font-medium text-fg">Common commands</div>
            <div className="divide-y divide-line/5">
              {usage.map((u) => (
                <div key={u.cmd} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="font-mono text-sm text-harvest-600 dark:text-harvest-200">{u.cmd}</code>
                  <span className="text-xs text-muted">{u.note}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <div className="card p-6">
            <h3 className="text-sm font-medium text-fg">GitHub Action</h3>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-line/10 bg-bg/60 p-4 text-xs leading-relaxed text-fg">
{`- uses: actions/checkout@v4
- uses: Aditya060806/Harvest@v1
  with:
    target: '.'
    mode: 'complete'
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: harvest.sarif`}
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
