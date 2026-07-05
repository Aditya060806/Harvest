import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan, getRating } from '../packages/core/src/index.js';
import { toSarif, grade } from '../reporter.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.join(here, 'fixtures', name);

describe('scan()', () => {
  test('flags eval() as a critical issue and fails hard', async () => {
    const result = await scan(fixture('danger.js'), { mode: 'fast' });
    expect(result.counts.critical).toBeGreaterThan(0);
    expect(result.score).toBe(0);
    expect(result.rating).toBe('bad');
    expect(result.exitCode).toBe(2);
    expect(result.issues.some((i) => i.pluginName === 'critical')).toBe(true);
  });

  test('gives a clean file a perfect score', async () => {
    const result = await scan(fixture('clean.js'), { mode: 'fast' });
    expect(result.issues).toHaveLength(0);
    expect(result.score).toBe(100);
    expect(result.rating).toBe('excellent');
    expect(result.exitCode).toBe(0);
  });

  test('returns a structured, consistent shape', async () => {
    const result = await scan(fixture('clean.js'), { mode: 'fast' });
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('counts');
    expect(result).toHaveProperty('durationMs');
    expect(Array.isArray(result.issues)).toBe(true);
    // messages is a backward-compatible alias of issues
    expect(result.messages).toBe(result.issues);
  });

  test('single-plugin option throws for unknown plugins', async () => {
    await expect(scan(fixture('clean.js'), { plugin: 'nope' })).rejects.toThrow(/not found/i);
  });
});

describe('reporter', () => {
  test('grade maps scores to letters', () => {
    expect(grade(100)).toBe('A+');
    expect(grade(0)).toBe('F');
  });

  test('getRating tiers', () => {
    expect(getRating(95)).toBe('excellent');
    expect(getRating(10)).toBe('bad');
  });

  test('toSarif produces a valid 2.1.0 skeleton', async () => {
    const result = await scan(fixture('danger.js'), { mode: 'fast' });
    const sarif = toSarif(result);
    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0].tool.driver.name).toBe('Harvest');
    expect(sarif.runs[0].results.length).toBeGreaterThan(0);
  });
});
