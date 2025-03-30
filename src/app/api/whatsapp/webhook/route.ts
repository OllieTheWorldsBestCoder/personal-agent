import { NextResponse } from 'next/server';
import { verifyTwilioSignature, sendTextMessage } from '@/lib/whatsapp/client';
import { generateText } from '@/lib/ai/client';
import { queryMemories } from '@/lib/memory/client';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.formData();
    const params = Object.fromEntries(body.entries());

    // Verify Twilio signature
    const signature = request.headers.get('x-twilio-signature');
    const url = request.url;
    
    if (!signature || !verifyTwilioSignature(url, params, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Get message details
    const message = params.Body as string;
    const from = params.From as string;

    // Query relevant memories
    const memories = await queryMemories(message);
    const memoryContext = memories
      .map((m) => m.metadata?.text)
      .join('\n');

    // Generate response using AI
    const response = await generateText(
      `Context from previous interactions:\n${memoryContext}\n\nUser message: ${message}`,
      'complex',
      {
        systemPrompt: `You are a helpful personal AI assistant. You can:
1. Check and summarize emails
2. Provide news updates
3. Answer questions
4. Learn from user preferences

Be concise and friendly in your responses. If you need to perform an action, use the appropriate function call.`,
      }
    );

    // Send response back to user
    await sendTextMessage(response);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 