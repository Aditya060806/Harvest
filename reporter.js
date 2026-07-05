// Output formatters for Harvest: human-friendly terminal, JSON, and SARIF.
import path from 'node:path';
import chalk from 'chalk';

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 };

export function grade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function scoreColor(score) {
  if (score >= 90) return chalk.green;
  if (score >= 75) return chalk.greenBright;
  if (score >= 50) return chalk.yellow;
  if (score >= 25) return chalk.hex('#FFA500');
  return chalk.red;
}

function severityTag(severity) {
  switch (severity) {
    case 'error':
      return chalk.bgRed.white(' ERROR ');
    case 'info':
      return chalk.bgBlue.white(' INFO  ');
    default:
      return chalk.bgYellow.black(' WARN  ');
  }
}

function scoreBar(score, width = 24) {
  const filled = Math.round((score / 100) * width);
  const color = scoreColor(score);
  return color('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled));
}

/** Build the colourful terminal report. */
export function formatHuman(result, { root = process.cwd(), maxIssues = 100 } = {}) {
  const out = [];
  const color = scoreColor(result.score);
  const rel = (p) => {
    try {
      return path.relative(root, p) || path.basename(p);
    } catch {
      return p;
    }
  };

  out.push('');
  out.push(
    `  ${color.bold(grade(result.score))}  ${color.bold(`${result.score}/100`)}  ${scoreBar(
      result.score
    )}  ${chalk.gray(result.rating)}`
  );

  const c = result.counts ?? { error: 0, warning: 0, info: 0, total: 0 };
  out.push(
    `  ${chalk.red(`${c.error} error`)}  ${chalk.yellow(`${c.warning} warning`)}  ${chalk.blue(
      `${c.info} info`
    )}  ${chalk.gray(`· ${c.total} total · ${result.durationMs}ms`)}`
  );
  out.push('');

  if (!result.issues.length) {
    out.push(chalk.green('  ✓ No issues found. Clean harvest! 🥕'));
    out.push('');
    return out.join('\n');
  }

  // Group by file, sort by severity.
  const byFile = new Map();
  for (const issue of result.issues) {
    const key = rel(issue.filePath);
    if (!byFile.has(key)) byFile.set(key, []);
    byFile.get(key).push(issue);
  }

  let shown = 0;
  for (const [file, issues] of byFile) {
    if (shown >= maxIssues) break;
    out.push(chalk.underline(file));
    issues
      .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 1) - (SEVERITY_ORDER[b.severity] ?? 1))
      .forEach((issue) => {
        if (shown >= maxIssues) return;
        const loc = chalk.gray(`${issue.line}:${issue.column}`);
        out.push(
          `  ${severityTag(issue.severity)} ${loc}  ${issue.message}  ${chalk.gray(
            `(${issue.pluginName})`
          )}`
        );
        shown += 1;
      });
    out.push('');
  }

  if (result.issues.length > shown) {
    out.push(chalk.gray(`  … and ${result.issues.length - shown} more issue(s).`));
    out.push('');
  }

  return out.join('\n');
}

/** SARIF 2.1.0 — loads directly into GitHub Code Scanning. */
export function toSarif(result) {
  const rulesMap = new Map();
  const results = result.issues.map((issue) => {
    const ruleId = `${issue.pluginName}/${issue.ruleId || 'issue'}`;
    if (!rulesMap.has(ruleId)) {
      rulesMap.set(ruleId, {
        id: ruleId,
        name: ruleId,
        shortDescription: { text: `${issue.pluginName} finding` },
      });
    }
    return {
      ruleId,
      level: issue.severity === 'error' ? 'error' : issue.severity === 'info' ? 'note' : 'warning',
      message: { text: issue.message },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: toUri(issue.filePath) },
            region: {
              startLine: Math.max(1, issue.line || 1),
              startColumn: Math.max(1, issue.column || 1),
            },
          },
        },
      ],
    };
  });

  return {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Harvest',
            informationUri: 'https://github.com/Aditya060806/Harvest',
            rules: [...rulesMap.values()],
          },
        },
        results,
      },
    ],
  };
}

function toUri(filePath) {
  const rel = path.relative(process.cwd(), filePath) || filePath;
  return rel.split(path.sep).join('/');
}
