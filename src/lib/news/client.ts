import NewsAPI from 'newsapi';
import { CONFIG } from '../config';
import { getSmartResponse } from '../ai/client';

// Initialize NewsAPI client
const newsapi = new NewsAPI(CONFIG.NEWS.apiKey);

// Type for news article
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

// Type for news summary
export interface NewsSummary {
  articles: NewsArticle[];
  summary: string;
}

/**
 * Get top headlines
 */
export async function getTopHeadlines(): Promise<NewsArticle[]> {
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
  } catch (error) {
    console.error('Error getting top headlines:', error);
    throw error;
  }
}

/**
 * Get news summary with AI-generated overview
 */
export async function getNewsSummary(): Promise<NewsSummary> {
  try {
    const articles = await getTopHeadlines();

    // Generate summary using AI
    const aiResponse = await getSmartResponse(
      [
        {
          role: 'user',
          content: `Summarize these news headlines in a concise way:\n\n${articles
            .map((article) => `- ${article.title}`)
            .join('\n')}`,
        },
      ],
      'simple'
    );

    return {
      articles,
      summary: aiResponse.content,
    };
  } catch (error) {
    console.error('Error getting news summary:', error);
    throw error;
  }
}

/**
 * Get news by category
 */
export async function getNewsByCategory(
  category: string,
  pageSize: number = 5
): Promise<NewsArticle[]> {
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
  } catch (error) {
    console.error(`Error getting ${category} news:`, error);
    throw error;
  }
}

/**
 * Get personalized news based on user preferences
 */
export async function getPersonalizedNews(
  preferences: string[]
): Promise<NewsArticle[]> {
  try {
    const articles = await Promise.all(
      preferences.map((category) => getNewsByCategory(category))
    );

    // Flatten and sort by date
    return articles
      .flat()
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting personalized news:', error);
    throw error;
  }
} 