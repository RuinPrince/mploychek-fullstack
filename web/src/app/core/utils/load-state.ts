import { Observable, of, startWith, map, catchError, OperatorFunction, pipe } from 'rxjs';

/**
 * Represents the async state of a data-loading operation.
 *
 * - `loading` — request in flight
 * - `success` — data arrived (may be a single item or a non-empty array)
 * - `empty`   — data arrived but is an empty array
 * - `error`   — request failed
 */
export interface LoadState<T> {
  status: 'loading' | 'success' | 'empty' | 'error';
  data?: T;
  error?: string;
}

function loading<T>(): LoadState<T> {
  return { status: 'loading' };
}

function success<T>(data: T): LoadState<T> {
  return { status: 'success', data };
}

function empty<T>(): LoadState<T> {
  return { status: 'empty' };
}

function error<T>(message: string): LoadState<T> {
  return { status: 'error', error: message };
}

/**
 * RxJS operator that wraps any Observable into a `LoadState<T>` stream.
 *
 * Usage:
 * ```ts
 * records$ = this.recordService.getRecords().pipe(withLoadState());
 * ```
 *
 * In the template:
 * ```html
 * <app-async-view [state]="(records$ | async)!">
 *   <table>...</table>
 * </app-async-view>
 * ```
 *
 * Behaviour:
 * 1. Immediately emits `{ status: 'loading' }` via `startWith`.
 * 2. On next value:
 *    - If the value is an array and empty → emits `{ status: 'empty' }`.
 *    - Otherwise → emits `{ status: 'success', data }`.
 * 3. On error → emits `{ status: 'error', error: message }` (stream completes, never throws).
 */
export function withLoadState<T>(): OperatorFunction<T, LoadState<T>> {
  return pipe(
    map((data: T) => {
      if (Array.isArray(data) && data.length === 0) {
        return empty<T>();
      }
      return success(data);
    }),
    catchError((err: unknown) => {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message: string }).message
          : 'An unexpected error occurred';
      return of(error<T>(message));
    }),
    startWith(loading<T>())
  );
}
