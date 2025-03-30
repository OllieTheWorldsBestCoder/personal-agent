import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables
    const config = {
      twilio: {
        configured: process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      },
      gmail: {
        configured: process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET,
      },
      news: {
        configured: process.env.NEWS_API_KEY,
      },
      pinecone: {
        configured: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
        indexName: process.env.PINECONE_INDEX_NAME,
      },
      cron: {
        configured: process.env.CRON_SECRET,
      }
    };

    return NextResponse.json({
      success: true,
      message: 'API endpoint is working',
      environmentStatus: {
        twilio: config.twilio.configured ? 'Configured' : 'Missing configuration',
        gmail: config.gmail.configured ? 'Configured' : 'Missing configuration',
        news: config.news.configured ? 'Configured' : 'Missing configuration',
        pinecone: config.pinecone.configured ? 'Configured' : 'Missing configuration',
        cron: config.cron.configured ? 'Configured' : 'Missing configuration',
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
} 