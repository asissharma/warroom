import { NextResponse } from 'next/server';

// DEPRECATED — replaced by /api/session/today (Phase 3)
export async function GET() {
  return NextResponse.json({ error: 'Deprecated. Use /api/session/today instead.' }, { status: 501 });
}
