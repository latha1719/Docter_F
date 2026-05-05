"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./book.module.css";

type Doctor = {
  id: string;
  name: string;
  specialization?: string;
  specialty?: string;
  image: string;
  experience: string;
  fee: number;
};

type Appointment = {
  experience: string;
  date: string;
  time: string;
  patient: string;
  age: string;
  contact: string;
  problem: string;
  paymentMethod: string;
};

export default function BookDoctorPage() {
  const params = useParams();
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patient, setPatient] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [problem, setProblem] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [message, setMessage] = useState("");

  const timeSlots = [
    "10:00 am - 10:15 am",
    "11:00 am - 11:15 am",
    "12:15 pm - 12:30 pm",
    "02:00 pm - 02:15 pm",
    "04:00 pm - 04:15 pm",
  ];

  // Load doctor
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!params?.id) return;
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      try {
        const res = await fetch("/api/doctors");
        const doctors: Doctor[] = await res.json();
        const foundDoctor = doctors.find((d) => d.id === id);
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
        } else {
          // Fallback if not found
          setDoctor(doctors[0] || null);
        }
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctor();
  }, [params]);

  const handleBook = () => {
    if (!doctor || !date || !time || !patient || !age || !contact || !problem || !paymentMethod) {
      alert("Fill all required details!");
      return;
    }

    let appointments: Appointment[] = [];

    try {
      const stored = localStorage.getItem("appointments");
      appointments = stored ? JSON.parse(stored) : [];
    } catch {
      appointments = [];
    }

    const newAppointment: Appointment = {
      experience: doctor.experience || "0 years",
      date,
      time,
      patient,
      age,
      contact,
      problem,
      paymentMethod,
    };

    appointments.push(newAppointment);

    localStorage.setItem("appointments", JSON.stringify(appointments));

    setMessage(
      `✅ Appointment booked with ${doctor.name} on ${date} at ${time}`
    );

    // reset
    setDate("");
    setTime("");
    setPatient("");
    setAge("");
    setContact("");
    setProblem("");
    setPaymentMethod("");
  };

  if (isLoading) return <p style={{ padding: "20px", textAlign: "center" }}>Loading doctor details...</p>;
  if (!doctor) return <p style={{ padding: "20px", textAlign: "center" }}>Doctor not found.</p>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.bookingCard}>
        {/* Back Button */}
        <button 
          onClick={() => router.push('/doctors')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}
        >
          ← Back to Doctors
        </button>

        {/* Doctor Info */}
        <div className={styles.doctorHeader}>
          <img src={doctor.image} alt={doctor.name} className={styles.doctorImage} style={{ objectFit: 'cover' }} />
          <div className={styles.doctorInfo}>
            <h2>{doctor.name}</h2>
            <p>{doctor.specialization || doctor.specialty}</p>
            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600, background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.5rem' }}>
              ⭐ {doctor.experience} Experience
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <div>
          <div className={styles.formGroup}>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Select Date"
            />
          </div>

          <div className={styles.formGroup}>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              <option value="" disabled>Select Time Slot</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Name"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="tel"
              placeholder="Contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <textarea
              placeholder="Problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            ></textarea>
          </div>

          {/* Payment Section */}
          <div className={styles.paymentSection}>
            <h3>Payment</h3>
            <div className={styles.consultationFee}>Consultation Fee: ₹{doctor.fee || 500}</div>
            <select
              className={styles.paymentSelect}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="" disabled>Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Debit / Credit Card">Debit / Credit Card</option>
            </select>
          </div>

          <button onClick={handleBook} className={styles.submitBtn}>
            Confirm Booking
          </button>
        </div>

        {/* Success Message */}
        {message && (
          <div className={styles.successMsg}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}