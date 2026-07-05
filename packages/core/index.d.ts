// Type definitions for @harvest/core

export type Severity = 'error' | 'warning' | 'info';

export type Rating = 'excellent' | 'good' | 'fair' | 'poor' | 'bad';

export type Mode = 'fast' | 'default' | 'complete';

/** A single finding produced by a plugin. */
export interface Issue {
  pluginName: string;
  filePath: string;
  line: number;
  column: number;
  severity: Severity;
  message: string;
  ruleId?: string;
}

export interface Counts {
  total: number;
  error: number;
  warning: number;
  info: number;
  critical: number;
}

export interface PluginResult {
  count: number;
  details: string[];
}

export interface ScanResult {
  target: string;
  mode: Mode;
  score: number;
  rating: Rating;
  exitCode: number;
  issues: Issue[];
  /** Backward-compatible alias of `issues`. */
  messages: Issue[];
  pluginResults: Record<string, PluginResult>;
  counts: Counts;
  durationMs: number;
}

export interface ScanOptions {
  mode?: Mode;
  incremental?: boolean;
  plugin?: string | null;
  stream?: boolean;
  config?: unknown;
}

export interface FixResult {
  ran: boolean;
  filesScanned: number;
  filesChanged: number;
  changedFiles: string[];
}

export function scan(target: string | string[], options?: ScanOptions): Promise<ScanResult>;
export function fix(target?: string): Promise<FixResult>;
export function getRating(score: number): Rating;
export const DEFAULT_WEIGHTS: Record<string, number>;

export default scan;
