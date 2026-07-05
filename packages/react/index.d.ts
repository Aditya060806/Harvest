import { ScanResult } from '@harvest/core';

export function useHarvest(
  target: string | string[],
  options?: { mode?: 'fast' | 'complete'; json?: boolean }
): { result: ScanResult | null; error: Error | null; loading: boolean };
