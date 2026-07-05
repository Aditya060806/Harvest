import path from 'node:path';
import fs from 'node:fs/promises';
import { Plugin } from '../src/plugin-interface.js';

export class DockerfilePlugin extends Plugin {
  static pluginName = 'dockerfile';

  static applies(file) {
    const base = path.basename(file).toLowerCase();
    return base === 'dockerfile' || base.startsWith('dockerfile.');
  }

  async run(file, { content }) {
    const text = content ?? (await safeRead(file));
    if (!text) return [];

    const issues = [];
    const lines = text.split('\n');
    const push = (line, message, severity = 'warning') =>
      issues.push({
        pluginName: this.constructor.pluginName,
        filePath: file,
        line,
        column: 0,
        severity,
        message,
      });

    const instructions = lines
      .map((raw, index) => ({ index, text: raw.trim() }))
      .filter((l) => l.text && !l.text.startsWith('#'));

    // FROM should be the first instruction.
    if (instructions.length && !/^FROM\b/i.test(instructions[0].text)) {
      push(instructions[0].index + 1, 'Dockerfile should start with a FROM instruction.');
    }

    let userSet = false;
    let healthcheckSet = false;

    for (const { index, text: line } of instructions) {
      const upper = line.toUpperCase();
      const lineNo = index + 1;

      if (upper.startsWith('USER')) {
        userSet = true;
        if (/^USER\s+root\b/i.test(line)) {
          push(lineNo, 'Avoid running the container as the root user.', 'error');
        }
      }
      if (upper.startsWith('HEALTHCHECK')) healthcheckSet = true;
      if (upper.startsWith('ADD ')) push(lineNo, 'Prefer COPY over ADD unless you need its extra features.');
      if (/^FROM\b.*:latest\b/i.test(line) || /^FROM\s+\S+\s*$/i.test(line)) {
        push(lineNo, 'Pin a specific image tag instead of relying on :latest.');
      }
      if (/(password|secret|token|api[_-]?key)/i.test(line)) {
        push(lineNo, 'Possible secret embedded in the image layer.', 'error');
      }
      if (line.includes('apt-get install') && !line.includes('--no-install-recommends')) {
        push(lineNo, 'Use --no-install-recommends with apt-get install.');
      }
      if (line.includes('pip install') && !line.includes('--no-cache-dir')) {
        push(lineNo, 'Use --no-cache-dir with pip install.');
      }
      if ((upper.startsWith('CMD') || upper.startsWith('ENTRYPOINT')) && !line.includes('[')) {
        push(lineNo, 'Use exec form (JSON array) for CMD/ENTRYPOINT.');
      }
    }

    if (!userSet) push(1, 'No non-root USER is set; the container runs as root by default.');
    if (!healthcheckSet) push(1, 'Consider adding a HEALTHCHECK instruction.', 'info');

    return issues;
  }
}

async function safeRead(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return null;
  }
}
