import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const reviewsPath = path.join(process.cwd(), 'reviews.json');
const doctorsPath = path.join(process.cwd(), 'doctors.json');

function getReviews() {
  if (!fs.existsSync(reviewsPath)) {
    fs.writeFileSync(reviewsPath, JSON.stringify([]));
  }
  const data = fs.readFileSync(reviewsPath, 'utf8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveReviews(reviews: any[]) {
  fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
}

function updateDoctorRating(doctorId: string, doctorName: string, newRating: number) {
  if (!fs.existsSync(doctorsPath)) return;
  try {
    const data = fs.readFileSync(doctorsPath, 'utf8');
    const doctors = JSON.parse(data);

    const docIndex = doctors.findIndex(
      (d: any) => d.id === doctorId || d.name?.toLowerCase() === doctorName?.toLowerCase()
    );

    if (docIndex >= 0) {
      const currentRating = Number(doctors[docIndex].rating || 4.8);
      const currentCount = Number(doctors[docIndex].reviewCount || 10);

      const updatedCount = currentCount + 1;
      const updatedRating = Number(((currentRating * currentCount + newRating) / updatedCount).toFixed(1));

      doctors[docIndex].rating = updatedRating;
      doctors[docIndex].reviewCount = updatedCount;

      fs.writeFileSync(doctorsPath, JSON.stringify(doctors, null, 2));
    }
  } catch (err) {
    console.error('Error updating doctor rating:', err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const doctorName = searchParams.get('doctorName');

    let reviews = getReviews();

    if (doctorId) {
      reviews = reviews.filter((r: any) => r.doctorId === doctorId);
    } else if (doctorName) {
      reviews = reviews.filter((r: any) => r.doctorName?.toLowerCase() === doctorName.toLowerCase());
    }

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reviews = getReviews();

    const newReview = {
      id: `REV_${Date.now()}`,
      doctorId: body.doctorId || '',
      doctorName: body.doctorName || 'Doctor',
      patientName: body.patientName || 'Anonymous Patient',
      rating: Number(body.rating) || 5,
      comment: body.comment || 'Great experience and consultation!',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    reviews.unshift(newReview);
    saveReviews(reviews);

    updateDoctorRating(newReview.doctorId, newReview.doctorName, newReview.rating);

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Review ID required' }, { status: 400 });

    let reviews = getReviews();
    reviews = reviews.filter((r: any) => r.id !== id);
    saveReviews(reviews);

    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
