"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const pathname = usePathname()
  const isAdminPath = pathname?.startsWith('/admin')

  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
  }, [pathname]) // refresh role check on path change

  if (isAdminPath || userRole === 'ADMIN') return null // Admin has its own layout or just no top nav needed for now.

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('currentUserEmail')
    localStorage.removeItem('token')
    setUserRole(null)
  }

  return (
    <nav className="navbar">
      <div className="logo">
        YASH HOSPITAL
      </div>

      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {userRole === 'DOCTOR' && (
          <>
            <Link href="/doctor/dashboard" style={{ color: '#0284c7', fontWeight: 700 }}>👨‍⚕️ Doctor Portal</Link>
            <NotificationBell />
            <a href="/" onClick={handleLogout} style={{ cursor: 'pointer', color: '#ef4444' }}>Logout</a>
          </>
        )}

        {userRole === 'PATIENT' && (
          <>
            <Link href="/">Home</Link>
            <Link href="/doctors">Doctors</Link>
            <Link href="/records">Medical Records</Link>
            <Link href="/history">History</Link>
            <Link href="/dashboard">Patient Portal</Link>
            <NotificationBell />
            <a href="/" onClick={handleLogout} style={{ cursor: 'pointer', color: '#ef4444' }}>Logout</a>
          </>
        )}

        {!userRole && (
          <>
            <Link href="/">Home</Link>
            <Link href="/doctors">Doctors</Link>
            <Link href="/login/patient">Login</Link>
            <Link href="/register">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
