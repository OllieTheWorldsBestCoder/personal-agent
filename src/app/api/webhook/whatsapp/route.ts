import { NextResponse } from 'next/server';
import { processIncomingMessage } from '@/lib/whatsapp/client';
import { initializeState } from '@/lib/orchestrator';

// Initialize state
const state = initializeState();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const message = formData.get('Body') as string;
    const from = formData.get('From') as string;

    if (!message || !from) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process message
    const result = await processIncomingMessage(message, from, state);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 