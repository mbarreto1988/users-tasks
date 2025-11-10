import { authMiddleware } from '../auth.middleware';
import { JwtService } from '../../../infrastructure/services/auth.service';
import { AppError } from '../../../shared/errors/AppError';

describe('authMiddleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  it('should call next with AppError if no token is provided', () => {
    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = mockNext.mock.calls[0][0];
    expect(error.message).toBe('Token not provided');
    expect(error.statusCode).toBe(401);
  });

  it('should call next with AppError if token is invalid', () => {
    mockReq.headers.authorization = 'Bearer invalidtoken';
    jest.spyOn(JwtService, 'verifyAccessToken').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid or expired token' })
    );
  });

  it('should attach decoded user and call next if token is valid', () => {
    mockReq.headers.authorization = 'Bearer validtoken';
    const mockDecoded = { userId: 1, email: 'mati@test.com', role: 'user' };

    jest
      .spyOn(JwtService, 'verifyAccessToken')
      .mockReturnValue(mockDecoded as any);

    authMiddleware(mockReq, mockRes, mockNext);

    expect(JwtService.verifyAccessToken).toHaveBeenCalledWith('validtoken');
    expect(mockReq.user).toEqual(mockDecoded);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should propagate AppError from JwtService', () => {
    mockReq.headers.authorization = 'Bearer sometoken';
    const appErr = new AppError('Custom JWT error', 400);

    jest.spyOn(JwtService, 'verifyAccessToken').mockImplementation(() => {
      throw appErr;
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(appErr);
  });
});
