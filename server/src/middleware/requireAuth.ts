import type { NextFunction, Request, Response } from 'express';

// Guards routes that need a logged-in user; public routes skip this middleware.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
	if (!req.session?.user) {
		res.status(401).json({ message: 'Authentication required' });
		return;
	}

	next();
}
