#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';

import { scan, fix } from './index.js';
import { formatHuman, toSarif, grade } from './reporter.js';
import { recordHistory, saveBaseline, loadBaseline, fingerprint } from './history.js';
import { listPlugins, enablePlugin, disablePlugin, createPlugin } from './plugin-manager.js';
import { doctor } from './doctor.js';
import { outdated } from './outdated.js';

const VERSION = '6.0.1';

function banner() {
  if (process.stdout.isTTY && !process.env.CI && !process.env.NO_BANNER) {
    console.log(chalk.hex('#FF8C00')(figlet.textSync('harvest', { font: 'Standard' })));
  }
}

async function writeOutput(file, text) {
  await fs.writeFile(path.resolve(process.cwd(), file), text);
}

program
  .name('harvest')
  .description('Fast, plugin-driven security + code-quality scanner. One command, one score.')
  .version(VERSION, '-v, --version')
  .argument('[target]', 'file or directory to scan', '.')
  .option('-f, --fast', 'fast scan (critical + heuristics + lint)')
  .option('-c, --complete', 'complete scan (every plugin)')
  .option('-d, --default', 'default scan (balanced, the default)')
  .option('-j, --json', 'output raw JSON')
  .option('--sarif', 'output SARIF 2.1.0 (GitHub Code Scanning)')
  .option('-o, --output <file>', 'write the report to a file instead of stdout')
  .option('-i, --incremental', 'scan only files changed vs git HEAD')
  .option('-p, --plugin <name>', 'run only a single plugin')
  .option('--baseline', 'only fail on issues that are not in the saved baseline')
  .option('--fix', 'apply safe autofixes (ESLint) before scanning')
  .option('--no-banner', 'hide the ASCII banner')
  .action(async (target, opts) => {
    const mode = opts.fast ? 'fast' : opts.complete ? 'complete' : 'default';
    const root = process.cwd();
    const quiet = opts.json || opts.sarif;

    if (!quiet && opts.banner !== false) banner();

    try {
      if (opts.fix) {
        const fixResult = await fix(target);
        if (!quiet) {
          if (!fixResult.ran) {
            console.log(chalk.gray('  fix: nothing to autofix (no JS/TS files or ESLint unavailable).'));
          } else if (fixResult.filesChanged) {
            console.log(
              chalk.green(`  ✓ Autofixed ${fixResult.filesChanged} file(s) of ${fixResult.filesScanned} scanned.`)
            );
          } else {
            console.log(chalk.gray(`  fix: no autofixable issues in ${fixResult.filesScanned} file(s).`));
          }
        }
      }

      const result = await scan(target, {
        mode,
        incremental: opts.incremental,
        plugin: opts.plugin,
      });

      // Baseline (ratchet): known issues don't fail the build.
      let exitCode = result.exitCode;
      if (opts.baseline) {
        const baseline = await loadBaseline(root);
        if (baseline) {
          const fresh = result.issues.filter((i) => !baseline.has(fingerprint(i, root)));
          const known = result.issues.length - fresh.length;
          exitCode = fresh.some((i) => i.severity === 'error') ? 2 : fresh.length ? 1 : 0;
          if (!quiet) {
            console.log(
              chalk.gray(
                `  baseline: ${known} known issue(s) ignored, ${fresh.length} new.`
              )
            );
          }
        } else if (!quiet) {
          console.log(chalk.gray('  baseline: none found — run `harvest baseline` to create one.'));
        }
      }

      if (opts.json) {
        const text = JSON.stringify(result, null, 2);
        opts.output ? await writeOutput(opts.output, text) : console.log(text);
      } else if (opts.sarif) {
        const text = JSON.stringify(toSarif(result), null, 2);
        opts.output ? await writeOutput(opts.output, text) : console.log(text);
      } else {
        const text = formatHuman(result, { root });
        if (opts.output) {
          await writeOutput(opts.output, text);
        } else {
          console.log(text);
        }
        // Trend line.
        const previous = await recordHistory(root, result.score);
        if (previous !== null && previous !== result.score) {
          const delta = result.score - previous;
          const arrow = delta > 0 ? chalk.green(`▲ +${delta}`) : chalk.red(`▼ ${delta}`);
          console.log(`  ${arrow} ${chalk.gray(`since last run (was ${previous})`)}`);
          console.log('');
        }
      }

      process.exitCode = exitCode;
    } catch (err) {
      console.error(chalk.red(`harvest: ${err.message}`));
      process.exitCode = 3;
    }
  });

program
  .command('baseline [target]')
  .description('save the current issues as an accepted baseline')
  .option('-c, --complete', 'use a complete scan for the baseline')
  .action(async (target = '.', opts) => {
    const root = process.cwd();
    const result = await scan(target, { mode: opts.complete ? 'complete' : 'default' });
    const count = await saveBaseline(root, result.issues);
    console.log(chalk.green(`✓ Baseline saved with ${count} issue(s) → .harvest/baseline.json`));
  });

program.command('doctor').description('check your Harvest setup').action(doctor);
program.command('outdated').description('check for outdated dependencies').action(outdated);

const plugin = program.command('plugin').description('manage plugins');

plugin
  .command('list')
  .description('list all available plugins')
  .action(async () => {
    const plugins = await listPlugins();
    if (!plugins.length) {
      console.log(chalk.yellow('No plugins found.'));
      return;
    }
    for (const p of plugins) {
      const state = p.enabled ? chalk.green('enabled') : chalk.gray('disabled');
      console.log(`  ${p.enabled ? chalk.green('●') : chalk.gray('○')} ${p.name.padEnd(12)} ${state}`);
    }
  });

plugin
  .command('enable <name>')
  .description('enable a plugin')
  .action(async (name) => {
    await enablePlugin(name);
    console.log(chalk.green(`✓ Enabled ${name}`));
  });

plugin
  .command('disable <name>')
  .description('disable a plugin')
  .action(async (name) => {
    await disablePlugin(name);
    console.log(chalk.yellow(`✓ Disabled ${name}`));
  });

plugin
  .command('create <name>')
  .description('scaffold a new plugin from the template')
  .action(async (name) => {
    const { path: created } = await createPlugin(name);
    console.log(chalk.green(`✓ Created plugin '${name}' → ${created}`));
  });

program.parseAsync(process.argv);
