# 🥕 harvest

<p align="center">
  <img src="https://raw.githubusercontent.com/Aditya060806/Harvest/refs/heads/main/img/logo.svg" width="180" height="160" alt="Harvest logo">
  <br><strong>Fast, plugin-driven security &amp; code-quality scanner. One command, one score.</strong>
  <br><a href="https://github.com/Aditya060806/Harvest">GitHub</a> · <a href="https://www.npmjs.com/package/harvest">npm</a>
</p>

<p align="center">
  <a href="https://github.com/Aditya060806/Harvest/actions/workflows/ci.yml"><img src="https://github.com/Aditya060806/Harvest/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://raw.githubusercontent.com/Aditya060806/Harvest/refs/heads/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/harvest"><img src="https://img.shields.io/npm/v/harvest.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/harvest"><img src="https://img.shields.io/npm/dt/harvest.svg" alt="Downloads"></a>
</p>

Harvest scans your files for security risks and quality problems using a set of composable plugins, then boils everything down to a single **0–100 score** and a letter **grade** — with actionable, file-and-line feedback. It runs locally, in CI, and in your editor.

```console
$ npx harvest src/

  B+  87/100  ███████████████████░░░░░  good
  0 error  4 warning  0 info  · 4 total · 210ms

  src/payments.js
     WARN   42:10  Use of eval()  (heuristic)
     WARN   7:3    Possible hard-coded credential  (heuristic)

  ▲ +5 since last run (was 82)
```

## Contents

- [Why Harvest](#why-harvest)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Output formats](#output-formats)
- [GitHub Action](#github-action)
- [Baseline (ratchet) mode](#baseline-ratchet-mode)
- [Programmatic API](#programmatic-api)
- [REST API](#rest-api)
- [Plugins](#plugins)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Why Harvest

- **One number to watch.** Every scan yields a single score and grade, so quality is easy to track over time.
- **Zero config.** Useful the moment you run it — no config file required.
- **Batteries included.** Critical-pattern detection, heuristics, ESLint, cyclomatic complexity, AST security (js-x-ray), Semgrep OWASP rules, `npm audit`, OSV CVE lookup, Dockerfile checks, and an NLP pass.
- **CI-native.** Meaningful exit codes, SARIF output for GitHub Code Scanning, and a ready-made GitHub Action.
- **Extensible.** Drop a file in `plugins/` (or run `harvest plugin create`) and it's picked up automatically.

## Quick start

```bash
# Try it with no install
npx harvest .

# Or install globally
npm install -g harvest
harvest .
```

## Usage

```bash
harvest [options] [target]
```

| Option | Description |
| --- | --- |
| `-f, --fast` | Fast scan: critical + heuristics + ESLint |
| `-c, --complete` | Complete scan: every plugin |
| `-d, --default` | Balanced default (used when no mode is given) |
| `-j, --json` | Machine-readable JSON |
| `--sarif` | SARIF 2.1.0 (GitHub Code Scanning) |
| `-o, --output <file>` | Write the report to a file |
| `-i, --incremental` | Scan only files changed vs git `HEAD` |
| `-p, --plugin <name>` | Run a single plugin |
| `--baseline` | Only fail on issues not in the saved baseline |
| `--no-banner` | Hide the ASCII banner |

```bash
harvest -f                      # fast scan of the current folder
harvest src/ -c                 # complete scan of src/
harvest . --json > report.json  # JSON for tooling
harvest . --sarif -o harvest.sarif
harvest . -p critical           # run just the critical plugin
```

Exit codes: `0` clean/acceptable, `1` needs attention, `2` failing (or critical issue), `3` unexpected error.

## Output formats

- **Human** (default): colourful, grouped by file, with a score bar and trend.
- **JSON** (`--json`): the full structured result — `score`, `rating`, `issues[]`, `counts`, `durationMs`.
- **SARIF** (`--sarif`): drops straight into GitHub Code Scanning so findings show up inline on PRs.

## GitHub Action

Add security + quality gating to any repo:

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

## Baseline (ratchet) mode

Adopt Harvest on an existing codebase without drowning in the current backlog. Record today's issues as accepted, then fail CI only on **new** ones.

```bash
harvest baseline .        # writes .harvest/baseline.json
harvest . --baseline      # known issues are ignored; only new issues fail
```

Harvest also records each run's score in `.harvest/history.json` and prints the delta since the previous run.

## Programmatic API

```js
import { scan } from 'harvest';

const result = await scan('src/', { mode: 'complete' });
console.log(result.score, result.rating);
for (const issue of result.issues) {
  console.log(`${issue.filePath}:${issue.line} ${issue.message} (${issue.pluginName})`);
}
```

## REST API

Run the server (`npm run start-api`) to expose:

- `POST /scan` — body `{ "target": "./src", "mode": "fast" }`
- `GET /scan/stream` — Server-Sent Events with live progress
- Swagger UI at `/docs`

## Plugins

A plugin is a class extending `Plugin` with a static `applies(file)` and an async `run(file, ctx)` returning issues. The engine auto-discovers every plugin in the plugins directory — no registration needed.

```bash
harvest plugin list
harvest plugin create my-rule   # scaffolds from the template
harvest plugin disable semgrep
```

Built-in plugins: `critical`, `heuristic`, `eslint`, `complexity`, `dockerfile`, `xray`, `semgrep`, `audit`, `osv`, `ai`.

## Configuration

Configuration is optional. Create `harvest.config.js` in your project root to tune weights, thresholds, and which plugins run.

```js
// harvest.config.js
export default {
  weights: { eslint: 2, xray: 8, osv: 10 },
  thresholds: { complexity: 12 },
  plugins: {
    semgrep: { enabled: false },
  },
};
```

## Contributing

Contributions are welcome. Clone the repo, `npm install`, and:

```bash
npm test        # run the test suite
npm run lint    # lint & auto-fix
node cli.js .   # run the CLI from source
```

Please add tests for changes and run `npm test` before opening a PR.

## License

[MIT](LICENSE) © Aditya Pandey
