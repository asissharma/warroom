import { NextResponse } from 'next/server';
// DEPRECATED
export async function GET() {
  return NextResponse.json({ error: 'Deprecated.' }, { status: 501 });
}
export async function POST() {
  return NextResponse.json({ error: 'Deprecated.' }, { status: 501 });
}
export async function PUT() {
  return NextResponse.json({ error: 'Deprecated.' }, { status: 501 });
}
