import { Task } from '../../../domain/entities/tasks/task';

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: number): Promise<Task | null>;
  getByUserId(userId: number): Promise<Task[]>;
  create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  update(id: number, data: Partial<Task>): Promise<Task | null>;
  delete(id: number): Promise<boolean>;
}
