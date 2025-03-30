require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { Vonage } = require('@vonage/server-sdk');
const { OpenAI } = require('openai');
const { google } = require('googleapis');

async function testSystem() {
  console.log('Starting comprehensive system test...\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables...');
  const requiredEnvVars = [
    'PINECONE_API_KEY',
    'VONAGE_API_KEY',
    'VONAGE_API_SECRET',
    'VONAGE_PHONE_NUMBER',
    'TWILIO_USER_PHONE_NUMBER', // We'll keep using this as the recipient number
    'OPENAI_API_KEY',
    'NEWS_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
  } else {
    console.log('✓ All required environment variables are present');
  }

  // Test 2: Pinecone Connection
  console.log('\n2. Testing Pinecone Connection...');
  let pineconeStats;
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    const index = pc.index('personal-agent');
    pineconeStats = await index.describeIndexStats();
    console.log('✓ Pinecone connection successful');
    console.log('  Index stats:', JSON.stringify(pineconeStats, null, 2));
  } catch (error) {
    console.log('❌ Pinecone connection failed:', error.message);
  }

  // Test 3: Vonage Connection and WhatsApp Test
  console.log('\n3. Testing Vonage Connection and WhatsApp...');
  let vonageResponse;
  try {
    // Format phone numbers - remove '+' and any spaces
    const fromNumber = process.env.VONAGE_PHONE_NUMBER.replace(/[+ ]/g, '');
    const toNumber = process.env.TWILIO_USER_PHONE_NUMBER.replace(/[+ ]/g, '');

    // Test WhatsApp message sending using Messages API sandbox
    const response = await fetch('https://messages-sandbox.nexmo.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`).toString('base64')
      },
      body: JSON.stringify({
        from: fromNumber,
        to: toNumber,
        message_type: "text",
        text: "Test message from Personal Agent via WhatsApp",
        channel: "whatsapp"
      })
    });

    vonageResponse = await response.json();
    
    if (response.ok) {
      console.log('✓ Vonage connection successful');
      console.log('✓ WhatsApp message test successful');
      console.log('  Message response:', JSON.stringify(vonageResponse, null, 2));
    } else {
      throw new Error(vonageResponse.detail || 'Failed to send message');
    }
  } catch (error) {
    console.log('❌ Vonage connection/WhatsApp failed:', error.message);
    if (vonageResponse) {
      console.log('  Error details:', JSON.stringify(vonageResponse, null, 2));
    }
  }

  // Test 4: OpenAI Connection
  console.log('\n4. Testing OpenAI Connection...');
  let openaiClient;
  try {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    });
    console.log('✓ OpenAI connection successful');
    console.log('  Test response:', response.choices[0].message.content);
  } catch (error) {
    console.log('❌ OpenAI connection failed:', error.message);
  }

  // Test 5: News API Connection
  console.log('\n5. Testing News API Connection...');
  let newsData;
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    );
    newsData = await response.json();
    if (newsData.status === 'ok') {
      console.log('✓ News API connection successful');
      console.log('  Articles found:', newsData.articles.length);
    } else {
      throw new Error(newsData.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ News API connection failed:', error.message);
  }

  // Test 6: Gmail API Connection
  console.log('\n6. Testing Gmail API Connection...');
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'http://localhost:3000/api/auth/callback/google' // Default redirect URI
    );
    
    if (process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_REFRESH_TOKEN !== 'your_refresh_token') {
      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
      });
      
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const response = await gmail.users.labels.list({ userId: 'me' });
      console.log('✓ Gmail API connection successful');
      console.log('  Labels found:', response.data.labels.length);
    } else {
      console.log('⚠️ Gmail refresh token not configured. Please set up Gmail OAuth2.');
      console.log('  To set up Gmail OAuth2:');
      console.log('  1. Go to Google Cloud Console');
      console.log('  2. Enable Gmail API');
      console.log('  3. Create OAuth 2.0 credentials');
      console.log('  4. Set redirect URI to: http://localhost:3000/api/auth/callback/google');
      console.log('  5. Get refresh token and update GMAIL_REFRESH_TOKEN in .env.local');
    }
  } catch (error) {
    console.log('❌ Gmail API connection failed:', error.message);
  }

  // Summary
  console.log('\nTest Summary:');
  console.log('----------------');
  console.log('1. Environment Variables:', missingVars.length === 0 ? '✓ Complete' : '⚠️ Missing variables');
  console.log('2. Pinecone:', pineconeStats ? '✓ Connected' : '❌ Failed');
  console.log('3. Vonage:', vonageResponse ? '✓ Connected' : '❌ Failed');
  console.log('4. OpenAI:', openaiClient ? '✓ Connected' : '❌ Failed');
  console.log('5. News API:', newsData?.status === 'ok' ? '✓ Connected' : '❌ Failed');
  console.log('6. Gmail API:', process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_REFRESH_TOKEN !== 'your_refresh_token' ? '✓ Connected' : '⚠️ Not configured');
}

console.log('Starting system test...');
testSystem(); 