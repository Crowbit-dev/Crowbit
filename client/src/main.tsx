import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	useNavigate,
} from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Signup from "./Signup.tsx";
import Login from "./Login.tsx";

function RootRedirect() {
	const navigate = useNavigate();

	useEffect(() => {
		fetch("/api/session", { credentials: "include" })
			.then(async (res) => {
				if (!res.ok) {
					throw new Error("Not authenticated");
				}

				const data = await res.json();
				console.log(data);
				navigate(data.authenticated ? "/home" : "/login", { replace: true });
			})
			.catch(() => {
				navigate("/login", { replace: true });
			});
	}, [navigate]);

	return <Navigate to="/login" replace />;
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<RootRedirect />} />
				<Route path="/home" element={<App />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/login" element={<Login />} />
				<Route path="*" element={<div>404 Not Found</div>} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
