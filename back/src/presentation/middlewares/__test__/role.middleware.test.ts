import { Request, Response, NextFunction } from 'express';

import { roleMiddleware } from '../role.middleware';
import { AppError } from '../../../shared/errors/AppError';

describe('roleMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should call next if user has allowed role', () => {
    mockReq.user = { role: 'admin' } as any;
    const middleware = roleMiddleware(['admin', 'manager']);

    middleware(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw AppError(403) if user role is not allowed', () => {
    mockReq.user = { role: 'user' } as any;
    const middleware = roleMiddleware(['admin']);

    expect(() =>
      middleware(mockReq as Request, mockRes as Response, mockNext as NextFunction)
    ).toThrow(AppError);

    try {
      middleware(mockReq as Request, mockRes as Response, mockNext as NextFunction);
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('No tenés permisos para acceder a esta ruta');
    }
  });

  it('should throw AppError(401) if user is not authenticated', () => {
    mockReq.user = undefined;
    const middleware = roleMiddleware(['admin']);

    expect(() =>
      middleware(mockReq as Request, mockRes as Response, mockNext as NextFunction)
    ).toThrow(AppError);

    try {
      middleware(mockReq as Request, mockRes as Response, mockNext as NextFunction);
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('No autenticado');
    }
  });
});
