'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Doctors', href: '/admin/doctors', icon: '👨‍⚕️' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Appointments', href: '/admin/appointments', icon: '📅' },
    { name: 'Notifications', href: '/admin/notifications', icon: '🔔' },
  ]

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          Admin Panel
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
          <Link href="/logout" className="admin-nav-item logout">
            <span className="icon">🚪</span>
            <span className="name">Logout</span>
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title">
            {navItems.find(i => i.href === pathname)?.name || 'Admin'}
          </div>
          <div className="admin-user">
            <span>Welcome, Admin</span>
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
          background: #f1f5f9;
        }

        .admin-sidebar {
          width: 260px;
          background: #1e293b;
          color: white;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .admin-logo {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2.5rem;
          padding-left: 0.5rem;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          text-decoration: none;
          color: #94a3b8;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }

        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .admin-nav-item.active {
          background: #3b82f6;
          color: white;
        }

        .admin-nav-item.logout {
          margin-top: auto;
        }

        .admin-nav-item .icon {
          font-size: 1.25rem;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          height: 70px;
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
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
        }

        .admin-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 35px;
          height: 35px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
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
