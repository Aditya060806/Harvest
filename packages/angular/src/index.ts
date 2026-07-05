import { Injectable } from '@angular/core';
import { scan, ScanResult } from '@harvest/core';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HarvestService {
  scan(
    target: string | string[],
    options?: { mode?: 'fast' | 'complete'; json?: boolean }
  ): Observable<ScanResult> {
    return from(scan(target, options));
  }
}
