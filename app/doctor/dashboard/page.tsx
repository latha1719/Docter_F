'use client'

import { useState, useEffect } from 'react'
import styles from './dashboard.module.css'

type Doctor = {
  id: string
  name: string
  specialization?: string
  specialty?: string
  experience: string
  fee: number
  image: string
  status?: string
  availableDates?: string[]
  availableTimeSlots?: string[]
}

type Appointment = {
  id: string
  doctorId?: string
  doctorName: string
  doctorImage?: string
  experience?: string
  fee: number
  date: string
  time: string
  patientName: string
  age?: string
  contact?: string
  problem?: string
  diagnosis?: string
  notes?: string
  paymentMethod?: string
  paymentStatus?: string
  status: string
  createdAt?: string
}

type PrescriptionMedicine = {
  name: string
  dosage: string
  frequency: string
  duration: string
}

type Prescription = {
  id: string
  appointmentId?: string
  doctorName: string
  doctorSpecialization?: string
  patientName: string
  age?: string
  date: string
  diagnosis: string
  notes: string
  medicines: PrescriptionMedicine[]
  status: string
  createdAt?: string
}

export default function DoctorDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  // Active Main Tab: 'appointments' | 'patients' | 'slots'
  const [activeMainTab, setActiveMainTab] = useState<'appointments' | 'patients' | 'slots'>('appointments')

  // Appointment Status Filter: 'all' | 'today' | 'upcoming' | 'completed' | 'pending'
  const [appFilter, setAppFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'pending'>('all')

  // Search Terms
  const [searchTerm, setSearchTerm] = useState('')
  const [patientSearch, setPatientSearch] = useState('')

  // Consultation & Prescription Modal State
  const [selectedAppForRx, setSelectedAppForRx] = useState<Appointment | null>(null)
  const [diagnosisInput, setDiagnosisInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [medicinesList, setMedicinesList] = useState<PrescriptionMedicine[]>([
    { name: '', dosage: '1 Tablet', frequency: 'Twice daily after meals', duration: '5 Days' }
  ])
  const [isSavingRx, setIsSavingRx] = useState(false)
  const [rxSuccessMsg, setRxSuccessMsg] = useState('')

  // Patient Medical History Modal State
  const [historyModalPatient, setHistoryModalPatient] = useState<{
    name: string
    contact?: string
    age?: string
  } | null>(null)

  // Slot Management State for active doctor
  const [doctorStatus, setDoctorStatus] = useState<'Active' | 'On Leave'>('Active')
  const [doctorFee, setDoctorFee] = useState<number>(500)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [customSlotInput, setCustomSlotInput] = useState('')
  const [isSavingSlots, setIsSavingSlots] = useState(false)
  const [slotSaveMsg, setSlotSaveMsg] = useState('')

  const availableSlotsList = [
    "09:00 am - 09:30 am", "09:30 am - 10:00 am", "10:00 am - 10:30 am", "10:30 am - 11:00 am",
    "11:00 am - 11:30 am", "11:30 am - 12:00 pm", "02:00 pm - 02:30 pm", "02:30 pm - 03:00 pm",
    "03:00 pm - 03:30 pm", "03:30 pm - 04:00 pm", "06:00 pm - 06:30 pm", "06:30 pm - 07:00 pm",
    "07:00 pm - 07:30 pm", "07:30 pm - 08:00 pm", "08:00 pm - 08:30 pm", "08:30 pm - 09:00 pm"
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resDocs, resApps, resRx] = await Promise.all([
        fetch('/api/doctors'),
        fetch('/api/appointments'),
        fetch('/api/prescriptions')
      ])

      let docsData: Doctor[] = []
      if (resDocs.ok) {
        docsData = await resDocs.json()
        setDoctors(docsData)
      }

      if (resApps.ok) {
        const appsData: Appointment[] = await resApps.json()
        setAppointments(appsData)
      }

      if (resRx.ok) {
        const rxData: Prescription[] = await resRx.json()
        setPrescriptions(rxData)
      }

      // Default selected doctor
      if (docsData.length > 0 && !selectedDoctor) {
        const defaultDoc = docsData[0]
        setSelectedDoctor(defaultDoc)
        setDoctorStatus((defaultDoc.status as any) || 'Active')
        setDoctorFee(defaultDoc.fee || 500)
        setSelectedSlots(defaultDoc.availableTimeSlots && defaultDoc.availableTimeSlots.length > 0 ? defaultDoc.availableTimeSlots : availableSlotsList.slice(0, 8))
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Sync state when selectedDoctor changes
  useEffect(() => {
    if (selectedDoctor) {
      setDoctorStatus((selectedDoctor.status as any) || 'Active')
      setDoctorFee(selectedDoctor.fee || 500)
      setSelectedSlots(
        selectedDoctor.availableTimeSlots && selectedDoctor.availableTimeSlots.length > 0 
          ? selectedDoctor.availableTimeSlots 
          : availableSlotsList.slice(0, 8)
      )
    }
  }, [selectedDoctor])

  const todayStr = new Date().toISOString().split('T')[0]

  // Filter appointments for active doctor
  const doctorAppointments = appointments.filter(app => {
    if (!selectedDoctor) return true
    return (
      (app.doctorId && app.doctorId === selectedDoctor.id) ||
      (app.doctorName && app.doctorName.toLowerCase().trim() === selectedDoctor.name.toLowerCase().trim())
    )
  })

  // Categorize Metrics
  const todayApps = doctorAppointments.filter(app => app.date === todayStr && app.status !== 'Cancelled')
  const upcomingApps = doctorAppointments.filter(app => app.date > todayStr && app.status !== 'Cancelled')
  const completedApps = doctorAppointments.filter(app => app.status === 'Completed')
  const pendingApps = doctorAppointments.filter(app => (app.status || '').toLowerCase() === 'pending' || app.status === 'Scheduled')

  // Filtered Appointments List
  const filteredAppointments = doctorAppointments.filter(app => {
    // Category Filter
    if (appFilter === 'today' && app.date !== todayStr) return false
    if (appFilter === 'upcoming' && app.date <= todayStr) return false
    if (appFilter === 'completed' && app.status !== 'Completed') return false
    if (appFilter === 'pending' && app.status !== 'Pending' && app.status !== 'Scheduled') return false

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        app.patientName.toLowerCase().includes(term) ||
        app.date.includes(term) ||
        (app.problem || '').toLowerCase().includes(term) ||
        (app.contact || '').includes(term)
      )
    }

    return true
  })

  // Extract unique patient list
  const patientMap = new Map<string, {
    name: string
    age?: string
    contact?: string
    totalVisits: number
    lastVisitDate: string
  }>()

  doctorAppointments.forEach(app => {
    const key = app.patientName.trim().toLowerCase()
    if (!patientMap.has(key)) {
      patientMap.set(key, {
        name: app.patientName,
        age: app.age || 'N/A',
        contact: app.contact || 'N/A',
        totalVisits: 1,
        lastVisitDate: app.date
      })
    } else {
      const existing = patientMap.get(key)!
      existing.totalVisits += 1
      if (app.date > existing.lastVisitDate) existing.lastVisitDate = app.date
    }
  })

  const uniquePatientsList = Array.from(patientMap.values()).filter(p =>
    !patientSearch || p.name.toLowerCase().includes(patientSearch.toLowerCase()) || (p.contact && p.contact.includes(patientSearch))
  )

  // Doctor Action: Accept / Confirm Appointment
  const handleAcceptAppointment = async (appId: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, action: 'accept' })
      })
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: 'Confirmed' } : a))
      } else {
        alert("Failed to accept appointment")
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Doctor Action: Reject Appointment
  const handleRejectAppointment = async (appId: string) => {
    if (!confirm("Are you sure you want to REJECT this appointment request?")) return
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, action: 'reject' })
      })
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: 'Rejected' } : a))
      } else {
        alert("Failed to reject appointment")
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Doctor Action: Cancel Confirmed Appointment
  const handleCancelByDoctor = async (appId: string) => {
    if (!confirm("Are you sure you want to CANCEL this confirmed appointment?")) return
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, action: 'cancel' })
      })
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: 'Cancelled' } : a))
      } else {
        alert("Failed to cancel appointment")
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Doctor Action: Complete Consultation
  const handleCompleteAppointment = async (appId: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, action: 'complete' })
      })
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: 'Completed' } : a))
      } else {
        alert("Failed to complete appointment")
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Open Prescription & Diagnosis Modal
  const handleOpenRxModal = (app: Appointment) => {
    setSelectedAppForRx(app)
    setDiagnosisInput(app.diagnosis || app.problem || 'General Checkup')
    setNotesInput(app.notes || 'Drink plenty of water, rest well, and follow dosage as instructed.')
    
    // Check if prescription already exists for this app
    const existingRx = prescriptions.find(p => p.appointmentId === app.id || p.id === `RX_${app.id}`)
    if (existingRx && existingRx.medicines && existingRx.medicines.length > 0) {
      setMedicinesList(existingRx.medicines)
    } else {
      setMedicinesList([
        { name: 'Paracetamol 500mg', dosage: '1 Tablet', frequency: 'Twice daily after food', duration: '5 Days' },
        { name: 'Multivitamin Capsule', dosage: '1 Capsule', frequency: 'Once daily after lunch', duration: '10 Days' }
      ])
    }
    setRxSuccessMsg('')
  }

  // Save Diagnosis & Prescription
  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppForRx) return

    setIsSavingRx(true)
    setRxSuccessMsg('')

    try {
      // 1. Update appointment diagnosis and notes
      await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppForRx.id,
          action: 'update_notes',
          diagnosis: diagnosisInput,
          notes: notesInput
        })
      })

      // 2. Save prescription record
      const rxPayload = {
        id: `RX_${selectedAppForRx.id}`,
        appointmentId: selectedAppForRx.id,
        doctorName: selectedAppForRx.doctorName || selectedDoctor?.name || 'Dr. Specialist',
        doctorSpecialization: selectedDoctor?.specialization || selectedDoctor?.specialty || 'General Medicine',
        doctorImage: selectedDoctor?.image || selectedAppForRx.doctorImage,
        patientName: selectedAppForRx.patientName,
        age: selectedAppForRx.age || 'N/A',
        date: selectedAppForRx.date,
        diagnosis: diagnosisInput,
        notes: notesInput,
        medicines: medicinesList.filter(m => m.name.trim() !== ''),
        status: 'Active'
      }

      const resRx = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rxPayload)
      })

      if (resRx.ok) {
        setRxSuccessMsg('✅ Diagnosis & Prescription saved successfully! Syncing medical records...')
        setAppointments(prev => prev.map(a => a.id === selectedAppForRx.id ? { ...a, diagnosis: diagnosisInput, notes: notesInput, status: 'Completed' } : a))
        fetchData()
        setTimeout(() => {
          setSelectedAppForRx(null)
          setRxSuccessMsg('')
        }, 1500)
      } else {
        alert("Failed to save prescription.")
      }
    } catch (err) {
      console.error(err)
      alert("Error saving diagnosis & prescription")
    } finally {
      setIsSavingRx(false)
    }
  }

  // Save Available Time Slots & Doctor Status
  const handleSaveSlotSchedule = async () => {
    if (!selectedDoctor) return
    setIsSavingSlots(true)
    setSlotSaveMsg('')

    try {
      const res = await fetch('/api/doctors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDoctor.id,
          status: doctorStatus,
          fee: Number(doctorFee) || 500,
          availableTimeSlots: selectedSlots
        })
      })

      if (res.ok) {
        setSlotSaveMsg('✅ Schedule & Available Time Slots updated successfully!')
        setTimeout(() => setSlotSaveMsg(''), 3000)
        fetchData()
      } else {
        alert("Failed to update slot schedule")
      }
    } catch (err) {
      console.error(err)
      alert("Error updating schedule")
    } finally {
      setIsSavingSlots(false)
    }
  }

  const toggleSlotSelection = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot))
    } else {
      setSelectedSlots([...selectedSlots, slot])
    }
  }

  const handleAddCustomSlot = () => {
    if (!customSlotInput.trim()) return
    if (!selectedSlots.includes(customSlotInput.trim())) {
      setSelectedSlots([...selectedSlots, customSlotInput.trim()])
    }
    setCustomSlotInput('')
  }

  if (loading) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>Loading Doctor Dashboard...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      
      {/* Top Header & Doctor Profile Selector */}
      <div className={styles.header}>
        <div className={styles.doctorProfile}>
          <img 
            src={selectedDoctor?.image || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800"} 
            alt={selectedDoctor?.name} 
            className={styles.doctorAvatar} 
          />
          <div>
            <h1 className={styles.doctorName}>{selectedDoctor?.name || 'Dr. Medical Specialist'}</h1>
            <div className={styles.doctorMeta}>
              <span>🩺 {selectedDoctor?.specialization || selectedDoctor?.specialty || 'General Medicine'}</span>
              <span>• {selectedDoctor?.experience}</span>
              <span 
                style={{ 
                  background: doctorStatus === 'Active' ? '#f0fdf4' : '#fef2f2',
                  color: doctorStatus === 'Active' ? '#16a34a' : '#dc2626',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.78rem'
                }}
              >
                {doctorStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Roster Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Switch Doctor View:</span>
          <select
            className={styles.docSelectorSelect}
            value={selectedDoctor?.id}
            onChange={(e) => {
              const doc = doctors.find(d => d.id === e.target.value)
              if (doc) setSelectedDoctor(doc)
            }}
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization || d.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className={styles.statsGrid}>
        
        <div 
          className={styles.statCard}
          onClick={() => { setActiveMainTab('appointments'); setAppFilter('today'); }}
        >
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>📅</div>
          <div>
            <div className={styles.statValue}>{todayApps.length}</div>
            <div className={styles.statLabel}>Today's Appointments</div>
          </div>
        </div>

        <div 
          className={styles.statCard}
          onClick={() => { setActiveMainTab('appointments'); setAppFilter('upcoming'); }}
        >
          <div className={`${styles.statIcon} ${styles.iconOrange}`}>⏳</div>
          <div>
            <div className={styles.statValue}>{upcomingApps.length}</div>
            <div className={styles.statLabel}>Upcoming Appointments</div>
          </div>
        </div>

        <div 
          className={styles.statCard}
          onClick={() => { setActiveMainTab('appointments'); setAppFilter('completed'); }}
        >
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>✅</div>
          <div>
            <div className={styles.statValue}>{completedApps.length}</div>
            <div className={styles.statLabel}>Completed Consultations</div>
          </div>
        </div>

        <div 
          className={styles.statCard}
          onClick={() => setActiveMainTab('patients')}
        >
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>👥</div>
          <div>
            <div className={styles.statValue}>{uniquePatientsList.length}</div>
            <div className={styles.statLabel}>Patient Roster</div>
          </div>
        </div>

      </div>

      {/* Main Workspace Card */}
      <div className={styles.mainSection}>
        
        {/* Navigation Tabs */}
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabBtn} ${activeMainTab === 'appointments' ? styles.active : ''}`}
            onClick={() => setActiveMainTab('appointments')}
          >
            📅 Appointments Management ({doctorAppointments.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeMainTab === 'patients' ? styles.active : ''}`}
            onClick={() => setActiveMainTab('patients')}
          >
            👥 Patient List & Medical History ({uniquePatientsList.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeMainTab === 'slots' ? styles.active : ''}`}
            onClick={() => setActiveMainTab('slots')}
          >
            🕒 Manage Time Slots & Schedule
          </button>
        </div>

        {/* 1. APPOINTMENTS MANAGEMENT TAB */}
        {activeMainTab === 'appointments' && (
          <div>
            {/* Filter Pills */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className={styles.filterPills}>
                <button 
                  className={`${styles.filterPill} ${appFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setAppFilter('all')}
                >
                  All ({doctorAppointments.length})
                </button>
                <button 
                  className={`${styles.filterPill} ${appFilter === 'today' ? styles.active : ''}`}
                  onClick={() => setAppFilter('today')}
                >
                  Today ({todayApps.length})
                </button>
                <button 
                  className={`${styles.filterPill} ${appFilter === 'upcoming' ? styles.active : ''}`}
                  onClick={() => setAppFilter('upcoming')}
                >
                  Upcoming ({upcomingApps.length})
                </button>
                <button 
                  className={`${styles.filterPill} ${appFilter === 'completed' ? styles.active : ''}`}
                  onClick={() => setAppFilter('completed')}
                >
                  Completed ({completedApps.length})
                </button>
                <button 
                  className={`${styles.filterPill} ${appFilter === 'pending' ? styles.active : ''}`}
                  onClick={() => setAppFilter('pending')}
                >
                  Pending Requests ({pendingApps.length})
                </button>
              </div>

              {/* Search Field */}
              <input
                type="text"
                className={styles.formInput}
                placeholder="Search patient, date, or problem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: '280px' }}
              />
            </div>

            {filteredAppointments.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '14px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#334155' }}>No appointments match this filter</div>
                <div style={{ fontSize: '0.85rem' }}>New patient bookings will appear here automatically.</div>
              </div>
            ) : (
              <div className={styles.appointmentGrid}>
                {filteredAppointments.map(app => {
                  const isPending = app.status === 'Pending' || app.status === 'Scheduled'
                  const isCompleted = app.status === 'Completed'
                  const isRejected = app.status === 'Rejected' || app.status === 'Cancelled'

                  return (
                    <div key={app.id} className={styles.appointmentCard}>
                      <div>
                        <div className={styles.appHeader}>
                          <div>
                            <div className={styles.patientName}>{app.patientName}</div>
                            <div className={styles.patientMeta}>
                              Age: {app.age || 'N/A'} • Contact: {app.contact || 'N/A'}
                            </div>
                          </div>
                          <span 
                            className={`${styles.statusBadge} ${
                              isCompleted ? styles.statusCompleted : 
                              isRejected ? styles.statusRejected : 
                              isPending ? styles.statusPending : 
                              styles.statusConfirmed
                            }`}
                          >
                            {app.status || 'Confirmed'}
                          </span>
                        </div>

                        <div className={styles.scheduleBox}>
                          <span>📅 {app.date}</span>
                          <span>⏰ {app.time}</span>
                        </div>

                        <div className={styles.problemBox}>
                          <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                            Patient Symptoms / Complaint:
                          </strong>
                          {app.problem || 'General Checkup'}
                        </div>

                        {app.diagnosis && (
                          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 800, color: '#16a34a' }}>Diagnosis: </span>
                            {app.diagnosis}
                          </div>
                        )}
                      </div>

                      {/* Doctor Action Controls */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {isPending && (
                          <div className={styles.actionRow}>
                            <button 
                              className={styles.btnAccept}
                              onClick={() => handleAcceptAppointment(app.id)}
                            >
                              ✓ Accept
                            </button>
                            <button 
                              className={styles.btnReject}
                              onClick={() => handleRejectAppointment(app.id)}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}

                        {app.status === 'Confirmed' && (
                          <div className={styles.actionRow}>
                            <button 
                              className={styles.btnComplete}
                              onClick={() => handleCompleteAppointment(app.id)}
                            >
                              ✅ Mark as Completed
                            </button>
                            <button 
                              className={styles.btnReject}
                              onClick={() => handleCancelByDoctor(app.id)}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        )}

                        <button 
                          className={styles.btnRx}
                          onClick={() => handleOpenRxModal(app)}
                        >
                          💊 {app.diagnosis ? 'Edit Diagnosis & Prescription' : '+ Add Diagnosis & Prescription'}
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}

          </div>
        )}

        {/* 2. PATIENT LIST & MEDICAL HISTORY TAB */}
        {activeMainTab === 'patients' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#475569' }}>
                Showing {uniquePatientsList.length} patient record(s)
              </div>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Search patient by name or phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                style={{ maxWidth: '300px' }}
              />
            </div>

            {uniquePatientsList.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '14px' }}>
                👥 No patient records found matching your search.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.medTable} style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '1rem' }}>Patient Name</th>
                      <th>Age</th>
                      <th>Contact Info</th>
                      <th>Total Consultation Visits</th>
                      <th>Last Visit Date</th>
                      <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniquePatientsList.map((patient, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a' }}>{patient.name}</td>
                        <td>{patient.age} Yrs</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{patient.contact}</td>
                        <td>
                          <span style={{ background: '#eff6ff', color: '#0284c7', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem' }}>
                            {patient.totalVisits} Visit(s)
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{patient.lastVisitDate}</td>
                        <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                          <button
                            onClick={() => setHistoryModalPatient({ name: patient.name, contact: patient.contact, age: patient.age })}
                            style={{
                              background: '#0284c7',
                              color: 'white',
                              border: 'none',
                              padding: '0.55rem 1rem',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(2,132,199,0.3)'
                            }}
                          >
                            📜 View Medical History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. MANAGE TIME SLOTS & SCHEDULE TAB */}
        {activeMainTab === 'slots' && (
          <div style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Manage Available Time Slots & Practice Settings
            </h2>

            {slotSaveMsg && (
              <div style={{ background: '#f0fdf4', color: '#166534', padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '1.5rem', fontWeight: 700 }}>
                {slotSaveMsg}
              </div>
            )}

            {/* Practice Status & Fee */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className={styles.formLabel}>Practice Availability Status</label>
                <select 
                  className={styles.formInput}
                  value={doctorStatus}
                  onChange={(e) => setDoctorStatus(e.target.value as any)}
                >
                  <option value="Active">🟢 Active & Accepting Appointments</option>
                  <option value="On Leave">🔴 On Leave / Unavailable</option>
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>Consultation Fee (₹ INR)</label>
                <input 
                  type="number"
                  className={styles.formInput}
                  value={doctorFee}
                  onChange={(e) => setDoctorFee(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Time Slots Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className={styles.formLabel} style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                Select Active Working Time Slots ({selectedSlots.length} selected)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {availableSlotsList.map((slot) => {
                  const isSelected = selectedSlots.includes(slot)
                  return (
                    <div
                      key={slot}
                      onClick={() => toggleSlotSelection(slot)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
                        background: isSelected ? '#f0f9ff' : 'white',
                        color: isSelected ? '#0369a1' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{slot}</span>
                      <span>{isSelected ? '✓' : '+'}</span>
                    </div>
                  )
                })}
              </div>

              {/* Custom Slot Addition */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. 05:00 pm - 05:30 pm"
                  value={customSlotInput}
                  onChange={(e) => setCustomSlotInput(e.target.value)}
                  style={{ maxWidth: '300px' }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSlot}
                  style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  + Add Custom Slot
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveSlotSchedule}
              disabled={isSavingSlots}
              style={{
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22,163,74,0.3)'
              }}
            >
              {isSavingSlots ? 'Saving Schedule...' : '💾 Save Working Slots & Practice Settings'}
            </button>

          </div>
        )}

      </div>

      {/* MODAL 1: DIAGNOSIS, NOTES & PRESCRIPTION MODAL */}
      {selectedAppForRx && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  Clinical Consultation & Prescription Form
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Patient: <strong>{selectedAppForRx.patientName}</strong> (Age: {selectedAppForRx.age || 'N/A'}) • Date: {selectedAppForRx.date}
                </div>
              </div>
              <button
                onClick={() => setSelectedAppForRx(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {rxSuccessMsg ? (
              <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '1.25rem', borderRadius: '12px', textAlign: 'center', fontWeight: 700 }}>
                {rxSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSavePrescription}>
                
                {/* Clinical Diagnosis */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Clinical Diagnosis *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Acute Viral Fever / Migraine / Gastritis"
                    value={diagnosisInput}
                    onChange={(e) => setDiagnosisInput(e.target.value)}
                    required
                  />
                </div>

                {/* Consultation Advice & Notes */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Doctor Advice & Clinical Notes</label>
                  <textarea
                    rows={3}
                    className={styles.formInput}
                    placeholder="Clinical observations, dietary advice, lifestyle instructions..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                  ></textarea>
                </div>

                {/* Prescribed Medicines Builder */}
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className={styles.formLabel} style={{ margin: 0 }}>
                      ℞ Prescribed Medications ({medicinesList.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => setMedicinesList([...medicinesList, { name: '', dosage: '1 Tablet', frequency: 'Twice daily after food', duration: '5 Days' }])}
                      style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      + Add Medicine Row
                    </button>
                  </div>

                  <table className={styles.medTable}>
                    <thead>
                      <tr>
                        <th>Medicine Name *</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicinesList.map((med, i) => (
                        <tr key={i}>
                          <td>
                            <input
                              type="text"
                              className={styles.medInput}
                              placeholder="e.g. Paracetamol 500mg"
                              value={med.name}
                              onChange={(e) => {
                                const list = [...medicinesList]
                                list[i].name = e.target.value
                                setMedicinesList(list)
                              }}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className={styles.medInput}
                              placeholder="1 Tablet"
                              value={med.dosage}
                              onChange={(e) => {
                                const list = [...medicinesList]
                                list[i].dosage = e.target.value
                                setMedicinesList(list)
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className={styles.medInput}
                              placeholder="Twice daily"
                              value={med.frequency}
                              onChange={(e) => {
                                const list = [...medicinesList]
                                list[i].frequency = e.target.value
                                setMedicinesList(list)
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className={styles.medInput}
                              placeholder="5 Days"
                              value={med.duration}
                              onChange={(e) => {
                                const list = [...medicinesList]
                                list[i].duration = e.target.value
                                setMedicinesList(list)
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {medicinesList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setMedicinesList(medicinesList.filter((_, idx) => idx !== i))}
                                style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedAppForRx(null)}
                    style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRx}
                    style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}
                  >
                    {isSavingRx ? 'Saving Records...' : '💾 Save & Issue Prescription'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: PATIENT MEDICAL HISTORY MODAL */}
      {historyModalPatient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: '750px' }}>
            
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  📜 Patient Medical History & Consultation Records
                </h3>
                <div style={{ fontSize: '0.88rem', color: '#0284c7', fontWeight: 700, marginTop: '0.2rem' }}>
                  Patient Name: {historyModalPatient.name} • Contact: {historyModalPatient.contact || 'N/A'}
                </div>
              </div>
              <button
                onClick={() => setHistoryModalPatient(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* List of Previous Consultations & Prescriptions for this Patient */}
            {(() => {
              const patientApps = appointments.filter(a => a.patientName.trim().toLowerCase() === historyModalPatient.name.trim().toLowerCase())
              const patientRxs = prescriptions.filter(p => p.patientName.trim().toLowerCase() === historyModalPatient.name.trim().toLowerCase())

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      📅 Past Consultations ({patientApps.length})
                    </h4>
                    {patientApps.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '0.88rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                        No consultation history found.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {patientApps.map(a => (
                          <div key={a.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                              <span>{a.date} ({a.time})</span>
                              <span style={{ color: a.status === 'Completed' ? '#16a34a' : '#0284c7' }}>{a.status}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.3rem' }}>
                              <strong>Doctor:</strong> {a.doctorName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                              <strong>Chief Complaint:</strong> {a.problem}
                            </div>
                            {a.diagnosis && (
                              <div style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '0.2rem', fontWeight: 700 }}>
                                Diagnosis: {a.diagnosis}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      💊 Issued Prescriptions ({patientRxs.length})
                    </h4>
                    {patientRxs.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '0.88rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                        No prescriptions recorded yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {patientRxs.map(rx => (
                          <div key={rx.id} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1rem', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0369a1', fontSize: '0.9rem' }}>
                              <span>Rx ID: {rx.id}</span>
                              <span>Date: {rx.date}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '0.3rem', fontWeight: 700 }}>
                              Diagnosis: {rx.diagnosis}
                            </div>
                            {rx.medicines && rx.medicines.length > 0 && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>MEDICINES:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                                  {rx.medicines.map((m, i) => (
                                    <span key={i} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                      💊 {m.name} ({m.dosage} - {m.duration})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )
            })()}

          </div>
        </div>
      )}

    </div>
  )
}
