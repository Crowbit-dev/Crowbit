import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

type FormData = {
	email: string
	password: string
}

const initial: FormData = {
	email: '',
	password: '',
}

export default function Login() {
	const [form, setForm] = useState<FormData>(initial)
	const [error, setError] = useState<string | null>(null)

	const update = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) =>
		setForm(prev => ({ ...prev, [field]: e.target.value }))

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)

		if (!form.email || !form.password) {
			setError('Email and password are required')
			return
		}

		console.log('Login payload:', { email: form.email, password: form.password })
	}

	return (
		<div className="auth-page">
			<form className="auth-form" onSubmit={handleSubmit}>
				<h2>Welcome back</h2>

				<label>
					Email
					<input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
				</label>

				<label>
					Password
					<input type="password" value={form.password} onChange={update('password')} placeholder="••••••" />
				</label>

				{error && <p className="auth-error">{error}</p>}

				<button type="submit">Log in</button>
			</form>

			<div className="auth-switch">
				<span>Need an account?</span>
				<Link to="/signup" className="auth-link">Sign up</Link>
			</div>
		</div>
	)
}