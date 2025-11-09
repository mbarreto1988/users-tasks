import { Request, Response, NextFunction } from 'express';

import { AppError } from '../../shared/errors/AppError';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) throw new AppError('Not authenticated', 401);

    const hasAccess = allowedRoles.includes(user.role);
    if (!hasAccess)
      throw new AppError('You do not have permission to access this route', 403);

    next();
  };
}
