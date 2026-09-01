import 'dotenv/config';
import express, { Request, Response } from 'express';
import { env } from './env.js';

export const app = express();
const port = env.PORT || 3001;

app.get('/', (req: Request, res: Response) => {
	console.log(`request from ${req.url}`);
	res.send({ message: 'hello world' });
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});