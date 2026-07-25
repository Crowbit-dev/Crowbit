import { Request } from 'express';
import session from 'express-session';
import { env } from '../env.js';
import { app } from '../index.js';

app.use(
	session({
		secret: env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: (req: Request) => {
			const match = req.url.match(/^\/([^/]+)/);
			return {
				path: match ? '/' + match[1] : '/',
				// httpOnly: true,
				secure: env.NODE_ENV === 'production',
				maxAge: 1000 * 60 * 60 * 24,
			};
		},
	}),
);
