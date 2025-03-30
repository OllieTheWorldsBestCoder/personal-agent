"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const client_1 = require("@/lib/news/client");
const client_2 = require("@/lib/ai/client");
const client_3 = require("@/lib/whatsapp/client");
async function GET(request) {
    try {
        // Get top headlines
        const articles = await (0, client_1.getTopHeadlines)({
            country: 'gb',
            pageSize: 5,
        });
        // Generate news summary using AI
        const summary = await (0, client_2.generateText)(`Here are today's top headlines:\n${articles
            .map((article) => `- ${article.title}`)
            .join('\n')}`, 'creative', {
            systemPrompt: `You are a news anchor. Create a brief, engaging summary of today's top headlines.
Keep it under 60 seconds when read aloud. Use a conversational tone and make it sound natural.
Start with "Good morning! Here are today's top stories:" and end with "Stay tuned for more updates tomorrow!"`,
        });
        // Generate voice note
        const audioResponse = await (0, client_2.generateVoice)(summary, 'nova');
        const audioBuffer = await audioResponse.arrayBuffer();
        // Upload audio to a temporary URL (you'll need to implement this)
        // For now, we'll use a placeholder URL
        const audioUrl = 'https://example.com/audio.mp3';
        // Send voice note via WhatsApp
        await (0, client_3.sendVoiceNote)(audioUrl, 'Daily News Update');
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error generating daily news:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map