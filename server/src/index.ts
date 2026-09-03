import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import session from "express-session";
import { env } from "./env.js";

declare module "express-session" {
	interface SessionData {
		user?: {
			id: string;
			email?: string;
		};
	}
}

export const app = express();
const port = env.PORT || 3001;

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	}),
);
app.use(express.json());
app.use(
	session({
		secret: env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 60 * 24,
		},
	}),
);

app.get("/", (req: Request, res: Response) => {
	console.log(`request from ${req.url}`);
	res.send({ message: "hello world" });
});

app.get("/api/session", (req: Request, res: Response) => {
	res.json({
		authenticated: !!req.session?.user,
	});
});

app.delete("/api/session", (req: Request, res: Response) => {
	req.session.destroy((error) => {
		if (error) {
			res.status(500).json({ message: "Unable to log out" });
			return;
		}

		res.clearCookie("connect.sid");
		res.sendStatus(204);
	});
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
