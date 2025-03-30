export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    category: string;
}
export interface NewsSummary {
    articles: NewsArticle[];
    summary: string;
}
/**
 * Get top headlines
 */
export declare function getTopHeadlines(): Promise<NewsArticle[]>;
/**
 * Get news summary with AI-generated overview
 */
export declare function getNewsSummary(): Promise<NewsSummary>;
/**
 * Get news by category
 */
export declare function getNewsByCategory(category: string, pageSize?: number): Promise<NewsArticle[]>;
/**
 * Get personalized news based on user preferences
 */
export declare function getPersonalizedNews(preferences: string[]): Promise<NewsArticle[]>;
