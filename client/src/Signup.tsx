import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import crowpng from './assets/crowsideprofile.png';
import styles from './Auth.module.css';

type FormData = {
	email: string;
	username: string;
	password: string;
	confirmPassword: string;
};

const initial: FormData = {
	email: '',
	username: '',
	password: '',
	confirmPassword: '',
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value);

export default function Signup() {
	const [form, setForm] = useState<FormData>(initial);
	const [agreed, setAgreed] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const errorRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (error) errorRef.current?.focus();
	}, [error]);

	const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
		setForm((prev) => ({ ...prev, [field]: e.target.value }));

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!form.email || !form.username || !form.password) {
			setError('All fields are required');
			return;
		}
		if (!isValidEmail(form.email)) {
			setError('Please enter a valid email address');
			return;
		}
		if (form.password !== form.confirmPassword) {
			setError('Passwords do not match');
			return;
		}
		if (form.password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}
		if (!agreed) {
			setError('Please agree to the Terms of Service and Privacy Policy to create an account');
			return;
		}

		// TODO: POST to /api/auth/signup once backend is ready
		console.log('Signup payload:', {
			email: form.email,
			username: form.username,
			password: form.password,
		});
	};

	return (
		<div className={styles.authPage} style={{ position: 'relative' }}>
			<img
				src={crowpng}
				alt="Crow"
				style={{
					width: '100px',
					height: '100px',
					position: 'absolute',
					top: 50,
					right: 50,
					pointerEvents: 'none',
					background: 'transparent',
					filter: 'drop-shadow(0 0 12px var(--accent-border))',
				}}
			/>
			<form className={styles.authForm} onSubmit={handleSubmit}>
				<h2>Create an account</h2>

				<label>
					Email
					<input
						type="email"
						value={form.email}
						onChange={update('email')}
						placeholder="you@example.com"
						aria-describedby={error ? 'signup-error' : undefined}
					/>
				</label>

				<label>
					Username
					<input
						type="text"
						value={form.username}
						onChange={update('username')}
						placeholder="username"
						aria-describedby={error ? 'signup-error' : undefined}
					/>
				</label>

				<label>
					Password
					<input
						type="password"
						value={form.password}
						onChange={update('password')}
						placeholder="••••••"
						aria-describedby={error ? 'signup-error' : undefined}
					/>
				</label>

				<label>
					Confirm password
					<input
						type="password"
						value={form.confirmPassword}
						onChange={update('confirmPassword')}
						placeholder="••••••"
						aria-describedby={error ? 'signup-error' : undefined}
					/>
				</label>

				<label className={styles.authConsent}>
					<input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
					<span>
						I am at least 13 years old and agree to the <Link to="/terms">Terms of Service</Link> and{' '}
						<Link to="/privacy">Privacy Policy</Link>.
					</span>
				</label>

				{error && (
					<p ref={errorRef} tabIndex={-1} role="alert" id="signup-error" className={styles.authError}>
						{error}
					</p>
				)}

				<button type="submit">Sign up</button>
			</form>

			<div className={styles.authSwitch}>
				<span>Already have an account?</span>
				<Link to="/login" className={styles.authLink}>
					Log in
				</Link>
			</div>
		</div>
	);
}
