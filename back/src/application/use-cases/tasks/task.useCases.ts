import { ITaskRepository } from '../../../domain/repositories/tasks/ITaskRepository';
import { Task } from '../../../domain/entities/tasks/task';
import { AppError } from '../../../shared/errors/AppError';
import { createTaskSchema, updateTaskSchema, CreateTaskDTO, UpdateTaskDTO } from '../../dto/tasks/task.dto';

export class TaskUseCases {
  constructor(private readonly repo: ITaskRepository) {}
  
  async getAll(userId: number, role: string): Promise<Task[]> {
    if (role === 'admin') return this.repo.getAll();
    return this.repo.getByUserId(userId);
  }
  
  async getById(id: number, userId: number, role: string): Promise<Task> {
    const task = await this.repo.getById(id);
    if (!task) throw new AppError('Tarea no encontrada', 404);

    if (role !== 'admin' && task.userId !== userId)
      throw new AppError('No tenés permisos para ver esta tarea', 403);

    return task;
  }
  
  async create(input: CreateTaskDTO, userId: number): Promise<Task> {
    const parsed = createTaskSchema.parse({ ...input, userId, isActive: true });
    const data = { ...parsed, description: parsed.description ?? null,
};
    return this.repo.create(data);
  }
  
  async update(id: number, input: UpdateTaskDTO, userId: number, role: string): Promise<Task> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new AppError('Tarea no encontrada', 404);

    if (role !== 'admin' && existing.userId !== userId)
      throw new AppError('No tenés permisos para modificar esta tarea', 403);

    const data = updateTaskSchema.parse(input);
    const updated = await this.repo.update(id, data);
    if (!updated) throw new AppError('Error al actualizar la tarea', 500);
    return updated;
  }
  
  async delete(id: number, userId: number, role: string): Promise<void> {
    const task = await this.repo.getById(id);
    if (!task) throw new AppError('Tarea no encontrada', 404);

    if (role !== 'admin' && task.userId !== userId)
      throw new AppError('No tenés permisos para eliminar esta tarea', 403);

    const deleted = await this.repo.delete(id);
    if (!deleted) throw new AppError('No se pudo eliminar la tarea', 500);
  }
}
