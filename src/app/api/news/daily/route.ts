import { NextResponse } from 'next/server';
import { getTopHeadlines } from '@/lib/news/client';
import { generateText, generateVoice } from '@/lib/ai/client';
import { sendVoiceNote } from '@/lib/whatsapp/client';
import { NewsArticle } from '@/types/news';

export async function GET(request: Request) {
  try {
    // Get top headlines
    const articles = await getTopHeadlines({
      country: 'gb',
      pageSize: 5,
    });

    // Generate news summary using AI
    const summary = await generateText(
      `Here are today's top headlines:\n${articles
        .map((article: NewsArticle) => `- ${article.title}`)
        .join('\n')}`,
      'creative',
      {
        systemPrompt: `You are a news anchor. Create a brief, engaging summary of today's top headlines.
Keep it under 60 seconds when read aloud. Use a conversational tone and make it sound natural.
Start with "Good morning! Here are today's top stories:" and end with "Stay tuned for more updates tomorrow!"`,
      }
    );

    // Generate voice note
    const audioResponse = await generateVoice(summary, 'nova');
    const audioBuffer = await audioResponse.arrayBuffer();

    // Upload audio to a temporary URL (you'll need to implement this)
    // For now, we'll use a placeholder URL
    const audioUrl = 'https://example.com/audio.mp3';

    // Send voice note via WhatsApp
    await sendVoiceNote(audioUrl, 'Daily News Update');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating daily news:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 