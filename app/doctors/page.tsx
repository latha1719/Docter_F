"use client";
import { useState, useEffect } from "react";
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
};

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [problem, setProblem] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  // Fallback avatar for broken images
  const fallbackAvatar = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

  const timeSlots = [
    "12:00 pm - 12:15 pm",
    "12:15 pm - 12:30 pm",
    "12:30 pm - 12:45 pm",
    "12:45 pm - 01:00 pm",
    "01:00 pm - 01:15 pm",
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

  const handleConfirm = async () => {
    if (!patientName || !age || !contact || !problem || !selectedDate || !selectedTime || !paymentMethod) {
      alert("Please fill all details!");
      return;
    }

    setIsBooking(true);

    const newAppointment = {
      doctorName: selectedDoctor?.name || "Unknown Doctor",
      doctorImage: selectedDoctor?.image,
      experience: selectedDoctor?.experience || "N/A",
      fee: selectedDoctor?.fee || 0,
      date: selectedDate,
      time: selectedTime,
      patientName: patientName,
      age,
      contact,
      problem,
      paymentMethod,
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppointment),
      });

      if (!res.ok) throw new Error("Failed to book appointment");

      alert(
        `Appointment booked!\nDate: ${selectedDate}\nTime: ${selectedTime}\nPatient: ${patientName}`
      );

      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedTime("");
      setPatientName("");
      setAge("");
      setContact("");
      setProblem("");
      setPaymentMethod("");
    } catch (e) {
      console.error("Could not save appointment", e);
      alert("Something went wrong while booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (selectedDoctor) {
    return (
      <div className={bookStyles.pageWrapper}>
        <div className={bookStyles.bookingCard}>
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
              <div className={styles.experienceLabel} style={{ justifyContent: 'center' }}>
                {selectedDoctor.experience}
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
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
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
              <h3>Payment Summary</h3>
              <div className={bookStyles.consultationFee}>
                <span>Consultation Fee</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{selectedDoctor.fee || 500}</span>
              </div>
              <select
                className={bookStyles.paymentSelect}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="" disabled>Select Method</option>
                <option value="Cash">Cash at Clinic</option>
                <option value="UPI">UPI / PhonePe / GPay</option>
                <option value="Debit / Credit Card">Debit / Credit Card</option>
              </select>
            </div>

            <button 
              onClick={handleConfirm} 
              className={bookStyles.submitBtn}
              disabled={isBooking}
            >
              {isBooking ? "Processing..." : "Confirm Appointment"}
            </button>
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
          Expertly qualified doctors across 15+ specialties. View detailed profiles and book your consultation with confidence.
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
              <div className={styles.experienceLabel}>
                {doc.experience}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}