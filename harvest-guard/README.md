# Harvest Guard

In-editor security & code-quality scanning powered by [harvest-scan](https://www.npmjs.com/package/harvest-scan).

Harvest Guard runs a fast scan on the files you open and save, surfaces issues as inline diagnostics, and shows a live quality score in the status bar.

## Features

- 🌾 **Live score** in the status bar for the active file.
- 🔎 **Inline diagnostics** — findings appear as squiggles with severity (error / warning / info).
- ⚡ **Scan on open & save** — no manual trigger needed.
- 🧰 **Commands**:
  - `Harvest Guard: Scan Current File`
  - `Harvest Guard: Scan Workspace`

## How it works

The extension calls the `harvest-scan` engine, which runs a suite of plugins (critical patterns, heuristics, ESLint, complexity, AST security, and more) and returns structured issues. Open files are scanned in `fast` mode; the workspace command uses a `complete` scan.

## Requirements

- VS Code `^1.80.0`
- Node.js 18+ available to the extension host

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run **Harvest Guard: Scan Current File** or **Harvest Guard: Scan Workspace**.

## Links

- CLI & engine: https://www.npmjs.com/package/harvest-scan
- Source & issues: https://github.com/Aditya060806/Harvest

## License

[MIT](https://github.com/Aditya060806/Harvest/blob/main/LICENSE) © Aditya Pandey
