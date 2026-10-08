import { Request, Response, Router } from 'express';

export const usersRouter = Router();

// TEMPORARY: stub until the follow graph and profile endpoints land (see README backend todo list).
usersRouter.get('/users/:id', (req: Request, res: Response) => {
	res.status(501).json({ message: 'User lookup is not implemented yet' });
});
