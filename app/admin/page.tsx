"use client";

import React from "react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Revenue", value: "$24,500", icon: "💰", trend: "+12.5%", trendType: "up" },
    { title: "Appointments", value: "1,284", icon: "📅", trend: "+8.2%", trendType: "up" },
    { title: "New Patients", value: "45", icon: "👤", trend: "+15.3%", trendType: "up" },
    { title: "Active Doctors", value: "12", icon: "👨‍⚕️", trend: "0%", trendType: "neutral" },
  ];

  const recentAppointments = [
    { id: 1, patient: "John Doe", doctor: "Dr. Sharma", date: "2026-04-15", time: "10:00 AM", status: "confirmed" },
    { id: 2, patient: "Jane Smith", doctor: "Dr. Patel", date: "2026-04-15", time: "11:30 AM", status: "pending" },
    { id: 3, patient: "Robert Brown", doctor: "Dr. Desai", date: "2026-04-16", time: "09:00 AM", status: "confirmed" },
    { id: 4, patient: "Emily Davis", doctor: "Dr. Singh", date: "2026-04-16", time: "02:00 PM", status: "cancelled" },
  ];

  return (
    <div className="dashboard-content">
      {/* 💳 STATS OVERVIEW */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">{item.icon}</span>
              <span className={`stat-trend ${item.trendType}`}>
                {item.trend}
              </span>
            </div>
            <div className="stat-value">{item.value}</div>
            <div className="stat-title">{item.title}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        {/* 📈 REPORTING & ANALYTICS */}
        <div className="card analytics">
          <h3>Reporting & Analytics</h3>
          <div className="chart">
            {[60, 80, 45, 90, 70, 85, 95].map((h, i) => (
              <div key={i} className="bar" style={{ height: `${h}%` }}>
                <span className="bar-label">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📅 RECENT APPOINTMENTS */}
        <div className="card table-card">
          <h3>Recent Appointments</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((app) => (
                  <tr key={app.id}>
                    <td>{app.patient}</td>
                    <td>{app.doctor}</td>
                    <td>{app.date}</td>
                    <td>{app.time}</td>
                    <td>
                      <span className={`status-pill ${app.status}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-content { display: flex; flex-direction: column; gap: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-card {
          background: white; padding: 20px; border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;
        }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .stat-icon { font-size: 24px; }
        .stat-trend { font-size: 0.8rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
        .stat-trend.up { color: #10b981; background: #ecfdf5; }
        .stat-trend.neutral { color: #64748b; background: #f1f5f9; }
        .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; }
        .stat-title { font-size: 0.9rem; color: #64748b; }
        .dashboard-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
        .card h3 { margin-bottom: 20px; color: #1e293b; font-weight: 600; }
        .chart { height: 200px; display: flex; align-items: flex-end; gap: 12px; padding-bottom: 25px; }
        .bar { flex: 1; background: #3b82f6; border-radius: 4px 4px 0 0; position: relative; }
        .bar-label { position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #94a3b8; white-space: nowrap; }
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-weight: 600; font-size: 0.85rem; }
        td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; }
        .status-pill { padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
        .status-pill.confirmed { background: #ecfdf5; color: #10b981; }
        .status-pill.pending { background: #fffbeb; color: #f59e0b; }
        .status-pill.cancelled { background: #fef2f2; color: #ef4444; }
      `}</style>
    </div>
  );
}
