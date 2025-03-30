"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMemory = addMemory;
exports.queryMemory = queryMemory;
exports.deleteMemory = deleteMemory;
exports.updateMemory = updateMemory;
const pinecone_1 = require("@pinecone-database/pinecone");
const config_1 = require("../config");
const client_1 = require("../ai/client");
// Initialize Pinecone client
const pinecone = new pinecone_1.PineconeClient({
    apiKey: config_1.CONFIG.PINECONE.apiKey,
    environment: config_1.CONFIG.PINECONE.environment,
});
const index = pinecone.Index(config_1.CONFIG.PINECONE.indexName);
/**
 * Add a new memory entry
 */
async function addMemory(text, metadata) {
    try {
        // Generate embedding using OpenAI
        const embedding = await (0, client_1.generateEmbedding)(text);
        // Create memory entry
        const entry = {
            id: `mem_${Date.now()}`,
            text,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
            },
            vector: embedding,
        };
        // Upsert to Pinecone
        await index.upsert({
            upsertRequest: {
                vectors: [
                    {
                        id: entry.id,
                        values: entry.vector,
                        metadata: {
                            text: entry.text,
                            ...entry.metadata,
                        },
                    },
                ],
            },
        });
    }
    catch (error) {
        console.error('Error adding memory:', error);
        throw error;
    }
}
/**
 * Query similar memories
 */
async function queryMemory(query, limit = 5, filter) {
    try {
        // Generate embedding for query
        const queryEmbedding = await (0, client_1.generateEmbedding)(query);
        // Query Pinecone
        const queryResponse = await index.query({
            queryRequest: {
                vector: queryEmbedding,
                topK: limit,
                includeMetadata: true,
                filter: filter ? JSON.stringify(filter) : undefined,
            },
        });
        // Format results
        const matches = queryResponse.matches?.map((match) => ({
            id: match.id,
            text: match.metadata?.text,
            metadata: {
                type: match.metadata?.type,
                timestamp: match.metadata?.timestamp,
                category: match.metadata?.category,
                sender: match.metadata?.sender,
                action: match.metadata?.action,
            },
            vector: match.values || [],
        })) || [];
        // Generate summary if needed
        let summary;
        if (matches.length > 0) {
            const summaryResponse = await (0, client_1.getSmartResponse)([
                {
                    role: 'user',
                    content: `Summarize these memories in a concise way:\n\n${matches
                        .map((m) => `- ${m.text}`)
                        .join('\n')}`,
                },
            ], 'simple');
            summary = summaryResponse.content;
        }
        return {
            matches,
            summary,
        };
    }
    catch (error) {
        console.error('Error querying memory:', error);
        throw error;
    }
}
/**
 * Delete memory entries
 */
async function deleteMemory(filter) {
    try {
        await index.delete1({
            deleteRequest: {
                filter: JSON.stringify(filter),
            },
        });
    }
    catch (error) {
        console.error('Error deleting memory:', error);
        throw error;
    }
}
/**
 * Update memory entry
 */
async function updateMemory(id, updates) {
    try {
        // Get existing entry
        const queryResponse = await index.query({
            queryRequest: {
                vector: [0], // Dummy vector, we'll filter by ID
                topK: 1,
                includeMetadata: true,
                filter: JSON.stringify({ id }),
            },
        });
        if (!queryResponse.matches?.length) {
            throw new Error(`Memory entry ${id} not found`);
        }
        const existing = queryResponse.matches[0];
        // Update entry
        const updatedEntry = {
            id: existing.id,
            text: updates.text || existing.metadata?.text,
            metadata: {
                ...existing.metadata,
                ...updates.metadata,
            },
            vector: updates.vector || existing.values || [],
        };
        // Upsert updated entry
        await index.upsert({
            upsertRequest: {
                vectors: [
                    {
                        id: updatedEntry.id,
                        values: updatedEntry.vector,
                        metadata: {
                            text: updatedEntry.text,
                            ...updatedEntry.metadata,
                        },
                    },
                ],
            },
        });
    }
    catch (error) {
        console.error('Error updating memory:', error);
        throw error;
    }
}
//# sourceMappingURL=client.js.map