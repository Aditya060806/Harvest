// Single source of truth for links & copy. Change these in one place.
export const site = {
  name: 'harvest-scan',
  tagline: 'Fast, plugin-driven security & code-quality scanner.',
  subtitle: 'One command. One score. Ten plugins. Zero config.',
  description:
    'Scan your code for security risks and quality issues with a suite of composable plugins, get a single 0–100 score and letter grade, with actionable file-and-line feedback. Runs locally, in CI, and in your editor.',
  npm: 'https://www.npmjs.com/package/harvest-scan',
  github: 'https://github.com/Aditya060806/Harvest',
  install: 'npx harvest-scan .',
  installGlobal: 'npm install -g harvest-scan',
  author: {
    name: 'Aditya Pandey',
    linkedin: 'https://www.linkedin.com/in/aditya-pandey-p1002/',
    github: 'https://github.com/Aditya060806',
  },
};

export const plugins = [
  { name: 'critical', catches: 'Destructive / RCE patterns — rm -rf /, eval(), child_process.exec, curl | sh, fork bombs. Any hit fails the scan.', applies: 'all files' },
  { name: 'heuristic', catches: 'Risky calls & secrets — eval, execSync, shell_exec, base64_decode, hard-coded credentials.', applies: 'all files' },
  { name: 'eslint', catches: 'Runs ESLint against your project and counts errors.', applies: 'JS / TS' },
  { name: 'complexity', catches: 'Functions exceeding the cyclomatic complexity threshold.', applies: 'JS / TS' },
  { name: 'xray', catches: 'AST-level security analysis via @nodesecure/js-x-ray.', applies: 'JS / TS' },
  { name: 'dockerfile', catches: 'Image hygiene — non-root USER, pinned tags, leaked secrets, exec-form CMD.', applies: 'Dockerfile*' },
  { name: 'semgrep', catches: 'OWASP Top Ten rules across 30+ languages.', applies: 'many langs' },
  { name: 'audit', catches: 'npm audit severity rolled into the score.', applies: 'package.json' },
  { name: 'osv', catches: 'Known CVEs for your dependencies via the OSV.dev API.', applies: 'package.json' },
  { name: 'ai', catches: 'NLP pass flagging dangerous security terms in any text.', applies: 'all files' },
];

export const features = [
  { icon: '🎯', title: 'One number to watch', body: 'Every scan yields a single 0–100 score and letter grade, so quality trends are obvious across commits and PRs.' },
  { icon: '⚡', title: 'Fast & parallel', body: 'Plugins run concurrently with read-once file caching; binaries and huge files are skipped automatically.' },
  { icon: '🔌', title: '10 plugins built in', body: 'Critical patterns, heuristics, ESLint, complexity, AST security, Semgrep, npm audit, OSV CVEs, Dockerfile, and NLP.' },
  { icon: '🧩', title: 'Auto-discovered plugins', body: 'Drop a file in plugins/ (or run harvest plugin create) — it is picked up automatically, no wiring.' },
  { icon: '🛠️', title: 'Autofix', body: '--fix applies safe ESLint fixes before scanning, so you ship cleaner code without manual edits.' },
  { icon: '🧾', title: 'SARIF + JSON', body: 'Findings show up inline on GitHub PRs via SARIF; JSON output plugs into any tooling.' },
  { icon: '🪜', title: 'Baseline / ratchet', body: 'Adopt on legacy code and fail CI only on new issues — never drown in the existing backlog.' },
  { icon: '🤖', title: 'CI-native', body: 'Real exit codes and a ready-made GitHub Action. Gate merges on quality with one step.' },
];

export const grades = [
  { range: '90–100', rating: 'excellent', grade: 'A', exit: '0', color: 'text-emerald-400' },
  { range: '75–89', rating: 'good', grade: 'B', exit: '0', color: 'text-lime-400' },
  { range: '50–74', rating: 'fair', grade: 'C', exit: '0', color: 'text-yellow-400' },
  { range: '25–49', rating: 'poor', grade: 'D', exit: '1', color: 'text-orange-400' },
  { range: '0–24', rating: 'bad', grade: 'F', exit: '2', color: 'text-red-400' },
];
