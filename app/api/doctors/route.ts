import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'doctors.json');

// Helper to initialize db
function getDoctors() {
  try {
    if (!fs.existsSync(dbPath)) {
      const initial = [
        {
          id: "1",
          name: "Dr. Vikram Malhotra",
          specialization: "Cardiology Specialist",
          availableDates: ["2026-04-10", "2026-04-14"],
          image: "/images/doctors/dr_alexander_sterling_1777615404084.png",
          experience: "10+ years",
          fee: 500,
          status: "Active",
          appointments: 145
        }
      ];
      fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
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
      specialization: body.specialization,
      experience: body.experience || "0 years",
      fee: body.fee || 500,
      image: body.image || "https://via.placeholder.com/150",
      availableDates: ["2026-05-01", "2026-05-05"],
      status: "Active",
      appointments: 0
    };
    
    doctors.push(newDoctor);
    fs.writeFileSync(dbPath, JSON.stringify(doctors, null, 2));
    
    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add doctor' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    let doctors = getDoctors();
    doctors = doctors.filter((d: any) => d.id !== id);
    fs.writeFileSync(dbPath, JSON.stringify(doctors, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
  }
}
