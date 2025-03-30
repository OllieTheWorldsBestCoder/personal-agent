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
  source: {
    name: string;
  };
  publishedAt: string;
  content?: string;
}

// Type for news summary
export interface NewsSummary {
  articles: NewsArticle[];
  summary: string;
}

/**
 * Get top headlines
 */
export async function getTopHeadlines(
  category: string = 'general',
  country: string = 'gb'
): Promise<NewsArticle[]> {
  try {
    const response = await newsapi.v2.topHeadlines({
      category,
      country,
      pageSize: 10,
      language: 'en'
    });

    return response.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: {
        name: article.source.name
      },
      publishedAt: article.publishedAt,
      content: article.content
    }));
  } catch (error) {
    console.error('Error getting top headlines:', error);
    throw error;
  }
}

/**
 * Get news summary
 */
export async function getNewsSummary(): Promise<NewsSummary> {
  try {
    // Get top headlines
    const articles = await getTopHeadlines();

    // Generate summary
    const summaryResponse = await getSmartResponse(
      [
        {
          role: 'user',
          content: `Summarize these news articles in a concise way:\n\n${articles
            .map(
              (a) =>
                `${a.title}\n${a.description || ''}\nSource: ${
                  a.source.name
                }\n\n`
            )
            .join('')}`
        }
      ],
      'simple'
    );

    return {
      articles,
      summary: summaryResponse.content
    };
  } catch (error) {
    console.error('Error getting news summary:', error);
    throw error;
  }
}

/**
 * Search news articles
 */
export async function searchNews(
  query: string,
  from?: string,
  to?: string
): Promise<NewsArticle[]> {
  try {
    const response = await newsapi.v2.everything({
      q: query,
      from,
      to,
      language: 'en',
      sortBy: 'relevancy',
      pageSize: 10
    });

    return response.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: {
        name: article.source.name
      },
      publishedAt: article.publishedAt,
      content: article.content
    }));
  } catch (error) {
    console.error('Error searching news:', error);
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
      source: {
        name: article.source?.name || ''
      },
      publishedAt: article.publishedAt || '',
      content: article.content
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