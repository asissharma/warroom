import { NextResponse } from 'next/server';

// DEPRECATED — replaced by /api/session/close (Phase 3)
export async function POST() {
  return NextResponse.json({ error: 'Deprecated. Use /api/session/close instead.' }, { status: 501 });
}
