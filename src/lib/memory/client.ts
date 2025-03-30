import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../config';
import { generateEmbedding } from '../ai/client';

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: CONFIG.PINECONE.apiKey,
  environment: CONFIG.PINECONE.environment
});

// Get index
const index = pinecone.index(CONFIG.PINECONE.indexName);

// Type for memory metadata
export interface MemoryMetadata {
  type: 'conversation' | 'email' | 'news' | 'preference';
  category?: string;
  sender?: string;
  timestamp?: string;
  text?: string;
}

// Type for memory entry
export interface MemoryEntry {
  id: string;
  metadata: MemoryMetadata;
  embedding: number[];
  score?: number;
}

/**
 * Add a memory to the vector database
 */
export async function addMemory(
  text: string,
  metadata: MemoryMetadata
): Promise<void> {
  try {
    const embedding = await generateEmbedding(text);
    const id = `memory_${Date.now()}`;

    await index.upsert([{
      id,
      values: embedding,
      metadata: {
        ...metadata,
        text,
        timestamp: new Date().toISOString()
      }
    }]);
  } catch (error) {
    console.error('Error adding memory:', error);
    throw error;
  }
}

/**
 * Query memories by similarity
 */
export async function queryMemory(
  text: string,
  limit: number = 5
): Promise<{ matches: MemoryEntry[]; summary: string }> {
  try {
    const embedding = await generateEmbedding(text);

    const queryResponse = await index.query({
      vector: embedding,
      topK: limit,
      includeMetadata: true
    });

    const matches: MemoryEntry[] = queryResponse.matches.map((match) => ({
      id: match.id,
      metadata: match.metadata as MemoryMetadata,
      embedding: match.values,
      score: match.score
    }));

    // Generate summary of relevant memories
    const summary = matches
      .map((m) => m.metadata?.text)
      .filter(Boolean)
      .join('\n');

    return { matches, summary };
  } catch (error) {
    console.error('Error querying memories:', error);
    throw error;
  }
}

/**
 * Delete a memory by ID
 */
export async function deleteMemory(id: string): Promise<void> {
  try {
    await index.deleteOne(id);
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

/**
 * Delete all memories
 */
export async function deleteAllMemories(): Promise<void> {
  try {
    await index.deleteAll();
  } catch (error) {
    console.error('Error deleting all memories:', error);
    throw error;
  }
} 