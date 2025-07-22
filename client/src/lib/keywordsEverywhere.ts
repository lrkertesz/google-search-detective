// Keywords Everywhere API client
// Note: In production, this would be implemented on the backend
// to protect API keys and handle rate limiting

export interface KeywordData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
}

export class KeywordsEverywhereClient {
  private apiKey: string;
  private baseUrl = "https://api.keywordseverywhere.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getKeywordData(keywords: string[]): Promise<KeywordData[]> {
    const API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY || 
                   process.env.KWE_API_KEY || 
                   this.apiKey;

    if (!API_KEY) {
      throw new Error("Keywords Everywhere API key not found");
    }

    try {
      const response = await fetch(`${this.baseUrl}/get_keyword_data`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: "US",
          currency: "USD",
          dataSource: "gkp",
          kw: keywords,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to our format
      return data.data.map((item: any) => ({
        keyword: item.keyword,
        volume: item.vol || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0,
      }));
    } catch (error) {
      console.error("Keywords Everywhere API error:", error);
      throw error;
    }
  }

  async getBulkKeywordData(keywords: string[], batchSize = 100): Promise<KeywordData[]> {
    const results: KeywordData[] = [];
    
    // Process keywords in batches to respect API limits
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      const batchResults = await this.getKeywordData(batch);
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const keywordsEverywhereClient = new KeywordsEverywhereClient(
  process.env.KEYWORDS_EVERYWHERE_API_KEY || 
  process.env.KWE_API_KEY || 
  ""
);
