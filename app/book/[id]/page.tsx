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
  availableDates?: string[];
  availableTimeSlots?: string[];
  status?: string;
};

type Appointment = {
  id: string;
  doctorId?: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
};

export default function BookDoctorPage() {
  const params = useParams();
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patient, setPatient] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [problem, setProblem] = useState("");

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

  // Load doctor details & existing appointments
  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) return;
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      try {
        const [docRes, appRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/appointments")
        ]);

        if (docRes.ok) {
          const doctors: Doctor[] = await docRes.json();
          const found = doctors.find((d) => d.id === id);
          setDoctor(found || doctors[0] || null);
        }

        if (appRes.ok) {
          const apps: Appointment[] = await appRes.json();
          setExistingAppointments(apps);
        }
      } catch (error) {
        console.error("Failed to fetch booking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params]);

  // Calculate booked slots for selected doctor and date
  const bookedSlots = existingAppointments
    .filter((a) => {
      if (a.status === 'Cancelled') return false;
      if (!date || a.date !== date) return false;
      
      const isSameDoctor = 
        (doctor?.id && a.doctorId === doctor.id) ||
        (doctor?.name && a.doctorName && a.doctorName.toLowerCase().trim() === doctor.name.toLowerCase().trim());

      return isSameDoctor;
    })
    .map((a) => a.time);

  // Check date availability
  const isDoctorAvailableOnDate = (selectedDate: string) => {
    if (!doctor || !selectedDate) return true;
    if (doctor.status === 'On Leave' || doctor.status === 'Unavailable') return false;
    if (doctor.availableDates && doctor.availableDates.length > 0) {
      return doctor.availableDates.includes(selectedDate);
    }
    return true;
  };

  const isSelectedDateAvailable = isDoctorAvailableOnDate(date);

  const handleBook = () => {
    if (!doctor || !date || !time || !patient || !age || !contact || !problem) {
      alert("Please fill all required details!");
      return;
    }

    if (!isSelectedDateAvailable) {
      alert("Doctor is unavailable on the selected date. Please choose an available date.");
      return;
    }

    if (bookedSlots.includes(time)) {
      alert("❌ This time slot has already been booked. Please select a different time slot.");
      return;
    }

    const pendingAppointment = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorImage: doctor.image,
      specialization: doctor.specialization || doctor.specialty,
      experience: doctor.experience || "0 years",
      fee: doctor.fee || 500,
      date,
      time,
      patientName: patient,
      patientEmail: localStorage.getItem('currentUserEmail') || '',
      age,
      contact,
      problem,
    };

    sessionStorage.setItem("pendingAppointment", JSON.stringify(pendingAppointment));
    localStorage.setItem("pendingAppointment", JSON.stringify(pendingAppointment));

    router.push("/payment");
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
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600, background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                ⭐ {doctor.experience} Experience
              </span>
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                padding: '0.2rem 0.6rem', 
                borderRadius: '4px',
                background: doctor.status === 'On Leave' ? '#fef2f2' : '#f0fdf4',
                color: doctor.status === 'On Leave' ? '#ef4444' : '#16a34a'
              }}>
                {doctor.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Availability Alert */}
        {date && !isSelectedDateAvailable && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            ⚠️ {doctor.name} is unavailable on {date}. Please select an available date.
          </div>
        )}

        {/* Booking Form */}
        <div>
          <div className={styles.formGroup}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem', display: 'block' }}>
              Select Consultation Date
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setDate(e.target.value);
                setTime(""); // Reset time when date changes
              }}
              placeholder="Select Date"
            />
          </div>

          <div className={styles.formGroup}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem', display: 'block' }}>
              Select Time Slot {date && bookedSlots.length > 0 && `(${bookedSlots.length} slot(s) already booked)`}
            </label>
            <select value={time} onChange={(e) => setTime(e.target.value)} disabled={!date || !isSelectedDateAvailable}>
              <option value="" disabled>
                {!date ? "← Pick a Date First" : !isSelectedDateAvailable ? "Doctor Unavailable" : "Select Time Slot"}
              </option>
              
              <optgroup label="Morning (AM)">
                {amTimeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <option key={slot} value={slot} disabled={isBooked} style={isBooked ? { color: '#94a3b8', background: '#f8fafc' } : {}}>
                      {slot} {isBooked ? "🔒 (Already Booked)" : ""}
                    </option>
                  );
                })}
              </optgroup>
              
              <optgroup label="Afternoon (PM)">
                {pmTimeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <option key={slot} value={slot} disabled={isBooked} style={isBooked ? { color: '#94a3b8', background: '#f8fafc' } : {}}>
                      {slot} {isBooked ? "🔒 (Already Booked)" : ""}
                    </option>
                  );
                })}
              </optgroup>
              
              <optgroup label="Night (PM)">
                {nightTimeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <option key={slot} value={slot} disabled={isBooked} style={isBooked ? { color: '#94a3b8', background: '#f8fafc' } : {}}>
                      {slot} {isBooked ? "🔒 (Already Booked)" : ""}
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Patient Full Name"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="number"
              placeholder="Patient Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="tel"
              placeholder="Contact Number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <textarea
              placeholder="Describe health issue / reason for visit"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            ></textarea>
          </div>

          <div className={styles.paymentSection}>
            <h3>Consultation Fee</h3>
            <div className={styles.consultationFee}>Total Amount Payable: ₹{doctor.fee || 500}</div>
          </div>

          <button 
            onClick={handleBook} 
            className={styles.submitBtn} 
            disabled={!isSelectedDateAvailable || bookedSlots.includes(time)}
            style={(!isSelectedDateAvailable || bookedSlots.includes(time)) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            Proceed to Payment →
          </button>
        </div>
      </div>
    </div>
  );
}