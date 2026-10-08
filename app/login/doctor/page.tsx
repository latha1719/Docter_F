'use client'

import { useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import styles from '../login.module.css'

function LoginContent() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      setTimeout(() => {
        if (email && password) {
          localStorage.setItem('userRole', 'DOCTOR')
          localStorage.setItem('currentUserEmail', email)
          router.push('/doctor/dashboard')
        } else {
          setError('Invalid email or password')
          setLoading(false)
        }
      }, 1000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoIcon} style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <h1 className={styles.title}>Doctor Login</h1>
          <p className={styles.subtitle}>Access your appointments and patients</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Doctor Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                autoComplete="off"
                id="doctor_email_field_unique"
                name="doctor_email_field_unique"
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
                id="doctor_pass_field_unique"
                name="doctor_pass_field_unique"
              />
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
            </div>
          </div>

          {error && <div className={styles.error} style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <button type="button" className={styles.forgotPassword} style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn} style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>
            {loading ? 'Logging in...' : 'Login as Doctor'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
            &larr; Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DoctorAuthPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading doctor login...</div>}>
      <LoginContent />
    </Suspense>
  )
}
