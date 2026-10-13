import type { NextFunction, Request, Response } from 'express';

// custom error class for throwing errors with status codes
export class AppError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

// 404 my beloved
export function notFoundHandler(req: Request, res: Response): void {
	res.status(404).json({ message: `Not found: ${req.method} ${req.path}` });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
	if (err instanceof AppError) {
		res.status(err.status).json({ message: err.message });
		return;
	}

	console.error(err);
	res.status(500).json({ message: 'Internal server error' });
}
