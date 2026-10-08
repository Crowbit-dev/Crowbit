import { Request, Response, Router } from 'express';

export const authRouter = Router();

// TEMPORARY: stub until signup logic lands.
authRouter.post('/auth/signup', (req: Request, res: Response) => {
	res.status(501).json({ message: 'Signup is not implemented yet' });
});

// TEMPORARY: stub until login logic lands.
authRouter.post('/auth/login', (req: Request, res: Response) => {
	res.status(501).json({ message: 'Login is not implemented yet' });
});

authRouter.get('/session', (req: Request, res: Response) => {
	res.json({
		authenticated: !!req.session?.user,
	});
});

authRouter.delete('/session', (req: Request, res: Response) => {
	req.session.destroy((error) => {
		if (error) {
			res.status(500).json({ message: 'Unable to log out' });
			return;
		}

		res.clearCookie('connect.sid');
		res.sendStatus(204);
	});
});
