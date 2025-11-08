import express from 'express';

import { authRoutes  } from '../routes/auth/users.route';
import { userRoutes } from '../routes/users/user.routes';
import { taskRoutes } from '../routes/tasks/task.routes';
import { errorMiddleware } from '../middlewares/error.middleware';
import { loggerMiddleware } from '../middlewares/logger.middleware';

export class Server {
  private readonly app = express();

  constructor() {
    this.app.use(express.json());
    this.app.use(loggerMiddleware);
    this.app.get('/', (_req, res)=> res.status(200).json({ message: 'Helloo' }));
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/tasks', taskRoutes);
    this.app.use(errorMiddleware);
  }

  listen(port: number) {
    this.app.listen(port, () => console.log(`Server run on http://localhost:${port}`));
  }
}
