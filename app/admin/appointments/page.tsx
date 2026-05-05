'use client'

import React, { useState } from 'react'

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([
    { id: 101, patient: 'John Doe', experience: '15+ years', date: '2026-04-16', time: '10:00 AM', type: 'Consultation', status: 'Upcoming' },
    { id: 102, patient: 'Jane Smith', experience: '8+ years', date: '2026-04-16', time: '11:00 AM', type: 'Follow-up', status: 'Pending' },
    { id: 103, patient: 'Robert Brown', experience: '12+ years', date: '2026-04-17', time: '09:30 AM', type: 'Consultation', status: 'Upcoming' },
    { id: 104, patient: 'Mark Davis', experience: '5+ years', date: '2026-04-17', time: '02:00 PM', type: 'Consultation', status: 'Completed' },
  ])

  const [filter, setFilter] = useState('All')

  const updateStatus = (id: number, newStatus: string) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ))
  }

  const filteredItems = appointments.filter(app => 
    filter === 'All' || app.status === filter
  )

  return (
    <div className="appointment-management">
      <div className="filters card">
        <div className="filter-group">
          <span>Filter by Status:</span>
          {['All', 'Upcoming', 'Pending', 'Completed', 'Cancelled'].map(s => (
            <button 
              key={s} 
              className={`filter-chip ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="list-container card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Experience</th>
              <th>Schedule</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(app => (
              <tr key={app.id}>
                <td className="id-col">#{app.id}</td>
                <td className="user-cell">
                   <div className="avatar-mini">{app.patient.charAt(0)}</div>
                   {app.patient}
                </td>
                <td className="doctor-cell">{app.experience}</td>
                <td>
                  <div className="schedule-info">
                    <span className="date">{app.date}</span>
                    <span className="time">{app.time}</span>
                  </div>
                </td>
                <td>{app.type}</td>
                <td>
                  <span className={`status-tag ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </td>
                <td className="action-cell">
                  {app.status === 'Pending' && (
                    <button className="confirm-btn" onClick={() => updateStatus(app.id, 'Upcoming')}>Confirm</button>
                  )}
                  {['Pending', 'Upcoming'].includes(app.status) && (
                    <button className="cancel-link" onClick={() => updateStatus(app.id, 'Cancelled')}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .appointment-management {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .filters {
          padding: 1rem 1.5rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group span {
          font-weight: 600;
          color: #64748b;
          font-size: 0.9rem;
        }

        .filter-chip {
          padding: 0.4rem 1rem;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-chip.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #f8fafc;
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .id-col {
          color: #94a3b8;
          font-weight: 600;
        }

        .user-cell, .doctor-cell {
          font-weight: 600;
          color: #1e293b;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar-mini {
          width: 28px;
          height: 28px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .schedule-info {
          display: flex;
          flex-direction: column;
        }

        .schedule-info .date { font-weight: 500; }
        .schedule-info .time { font-size: 0.75rem; color: #94a3b8; }

        .status-tag {
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-tag.upcoming { background: #e0f2fe; color: #0369a1; }
        .status-tag.pending { background: #fef3c7; color: #92400e; }
        .status-tag.completed { background: #f0fdf4; color: #166534; }
        .status-tag.cancelled { background: #fef2f2; color: #991b1b; }

        .action-cell {
          display: flex;
          gap: 0.75rem;
        }

        .confirm-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-link {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
