import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'prescriptions.json');
const appFilePath = path.join(process.cwd(), 'appointments.json');

function getPrescriptions() {
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

function savePrescriptions(prescriptions: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(prescriptions, null, 2));
}

function getAppointments() {
  if (!fs.existsSync(appFilePath)) return [];
  try {
    const data = fs.readFileSync(appFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function generatePrescriptionForAppointment(appointment: any) {
  const doctorName = appointment.doctorName || 'Dr. Specialist';
  const docSpec = appointment.specialization || appointment.specialty || 'General Medicine';
  const problem = appointment.problem || 'General Consultation';
  const patientName = appointment.patientName || appointment.patient || 'Patient';
  const age = appointment.age || 'N/A';
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
    let prescriptions = getPrescriptions();
    const appointments = getAppointments();
    let updated = false;

    // Sync any appointments missing from prescriptions.json
    for (const app of appointments) {
      if (!app.id) continue;
      const exists = prescriptions.some((p: any) => p.appointmentId === app.id || p.id === `RX_${app.id}`);
      if (!exists) {
        const newRx = generatePrescriptionForAppointment(app);
        prescriptions.unshift(newRx);
        updated = true;
      }
    }

    if (updated) {
      savePrescriptions(prescriptions);
    }

    return NextResponse.json(prescriptions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prescriptions = getPrescriptions();

    const newPrescription = {
      id: body.id || `RX_${Date.now()}`,
      appointmentId: body.appointmentId || `APP_${Date.now()}`,
      doctorName: body.doctorName || 'Dr. Specialist',
      doctorSpecialization: body.doctorSpecialization || 'General Medicine',
      doctorImage: body.doctorImage || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
      patientName: body.patientName || 'Patient',
      age: body.age || 'N/A',
      date: body.date || new Date().toISOString().split('T')[0],
      diagnosis: body.diagnosis || 'General Consultation',
      notes: body.notes || 'Take prescribed medication as directed.',
      medicines: Array.isArray(body.medicines) ? body.medicines : [],
      status: body.status || 'Active',
      createdAt: new Date().toISOString()
    };

    // Replace if id exists, otherwise add
    const index = prescriptions.findIndex((p: any) => p.id === newPrescription.id);
    if (index >= 0) {
      prescriptions[index] = newPrescription;
    } else {
      prescriptions.unshift(newPrescription);
    }

    savePrescriptions(prescriptions);

    return NextResponse.json(newPrescription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    let prescriptions = getPrescriptions();
    prescriptions = prescriptions.filter((p: any) => p.id !== id);
    savePrescriptions(prescriptions);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prescription' }, { status: 500 });
  }
}
