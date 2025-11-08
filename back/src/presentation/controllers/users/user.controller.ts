import { Request, Response, NextFunction } from 'express';

import { UsersUseCase } from '../../../application/use-cases/users/user.useCases';
import { successResponse } from '../../../shared/http/response';

export class UsersController {
  constructor(private readonly usersUseCase: UsersUseCase) {}
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const users = await this.usersUseCase.getAll(userId, role);
      return res
        .status(200)
        .json({ count: users.length, data: users });
    } catch (error) {
      next(error);
    }
  };
  
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const id = parseInt(req.params.id);
      const user = await this.usersUseCase.getById(id, userId, role);
      return res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };
  
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.user!;
      const newUser = await this.usersUseCase.create(req.body, role);
      return res.status(201).json({
        message: 'Usuario creado correctamente',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  };
  
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const id = parseInt(req.params.id);
      const updated = await this.usersUseCase.update(id, req.body, userId, role);
      return res.status(200).json({
        message: 'Usuario actualizado correctamente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
  
  patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const id = parseInt(req.params.id);
      const updated = await this.usersUseCase.patch(id, req.body, userId, role);
      return res.status(200).json({
        message: 'Usuario actualizado parcialmente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
  
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const id = parseInt(req.params.id);
      await this.usersUseCase.delete(id, userId, role);
      return res.status(200).json({ message: `Usuario ${id} eliminado` });
    } catch (error) {
      next(error);
    }
  };
}