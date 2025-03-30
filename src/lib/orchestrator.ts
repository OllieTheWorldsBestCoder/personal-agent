import { CONFIG } from './config';
import { getSmartResponse, generateVoiceNote } from './ai/client';
import { processIncomingMessage, sendDailyNews } from './whatsapp/client';
import { getEmailSummary, getUnreadEmails, archiveEmail } from './email/client';
import { getNewsSummary } from './news/client';
import { addMemory, queryMemory } from './memory/client';

// Type for user preferences
export interface UserPreferences {
  autoArchiveNewsletters: boolean;
  autoDeletePromos: boolean;
  dailyNewsTime: string;
  timezone: string;
}

// Type for conversation context
export interface ConversationContext {
  lastTopic?: string;
  lastAction?: string;
  pendingAction?: string;
  lastEmailId?: string;
  lastNewsDate?: string;
}

// Type for agent state
export interface AgentState {
  preferences: UserPreferences;
  context: ConversationContext;
}

/**
 * Initialize agent state
 */
export function initializeState(): AgentState {
  return {
    preferences: {
      autoArchiveNewsletters: false,
      autoDeletePromos: false,
      dailyNewsTime: CONFIG.DAILY_UPDATE.hour.toString(),
      timezone: CONFIG.NEWS.timezone,
    },
    context: {},
  };
}

/**
 * Process user message and update state
 */
export async function processMessage(
  message: string,
  state: AgentState
): Promise<{ response: string; state: AgentState }> {
  try {
    // Query relevant memories
    const memories = await queryMemory(message);
    const memoryContext = memories.summary
      ? `\nRelevant context: ${memories.summary}`
      : '';

    // Get AI response with context
    const aiResponse = await getSmartResponse(
      [
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
      ],
      'complex'
    );

    // Update state based on response
    const newState = { ...state };
    if (message.toLowerCase().includes('email')) {
      newState.context.lastTopic = 'email';
    } else if (message.toLowerCase().includes('news')) {
      newState.context.lastTopic = 'news';
    }

    // Store interaction in memory
    await addMemory(message, {
      type: 'conversation',
      category: newState.context.lastTopic,
    });

    return {
      response: aiResponse.content,
      state: newState,
    };
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

/**
 * Process daily news update
 */
export async function processDailyNews(
  state: AgentState
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get news summary
    const newsSummary = await getNewsSummary();

    // Generate voice note
    const voiceNote = await generateVoiceNote(newsSummary.summary);

    // Send via WhatsApp
    const result = await sendDailyNews(newsSummary.summary, voiceNote);

    // Update state
    state.context.lastNewsDate = new Date().toISOString();

    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
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
export async function processEmailUpdates(
  state: AgentState
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get email summary
    const emailSummary = await getEmailSummary();

    // Get unread emails
    const unreadEmails = await getUnreadEmails();

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
        await archiveEmail(email.id);
        continue;
      }

      // Store email in memory
      await addMemory(email.body, {
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
  } catch (error) {
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
export async function updatePreferences(
  state: AgentState,
  updates: Partial<UserPreferences>
): Promise<AgentState> {
  const newState = {
    ...state,
    preferences: {
      ...state.preferences,
      ...updates,
    },
  };

  // Store preferences in memory
  await addMemory(
    `Updated preferences: ${JSON.stringify(updates)}`,
    {
      type: 'preference',
      category: 'settings',
    }
  );

  return newState;
} 