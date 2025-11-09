import { UserRepository } from '../UserRepository';
import { Database } from '../../../db/mssql';
import { AppError } from '../../../../shared/errors/AppError';

describe('UserRepository', () => {
  let mockDb: jest.Mocked<Database>;
  let repo: UserRepository;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockDb = {
      connect: jest.fn()
    } as unknown as jest.Mocked<Database>;
    repo = new UserRepository(mockDb);
  });

  it('should return all users', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            userName: 'jdoe',
            email: 'john@example.com',
            passwordHash: 'hashed',
            userRole: 'admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: null
          }
        ]
      })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.getAll();

    expect(mockDb.connect).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('john@example.com');
  });

  it('should return a user by id', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            id: 1,
            firstName: 'Jane',
            lastName: 'Doe',
            userName: 'jdoe',
            email: 'jane@example.com',
            passwordHash: 'hash',
            userRole: 'user',
            isActive: true,
            createdAt: new Date(),
            updatedAt: null
          }
        ]
      })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const user = await repo.getById(1);

    expect(mockDb.connect).toHaveBeenCalled();
    expect(user).not.toBeNull();
    expect(user?.email).toBe('jane@example.com');
  });

  it('should return null if user not found by id', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.getById(999);
    expect(result).toBeNull();
  });

  it('should create a user successfully', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            id: 2,
            firstName: 'New',
            lastName: 'User',
            userName: 'newuser',
            email: 'new@example.com',
            passwordHash: 'hash',
            userRole: 'user',
            isActive: true,
            createdAt: new Date(),
            updatedAt: null
          }
        ]
      })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.create({
      firstName: 'New',
      lastName: 'User',
      userName: 'newuser',
      email: 'new@example.com',
      passwordHash: 'hash',
      userRole: 'user'
    });

    expect(result.email).toBe('new@example.com');
  });

  it('should update an existing user', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            id: 1,
            firstName: 'Updated',
            lastName: 'User',
            userName: 'updateduser',
            email: 'update@example.com',
            passwordHash: 'hash',
            userRole: 'admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.update(1, { firstName: 'Updated' });
    expect(result?.firstName).toBe('Updated');
  });

  it('should delete a user and return true', async () => {
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

    const result = await repo.delete(99);
    expect(result).toBe(false);
  });

  it('should throw AppError if DB fails in getAll', async () => {
    mockDb.connect.mockRejectedValue(new Error('DB down'));
    await expect(repo.getAll()).rejects.toBeInstanceOf(AppError);
  });
});
