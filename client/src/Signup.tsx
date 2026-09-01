import { useState, type FormEvent } from 'react'
import crowpng from './assets/crowsideprofile.png';
import './Auth.css'

type FormData = {
	email: string
	username: string
	password: string
	confirmPassword: string
}

const initial: FormData = {
	email: '',
	username: '',
	password: '',
	confirmPassword: '',
}

export default function Signup() {
	const [form, setForm] = useState<FormData>(initial)
	const [error, setError] = useState<string | null>(null)
	
	const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
		setForm(prev => ({ ...prev, [field]: e.target.value }))
	
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault()
		setError(null)
		
		if (!form.email || !form.username || !form.password) {
			setError('All fields are required')
			return
		}
		if (form.password !== form.confirmPassword) {
			setError('Passwords do not match')
			return
		}
		if (form.password.length < 6) {
			setError('Password must be at least 6 characters')
			return
		}
		
		console.log('Signup payload:', { email: form.email, username: form.username, password: form.password })
		// TODO: POST to /api/auth/signup once backend is ready
	}
	
	return (
		<div className="auth-page" style={{ position: 'relative' }}>
		<img src={crowpng} alt="Crow" style={{ width: '100px', height: '100px', position: 'absolute', top: 50, right: 50, pointerEvents: 'none', background: 'transparent', filter: 'drop-shadow(0 0 12px var(--accent-border))' }} />
		<form className="auth-form" onSubmit={handleSubmit}>
		<h2>Create an account</h2>
		
		<label>
		Email
		<input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
		</label>
		
		<label>
		Username
		<input type="text" value={form.username} onChange={update('username')} placeholder="username" />
		</label>
		
		<label>
		Password
		<input type="password" value={form.password} onChange={update('password')} placeholder="••••••" />
		</label>
		
		<label>
		Confirm password
		<input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="••••••" />
		</label>
		
		{error && <p className="auth-error">{error}</p>}
		
		<button type="submit">Sign up</button>
		</form>
		</div>
	)
};