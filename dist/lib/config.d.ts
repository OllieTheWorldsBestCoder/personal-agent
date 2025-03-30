export declare const AI_CONFIG: {
    readonly CLAUDE_SONNET: {
        readonly model: "claude-3-sonnet-20240229";
        readonly maxTokens: 4096;
        readonly temperature: 0.7;
    };
    readonly CLAUDE_HAIKU: {
        readonly model: "claude-3-haiku-20240307";
        readonly maxTokens: 2048;
        readonly temperature: 0.7;
    };
    readonly GPT4: {
        readonly model: "gpt-4-turbo-preview";
        readonly maxTokens: 4096;
        readonly temperature: 0.7;
    };
    readonly TTS: {
        readonly model: "tts-1-hd";
        readonly voice: "alloy";
    };
    readonly WHISPER: {
        readonly model: "whisper-1";
    };
};
export declare const WHATSAPP_CONFIG: {
    readonly accountSid: string;
    readonly authToken: string;
    readonly whatsappNumber: string;
    readonly userPhoneNumber: string;
};
export declare const GMAIL_CONFIG: {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly refreshToken: string;
    readonly userEmail: string;
};
export declare const PINECONE_CONFIG: {
    readonly apiKey: string;
    readonly environment: string;
    readonly indexName: string;
};
export declare const NEWS_CONFIG: {
    readonly apiKey: string;
    readonly timezone: string;
};
export declare const MEMORY_CONFIG: {
    readonly maxTokens: 1000;
    readonly temperature: 0.7;
    readonly topP: 0.9;
};
export declare const DAILY_UPDATE_CONFIG: {
    readonly hour: 8;
    readonly minute: 0;
    readonly timezone: string;
};
export declare const EMAIL_CONFIG: {
    readonly maxEmailsPerBatch: 10;
    readonly importanceThreshold: 0.7;
    readonly categories: readonly ["important", "urgent", "newsletter", "social", "other"];
};
export declare const VOICE_CONFIG: {
    readonly maxLength: 300;
    readonly format: "mp3";
    readonly quality: "high";
};
export declare const ERROR_CONFIG: {
    readonly maxRetries: 3;
    readonly retryDelay: 1000;
    readonly timeout: 30000;
};
export declare const CRON_CONFIG: {
    readonly secret: string;
};
export declare const CONFIG: {
    readonly AI: {
        readonly CLAUDE_SONNET: {
            readonly model: "claude-3-sonnet-20240229";
            readonly maxTokens: 4096;
            readonly temperature: 0.7;
        };
        readonly CLAUDE_HAIKU: {
            readonly model: "claude-3-haiku-20240307";
            readonly maxTokens: 2048;
            readonly temperature: 0.7;
        };
        readonly GPT4: {
            readonly model: "gpt-4-turbo-preview";
            readonly maxTokens: 4096;
            readonly temperature: 0.7;
        };
        readonly TTS: {
            readonly model: "tts-1-hd";
            readonly voice: "alloy";
        };
        readonly WHISPER: {
            readonly model: "whisper-1";
        };
    };
    readonly WHATSAPP: {
        readonly accountSid: string;
        readonly authToken: string;
        readonly whatsappNumber: string;
        readonly userPhoneNumber: string;
    };
    readonly GMAIL: {
        readonly clientId: string;
        readonly clientSecret: string;
        readonly refreshToken: string;
        readonly userEmail: string;
    };
    readonly PINECONE: {
        readonly apiKey: string;
        readonly environment: string;
        readonly indexName: string;
    };
    readonly NEWS: {
        readonly apiKey: string;
        readonly timezone: string;
    };
    readonly MEMORY: {
        readonly maxTokens: 1000;
        readonly temperature: 0.7;
        readonly topP: 0.9;
    };
    readonly DAILY_UPDATE: {
        readonly hour: 8;
        readonly minute: 0;
        readonly timezone: string;
    };
    readonly EMAIL: {
        readonly maxEmailsPerBatch: 10;
        readonly importanceThreshold: 0.7;
        readonly categories: readonly ["important", "urgent", "newsletter", "social", "other"];
    };
    readonly VOICE: {
        readonly maxLength: 300;
        readonly format: "mp3";
        readonly quality: "high";
    };
    readonly ERROR: {
        readonly maxRetries: 3;
        readonly retryDelay: 1000;
        readonly timeout: 30000;
    };
    readonly CRON: {
        readonly secret: string;
    };
    readonly TWILIO: {
        readonly accountSid: string;
        readonly authToken: string;
        readonly phoneNumber: string;
        readonly userPhoneNumber: string;
    };
};
