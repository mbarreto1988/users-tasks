import { ZodError } from 'zod';

import { errorMiddleware } from '../error.middleware';
import { AppError } from '../../../shared/errors/AppError';

describe('errorMiddleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle ZodError correctly', () => {
    const mockIssues: any[] = [
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['email'],
        message: 'Expected string, received number'
      }
    ];

    const zodError = new ZodError(mockIssues);

    errorMiddleware(zodError, mockReq, mockRes, mockNext);

    expect(console.error).toHaveBeenCalledWith(
      '❌ [Zod Validation Error]',
      mockIssues
    );
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Error de validación',
      errors: [
        {
          path: 'email',
          message: 'Expected string, received number'
        }
      ]
    });
  });

  it('should handle AppError correctly', () => {
    const appErr = new AppError('User not found', 404);

    errorMiddleware(appErr, mockReq, mockRes, mockNext);

    expect(console.error).toHaveBeenCalledWith(
      `⚠️ [AppError] ${appErr.message}`
    );
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'User not found'
    });
  });

  it('should handle unexpected errors with 500 status', () => {
    const randomError = new Error('Database crashed');

    errorMiddleware(randomError, mockReq, mockRes, mockNext);

    expect(console.error).toHaveBeenCalledWith(
      '🔥 [Unhandled Error]',
      randomError
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Error interno del servidor'
    });
  });
});
