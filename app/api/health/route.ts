import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const mongoose = await connectDB();
    const readyState = mongoose.connection.readyState;

    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return NextResponse.json({
      status: 'ok',
      mongodb: {
        connected: readyState === 1,
        state: states[readyState] || 'unknown',
        readyState,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        mongodb: {
          connected: false,
          state: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
