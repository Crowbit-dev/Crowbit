import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Signup from './Signup.tsx';
import Login from './Login.tsx';
import Terms from './Terms.tsx';
import Privacy from './Privacy.tsx';
import NotFound from './NotFound.tsx';
import RootRedirect from './RootRedirect.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<RootRedirect />} />
				<Route path="/home" element={<App />} />
				<Route path="/home/dms/:dmId?" element={<App />} />
				<Route path="/home/c/:communityId/:channelId?" element={<App />} />
				<Route path="/home/notifications" element={<App />} />
				<Route path="/home/search" element={<App />} />
				<Route path="/home/settings/:category?" element={<App />} />
				<Route path="/profile" element={<App />} />
				<Route path="/home/*" element={<NotFound />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/login" element={<Login />} />
				<Route path="/terms" element={<Terms />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
