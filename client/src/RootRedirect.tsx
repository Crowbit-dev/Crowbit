import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

export default function RootRedirect() {
	const navigate = useNavigate();

	useEffect(() => {
		fetch('/api/session', { credentials: 'include' })
			.then(async (res) => {
				if (!res.ok) {
					throw new Error('Not authenticated');
				}

				const data = await res.json();
				console.log(data);
				navigate(data.authenticated ? '/home' : '/login', { replace: true });
			})
			.catch(() => {
				navigate('/login', { replace: true });
			});
	}, [navigate]);

	return <Navigate to="/login" replace />;
}
