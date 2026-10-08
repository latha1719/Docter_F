'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './records.module.css'

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
  doctorImage: string
  patientName: string
  age: string
  date: string
  diagnosis: string
  notes: string
  medicines: Medicine[]
  status: string
  createdAt?: string
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/prescriptions')
      if (res.ok) {
        const data: Prescription[] = await res.json()
        setRecords(data)
      }
    } catch (err) {
      console.error('Failed to fetch medical records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleDownloadPrescription = (record: Prescription) => {
    // Open printable prescription layout & PDF generator
    const printWindow = window.open('', '_blank', 'width=850,height=950')
    if (!printWindow) return

    const formattedAge = record.age 
      ? (String(record.age).toLowerCase().includes('year') || String(record.age).toLowerCase().includes('yr') ? record.age : `${record.age} Years`) 
      : 'N/A'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical_Prescription_${record.id}_${record.patientName.replace(/\s+/g, '_')}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20mm; color: #0f172a; line-height: 1.6; background: #fff; }
          .prescription-paper { border: 2px solid #0284c7; border-radius: 12px; padding: 30px; position: relative; max-width: 750px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: 800; color: #0284c7; letter-spacing: 0.5px; }
          .sub-logo { font-size: 13px; color: #64748b; font-weight: 600; margin-top: 2px; }
          .hosp-info { text-align: right; font-size: 12px; color: #64748b; line-height: 1.5; }
          
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; }
          .meta-group { display: flex; flex-direction: column; }
          .meta-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
          .meta-value { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px; }
          .meta-value.highlight { color: #0284c7; font-family: monospace; }
          
          .diagnosis-banner { background: #f0f9ff; border-left: 5px solid #0284c7; border-radius: 6px; padding: 14px 18px; margin-bottom: 25px; }
          .diagnosis-title { font-size: 12px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; }
          .diagnosis-text { font-size: 16px; font-weight: 700; color: #0c4a6e; margin-top: 4px; }
          
          .rx-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
          .rx-symbol { font-size: 36px; font-weight: 900; color: #0284c7; font-family: serif; line-height: 1; }
          .rx-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
          
          .med-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .med-table th { background: #0284c7; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .med-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; }
          .med-table tr:nth-child(even) td { background: #fafafa; }
          
          .notes-card { background: #faf5ff; border-left: 5px solid #a855f7; border-radius: 6px; padding: 14px 18px; margin-bottom: 30px; }
          .notes-title { font-size: 12px; font-weight: 800; color: #7e22ce; text-transform: uppercase; letter-spacing: 0.5px; }
          .notes-text { font-size: 14px; color: #581c87; margin-top: 4px; font-weight: 600; line-height: 1.5; }
          
          .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; }
          .stamp-box { border: 2px dashed #0284c7; color: #0284c7; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; display: inline-block; margin-top: 8px; }
          
          .print-btn-bar { margin-top: 25px; text-align: center; }
          .print-btn { background: #0284c7; color: white; border: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(2,132,199,0.3); }

          @media print {
            body { padding: 0; background: #fff; }
            .prescription-paper { border: none; box-shadow: none; padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="prescription-paper">
          
          <div class="header">
            <div>
              <div class="logo">🏥 YASH HOSPITAL</div>
              <div class="sub-logo">Official Medical Consultation & Prescription Record</div>
            </div>
            <div class="hosp-info">
              <div>123 Healthcare Blvd, Medical Zone</div>
              <div>Emergency: +91 1800-200-8888</div>
              <div>www.yashhospital.com</div>
            </div>
          </div>

          <!-- Doctor & Patient Meta Grid -->
          <div class="grid-2">
            <div>
              <div class="meta-group">
                <span class="meta-label">Attending Doctor</span>
                <span class="meta-value">${record.doctorName}</span>
              </div>
              <div class="meta-group" style="margin-top: 10px;">
                <span class="meta-label">Specialization</span>
                <span class="meta-value" style="color: #0284c7;">${record.doctorSpecialization}</span>
              </div>
            </div>

            <div>
              <div class="meta-group">
                <span class="meta-label">Patient Name</span>
                <span class="meta-value">${record.patientName} (${formattedAge})</span>
              </div>
              <div class="meta-group" style="margin-top: 10px;">
                <span class="meta-label">Prescription Date & Ref ID</span>
                <span class="meta-value highlight">${record.date} • ${record.id}</span>
              </div>
            </div>
          </div>

          <!-- Clinical Diagnosis -->
          <div class="diagnosis-banner">
            <div class="diagnosis-title">Clinical Diagnosis</div>
            <div class="diagnosis-text">${record.diagnosis}</div>
          </div>

          <!-- Rx Symbol Header -->
          <div class="rx-header">
            <span class="rx-symbol">℞</span>
            <span class="rx-title">Prescribed Medications</span>
          </div>

          <!-- Medicines Table -->
          <table class="med-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${record.medicines.map(m => `
                <tr>
                  <td style="font-weight: 700; color: #0f172a;">${m.name}</td>
                  <td style="font-weight: 600;">${m.dosage}</td>
                  <td>${m.frequency}</td>
                  <td style="font-weight: 600;">${m.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Doctor's Advice & Notes -->
          ${record.notes ? `
            <div class="notes-card">
              <div class="notes-title">Doctor's Advice & Clinical Instructions</div>
              <div class="notes-text">${record.notes}</div>
            </div>
          ` : ''}

          <!-- Official Stamp & Signature Footer -->
          <div class="footer">
            <div>
              <div>Verified Electronic Medical Prescription</div>
              <div>Yash Hospital Healthcare Management Information System</div>
            </div>
            <div style="text-align: right;">
              <div>Digitally Signed by</div>
              <div style="font-weight: 800; color: #0f172a; margin-top: 2px;">${record.doctorName}</div>
              <div class="stamp-box">VERIFIED Rx</div>
            </div>
          </div>

          <!-- Print / Save PDF Controls -->
          <div class="no-print print-btn-bar">
            <button onclick="window.print()" class="print-btn">
              🖨️ Download / Save Prescription as PDF
            </button>
          </div>

        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const filteredRecords = records.filter(r => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      r.doctorName.toLowerCase().includes(term) ||
      r.patientName.toLowerCase().includes(term) ||
      r.diagnosis.toLowerCase().includes(term) ||
      r.date.includes(term)
    )
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Medical Records & Prescriptions</h1>
          <p className={styles.subtitle}>View your clinical diagnoses, doctor prescriptions, and health history.</p>
        </div>
        
        <div className={styles.searchWrapper}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search diagnosis, doctor or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <div style={{ color: '#0284c7', fontWeight: 600 }}>Loading medical records...</div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <h2 style={{ fontSize: '1.25rem', marginTop: '1rem', color: '#334155' }}>No Medical Records Found</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {searchTerm ? "No prescriptions match your search term." : "Your prescriptions and clinical notes from doctors will appear here."}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredRecords.map((record) => (
            <div key={record.id} className={styles.card}>
              
              <div className={styles.cardHeader}>
                <div className={styles.doctorInfo}>
                  <img 
                    src={record.doctorImage || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"} 
                    alt={record.doctorName} 
                    className={styles.doctorImg} 
                  />
                  <div>
                    <h3 className={styles.doctorName}>{record.doctorName}</h3>
                    <span className={styles.specialtyTag}>{record.doctorSpecialization}</span>
                  </div>
                </div>

                <div className={styles.dateBadge}>
                  📅 {record.date}
                </div>
              </div>

              {/* Diagnosis */}
              <div className={styles.diagnosisBox}>
                <div className={styles.sectionLabel}>Clinical Diagnosis</div>
                <div className={styles.diagnosisText}>{record.diagnosis}</div>
              </div>

              {/* Prescribed Medicines */}
              <div className={styles.medicinesSection}>
                <div className={styles.sectionLabel}>Rx • Prescribed Medicines ({record.medicines.length})</div>
                <table className={styles.medTable}>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.medicines.map((med, idx) => (
                      <tr key={idx}>
                        <td className={styles.medName}>{med.name}</td>
                        <td>{med.dosage}</td>
                        <td>{med.frequency}</td>
                        <td>{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Doctor's Notes */}
              {record.notes && (
                <div className={styles.notesBox}>
                  <div className={styles.sectionLabel} style={{ color: '#7e22ce' }}>Doctor's Advice & Instructions</div>
                  <div className={styles.notesText}>{record.notes}</div>
                </div>
              )}

              {/* Footer Actions */}
              <div className={styles.cardFooter}>
                <div className={styles.patientName}>
                  Patient: <strong>{record.patientName}</strong> ({record.age ? (String(record.age).toLowerCase().includes('year') || String(record.age).toLowerCase().includes('yr') ? record.age : `${record.age} Yrs`) : 'N/A'})
                </div>

                <button 
                  onClick={() => handleDownloadPrescription(record)}
                  className={styles.downloadBtn}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download Prescription
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
