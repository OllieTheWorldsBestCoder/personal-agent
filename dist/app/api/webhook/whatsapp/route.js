"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@/lib/whatsapp/client");
const orchestrator_1 = require("@/lib/orchestrator");
// Initialize state
const state = (0, orchestrator_1.initializeState)();
async function POST(request) {
    try {
        const formData = await request.formData();
        const message = formData.get('Body');
        const from = formData.get('From');
        if (!message || !from) {
            return server_1.NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        // Process message
        const result = await (0, client_1.processIncomingMessage)(message, from, state);
        if (!result.success) {
            return server_1.NextResponse.json({ error: result.error }, { status: 500 });
        }
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map