'use client'

import { useEffect, useState } from 'react'
import styles from './history.module.css'

type Appointment = {
  id: string
  doctorName: string
  doctorImage: string
  experience: string
  fee: number
  date: string
  time: string
  patientName: string
  age: string
  contact: string
  problem: string
  paymentMethod: string
  status: string
}

export default function History() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/appointments')
      if (!res.ok) throw new Error("Failed to fetch appointments")
      const data = await res.json()
      setAppointments(data)
    } catch (err) {
      setError("Could not load appointment history. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const deleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this appointment record?")) return

    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Delete failed")
      setAppointments(appointments.filter(a => a.id !== id))
    } catch (err) {
      alert("Error deleting appointment")
    }
  }

  const filtered = appointments.filter((app) =>
    app.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    app.patientName.toLowerCase().includes(search.toLowerCase()) ||
    app.contact.includes(search)
  )

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 600 }}>Loading history...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Appointment History</h1>
          <p className={styles.subtitle}>Manage and track all scheduled consultations.</p>
        </div>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search patient or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <h2 className={styles.emptyTitle}>{search ? "No matches found" : "No appointments yet"}</h2>
          <p style={{ color: '#94a3b8' }}>{search ? "Try adjusting your search terms" : "When you book a doctor, it will appear here."}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((app) => (
            <div key={app.id} className={styles.card}>
              <div className={styles.statusBadge}>{app.status}</div>
              
              <div className={styles.doctorSection}>
                <img 
                  src={app.doctorImage || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"} 
                  alt={app.doctorName} 
                  className={styles.doctorImg} 
                />
                <div>
                  <div className={styles.doctorName}>{app.doctorName}</div>
                  <div className={styles.specialty}>{app.experience}</div>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Patient</span>
                  <span className={styles.value}>{app.patientName}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Contact</span>
                  <span className={styles.value}>{app.contact}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Date</span>
                  <span className={styles.value}>{app.date}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Time Slot</span>
                  <span className={styles.value}>{app.time}</span>
                </div>
              </div>

              <div className={styles.problemArea}>
                <span className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Clinical Note</span>
                <p className={styles.problemText}>{app.problem}</p>
              </div>

              <div className={styles.footer}>
                <div className={styles.paymentInfo}>
                  <span className={styles.fee}>₹{app.fee}</span>
                  <span className={styles.method}>via {app.paymentMethod}</span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteAppointment(app.id)}
                >
                  Cancel / Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}