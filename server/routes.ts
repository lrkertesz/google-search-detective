import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { keywordSearchRequestSchema, type KeywordResult } from "@shared/schema";
import { z } from "zod";

// Pre-loaded keyword lists for each industry
const INDUSTRY_KEYWORDS = {
  "hvac": [
    "HVAC repair",
    "air conditioning repair",
    "heating repair",
    "HVAC installation",
    "air conditioning installation",
    "heating installation",
    "HVAC service",
    "air conditioning service",
    "heating service",
    "HVAC contractor",
    "AC repair",
    "furnace repair"
  ],
  "plumbing": [
    "plumber near me",
    "plumbing repair",
    "drain cleaning",
    "water heater repair",
    "plumbing service",
    "emergency plumber",
    "toilet repair",
    "pipe repair",
    "leak repair",
    "plumbing installation",
    "sewer cleaning",
    "faucet repair"
  ],
  "electrical": [
    "electrician near me",
    "electrical repair",
    "electrical installation",
    "electrical service",
    "emergency electrician",
    "circuit breaker repair",
    "outlet installation",
    "electrical wiring",
    "panel upgrade",
    "lighting installation",
    "electrical inspection",
    "electrical contractor"
  ],
  "digital-marketing": [
    "digital marketing agency",
    "SEO services",
    "PPC management",
    "social media marketing",
    "web design",
    "online marketing",
    "search engine optimization",
    "digital advertising",
    "content marketing",
    "email marketing",
    "local SEO",
    "website development"
  ]
};

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
  
  // Get industry keywords
  app.get("/api/industries/:industry/keywords", async (req, res) => {
    try {
      const industry = req.params.industry as keyof typeof INDUSTRY_KEYWORDS;
      
      if (!INDUSTRY_KEYWORDS[industry]) {
        return res.status(404).json({ message: "Industry not found" });
      }
      
      res.json({
        industry,
        keywords: INDUSTRY_KEYWORDS[industry]
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
      
      // Get base keywords for the industry
      const baseKeywords = INDUSTRY_KEYWORDS[industry];
      if (!baseKeywords) {
        return res.status(400).json({ message: "Invalid industry" });
      }
      
      // Generate all keyword combinations
      const keywordCombinations: string[] = [];
      baseKeywords.forEach(keyword => {
        cities.forEach(city => {
          keywordCombinations.push(`${keyword} ${city}`);
        });
      });
      
      // Fetch keyword data from API
      const keywordData = await fetchKeywordData(keywordCombinations);
      
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
