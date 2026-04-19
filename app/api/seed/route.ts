import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import mongoose from 'mongoose';

// DEPRECATED seed route — use `npm run seed` script instead
export async function POST() {
  return NextResponse.json({ error: 'Deprecated. Run `npm run seed` from terminal instead.' }, { status: 501 });
}

export async function GET() {
  await connectDB();
  const collections = ['syllabuses', 'syllabusitems', 'sessions', 'settings'];
  const counts: Record<string, number> = {};

  for (const coll of collections) {
    try {
      counts[coll] = await mongoose.connection.collection(coll).countDocuments();
    } catch {
      counts[coll] = 0;
    }
  }

  return NextResponse.json({ message: 'Database status', counts });
}
