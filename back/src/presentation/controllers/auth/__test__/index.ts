import { AuthController } from '../auth.controller';
import { AuthUseCase } from '../../../../application/use-cases/auth/authUseCases';
import { successResponse } from '../../../../shared/http/response';

describe('AuthController', () => {
  let mockUseCase: jest.Mocked<AuthUseCase>;
  let controller: AuthController;
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockUseCase = {
      register: jest.fn(),
      login: jest.fn()
    } as unknown as jest.Mocked<AuthUseCase>;

    controller = new AuthController(mockUseCase);

    mockReq = { body: { email: 'test@example.com', password: '12345' } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockResult = {
        message: 'User registered',
        user: {
          id: 1,
          userName: 'testuser',
          email: 'test@example.com',
          role: 'user'
        }
      };
      mockUseCase.register.mockResolvedValue(mockResult);

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockUseCase.register).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario registrado',
        ...successResponse(mockResult)
      });
    });

    it('should call next on error', async () => {
      const error = new Error('fail');
      mockUseCase.register.mockRejectedValue(error);

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const mockResult = {
        message: 'Login exitoso',
        tokens: {
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken'
        },
        user: {
          id: 1,
          userName: 'testuser',
          email: 'test@example.com',
          role: 'user'
        }
      };
      mockUseCase.login.mockResolvedValue(mockResult);

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockUseCase.login).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login exitoso',
        ...successResponse(mockResult)
      });
    });

    it('should call next on error', async () => {
      const error = new Error('fail');
      mockUseCase.login.mockRejectedValue(error);

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
