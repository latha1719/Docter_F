'use client'

import React, { useState, useEffect } from 'react'

type Review = {
  id: string
  doctorId?: string
  doctorName: string
  patientName: string
  rating: number
  comment: string
  date: string
  createdAt?: string
}

export default function AdminReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data: Review[] = await res.json()
        setReviews(data)
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDeleteReview = async (id: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete the review by ${patientName}?`)) return

    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id))
      } else {
        alert('Failed to delete review')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting review')
    }
  }

  // Calculate Metrics
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviews).toFixed(1)
    : '4.8'

  const fiveStarCount = reviews.filter(r => Number(r.rating) === 5).length
  const lowRatingCount = reviews.filter(r => Number(r.rating) <= 2).length

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter !== 'all' && Number(r.rating) !== ratingFilter) return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      r.doctorName.toLowerCase().includes(term) ||
      r.patientName.toLowerCase().includes(term) ||
      r.comment.toLowerCase().includes(term)
    )
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Doctor Reviews & Feedback Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>Monitor patient feedback, star ratings, and moderate written reviews across doctors.</p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Patient Reviews</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>{totalReviews}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Submitted across all specialists</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Hospital Satisfaction Score</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>⭐ {avgRating} / 5.0</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Average star rating</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>5-Star Excellent Ratings</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>{fiveStarCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Top rated consultations</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Low Rating Alerts (1-2 Stars)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>{lowRatingCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Flagged for quality check</div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setRatingFilter('all')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: ratingFilter === 'all' ? '#0f172a' : 'white',
                color: ratingFilter === 'all' ? 'white' : '#64748b'
              }}
            >
              All Stars ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map(star => (
              <button
                key={star}
                onClick={() => setRatingFilter(star)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: ratingFilter === star ? '#f59e0b' : 'white',
                  color: ratingFilter === star ? 'white' : '#64748b'
                }}
              >
                {star} ★ ({reviews.filter(r => Number(r.rating) === star).length})
              </button>
            ))}
          </div>

          <input 
            type="text"
            placeholder="Search doctor, patient or review..."
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

        {/* Reviews Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Doctor Name</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Patient Name</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Rating</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Patient Comment</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading reviews...</td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No reviews found matching your search.</td>
                </tr>
              ) : (
                filteredReviews.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                      {r.doctorName}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: '#334155' }}>
                      {r.patientName}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.95rem' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.88rem', color: '#475569', maxWidth: '350px' }}>
                      "{r.comment}"
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                      {r.date}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteReview(r.id, r.patientName)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fee2e2',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Delete Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
