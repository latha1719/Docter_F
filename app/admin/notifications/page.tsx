'use client'

import React, { useState } from 'react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Update', target: 'All Users', message: 'System maintenance scheduled for Sunday at 2 AM.', sentAt: 'Today, 10:00 AM' },
    { id: 2, type: 'Reminder', target: 'Doctors', message: 'Please update your availability for the next month.', sentAt: 'Yesterday, 4:30 PM' },
    { id: 3, type: 'Alert', target: 'Patients', message: 'New cardiology specialist joined our team!', sentAt: 'Apr 12, 11:15 AM' },
  ])

  const [target, setTarget] = useState('All Users')
  const [message, setMessage] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newNotification = {
      id: Date.now(),
      type: 'Alert',
      target: target,
      message: message,
      sentAt: 'Just now'
    }

    setNotifications([newNotification, ...notifications])
    setMessage('')
    alert('Notification sent successfully!')
  }

  return (
    <div className="notifications-container">
      <div className="grid-layout">
        <section className="composer card">
          <h3>Send System Notification</h3>
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label>Target Audience</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)}>
                <option>All Users</option>
                <option>All Doctors</option>
                <option>All Patients</option>
                <option>Specific Dept: Cardiology</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Notification Priority</label>
              <div className="priority-options">
                {['Normal', 'Urgent', 'Critical'].map(p => (
                   <label key={p} className="radio-label">
                     <input type="radio" name="priority" defaultChecked={p === 'Normal'} />
                     <span>{p}</span>
                   </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea 
                rows={5} 
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="send-btn">
              <span>🚀</span> Send Notification
            </button>
          </form>
        </section>

        <section className="history-section card">
          <h3>Notification History</h3>
          <div className="history-list">
            {notifications.map(note => (
              <div key={note.id} className="history-item">
                <div className="item-header">
                  <span className="type-badge">{note.type}</span>
                  <span className="target-info">To: {note.target}</span>
                  <span className="time-stamp">{note.sentAt}</span>
                </div>
                <div className="item-body">
                  {note.message}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .notifications-container {
          padding-bottom: 2rem;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 2rem;
        }

        .card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        h3 {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #64748b;
          font-size: 0.9rem;
        }

        select, textarea {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-family: inherit;
        }

        textarea {
          resize: none;
        }

        .priority-options {
          display: flex;
          gap: 1rem;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: #334155;
        }

        .send-btn {
          width: 100%;
          padding: 0.8rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .send-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          padding: 1rem;
          border-radius: 0.75rem;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .type-badge {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          background: #e2e8f0;
          color: #475569;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .target-info {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
        }

        .time-stamp {
          margin-left: auto;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .item-body {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .grid-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
