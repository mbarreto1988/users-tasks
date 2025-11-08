import { Router } from 'express';

import { Database } from '../../../infrastructure/db/mssql';
import { TaskRepository } from '../../../infrastructure/repositories/tasks/TaskRepository';
import { TaskUseCases } from '../../../application/use-cases/tasks/task.useCases';
import { TaskController } from '../../controllers/tasks/task.controller';
import { authMiddleware } from '../../middlewares/auth.middleware'; // ya lo tenés

const router = Router();
const db = Database.getInstance();
const repo = new TaskRepository(db);
const useCase = new TaskUseCases(repo);
const controller = new TaskController(useCase);

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export const taskRoutes = router;
