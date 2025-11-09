import { TaskRepository } from '../TaskRepository';
import { Database } from '../../../db/mssql';
import { AppError } from '../../../../shared/errors/AppError';

describe('TaskRepository', () => {
  let mockDb: jest.Mocked<Database>;
  let repo: TaskRepository;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockDb = {
      connect: jest.fn()
    } as unknown as jest.Mocked<Database>;
    repo = new TaskRepository(mockDb);
  });

  it('should return all tasks', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            id: 1,
            title: 'Task 1',
            description: 'desc',
            status: 'open',
            priority: 'high',
            userId: 1,
            isActive: true,
            createdAt: new Date()
          }
        ]
      })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.getAll();

    expect(mockDb.connect).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Task 1');
  });

  it('should return null if getById finds no task', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.getById(999);
    expect(result).toBeNull();
  });

  it('should throw AppError if DB query fails in getAll', async () => {
    mockDb.connect.mockRejectedValue(new Error('DB down'));
    await expect(repo.getAll()).rejects.toBeInstanceOf(AppError);
  });

  it('should delete a task and return true if rowsAffected > 0', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.delete(1);
    expect(result).toBe(true);
  });

  it('should return false if delete affects no rows', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.delete(999);
    expect(result).toBe(false);
  });
});
