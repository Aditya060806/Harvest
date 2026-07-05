import { Plugin } from '../src/plugin-interface.js';

// Non-global regexes: `.test()` is stateless, so line-by-line scanning is reliable.
const PATTERNS = [
  { pattern: /rm\s+-rf\s+(?:\/|~|\$HOME)/i, message: 'Destructive command: rm -rf on a root/home path' },
  { pattern: /:\(\)\s*\{\s*:\|:&\s*\};:/, message: 'Fork-bomb pattern detected' },
  { pattern: /\beval\s*\(/i, message: 'Use of eval()' },
  { pattern: /new\s+Function\s*\(/i, message: 'Dynamic code execution via new Function()' },
  { pattern: /child_process[\s\S]{0,20}\bexec(?:Sync)?\s*\(/i, message: 'Shell execution via child_process.exec' },
  { pattern: /\bos\.system\s*\(/i, message: 'Use of os.system()' },
  { pattern: /\bsubprocess\.(?:call|Popen|run)\s*\(/i, message: 'Python subprocess execution' },
  { pattern: /curl\s+[^|]*\|\s*(?:sudo\s+)?(?:ba)?sh/i, message: 'Piping a remote download straight into a shell' },
];

export class CriticalPlugin extends Plugin {
  static pluginName = 'critical';

  static applies() {
    return true; // critical patterns can appear in any file type
  }

  async run(filePath, { content }) {
    if (!content) return [];
    const issues = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      for (const { pattern, message } of PATTERNS) {
        if (pattern.test(lines[i])) {
          issues.push({
            pluginName: this.constructor.pluginName,
            filePath,
            line: i + 1,
            column: (lines[i].search(pattern) ?? 0) + 1,
            severity: 'error',
            message,
          });
        }
      }
    }
    return issues;
  }
}
