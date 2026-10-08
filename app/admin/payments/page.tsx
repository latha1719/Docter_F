'use client'

import React, { useState, useEffect } from 'react'
import { printPaymentReceipt } from '../../components/printReceipt'

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

export default function AdminPaymentsManagement() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Failed' | 'Refunded'>('all')

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/payments')
      if (res.ok) {
        const data: PaymentRecord[] = await res.json()
        setPayments(data)
      }
    } catch (err) {
      console.error('Failed to load payment transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleToggleStatus = async (paymentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Paid' ? 'Refunded' : 'Paid'
    if (!confirm(`Are you sure you want to change transaction status of ${paymentId} to "${newStatus}"?`)) return

    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: newStatus } : p))
  }

  const handlePrint = (p: PaymentRecord) => {
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

  // Calculate Metrics
  const paidPayments = payments.filter(p => p.status === 'Paid' || p.status === 'Confirmed')
  const totalRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const failedCount = payments.filter(p => p.status === 'Failed').length
  const refundedCount = payments.filter(p => p.status === 'Refunded').length

  const filteredPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status.toLowerCase() !== statusFilter.toLowerCase()) return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      p.id.toLowerCase().includes(term) ||
      p.doctorName.toLowerCase().includes(term) ||
      p.patientName.toLowerCase().includes(term) ||
      p.paymentMethod.toLowerCase().includes(term)
    )
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Payment & Revenue Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>Track all hospital consultation fees, payment gate transactions, and digital e-receipts.</p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Collected Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>₹{totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>From {paidPayments.length} successful transactions</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Successful Payments</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>{paidPayments.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Completed consultations</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Failed Payment Attempts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>{failedCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Bank / Auth decline</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Refunded Transactions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c2410c', marginTop: '0.2rem' }}>{refundedCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Cancelled bookings</div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'Paid', 'Failed', 'Refunded'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: statusFilter === filter ? '#0f172a' : 'white',
                  color: statusFilter === filter ? 'white' : '#64748b'
                }}
              >
                {filter === 'all' ? `All (${payments.length})` : `${filter} (${payments.filter(p => p.status.toLowerCase() === filter.toLowerCase()).length})`}
              </button>
            ))}
          </div>

          <input 
            type="text"
            placeholder="Search Txn ID, doctor, patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '0.9rem',
              minWidth: '280px',
              outline: 'none'
            }}
          />
        </div>

        {/* Payments Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Transaction Ref ID</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Doctor & Specialty</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Patient Name</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Method</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading payment records...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No transactions found.</td>
                </tr>
              ) : (
                filteredPayments.map(p => {
                  const isPaid = p.status === 'Paid' || p.status === 'Confirmed'
                  const isRefunded = p.status === 'Refunded'

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.9rem 1rem', fontFamily: 'monospace', fontWeight: 800, color: '#0284c7' }}>
                        {p.id}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        {p.doctorName}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>
                        {p.patientName}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 800, color: isPaid ? '#16a34a' : isRefunded ? '#c2410c' : '#0f172a' }}>
                        ₹{p.amount}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span 
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            background: isPaid ? '#f0fdf4' : isRefunded ? '#fff7ed' : '#fef2f2',
                            color: isPaid ? '#16a34a' : isRefunded ? '#c2410c' : '#dc2626',
                            border: `1px solid ${isPaid ? '#bbf7d0' : isRefunded ? '#ffedd5' : '#fecaca'}`
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handlePrint(p)}
                            style={{
                              background: '#f0f9ff',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            🖨️ Receipt
                          </button>
                          <button
                            onClick={() => handleToggleStatus(p.id, p.status)}
                            style={{
                              background: '#f8fafc',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {isPaid ? '↩ Refund' : 'Mark Paid'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
