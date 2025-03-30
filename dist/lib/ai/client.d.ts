export type AIModel = 'CLAUDE_SONNET' | 'CLAUDE_HAIKU' | 'GPT4';
export interface Message {
    role: 'user' | 'assistant';
    content: string;
}
export interface AIResponse {
    content: string;
    model: AIModel;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    embedding?: number[];
}
/**
 * Get a response from the specified AI model
 */
export declare function getAIResponse(messages: Message[], model?: AIModel): Promise<AIResponse>;
/**
 * Generate embeddings for text
 */
export declare function generateEmbedding(text: string): Promise<number[]>;
/**
 * Generate a voice note using OpenAI's TTS
 */
export declare function generateVoiceNote(text: string): Promise<Buffer>;
/**
 * Transcribe audio to text using OpenAI's Whisper
 */
export declare function transcribeAudio(audioBuffer: Buffer): Promise<string>;
/**
 * Get a response from the most appropriate model based on task complexity
 */
export declare function getSmartResponse(messages: Message[], taskComplexity?: 'simple' | 'complex' | 'creative'): Promise<AIResponse>;
