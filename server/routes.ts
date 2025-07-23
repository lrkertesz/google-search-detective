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

// Mock Keywords Everywhere API call
async function fetchKeywordData(keywords: string[]): Promise<Map<string, any>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const results = new Map();
  
  keywords.forEach(keyword => {
    // Generate realistic mock data based on keyword characteristics
    const isLongTail = keyword.split(' ').length > 3;
    const hasLocation = keyword.includes('near me') || keyword.includes('local');
    
    let volume = 0;
    let cpc = 0;
    let competition = 0;
    
    if (Math.random() > 0.4) { // 60% chance of having volume (more realistic)
      if (isLongTail) {
        volume = Math.floor(Math.random() * 30) + 10; // 10-40 (more realistic for long-tail)
        cpc = Math.random() * 3 + 1; // $1-4
        competition = Math.random() * 30 + 10; // 10-40%
      } else if (hasLocation) {
        volume = Math.floor(Math.random() * 100) + 20; // 20-120 (local searches)
        cpc = Math.random() * 8 + 2; // $2-10
        competition = Math.random() * 40 + 30; // 30-70%
      } else {
        volume = Math.floor(Math.random() * 150) + 30; // 30-180 (much more realistic)
        cpc = Math.random() * 12 + 3; // $3-15
        competition = Math.random() * 50 + 40; // 40-90%
      }
    } else {
      // Zero volume keywords still have CPC data
      volume = 0;
      cpc = Math.random() * 3 + 0.5; // $0.5-3.5
      competition = 0; // Will be auto-corrected
    }
    
    results.set(keyword, {
      volume: Math.round(volume),
      cpc: Math.round(cpc * 100) / 100,
      competition: Math.round(competition)
    });
  });
  
  return results;
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
      
      // Generate all keyword combinations
      const keywordCombinations: string[] = [];
      industryData.keywords.forEach(keyword => {
        cities.forEach(city => {
          keywordCombinations.push(`${keyword} ${city}`);
        });
      });
      
      // Check if we have API key for real data
      const settings = await storage.getSettings();
      let keywordData: Map<string, any>;
      
      if (settings?.keywordsEverywhereApiKey) {
        try {
          console.log("🔑 Using real Keywords Everywhere API for", keywordCombinations.length, "keywords");
          // Use real Keywords Everywhere API
          keywordData = await fetchKeywordDataFromAPI(keywordCombinations, settings.keywordsEverywhereApiKey);
          console.log("✅ Real API data retrieved successfully");
        } catch (error) {
          console.error("❌ API failed, falling back to mock data:", error);
          keywordData = await fetchKeywordData(keywordCombinations);
        }
      } else {
        console.log("⚠️ No API key found, using mock data for", keywordCombinations.length, "keywords");
        // Use mock data if no API key
        keywordData = await fetchKeywordData(keywordCombinations);
      }
      
      // Process results
      const results: KeywordResult[] = [];
      keywordCombinations.forEach(combination => {
        const data = keywordData.get(combination);
        if (data) {
          // Determine opportunity level
          let opportunity: "High" | "Medium" | "Low" = "Low";
          if (data.volume > 500 && data.competition < 60) {
            opportunity = "High";
          } else if (data.volume > 100 && data.competition < 75) {
            opportunity = "Medium";
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

  const httpServer = createServer(app);
  return httpServer;
}
