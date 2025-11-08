
import { Request, Response, NextFunction } from 'express';

import { AppError } from '../../shared/errors/AppError';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) throw new AppError('No autenticado', 401);

    const hasAccess = allowedRoles.includes(user.role);
    if (!hasAccess) throw new AppError('No tenés permisos para acceder a esta ruta', 403);

    next();
  };
}
