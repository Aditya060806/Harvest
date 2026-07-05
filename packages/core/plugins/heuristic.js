import { Plugin } from '../src/plugin-interface.js';

// Stateless (non-global) patterns for reliable line-by-line matching.
// Tuned to favour signal over noise: everyday constructs like a bare
// `require()` are intentionally excluded.
const BAD_PATTERNS = [
  { pattern: /\beval\s*\(/i, message: 'Use of eval()' },
  { pattern: /new\s+Function\s*\(/i, message: 'Use of new Function()' },
  { pattern: /\bexecSync\s*\(/i, message: 'Use of execSync()' },
  { pattern: /\bsystem\s*\(/i, message: 'Use of system()' },
  { pattern: /\bmysqli_query\s*\(/i, message: 'Use of mysqli_query()' },
  { pattern: /\$_(?:GET|POST|REQUEST)\b/, message: 'Unsanitised PHP superglobal (GET/POST/REQUEST)' },
  { pattern: /\bbase64_decode\s*\(/i, message: 'Use of base64_decode()' },
  { pattern: /\bshell_exec\s*\(/i, message: 'Use of shell_exec()' },
  { pattern: /\bpopen\s*\(/i, message: 'Use of popen()' },
  { pattern: /\bpassthru\s*\(/i, message: 'Use of passthru()' },
  { pattern: /\bproc_open\s*\(/i, message: 'Use of proc_open()' },
  { pattern: /\bpcntl_exec\s*\(/i, message: 'Use of pcntl_exec()' },
  { pattern: /\bpreg_replace\s*\(\s*['"].*\/e['"]/i, message: 'preg_replace() with the /e modifier' },
  { pattern: /(?:password|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{6,}['"]/i, message: 'Possible hard-coded credential' },
];

export class HeuristicPlugin extends Plugin {
  static pluginName = 'heuristic';

  static applies() {
    return true;
  }

  async run(filePath, { content }) {
    if (!content) return [];
    const issues = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      for (const { pattern, message } of BAD_PATTERNS) {
        const idx = lines[i].search(pattern);
        if (idx !== -1) {
          issues.push({
            pluginName: this.constructor.pluginName,
            filePath,
            line: i + 1,
            column: idx + 1,
            severity: 'warning',
            message,
          });
        }
      }
    }
    return issues;
  }
}
