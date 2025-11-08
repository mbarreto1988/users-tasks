import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, _res: Response, next: NextFunction) {
  const method = req.method;
  const url = req.originalUrl;

  const logLines: string[] = [];
  logLines.push(`📥 [${method}] ${url}`);
  
  if (req.user) {
    const { userId, role, email } = req.user;
    logLines.push(`👤 Usuario ID: ${userId} | Rol: ${role} | Email: ${email ?? 'N/A'}`);
  } else {
    logLines.push('⚠️ Usuario no autenticado (public route o login)');
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    logLines.push(`📦 Body: ${JSON.stringify(req.body, null, 2)}`);
  }

  console.log(logLines.join('\n'));
  console.log('──────────────────────────────');

  next();
}
