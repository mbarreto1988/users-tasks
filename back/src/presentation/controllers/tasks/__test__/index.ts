import { TaskController } from '../task.controller';
import { TaskUseCases } from '../../../../application/use-cases/tasks/task.useCases';
import { successResponse } from '../../../../shared/http/response';
import { Task } from '../../../../domain/entities/tasks/task';

describe('TaskController', () => {
  let mockUseCase: jest.Mocked<TaskUseCases>;
  let controller: TaskController;
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'desc',
    status: 'pending',
    priority: 'medium',
    userId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: null,
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
      delete: jest.fn(),
    } as unknown as jest.Mocked<TaskUseCases>;

    controller = new TaskController(mockUseCase);

    mockReq = {
      user: { userId: 1, role: 'user' },
      params: { id: '1' },
      body: { title: 'Test Task', description: 'desc' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('getAll', () => {
    it('should return all tasks', async () => {
      mockUseCase.getAll.mockResolvedValue([mockTask]);

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockUseCase.getAll).toHaveBeenCalledWith(1, 'user');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(successResponse([mockTask]));
    });
  });

  describe('getById', () => {
    it('should return a task by id', async () => {
      mockUseCase.getById.mockResolvedValue(mockTask);

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockUseCase.getById).toHaveBeenCalledWith(1, 1, 'user');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(successResponse(mockTask));
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      mockUseCase.create.mockResolvedValue(mockTask);

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockUseCase.create).toHaveBeenCalledWith(mockReq.body, 1);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tarea creada correctamente',
        data: mockTask,
      });
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      mockUseCase.update.mockResolvedValue(mockTask);

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockUseCase.update).toHaveBeenCalledWith(1, mockReq.body, 1, 'user');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tarea actualizada',
        data: mockTask,
      });
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      mockUseCase.delete.mockResolvedValue();

      await controller.delete(mockReq, mockRes, mockNext);

      expect(mockUseCase.delete).toHaveBeenCalledWith(1, 1, 'user');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tarea eliminada correctamente',
      });
    });
  });
});
