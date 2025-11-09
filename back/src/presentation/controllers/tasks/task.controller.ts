import { Request, Response } from 'express';

import { TaskUseCases } from '../../../application/use-cases/tasks/task.useCases';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { successResponse } from '../../../shared/http/response';

export class TaskController {
  constructor(private readonly useCase: TaskUseCases) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = req.user!;
    const tasks = await this.useCase.getAll(userId, role);
    res.status(200).json(successResponse(tasks));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, role } = req.user!;
    const task = await this.useCase.getById(Number(id), userId, role);
    res.status(200).json(successResponse(task));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const task = await this.useCase.create(req.body, userId);
    res.status(201).json({ message: 'Task created successfully', data: task });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, role } = req.user!;
    const updated = await this.useCase.update(
      Number(id),
      req.body,
      userId,
      role
    );
    res.status(200).json({ message: 'Task updated successfully', data: updated });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, role } = req.user!;
    await this.useCase.delete(Number(id), userId, role);
    res.status(200).json({ message: 'Task successfully deleted' });
  });
}
