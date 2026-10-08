import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const paymentsFilePath = path.join(process.cwd(), 'payments.json');
const appointmentsFilePath = path.join(process.cwd(), 'appointments.json');

function getPayments() {
  let filePayments: any[] = [];
  if (fs.existsSync(paymentsFilePath)) {
    try {
      const data = fs.readFileSync(paymentsFilePath, 'utf8');
      filePayments = JSON.parse(data);
    } catch {
      filePayments = [];
    }
  }

  // Synchronize with appointments.json to ensure any paid appointments are included
  let appPayments: any[] = [];
  if (fs.existsSync(appointmentsFilePath)) {
    try {
      const appData = fs.readFileSync(appointmentsFilePath, 'utf8');
      const appointments = JSON.parse(appData);
      appointments.forEach((app: any) => {
        if (app.paymentId && !filePayments.some((p: any) => p.id === app.paymentId)) {
          appPayments.push({
            id: app.paymentId,
            appointmentId: app.id,
            doctorName: app.doctorName,
            doctorImage: app.doctorImage,
            specialization: app.specialization || app.specialty || 'General',
            patientName: app.patientName,
            contact: app.contact,
            amount: app.fee || app.paidAmount || 500,
            paymentMethod: app.paymentMethod || 'UPI',
            status: app.status === 'Cancelled' ? 'Refunded' : (app.paymentStatus || 'Paid'),
            paidAt: app.paidAt || app.createdAt || new Date().toISOString(),
            date: app.date,
            time: app.time
          });
        }
      });
    } catch {
      // ignore
    }
  }

  return [...filePayments, ...appPayments];
}

function savePayments(payments: any[]) {
  fs.writeFileSync(paymentsFilePath, JSON.stringify(payments, null, 2));
}

export async function GET() {
  try {
    const payments = getPayments();
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const paymentData = await req.json();
    const payments = getPayments();

    const newPayment = {
      id: paymentData.id || `PAY_${Date.now()}`,
      appointmentId: paymentData.appointmentId || Date.now().toString(),
      doctorName: paymentData.doctorName || 'Doctor',
      doctorImage: paymentData.doctorImage || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
      specialization: paymentData.specialization || paymentData.specialty || 'Specialist',
      patientName: paymentData.patientName || 'Patient',
      contact: paymentData.contact || '',
      amount: Number(paymentData.amount || paymentData.fee) || 500,
      paymentMethod: paymentData.paymentMethod || 'UPI',
      status: paymentData.status || 'Paid', // 'Paid' | 'Failed' | 'Refunded'
      failureReason: paymentData.failureReason || null,
      paidAt: paymentData.paidAt || new Date().toISOString(),
      date: paymentData.date || new Date().toISOString().split('T')[0],
      time: paymentData.time || '10:00 AM'
    };

    payments.unshift(newPayment);
    savePayments(payments);

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
