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
export interface MemoryQueryResult {
    matches: MemoryEntry[];
    summary?: string;
}
/**
 * Add a new memory entry
 */
export declare function addMemory(text: string, metadata: Omit<MemoryEntry['metadata'], 'timestamp'>): Promise<void>;
/**
 * Query similar memories
 */
export declare function queryMemory(query: string, limit?: number, filter?: Partial<MemoryEntry['metadata']>): Promise<MemoryQueryResult>;
/**
 * Delete memory entries
 */
export declare function deleteMemory(filter: Partial<MemoryEntry['metadata']>): Promise<void>;
/**
 * Update memory entry
 */
export declare function updateMemory(id: string, updates: Partial<MemoryEntry>): Promise<void>;
