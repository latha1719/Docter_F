'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './dashboard.module.css'

type Appointment = {
  id: string
  doctorName: string
  doctorImage: string
  experience: string
  fee: number
  date: string
  time: string
  patientName: string
  status: string
  createdAt: string
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    upcoming: 0,
    past: 0,
    totalSpend: 0
  })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch('/api/appointments')
      if (!res.ok) throw new Error("Failed to sync with hospital database")
      const data: Appointment[] = await res.json()
      
      setAppointments(data)
      
      // Calculate stats
      const now = new Date()
      let upcomingCount = 0
      let pastCount = 0
      let totalFee = 0
      
      data.forEach(app => {
        const appDate = new Date(app.date)
        if (appDate >= now) upcomingCount++
        else pastCount++
        totalFee += Number(app.fee || 0)
      })
      
      setStats({
        upcoming: upcomingCount,
        past: pastCount,
        totalSpend: totalFee
      })
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError("Unable to load real-time stats. Displaying cached data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fallbackAvatar = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"

  // Get 3 most recent appointments with safety sort
  const recentAppointments = [...appointments]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime()
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime()
      return dateB - dateA
    })
    .slice(0, 3)

  return (
    <div className={styles.container}>
      
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
          <h2 className={styles.sidebarTitle}>Yash Hospital</h2>
        </div>
        <nav className={styles.navMenu}>
          <Link href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Dashboard</span>
          </Link>
          <Link href="/history" className={styles.navItem}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Appointments</span>
          </Link>
          <Link href="/doctors" className={styles.navItem}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Doctors</span>
          </Link>
          <Link href="/profile" className={styles.navItem}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* Navbar */}
        <header className={styles.navbar}>
          <div className={styles.navSearch}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search appointments..." />
          </div>
          <div className={styles.navProfile}>
            <div className={styles.navProfileText}>
              <span className={styles.navProfileName}>Patient Portal</span>
              <span className={styles.navProfileRole}>Active User</span>
            </div>
            <div style={{ width: '45px', height: '45px', border: '2px solid #3b82f6', borderRadius: '50%', backgroundColor: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1e3a8a' }}>
              U
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className={styles.dashboardContent}>
          
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle} style={{ color: '#ffffff' }}>Dashboard Overview</h1>
            <p className={styles.pageSubtitle} style={{ color: '#cbd5e1' }}>Real-time summary of your hospital interactions.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{loading ? "..." : stats.upcoming}</h3>
                <p className={styles.statLabel}>Upcoming Appointments</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{loading ? "..." : stats.past}</h3>
                <p className={styles.statLabel}>Past Consultations</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>0</h3>
                <p className={styles.statLabel}>Active Prescriptions</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.actionsSection}>
            <Link href="/doctors" className={`${styles.actionButton} ${styles.primaryAction}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Book New Appointment
            </Link>
            <Link href="/history" className={`${styles.actionButton} ${styles.secondaryAction}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Full History
            </Link>
          </div>

          {/* Recent Appointments */}
          <div className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
              <Link href="/history" className={styles.viewAll}>View All</Link>
            </div>
            
            <div className={styles.appointmentList}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Syncing with hospital database...</div>
              ) : recentAppointments.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No recent appointments found.</div>
              ) : (
                recentAppointments.map((app) => (
                  <div key={app.id} className={styles.appointmentCard}>
                    <div className={styles.appointmentDoctor}>
                      <img 
                        src={app.doctorImage} 
                        alt={app.doctorName} 
                        className={styles.doctorAvatar} 
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = fallbackAvatar;
                        }}
                      />
                      <div className={styles.doctorInfo}>
                        <h4>{app.doctorName}</h4>
                        <p>{app.experience}</p>
                      </div>
                    </div>
                    <div className={styles.appointmentTime}>
                      <span className={styles.timeDate}>{app.date} • {app.time}</span>
                      <span className={`${styles.timeStatus} ${new Date(app.date) >= new Date() ? styles.statusUpcoming : styles.statusCompleted}`}>
                        {new Date(app.date) >= new Date() ? "Scheduled" : "Completed"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}