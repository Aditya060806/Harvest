import * as vscode from 'vscode';

// Local types mirror harvest-scan's result shape. We avoid importing types from
// the package directly because it is ESM and this extension host is CommonJS;
// the engine itself is loaded at runtime via dynamic import().
type Severity = 'error' | 'warning' | 'info';

interface Issue {
  line?: number;
  column?: number;
  severity?: Severity;
  message: string;
}

interface ScanResult {
  score: number;
  rating: string;
  issues?: Issue[];
}

type ScanFn = (target: string, opts?: { mode?: 'fast' | 'default' | 'complete' }) => Promise<ScanResult>;

let scanFn: ScanFn | undefined;
async function getScan(): Promise<ScanFn> {
  if (!scanFn) {
    const mod = (await import('harvest-scan')) as unknown as { scan: ScanFn };
    scanFn = mod.scan;
  }
  return scanFn;
}

export function activate(ctx: vscode.ExtensionContext) {
  const diag = vscode.languages.createDiagnosticCollection('harvest-guard');
  ctx.subscriptions.push(diag);

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  ctx.subscriptions.push(status);
  status.text = '🌾 ready';
  status.show();

  async function runScan(doc: vscode.TextDocument) {
    if (doc.isUntitled || doc.uri.scheme !== 'file') return;

    const scan = await getScan();
    const result = await scan(doc.fileName, { mode: 'fast' });
    status.text = `🌾 ${result.score}`;

    const diagnostics: vscode.Diagnostic[] = [];
    for (const r of result.issues ?? []) {
      const line = Math.max(0, (r.line ?? 1) - 1);
      const col = Math.max(0, (r.column ?? 1) - 1);
      const range = new vscode.Range(line, col, line, col + 1);
      diagnostics.push(new vscode.Diagnostic(range, r.message, mapSeverity(r.severity)));
    }
    diag.set(doc.uri, diagnostics);
  }

  function mapSeverity(s?: Severity): vscode.DiagnosticSeverity {
    return s === 'error'
      ? vscode.DiagnosticSeverity.Error
      : s === 'info'
        ? vscode.DiagnosticSeverity.Information
        : vscode.DiagnosticSeverity.Warning;
  }

  ctx.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(runScan),
    vscode.workspace.onDidSaveTextDocument(runScan)
  );

  ctx.subscriptions.push(
    vscode.commands.registerCommand('harvest-guard.scanFile', () => {
      const doc = vscode.window.activeTextEditor?.document;
      if (doc) runScan(doc);
    }),
    vscode.commands.registerCommand('harvest-guard.scanWorkspace', async () => {
      const ws = vscode.workspace.workspaceFolders?.[0];
      if (!ws) {
        vscode.window.showErrorMessage('No workspace is open.');
        return;
      }
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Harvest scan' },
        async () => {
          const scan = await getScan();
          const res = await scan(ws.uri.fsPath, { mode: 'complete' });
          vscode.window.showInformationMessage(`Harvest score: ${res.score} (${res.rating})`);
        }
      );
    })
  );
}

export function deactivate() {}
