import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'doctors.json');

function getDoctors() {
  try {
    if (!fs.existsSync(dbPath)) {
      return [];
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveDoctors(doctors: any[]) {
  fs.writeFileSync(dbPath, JSON.stringify(doctors, null, 2));
}

export async function GET() {
  const doctors = getDoctors();
  return NextResponse.json(doctors);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doctors = getDoctors();
    
    const newDoctor = {
      id: Date.now().toString(),
      name: body.name,
      specialization: body.specialization || body.specialty || "General Specialist",
      experience: body.experience || "0 years",
      fee: Number(body.fee) || 500,
      image: body.image || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800",
      availableDates: Array.isArray(body.availableDates) ? body.availableDates : [],
      availableTimeSlots: Array.isArray(body.availableTimeSlots) ? body.availableTimeSlots : [],
      status: body.status || "Active",
      rating: 5.0,
      reviewCount: 0
    };
    
    doctors.push(newDoctor);
    saveDoctors(doctors);
    
    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add doctor' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Doctor ID is required for update' }, { status: 400 });
    }

    const doctors = getDoctors();
    const index = doctors.findIndex((d: any) => d.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    doctors[index] = {
      ...doctors[index],
      ...body
    };

    saveDoctors(doctors);

    return NextResponse.json(doctors[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    let doctors = getDoctors();
    doctors = doctors.filter((d: any) => d.id !== id);
    saveDoctors(doctors);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
  }
}
