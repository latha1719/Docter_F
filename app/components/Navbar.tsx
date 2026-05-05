"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const isAdminPath = pathname?.startsWith('/admin')

  if (isAdminPath) return null

  return (
    <nav className="navbar">
      <div className="logo">
        YASH HOSPITAL
      </div>

      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/doctors">Doctors</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/history">History</Link>
      </div>
    </nav>
  )
}
