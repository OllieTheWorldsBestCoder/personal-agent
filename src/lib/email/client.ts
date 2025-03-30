import { google } from 'googleapis';
import { CONFIG } from '../config';
import { getSmartResponse } from '../ai/client';

// Initialize Gmail API client
const auth = new google.auth.OAuth2(
  CONFIG.GMAIL.clientId,
  CONFIG.GMAIL.clientSecret
);

auth.setCredentials({
  refresh_token: CONFIG.GMAIL.refreshToken,
});

const gmail = google.gmail({ version: 'v1', auth });

// Type for email message
export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  snippet: string;
  body: string;
  timestamp: string;
  labels: string[];
}

// Type for email summary
export interface EmailSummary {
  total: number;
  unread: number;
  important: number;
  urgent: number;
  newsletters: number;
  social: number;
  other: number;
}

/**
 * Get unread emails
 */
export async function getUnreadEmails(): Promise<EmailMessage[]> {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: CONFIG.EMAIL.maxEmailsPerBatch,
    });

    const messages = await Promise.all(
      response.data.messages?.map(async (message) => {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
        });

        const headers = fullMessage.data.payload?.headers;
        const subject = headers?.find((h) => h.name === 'Subject')?.value || '';
        const from = headers?.find((h) => h.name === 'From')?.value || '';
        const to = headers?.find((h) => h.name === 'To')?.value?.split(',') || [];
        const date = headers?.find((h) => h.name === 'Date')?.value || '';

        return {
          id: message.id!,
          threadId: message.threadId!,
          subject,
          from,
          to,
          snippet: fullMessage.data.snippet || '',
          body: getEmailBody(fullMessage.data.payload),
          timestamp: date,
          labels: fullMessage.data.labelIds || [],
        };
      }) || []
    );

    return messages;
  } catch (error) {
    console.error('Error getting unread emails:', error);
    throw error;
  }
}

/**
 * Get email summary
 */
export async function getEmailSummary(): Promise<EmailSummary> {
  try {
    const unreadEmails = await getUnreadEmails();
    const categories = {
      important: 0,
      urgent: 0,
      newsletters: 0,
      social: 0,
      other: 0,
    };

    // Categorize emails using AI
    for (const email of unreadEmails) {
      const aiResponse = await getSmartResponse(
        [
          {
            role: 'user',
            content: `Categorize this email into one of these categories: important, urgent, newsletter, social, or other. Only respond with the category name.\n\nSubject: ${email.subject}\nFrom: ${email.from}\nSnippet: ${email.snippet}`,
          },
        ],
        'simple'
      );

      const category = aiResponse.content.toLowerCase().trim();
      if (category in categories) {
        categories[category as keyof typeof categories]++;
      } else {
        categories.other++;
      }
    }

    return {
      total: unreadEmails.length,
      unread: unreadEmails.length,
      ...categories,
    };
  } catch (error) {
    console.error('Error getting email summary:', error);
    throw error;
  }
}

/**
 * Mark email as read
 */
export async function markAsRead(messageId: string): Promise<void> {
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  } catch (error) {
    console.error('Error marking email as read:', error);
    throw error;
  }
}

/**
 * Archive email
 */
export async function archiveEmail(messageId: string): Promise<void> {
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });
  } catch (error) {
    console.error('Error archiving email:', error);
    throw error;
  }
}

/**
 * Send email reply
 */
export async function sendReply(
  threadId: string,
  messageId: string,
  reply: string
): Promise<void> {
  try {
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const headers = message.data.payload?.headers;
    const subject = headers?.find((h) => h.name === 'Subject')?.value || '';
    const from = headers?.find((h) => h.name === 'From')?.value || '';

    const emailContent = [
      `From: ${CONFIG.GMAIL.userEmail}`,
      `To: ${from}`,
      `Subject: Re: ${subject.startsWith('Re:') ? subject.slice(4) : subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      reply,
    ].join('\r\n');

    const encodedEmail = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
        threadId,
      },
    });
  } catch (error) {
    console.error('Error sending email reply:', error);
    throw error;
  }
}

/**
 * Helper function to get email body from payload
 */
function getEmailBody(payload: any): string {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain') {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.parts) {
        const body = getEmailBody(part);
        if (body) return body;
      }
    }
  }

  return '';
} 