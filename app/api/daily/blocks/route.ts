import { NextResponse } from 'next/server';

// DEPRECATED — replaced by /api/session/item/[id] (Phase 3)
export async function PUT() {
  return NextResponse.json({ error: 'Deprecated. Use /api/session/item/[id] instead.' }, { status: 501 });
}
