import { Router } from 'express';
import { authRouter } from './auth.js';
import { postsRouter } from './posts.js';
import { usersRouter } from './users.js';

// Mounts every domain router; add new domains here, one line each.
export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(usersRouter);
apiRouter.use(postsRouter);
