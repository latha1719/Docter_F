"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./doctors.module.css";
import bookStyles from "../book/[id]/book.module.css";

type Doctor = {
  id: string;
  name: string;
  specialization?: string;
  specialty?: string;
  availableDates?: string[];
  image: string;
  experience: string;
  fee: number;
  rating?: number;
  reviewCount?: number;
};

type Review = {
  id: string;
  doctorName: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
};

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorReviews, setDoctorReviews] = useState<Review[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [problem, setProblem] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fallback avatar for broken images
  const fallbackAvatar = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

  const amTimeSlots = [
    "09:00 am - 09:15 am",
    "09:15 am - 09:30 am",
    "09:30 am - 09:45 am",
    "09:45 am - 10:00 am",
    "10:00 am - 10:15 am",
    "10:15 am - 10:30 am",
    "10:30 am - 10:45 am",
    "10:45 am - 11:00 am",
    "11:00 am - 11:15 am",
    "11:15 am - 11:30 am",
    "11:30 am - 11:45 am",
    "11:45 am - 12:00 pm",
  ];

  const pmTimeSlots = [
    "12:00 pm - 12:15 pm",
    "12:15 pm - 12:30 pm",
    "12:30 pm - 12:45 pm",
    "12:45 pm - 01:00 pm",
    "01:00 pm - 01:15 pm",
    "01:15 pm - 01:30 pm",
    "02:00 pm - 02:15 pm",
    "02:15 pm - 02:30 pm",
    "03:00 pm - 03:15 pm",
    "03:15 pm - 03:30 pm",
    "04:00 pm - 04:15 pm",
    "04:15 pm - 04:30 pm",
    "05:00 pm - 05:15 pm",
    "05:15 pm - 05:30 pm",
  ];

  const nightTimeSlots = [
    "06:00 pm - 06:15 pm",
    "06:15 pm - 06:30 pm",
    "06:30 pm - 06:45 pm",
    "06:45 pm - 07:00 pm",
    "07:00 pm - 07:15 pm",
    "07:15 pm - 07:30 pm",
    "07:30 pm - 07:45 pm",
    "07:45 pm - 08:00 pm",
    "08:00 pm - 08:15 pm",
    "08:15 pm - 08:30 pm",
    "08:30 pm - 08:45 pm",
    "08:45 pm - 09:00 pm",
    "09:00 pm - 09:15 pm",
    "09:15 pm - 09:30 pm",
    "09:30 pm - 09:45 pm",
    "09:45 pm - 10:00 pm",
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch reviews when selectedDoctor changes
  useEffect(() => {
    if (!selectedDoctor) {
      setDoctorReviews([]);
      return;
    }
    const fetchDoctorReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?doctorId=${selectedDoctor.id}&doctorName=${encodeURIComponent(selectedDoctor.name)}`);
        if (res.ok) {
          const revs = await res.json();
          setDoctorReviews(revs);
        }
      } catch (e) {
        console.error("Failed to load reviews:", e);
      }
    };
    fetchDoctorReviews();
  }, [selectedDoctor]);

  const router = useRouter();

  const handleConfirm = () => {
    if (!patientName || !age || !contact || !problem || !selectedDate || !selectedTime) {
      alert("Please fill all patient and schedule details!");
      return;
    }

    const pendingAppointment = {
      doctorId: selectedDoctor?.id,
      doctorName: selectedDoctor?.name || "Unknown Doctor",
      doctorImage: selectedDoctor?.image,
      specialization: selectedDoctor?.specialization || selectedDoctor?.specialty,
      experience: selectedDoctor?.experience || "N/A",
      fee: selectedDoctor?.fee || 500,
      date: selectedDate,
      time: selectedTime,
      patientName,
      age,
      contact,
      problem,
    };

    sessionStorage.setItem("pendingAppointment", JSON.stringify(pendingAppointment));
    localStorage.setItem("pendingAppointment", JSON.stringify(pendingAppointment));

    router.push("/payment");
  };

  if (selectedDoctor) {
    return (
      <div className={bookStyles.pageWrapper}>
        <div className={bookStyles.bookingCard} style={{ maxWidth: '750px' }}>
          <button 
            onClick={() => setSelectedDoctor(null)}
            className={bookStyles.backBtn}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1.5rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Doctors
          </button>

          <div className={bookStyles.doctorHeader}>
            <div className={styles.imageWrapper} style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem', borderRadius: '50%', border: '3px solid #eff6ff' }}>
              <img 
                src={selectedDoctor.image} 
                alt={selectedDoctor.name} 
                className={styles.doctorImage} 
                style={{ borderRadius: '50%' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackAvatar;
                }}
              />
            </div>
            <div className={bookStyles.doctorInfo} style={{ textAlign: 'center' }}>
              <h2 className={styles.docName}>{selectedDoctor.name}</h2>
              <div className={styles.specializationLabel} style={{ display: 'inline-block' }}>
                {selectedDoctor.specialization || selectedDoctor.specialty || 'Specialist'}
              </div>
              <div className={styles.experienceLabel} style={{ justifyContent: 'center', margin: '0.5rem 0' }}>
                {selectedDoctor.experience}
              </div>

              {/* Star Rating Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem' }}>
                ⭐ {selectedDoctor.rating || 4.8}
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>
                  ({selectedDoctor.reviewCount || 95} Patient Reviews)
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div className={bookStyles.formGroup}>
              <label>Select Date</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
              />
            </div>

            <div className={bookStyles.formGroup}>
              <label>Select Time Slot</label>
              <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                <option value="" disabled>Choose a slot</option>
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

            <div className={bookStyles.formGroup}>
              <label>Patient Details</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <div className={bookStyles.formGroup}>
              <input
                type="tel"
                placeholder="Contact Number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            <div className={bookStyles.formGroup}>
              <textarea
                placeholder="Describe your health problem..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
              ></textarea>
            </div>

            <div className={bookStyles.paymentSection}>
              <h3>Consultation Fee</h3>
              <div className={bookStyles.consultationFee}>
                <span>Total Amount Payable</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.2rem' }}>₹{selectedDoctor.fee || 500}</span>
              </div>
            </div>

            <button 
              onClick={handleConfirm} 
              className={bookStyles.submitBtn}
            >
              Proceed to Payment →
            </button>
          </div>

          {/* Patient Reviews List Section */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💬 Patient Reviews & Ratings ({doctorReviews.length})
            </h3>

            {doctorReviews.length === 0 ? (
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No written patient reviews yet. Be the first to leave a review after your appointment!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {doctorReviews.map((rev) => (
                  <div key={rev.id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{rev.patientName}</div>
                      <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '0.4rem' }}>
                      "{rev.comment}"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Verified Consultation • {rev.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Our Medical Specialists</h1>
        <p className={styles.pageSubtitle}>
          Expertly qualified doctors across 15+ specialties. View ratings, patient reviews, and book your consultation with confidence.
        </p>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p style={{ color: '#6b7280', fontWeight: 500, marginTop: '1rem' }}>Finding specialists...</p>
        </div>
      ) : (
        <div className={styles.doctorGrid}>
          {doctors.slice(0, 15).map((doc) => (
            <div
              key={doc.id}
              className={styles.doctorCard}
              onClick={() => {
                setSelectedDoctor(doc);
                setSelectedDate("");
                setSelectedTime("");
              }}
            >
              <div className={styles.imageWrapper}>
                <img 
                  src={doc.image} 
                  alt={doc.name} 
                  className={styles.doctorImage} 
                  loading={doctors.indexOf(doc) === 0 ? "eager" : "lazy"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackAvatar;
                  }}
                />
              </div>
              <h3 className={styles.docName}>{doc.name}</h3>
              <div className={styles.specializationLabel}>
                {doc.specialization || doc.specialty || 'Specialist'}
              </div>
              <div className={styles.experienceLabel}>
                {doc.experience}
              </div>

              {/* Consultation Fee & Star Rating Badge on Card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 800, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.2rem 0.65rem', borderRadius: '6px' }}>
                  Fee: ₹{doc.fee || 500}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>
                  ⭐ {doc.rating || 4.8} <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>({doc.reviewCount || 95})</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}