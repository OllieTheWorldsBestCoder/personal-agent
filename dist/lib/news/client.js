"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopHeadlines = getTopHeadlines;
exports.getNewsSummary = getNewsSummary;
exports.getNewsByCategory = getNewsByCategory;
exports.getPersonalizedNews = getPersonalizedNews;
const newsapi_1 = __importDefault(require("newsapi"));
const config_1 = require("../config");
const client_1 = require("../ai/client");
// Initialize NewsAPI client
const newsapi = new newsapi_1.default(config_1.CONFIG.NEWS.apiKey);
/**
 * Get top headlines
 */
async function getTopHeadlines() {
    try {
        const response = await newsapi.v2.topHeadlines({
            country: 'us',
            pageSize: 10,
        });
        return response.articles.map((article) => ({
            title: article.title || '',
            description: article.description || '',
            url: article.url || '',
            source: article.source?.name || '',
            publishedAt: article.publishedAt || '',
            category: article.category || 'general',
        }));
    }
    catch (error) {
        console.error('Error getting top headlines:', error);
        throw error;
    }
}
/**
 * Get news summary with AI-generated overview
 */
async function getNewsSummary() {
    try {
        const articles = await getTopHeadlines();
        // Generate summary using AI
        const aiResponse = await (0, client_1.getSmartResponse)([
            {
                role: 'user',
                content: `Summarize these news headlines in a concise way:\n\n${articles
                    .map((article) => `- ${article.title}`)
                    .join('\n')}`,
            },
        ], 'simple');
        return {
            articles,
            summary: aiResponse.content,
        };
    }
    catch (error) {
        console.error('Error getting news summary:', error);
        throw error;
    }
}
/**
 * Get news by category
 */
async function getNewsByCategory(category, pageSize = 5) {
    try {
        const response = await newsapi.v2.topHeadlines({
            country: 'us',
            category,
            pageSize,
        });
        return response.articles.map((article) => ({
            title: article.title || '',
            description: article.description || '',
            url: article.url || '',
            source: article.source?.name || '',
            publishedAt: article.publishedAt || '',
            category: article.category || category,
        }));
    }
    catch (error) {
        console.error(`Error getting ${category} news:`, error);
        throw error;
    }
}
/**
 * Get personalized news based on user preferences
 */
async function getPersonalizedNews(preferences) {
    try {
        const articles = await Promise.all(preferences.map((category) => getNewsByCategory(category)));
        // Flatten and sort by date
        return articles
            .flat()
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, 10);
    }
    catch (error) {
        console.error('Error getting personalized news:', error);
        throw error;
    }
}
//# sourceMappingURL=client.js.map