import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Anthropic
  ANTHROPIC_API_KEY: z.string(),
  
  // OpenAI
  OPENAI_API_KEY: z.string(),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_WHATSAPP_NUMBER: z.string(),
  
  // Google
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GMAIL_REFRESH_TOKEN: z.string(),
  
  // Pinecone
  PINECONE_API_KEY: z.string(),
  PINECONE_ENVIRONMENT: z.string(),
  PINECONE_INDEX_NAME: z.string(),
  
  // News API
  NEWSAPI_KEY: z.string(),
  
  // User Configuration
  USER_PHONE_NUMBER: z.string(),
  USER_EMAIL: z.string(),
  TIMEZONE: z.string().default('Europe/London'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// AI Model configurations
export const AI_CONFIG = {
  CLAUDE_SONNET: {
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    temperature: 0.7,
  },
  CLAUDE_HAIKU: {
    model: 'claude-3-haiku-20240307',
    maxTokens: 2048,
    temperature: 0.7,
  },
  GPT4: {
    model: 'gpt-4-turbo-preview',
    maxTokens: 4096,
    temperature: 0.7,
  },
  TTS: {
    model: 'tts-1-hd',
    voice: 'alloy',
  },
  WHISPER: {
    model: 'whisper-1',
  },
} as const;

// WhatsApp configuration
export const WHATSAPP_CONFIG = {
  accountSid: env.TWILIO_ACCOUNT_SID,
  authToken: env.TWILIO_AUTH_TOKEN,
  whatsappNumber: env.TWILIO_WHATSAPP_NUMBER,
  userPhoneNumber: env.USER_PHONE_NUMBER,
} as const;

// Gmail configuration
export const GMAIL_CONFIG = {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  refreshToken: env.GMAIL_REFRESH_TOKEN,
  userEmail: env.USER_EMAIL,
} as const;

// Pinecone configuration
export const PINECONE_CONFIG = {
  apiKey: process.env.PINECONE_API_KEY || '',
  environment: process.env.PINECONE_ENVIRONMENT || 'aws',
  indexName: process.env.PINECONE_INDEX_NAME || 'person',
} as const;

// News API configuration
export const NEWS_CONFIG = {
  apiKey: env.NEWSAPI_KEY,
  timezone: env.TIMEZONE,
} as const;

// Memory system configuration
export const MEMORY_CONFIG = {
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.9,
} as const;

// Daily update schedule
export const DAILY_UPDATE_CONFIG = {
  hour: 8, // 8 AM
  minute: 0,
  timezone: env.TIMEZONE,
} as const;

// Email processing configuration
export const EMAIL_CONFIG = {
  maxEmailsPerBatch: 10,
  importanceThreshold: 0.7,
  categories: ['important', 'urgent', 'newsletter', 'social', 'other'],
} as const;

// Voice note configuration
export const VOICE_CONFIG = {
  maxLength: 300, // seconds
  format: 'mp3',
  quality: 'high',
} as const;

// Error handling configuration
export const ERROR_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  timeout: 30000, // ms
} as const;

// Cron configuration
export const CRON_CONFIG = {
  secret: process.env.CRON_SECRET || '',
} as const;

// Export all configurations
export const CONFIG = {
  AI: AI_CONFIG,
  WHATSAPP: WHATSAPP_CONFIG,
  GMAIL: GMAIL_CONFIG,
  PINECONE: PINECONE_CONFIG,
  NEWS: NEWS_CONFIG,
  MEMORY: MEMORY_CONFIG,
  DAILY_UPDATE: DAILY_UPDATE_CONFIG,
  EMAIL: EMAIL_CONFIG,
  VOICE: VOICE_CONFIG,
  ERROR: ERROR_CONFIG,
  CRON: CRON_CONFIG,
  TWILIO: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    userPhoneNumber: process.env.TWILIO_USER_PHONE_NUMBER || '',
  },
} as const; 