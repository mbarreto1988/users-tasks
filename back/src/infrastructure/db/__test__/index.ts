import sql from 'mssql';
import bcrypt from 'bcrypt';
import { Database } from '../mssql';
import { seedAdmin } from '../adminSeeder';

jest.mock('mssql');
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_admin123'),
}));

describe('Database Connection & seedAdmin', () => {
  const mockConnect = jest.fn();
  const mockClose = jest.fn();
  const mockRequest = {
    query: jest.fn(),
    input: jest.fn().mockReturnThis(),
  };
  const mockPool = {
    connected: false,
    close: mockClose,
    request: jest.fn(() => mockRequest),
    on: jest.fn(),
  };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    sql.connect = mockConnect;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------
  // Database basic connection tests
  // -------------------------------
  it('should create a new connection if none exists', async () => {
    mockConnect.mockResolvedValueOnce(mockPool);

    const db = Database.getInstance();
    const pool = await db.connect();

    expect(sql.connect).toHaveBeenCalledTimes(1);
    expect(pool).toBe(mockPool);
  });

  it('should reuse the existing connection if already connected', async () => {
    mockConnect.mockResolvedValueOnce({ ...mockPool, connected: true });

    const db = Database.getInstance();
    const firstPool = await db.connect();
    const secondPool = await db.connect();

    expect(sql.connect).toHaveBeenCalledTimes(1);
    expect(secondPool).toBe(firstPool);
  });

  it('should close the connection properly', async () => {
    const db = Database.getInstance();
    await db.close();

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should handle connection errors', async () => {
    const db = Database.getInstance();
    mockConnect.mockRejectedValueOnce(new Error('Connection error'));

    await expect(db.connect()).rejects.toThrow('Connection error');
  });

  // -------------------------------
  // seedAdmin() tests
  // -------------------------------
  it('should create an admin user if none exists', async () => {
    mockRequest.query
      .mockResolvedValueOnce({ recordset: [{ count: 0 }] }) // check query
      .mockResolvedValueOnce({}); // insert query

    const mockPoolWithRequest = { ...mockPool, request: jest.fn(() => mockRequest) };
    jest.spyOn(Database, 'getInstance').mockReturnValue({
      connect: jest.fn().mockResolvedValue(mockPoolWithRequest),
    } as any);

    await seedAdmin();

    expect(mockRequest.input).toHaveBeenCalledWith('email', 'admin@admin.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);
    expect(mockRequest.query).toHaveBeenCalledTimes(2);
  });

  it('should skip creation if an admin already exists', async () => {
    mockRequest.query.mockResolvedValueOnce({ recordset: [{ count: 1 }] });

    const mockPoolWithRequest = { ...mockPool, request: jest.fn(() => mockRequest) };
    jest.spyOn(Database, 'getInstance').mockReturnValue({
      connect: jest.fn().mockResolvedValue(mockPoolWithRequest),
    } as any);

    await seedAdmin();

    expect(mockRequest.input).not.toHaveBeenCalled();
    expect(mockRequest.query).toHaveBeenCalledTimes(1);
  });
});
