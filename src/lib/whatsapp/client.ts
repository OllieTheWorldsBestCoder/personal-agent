import { Twilio } from 'twilio';
import { CONFIG } from '../config';
import { processMessage } from '../orchestrator';

// Initialize Twilio client
const twilioClient = new Twilio(
  CONFIG.TWILIO.accountSid,
  CONFIG.TWILIO.authToken
);

// Type for message result
export interface MessageResult {
  success: boolean;
  error?: string;
}

/**
 * Process incoming WhatsApp message
 */
export async function processIncomingMessage(
  message: string,
  from: string,
  state: any
): Promise<MessageResult> {
  try {
    // Process message through orchestrator
    const { response, state: newState } = await processMessage(message, state);

    // Send response via WhatsApp
    await twilioClient.messages.create({
      body: response,
      from: `whatsapp:${CONFIG.TWILIO.phoneNumber}`,
      to: `whatsapp:${from}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Error processing incoming message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send daily news update via WhatsApp
 */
export async function sendDailyNews(
  summary: string,
  voiceNoteUrl?: string
): Promise<MessageResult> {
  try {
    // Send text summary
    await twilioClient.messages.create({
      body: summary,
      from: `whatsapp:${CONFIG.TWILIO.phoneNumber}`,
      to: `whatsapp:${CONFIG.TWILIO.userPhoneNumber}`,
    });

    // Send voice note if available
    if (voiceNoteUrl) {
      await twilioClient.messages.create({
        body: 'Here\'s your daily news update:',
        mediaUrl: [voiceNoteUrl],
        from: `whatsapp:${CONFIG.TWILIO.phoneNumber}`,
        to: `whatsapp:${CONFIG.TWILIO.userPhoneNumber}`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending daily news:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send custom message via WhatsApp
 */
export async function sendMessage(
  message: string,
  to: string
): Promise<MessageResult> {
  try {
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${CONFIG.TWILIO.phoneNumber}`,
      to: `whatsapp:${to}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Function to verify Twilio webhook signature
export const verifyTwilioSignature = (
  url: string,
  params: Record<string, string>,
  signature: string
) => {
  return twilioClient.validateRequest(
    CONFIG.TWILIO.authToken,
    signature,
    url,
    params
  );
}; 