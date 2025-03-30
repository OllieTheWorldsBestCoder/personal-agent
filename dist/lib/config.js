"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = exports.CRON_CONFIG = exports.ERROR_CONFIG = exports.VOICE_CONFIG = exports.EMAIL_CONFIG = exports.DAILY_UPDATE_CONFIG = exports.MEMORY_CONFIG = exports.NEWS_CONFIG = exports.PINECONE_CONFIG = exports.GMAIL_CONFIG = exports.WHATSAPP_CONFIG = exports.AI_CONFIG = void 0;
const zod_1 = require("zod");
// Environment variables schema
const envSchema = zod_1.z.object({
    // Anthropic
    ANTHROPIC_API_KEY: zod_1.z.string(),
    // OpenAI
    OPENAI_API_KEY: zod_1.z.string(),
    // Twilio
    TWILIO_ACCOUNT_SID: zod_1.z.string(),
    TWILIO_AUTH_TOKEN: zod_1.z.string(),
    TWILIO_WHATSAPP_NUMBER: zod_1.z.string(),
    // Google
    GOOGLE_CLIENT_ID: zod_1.z.string(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string(),
    GMAIL_REFRESH_TOKEN: zod_1.z.string(),
    // Pinecone
    PINECONE_API_KEY: zod_1.z.string(),
    PINECONE_ENVIRONMENT: zod_1.z.string(),
    PINECONE_INDEX_NAME: zod_1.z.string(),
    // News API
    NEWSAPI_KEY: zod_1.z.string(),
    // User Configuration
    USER_PHONE_NUMBER: zod_1.z.string(),
    USER_EMAIL: zod_1.z.string(),
    TIMEZONE: zod_1.z.string().default('Europe/London'),
});
// Parse and validate environment variables
const env = envSchema.parse(process.env);
// AI Model configurations
exports.AI_CONFIG = {
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
};
// WhatsApp configuration
exports.WHATSAPP_CONFIG = {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    whatsappNumber: env.TWILIO_WHATSAPP_NUMBER,
    userPhoneNumber: env.USER_PHONE_NUMBER,
};
// Gmail configuration
exports.GMAIL_CONFIG = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    refreshToken: env.GMAIL_REFRESH_TOKEN,
    userEmail: env.USER_EMAIL,
};
// Pinecone configuration
exports.PINECONE_CONFIG = {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || 'aws',
    indexName: process.env.PINECONE_INDEX_NAME || 'person',
};
// News API configuration
exports.NEWS_CONFIG = {
    apiKey: env.NEWSAPI_KEY,
    timezone: env.TIMEZONE,
};
// Memory system configuration
exports.MEMORY_CONFIG = {
    maxTokens: 1000,
    temperature: 0.7,
    topP: 0.9,
};
// Daily update schedule
exports.DAILY_UPDATE_CONFIG = {
    hour: 8, // 8 AM
    minute: 0,
    timezone: env.TIMEZONE,
};
// Email processing configuration
exports.EMAIL_CONFIG = {
    maxEmailsPerBatch: 10,
    importanceThreshold: 0.7,
    categories: ['important', 'urgent', 'newsletter', 'social', 'other'],
};
// Voice note configuration
exports.VOICE_CONFIG = {
    maxLength: 300, // seconds
    format: 'mp3',
    quality: 'high',
};
// Error handling configuration
exports.ERROR_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000, // ms
    timeout: 30000, // ms
};
// Cron configuration
exports.CRON_CONFIG = {
    secret: process.env.CRON_SECRET || '',
};
// Export all configurations
exports.CONFIG = {
    AI: exports.AI_CONFIG,
    WHATSAPP: exports.WHATSAPP_CONFIG,
    GMAIL: exports.GMAIL_CONFIG,
    PINECONE: exports.PINECONE_CONFIG,
    NEWS: exports.NEWS_CONFIG,
    MEMORY: exports.MEMORY_CONFIG,
    DAILY_UPDATE: exports.DAILY_UPDATE_CONFIG,
    EMAIL: exports.EMAIL_CONFIG,
    VOICE: exports.VOICE_CONFIG,
    ERROR: exports.ERROR_CONFIG,
    CRON: exports.CRON_CONFIG,
    TWILIO: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
        userPhoneNumber: process.env.TWILIO_USER_PHONE_NUMBER || '',
    },
};
//# sourceMappingURL=config.js.map