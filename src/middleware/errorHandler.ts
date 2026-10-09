import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error Middleware] ${req.method} ${req.originalUrl} -> StatusCode: ${statusCode} | Error: ${message}`, err.stack);

  return res.status(statusCode).json({
    success: false,
    error: message,
    details: err.details || null,
    timestamp: new Date().toISOString(),
  });
}
