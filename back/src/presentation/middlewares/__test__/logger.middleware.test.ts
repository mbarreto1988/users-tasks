import { Request, Response, NextFunction } from 'express';

import { loggerMiddleware } from '../logger.middleware';

describe('loggerMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      originalUrl: '/api/test',
      body: { key: 'value' },
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should log request with authenticated user', () => {
    mockReq.user = {
      userId: 10,
      role: 'admin',
      email: 'admin@example.com',
    } as any;

    loggerMiddleware(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(console.log).toHaveBeenCalled();
    const logOutput = (console.log as jest.Mock).mock.calls[0][0];
    expect(logOutput).toContain('[POST] /api/test');
    expect(logOutput).toContain('Usuario ID: 10');
    expect(logOutput).toContain('Rol: admin');
    expect(logOutput).toContain('Email: admin@example.com');
    expect(logOutput).toContain('"key": "value"');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log request for unauthenticated user', () => {
    mockReq.user = undefined;

    loggerMiddleware(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(console.log).toHaveBeenCalled();
    const logOutput = (console.log as jest.Mock).mock.calls[0][0];
    expect(logOutput).toContain('[POST] /api/test');
    expect(logOutput).toContain('⚠️ Usuario no autenticado');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle empty body gracefully', () => {
    mockReq.body = {};

    loggerMiddleware(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(console.log).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
