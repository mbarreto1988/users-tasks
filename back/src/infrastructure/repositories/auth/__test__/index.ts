import { AuthRepository } from '../authRepository';
import { Database } from '../../../db/mssql';
import { AppError } from '../../../../shared/errors/AppError';

describe('AuthRepository', () => {
  let mockDb: jest.Mocked<Database>;
  let repo: AuthRepository;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockDb = {
      connect: jest.fn()
    } as unknown as jest.Mocked<Database>;
    repo = new AuthRepository(mockDb);
  });

  it('should return a user when findByEmail finds a match', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            userName: 'jdoe',
            email: 'john@example.com',
            passwordHash: 'hashed',
            userRole: 'user',
            createdAt: new Date(),
            updatedAt: null,
            isActive: 1
          }
        ]
      })
    };

    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.findByEmail('john@example.com');

    expect(mockDb.connect).toHaveBeenCalled();
    expect(result).toHaveProperty('email', 'john@example.com');
  });

  it('should return null if no user is found', async () => {
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] })
    };
    mockDb.connect.mockResolvedValue(mockPool as any);

    const result = await repo.findByEmail('nope@example.com');
    expect(result).toBeNull();
  });

  it('should throw AppError if query fails', async () => {
    mockDb.connect.mockRejectedValue(new Error('DB down'));
    await expect(repo.findByEmail('error@example.com')).rejects.toBeInstanceOf(
      AppError
    );
  });
});
