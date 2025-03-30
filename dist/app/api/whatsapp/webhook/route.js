"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@/lib/whatsapp/client");
const client_2 = require("@/lib/ai/client");
const client_3 = require("@/lib/memory/client");
async function POST(request) {
    try {
        // Get the request body
        const body = await request.formData();
        const params = Object.fromEntries(body.entries());
        // Verify Twilio signature
        const signature = request.headers.get('x-twilio-signature');
        const url = request.url;
        if (!signature || !(0, client_1.verifyTwilioSignature)(url, params, signature)) {
            return server_1.NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }
        // Get message details
        const message = params.Body;
        const from = params.From;
        // Query relevant memories
        const memories = await (0, client_3.queryMemories)(message);
        const memoryContext = memories
            .map((m) => m.metadata?.text)
            .join('\n');
        // Generate response using AI
        const response = await (0, client_2.generateText)(`Context from previous interactions:\n${memoryContext}\n\nUser message: ${message}`, 'complex', {
            systemPrompt: `You are a helpful personal AI assistant. You can:
1. Check and summarize emails
2. Provide news updates
3. Answer questions
4. Learn from user preferences

Be concise and friendly in your responses. If you need to perform an action, use the appropriate function call.`,
        });
        // Send response back to user
        await (0, client_1.sendTextMessage)(response);
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map