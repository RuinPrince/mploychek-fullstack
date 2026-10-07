import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Stores the simulated API delay in milliseconds.
 * The topbar exposes a control that writes to this service,
 * and every data service reads from it to append ?delay=.
 */
@Injectable({ providedIn: 'root' })
export class DelayService {
  private readonly delaySubject = new BehaviorSubject<number>(0);
  readonly delay$: Observable<number> = this.delaySubject.asObservable();

  readonly options: { label: string; value: number }[] = [
    { label: 'None', value: 0 },
    { label: '1 s',  value: 1000 },
    { label: '2 s',  value: 2000 },
    { label: '3 s',  value: 3000 },
    { label: '5 s',  value: 5000 },
  ];

  get current(): number {
    return this.delaySubject.value;
  }

  set(ms: number): void {
    this.delaySubject.next(ms);
  }
}
