import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// Middleware to validate request body against a Zod schema. If validation fails, responds with 400 and error details. otherwise, proceeds to the next middleware/route handler.
export function validateBody<T extends z.ZodType>(schema: T) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const parsed = schema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({ message: 'Invalid request body', issues: parsed.error.issues });
			return;
		}

		req.body = parsed.data;
		next();
	};
}
