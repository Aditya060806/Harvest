import { Observable } from 'rxjs';
import { ScanResult } from '@harvest/core';

export declare class HarvestService {
  scan(
    target: string | string[],
    options?: {
      mode?: 'fast' | 'complete';
      json?: boolean;
    }
  ): Observable<ScanResult>;
}
