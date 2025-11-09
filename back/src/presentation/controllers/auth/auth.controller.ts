import { Request, Response, NextFunction } from 'express';

import { AuthUseCase } from '../../../application/use-cases/auth/authUseCases';
import { successResponse } from '../../../shared/http/response';

export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authUseCase.register(req.body);
      return res
        .status(201)
        .json({ message: 'Registered user', ...successResponse(result) });
    } catch (error) {
      console.error('[AuthController] register error:', error);
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authUseCase.login(req.body);
      return res
        .status(200)
        .json({ message: 'Successful login', ...successResponse(result) });
    } catch (error) {
      console.error('[AuthController] login error:', error);
      next(error);
    }
  };
}
