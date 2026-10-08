import { Request, Response, Router } from 'express';

export const postsRouter = Router();

// TEMPORARY: stub until post creation and feed endpoints land (see README backend todo list).
postsRouter.get('/posts', (req: Request, res: Response) => {
	res.status(501).json({ message: 'Post listing is not implemented yet' });
});
