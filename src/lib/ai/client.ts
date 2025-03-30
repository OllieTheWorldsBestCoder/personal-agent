import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { CONFIG } from '../config';

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for AI model selection
export type AIModel = 'CLAUDE_SONNET' | 'CLAUDE_HAIKU' | 'GPT4';

// Type for message format
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Type for AI response
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
export async function getAIResponse(
  messages: Message[],
  model: AIModel = 'CLAUDE_SONNET'
): Promise<AIResponse> {
  const modelConfig = CONFIG.AI[model];

  try {
    if (model.startsWith('CLAUDE')) {
      const response = await anthropic.messages.create({
        model: modelConfig.model,
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
        messages: messages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      });

      return {
        content: response.content[0].text,
        model,
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: response.usage?.input_tokens + response.usage?.output_tokens || 0,
        },
      };
    } else if (model === 'GPT4') {
      const response = await openai.chat.completions.create({
        model: modelConfig.model,
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      return {
        content: response.choices[0].message.content || '',
        model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    }

    throw new Error(`Unsupported model: ${model}`);
  } catch (error) {
    console.error(`Error getting AI response from ${model}:`, error);
    throw error;
  }
}

/**
 * Generate embeddings for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate a voice note using OpenAI's TTS
 */
export async function generateVoiceNote(text: string): Promise<Buffer> {
  try {
    const response = await openai.audio.speech.create({
      model: CONFIG.AI.TTS.model,
      voice: CONFIG.AI.TTS.voice,
      input: text,
    });

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error('Error generating voice note:', error);
    throw error;
  }
}

/**
 * Transcribe audio to text using OpenAI's Whisper
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    const response = await openai.audio.transcriptions.create({
      model: CONFIG.AI.WHISPER.model,
      file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' }),
    });

    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Get a response from the most appropriate model based on task complexity
 */
export async function getSmartResponse(
  messages: Message[],
  taskComplexity: 'simple' | 'complex' | 'creative' = 'complex'
): Promise<AIResponse> {
  const modelMap = {
    simple: 'CLAUDE_HAIKU',
    complex: 'CLAUDE_SONNET',
    creative: 'GPT4',
  };

  return getAIResponse(messages, modelMap[taskComplexity]);
} 