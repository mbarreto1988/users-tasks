import sql from 'mssql';

import { Database } from '../mssql';

jest.mock('mssql');

describe('Database Connection', () => {
  const mockConnect = jest.fn();
  const mockClose = jest.fn();
  const mockPool = { connected: false, close: mockClose, on: jest.fn() };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeAll(() => {
    sql.connect = mockConnect;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
});
