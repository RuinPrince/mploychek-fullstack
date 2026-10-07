import { of, throwError, delay } from 'rxjs';
import { withLoadState, LoadState } from './load-state';

describe('withLoadState operator', () => {
  it('should emit loading, then success', (done) => {
    const source$ = of('Test Data').pipe(delay(10));
    const results: LoadState<string>[] = [];

    source$.pipe(withLoadState()).subscribe({
      next: (state) => results.push(state),
      complete: () => {
        expect(results.length).toBe(2);
        expect(results[0]).toEqual({ status: 'loading' });
        expect(results[1]).toEqual({ status: 'success', data: 'Test Data' });
        done();
      }
    });
  });

  it('should emit loading, then empty if data is an empty array', (done) => {
    const source$ = of([]).pipe(delay(10));
    const results: LoadState<any[]>[] = [];

    source$.pipe(withLoadState()).subscribe({
      next: (state) => results.push(state),
      complete: () => {
        expect(results.length).toBe(2);
        expect(results[0]).toEqual({ status: 'loading' });
        expect(results[1]).toEqual({ status: 'empty' });
        done();
      }
    });
  });

  it('should emit loading, then error on failure', (done) => {
    const mockError = new Error('Network Error');
    const source$ = throwError(() => mockError);
    const results: LoadState<any>[] = [];

    source$.pipe(withLoadState()).subscribe({
      next: (state) => results.push(state),
      error: () => {
        fail('Should not emit error event, should catch and emit LoadState');
      },
      complete: () => {
        expect(results.length).toBe(2);
        expect(results[0]).toEqual({ status: 'loading' });
        expect(results[1]).toEqual({ status: 'error', error: 'Network Error' });
        done();
      }
    });
  });
});
