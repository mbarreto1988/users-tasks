import { Router } from 'express';

import { Database } from '../../../infrastructure/db/mssql';
import { UserRepository } from '../../../infrastructure/repositories/users/UserRepository';
import { UsersUseCase } from '../../../application/use-cases/users/user.useCases';
import { UsersController } from '../../controllers/users/user.controller';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const db = Database.getInstance();
const repo = new UserRepository(db);
const usersData = new UsersUseCase(repo);
const controller = new UsersController(usersData);

router.use(authMiddleware);

router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.patch('/:id', asyncHandler(controller.patch));
router.delete('/:id', asyncHandler(controller.delete));

export { router as userRoutes };
