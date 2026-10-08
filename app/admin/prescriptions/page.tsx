'use client'

import React, { useState, useEffect } from 'react'

type Medicine = {
  name: string
  dosage: string
  frequency: string
  duration: string
}

type Prescription = {
  id: string
  appointmentId?: string
  doctorName: string
  doctorSpecialization: string
  patientName: string
  age: string
  date: string
  diagnosis: string
  notes: string
  medicines: Medicine[]
  status: string
}

export default function AdminPrescriptionManagement() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('')
  const [doctorName, setDoctorName] = useState('Dr. Vikram Malhotra')
  const [doctorSpecialization, setDoctorSpecialization] = useState('Cardiology')
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days' }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resRx, resApp] = await Promise.all([
        fetch('/api/prescriptions'),
        fetch('/api/appointments')
      ])
      if (resRx.ok) {
        const rxData = await resRx.json()
        setPrescriptions(rxData)
      }
      if (resApp.ok) {
        const appData = await resApp.json()
        setAppointments(appData)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAppointment = (appId: string) => {
    setSelectedAppointmentId(appId)
    const app = appointments.find(a => a.id === appId)
    if (app) {
      setPatientName(app.patientName || app.patient || '')
      setDoctorName(app.doctorName || 'Dr. Specialist')
      setAge(app.age || '')
      setDate(app.date || new Date().toISOString().split('T')[0])
    }
  }

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '1 Tablet', frequency: 'Once daily', duration: '7 Days' }])
  }

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines]
    updated[index][field] = value
    setMedicines(updated)
  }

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientName || !diagnosis) {
      alert('Please fill patient name and clinical diagnosis!')
      return
    }

    const validMedicines = medicines.filter(m => m.name.trim() !== '')
    if (validMedicines.length === 0) {
      alert('Please add at least one prescribed medicine!')
      return
    }

    const newRx = {
      id: `RX_${Date.now()}`,
      appointmentId: selectedAppointmentId || `APP_${Date.now()}`,
      doctorName,
      doctorSpecialization,
      patientName,
      age,
      date,
      diagnosis,
      notes,
      medicines: validMedicines,
      status: 'Active'
    }

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRx)
      })

      if (res.ok) {
        const saved = await res.json()
        setPrescriptions([saved, ...prescriptions])
        setIsModalOpen(false)
        resetForm()
      } else {
        alert('Failed to save prescription')
      }
    } catch (err) {
      console.error('Error saving prescription:', err)
      alert('Error saving prescription')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this medical record?')) {
      try {
        const res = await fetch(`/api/prescriptions?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setPrescriptions(prescriptions.filter(p => p.id !== id))
        }
      } catch (err) {
        console.error('Delete error:', err)
      }
    }
  }

  const resetForm = () => {
    setSelectedAppointmentId('')
    setPatientName('')
    setDiagnosis('')
    setNotes('')
    setMedicines([{ name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days' }])
  }

  return (
    <div className="rx-management">
      <div className="header-row">
        <div>
          <h2>Prescription & Medical Records Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Issue clinical diagnoses and digital prescriptions for patients.</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Create New Prescription
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading records...</div>
        ) : prescriptions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No prescriptions found. Click Create New Prescription to add one.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rx ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Medicines</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(rx => (
                <tr key={rx.id}>
                  <td className="rx-id">#{rx.id}</td>
                  <td className="font-bold">{rx.patientName} ({rx.age} yrs)</td>
                  <td>{rx.doctorName}</td>
                  <td>{rx.date}</td>
                  <td className="diagnosis-cell">{rx.diagnosis}</td>
                  <td>
                    <span className="med-count-badge">
                      {rx.medicines ? rx.medicines.length : 0} Items
                    </span>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(rx.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Creating Prescription */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Patient Prescription</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">✕</button>
            </div>

            <form onSubmit={handleCreatePrescription}>
              
              <div className="form-group">
                <label>Select Patient Appointment (Optional)</label>
                <select 
                  className="input" 
                  value={selectedAppointmentId}
                  onChange={(e) => handleSelectAppointment(e.target.value)}
                >
                  <option value="">-- Choose Existing Consultation --</option>
                  {appointments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.patientName || a.patient} - {a.doctorName} ({a.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Patient Name *</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g. Hari Kumar" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Patient Age</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g. 25" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Attending Doctor</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Consultation Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Clinical Diagnosis *</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Acute Bronchitis & Viral Fever" 
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required 
                />
              </div>

              {/* Dynamic Medicines Adder */}
              <div className="medicines-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 700, color: '#334155' }}>Prescribed Medicines *</label>
                  <button type="button" onClick={handleAddMedicineRow} className="add-med-btn">
                    + Add Medicine
                  </button>
                </div>

                {medicines.map((med, idx) => (
                  <div key={idx} className="med-row">
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Medicine Name (e.g. Paracetamol 500mg)" 
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      required
                    />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Dosage (1 Tab)" 
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Frequency (Twice daily)" 
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Duration (5 Days)" 
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                    />
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMedicineRow(idx)} className="remove-med-btn">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Doctor's Advice & Follow-up Notes</label>
                <textarea 
                  className="input" 
                  rows={3} 
                  placeholder="Take after meals, maintain rest and drink plenty of fluids."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="submit-btn">Issue Prescription</button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .rx-management { display: flex; flex-direction: column; gap: 1.5rem; }
        .header-row { display: flex; justify-content: space-between; align-items: center; }
        .header-row h2 { font-size: 1.4rem; color: #0f172a; margin: 0; }
        
        .add-btn { background: #0284c7; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
        
        .card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 0.8rem 1rem; font-size: 0.8rem; color: #64748b; background: #f8fafc; font-weight: 700; text-transform: uppercase; }
        td { padding: 0.9rem 1rem; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .rx-id { font-family: monospace; font-weight: 700; color: #0284c7; }
        .font-bold { font-weight: 700; color: #0f172a; }
        .diagnosis-cell { font-weight: 600; color: #0369a1; }
        .med-count-badge { background: #eff6ff; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; }
        .delete-btn { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal-content { background: white; border-radius: 20px; width: 100%; max-width: 750px; max-height: 90vh; overflow-y: auto; padding: 2rem; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h3 { margin: 0; font-size: 1.3rem; color: #0f172a; }
        .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
        
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.4rem; }
        .input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; outline: none; }
        .input:focus { border-color: #0284c7; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .medicines-section { background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
        .add-med-btn { background: #eff6ff; color: #0284c7; border: 1px solid #bfdbfe; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
        .med-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
        .remove-med-btn { background: #fee2e2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        
        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
        .cancel-btn { background: #f1f5f9; color: #64748b; border: none; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .submit-btn { background: #0284c7; color: white; border: none; padding: 0.65rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  )
}
