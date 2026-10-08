'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './payment.module.css'
import { printPaymentReceipt } from '../components/printReceipt'

type PendingAppointment = {
  doctorId?: string
  doctorName: string
  doctorImage: string
  specialization?: string
  specialty?: string
  experience: string
  fee: number
  date: string
  time: string
  patientName: string
  age: string
  contact: string
  problem: string
}

export default function PaymentPage() {
  const router = useRouter()
  const [booking, setBooking] = useState<PendingAppointment | null>(null)
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi')
  
  // Payment Form States
  const [upiId, setUpiId] = useState('patient@upi')
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay')
  
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 7890')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvv, setCardCvv] = useState('888')
  const [cardName, setCardName] = useState('')

  const [selectedBank, setSelectedBank] = useState('')
  const [netBankingAccount, setNetBankingAccount] = useState('')

  // Demo mode: Simulate Payment Failure
  const [simulateFailure, setSimulateFailure] = useState(false)

  // Payment Execution & Status State
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const [paymentResult, setPaymentResult] = useState<{
    paymentId: string
    paymentMethod: string
    amount: number
    paidAt: string
    errorMsg?: string
  } | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('pendingAppointment') || localStorage.getItem('pendingAppointment')
      if (stored) {
        const parsed = JSON.parse(stored)
        setBooking(parsed)
        if (parsed.patientName) {
          setCardName(parsed.patientName)
        }
      }
    } catch (err) {
      console.error('Failed to parse pending appointment', err)
    }
  }, [])

  const handlePayNow = async (forceFail = false) => {
    if (!booking) return

    setPaymentState('processing')

    // Simulate payment processing delay (1.5 seconds)
    setTimeout(async () => {
      const isFailed = forceFail || simulateFailure

      const txnId = `PAY_${Date.now()}`
      const paidTimestamp = new Date().toISOString()
      const methodLabel = activeTab === 'upi' 
        ? `UPI (${selectedUpiApp})` 
        : activeTab === 'card' 
        ? `Card (**** ${cardNumber.slice(-4) || '7890'})` 
        : `Net Banking (${selectedBank} - ****${netBankingAccount.slice(-4) || '1234'})`

      const currentFee = Number(booking.fee) || 500

      if (isFailed) {
        const failureDetails = {
          paymentId: txnId,
          paymentMethod: methodLabel,
          amount: currentFee,
          paidAt: paidTimestamp,
          errorMsg: 'Transaction declined by issuer bank or authentication failed.'
        }

        // Log failed payment to backend
        try {
          await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: txnId,
              doctorName: booking.doctorName,
              doctorImage: booking.doctorImage,
              specialization: booking.specialization || booking.specialty,
              patientName: booking.patientName,
              amount: currentFee,
              paymentMethod: methodLabel,
              status: 'Failed',
              failureReason: failureDetails.errorMsg,
              paidAt: paidTimestamp,
              date: booking.date,
              time: booking.time
            })
          })
        } catch (e) {
          console.error('Failed to log payment failure', e)
        }

        setPaymentState('failed')
        setPaymentResult(failureDetails)
      } else {
        // Payment Success -> Save Appointment & Payment to Server
        const confirmedAppointment = {
          ...booking,
          id: Date.now().toString(),
          createdAt: paidTimestamp,
          status: 'Confirmed',
          paymentStatus: 'Paid',
          paymentId: txnId,
          paymentMethod: methodLabel,
          paidAt: paidTimestamp,
          paidAmount: currentFee
        }

        try {
          // 1. Save appointment to API
          await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(confirmedAppointment)
          })

          // 2. Log payment transaction to Payments API
          await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: txnId,
              appointmentId: confirmedAppointment.id,
              doctorName: booking.doctorName,
              doctorImage: booking.doctorImage,
              specialization: booking.specialization || booking.specialty,
              patientName: booking.patientName,
              contact: booking.contact,
              amount: currentFee,
              paymentMethod: methodLabel,
              status: 'Paid',
              paidAt: paidTimestamp,
              date: booking.date,
              time: booking.time
            })
          })

          // 3. Save to localStorage appointments list for client sync
          let localApps: any[] = []
          try {
            const stored = localStorage.getItem('appointments')
            localApps = stored ? JSON.parse(stored) : []
          } catch {
            localApps = []
          }
          localApps.push(confirmedAppointment)
          localStorage.setItem('appointments', JSON.stringify(localApps))

          // Clear pending draft
          sessionStorage.removeItem('pendingAppointment')
          localStorage.removeItem('pendingAppointment')
        } catch (e) {
          console.error('Failed to sync appointment with backend', e)
        }

        setPaymentState('success')
        setPaymentResult({
          paymentId: txnId,
          paymentMethod: methodLabel,
          amount: currentFee,
          paidAt: paidTimestamp
        })
      }
    }, 1500)
  }

  const handlePrintReceipt = () => {
    if (!paymentResult || !booking) return
    printPaymentReceipt({
      id: paymentResult.paymentId,
      doctorName: booking.doctorName,
      specialization: booking.specialization || booking.specialty,
      patientName: booking.patientName,
      age: booking.age,
      contact: booking.contact,
      amount: paymentResult.amount,
      paymentMethod: paymentResult.paymentMethod,
      status: paymentState === 'success' ? 'Paid' : 'Failed',
      paidAt: paymentResult.paidAt,
      date: booking.date,
      time: booking.time,
      failureReason: paymentResult.errorMsg
    })
  }

  // Fallback view if no booking is in progress
  if (!booking && paymentState === 'idle') {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.statusContainer} style={{ marginTop: '3rem' }}>
          <div className={styles.statusCard}>
            <h2 className={styles.statusTitle}>No Active Booking Found</h2>
            <p className={styles.statusSubtitle}>Please select a doctor and date to proceed with payment.</p>
            <Link href="/doctors" className={styles.actionBtnPrimary}>
              Browse Doctors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Processing State
  if (paymentState === 'processing') {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.statusContainer} style={{ marginTop: '4rem' }}>
          <div className={styles.statusCard}>
            <div className={styles.spinner}></div>
            <h2 className={styles.statusTitle} style={{ color: '#0284c7' }}>Processing Payment...</h2>
            <p className={styles.statusSubtitle}>
              Connecting to secure payment gateway. Please do not close or refresh this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success Screen
  if (paymentState === 'success' && paymentResult) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.statusContainer} style={{ marginTop: '2rem' }}>
          <div className={styles.statusCard}>
            <div className={styles.successIconCircle}>✓</div>
            <h2 className={`${styles.statusTitle} ${styles.success}`}>Payment Successful!</h2>
            <p className={styles.statusSubtitle}>Your appointment has been confirmed and booked successfully.</p>

            <div className={styles.receiptBox}>
              <div className={styles.receiptHeader}>Transaction Receipt</div>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Transaction Ref ID</span>
                  <span className={styles.summaryValue} style={{ color: '#0284c7', fontFamily: 'monospace' }}>{paymentResult.paymentId}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Payment Method</span>
                  <span className={styles.summaryValue}>{paymentResult.paymentMethod}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Amount Paid</span>
                  <span className={styles.summaryValue} style={{ color: '#16a34a', fontSize: '1.1rem', fontWeight: 800 }}>₹{paymentResult.amount}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Doctor</span>
                  <span className={styles.summaryValue}>{booking?.doctorName}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Date & Time</span>
                  <span className={styles.summaryValue}>{booking?.date} • {booking?.time}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Patient</span>
                  <span className={styles.summaryValue}>{booking?.patientName}</span>
                </div>
              </div>
            </div>

            <div style={{ margin: '1.25rem 0' }}>
              <button 
                onClick={handlePrintReceipt}
                style={{
                  width: '100%',
                  background: '#f0f9ff',
                  color: '#0284c7',
                  border: '1.5px dashed #0284c7',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                🖨️ Download / Print Official Payment Receipt
              </button>
            </div>

            <div className={styles.actionButtonsRow}>
              <Link href="/dashboard" className={styles.actionBtnPrimary}>
                Go to Dashboard
              </Link>
              <Link href="/history" className={styles.actionBtnSecondary}>
                View History & Receipts
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Failed Screen
  if (paymentState === 'failed' && paymentResult) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.statusContainer} style={{ marginTop: '2rem' }}>
          <div className={styles.statusCard}>
            <div className={styles.failedIconCircle}>✕</div>
            <h2 className={`${styles.statusTitle} ${styles.failed}`}>Payment Failed</h2>
            <p className={styles.statusSubtitle}>{paymentResult.errorMsg}</p>

            <div className={styles.receiptBox}>
              <div className={styles.receiptHeader}>Attempted Transaction Details</div>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Transaction Ref</span>
                  <span className={styles.summaryValue} style={{ color: '#dc2626', fontFamily: 'monospace' }}>{paymentResult.paymentId}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Status</span>
                  <span className={styles.summaryValue} style={{ color: '#dc2626', fontWeight: 700 }}>FAILED</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Attempted Amount</span>
                  <span className={styles.summaryValue}>₹{paymentResult.amount}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Payment Mode</span>
                  <span className={styles.summaryValue}>{paymentResult.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div style={{ margin: '1.25rem 0' }}>
              <button 
                onClick={handlePrintReceipt}
                style={{
                  width: '100%',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1.5px dashed #fca5a5',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                📄 View Attempted Transaction Document
              </button>
            </div>

            <div className={styles.actionButtonsRow}>
              <button onClick={() => setPaymentState('idle')} className={styles.actionBtnPrimary}>
                Try Again
              </button>
              <Link href="/doctors" className={styles.actionBtnSecondary}>
                Back to Doctors
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Payment Form Screen
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Progress Stepper */}
        <div className={styles.stepper}>
          <div className={`${styles.stepItem} ${styles.completed}`}>
            <div className={styles.stepNumber}>✓</div>
            <span>Doctor & Slot</span>
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.stepItem} ${styles.completed}`}>
            <div className={styles.stepNumber}>✓</div>
            <span>Patient Info</span>
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.stepItem} ${styles.active}`}>
            <div className={styles.stepNumber}>3</div>
            <span>Payment</span>
          </div>
        </div>

        <div className={styles.layoutGrid}>
          
          {/* Left Column: Order Summary */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Appointment Summary
            </h2>

            <div className={styles.doctorHeader}>
              <img 
                src={booking?.doctorImage || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"} 
                alt={booking?.doctorName} 
                className={styles.doctorAvatar} 
              />
              <div>
                <h3 className={styles.doctorName}>{booking?.doctorName}</h3>
                <span className={styles.specialtyBadge}>
                  {booking?.specialization || booking?.specialty || 'Specialist'}
                </span>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>
                  {booking?.experience}
                </div>
              </div>
            </div>

            <div className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Appointment Date</span>
                <span className={styles.summaryValue}>{booking?.date}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Time Slot</span>
                <span className={styles.summaryValue}>{booking?.time}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Patient Name</span>
                <span className={styles.summaryValue}>{booking?.patientName}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Contact Number</span>
                <span className={styles.summaryValue}>{booking?.contact}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
              <div className={styles.summaryRow} style={{ marginBottom: '0.5rem' }}>
                <span className={styles.summaryLabel}>Consultation Fee</span>
                <span className={styles.summaryValue}>₹{booking?.fee || 500}</span>
              </div>
              <div className={styles.summaryRow} style={{ marginBottom: '0.5rem' }}>
                <span className={styles.summaryLabel}>Booking & Gateway Fee</span>
                <span className={styles.summaryValue} style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
              </div>
              
              <div className={styles.totalRow}>
                <span>Total Payable Amount</span>
                <span className={styles.totalPrice}>₹{booking?.fee || 500}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Module Form */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              Select Payment Option
            </h2>

            {/* Payment Method Tabs */}
            <div className={styles.tabButtons}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'upi' ? styles.active : ''}`}
                onClick={() => setActiveTab('upi')}
              >
                <span>📱</span> UPI Name
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'card' ? styles.active : ''}`}
                onClick={() => setActiveTab('card')}
              >
                <span>💳</span> Credit Card Number
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'netbanking' ? styles.active : ''}`}
                onClick={() => setActiveTab('netbanking')}
              >
                <span>🏦</span> Net Account Number
              </button>
            </div>

            {/* UPI Option */}
            {activeTab === 'upi' && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
                  Popular UPI Apps
                </div>
                <div className={styles.upiAppsGrid}>
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                    <div 
                      key={app} 
                      className={`${styles.upiAppCard} ${selectedUpiApp === app ? styles.selected : ''}`}
                      onClick={() => setSelectedUpiApp(app)}
                    >
                      {app}
                    </div>
                  ))}
                </div>

                <div className={styles.formGroup}>
                  <label>Enter VPA / UPI ID</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="e.g. mobile@upi or name@okaxis" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Credit / Debit Card Option */}
            {activeTab === 'card' && (
              <div>
                <div className={styles.formGroup}>
                  <label>Cardholder Name</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Full Name as on card" 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="4532 0000 0000 0000" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    required
                  />
                </div>

                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Expiry Date</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder="MM/YY" 
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>CVV / CVC</label>
                    <input 
                      type="password" 
                      className={styles.formInput} 
                      placeholder="123" 
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking Option */}
            {activeTab === 'netbanking' && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
                  Popular Net Banking Options
                </div>
                <div className={styles.bankGrid}>
                  {['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB'].map(bank => (
                    <div 
                      key={bank} 
                      className={`${styles.bankCard} ${selectedBank === bank ? styles.selected : ''}`}
                      onClick={() => setSelectedBank(bank)}
                    >
                      {bank}
                    </div>
                  ))}
                </div>

                <div className={styles.formGroup}>
                  <label>Select Other Bank</label>
                  <select 
                    className={styles.formInput}
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="" disabled>Select your bank...</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Bank">Kotak Mahindra Bank</option>
                    <option value="PNB">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                  </select>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
                  <label>Net Banking Account Number</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Enter your account number" 
                    value={netBankingAccount}
                    onChange={(e) => setNetBankingAccount(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Demo Controls for Testing Success / Failure */}
            <div className={styles.testToggleArea}>
              <span className={styles.testToggleLabel}>Demo Mode: Simulate Failure Test</span>
              <button 
                type="button"
                onClick={() => setSimulateFailure(!simulateFailure)}
                style={{
                  background: simulateFailure ? '#ef4444' : '#cbd5e1',
                  color: simulateFailure ? 'white' : '#334155',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {simulateFailure ? 'Failure Simulation ON' : 'Failure Simulation OFF'}
              </button>
            </div>

            {/* Pay Button */}
            <button 
              type="button"
              className={styles.payBtn}
              onClick={() => handlePayNow(false)}
            >
              Pay ₹{booking?.fee || 500} & Confirm Appointment
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              256-Bit SSL Encrypted & 100% Secure Payment
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
