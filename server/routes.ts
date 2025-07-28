import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { keywordSearchRequestSchema, insertIndustrySchema, insertSettingsSchema, type KeywordResult, type Industry } from "@shared/schema";
import { z } from "zod";

// Keywords Everywhere API integration
async function fetchKeywordDataFromAPI(keywords: string[], apiKey: string): Promise<Map<string, any>> {
  const API_URL = "https://api.keywordseverywhere.com/v1/get_keyword_data";
  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
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
    const results = new Map();
    
    console.log("📊 Raw API response sample:", JSON.stringify(data.data?.slice(0, 3), null, 2));
    
    // Transform API response to our format
    data.data.forEach((item: any) => {
      const volume = item.vol || item.volume || 0;
      
      // Handle CPC - it might be a number or an object with currency/value
      let cpc = 0;
      if (typeof item.cpc === 'number') {
        cpc = item.cpc;
      } else if (item.cpc && typeof item.cpc === 'object' && item.cpc.value !== undefined) {
        cpc = parseFloat(item.cpc.value) || 0;
      }
      
      // Handle competition - convert from 0-1 scale to percentage if needed
      let competition = volume === 0 ? 0 : (item.competition || 0);
      if (competition > 0 && competition <= 1) {
        competition = Math.round(competition * 100); // Convert to percentage
      }
      
      results.set(item.keyword, {
        volume: volume,
        cpc: cpc,
        competition: competition,
      });
      
      // Log first few entries for debugging
      if (results.size <= 3) {
        console.log(`🔍 Keyword: "${item.keyword}" -> Volume: ${volume}, CPC: ${cpc}, Competition: ${competition}%`);
      }
    });

    return results;
  } catch (error) {
    console.error("Keywords Everywhere API error:", error);
    throw error;
  }
}

// Test API key connectivity
async function testApiKey(apiKey: string): Promise<{ valid: boolean; message: string; creditsRemaining?: number }> {
  const API_URL = "https://api.keywordseverywhere.com/v1/get_keyword_data";
  
  try {
    // Test with a simple keyword to minimize credit usage
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        country: "US",
        currency: "USD",
        dataSource: "gkp",
        kw: ["test"], // Single test keyword
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        return { valid: false, message: "Invalid API key - authentication failed" };
      } else if (response.status === 403) {
        return { valid: false, message: "API key valid but insufficient credits" };
      } else if (response.status === 429) {
        return { valid: false, message: "Rate limit exceeded - try again later" };
      } else {
        return { valid: false, message: `API error: ${response.status} ${response.statusText}` };
      }
    }

    const data = await response.json();
    
    // Check if response has expected structure
    if (data && typeof data === 'object') {
      const creditsRemaining = data.credits_remaining || data.creditsRemaining;
      return { 
        valid: true, 
        message: "API key is valid and working correctly",
        creditsRemaining: creditsRemaining 
      };
    } else {
      return { valid: false, message: "Unexpected API response format" };
    }
  } catch (error: any) {
    console.error("API key test error:", error);
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return { valid: false, message: "Network connectivity issue - check internet connection" };
    } else if (error.name === 'AbortError') {
      return { valid: false, message: "Request timeout - API may be slow" };
    } else {
      return { valid: false, message: `Connection error: ${error.message}` };
    }
  }
}



export async function registerRoutes(app: Express): Promise<Server> {
  
  // Admin/Settings routes
  
  // Get all industries
  app.get("/api/admin/industries", async (req, res) => {
    try {
      const industries = await storage.getIndustries();
      res.json(industries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new industry
  app.post("/api/admin/industries", async (req, res) => {
    try {
      const validatedData = insertIndustrySchema.parse(req.body);
      const industry = await storage.createIndustry(validatedData);
      res.json(industry);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update industry
  app.put("/api/admin/industries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertIndustrySchema.partial().parse(req.body);
      const industry = await storage.updateIndustry(id, validatedData);
      
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
      
      res.json(industry);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete industry
  app.delete("/api/admin/industries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteIndustry(id);
      
      if (!success) {
        return res.status(404).json({ message: "Industry not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      // Always show current settings including environment variables
      res.json(settings || { keywordsEverywhereApiKey: null });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update settings
  app.put("/api/admin/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      
      res.json(settings);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Test API key
  app.post("/api/admin/test-api-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ message: "API key is required" });
      }

      const result = await testApiKey(apiKey);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        valid: false, 
        message: `Test failed: ${error.message}` 
      });
    }
  });

  // Test current API key (environment or database)
  app.get("/api/admin/test-current-api-key", async (req, res) => {
    try {
      const envApiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY || process.env.KWE_API_KEY;
      const settings = await storage.getSettings();
      const dbApiKey = settings?.keywordsEverywhereApiKey;
      
      const finalApiKey = envApiKey || dbApiKey;
      
      if (!finalApiKey) {
        return res.json({ 
          valid: false, 
          message: "No API key found in environment variables or database",
          source: "none"
        });
      }

      const result = await testApiKey(finalApiKey);
      res.json({
        ...result,
        source: envApiKey ? "environment" : "database"
      });
    } catch (error: any) {
      res.status(500).json({ 
        valid: false, 
        message: `Test failed: ${error.message}`,
        source: "unknown"
      });
    }
  });
  
  // Get industry keywords (backwards compatible)
  app.get("/api/industries/:industry/keywords", async (req, res) => {
    try {
      const industryName = req.params.industry;
      const industry = await storage.getIndustryByName(industryName);
      
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
      
      res.json({
        industry: industry.name,
        keywords: industry.keywords
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Start keyword research
  app.post("/api/keyword-research", async (req, res) => {
    try {
      const validatedData = keywordSearchRequestSchema.parse(req.body);
      const { industry, cities } = validatedData;
      
      // Get base keywords for the industry from database
      const industryData = await storage.getIndustryByName(industry);
      if (!industryData) {
        return res.status(400).json({ message: "Industry not found" });
      }
      
      // Generate all keyword combinations (city before AND after keyword)
      const keywordCombinations: string[] = [];
      industryData.keywords.forEach(keyword => {
        cities.forEach(city => {
          // Add city after keyword: "HVAC repair Miami"
          keywordCombinations.push(`${keyword} ${city}`);
          // Add city before keyword: "Miami HVAC repair"
          keywordCombinations.push(`${city} ${keyword}`);
        });
      });
      
      // Check if we have API key for real data (check both environment and database)
      const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY || 
                    process.env.KWE_API_KEY;
      
      const settings = await storage.getSettings();
      const dbApiKey = settings?.keywordsEverywhereApiKey;
      
      const finalApiKey = apiKey || dbApiKey;
      let keywordData: Map<string, any>;
      
      if (!finalApiKey) {
        return res.status(400).json({ 
          message: "Keywords Everywhere API key is required. Please configure your API key in the admin settings." 
        });
      }

      try {
        console.log("🔑 Using Keywords Everywhere API for", keywordCombinations.length, "keywords");
        keywordData = await fetchKeywordDataFromAPI(keywordCombinations, finalApiKey);
        console.log("✅ API data retrieved successfully");
      } catch (error) {
        console.error("❌ Keywords Everywhere API failed:", error);
        return res.status(500).json({ 
          message: "Failed to retrieve keyword data from Keywords Everywhere API. Please check your API key and try again.",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
      
      // Process results
      const results: KeywordResult[] = [];
      keywordCombinations.forEach(combination => {
        const data = keywordData.get(combination);
        if (data) {
          // Determine opportunity level based on business value
          // High opportunity: Good volume + Low CPC (affordable to bid on)
          // Medium opportunity: Decent volume OR low CPC but not both
          // Low opportunity: Low volume AND high CPC
          let opportunity: "High" | "Medium" | "Low" = "Low";
          
          const hasGoodVolume = data.volume >= 50; // Minimum viable search volume
          const hasHighVolume = data.volume >= 200; // Strong search volume
          const hasLowCPC = data.cpc <= 5.00; // Affordable cost per click
          const hasVeryLowCPC = data.cpc <= 2.00; // Very affordable
          const hasExcellentCPC = data.cpc <= 1.50; // Excellent value
          
          // Business-focused opportunity logic accounting for Google's broad matching behavior
          // Note: $0.00 CPC keywords may not perform as expected due to Google showing
          // higher-bid "similar" keywords instead of exact matches
          
          const isZeroCPC = data.cpc === 0;
          
          if (hasGoodVolume && hasExcellentCPC && !isZeroCPC) {
            // Good volume + excellent cost (but not zero) = HIGH
            opportunity = "High";
          } else if (hasHighVolume && hasVeryLowCPC && !isZeroCPC) {
            // High volume + very low cost (but not zero) = HIGH
            opportunity = "High";
          } else if (hasGoodVolume && hasVeryLowCPC && !isZeroCPC) {
            // Good volume + very low cost (but not zero) = HIGH
            opportunity = "High";
          } else if (hasGoodVolume && hasLowCPC) {
            // Good volume + reasonable cost = MEDIUM
            opportunity = "Medium";
          } else if (hasVeryLowCPC && data.volume >= 10 && !isZeroCPC) {
            // Very cheap clicks = MEDIUM (but downgrade zero-cost keywords)
            opportunity = "Medium";
          } else if (isZeroCPC && data.volume >= 50) {
            // Zero CPC with decent volume = MEDIUM (potential but risky due to broad matching)
            opportunity = "Medium";
          } else if (isZeroCPC && data.volume >= 10) {
            // Zero CPC with low volume = LOW (Google likely shows competing ads)
            opportunity = "Low";
          }
          
          results.push({
            keyword: combination, // Store complete keyword phrase including city
            searchVolume: data.volume,
            cpc: data.cpc,
            competition: data.volume === 0 ? 0 : data.competition, // Auto-correct zero volume
            opportunity
          });
        }
      });
      
      // Save to storage
      const savedResearch = await storage.createKeywordResearch({
        industry,
        cities,
        results
      });
      
      res.json(savedResearch);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get research history
  app.get("/api/keyword-research", async (req, res) => {
    try {
      const researches = await storage.getKeywordResearches();
      res.json(researches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get specific research
  app.get("/api/keyword-research/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const research = await storage.getKeywordResearch(id);
      
      if (!research) {
        return res.status(404).json({ message: "Research not found" });
      }
      
      res.json(research);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete specific research
  app.delete("/api/keyword-research/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteKeywordResearch(id);
      
      if (!success) {
        return res.status(404).json({ message: "Research not found" });
      }
      
      res.json({ success: true, message: "Research deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
