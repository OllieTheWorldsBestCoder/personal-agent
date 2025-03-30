import { PineconeClient } from '@pinecone-database/pinecone';
import { CONFIG } from '../config';
import { getSmartResponse, generateEmbedding } from '../ai/client';

// Initialize Pinecone client
const pinecone = new PineconeClient({
  apiKey: CONFIG.PINECONE.apiKey,
  environment: CONFIG.PINECONE.environment,
});

const index = pinecone.Index(CONFIG.PINECONE.indexName);

// Type for memory entry
export interface MemoryEntry {
  id: string;
  text: string;
  metadata: {
    type: 'preference' | 'email' | 'conversation' | 'news';
    timestamp: string;
    category?: string;
    sender?: string;
    action?: string;
  };
  vector: number[];
}

// Type for memory query result
export interface MemoryQueryResult {
  matches: MemoryEntry[];
  summary?: string;
}

/**
 * Add a new memory entry
 */
export async function addMemory(
  text: string,
  metadata: Omit<MemoryEntry['metadata'], 'timestamp'>
): Promise<void> {
  try {
    // Generate embedding using OpenAI
    const embedding = await generateEmbedding(text);

    // Create memory entry
    const entry: MemoryEntry = {
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
  } catch (error) {
    console.error('Error adding memory:', error);
    throw error;
  }
}

/**
 * Query similar memories
 */
export async function queryMemory(
  query: string,
  limit: number = 5,
  filter?: Partial<MemoryEntry['metadata']>
): Promise<MemoryQueryResult> {
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

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
    const matches: MemoryEntry[] = queryResponse.matches?.map((match) => ({
      id: match.id,
      text: match.metadata?.text as string,
      metadata: {
        type: match.metadata?.type as MemoryEntry['metadata']['type'],
        timestamp: match.metadata?.timestamp as string,
        category: match.metadata?.category as string,
        sender: match.metadata?.sender as string,
        action: match.metadata?.action as string,
      },
      vector: match.values || [],
    })) || [];

    // Generate summary if needed
    let summary: string | undefined;
    if (matches.length > 0) {
      const summaryResponse = await getSmartResponse(
        [
          {
            role: 'user',
            content: `Summarize these memories in a concise way:\n\n${matches
              .map((m) => `- ${m.text}`)
              .join('\n')}`,
          },
        ],
        'simple'
      );
      summary = summaryResponse.content;
    }

    return {
      matches,
      summary,
    };
  } catch (error) {
    console.error('Error querying memory:', error);
    throw error;
  }
}

/**
 * Delete memory entries
 */
export async function deleteMemory(
  filter: Partial<MemoryEntry['metadata']>
): Promise<void> {
  try {
    await index.delete1({
      deleteRequest: {
        filter: JSON.stringify(filter),
      },
    });
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

/**
 * Update memory entry
 */
export async function updateMemory(
  id: string,
  updates: Partial<MemoryEntry>
): Promise<void> {
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
    const updatedEntry: MemoryEntry = {
      id: existing.id,
      text: updates.text || existing.metadata?.text as string,
      metadata: {
        ...existing.metadata as MemoryEntry['metadata'],
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
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
} 