import { Request, Response, NextFunction } from 'express';

/**
 * Reads the `delay` query parameter from the request and pauses for that
 * many milliseconds (clamped to 0–10 000) before calling next().
 * Invalid or missing values are silently ignored (no delay).
 */
export function delay(req: Request, _res: Response, next: NextFunction): void {
  const raw = req.query['delay'];

  if (typeof raw !== 'string') {
    next();
    return;
  }

  const ms = Number(raw);

  if (isNaN(ms) || ms <= 0) {
    next();
    return;
  }

  const clamped = Math.min(ms, 10_000);
  setTimeout(() => next(), clamped);
}
