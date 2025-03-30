export interface UserPreferences {
    autoArchiveNewsletters: boolean;
    autoDeletePromos: boolean;
    dailyNewsTime: string;
    timezone: string;
}
export interface ConversationContext {
    lastTopic?: string;
    lastAction?: string;
    pendingAction?: string;
    lastEmailId?: string;
    lastNewsDate?: string;
}
export interface AgentState {
    preferences: UserPreferences;
    context: ConversationContext;
}
/**
 * Initialize agent state
 */
export declare function initializeState(): AgentState;
/**
 * Process user message and update state
 */
export declare function processMessage(message: string, state: AgentState): Promise<{
    response: string;
    state: AgentState;
}>;
/**
 * Process daily news update
 */
export declare function processDailyNews(state: AgentState): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Process email updates
 */
export declare function processEmailUpdates(state: AgentState): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Update user preferences
 */
export declare function updatePreferences(state: AgentState, updates: Partial<UserPreferences>): Promise<AgentState>;
