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
  console.log("🌟 ENVIRONMENT:", app.get("env"));
  console.log("🌟 NODE_ENV:", process.env.NODE_ENV);
  
  // Add explicit route registration logging
  console.log("🌟 REGISTERING API ROUTES...");
  
  // Test route that should ALWAYS work
  app.get("/api/test", (req, res) => {
    console.log("🌟 TEST ROUTE HIT!");
    res.json({ message: "API routes are working!", timestamp: new Date().toISOString() });
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

  // Get industries for the main UI
  app.get("/api/admin/industries", async (req, res) => {
    try {
      const industries = await storage.getIndustries();
      res.json(industries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add a simple health check endpoint
  app.get("/api/health", async (req, res) => {
    console.log("🌟 HEALTH CHECK CALLED");
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: app.get("env"),
      nodeEnv: process.env.NODE_ENV,
      routes: "API routes active"
    });
  });
  
  console.log("🌟 HEALTH ROUTE REGISTERED");

  // BIS Integration endpoint - for BIS app to call GSD
  app.post("/api/bis-integration", async (req, res) => {
    console.log("🌟🌟🌟 BIS INTEGRATION ENDPOINT HIT!!!");
    console.log("🌟 Request method:", req.method);
    console.log("🌟 Request path:", req.path);
    console.log("🌟 Request body:", req.body);
    try {
      const { location, industry, analysisId } = req.body;
      
      console.log('BIS Integration Request:', { location, industry, analysisId });
      
      if (!location || !industry) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: location and industry",
          analysisId: analysisId
        });
      }
      
      // Parse location (format: "City, State" or single city)
      const cities = location.includes(',') ? [location.split(',')[0].trim()] : [location];
      
      // Map industry names to our system
      const industryMapping: Record<string, string> = {
        'HVAC': 'HVAC',
        'Plumbing': 'Plumbing', 
        'Electrical': 'Electrical',
        'Digital Marketing': 'Digital Marketing',
        'Roofing': 'HVAC' // Default to HVAC if not found
      };
      
      const mappedIndustry = industryMapping[industry] || 'HVAC';
      
      // Make API call to our own keyword research endpoint
      console.log("🌟 Making internal API call to GSD keyword research...");
      
      const gsdResponse = await fetch(`http://localhost:5000/api/keyword-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          industry: mappedIndustry,
          cities: cities
        })
      });
      
      if (!gsdResponse.ok) {
        throw new Error(`GSD API error: ${gsdResponse.status}`);
      }
      
      const gsdData = await gsdResponse.json();
      console.log("🌟 BIS received GSD data:", gsdData.results?.length || 0, "keywords");
      
      // Process GSD results into BIS format
      const results = gsdData.results || [];
      const keywordsWithVolume = results.filter((k: KeywordResult) => k.searchVolume > 0);
      const keywordsWithoutVolume = results.filter((k: KeywordResult) => k.searchVolume === 0);
      
      // Calculate summary statistics
      const totalKeywords = results.length;
      const avgSearchVolume = keywordsWithVolume.length > 0 
        ? Math.round(keywordsWithVolume.reduce((sum: number, k: KeywordResult) => sum + k.searchVolume, 0) / keywordsWithVolume.length)
        : 0;
      const avgCPC = keywordsWithVolume.length > 0
        ? parseFloat((keywordsWithVolume.reduce((sum: number, k: KeywordResult) => sum + k.cpc, 0) / keywordsWithVolume.length).toFixed(2))
        : 0;
      
      // Return standardized BIS format with GSD data
      res.json({
        success: true,
        location: location,
        industry: industry,
        analysisId: analysisId,
        gsdResearchId: gsdData.id, // GSD's internal research ID
        keywordData: {
          primaryKeywords: keywordsWithVolume.slice(0, 10), // Top 10 with volume
          longTailKeywords: keywordsWithVolume.filter((k: KeywordResult) => k.keyword.split(' ').length > 3),
          competitorKeywords: [], // We don't currently track competitor-specific data
          summary: {
            totalKeywords: totalKeywords,
            keywordsWithVolume: keywordsWithVolume.length,
            keywordsWithoutVolume: keywordsWithoutVolume.length,
            avgSearchVolume: avgSearchVolume,
            avgCPC: avgCPC,
            competitionLevel: "medium" // Default since we don't calculate this specifically
          },
          seasonalTrends: {}, // Not currently implemented
          recommendations: [
            keywordsWithVolume.length > 0 ? `Focus on ${keywordsWithVolume.slice(0, 5).map((k: KeywordResult) => k.keyword).join(', ')} for highest impact` : "No high-volume keywords found",
            `Consider ${keywordsWithoutVolume.length} zero-volume keywords for SEO content strategy`,
            avgCPC > 0 ? `Average CPC of $${avgCPC} suggests competitive market` : "Low competition market with minimal paid advertising"
          ]
        },
        totalKeywords: totalKeywords,
        dataSource: "Google Search Detective API (Keywords Everywhere)",
        methodology: "Geo-targeted keyword combinations via GSD",
        analysisTimestamp: new Date().toISOString(),
        tamCalculation: mappedIndustry === 'HVAC' ? {
          available: true,
          note: "TAM calculation available for HVAC industry via GSD"
        } : {
          available: false,
          note: "TAM calculation currently only available for HVAC industry"
        }
      });
      
    } catch (error: any) {
      console.error('BIS Integration Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        analysisId: req.body.analysisId
      });
    }
  });
  
  console.log("🌟 BIS INTEGRATION ROUTE REGISTERED");

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
      const keywordSet = new Set<string>(); // Use Set to prevent duplicates
      
      industryData.keywords.forEach(keyword => {
        cities.forEach(city => {
          const keywordCity = `${keyword} ${city}`;
          const cityKeyword = `${city} ${keyword}`;
          
          // Only add if not already in set
          if (!keywordSet.has(keywordCity)) {
            keywordSet.add(keywordCity);
            keywordCombinations.push(keywordCity);
          }
          if (!keywordSet.has(cityKeyword)) {
            keywordSet.add(cityKeyword);
            keywordCombinations.push(cityKeyword);
          }
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
      const BATCH_SIZE = 250; // Optimal batch size
      const allResults = new Map();
      
      for (let i = 0; i < keywordCombinations.length; i += BATCH_SIZE) {
        const batch = keywordCombinations.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i/BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(keywordCombinations.length/BATCH_SIZE);
        
        console.log(`🌟 Processing batch ${batchNumber} of ${totalBatches} (${batch.length} keywords)`);
        
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
        
        // DIAGNOSTIC LOGGING - Track every keyword with volume
        console.log(`📊 BATCH ${batchNumber} DIAGNOSTIC - Processing ${data.data?.length || 0} API responses`);
        
        // Transform API response to our format
        if (data.data && Array.isArray(data.data)) {
          let batchVolumeCount = 0;
          let batchZeroCount = 0;
          
          data.data.forEach((item: any, index: number) => {
            const rawVolume = item.vol || item.volume || 0;
            const volume = rawVolume;
            
            // DIAGNOSTIC: Log first 10 items from each batch
            if (index < 10) {
              console.log(`🔍 RAW API ITEM ${index + 1}: keyword="${item.keyword}", vol=${item.vol}, volume=${item.volume}, finalVolume=${volume}`);
            }
            
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
            
            const processedResult = {
              volume: volume,
              cpc: cpc,
              competition: competition,
            };
            
            allResults.set(item.keyword, processedResult);
            
            // Count volume vs zero for diagnostics
            if (volume > 0) {
              batchVolumeCount++;
              // Log all keywords with volume for comparison
              console.log(`✅ VOLUME FOUND: "${item.keyword}" -> ${volume} searches, $${cpc} CPC`);
            } else {
              batchZeroCount++;
            }
            
            // DIAGNOSTIC: Log data transformation
            if (index < 5) {
              console.log(`🔄 TRANSFORMATION: "${item.keyword}" -> STORED: ${JSON.stringify(processedResult)}`);
            }
          });
          
          console.log(`📊 BATCH ${batchNumber} SUMMARY: ${batchVolumeCount} with volume, ${batchZeroCount} zero volume`);
        }
        
        // Comfortable delay between batches
        if (i + BATCH_SIZE < keywordCombinations.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
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

  // Get research history
  app.get("/api/keyword-research", async (req, res) => {
    try {
      const research = await storage.getKeywordResearches();
      res.json(research);
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

  // Update research title
  app.put("/api/keyword-research/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title } = req.body;
      
      const success = await storage.updateKeywordResearchTitle(id, title);
      
      if (!success) {
        return res.status(404).json({ message: "Research not found" });
      }
      
      res.json({ success: true, message: "Title updated successfully" });
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

  console.log("🌟 ALL API ROUTES REGISTERED SUCCESSFULLY");
  console.log("🌟 Routes available: /api/test, /api/health, /api/bis-integration, /api/keyword-research (GET/POST/PUT/DELETE)");
  
  const httpServer = createServer(app);
  return httpServer;
}