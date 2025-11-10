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

  it('debería llamar next si el usuario tiene un rol permitido', () => {
    mockReq.user = { role: 'admin' } as any;
    const middleware = roleMiddleware(['admin', 'manager']);

    middleware(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalled();
  });

  it('debería lanzar AppError(403) si el rol del usuario no está permitido', () => {
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
      expect(err.message).toBe('You do not have permission to access this route');
    }
  });

  it('debería lanzar AppError(401) si el usuario no está autenticado', () => {
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
      expect(err.message).toBe('Not authenticated');
    }
  });
});
