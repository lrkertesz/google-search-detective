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
    
    // Transform API response to our format
    data.data.forEach((item: any) => {
      results.set(item.keyword, {
        volume: item.vol || 0,
        cpc: item.cpc || 0,
        competition: item.vol === 0 ? 0 : (item.competition || 0), // Auto-correct zero volume
      });
    });

    return results;
  } catch (error) {
    console.error("Keywords Everywhere API error:", error);
    throw error;
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
    
    if (Math.random() > 0.3) { // 70% chance of having volume
      if (isLongTail) {
        volume = Math.floor(Math.random() * 100) + 10; // 10-110
        cpc = Math.random() * 5 + 1; // $1-6
        competition = Math.random() * 40 + 10; // 10-50%
      } else if (hasLocation) {
        volume = Math.floor(Math.random() * 500) + 50; // 50-550
        cpc = Math.random() * 10 + 3; // $3-13
        competition = Math.random() * 30 + 40; // 40-70%
      } else {
        volume = Math.floor(Math.random() * 2000) + 100; // 100-2100
        cpc = Math.random() * 15 + 5; // $5-20
        competition = Math.random() * 40 + 50; // 50-90%
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
          // Use real Keywords Everywhere API
          keywordData = await fetchKeywordDataFromAPI(keywordCombinations, settings.keywordsEverywhereApiKey);
        } catch (error) {
          console.error("API failed, falling back to mock data:", error);
          keywordData = await fetchKeywordData(keywordCombinations);
        }
      } else {
        // Use mock data if no API key
        keywordData = await fetchKeywordData(keywordCombinations);
      }
      
      // Process results
      const results: KeywordResult[] = [];
      keywordCombinations.forEach(combination => {
        const parts = combination.split(' ');
        const city = parts[parts.length - 1];
        const phrase = parts.slice(0, -1).join(' ');
        
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
            phrase,
            city,
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
