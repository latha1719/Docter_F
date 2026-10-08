'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    localStorage.removeItem('userRole')
    localStorage.removeItem('token')
    localStorage.removeItem('currentUserEmail')
    router.push('/')
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Doctors', href: '/admin/doctors', icon: '👨‍⚕️' },
    { name: 'Patients', href: '/admin/users', icon: '👥' },
    { name: 'Appointments', href: '/admin/appointments', icon: '📅' },
    { name: 'Payments', href: '/admin/payments', icon: '💳' },
    { name: 'Reviews', href: '/admin/reviews', icon: '⭐' },
    { name: 'Prescriptions', href: '/admin/prescriptions', icon: '📝' },
    { name: 'Notifications', href: '/admin/notifications', icon: '🔔' },
  ]

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          Hospital Admin
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="name">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-footer">
          <a href="#" onClick={handleLogout} className="admin-nav-item logout">
            <span className="icon">🏠</span>
            <span className="name">Logout / Back to Hospital</span>
          </a>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title">
            {navItems.find(i => i.href === pathname)?.name || 'Admin Panel'}
          </div>
          <div className="admin-user">
            <span style={{ fontWeight: 600, color: '#334155' }}>Super Admin</span>
            <div className="avatar">A</div>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>

      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .admin-sidebar {
          width: 250px;
          background: #0f172a;
          color: white;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .admin-logo {
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 2rem;
          padding-left: 0.5rem;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 0.9rem;
          text-decoration: none;
          color: #94a3b8;
          border-radius: 0.6rem;
          transition: all 0.2s;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .admin-nav-item.active {
          background: #0284c7;
          color: white;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .admin-nav-item.logout {
          margin-top: auto;
          color: #94a3b8;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
        }

        .admin-nav-item .icon {
          font-size: 1.15rem;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .admin-header {
          height: 65px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .admin-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
        }

        .avatar {
          width: 36px;
          height: 36px;
          background: #0284c7;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }

        .admin-content {
          padding: 2rem;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
