export interface MessageResult {
    success: boolean;
    error?: string;
}
/**
 * Process incoming WhatsApp message
 */
export declare function processIncomingMessage(message: string, from: string, state: any): Promise<MessageResult>;
/**
 * Send daily news update via WhatsApp
 */
export declare function sendDailyNews(summary: string, voiceNoteUrl?: string): Promise<MessageResult>;
/**
 * Send custom message via WhatsApp
 */
export declare function sendMessage(message: string, to: string): Promise<MessageResult>;
export declare const verifyTwilioSignature: (url: string, params: Record<string, string>, signature: string) => any;
