import bcrypt from 'bcrypt';

import { AuthUseCase } from '../authUseCases';
import { AppError } from '../../../../shared/errors/AppError';
import { JwtService } from '../../../../infrastructure/services/auth.service';
import { IAuthRepository } from '../../../../domain/repositories/auth/IAuthRepository';

describe('AuthUseCase', () => {
  let mockAuthRepo: jest.Mocked<IAuthRepository>;
  let useCase: AuthUseCase;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockAuthRepo = {
      findByEmail: jest.fn(),
      create: jest.fn()
    } as unknown as jest.Mocked<IAuthRepository>;

    useCase = new AuthUseCase(mockAuthRepo);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockData = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'jdoe',
        email: 'john@example.com',
        password: '12345',
        userRole: 'user' as 'user' | 'admin' // ✅ tip fix
      };

      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockAuthRepo.create.mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        userName: 'jdoe',
        email: 'john@example.com',
        passwordHash: 'hashed',
        userRole: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: null
      });

      const result = await useCase.register(mockData);

      expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(result.user.email).toBe('john@example.com');
      expect(result.message).toBe('User successfully registered');
    });

    it('should throw error if email already exists', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({} as any);

      await expect(
        useCase.register({
          firstName: 'Test',
          lastName: 'User',
          userName: 'tuser',
          email: 'exists@example.com',
          password: '123',
          userRole: 'user'
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError if repo fails', async () => {
      mockAuthRepo.findByEmail.mockRejectedValue(new Error('DB down'));

      await expect(
        useCase.register({
          firstName: 'Fail',
          lastName: 'User',
          userName: 'failuser',
          email: 'fail@example.com',
          password: '123',
          userRole: 'user'
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        passwordHash: await bcrypt.hash('12345', 10),
        userRole: 'admin' as 'user' | 'admin',
        userName: 'johnny',
        isActive: true
      };

      mockAuthRepo.findByEmail.mockResolvedValue(mockUser as any);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never); // ✅ fixed
      jest
        .spyOn(JwtService, 'generateAccessToken')
        .mockReturnValue('access123');
      jest
        .spyOn(JwtService, 'generateRefreshToken')
        .mockReturnValue('refresh123');

      const result = await useCase.login({
        email: 'john@example.com',
        password: '12345'
      });

      expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(result.tokens.accessToken).toBe('access123');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw error for invalid credentials', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);

      await expect(
        useCase.login({ email: 'fake@example.com', password: '12345' })
      ).rejects.toThrow(AppError);
    });

    it('should throw error if user is inactive', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        passwordHash: 'hash',
        isActive: false
      } as any);

      await expect(
        useCase.login({ email: 'john@example.com', password: '12345' })
      ).rejects.toThrow(AppError);
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        passwordHash: 'invalid',
        isActive: true
      };
      mockAuthRepo.findByEmail.mockResolvedValue(mockUser as any);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never); // ✅ fixed

      await expect(
        useCase.login({ email: 'john@example.com', password: 'wrong' })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError if unexpected error occurs', async () => {
      mockAuthRepo.findByEmail.mockRejectedValue(new Error('DB fail'));

      await expect(
        useCase.login({ email: 'test@example.com', password: '12345' })
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
