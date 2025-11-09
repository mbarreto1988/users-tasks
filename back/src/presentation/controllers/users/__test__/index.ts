import { UsersController } from '../user.controller';
import { UsersUseCase } from '../../../../application/use-cases/users/user.useCases';
import { successResponse } from '../../../../shared/http/response';
import { User } from '../../../../domain/entities/users/user';

describe('UsersController', () => {
  let mockUseCase: jest.Mocked<UsersUseCase>;
  let controller: UsersController;
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  const mockUser: User = {
    id: 1,
    firstName: 'Mati',
    lastName: 'Barreiro',
    userName: 'matiuser',
    email: 'mati@example.com',
    passwordHash: 'hashed',
    userRole: 'admin',
    createdAt: new Date(),
    updatedAt: null,
    isActive: true,
  };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockUseCase = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UsersUseCase>;

    controller = new UsersController(mockUseCase);

    mockReq = {
      user: { userId: 1, role: 'admin' },
      params: { id: '1' },
      body: { firstName: 'Mati' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('getAll', () => {
    it('should return all users with count', async () => {
      mockUseCase.getAll.mockResolvedValue([mockUser]);

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockUseCase.getAll).toHaveBeenCalledWith(1, 'admin');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 1,
        data: [mockUser],
      });
    });
  });

  describe('getById', () => {
    it('should return a user by id', async () => {
      mockUseCase.getById.mockResolvedValue(mockUser);

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockUseCase.getById).toHaveBeenCalledWith(1, 1, 'admin');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(successResponse(mockUser));
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockUseCase.create.mockResolvedValue(mockUser);

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockUseCase.create).toHaveBeenCalledWith(mockReq.body, 'admin');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario creado correctamente',
        data: mockUser,
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockUseCase.update.mockResolvedValue(mockUser);

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockUseCase.update).toHaveBeenCalledWith(1, mockReq.body, 1, 'admin');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario actualizado correctamente',
        data: mockUser,
      });
    });
  });

  describe('patch', () => {
    it('should partially update a user', async () => {
      mockUseCase.patch.mockResolvedValue(mockUser);

      await controller.patch(mockReq, mockRes, mockNext);

      expect(mockUseCase.patch).toHaveBeenCalledWith(1, mockReq.body, 1, 'admin');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario actualizado parcialmente',
        data: mockUser,
      });
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      mockUseCase.delete.mockResolvedValue();

      await controller.delete(mockReq, mockRes, mockNext);

      expect(mockUseCase.delete).toHaveBeenCalledWith(1, 1, 'admin');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario 1 eliminado',
      });
    });
  });
});
