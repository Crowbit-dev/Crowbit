import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// Validates req.body against a zod schema; every route with a JSON body uses this so validation lives next to the handler.
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
