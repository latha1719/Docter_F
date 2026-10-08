'use client'

import Link from 'next/link'
import styles from './login.module.css'

export default function RoleSelectionPage() {
  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <h1 className={styles.title}>Welcome to Yash Hospital</h1>
          <p className={styles.subtitle}>Select your role to login</p>
        </div>

        <div className={styles.roleSelection}>
          <Link href="/login/patient" className={styles.roleCard}>
            <div className={styles.roleIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div style={{ fontSize: '1.05rem' }}>Patient</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>Book appointments and view records</div>
            </div>
          </Link>

          <Link href="/login/doctor" className={styles.roleCard}>
            <div className={styles.roleIcon} style={{ background: '#ecfdf5', color: '#10b981' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div>
              <div style={{ fontSize: '1.05rem' }}>Doctor</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>Manage appointments and patients</div>
            </div>
          </Link>

          <Link href="/login/admin" className={styles.roleCard}>
            <div className={styles.roleIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <div style={{ fontSize: '1.05rem' }}>Admin</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>System configuration and management</div>
            </div>
          </Link>
        </div>

        <div className={styles.footer} style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          Don't have a patient account?{' '}
          <Link 
            href="/register" 
            style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}