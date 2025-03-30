"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const orchestrator_1 = require("@/lib/orchestrator");
const orchestrator_2 = require("@/lib/orchestrator");
// Initialize state
const state = (0, orchestrator_2.initializeState)();
async function POST(request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Process daily news
        const result = await (0, orchestrator_1.processDailyNews)(state);
        if (!result.success) {
            return server_1.NextResponse.json({ error: result.error }, { status: 500 });
        }
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error processing daily update:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map