import { Database } from '../../db/mssql';
import { IUserRepository } from '../../../domain/repositories/users/IUserRepository';
import { User } from '../../../domain/entities/users/user';
import { AppError } from '../../../shared/errors/AppError';

export class UserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  private mapRow(row: any): User {
    return new User(
      row.id,
      row.firstName,
      row.lastName,
      row.userName,
      row.email,
      row.passwordHash,
      row.userRole,
      new Date(row.createdAt),
      row.updatedAt ? new Date(row.updatedAt) : null,
      row.isActive
    );
  }

  async getAll(): Promise<User[]> {
    try {
      const pool = await this.db.connect();
      const result = await pool.request().query(`
        SELECT 
          id, firstName, lastName, userName, email, passwordHash, 
          userRole, isActive, createdAt, updatedAt
        FROM user_data
        ORDER BY id ASC
      `);
      return result.recordset.map((r: any) => this.mapRow(r));
    } catch (error) {
      console.error('[UserRepository] getAll error:', error);
      throw new AppError('Error retrieving users', 500);
    }
  }

  async getById(id: number): Promise<User | null> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('id', id)
        .query('SELECT * FROM user_data WHERE id = @id');

      return result.recordset.length ? this.mapRow(result.recordset[0]) : null;
    } catch (error) {
      console.error('[UserRepository] getById error:', error);
      throw new AppError('Error retrieving users', 500);
    }
  }

  async create(data: Partial<User>): Promise<User> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('firstName', data.firstName)
        .input('lastName', data.lastName)
        .input('userName', data.userName)
        .input('email', data.email)
        .input('passwordHash', data.passwordHash)
        .input('userRole', data.userRole ?? 'user')
        .input('isActive', data.isActive ?? true).query(`
          INSERT INTO user_data 
            (firstName, lastName, userName, email, passwordHash, userRole, isActive)
          OUTPUT inserted.*
          VALUES (@firstName, @lastName, @userName, @email, @passwordHash, @userRole, @isActive)
        `);

      return this.mapRow(result.recordset[0]);
    } catch (error) {
      console.error('[UserRepository] create error:', error);
      throw new AppError('Error creating user', 500);
    }
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('id', id)
        .input('firstName', data.firstName)
        .input('lastName', data.lastName)
        .input('userName', data.userName)
        .input('email', data.email)
        .input('passwordHash', data.passwordHash)
        .input('userRole', data.userRole)
        .input('isActive', data.isActive ?? true).query(`
          UPDATE user_data
          SET 
            firstName = @firstName,
            lastName = @lastName,
            userName = @userName,
            email = @email,
            passwordHash = @passwordHash,
            userRole = @userRole,
            isActive = @isActive,
            updatedAt = GETDATE()
          OUTPUT inserted.*
          WHERE id = @id
        `);

      return result.recordset.length ? this.mapRow(result.recordset[0]) : null;
    } catch (error) {
      console.error('[UserRepository] update error:', error);
      throw new AppError('Error updating user', 500);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('id', id)
        .query('DELETE FROM user_data WHERE id = @id');

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('[UserRepository] delete error:', error);
      throw new AppError('Error deleting user', 500);
    }
  }
}
