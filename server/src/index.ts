import 'dotenv/config';
import express, { Request, Response } from 'express';
import session from 'express-session';
import { env } from './env.js';

const app = express();
const port = env.PORT || 3001;

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

app.get('/', (req: Request, res: Response) => {
	console.log(`request from ${req.url}`);
	res.send({ message: 'hello world' });
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
