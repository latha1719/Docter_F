'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import styles from '../login.module.css'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRegisteredParam = searchParams.get('registered') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('registeredUserEmail')
      if (savedEmail) {
        setEmail(savedEmail)
      }
      if (isRegisteredParam || savedEmail) {
        setSuccessMsg('✅ Account created successfully! Please log in with your credentials.')
      }
    } catch {
      // ignore
    }
  }, [isRegisteredParam])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Invalid email or password')
      }

      const data = await res.json()
      // data contains { token, email, fullName, role, userId }
      localStorage.setItem('token', data.token)
      localStorage.setItem('currentUserEmail', data.email)
      localStorage.setItem('currentUserName', data.fullName)
      localStorage.setItem('currentUserId', data.userId)
      localStorage.setItem('userRole', 'PATIENT')
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <h1 className={styles.title}>Patient Login</h1>
          <p className={styles.subtitle}>Secure access to your medical dashboard</p>
        </div>

        {successMsg && (
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Patient Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                autoComplete="off"
                id="user_email_field_unique"
                name="user_email_field_unique"
              />
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                autoComplete="new-password"
                id="user_pass_field_unique"
                name="user_pass_field_unique"
              />
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
            </div>
          </div>

          {error && <div className={styles.error} style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <button type="button" className={styles.forgotPassword} style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Logging in...' : 'Login as Patient'}
          </button>
        </form>

        <div className={styles.footer} style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link 
            href="/register" 
            style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign Up
          </Link>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
            &larr; Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading login page...</div>}>
      <LoginContent />
    </Suspense>
  )
}
