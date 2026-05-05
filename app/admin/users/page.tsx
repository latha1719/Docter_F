'use client'

import React, { useState } from 'react'

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Patient', status: 'Active', lastActive: '2 hours ago' },
    { id: 2, name: 'Dr. Arjun Sharma', email: 'smith@yash.com', role: 'Doctor', status: 'Active', lastActive: '10 mins ago' },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'Patient', status: 'Inactive', lastActive: '3 days ago' },
    { id: 4, name: 'Robert Brown', email: 'robert@example.com', role: 'Patient', status: 'Active', lastActive: '1 hour ago' },
  ])

  const [activeTab, setActiveTab] = useState<'all' | 'patients' | 'doctors'>('all')

  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true
    if (activeTab === 'patients') return user.role === 'Patient'
    if (activeTab === 'doctors') return user.role === 'Doctor'
    return true
  })

  return (
    <div className="user-management">
      <div className="header-row">
        <h2>User Management</h2>
        <div className="tabs">
          {(['all', 'patients', 'doctors'] as const).map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="user-list card">
        <div className="list-toolbar">
          <input type="text" placeholder="Search by name or email..." className="search-input" />
          <button className="invite-btn">+ Register User</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-indicator ${user.status.toLowerCase()}`}>
                    <span className="dot"></span>
                    {user.status}
                  </span>
                </td>
                <td>{user.lastActive}</td>
                <td>
                  <button className="manage-btn">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .user-management {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tabs {
          display: flex;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 0.75rem;
          gap: 0.25rem;
        }

        .tab-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .card {
          background: white;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .list-toolbar {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .search-input {
          flex: 1;
          max-width: 400px;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .invite-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 1rem 1.25rem;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          font-weight: 700;
          background: #fdfdfd;
        }

        td {
          padding: 1.25rem;
          border-bottom: 1px solid #f8fafc;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
        }

        .user-email {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .role-badge {
          padding: 0.25rem 0.6rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .role-badge.doctor {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .role-badge.patient {
          background: #f0fdf4;
          color: #15803d;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .active .dot { background: #10b981; }
        .inactive .dot { background: #94a3b8; }

        .manage-btn {
          background: transparent;
          border: 1px solid #e2e8f0;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
        }

        .manage-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
      `}</style>
    </div>
  )
}
