"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIResponse = getAIResponse;
exports.generateEmbedding = generateEmbedding;
exports.generateVoiceNote = generateVoiceNote;
exports.transcribeAudio = transcribeAudio;
exports.getSmartResponse = getSmartResponse;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config");
// Initialize AI clients
const anthropic = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Get a response from the specified AI model
 */
async function getAIResponse(messages, model = 'CLAUDE_SONNET') {
    const modelConfig = config_1.CONFIG.AI[model];
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
        }
        else if (model === 'GPT4') {
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
    }
    catch (error) {
        console.error(`Error getting AI response from ${model}:`, error);
        throw error;
    }
}
/**
 * Generate embeddings for text
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text,
        });
        return response.data[0].embedding;
    }
    catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}
/**
 * Generate a voice note using OpenAI's TTS
 */
async function generateVoiceNote(text) {
    try {
        const response = await openai.audio.speech.create({
            model: config_1.CONFIG.AI.TTS.model,
            voice: config_1.CONFIG.AI.TTS.voice,
            input: text,
        });
        return Buffer.from(await response.arrayBuffer());
    }
    catch (error) {
        console.error('Error generating voice note:', error);
        throw error;
    }
}
/**
 * Transcribe audio to text using OpenAI's Whisper
 */
async function transcribeAudio(audioBuffer) {
    try {
        const response = await openai.audio.transcriptions.create({
            model: config_1.CONFIG.AI.WHISPER.model,
            file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' }),
        });
        return response.text;
    }
    catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}
/**
 * Get a response from the most appropriate model based on task complexity
 */
async function getSmartResponse(messages, taskComplexity = 'complex') {
    const modelMap = {
        simple: 'CLAUDE_HAIKU',
        complex: 'CLAUDE_SONNET',
        creative: 'GPT4',
    };
    return getAIResponse(messages, modelMap[taskComplexity]);
}
//# sourceMappingURL=client.js.map