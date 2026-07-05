<div align="center">

# 🌾 harvest-scan

**Fast, plugin-driven security & code-quality scanner — one command, one score.**

Scan your code for security risks and quality issues with a suite of composable plugins, get a single **0–100 score** and letter **grade**, with actionable file-and-line feedback. Runs locally, in CI, and in your editor.

[![CI](https://github.com/Aditya060806/Harvest/actions/workflows/ci.yml/badge.svg)](https://github.com/Aditya060806/Harvest/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/harvest-scan.svg)](https://www.npmjs.com/package/harvest-scan)
[![Downloads](https://img.shields.io/npm/dt/harvest-scan.svg)](https://www.npmjs.com/package/harvest-scan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/node/v/harvest-scan.svg)](https://www.npmjs.com/package/harvest-scan)

</div>

---

## Table of contents

- [The 30-second tour](#-the-30-second-tour)
- [Why Harvest](#-why-harvest)
- [Quick start](#-quick-start)
- [How it works](#-how-it-works)
- [Plugin catalog](#-plugin-catalog)
- [Scan modes](#-scan-modes)
- [How Harvest compares](#-how-harvest-compares)
- [Scoring model](#-scoring-model)
- [Performance & efficiency](#-performance--efficiency)
- [Output formats](#-output-formats)
- [CLI reference](#-cli-reference)
- [GitHub Action](#-github-action)
- [Baseline (ratchet) mode](#-baseline-ratchet-mode)
- [VS Code extension](#-vs-code-extension)
- [Programmatic & REST API](#-programmatic--rest-api)
- [Writing a plugin](#-writing-a-plugin)
- [Configuration](#-configuration)
- [FAQ](#-faq)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

## 🎬 The 30-second tour

A file with a problem:

```console
$ npx harvest-scan src/payments.js -c

  F  0/100  ░░░░░░░░░░░░░░░░░░░░░░░░  bad
  1 error  2 warning  0 info  · 3 total · 180ms

  src/payments.js
     ERROR  42:10  Use of eval()                     (critical)
     WARN   42:10  Use of eval()                     (heuristic)
     WARN   7:3    Possible hard-coded credential    (heuristic)
```

A clean file:

```console
$ npx harvest-scan src/utils.js

  A+  100/100  ████████████████████████  excellent
  0 error  0 warning  0 info  · 0 total · 24ms

  ✓ No issues found. Clean harvest! 🌾
```

## 💡 Why Harvest

Most teams run a lint tool, a dependency auditor, and maybe a SAST scanner — three tools, three outputs, three mental models. Harvest runs them together and answers one question: **is this code better or worse than last time?**

- **One number to watch.** A single 0–100 score + grade makes quality trends obvious across commits, PRs, and releases.
- **Batteries included.** Ten plugins cover destructive patterns, dependency CVEs, AST security, complexity, lint, Dockerfiles, and more.
- **Honest by default.** Critical findings fail hard; everything else is weighted, so noise doesn't drown out real risk.
- **Meets you everywhere.** Same engine and score in the CLI, a REST API, a GitHub Action, and a VS Code extension.

## 🚀 Quick start

```bash
# Try it instantly, no install
npx harvest-scan .

# Or install globally (command is `harvest`)
npm install -g harvest-scan
harvest .
```

```bash
harvest -f                       # fast scan
harvest src/ -c                  # complete scan
harvest . --fix                  # autofix, then scan
harvest . --sarif -o harvest.sarif
harvest . --json > report.json
```

Requires **Node.js 18+**.

## 🧠 How it works

Harvest is a small orchestrator around a set of independent plugins. Each plugin decides which files it `applies` to and returns structured issues; the engine isolates failures, aggregates issues, and computes a weighted score.

```mermaid
flowchart LR
  A[Target file / dir] --> B{Discover files}
  B -->|gitignore-aware<br/>skip binaries & node_modules| C[File list]
  C --> D[Load plugins<br/>auto-discovered]
  D --> E{Mode filter<br/>fast · default · complete}
  E --> F[Run plugins in parallel<br/>per-plugin error isolation]
  F --> G[Normalise issues]
  G --> H[Weighted score 0–100]
  H --> I{Output}
  I --> J[Human report]
  I --> K[JSON]
  I --> L[SARIF]
```

The scan lifecycle, end to end:

```mermaid
sequenceDiagram
  participant U as CLI / API / Editor
  participant E as Engine
  participant P as Plugins
  U->>E: scan(target, { mode })
  E->>E: discover files (gitignore, skip binaries/large)
  E->>E: load config + auto-discover plugins
  loop each active plugin, in parallel
    E->>P: applies(file)?
    P-->>E: matching files
    E->>P: run(file, { content })
    P-->>E: issues[]  (or throws → isolated)
  end
  E->>E: weight issues → score (any critical ⇒ 0)
  E-->>U: { score, rating, issues, counts, durationMs }
```

**Design principles**

- **Isolation** — a plugin that throws (parse error, missing tool, API drift) never aborts the scan.
- **Determinism** — the same input yields the same score; results are consistent across CLI, API, and editor.
- **Bounded work** — files over 512 KB and known binary types are skipped; content is read once and cached.
- **Extensibility** — plugins are auto-loaded from the plugins directory, so adding checks needs no wiring.

## 🧩 Plugin catalog

| Plugin | What it catches | Applies to |
| --- | --- | --- |
| `critical` | Destructive / RCE patterns: `rm -rf /`, `eval()`, `new Function()`, `child_process.exec`, `os.system`, `subprocess`, `curl … \| sh`, fork bombs. **Any hit fails the scan.** | all files |
| `heuristic` | Risky calls & secrets: `eval`, `execSync`, PHP `shell_exec`/`base64_decode`/superglobals, `preg_replace /e`, hard-coded credentials. | all files |
| `eslint` | Runs ESLint on your project and counts errors (uses your config). | JS/TS |
| `complexity` | Functions whose cyclomatic complexity exceeds the threshold. | JS/TS |
| `xray` | AST-level security analysis via `@nodesecure/js-x-ray` (obfuscation, suspicious imports, unsafe statements). | JS/TS |
| `dockerfile` | Image hygiene: `FROM` first, non-root `USER`, pinned tags, leaked secrets, `apt/pip` flags, exec-form `CMD`, `HEALTHCHECK`. | `Dockerfile*` |
| `semgrep` | OWASP Top Ten rules across 30+ languages (if `semgrep` is available). | many langs |
| `audit` | `npm audit` severity rolled into a score. | `package.json` |
| `osv` | Known CVEs for your dependencies via the OSV.dev API. | `package.json` |
| `ai` | NLP pass (`compromise`) flagging dangerous security terms in any text. | all files |

## 🎛️ Scan modes

| Mode | Flag | Plugins run | Best for |
| --- | --- | --- | --- |
| Fast | `-f` | `critical`, `heuristic`, `eslint` | pre-commit hooks, editor |
| Default | *(none)* / `-d` | + `complexity`, `dockerfile` | everyday local runs |
| Complete | `-c` | **all 10** plugins | CI, releases, audits |

## 📊 How Harvest compares

Harvest bundles many single-purpose tools behind one score. This is a **capability matrix** — a map of what each category typically covers, not a performance benchmark.

| Capability | Harvest | ESLint | `npm audit` | Semgrep | Snyk |
| --- | :---: | :---: | :---: | :---: | :---: |
| Single 0–100 score + grade | ✅ | ➖ | ➖ | ➖ | ✅ |
| Lint / style | ✅ (via ESLint) | ✅ | ➖ | ➖ | ➖ |
| Cyclomatic complexity | ✅ | ➖ | ➖ | ➖ | ➖ |
| AST security (js-x-ray) | ✅ | ➖ | ➖ | ✅ | ✅ |
| Pattern rules (OWASP) | ✅ (Semgrep) | ➖ | ➖ | ✅ | ✅ |
| Dependency CVEs | ✅ (audit + OSV) | ➖ | ✅ | ➖ | ✅ |
| Dockerfile checks | ✅ | ➖ | ➖ | ✅ | ✅ |
| SARIF output | ✅ | ✅ | ➖ | ✅ | ✅ |
| Baseline / ratchet | ✅ | ➖ | ➖ | ✅ | ✅ |
| Autofix | ✅ (ESLint) | ✅ | ➖ | ➖ | ➖ |
| Runs fully offline | ✅¹ | ✅ | ➖ | ✅ | ➖ |
| Zero-config default | ✅ | ➖ | ✅ | ➖ | ➖ |
| Free & MIT | ✅ | ✅ | ✅ | ✅² | ➖ |

<sub>¹ Offline in `fast`/`default` mode; `complete` mode uses the network for `osv` (CVE lookup) and optionally `semgrep`. ² Semgrep OSS is free; some rulesets/features are commercial.</sub>

**When to reach for Harvest:** you want one command and one score that combines security + quality signals, gate-able in CI, without stitching several tools together. For deep, single-purpose analysis (e.g. exhaustive SAST), keep using the specialist tool alongside — Harvest happily wraps Semgrep and ESLint.

## 🎯 Scoring model

The score starts at 100 and subtracts a weight per issue. A single **critical** finding fails the scan outright (score 0).

```mermaid
pie showData title Penalty weight per plugin (per issue)
  "critical" : 50
  "osv" : 10
  "xray" : 8
  "ai" : 6
  "dockerfile" : 5
  "semgrep" : 5
  "audit" : 4
  "heuristic" : 3
  "eslint" : 2
  "complexity" : 1
```

| Score | Rating | Grade | Exit code |
| --- | --- | --- | :---: |
| 90–100 | excellent | A+ / A / A- | 0 |
| 75–89 | good | B+ / B / B- | 0 |
| 50–74 | fair | C+ / C | 0 |
| 25–49 | poor | D | 1 |
| 0–24 | bad | F | 2 |

Weights and thresholds are fully overridable in `harvest.config.js`.

## ⚡ Performance & efficiency

Harvest is built to stay fast as repositories grow:

- **Parallel plugins** — all active plugins run concurrently (`Promise.all`), not one after another.
- **Read-once caching** — each file's contents are read a single time and shared across plugins.
- **Smart discovery** — `.gitignore`-aware, and `node_modules`, `dist`, `out`, `build`, `coverage` are excluded.
- **Binary & size guards** — known binary extensions and files > 512 KB are skipped before any regex runs.
- **Incremental mode** — `--incremental` scans only files changed vs git `HEAD`.

**Relative cost by mode** *(illustrative — real time depends on repo size, disk, and network)*

```mermaid
xychart-beta
  title "Relative scan cost by mode"
  x-axis [fast, default, complete]
  y-axis "Relative time" 0 --> 10
  bar [1, 3, 9]
```

**Plugin cost & network profile**

| Plugin | Applies to | Cost | Network |
| --- | --- | :---: | :---: |
| `critical` | all files | low | no |
| `heuristic` | all files | low | no |
| `eslint` | JS/TS | medium | no |
| `complexity` | JS/TS | low | no |
| `dockerfile` | `Dockerfile*` | low | no |
| `xray` | JS/TS | medium | no |
| `semgrep` | many langs | high | optional |
| `audit` | `package.json` | medium | yes |
| `osv` | `package.json` | medium | yes |
| `ai` | all files | medium | no |

> Tip: use `--fast` in pre-commit hooks and `--complete` in CI.

## 🧾 Output formats

- **Human** (default) — colourful, grouped by file, with a score bar and score trend.
- **JSON** (`--json`) — the full result: `score`, `rating`, `issues[]`, `counts`, `durationMs`, `pluginResults`.
- **SARIF** (`--sarif`) — SARIF 2.1.0 that loads straight into GitHub Code Scanning.

<details>
<summary>Example JSON (truncated)</summary>

```json
{
  "target": "src/",
  "mode": "complete",
  "score": 87,
  "rating": "good",
  "exitCode": 0,
  "counts": { "total": 4, "error": 0, "warning": 4, "info": 0, "critical": 0 },
  "issues": [
    { "pluginName": "heuristic", "filePath": "src/payments.js", "line": 42, "column": 10, "severity": "warning", "message": "Use of eval()" }
  ],
  "durationMs": 210
}
```
</details>

## 🧰 CLI reference

```bash
harvest [options] [target]
```

| Option | Description |
| --- | --- |
| `-f, --fast` | Fast scan: critical + heuristics + ESLint |
| `-c, --complete` | Complete scan: every plugin |
| `-d, --default` | Balanced default (when no mode is given) |
| `--fix` | Apply safe ESLint autofixes before scanning |
| `-j, --json` | Machine-readable JSON |
| `--sarif` | SARIF 2.1.0 (GitHub Code Scanning) |
| `-o, --output <file>` | Write the report to a file |
| `-i, --incremental` | Scan only files changed vs git `HEAD` |
| `-p, --plugin <name>` | Run a single plugin |
| `--baseline` | Only fail on issues not in the saved baseline |
| `--no-banner` | Hide the ASCII banner |

**Subcommands**

| Command | Description |
| --- | --- |
| `harvest baseline [target]` | Save current issues as an accepted baseline |
| `harvest doctor` | Check your Harvest setup |
| `harvest outdated` | Check for outdated dependencies |
| `harvest plugin list` | List all plugins and their state |
| `harvest plugin enable\|disable <name>` | Toggle a plugin |
| `harvest plugin create <name>` | Scaffold a new plugin from the template |

## 🤖 GitHub Action

```yaml
# .github/workflows/harvest.yml
name: Harvest
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
          sarif_file: harvest.sarif
```

Inputs: `target`, `mode` (`fast|default|complete`), `sarif-file`, `fail-on-error`, `baseline`.

## 🪜 Baseline (ratchet) mode

Adopt Harvest on an existing codebase without drowning in the current backlog:

```bash
harvest baseline .        # writes .harvest/baseline.json
harvest . --baseline      # known issues ignored; only new issues fail CI
```

Harvest also records each run's score in `.harvest/history.json` and prints the delta since the previous run.

## 🧩 VS Code extension

**Harvest Guard** runs a fast scan on open/save, shows findings as inline diagnostics, and displays a live score in the status bar.

- Commands: **Harvest Guard: Scan Current File**, **Harvest Guard: Scan Workspace**
- Powered by the same `harvest-scan` engine
- Build it from source: `cd harvest-guard && npm install && npx @vscode/vsce package` → produces `harvest-guard-1.0.0.vsix`, installable via **Extensions → Install from VSIX…**

## 🧑‍💻 Programmatic & REST API

```js
import { scan, fix } from 'harvest-scan';

await fix('src/');                                   // optional autofix pass
const result = await scan('src/', { mode: 'complete' });

console.log(`${result.score}/100 (${result.rating})`);
for (const issue of result.issues) {
  console.log(`${issue.filePath}:${issue.line} ${issue.message} (${issue.pluginName})`);
}
```

**REST API** — run `npm run start-api` to expose:

- `POST /scan` — body `{ "target": "./src", "mode": "fast" }`
- `GET /scan/stream` — Server-Sent Events with live progress
- Swagger UI at `/docs`

## 🔌 Writing a plugin

A plugin is a class extending `Plugin` with a static `applies(file)` and an async `run(file, ctx)` returning issues. The engine auto-discovers every plugin in the plugins directory — no registration needed.

```js
// plugins/no-console.js — auto-discovered by the engine
import { Plugin } from '../src/plugin-interface.js';

export class NoConsolePlugin extends Plugin {
  static pluginName = 'no-console';
  static applies(file) { return file.endsWith('.js'); }
  async run(file, { content }) {
    return content.split('\n').flatMap((line, i) =>
      line.includes('console.log')
        ? [{ pluginName: 'no-console', filePath: file, line: i + 1, column: 0, severity: 'info', message: 'console.log left in code' }]
        : []
    );
  }
}
```

```bash
harvest plugin create no-console   # scaffolds from the template
harvest plugin list
```

## ⚙️ Configuration

Configuration is optional. Create `harvest.config.js` in your project root to tune weights, thresholds, and which plugins run.

```js
// harvest.config.js
export default {
  weights: {            // per-issue score penalty (overrides defaults)
    eslint: 2,
    xray: 8,
    osv: 10,
  },
  thresholds: {
    complexity: 12,     // cyclomatic complexity limit
  },
  plugins: {
    semgrep: { enabled: false },   // disable a plugin entirely
  },
};
```

## ❓ FAQ

**Does it send my code anywhere?**
No. `fast` and `default` modes run entirely offline. In `complete` mode, `osv` sends only your dependency **names and versions** (from `package.json`) to the public OSV.dev API, and `semgrep` (if installed) runs locally.

**Which languages are supported?**
JavaScript/TypeScript get the deepest coverage (lint, complexity, AST). `critical`, `heuristic`, `ai`, and `semgrep` work across many languages, and `dockerfile` covers container images.

**How do I ignore files?**
Harvest respects your `.gitignore` and skips `node_modules`, `dist`, `out`, `build`, `coverage`, binaries, and files over 512 KB. Disable individual plugins in `harvest.config.js`.

**Why a single score?**
Because trends beat snapshots. One number makes it obvious whether a change improved or regressed quality — perfect for PR gates and dashboards.

**It failed my CI — how do I adopt gradually?**
Use [baseline mode](#-baseline-ratchet-mode): record today's issues once, then only *new* issues fail the build.

## 🗺️ Roadmap

- [x] Consolidated engine, SARIF, baseline, score trend
- [x] Autofix (`--fix`)
- [x] GitHub Action
- [x] VS Code extension (buildable `.vsix`)
- [ ] Publish the extension to the Marketplace
- [ ] Editor live diagnostics + `--watch`
- [ ] Hosted score badge endpoint
- [ ] More language-native plugins

## 🤝 Contributing

```bash
git clone https://github.com/Aditya060806/Harvest.git
cd Harvest
npm install
npm test        # run the suite
npm run lint    # lint & auto-fix
node cli.js .   # run from source
```

Please add tests for changes and run `npm test` before opening a PR.

## 📄 License

[MIT](LICENSE) © [Aditya Pandey](https://github.com/Aditya060806)

<div align="center"><sub>Built with 🌾 by Aditya Pandey</sub></div>
