import cors from 'cors';
import express, { Request, Response } from 'express';
import session from 'express-session';
import { env } from './env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

declare module 'express-session' {
	interface SessionData {
		user?: {
			id: string;
			email?: string;
		};
	}
}

// App factory: all setup lives here so index.ts only boots and tests can import the app without listening.
export const app = express();

app.use(
	cors({
		origin: env.CLIENT_URL,
		credentials: true,
	}),
);
app.use(express.json());
app.use(
	session({
		// TEMPORARY: in-memory store until the Postgres session store lands with the database layer.
		secret: env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 1000 * 60 * 60 * 24,
		},
	}),
);

app.get('/', (req: Request, res: Response) => {
	console.log(`request from ${req.url}`);
	res.send({ message: 'hello world' });
});

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
