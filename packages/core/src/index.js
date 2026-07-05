// @harvest/core — single scanning engine.
//
// Responsibilities:
//   - Dynamically load every plugin in ../plugins (so `harvest plugin create` works).
//   - Load an optional harvest.config.js (weights / thresholds / enabled plugins).
//   - Discover files (file, directory, or git-incremental), skipping junk & binaries.
//   - Run plugins with per-file/per-plugin error isolation (one bad plugin never
//     kills the whole scan).
//   - Produce a single structured result used by the CLI, REST API and the editor.

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { globby } from 'globby';

import { Plugin } from './plugin-interface.js';

const execFileAsync = promisify(execFile);
const JS_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = path.resolve(__dirname, '../plugins');

/** Default per-issue score penalty for each plugin. */
export const DEFAULT_WEIGHTS = {
  critical: 50,
  osv: 10,
  xray: 8,
  ai: 6,
  dockerfile: 5,
  semgrep: 5,
  audit: 4,
  heuristic: 3,
  eslint: 2,
  complexity: 1,
};

/** Which plugins run in each mode. `complete` runs everything. */
const MODE_PLUGINS = {
  fast: ['critical', 'heuristic', 'eslint'],
  default: ['critical', 'heuristic', 'eslint', 'complexity', 'dockerfile'],
  complete: null,
};

const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg', '.pdf', '.zip',
  '.gz', '.tar', '.rar', '.7z', '.mp3', '.mp4', '.mov', '.avi', '.woff',
  '.woff2', '.ttf', '.eot', '.otf', '.wasm', '.exe', '.dll', '.so', '.dylib',
  '.class', '.jar', '.bin', '.lock',
]);

const MAX_READ_BYTES = 512 * 1024; // don't slurp huge files into memory

export function getRating(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'poor';
  return 'bad';
}

/** Discover and instantiate every Plugin subclass under the plugins directory. */
async function loadPluginClasses() {
  const files = await globby('*.js', { cwd: PLUGINS_DIR });
  const classes = [];
  for (const file of files) {
    if (file === 'template.js') continue;
    let mod;
    try {
      mod = await import(pathToFileURL(path.join(PLUGINS_DIR, file)).href);
    } catch {
      continue; // a broken plugin file must not break discovery
    }
    for (const exported of Object.values(mod)) {
      if (
        typeof exported === 'function' &&
        exported.prototype instanceof Plugin &&
        typeof exported.pluginName === 'string'
      ) {
        classes.push(exported);
      }
    }
  }
  return classes;
}

/** Load harvest.config.js from the target dir or cwd (optional). */
async function loadConfig(target) {
  const dirs = [];
  try {
    const stat = await fs.stat(target);
    dirs.push(stat.isDirectory() ? target : path.dirname(target));
  } catch {
    /* target may not exist yet */
  }
  dirs.push(process.cwd());

  for (const dir of dirs) {
    for (const name of ['harvest.config.js', 'harvest.config.mjs']) {
      const configPath = path.join(dir, name);
      try {
        await fs.access(configPath);
        const mod = await import(pathToFileURL(configPath).href);
        return mod.default ?? mod ?? {};
      } catch {
        /* not found / not importable — keep looking */
      }
    }
  }
  return {};
}

function normalizeIssue(raw, pluginName, fallbackFile) {
  const line = Number.isFinite(raw?.line) ? raw.line : 0;
  const column = Number.isFinite(raw?.column) ? raw.column : 0;
  return {
    pluginName: raw?.pluginName || pluginName,
    filePath: raw?.filePath || raw?.file || fallbackFile,
    line,
    column,
    severity: raw?.severity || 'warning',
    message: raw?.message || 'Issue detected',
    ruleId: raw?.ruleId,
  };
}

async function discoverFiles(target, incremental) {
  let stat;
  try {
    stat = await fs.stat(target);
  } catch {
    return [];
  }
  if (!stat.isDirectory()) return [path.resolve(target)];

  const cwd = path.resolve(target); // globby needs an absolute cwd with gitignore + absolute

  if (incremental) {
    try {
      const diff = execSync('git diff --name-only HEAD', { cwd })
        .toString()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((f) => path.resolve(cwd, f));
      if (diff.length) return diff;
    } catch {
      /* not a git repo / no HEAD — fall back to full scan */
    }
  }

  return globby(['**/*'], {
    cwd,
    gitignore: true,
    absolute: true,
    onlyFiles: true,
    dot: true,
    ignore: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/out/**',
      '**/build/**',
      '**/coverage/**',
    ],
  });
}

/** Read a text file, skipping binaries and oversized files. */
function makeReader() {
  const cache = new Map();
  return async function read(filePath) {
    if (cache.has(filePath)) return cache.get(filePath);
    let content = null;
    try {
      if (!BINARY_EXT.has(path.extname(filePath).toLowerCase())) {
        const stat = await fs.stat(filePath);
        if (stat.size <= MAX_READ_BYTES) {
          content = await fs.readFile(filePath, 'utf8');
        }
      }
    } catch {
      content = null;
    }
    cache.set(filePath, content);
    return content;
  };
}

function resolveActivePlugins(all, { mode, plugin, config }) {
  if (plugin) {
    const single = all.filter((P) => P.pluginName === plugin);
    if (!single.length) throw new Error(`Plugin not found: ${plugin}`);
    return single;
  }
  // `complete` maps to null (= run everything); only fall back to the default
  // set for genuinely unknown modes.
  const modeSet = mode in MODE_PLUGINS ? MODE_PLUGINS[mode] : MODE_PLUGINS.default;
  let active = modeSet ? all.filter((P) => modeSet.includes(P.pluginName)) : all;
  // Respect explicit `enabled: false` from config; unknown plugins default to on.
  active = active.filter((P) => config?.plugins?.[P.pluginName]?.enabled !== false);
  return active;
}

async function collectIssues(activePlugins, files, { target, mode, onEvent }) {
  const read = makeReader();
  const issues = [];
  const pluginResults = {};

  await Promise.all(
    activePlugins.map(async (PluginClass) => {
      const name = PluginClass.pluginName;
      const instance = new PluginClass();
      const applies =
        typeof PluginClass.applies === 'function'
          ? (f) => PluginClass.applies(f)
          : () => false;

      const matching = files.filter(applies);
      let count = 0;

      for (const filePath of matching) {
        const content = await read(filePath);
        try {
          const raw = await instance.run(filePath, {
            target,
            mode,
            content: content ?? '',
          });
          if (Array.isArray(raw)) {
            for (const item of raw) {
              const issue = normalizeIssue(item, name, filePath);
              issues.push(issue);
              count += 1;
              onEvent?.('issue', issue);
            }
          }
        } catch {
          // Plugin threw on this file (parse error, missing tool, API drift).
          // Isolate the failure and keep scanning.
        }
      }

      pluginResults[name] = { count, details: [] };
      onEvent?.('pluginResult', { plugin: name, count });
    })
  );

  return { issues, pluginResults };
}

function score(issues, config) {
  const weights = { ...DEFAULT_WEIGHTS, ...(config?.weights || {}) };
  const criticalCount = issues.filter((i) => i.pluginName === 'critical').length;

  let value = 100;
  for (const issue of issues) value -= weights[issue.pluginName] ?? 1;
  value = Math.max(0, Math.round(value));
  if (criticalCount > 0) value = 0;

  const rating = getRating(value);
  const exitCode = criticalCount > 0 || rating === 'bad' ? 2 : rating === 'poor' ? 1 : 0;
  return { score: value, rating, exitCode, criticalCount };
}

async function performScan(target, options, onEvent) {
  const { mode = 'default', incremental = false, plugin = null } = options;
  const started = Date.now();

  onEvent?.('start', { target, mode });

  const config = options.config ?? (await loadConfig(target));
  const files = await discoverFiles(target, incremental);

  if (!files.length) {
    return {
      target,
      mode,
      score: 100,
      rating: 'excellent',
      exitCode: 0,
      issues: [],
      messages: [],
      pluginResults: {},
      counts: { total: 0, error: 0, warning: 0, info: 0, critical: 0 },
      durationMs: Date.now() - started,
    };
  }

  const all = await loadPluginClasses();
  const active = resolveActivePlugins(all, { mode, plugin, config });
  const { issues, pluginResults } = await collectIssues(active, files, {
    target,
    mode,
    onEvent,
  });

  const { score: value, rating, exitCode, criticalCount } = score(issues, config);
  const counts = {
    total: issues.length,
    error: issues.filter((i) => i.severity === 'error').length,
    warning: issues.filter((i) => i.severity === 'warning').length,
    info: issues.filter((i) => i.severity === 'info').length,
    critical: criticalCount,
  };

  return {
    target,
    mode,
    score: value,
    rating,
    exitCode,
    issues,
    messages: issues, // backward-compatible alias
    pluginResults,
    counts,
    durationMs: Date.now() - started,
  };
}

/**
 * Scan a file or directory.
 *
 * @param {string|string[]} target
 * @param {object} [options]
 * @param {'fast'|'default'|'complete'} [options.mode]
 * @param {boolean} [options.incremental]  Only scan files changed vs git HEAD.
 * @param {string|null} [options.plugin]    Run a single plugin by name.
 * @param {boolean} [options.stream]        Return an EventEmitter instead of a Promise-resolved result.
 * @param {object} [options.config]         Pre-loaded config (skips disk lookup).
 * @returns {Promise<object>|EventEmitter}
 */
export function scan(target, options = {}) {
  const resolvedTarget = Array.isArray(target) ? target[0] : target ?? '.';

  if (options.stream) {
    const emitter = new EventEmitter();
    process.nextTick(async () => {
      try {
        const onEvent = (event, data) => emitter.emit(event, data);
        const result = await performScan(resolvedTarget, options, onEvent);
        emitter.emit('complete', result);
      } catch (err) {
        emitter.emit('error', err);
      }
    });
    return emitter;
  }

  return performScan(resolvedTarget, options);
}

async function hashFile(filePath) {
  try {
    const buf = await fs.readFile(filePath);
    return crypto.createHash('sha1').update(buf).digest('hex');
  } catch {
    return null;
  }
}

function resolveEslintBin() {
  try {
    const requireCJS = createRequire(import.meta.url);
    const eslintMain = requireCJS.resolve('eslint');
    return path.resolve(path.dirname(eslintMain), '../bin/eslint.js');
  } catch {
    return null;
  }
}

/**
 * Apply deterministic autofixes via ESLint's `--fix` over JS/TS files.
 * Uses the project's own ESLint config; files without a resolvable config
 * are left untouched. Returns how many files actually changed on disk.
 *
 * @param {string} target
 * @returns {Promise<{ ran: boolean, filesScanned: number, filesChanged: number, changedFiles: string[] }>}
 */
export async function fix(target = '.') {
  const all = await discoverFiles(target, false);
  const files = all.filter((f) => JS_EXT.has(path.extname(f).toLowerCase()));
  if (!files.length) return { ran: false, filesScanned: 0, filesChanged: 0, changedFiles: [] };

  const eslintBin = resolveEslintBin();
  if (!eslintBin) return { ran: false, filesScanned: files.length, filesChanged: 0, changedFiles: [] };

  const before = new Map();
  for (const f of files) before.set(f, await hashFile(f));

  const resolved = path.resolve(target);
  let runCwd = resolved;
  try {
    if (!(await fs.stat(resolved)).isDirectory()) runCwd = path.dirname(resolved);
  } catch {
    runCwd = process.cwd();
  }

  try {
    await execFileAsync(process.execPath, [eslintBin, resolved, '--fix'], {
      cwd: runCwd,
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    // ESLint exits non-zero when unfixable problems remain — fixes are still written.
  }

  const changedFiles = [];
  for (const f of files) {
    const after = await hashFile(f);
    if (after !== before.get(f)) changedFiles.push(f);
  }

  return {
    ran: true,
    filesScanned: files.length,
    filesChanged: changedFiles.length,
    changedFiles,
  };
}

export default scan;
