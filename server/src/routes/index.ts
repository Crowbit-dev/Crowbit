import { Router } from 'express';
import { authRouter } from './auth.js';
import { postsRouter } from './posts.js';
import { usersRouter } from './users.js';

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(usersRouter);
apiRouter.use(postsRouter);
