import { Router } from 'express';

import { Database } from '../../../infrastructure/db/mssql';
import { AuthRepository } from '../../../infrastructure/repositories/auth/authRepository';
import { AuthUseCase } from '../../../application/use-cases/auth/authUseCases';
import { AuthController } from '../../controllers/auth/auth.controller';
import { asyncHandler } from '../../../shared/http/asyncHandler';

const router = Router();

const db = Database.getInstance();
const repo = new AuthRepository(db);
const authUseCase = new AuthUseCase(repo);
const controller = new AuthController(authUseCase);

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));

export { router as authRoutes };
