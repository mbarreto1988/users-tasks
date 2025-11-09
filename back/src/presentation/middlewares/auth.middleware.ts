import { Request, Response, NextFunction } from 'express';

import { JwtService } from '../../infrastructure/services/auth.service';
import { AppError } from '../../shared/errors/AppError';

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token not provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtService.verifyAccessToken(token);

    (req as any).user = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
}
