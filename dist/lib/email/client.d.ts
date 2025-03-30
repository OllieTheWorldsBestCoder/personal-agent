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
export declare function getUnreadEmails(): Promise<EmailMessage[]>;
/**
 * Get email summary
 */
export declare function getEmailSummary(): Promise<EmailSummary>;
/**
 * Mark email as read
 */
export declare function markAsRead(messageId: string): Promise<void>;
/**
 * Archive email
 */
export declare function archiveEmail(messageId: string): Promise<void>;
/**
 * Send email reply
 */
export declare function sendReply(threadId: string, messageId: string, reply: string): Promise<void>;
