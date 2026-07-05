// Score trend + baseline (ratchet) support, stored under .harvest/ in the project.
import fs from 'node:fs/promises';
import path from 'node:path';

function dir(root) {
  return path.join(root, '.harvest');
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

/** A stable identifier for an issue that survives line shifts. */
export function fingerprint(issue, root) {
  const rel = path.relative(root, issue.filePath).split(path.sep).join('/');
  return `${issue.pluginName}|${rel}|${issue.message}`;
}

/** Append a score entry and return the previous score (or null). */
export async function recordHistory(root, score) {
  const file = path.join(dir(root), 'history.json');
  const history = await readJson(file, []);
  const previous = history.length ? history[history.length - 1].score : null;
  history.push({ date: new Date().toISOString(), score });
  // keep the last 100 entries
  await writeJson(file, history.slice(-100));
  return previous;
}

export async function saveBaseline(root, issues) {
  const file = path.join(dir(root), 'baseline.json');
  const prints = [...new Set(issues.map((i) => fingerprint(i, root)))].sort();
  await writeJson(file, { createdAt: new Date().toISOString(), issues: prints });
  return prints.length;
}

export async function loadBaseline(root) {
  const file = path.join(dir(root), 'baseline.json');
  const data = await readJson(file, null);
  return data ? new Set(data.issues) : null;
}
