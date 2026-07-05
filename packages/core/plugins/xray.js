import path from 'node:path';
import { AstAnalyser } from '@nodesecure/js-x-ray';
import { Plugin } from '../src/plugin-interface.js';

const analyser = new AstAnalyser();
const JS_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

// js-x-ray's warning shape has drifted across major versions. Read defensively.
function warningLocation(warning) {
  const loc = warning?.location;
  if (!loc) return { line: 0, column: 0 };
  // v15+: [[startLine, startCol], [endLine, endCol]]
  if (Array.isArray(loc)) {
    const start = Array.isArray(loc[0]) ? loc[0] : loc;
    return { line: start?.[0] ?? 0, column: start?.[1] ?? 0 };
  }
  // older: { start: { line, column } }
  return { line: loc.start?.line ?? 0, column: loc.start?.column ?? 0 };
}

function warningMessage(warning) {
  return warning?.message || warning?.kind || warning?.value || 'Suspicious code pattern';
}

export class XrayPlugin extends Plugin {
  static pluginName = 'xray';

  static applies(filePath) {
    return JS_EXT.has(path.extname(filePath));
  }

  async run(filePath, { content }) {
    let report;
    try {
      report =
        typeof content === 'string' && content.length
          ? await analyser.analyse(content)
          : await analyser.analyseFile(filePath);
    } catch {
      return [];
    }

    const warnings = report?.warnings ?? [];
    return warnings.map((warning) => {
      const { line, column } = warningLocation(warning);
      return {
        pluginName: this.constructor.pluginName,
        filePath,
        line,
        column,
        severity: 'warning',
        message: warningMessage(warning),
        ruleId: warning?.kind,
      };
    });
  }
}
