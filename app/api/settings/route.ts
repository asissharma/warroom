import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SettingsModel } from '@/app/lib/models/Settings';

export async function GET() {
  await connectDB();
  const settings = await SettingsModel.getSingleton();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  await connectDB();
  const body = await request.json();
  
  // Singleton update
  const settings = await SettingsModel.findOneAndUpdate(
    { _id: 'singleton' },
    { $set: body },
    { new: true, upsert: true }
  );

  return NextResponse.json(settings);
}
