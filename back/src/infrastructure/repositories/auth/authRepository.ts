import { IAuthRepository } from '../../../domain/repositories/auth/IAuthRepository';
import { User } from '../../../domain/entities/users/user';
import { Database } from '../../db/mssql';
import { AppError } from '../../../shared/errors/AppError';

export class AuthRepository implements IAuthRepository {
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
      Boolean(row.isActive)
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const pool = await this.db.connect();
      const result = await pool.request().input('email', email).query(`
          SELECT * FROM user_data WHERE email = @email
        `);

      return result.recordset.length ? this.mapRow(result.recordset[0]) : null;
    } catch (error) {
      console.error('[AuthRepository] findByEmail error:', error);
      throw new AppError('Error searching for user by email', 500);
    }
  }

  async create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('firstName', user.firstName)
        .input('lastName', user.lastName)
        .input('userName', user.userName)
        .input('email', user.email)
        .input('passwordHash', user.passwordHash)
        .input('userRole', user.userRole)
        .input('isActive', user.isActive ?? true).query(`
          INSERT INTO user_data (firstName, lastName, userName, email, passwordHash, userRole, isActive)
          OUTPUT inserted.*
          VALUES (@firstName, @lastName, @userName, @email, @passwordHash, @userRole, @isActive)
        `);

      return this.mapRow(result.recordset[0]);
    } catch (error) {
      console.error('[AuthRepository] create error:', error);
      throw new AppError('Error creating user', 500);
    }
  }
}
