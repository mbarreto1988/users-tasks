import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../../shared/errors/AppError';

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    console.error('❌ [Zod Validation Error]', err.issues);
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  if (err instanceof AppError) {
    console.error(`⚠️ [AppError] ${err.message}`);
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  console.error('🔥 [Unhandled Error]', err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
}
