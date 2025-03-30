import { CONFIG } from '../config';
import { ChatMessage } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';

// Type for AI model configuration
export type AIModel = {
  model: string;
  maxTokens: number;
  temperature: number;
};

// Type for task complexity
export type TaskComplexity = 'simple' | 'complex';

// Model mapping based on task complexity
const modelMap: Record<TaskComplexity, AIModel> = {
  simple: CONFIG.AI.CLAUDE_HAIKU,
  complex: CONFIG.AI.CLAUDE_SONNET
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get AI response using appropriate model
 */
export async function getAIResponse(
  messages: ChatMessage[],
  model: AIModel
): Promise<{ content: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: model.model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: model.maxTokens,
      temperature: model.temperature
    });

    return {
      content: response.choices[0].message.content || ''
    };
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

/**
 * Get smart response based on task complexity
 */
export async function getSmartResponse(
  messages: ChatMessage[],
  taskComplexity: TaskComplexity = 'simple'
): Promise<{ content: string }> {
  const model = modelMap[taskComplexity];
  return getAIResponse(messages, model);
}

/**
 * Generate voice note from text
 */
export async function generateVoiceNote(
  text: string
): Promise<Buffer> {
  try {
    const response = await openai.audio.speech.create({
      model: CONFIG.AI.TTS.model,
      voice: CONFIG.AI.TTS.voice,
      input: text
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Error generating voice note:', error);
    throw error;
  }
}

/**
 * Generate text from voice note
 */
export async function generateText(
  audioBuffer: Buffer
): Promise<string> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' }),
      model: CONFIG.AI.WHISPER.model
    });

    return response.text;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
} 