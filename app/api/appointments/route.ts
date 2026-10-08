import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'appointments.json');
const rxFilePath = path.join(process.cwd(), 'prescriptions.json');
const notifFilePath = path.join(process.cwd(), 'notifications.json');

function getAppointments() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveAppointments(appointments: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2));
}

function getPrescriptions() {
  if (!fs.existsSync(rxFilePath)) {
    fs.writeFileSync(rxFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(rxFilePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function savePrescriptions(prescriptions: any[]) {
  fs.writeFileSync(rxFilePath, JSON.stringify(prescriptions, null, 2));
}

function addNotification(type: string, title: string, message: string) {
  try {
    let notifications: any[] = [];
    if (fs.existsSync(notifFilePath)) {
      const data = fs.readFileSync(notifFilePath, 'utf8');
      notifications = JSON.parse(data);
    }
    const newNotif = {
      id: `NOTIF_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      message,
      time: 'Just now',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    fs.writeFileSync(notifFilePath, JSON.stringify(notifications, null, 2));
  } catch (err) {
    console.error('Failed to save notification:', err);
  }
}

function generatePrescriptionForAppointment(appointment: any) {
  const doctorName = appointment.doctorName || 'Dr. Specialist';
  const docSpec = appointment.specialization || appointment.specialty || 'General Medicine';
  const problem = appointment.problem || 'General Consultation';
  const patientName = appointment.patientName || appointment.patient || 'Patient';
  const age = appointment.age !== undefined && appointment.age !== null && appointment.age !== '' ? String(appointment.age) : 'N/A';
  const date = appointment.date || new Date().toISOString().split('T')[0];

  let medicines = [
    { name: "Paracetamol 500mg", dosage: "1 Tablet", frequency: "Twice daily after meals", duration: "5 Days" },
    { name: "Multivitamin & Mineral", dosage: "1 Capsule", frequency: "Once daily after lunch", duration: "15 Days" }
  ];

  const lowerProb = problem.toLowerCase();
  const lowerSpec = docSpec.toLowerCase();

  if (lowerProb.includes('fever') || lowerProb.includes('cold') || lowerProb.includes('body pain')) {
    medicines = [
      { name: "Paracetamol 650mg", dosage: "1 Tablet", frequency: "Thrice daily after food", duration: "5 Days" },
      { name: "Cetirizine 10mg", dosage: "1 Tablet", frequency: "Once daily at night", duration: "5 Days" },
      { name: "Vitamin C 500mg", dosage: "1 Chewable Tablet", frequency: "Once daily", duration: "10 Days" }
    ];
  } else if (lowerProb.includes('head') || lowerProb.includes('headache')) {
    medicines = [
      { name: "Naproxen 250mg", dosage: "1 Tablet", frequency: "Twice daily after food", duration: "3 Days" },
      { name: "Pantoprazole 40mg", dosage: "1 Tablet", frequency: "Once daily (Morning before food)", duration: "5 Days" }
    ];
  } else if (lowerProb.includes('stomach') || lowerProb.includes('gastric') || lowerProb.includes('checkup') || lowerSpec.includes('gastro')) {
    medicines = [
      { name: "Pantoprazole 40mg", dosage: "1 Tablet", frequency: "Once daily before breakfast", duration: "14 Days" },
      { name: "Digestive Enzymes Gel", dosage: "10 ml", frequency: "Twice daily after meals", duration: "7 Days" },
      { name: "Probiotic Fortified Capsule", dosage: "1 Capsule", frequency: "Once daily with lunch", duration: "10 Days" }
    ];
  } else if (lowerProb.includes('teeth') || lowerProb.includes('dental') || lowerSpec.includes('dentist')) {
    medicines = [
      { name: "Amoxicillin 500mg", dosage: "1 Capsule", frequency: "Thrice daily after food", duration: "5 Days" },
      { name: "Ibuprofen 400mg", dosage: "1 Tablet", frequency: "As needed for acute tooth pain", duration: "5 Days" },
      { name: "Chlorhexidine Antiseptic Rinse", dosage: "10 ml gargle", frequency: "Twice daily", duration: "7 Days" }
    ];
  } else if (lowerProb.includes('skin') || lowerSpec.includes('derm')) {
    medicines = [
      { name: "Cetirizine 10mg", dosage: "1 Tablet", frequency: "Once daily at bedtime", duration: "7 Days" },
      { name: "Soothing Calamine Gel", dosage: "Topical application", frequency: "Apply twice daily", duration: "10 Days" }
    ];
  }

  return {
    id: `RX_${appointment.id}`,
    appointmentId: appointment.id,
    doctorName,
    doctorSpecialization: docSpec,
    doctorImage: appointment.doctorImage || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
    patientName,
    age,
    date,
    diagnosis: problem.charAt(0).toUpperCase() + problem.slice(1),
    notes: `Prescription & medical record auto-generated upon booking. Doctor advice: Drink plenty of water, get adequate rest, and take prescribed medication on time.`,
    medicines,
    status: 'Active',
    createdAt: appointment.createdAt || new Date().toISOString()
  };
}

export async function GET() {
  try {
    const appointments = getAppointments();
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newAppointment = await req.json();
    const appointments = getAppointments();

    // Prevent Double Booking Check
    const isDoubleBooked = appointments.some((a: any) => {
      if (a.status === 'Cancelled') return false;
      const isSameDoctor = 
        (newAppointment.doctorId && a.doctorId === newAppointment.doctorId) ||
        (a.doctorName && newAppointment.doctorName && a.doctorName.toLowerCase().trim() === newAppointment.doctorName.toLowerCase().trim());
      const isSameDate = a.date === newAppointment.date;
      const isSameTime = a.time === newAppointment.time;

      return isSameDoctor && isSameDate && isSameTime;
    });

    if (isDoubleBooked) {
      return NextResponse.json(
        { error: 'DOUBLE_BOOKING: This slot is already booked for this doctor. Please select a different date or time slot.' },
        { status: 400 }
      );
    }
    
    // Create complete appointment record with payment & status details
    const appointmentWithMeta = {
      ...newAppointment,
      id: newAppointment.id || Date.now().toString(),
      createdAt: newAppointment.createdAt || new Date().toISOString(),
      status: newAppointment.status || 'Confirmed',
      paymentStatus: newAppointment.paymentStatus || 'Paid',
      paymentId: newAppointment.paymentId || `PAY_${Date.now()}`,
      paidAt: newAppointment.paidAt || new Date().toISOString(),
      paymentMethod: newAppointment.paymentMethod || 'UPI'
    };
    
    appointments.push(appointmentWithMeta);
    saveAppointments(appointments);

    // Notify Patient & Doctor for new booking
    addNotification('confirmation', 'Appointment Confirmed', `Patient ${appointmentWithMeta.patientName || 'Patient'} booked appointment with ${appointmentWithMeta.doctorName} on ${appointmentWithMeta.date} at ${appointmentWithMeta.time}.`);
    addNotification('reminder', 'Doctor Alert: New Booking', `${appointmentWithMeta.doctorName}: New consultation booked by ${appointmentWithMeta.patientName} on ${appointmentWithMeta.date} (${appointmentWithMeta.time}).`);

    // Automatically store doctor record and prescription
    try {
      const prescriptions = getPrescriptions();
      const existingIndex = prescriptions.findIndex((p: any) => p.appointmentId === appointmentWithMeta.id || p.id === `RX_${appointmentWithMeta.id}`);
      if (existingIndex < 0) {
        const autoRx = generatePrescriptionForAppointment(appointmentWithMeta);
        prescriptions.unshift(autoRx);
        savePrescriptions(prescriptions);
      }
    } catch (err) {
      console.error('Failed to auto-create prescription for appointment:', err);
    }
    
    return NextResponse.json(appointmentWithMeta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save appointment' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, status, newDate, newTime, diagnosis, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    let appointments = getAppointments();
    const index = appointments.findIndex((a: any) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const app = appointments[index];

    if (action === 'accept' || status === 'Confirmed') {
      appointments[index].status = 'Confirmed';
      saveAppointments(appointments);

      addNotification(
        'confirmation',
        'Appointment Accepted',
        `Doctor Alert: ${app.doctorName} has ACCEPTED your appointment scheduled for ${app.date} at ${app.time}.`
      );

      return NextResponse.json({ message: 'Appointment accepted', appointment: appointments[index] });
    }

    if (action === 'reject' || status === 'Rejected') {
      appointments[index].status = 'Rejected';
      saveAppointments(appointments);

      addNotification(
        'cancellation',
        'Appointment Declined',
        `Patient Alert: Your appointment request with ${app.doctorName} for ${app.date} could not be confirmed.`
      );

      return NextResponse.json({ message: 'Appointment rejected', appointment: appointments[index] });
    }

    if (action === 'complete' || status === 'Completed') {
      appointments[index].status = 'Completed';
      saveAppointments(appointments);

      addNotification(
        'reminder',
        'Consultation Completed',
        `Consultation with ${app.doctorName} completed. Medical records and prescriptions are now available.`
      );

      return NextResponse.json({ message: 'Appointment completed', appointment: appointments[index] });
    }

    if (action === 'update_notes') {
      if (diagnosis !== undefined) appointments[index].diagnosis = diagnosis;
      if (notes !== undefined) appointments[index].notes = notes;
      saveAppointments(appointments);

      return NextResponse.json({ message: 'Clinical notes updated', appointment: appointments[index] });
    }

    if (action === 'cancel') {
      appointments[index].status = 'Cancelled';
      saveAppointments(appointments);

      addNotification(
        'cancellation',
        'Appointment Cancelled',
        `Patient Alert: Your consultation with ${app.doctorName} scheduled for ${app.date} at ${app.time} has been cancelled.`
      );
      addNotification(
        'cancellation',
        'Doctor Alert: Cancellation',
        `${app.doctorName}: Patient ${app.patientName} has cancelled their appointment on ${app.date} at ${app.time}.`
      );

      return NextResponse.json({ message: 'Appointment cancelled successfully', appointment: appointments[index] });
    }

    if (action === 'reschedule') {
      if (!newDate || !newTime) {
        return NextResponse.json({ error: 'New date and time required for reschedule' }, { status: 400 });
      }

      const isDoubleBooked = appointments.some((a: any) => {
        if (a.id === id || a.status === 'Cancelled') return false;
        const isSameDoctor = 
          (app.doctorId && a.doctorId === app.doctorId) ||
          (a.doctorName && app.doctorName && a.doctorName.toLowerCase().trim() === app.doctorName.toLowerCase().trim());
        return isSameDoctor && a.date === newDate && a.time === newTime;
      });

      if (isDoubleBooked) {
        return NextResponse.json(
          { error: 'Selected time slot is already booked. Please pick a different slot.' },
          { status: 400 }
        );
      }

      const oldDate = app.date;
      const oldTime = app.time;

      appointments[index].date = newDate;
      appointments[index].time = newTime;
      appointments[index].status = 'Rescheduled';
      saveAppointments(appointments);

      addNotification(
        'reschedule',
        'Appointment Rescheduled',
        `Patient Alert: Your consultation with ${app.doctorName} was rescheduled from ${oldDate} (${oldTime}) to ${newDate} at ${newTime}.`
      );

      return NextResponse.json({ message: 'Appointment rescheduled successfully', appointment: appointments[index] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    let appointments = getAppointments();
    appointments = appointments.filter((a: any) => a.id !== id);
    saveAppointments(appointments);
    
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
