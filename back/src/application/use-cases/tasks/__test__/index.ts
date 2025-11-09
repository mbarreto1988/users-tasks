import { TaskUseCases } from '../task.useCases';
import { ITaskRepository } from '../../../../domain/repositories/tasks/ITaskRepository';
import { AppError } from '../../../../shared/errors/AppError';

describe('TaskUseCases', () => {
  let mockRepo: jest.Mocked<ITaskRepository>;
  let useCase: TaskUseCases;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockRepo = {
      getAll: jest.fn(),
      getById: jest.fn(),
      getByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<ITaskRepository>;

    useCase = new TaskUseCases(mockRepo);
  });

  describe('getAll', () => {
    it('should return all tasks for admin', async () => {
      mockRepo.getAll.mockResolvedValue([{ id: 1 }] as any);
      const result = await useCase.getAll(1, 'admin');
      expect(mockRepo.getAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return user tasks for regular user', async () => {
      mockRepo.getByUserId.mockResolvedValue([{ id: 2, userId: 1 }] as any);
      const result = await useCase.getAll(1, 'user');
      expect(mockRepo.getByUserId).toHaveBeenCalledWith(1);
      expect(result[0].id).toBe(2);
    });
  });

  describe('getById', () => {
    it('should return task if admin', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1, userId: 2 } as any);
      const result = await useCase.getById(1, 1, 'admin');
      expect(result.id).toBe(1);
    });

    it('should throw if task not found', async () => {
      mockRepo.getById.mockResolvedValue(null);
      await expect(useCase.getById(1, 1, 'admin')).rejects.toThrow(AppError);
    });

    it('should throw if user not owner', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1, userId: 2 } as any);
      await expect(useCase.getById(1, 1, 'user')).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'desc',
        status: 'pending',
        priority: 'high',
        userId: 1,
        isActive: true
      };

      mockRepo.create.mockResolvedValue(mockTask as any);

      const result = await useCase.create(
        {
          title: 'Test Task',
          description: 'desc',
          status: 'pending',
          priority: 'high'
        } as any,
        1
      );

      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.title).toBe('Test Task');
    });
  });

  describe('update', () => {
    it('should update task if admin', async () => {
      const mockTask = { id: 1, userId: 2 };
      const updatedTask = { ...mockTask, title: 'Updated' };
      mockRepo.getById.mockResolvedValue(mockTask as any);
      mockRepo.update.mockResolvedValue(updatedTask as any);

      const result = await useCase.update(
        1,
        { title: 'Updated' } as any,
        1,
        'admin'
      );

      expect(result.title).toBe('Updated');
    });

    it('should throw if task not found', async () => {
      mockRepo.getById.mockResolvedValue(null);
      await expect(
        useCase.update(1, { title: 'X' } as any, 1, 'admin')
      ).rejects.toThrow(AppError);
    });

    it('should throw if user not owner', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1, userId: 2 } as any);
      await expect(
        useCase.update(1, { title: 'X' } as any, 1, 'user')
      ).rejects.toThrow(AppError);
    });

    it('should throw if update fails', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1, userId: 1 } as any);
      mockRepo.update.mockResolvedValue(null);
      await expect(
        useCase.update(1, { title: 'Valid Title' } as any, 1, 'user')
      ).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete task if admin', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1, userId: 2 } as any);
      mockRepo.delete.mockResolvedValue(true);
      await expect(useCase.delete(1, 1, 'admin')).resolves.not.toThrow();
    });

    it('should throw if task not found', async () => {
      mockRepo.getById.mockResolvedValue(null);
      await expect(useCase.delete(1, 1, 'admin')).rejects.toThrow(AppError);
    });

    it('should throw if user not owner', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1, userId: 2 } as any);
      await expect(useCase.delete(1, 1, 'user')).rejects.toThrow(AppError);
    });

    it('should throw if delete fails', async () => {
      mockRepo.getById.mockResolvedValue({ id: 1, userId: 1 } as any);
      mockRepo.delete.mockResolvedValue(false);
      await expect(useCase.delete(1, 1, 'user')).rejects.toThrow(AppError);
    });
  });
});
