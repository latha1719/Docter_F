'use client'

import { useEffect, useState } from 'react'
import styles from './history.module.css'
import { printPaymentReceipt, PaymentReceiptData } from '../components/printReceipt'

type Appointment = {
  id: string
  doctorId?: string
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
  paymentStatus?: string
  paymentId?: string
  status: string
}

type PaymentRecord = {
  id: string
  appointmentId?: string
  doctorName: string
  doctorImage?: string
  specialization?: string
  patientName: string
  contact?: string
  amount: number
  paymentMethod: string
  status: string
  failureReason?: string
  paidAt: string
  date?: string
  time?: string
}

export default function History() {
  const [activeMainTab, setActiveMainTab] = useState<'appointments' | 'payments'>('appointments')

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionSuccessMsg, setActionSuccessMsg] = useState("")

  // Payment History State
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [paymentSearch, setPaymentSearch] = useState("")

  // Review Modal State
  const [selectedAppForReview, setSelectedAppForReview] = useState<Appointment | null>(null)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('')

  // Reschedule Modal State
  const [selectedAppForReschedule, setSelectedAppForReschedule] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [isRescheduling, setIsRescheduling] = useState(false)

  const amTimeSlots = [
    "09:00 am - 09:15 am", "09:15 am - 09:30 am", "09:30 am - 09:45 am", "09:45 am - 10:00 am",
    "10:00 am - 10:15 am", "10:15 am - 10:30 am", "10:30 am - 10:45 am", "10:45 am - 11:00 am",
    "11:00 am - 11:15 am", "11:15 am - 11:30 am", "11:30 am - 11:45 am", "11:45 am - 12:00 pm"
  ];

  const pmTimeSlots = [
    "12:00 pm - 12:15 pm", "12:15 pm - 12:30 pm", "12:30 pm - 12:45 pm", "12:45 pm - 01:00 pm",
    "01:00 pm - 01:15 pm", "01:15 pm - 01:30 pm", "02:00 pm - 02:15 pm", "02:15 pm - 02:30 pm",
    "03:00 pm - 03:15 pm", "03:15 pm - 03:30 pm", "04:00 pm - 04:15 pm", "04:15 pm - 04:30 pm"
  ];

  const nightTimeSlots = [
    "06:00 pm - 06:15 pm", "06:15 pm - 06:30 pm", "06:30 pm - 06:45 pm", "06:45 pm - 07:00 pm",
    "07:00 pm - 07:15 pm", "07:15 pm - 07:30 pm", "07:30 pm - 07:45 pm", "07:45 pm - 08:00 pm",
    "08:00 pm - 08:15 pm", "08:15 pm - 08:30 pm", "08:30 pm - 08:45 pm", "08:45 pm - 09:00 pm"
  ];

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

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true)
      const res = await fetch('/api/payments')
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
    } catch (err) {
      console.error("Failed to load payment transactions:", err)
    } finally {
      setLoadingPayments(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchPayments()
  }, [])

  const handleCancelAppointment = async (app: Appointment) => {
    if (!confirm(`Are you sure you want to CANCEL your appointment with ${app.doctorName} on ${app.date}?`)) return;

    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: app.id, action: 'cancel' })
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Cancelled' } : a));
        setActionSuccessMsg(`❌ Appointment with ${app.doctorName} has been cancelled. Notifications sent.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchPayments() // Refresh payments status if refunded
      } else {
        alert(data.error || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert("Error cancelling appointment");
    }
  }

  const handleOpenReschedule = (app: Appointment) => {
    setSelectedAppForReschedule(app);
    setRescheduleDate(app.date);
    setRescheduleTime(app.time);
  }

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReschedule || !rescheduleDate || !rescheduleTime) {
      alert("Please select a date and time slot!");
      return;
    }

    setIsRescheduling(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppForReschedule.id,
          action: 'reschedule',
          newDate: rescheduleDate,
          newTime: rescheduleTime
        })
      });

      const data = await res.json();

      if (res.ok) {
        setAppointments(prev => prev.map(a => 
          a.id === selectedAppForReschedule.id 
            ? { ...a, date: rescheduleDate, time: rescheduleTime, status: 'Rescheduled' } 
            : a
        ));
        setSelectedAppForReschedule(null);
        setActionSuccessMsg(`📅 Appointment with ${selectedAppForReschedule.doctorName} rescheduled to ${rescheduleDate} (${rescheduleTime}). Notifications sent.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        alert(data.error || "Failed to reschedule appointment");
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      alert("Error rescheduling appointment");
    } finally {
      setIsRescheduling(false);
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this record?")) return

    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Delete failed")
      setAppointments(appointments.filter(a => a.id !== id))
    } catch (err) {
      alert("Error deleting appointment")
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppForReview || !comment.trim()) {
      alert("Please enter your review comments!")
      return
    }

    setIsSubmittingReview(true)
    setReviewSuccessMsg('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedAppForReview.doctorId || '',
          doctorName: selectedAppForReview.doctorName,
          patientName: selectedAppForReview.patientName || 'Patient',
          rating: rating,
          comment: comment
        })
      })

      if (res.ok) {
        setReviewSuccessMsg(`✅ Thank you! Your ${rating}-star review for ${selectedAppForReview.doctorName} has been submitted.`)
        setTimeout(() => {
          setSelectedAppForReview(null)
          setComment('')
          setRating(5)
          setReviewSuccessMsg('')
        }, 2000)
      } else {
        alert("Failed to submit review. Please try again.")
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      alert("Error submitting review.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handlePrintReceiptForRecord = (p: PaymentRecord) => {
    printPaymentReceipt({
      id: p.id,
      appointmentId: p.appointmentId,
      doctorName: p.doctorName,
      specialization: p.specialization,
      patientName: p.patientName,
      contact: p.contact,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      paidAt: p.paidAt,
      date: p.date,
      time: p.time,
      failureReason: p.failureReason
    })
  }

  const filteredAppointments = appointments.filter((app) =>
    app.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    app.patientName.toLowerCase().includes(search.toLowerCase()) ||
    app.contact.includes(search)
  )

  const filteredPayments = payments.filter((p) =>
    p.id.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.doctorName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.patientName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.paymentMethod.toLowerCase().includes(paymentSearch.toLowerCase())
  )

  return (
    <div className={styles.container}>
      
      {/* Page Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>History & Payment Center</h1>
          <p className={styles.subtitle}>View appointment history, manage bookings, and access official payment receipts.</p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveMainTab('appointments')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '9px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeMainTab === 'appointments' ? '#0284c7' : 'transparent',
              color: activeMainTab === 'appointments' ? 'white' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            📅 Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveMainTab('payments')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '9px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeMainTab === 'payments' ? '#0284c7' : 'transparent',
              color: activeMainTab === 'payments' ? 'white' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            💳 Payment History & Receipts ({payments.length})
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div style={{ background: '#f0fdf4', color: '#166534', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '1.5rem', fontWeight: 600 }}>
          {actionSuccessMsg}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeMainTab === 'appointments' && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
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

          {loading ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner}></div>
              <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 600 }}>Loading history...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <h2 className={styles.emptyTitle}>{search ? "No matches found" : "No appointments yet"}</h2>
              <p style={{ color: '#94a3b8' }}>{search ? "Try adjusting your search terms" : "When you book a doctor, it will appear here."}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredAppointments.map((app) => {
                const isCancelled = app.status === 'Cancelled';
                return (
                  <div key={app.id} className={styles.card} style={isCancelled ? { opacity: 0.75, background: '#fafafa' } : {}}>
                    <div 
                      className={styles.statusBadge}
                      style={{
                        background: isCancelled ? '#fef2f2' : app.status === 'Rescheduled' ? '#fff7ed' : '#f0fdf4',
                        color: isCancelled ? '#ef4444' : app.status === 'Rescheduled' ? '#c2410c' : '#16a34a'
                      }}
                    >
                      {app.status}
                    </div>
                    
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
                      <span className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Reason / Clinical Note</span>
                      <p className={styles.problemText}>{app.problem}</p>
                    </div>

                    {/* Patient Actions Bar */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                      {!isCancelled ? (
                        <>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handleOpenReschedule(app)}
                              style={{
                                background: '#fff7ed',
                                color: '#c2410c',
                                border: '1px solid #ffedd5',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              📅 Reschedule
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(app)}
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fee2e2',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              ❌ Cancel
                            </button>
                          </div>

                          <button 
                            onClick={() => setSelectedAppForReview(app)}
                            style={{
                              background: '#eff6ff',
                              color: '#0284c7',
                              border: '1px solid #bfdbfe',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            ⭐ Review
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                          Appointment Cancelled
                        </span>
                      )}
                    </div>

                    <div className={styles.footer}>
                      <div className={styles.paymentInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={styles.fee}>₹{app.fee}</span>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: '4px',
                            background: isCancelled ? '#fef2f2' : '#f0fdf4',
                            color: isCancelled ? '#dc2626' : '#16a34a'
                          }}>
                            {isCancelled ? 'Refunded' : app.paymentStatus || 'Paid'}
                          </span>
                        </div>
                        <span className={styles.method}>via {app.paymentMethod} {app.paymentId ? `(${app.paymentId})` : ''}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {app.paymentId && (
                          <button
                            onClick={() => handlePrintReceiptForRecord({
                              id: app.paymentId!,
                              appointmentId: app.id,
                              doctorName: app.doctorName,
                              patientName: app.patientName,
                              contact: app.contact,
                              amount: app.fee,
                              paymentMethod: app.paymentMethod,
                              status: isCancelled ? 'Refunded' : 'Paid',
                              paidAt: new Date().toISOString(),
                              date: app.date,
                              time: app.time
                            })}
                            style={{
                              background: '#f0f9ff',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            📄 Receipt
                          </button>
                        )}
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteAppointment(app.id)}
                        >
                          Delete Record
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PAYMENT HISTORY TAB */}
      {activeMainTab === 'payments' && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
              Showing {filteredPayments.length} payment transaction(s)
            </div>

            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search Txn ID, Doctor, Patient..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingPayments ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner}></div>
              <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 600 }}>Loading payment history...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <h2 className={styles.emptyTitle}>{paymentSearch ? "No matching payment records" : "No Payment Transactions Yet"}</h2>
              <p style={{ color: '#94a3b8' }}>Payment receipts will automatically be recorded here after booking.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredPayments.map((p, index) => {
                const isPaid = p.status === 'Paid' || p.status === 'Confirmed';
                const isRefunded = p.status === 'Refunded';

                return (
                  <div 
                    key={`${p.id}-${index}`}
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div 
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background: isPaid ? '#f0fdf4' : isRefunded ? '#fff7ed' : '#fef2f2',
                          color: isPaid ? '#16a34a' : isRefunded ? '#c2410c' : '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {isPaid ? '✓' : isRefunded ? '↩' : '✕'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0284c7', fontSize: '1rem' }}>
                            {p.id}
                          </span>
                          <span 
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              background: isPaid ? '#f0fdf4' : isRefunded ? '#fff7ed' : '#fef2f2',
                              color: isPaid ? '#16a34a' : isRefunded ? '#c2410c' : '#dc2626',
                              border: `1px solid ${isPaid ? '#bbf7d0' : isRefunded ? '#ffedd5' : '#fecaca'}`
                            }}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                          {p.doctorName} • <span style={{ color: '#64748b', fontWeight: 500 }}>Patient: {p.patientName}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                          Paid via {p.paymentMethod} • {p.paidAt ? new Date(p.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isPaid ? '#16a34a' : isRefunded ? '#c2410c' : '#0f172a' }}>
                          ₹{p.amount}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Consultation Fee</div>
                      </div>

                      <button
                        onClick={() => handlePrintReceiptForRecord(p)}
                        style={{
                          background: '#0284c7',
                          color: 'white',
                          border: 'none',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '10px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 10px rgba(2,132,199,0.25)'
                        }}
                      >
                        🖨️ View Receipt
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}

        </div>
      )}

      {/* Reschedule Modal */}
      {selectedAppForReschedule && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Reschedule Appointment</h3>
              <button 
                onClick={() => setSelectedAppForReschedule(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Doctor: {selectedAppForReschedule.doctorName}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                Current Schedule: {selectedAppForReschedule.date} ({selectedAppForReschedule.time})
              </div>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                  Select New Date
                </label>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                  Select New Time Slot
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                  required
                >
                  <option value="" disabled>Select Time Slot</option>
                  <optgroup label="Morning (AM)">
                    {amTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Afternoon (PM)">
                    {pmTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Night (PM)">
                    {nightTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAppForReschedule(null)}
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  style={{ background: '#c2410c', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isRescheduling ? 'Updating...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedAppForReview && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Rate & Review Consultation</h3>
              <button 
                onClick={() => setSelectedAppForReview(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src={selectedAppForReview.doctorImage || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"} 
                alt={selectedAppForReview.doctorName}
                style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedAppForReview.doctorName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Consultation Date: {selectedAppForReview.date}</div>
              </div>
            </div>

            {reviewSuccessMsg ? (
              <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '1.25rem', borderRadius: '12px', textAlign: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
                {reviewSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Select Star Rating
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '2rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ color: star <= (hoverRating || rating) ? '#f59e0b' : '#cbd5e1', transition: 'color 0.15s' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>
                    {rating} out of 5 Stars
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                    Your Review & Experience *
                  </label>
                  <textarea
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                    placeholder="Describe your consultation experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedAppForReview(null)}
                    style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}