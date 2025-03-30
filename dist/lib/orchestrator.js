"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeState = initializeState;
exports.processMessage = processMessage;
exports.processDailyNews = processDailyNews;
exports.processEmailUpdates = processEmailUpdates;
exports.updatePreferences = updatePreferences;
const config_1 = require("./config");
const client_1 = require("./ai/client");
const client_2 = require("./whatsapp/client");
const client_3 = require("./email/client");
const client_4 = require("./news/client");
const client_5 = require("./memory/client");
/**
 * Initialize agent state
 */
function initializeState() {
    return {
        preferences: {
            autoArchiveNewsletters: false,
            autoDeletePromos: false,
            dailyNewsTime: config_1.CONFIG.DAILY_UPDATE.hour.toString(),
            timezone: config_1.CONFIG.NEWS.timezone,
        },
        context: {},
    };
}
/**
 * Process user message and update state
 */
async function processMessage(message, state) {
    try {
        // Query relevant memories
        const memories = await (0, client_5.queryMemory)(message);
        const memoryContext = memories.summary
            ? `\nRelevant context: ${memories.summary}`
            : '';
        // Get AI response with context
        const aiResponse = await (0, client_1.getSmartResponse)([
            {
                role: 'user',
                content: `You are a helpful personal AI assistant. Current preferences:
- Auto-archive newsletters: ${state.preferences.autoArchiveNewsletters}
- Auto-delete promos: ${state.preferences.autoDeletePromos}
- Daily news time: ${state.preferences.dailyNewsTime}
${memoryContext}`,
            },
            {
                role: 'user',
                content: message,
            },
        ], 'complex');
        // Update state based on response
        const newState = { ...state };
        if (message.toLowerCase().includes('email')) {
            newState.context.lastTopic = 'email';
        }
        else if (message.toLowerCase().includes('news')) {
            newState.context.lastTopic = 'news';
        }
        // Store interaction in memory
        await (0, client_5.addMemory)(message, {
            type: 'conversation',
            category: newState.context.lastTopic,
        });
        return {
            response: aiResponse.content,
            state: newState,
        };
    }
    catch (error) {
        console.error('Error processing message:', error);
        throw error;
    }
}
/**
 * Process daily news update
 */
async function processDailyNews(state) {
    try {
        // Get news summary
        const newsSummary = await (0, client_4.getNewsSummary)();
        // Generate voice note
        const voiceNote = await (0, client_1.generateVoiceNote)(newsSummary.summary);
        // Send via WhatsApp
        const result = await (0, client_2.sendDailyNews)(newsSummary.summary, voiceNote);
        // Update state
        state.context.lastNewsDate = new Date().toISOString();
        return {
            success: result.success,
            error: result.error,
        };
    }
    catch (error) {
        console.error('Error processing daily news:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Process email updates
 */
async function processEmailUpdates(state) {
    try {
        // Get email summary
        const emailSummary = await (0, client_3.getEmailSummary)();
        // Get unread emails
        const unreadEmails = await (0, client_3.getUnreadEmails)();
        // Process based on preferences
        for (const email of unreadEmails) {
            // Skip if already processed
            if (email.id === state.context.lastEmailId) {
                continue;
            }
            // Check if it's a newsletter
            const isNewsletter = email.labels.includes('CATEGORY_PROMOTIONS');
            // Auto-archive newsletters if enabled
            if (isNewsletter && state.preferences.autoArchiveNewsletters) {
                await (0, client_3.archiveEmail)(email.id);
                continue;
            }
            // Store email in memory
            await (0, client_5.addMemory)(email.body, {
                type: 'email',
                category: isNewsletter ? 'newsletter' : 'personal',
                sender: email.from,
            });
        }
        // Update state
        if (unreadEmails.length > 0) {
            state.context.lastEmailId = unreadEmails[0].id;
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error processing email updates:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Update user preferences
 */
async function updatePreferences(state, updates) {
    const newState = {
        ...state,
        preferences: {
            ...state.preferences,
            ...updates,
        },
    };
    // Store preferences in memory
    await (0, client_5.addMemory)(`Updated preferences: ${JSON.stringify(updates)}`, {
        type: 'preference',
        category: 'settings',
    });
    return newState;
}
//# sourceMappingURL=orchestrator.js.map