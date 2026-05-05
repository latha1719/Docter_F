import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'appointments.json');

function getAppointments() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function saveAppointments(appointments: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2));
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
    
    // Add unique ID and timestamp
    const appointmentWithMeta = {
      ...newAppointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'Confirmed'
    };
    
    appointments.push(appointmentWithMeta);
    saveAppointments(appointments);
    
    return NextResponse.json(appointmentWithMeta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save appointment' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    let appointments = getAppointments();
    appointments = appointments.filter((a: any) => a.id !== id);
    saveAppointments(appointments);
    
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
