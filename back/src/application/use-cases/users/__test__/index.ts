import bcrypt from 'bcrypt';

import { UsersUseCase } from '../user.useCases';
import { IUserRepository } from '../../../../domain/repositories/users/IUserRepository';
import { AppError } from '../../../../shared/errors/AppError';

describe('UsersUseCase', () => {
  let mockRepo: jest.Mocked<IUserRepository>;
  let useCase: UsersUseCase;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockRepo = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new UsersUseCase(mockRepo);
  });

  describe('getAll', () => {
    it('should return all users for admin', async () => {
      mockRepo.getAll.mockResolvedValue([{ id: 1 }] as any);
      const result = await useCase.getAll(1, 'admin');
      expect(result).toHaveLength(1);
      expect(mockRepo.getAll).toHaveBeenCalled();
    });

    it('should return only current user for regular user', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1 } as any);
      const result = await useCase.getAll(1, 'user');
      expect(result[0].id).toBe(1);
    });

    it('should throw if user not found', async () => {
      mockRepo.getById.mockResolvedValue(null);
      await expect(useCase.getAll(99, 'user')).rejects.toThrow(AppError);
    });
  });

  describe('getById', () => {
    it('should return user if admin', async () => {
      mockRepo.getById.mockResolvedValue({ id: 2 } as any);
      const result = await useCase.getById(2, 1, 'admin');
      expect(result.id).toBe(2);
    });

    it('should throw if user not found', async () => {
      mockRepo.getById.mockResolvedValue(null);
      await expect(useCase.getById(2, 1, 'admin')).rejects.toThrow(AppError);
    });

    it('should throw if user not authorized', async () => {
      await expect(useCase.getById(2, 1, 'user')).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('should create a user if admin', async () => {
      mockRepo.create.mockResolvedValue({
        id: 1,
        email: 'new@user.com'
      } as any);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      const result = await useCase.create(
        {
          firstName: 'John',
          lastName: 'Doe',
          userName: 'jdoe',
          email: 'john@doe.com',
          password: '12345',
          userRole: 'user'
        },
        'admin'
      );

      expect(result.email).toBe('new@user.com');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('should throw if not admin', async () => {
      await expect(
        useCase.create(
          {
            firstName: 'John',
            lastName: 'Doe',
            userName: 'jdoe',
            email: 'john@doe.com',
            password: '12345',
            userRole: 'user'
          },
          'user'
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('update', () => {
    it('should update user if admin', async () => {
      const mockUser = { id: 1, passwordHash: 'hash', isActive: true };
      mockRepo.getById.mockResolvedValue(mockUser as any);
      mockRepo.update.mockResolvedValue({
        ...mockUser,
        firstName: 'New'
      } as any);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      const result = await useCase.update(
        1,
        {
          firstName: 'New',
          lastName: 'Doe',
          userName: 'newuser',
          email: 'new@user.com',
          password: '12345',
          userRole: 'user'
        },
        1,
        'admin'
      );

      expect(result.firstName).toBe('New');
      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      mockRepo.getById.mockResolvedValue(null);
      await expect(
        useCase.update(
          1,
          {
            firstName: 'Fail',
            lastName: 'User',
            userName: 'fail',
            email: 'fail@user.com',
            password: '12345',
            userRole: 'user'
          },
          1,
          'admin'
        )
      ).rejects.toThrow(AppError);
    });

    it('should throw if not authorized', async () => {
      await expect(
        useCase.update(
          1,
          {
            firstName: 'Fail',
            lastName: 'User',
            userName: 'fail',
            email: 'fail@user.com',
            password: '123',
            userRole: 'user'
          },
          2,
          'user'
        )
      ).rejects.toThrow(AppError);
    });

    it('should throw if update fails', async () => {
      const mockUser = { id: 1, passwordHash: 'hash', isActive: true };
      mockRepo.getById.mockResolvedValue(mockUser as any);
      mockRepo.update.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      await expect(
        useCase.update(
          1,
          {
            firstName: 'Valid',
            lastName: 'User',
            userName: 'vuser',
            email: 'vuser@ok.com',
            password: '12345',
            userRole: 'user'
          },
          1,
          'admin'
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('patch', () => {
    it('should update partially if admin', async () => {
      const mockUser = { id: 1, passwordHash: 'hash', isActive: true };
      mockRepo.getById.mockResolvedValue(mockUser as any);
      mockRepo.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Patch'
      } as any);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      const result = await useCase.patch(1, { firstName: 'Patch' }, 1, 'admin');
      expect(result.firstName).toBe('Patch');
    });

    it('should throw if not authorized', async () => {
      await expect(useCase.patch(1, {}, 2, 'user')).rejects.toThrow(AppError);
    });

    it('should throw if user not found', async () => {
      mockRepo.getById.mockResolvedValue(null);
      await expect(useCase.patch(1, {}, 1, 'admin')).rejects.toThrow(AppError);
    });

    it('should throw if patch fails', async () => {
      const mockUser = { id: 1, passwordHash: 'hash', isActive: true };
      mockRepo.getById.mockResolvedValue(mockUser as any);
      mockRepo.update.mockResolvedValue(null);
      await expect(useCase.patch(1, {}, 1, 'admin')).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete if admin', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1 } as any);
      mockRepo.delete.mockResolvedValue(true);
      await expect(useCase.delete(1, 1, 'admin')).resolves.not.toThrow();
    });

    it('should throw if not authorized', async () => {
      await expect(useCase.delete(1, 2, 'user')).rejects.toThrow(AppError);
    });

    it('should throw if user not found', async () => {
      mockRepo.getById.mockResolvedValue(null);
      await expect(useCase.delete(1, 1, 'admin')).rejects.toThrow(AppError);
    });

    it('should throw if delete fails', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1 } as any);
      mockRepo.delete.mockResolvedValue(false);
      await expect(useCase.delete(1, 1, 'admin')).rejects.toThrow(AppError);
    });
  });
});
