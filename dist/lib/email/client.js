"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadEmails = getUnreadEmails;
exports.getEmailSummary = getEmailSummary;
exports.markAsRead = markAsRead;
exports.archiveEmail = archiveEmail;
exports.sendReply = sendReply;
const googleapis_1 = require("googleapis");
const config_1 = require("../config");
const client_1 = require("../ai/client");
// Initialize Gmail API client
const auth = new googleapis_1.google.auth.OAuth2(config_1.CONFIG.GMAIL.clientId, config_1.CONFIG.GMAIL.clientSecret);
auth.setCredentials({
    refresh_token: config_1.CONFIG.GMAIL.refreshToken,
});
const gmail = googleapis_1.google.gmail({ version: 'v1', auth });
/**
 * Get unread emails
 */
async function getUnreadEmails() {
    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
            maxResults: config_1.CONFIG.EMAIL.maxEmailsPerBatch,
        });
        const messages = await Promise.all(response.data.messages?.map(async (message) => {
            const fullMessage = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            });
            const headers = fullMessage.data.payload?.headers;
            const subject = headers?.find((h) => h.name === 'Subject')?.value || '';
            const from = headers?.find((h) => h.name === 'From')?.value || '';
            const to = headers?.find((h) => h.name === 'To')?.value?.split(',') || [];
            const date = headers?.find((h) => h.name === 'Date')?.value || '';
            return {
                id: message.id,
                threadId: message.threadId,
                subject,
                from,
                to,
                snippet: fullMessage.data.snippet || '',
                body: getEmailBody(fullMessage.data.payload),
                timestamp: date,
                labels: fullMessage.data.labelIds || [],
            };
        }) || []);
        return messages;
    }
    catch (error) {
        console.error('Error getting unread emails:', error);
        throw error;
    }
}
/**
 * Get email summary
 */
async function getEmailSummary() {
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
            const aiResponse = await (0, client_1.getSmartResponse)([
                {
                    role: 'user',
                    content: `Categorize this email into one of these categories: important, urgent, newsletter, social, or other. Only respond with the category name.\n\nSubject: ${email.subject}\nFrom: ${email.from}\nSnippet: ${email.snippet}`,
                },
            ], 'simple');
            const category = aiResponse.content.toLowerCase().trim();
            if (category in categories) {
                categories[category]++;
            }
            else {
                categories.other++;
            }
        }
        return {
            total: unreadEmails.length,
            unread: unreadEmails.length,
            ...categories,
        };
    }
    catch (error) {
        console.error('Error getting email summary:', error);
        throw error;
    }
}
/**
 * Mark email as read
 */
async function markAsRead(messageId) {
    try {
        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD'],
            },
        });
    }
    catch (error) {
        console.error('Error marking email as read:', error);
        throw error;
    }
}
/**
 * Archive email
 */
async function archiveEmail(messageId) {
    try {
        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['INBOX'],
            },
        });
    }
    catch (error) {
        console.error('Error archiving email:', error);
        throw error;
    }
}
/**
 * Send email reply
 */
async function sendReply(threadId, messageId, reply) {
    try {
        const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
        });
        const headers = message.data.payload?.headers;
        const subject = headers?.find((h) => h.name === 'Subject')?.value || '';
        const from = headers?.find((h) => h.name === 'From')?.value || '';
        const emailContent = [
            `From: ${config_1.CONFIG.GMAIL.userEmail}`,
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
    }
    catch (error) {
        console.error('Error sending email reply:', error);
        throw error;
    }
}
/**
 * Helper function to get email body from payload
 */
function getEmailBody(payload) {
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
                if (body)
                    return body;
            }
        }
    }
    return '';
}
//# sourceMappingURL=client.js.map