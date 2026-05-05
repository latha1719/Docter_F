'use client'

import React, { useState, useEffect } from 'react'

type Doctor = {
  id: string;
  name: string;
  specialty?: string;
  specialization?: string;
  status: string;
  appointments: number;
  experience: string;
  fee: number;
  image: string;
}

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // New doctor form state
  const [newName, setNewName] = useState('')
  const [newSpecialization, setNewSpecialization] = useState('')
  const [newExperience, setNewExperience] = useState('')
  const [newFee, setNewFee] = useState(500)
  const [newImage, setNewImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors')
      const data = await res.json()
      setDoctors(data)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently remove this doctor?')) {
      try {
        const res = await fetch(`/api/doctors?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setDoctors(doctors.filter(d => d.id !== id))
        }
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          specialization: newSpecialization,
          experience: newExperience,
          fee: newFee,
          image: newImage
        })
      })

      if (res.ok) {
        const addedDoctor = await res.json()
        setDoctors([...doctors, addedDoctor])
        setIsModalOpen(false)
        setNewName('')
        setNewSpecialization('')
        setNewExperience('')
        setNewFee(500)
        setNewImage('')
      }
    } catch (error) {
      console.error('Error adding doctor:', error)
      alert('Failed to add doctor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.specialization || doc.specialty || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="management-wrapper">
      <div className="management-header">
        <div>
          <h2>Doctor Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your medical staff and consultation fees.</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Add New Doctor
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search doctors by name or specialty..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container card">
        <table>
          <thead>
            <tr>
              <th>Doctor Profile</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map(doctor => (
                <tr key={doctor.id}>
                  <td className="doctor-info">
                    {doctor.image ? (
                      <img src={doctor.image} alt={doctor.name} className="doctor-avatar-img" />
                    ) : (
                      <div className="doctor-avatar">{doctor.name.charAt(4)}</div>
                    )}
                    <span>{doctor.name}</span>
                  </td>
                  <td>{doctor.specialization || doctor.specialty}</td>
                  <td>{doctor.experience}</td>
                  <td style={{ fontWeight: 600 }}>₹{doctor.fee}</td>
                  <td>
                    <span className={`status-pill ${doctor.status.toLowerCase().replace(' ', '-')}`}>
                      {doctor.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="action-btn edit">Update</button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(doctor.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No doctors found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Add New Doctor</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddDoctor}>
              <div className="form-group">
                <label>Profile Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="upload-btn-wrapper">
                    <button className="upload-btn">Choose Photo</button>
                    <input type="file" accept="image/*" onChange={handleImageUpload} required />
                  </div>
                  {newImage && <img src={newImage} alt="Preview" className="image-preview" />}
                </div>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Sneha Verma" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cardiologist" 
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Experience</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10+ years" 
                    value={newExperience}
                    onChange={(e) => setNewExperience(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Consultation Fee (₹)</label>
                <input 
                  type="number" 
                  placeholder="500" 
                  value={newFee}
                  onChange={(e) => setNewFee(Number(e.target.value))}
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ background: '#3b82f6', color: 'white' }}>
                  {isSubmitting ? 'Processing...' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .management-wrapper { display: flex; flex-direction: column; gap: 1.5rem; }
        .management-header { display: flex; justify-content: space-between; align-items: center; }
        .management-header h2 { font-size: 1.5rem; color: #0f172a; margin: 0; }
        
        .toolbar { display: flex; gap: 1rem; align-items: center; }
        .search-box { 
          position: relative; 
          flex: 1; 
          max-width: 500px;
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.25rem 1rem;
        }
        .search-box svg { color: #94a3b8; margin-right: 0.75rem; }
        .search-box input { border: none; padding: 0.6rem 0; width: 100%; outline: none; }

        .add-btn { background: #3b82f6; color: white; padding: 0.6rem 1.2rem; border-radius: 0.75rem; border: none; font-weight: 600; cursor: pointer; }

        .card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1rem; font-size: 0.875rem; color: #64748b; background: #f8fafc; font-weight: 600; }
        td { padding: 1rem; font-size: 0.875rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; }

        .doctor-info { display: flex; align-items: center; gap: 0.75rem; }
        .doctor-avatar, .doctor-avatar-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .doctor-avatar { background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; font-weight: 700; }

        .status-pill { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
        .status-pill.active { background: #ecfdf5; color: #10b981; }
        .status-pill.on-leave { background: #fef2f2; color: #ef4444; }

        .actions { display: flex; gap: 0.5rem; }
        .action-btn { padding: 0.4rem 0.8rem; border-radius: 0.6rem; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 0.8rem; font-weight: 500; }
        .action-btn.edit:hover { background: #f0f9ff; border-color: #3b82f6; color: #3b82f6; }
        .action-btn.delete:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #475569; font-size: 0.9rem; }
        input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; }

        .upload-btn-wrapper { position: relative; overflow: hidden; display: inline-block; }
        .upload-btn { border: 2px dashed #e2e8f0; color: #64748b; background-color: #f8fafc; padding: 8px 20px; border-radius: 8px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
        .upload-btn-wrapper input[type=file] { font-size: 100px; position: absolute; left: 0; top: 0; opacity: 0; }
        .image-preview { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
        .cancel-btn { background: #f1f5f9; color: #64748b; padding: 0.6rem 1.2rem; border-radius: 0.75rem; border: none; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  )
}

