import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Docs',
  description: `Documentation for ${site.name} — installation, CLI reference, scan modes, output formats, GitHub Action, baseline mode, API, and plugin authoring.`,
};

const toc = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'cli', label: 'CLI reference' },
  { id: 'modes', label: 'Scan modes' },
  { id: 'output', label: 'Output formats' },
  { id: 'action', label: 'GitHub Action' },
  { id: 'baseline', label: 'Baseline mode' },
  { id: 'api', label: 'Programmatic API' },
  { id: 'plugins', label: 'Writing a plugin' },
  { id: 'config', label: 'Configuration' },
  { id: 'faq', label: 'FAQ' },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl border border-line/10 bg-card/70 p-4 font-mono text-xs leading-relaxed text-fg">
      {children}
    </pre>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-line/10 px-1.5 py-0.5 text-harvest-600 dark:text-harvest-300">{children}</code>;
}

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-2xl font-bold text-strong">
      {children}
    </h2>
  );
}

export default function Docs() {
  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-6xl px-5 pt-28 pb-24">
        <header className="mb-12">
          <p className="text-sm font-medium uppercase tracking-widest text-harvest-500">Documentation</p>
          <h1 className="mt-3 text-4xl font-bold text-strong sm:text-5xl">harvest-scan docs</h1>
          <p className="mt-4 max-w-2xl text-muted">{site.description}</p>
        </header>

        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1 text-sm">
              {toc.map((t) => (
                <a key={t.id} href={`#${t.id}`} className="block rounded-lg px-3 py-1.5 text-muted transition hover:bg-line/5 hover:text-strong">
                  {t.label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="min-w-0 space-y-14">
            <section>
              <H id="getting-started">Getting started</H>
              <p className="mt-3 text-muted">Requires Node.js 18+. Try it instantly with no install:</p>
              <Code>{`npx harvest-scan .

# or install globally (command: harvest)
npm install -g harvest-scan
harvest .`}</Code>
              <p className="mt-4 text-muted">Exit codes: <Tag>0</Tag> clean/acceptable, <Tag>1</Tag> needs attention, <Tag>2</Tag> failing/critical, <Tag>3</Tag> unexpected error.</p>
            </section>

            <section>
              <H id="cli">CLI reference</H>
              <Code>{`harvest [options] [target]

  -f, --fast          fast scan: critical + heuristics + ESLint
  -c, --complete      complete scan: every plugin
  -d, --default       balanced default (when no mode is given)
      --fix           apply safe ESLint autofixes before scanning
  -j, --json          machine-readable JSON
      --sarif         SARIF 2.1.0 (GitHub Code Scanning)
  -o, --output <f>    write the report to a file
  -i, --incremental   scan only files changed vs git HEAD
  -p, --plugin <n>    run a single plugin
      --baseline      only fail on issues not in the saved baseline
      --no-banner     hide the ASCII banner`}</Code>
              <p className="mt-4 text-muted">Subcommands: <Tag>baseline</Tag>, <Tag>doctor</Tag>, <Tag>outdated</Tag>, and <Tag>plugin list|enable|disable|create</Tag>.</p>
            </section>

            <section>
              <H id="modes">Scan modes</H>
              <div className="mt-4 overflow-hidden rounded-xl border border-line/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-line/[0.03] text-muted">
                    <tr><th className="px-4 py-3 font-medium">Mode</th><th className="px-4 py-3 font-medium">Flag</th><th className="px-4 py-3 font-medium">Plugins</th></tr>
                  </thead>
                  <tbody className="text-fg">
                    <tr className="border-t border-line/5"><td className="px-4 py-3">Fast</td><td className="px-4 py-3 font-mono">-f</td><td className="px-4 py-3">critical, heuristic, eslint</td></tr>
                    <tr className="border-t border-line/5"><td className="px-4 py-3">Default</td><td className="px-4 py-3 font-mono">(none)</td><td className="px-4 py-3">+ complexity, dockerfile</td></tr>
                    <tr className="border-t border-line/5"><td className="px-4 py-3">Complete</td><td className="px-4 py-3 font-mono">-c</td><td className="px-4 py-3">all 10 plugins</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <H id="output">Output formats</H>
              <p className="mt-3 text-muted">Human (default), JSON (<Tag>--json</Tag>), and SARIF 2.1.0 (<Tag>--sarif</Tag>) which loads directly into GitHub Code Scanning.</p>
              <Code>{`{
  "target": "src/",
  "mode": "complete",
  "score": 87,
  "rating": "good",
  "exitCode": 0,
  "counts": { "total": 4, "error": 0, "warning": 4, "info": 0, "critical": 0 },
  "issues": [ /* { pluginName, filePath, line, column, severity, message } */ ],
  "durationMs": 210
}`}</Code>
            </section>

            <section>
              <H id="action">GitHub Action</H>
              <Code>{`name: Harvest
on: [push, pull_request]
permissions:
  contents: read
  security-events: write
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Aditya060806/Harvest@v1
        with:
          target: '.'
          mode: 'complete'
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: harvest.sarif`}</Code>
            </section>

            <section>
              <H id="baseline">Baseline (ratchet) mode</H>
              <p className="mt-3 text-muted">Adopt on an existing codebase without drowning in the current backlog — fail CI only on new issues.</p>
              <Code>{`harvest baseline .     # writes .harvest/baseline.json
harvest . --baseline   # known issues ignored; only new issues fail`}</Code>
            </section>

            <section>
              <H id="api">Programmatic API</H>
              <Code>{`import { scan, fix } from 'harvest-scan';

await fix('src/');                                 // optional autofix pass
const result = await scan('src/', { mode: 'complete' });

console.log(\`\${result.score}/100 (\${result.rating})\`);
for (const issue of result.issues) {
  console.log(\`\${issue.filePath}:\${issue.line} \${issue.message}\`);
}`}</Code>
            </section>

            <section>
              <H id="plugins">Writing a plugin</H>
              <p className="mt-3 text-muted">A plugin extends <Tag>Plugin</Tag> with a static <Tag>applies()</Tag> and async <Tag>run()</Tag>. It is auto-discovered — no registration.</p>
              <Code>{`// plugins/no-console.js
import { Plugin } from '../src/plugin-interface.js';

export class NoConsolePlugin extends Plugin {
  static pluginName = 'no-console';
  static applies(file) { return file.endsWith('.js'); }
  async run(file, { content }) {
    return content.split('\\n').flatMap((line, i) =>
      line.includes('console.log')
        ? [{ pluginName: 'no-console', filePath: file, line: i + 1, column: 0, severity: 'info', message: 'console.log left in code' }]
        : []
    );
  }
}`}</Code>
              <Code>{`harvest plugin create no-console
harvest plugin list`}</Code>
            </section>

            <section>
              <H id="config">Configuration</H>
              <p className="mt-3 text-muted">Optional. Create <Tag>harvest.config.js</Tag> to tune weights, thresholds, and enabled plugins.</p>
              <Code>{`// harvest.config.js
export default {
  weights: { eslint: 2, xray: 8, osv: 10 },
  thresholds: { complexity: 12 },
  plugins: { semgrep: { enabled: false } },
};`}</Code>
            </section>

            <section>
              <H id="faq">FAQ</H>
              <div className="mt-4 space-y-5 text-muted">
                <div>
                  <p className="font-medium text-strong">Does it send my code anywhere?</p>
                  <p className="mt-1 text-sm">No. Fast and default modes run fully offline. In complete mode, <Tag>osv</Tag> sends only dependency names/versions to the public OSV.dev API.</p>
                </div>
                <div>
                  <p className="font-medium text-strong">Which languages?</p>
                  <p className="mt-1 text-sm">JS/TS get the deepest coverage; critical, heuristic, ai, and semgrep span many languages; dockerfile covers container images.</p>
                </div>
                <div>
                  <p className="font-medium text-strong">How do I adopt it on a large legacy repo?</p>
                  <p className="mt-1 text-sm">Use baseline mode — record today&apos;s issues once, then only new ones fail CI.</p>
                </div>
              </div>
            </section>

            <div className="rounded-2xl border border-harvest-500/20 bg-harvest-500/[0.06] p-6">
              <p className="text-fg">Full source, issues, and releases live on GitHub.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={site.github} target="_blank" rel="noreferrer" className="rounded-lg bg-harvest-500 px-4 py-2 text-sm font-medium text-white hover:bg-harvest-600">GitHub →</a>
                <a href={site.npm} target="_blank" rel="noreferrer" className="rounded-lg border border-line/20 px-4 py-2 text-sm font-medium text-strong hover:border-harvest-500/50">npm →</a>
              </div>
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
