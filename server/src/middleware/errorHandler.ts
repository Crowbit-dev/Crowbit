import type { NextFunction, Request, Response } from 'express';

// Throw (or forward with next(err)) from any route; the central handler below turns it into JSON.
export class AppError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

// Final route: anything unmatched under /api or elsewhere becomes JSON instead of the Express HTML default.
export function notFoundHandler(req: Request, res: Response): void {
	res.status(404).json({ message: `Not found: ${req.method} ${req.path}` });
}

// Central error handler; must keep the four-argument signature so Express routes errors here.
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
	if (err instanceof AppError) {
		res.status(err.status).json({ message: err.message });
		return;
	}

	console.error(err);
	res.status(500).json({ message: 'Internal server error' });
}
