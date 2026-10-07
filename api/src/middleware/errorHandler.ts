import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class that carries an HTTP status code.
 * Throw this from any controller/middleware and errorHandler will format it.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Global error handler — every error response exits through here to
 * guarantee the shape { success: false, message, code }.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code ?? httpCodeToString(err.statusCode),
    });
    return;
  }

  // Unexpected errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
}

function httpCodeToString(code: number): string {
  const map: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    500: 'INTERNAL_SERVER_ERROR',
  };
  return map[code] ?? 'ERROR';
}
