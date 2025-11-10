import { loggerMiddleware } from '../logger.middleware';
import { Request, Response, NextFunction } from 'express';

describe('loggerMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      originalUrl: '/api/test',
      body: { key: 'value' },
      user: undefined,
    };
    mockRes = {};
    mockNext = jest.fn();

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería loguear un request con usuario autenticado', () => {
    mockReq.user = {
      userId: 10,
      role: 'admin',
      email: 'admin@example.com',
    };

    loggerMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    const allLogs = (console.log as jest.Mock).mock.calls
      .map(call => call[0])
      .join('\n');

    expect(allLogs).toContain('[POST] /api/test');
    expect(allLogs).toContain('User ID: 10');
    expect(allLogs).toContain('Rol: admin');
    expect(allLogs).toContain('Email: admin@example.com');
    expect(allLogs).toContain('"key": "value"');
    expect(mockNext).toHaveBeenCalled();
  });

  it('debería loguear un request sin usuario autenticado', () => {
    loggerMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    const allLogs = (console.log as jest.Mock).mock.calls
      .map(call => call[0])
      .join('\n');

    expect(allLogs).toContain('[POST] /api/test');
    expect(allLogs).toContain('Unauthenticated user (public route or login)');
    expect(mockNext).toHaveBeenCalled();
  });

  it('debería manejar un body vacío sin romper', () => {
    mockReq.body = undefined;

    loggerMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    const allLogs = (console.log as jest.Mock).mock.calls
      .map(call => call[0])
      .join('\n');

    expect(allLogs).toContain('[POST] /api/test');
    expect(mockNext).toHaveBeenCalled();
  });
});
