"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTwilioSignature = void 0;
exports.processIncomingMessage = processIncomingMessage;
exports.sendDailyNews = sendDailyNews;
exports.sendMessage = sendMessage;
const twilio_1 = require("twilio");
const config_1 = require("../config");
const orchestrator_1 = require("../orchestrator");
// Initialize Twilio client
const twilioClient = new twilio_1.Twilio(config_1.CONFIG.TWILIO.accountSid, config_1.CONFIG.TWILIO.authToken);
/**
 * Process incoming WhatsApp message
 */
async function processIncomingMessage(message, from, state) {
    try {
        // Process message through orchestrator
        const { response, state: newState } = await (0, orchestrator_1.processMessage)(message, state);
        // Send response via WhatsApp
        await twilioClient.messages.create({
            body: response,
            from: `whatsapp:${config_1.CONFIG.TWILIO.phoneNumber}`,
            to: `whatsapp:${from}`,
        });
        return { success: true };
    }
    catch (error) {
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
async function sendDailyNews(summary, voiceNoteUrl) {
    try {
        // Send text summary
        await twilioClient.messages.create({
            body: summary,
            from: `whatsapp:${config_1.CONFIG.TWILIO.phoneNumber}`,
            to: `whatsapp:${config_1.CONFIG.TWILIO.userPhoneNumber}`,
        });
        // Send voice note if available
        if (voiceNoteUrl) {
            await twilioClient.messages.create({
                body: 'Here\'s your daily news update:',
                mediaUrl: [voiceNoteUrl],
                from: `whatsapp:${config_1.CONFIG.TWILIO.phoneNumber}`,
                to: `whatsapp:${config_1.CONFIG.TWILIO.userPhoneNumber}`,
            });
        }
        return { success: true };
    }
    catch (error) {
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
async function sendMessage(message, to) {
    try {
        await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${config_1.CONFIG.TWILIO.phoneNumber}`,
            to: `whatsapp:${to}`,
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error sending message:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
// Function to verify Twilio webhook signature
const verifyTwilioSignature = (url, params, signature) => {
    return twilioClient.validateRequest(config_1.CONFIG.TWILIO.authToken, signature, url, params);
};
exports.verifyTwilioSignature = verifyTwilioSignature;
//# sourceMappingURL=client.js.map