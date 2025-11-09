import { Database } from '../../db/mssql';
import { Task } from '../../../domain/entities/tasks/task';
import { ITaskRepository } from '../../../domain/repositories/tasks/ITaskRepository';
import { AppError } from '../../../shared/errors/AppError';

export class TaskRepository implements ITaskRepository {
  constructor(private readonly db: Database) {}

  private mapRow(row: any): Task {
    return new Task(
      row.id,
      row.title,
      row.description,
      row.status,
      row.priority,
      row.userId,
      row.isActive,
      new Date(row.createdAt),
      row.updatedAt ? new Date(row.updatedAt) : null
    );
  }

  async getAll(): Promise<Task[]> {
    try {
      const pool = await this.db.connect();
      const result = await pool.request().query(`
        SELECT * FROM task_data ORDER BY id ASC
      `);
      return result.recordset.map((r: any) => this.mapRow(r));
    } catch (error) {
      console.error('[TaskRepository] getAll error:', error);
      throw new AppError('Error retrieving tasks', 500);
    }
  }

  async getById(id: number): Promise<Task | null> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('id', id)
        .query('SELECT * FROM task_data WHERE id = @id');

      return result.recordset.length ? this.mapRow(result.recordset[0]) : null;
    } catch (error) {
      console.error('[TaskRepository] getById error:', error);
      throw new AppError('Error retrieving task', 500);
    }
  }

  async getByUserId(userId: number): Promise<Task[]> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('userId', userId)
        .query(
          'SELECT * FROM task_data WHERE userId = @userId ORDER BY id DESC'
        );

      return result.recordset.map((r: any) => this.mapRow(r));
    } catch (error) {
      console.error('[TaskRepository] getByUserId error:', error);
      throw new AppError('Error retrieving user tasks', 500);
    }
  }

  async create(
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('title', data.title)
        .input('description', data.description ?? null)
        .input('status', data.status)
        .input('priority', data.priority)
        .input('userId', data.userId)
        .input('isActive', data.isActive ?? true).query(`
          INSERT INTO task_data (title, description, status, priority, userId, isActive)
          OUTPUT INSERTED.*
          VALUES (@title, @description, @status, @priority, @userId, @isActive)
        `);

      return this.mapRow(result.recordset[0]);
    } catch (error) {
      console.error('[TaskRepository] create error:', error);
      throw new AppError('Error creating task', 500);
    }
  }

  async update(id: number, data: Partial<Task>): Promise<Task | null> {
    try {
      const existing = await this.getById(id);
      if (!existing) return null;

      const merged = { ...existing, ...data, updatedAt: new Date() };
      const pool = await this.db.connect();

      const result = await pool
        .request()
        .input('id', id)
        .input('title', merged.title)
        .input('description', merged.description ?? null)
        .input('status', merged.status)
        .input('priority', merged.priority)
        .input('isActive', merged.isActive ?? true).query(`
          UPDATE task_data
          SET 
            title = @title,
            description = @description,
            status = @status,
            priority = @priority,
            isActive = @isActive,
            updatedAt = GETDATE()
          OUTPUT INSERTED.*
          WHERE id = @id
        `);

      return result.recordset.length ? this.mapRow(result.recordset[0]) : null;
    } catch (error) {
      console.error('[TaskRepository] update error:', error);
      throw new AppError('Error updating task', 500);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const pool = await this.db.connect();
      const result = await pool
        .request()
        .input('id', id)
        .query('DELETE FROM task_data WHERE id = @id');

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('[TaskRepository] delete error:', error);
      throw new AppError('Error deleting task', 500);
    }
  }
}
