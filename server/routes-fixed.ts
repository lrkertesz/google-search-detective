// Fixed routes with nuclear API implementation
import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";

// Schema validation
const keywordSearchRequestSchema = z.object({
  industry: z.string(),
  cities: z.array(z.string()).min(1)
});

type KeywordResult = {
  keyword: string;
  searchVolume: number;
  cpc: number;
};

export async function registerFixedRoutes(app: Express): Promise<Server> {
  console.log("🌟 FIXED ROUTES LOADING:", new Date().toISOString());

  // Get research history
  app.get("/api/keyword-research", async (req, res) => {
    try {
      const researches = await storage.getKeywordResearches();
      res.json(researches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Nuclear fix keyword research route
  app.post("/api/keyword-research", async (req, res) => {
    console.log("🌟🌟🌟 NUCLEAR FIX ROUTE EXECUTING:", new Date().toISOString());
    console.log("🌟 Request body:", JSON.stringify(req.body));
    
    try {
      const validatedData = keywordSearchRequestSchema.parse(req.body);
      const { industry, cities } = validatedData;
      
      console.log("🌟 Industry:", industry);
      console.log("🌟 Cities:", cities);
      
      // Get base keywords for the industry from database
      const industryData = await storage.getIndustryByName(industry);
      if (!industryData) {
        return res.status(400).json({ message: "Industry not found" });
      }
      
      // Generate all keyword combinations (city before AND after keyword)
      const keywordCombinations: string[] = [];
      industryData.keywords.forEach(keyword => {
        cities.forEach(city => {
          keywordCombinations.push(`${keyword} ${city}`);
          keywordCombinations.push(`${city} ${keyword}`);
        });
      });
      
      console.log("🌟 Generated", keywordCombinations.length, "keyword combinations");
      console.log("🌟 Sample keywords:", keywordCombinations.slice(0, 5));
      
      // Get API key
      const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY || process.env.KWE_API_KEY;
      const settings = await storage.getSettings();
      const dbApiKey = settings?.keywordsEverywhereApiKey;
      const finalApiKey = apiKey || dbApiKey;
      
      if (!finalApiKey) {
        return res.status(400).json({ 
          message: "Keywords Everywhere API key is required. Please configure your API key in the admin settings." 
        });
      }
      
      console.log("🌟 Starting nuclear API implementation");
      console.log("🌟 API Key length:", finalApiKey.length);
      console.log("🌟 API Key prefix:", finalApiKey.substring(0, 8) + "...");
      
      // NUCLEAR API IMPLEMENTATION
      const API_URL = "https://api.keywordseverywhere.com/v1/get_keyword_data";
      const BATCH_SIZE = 10; // Smaller batches for testing
      const allResults = new Map();
      
      for (let i = 0; i < keywordCombinations.length; i += BATCH_SIZE) {
        const batch = keywordCombinations.slice(i, i + BATCH_SIZE);
        console.log(`🌟 Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(keywordCombinations.length/BATCH_SIZE)} (${batch.length} keywords)`);
        
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${finalApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: "US",
            currency: "USD",
            dataSource: "gkp",
            kw: batch,
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (i === 0) {
          console.log("🌟 Raw API response sample:", JSON.stringify(data.data?.slice(0, 3), null, 2));
          console.log("🌟 API Response status:", response.status);
          console.log("🌟 API Response credits remaining:", data.credits_remaining);
          
          // CRITICAL: Check for unrealistic volumes that indicate fake data
          if (data.data && data.data.length > 0) {
            const firstItem = data.data[0];
            const volume = firstItem.vol || firstItem.volume || 0;
            if (volume > 5000) {
              console.log("🚨 CRITICAL ERROR: Fake data detected:", volume, "for keyword:", firstItem.keyword);
              console.log("🚨 Keywords Everywhere API returning unrealistic volumes");
              console.log("🚨 Real KWE data should be 30-390 searches for small cities");
              throw new Error("API returning fake data - stopping research to prevent mock data usage");
            }
          }
        }
        
        // Transform API response to our format
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            const volume = item.vol || item.volume || 0;
            
            let cpc = 0;
            if (typeof item.cpc === 'number') {
              cpc = item.cpc;
            } else if (item.cpc && typeof item.cpc === 'object' && item.cpc.value !== undefined) {
              cpc = parseFloat(item.cpc.value) || 0;
            }
            
            let competition = volume === 0 ? 0 : (item.competition || 0);
            if (competition > 0 && competition <= 1) {
              competition = Math.round(competition * 100);
            }
            
            allResults.set(item.keyword, {
              volume: volume,
              cpc: cpc,
              competition: competition,
            });
            
            // Log keywords with actual volume
            if (volume > 0 && allResults.size <= 10) {
              console.log(`🌟 FOUND VOLUME: "${item.keyword}" -> ${volume} searches, $${cpc} CPC`);
            }
          });
        }
        
        // Small delay between batches
        if (i + BATCH_SIZE < keywordCombinations.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log("🌟 Nuclear API implementation complete");
      console.log("🌟 API returned data for", allResults.size, "keywords");
      
      // Process results
      const results: KeywordResult[] = [];
      
      keywordCombinations.forEach(combination => {
        const data = allResults.get(combination);
        
        let searchVolume = 0;
        let cpc = 0;
        
        if (data) {
          searchVolume = data.volume;
          cpc = data.cpc;
          console.log(`🌟 PROCESSING: "${combination}" -> ${searchVolume} searches`);
        }
        
        results.push({
          keyword: combination,
          searchVolume: searchVolume,
          cpc: cpc
        });
      });
      
      // Save to storage
      const savedResearch = await storage.createKeywordResearch({
        industry,
        cities,
        results
      });
      
      console.log("🌟 Research saved with", results.length, "keywords");
      const volumeKeywords = results.filter(r => r.searchVolume > 0);
      console.log("🌟 Keywords with volume:", volumeKeywords.length);
      
      res.json(savedResearch);
    } catch (error: any) {
      console.error("🌟 ERROR:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}