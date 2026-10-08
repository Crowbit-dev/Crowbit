import 'dotenv/config';
import { app } from './app.js';
import { env } from './env.js';

// Boot only; all Express setup lives in app.ts.
const port = env.PORT || 3001;

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
