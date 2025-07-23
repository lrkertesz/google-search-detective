import { users, industries, settings, keywordResearches, type User, type InsertUser, type Industry, type InsertIndustry, type Settings, type InsertSettings, type KeywordResearch, type InsertKeywordResearch, type KeywordResult } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Industry management
  getIndustries(): Promise<Industry[]>;
  getIndustry(id: number): Promise<Industry | undefined>;
  getIndustryByName(name: string): Promise<Industry | undefined>;
  createIndustry(industry: InsertIndustry): Promise<Industry>;
  updateIndustry(id: number, industry: Partial<InsertIndustry>): Promise<Industry | undefined>;
  deleteIndustry(id: number): Promise<boolean>;
  // Settings management
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  // Keyword research
  createKeywordResearch(research: InsertKeywordResearch): Promise<KeywordResearch>;
  getKeywordResearches(): Promise<KeywordResearch[]>;
  getKeywordResearch(id: number): Promise<KeywordResearch | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private industries: Map<number, Industry>;
  private settings: Settings | undefined;
  private keywordResearches: Map<number, KeywordResearch>;
  private currentUserId: number;
  private currentIndustryId: number;
  private currentResearchId: number;

  constructor() {
    this.users = new Map();
    this.industries = new Map();
    this.keywordResearches = new Map();
    this.currentUserId = 1;
    this.currentIndustryId = 1;
    this.currentResearchId = 1;
    
    // Initialize with default industries
    this.seedIndustries();
  }

  private seedIndustries() {
    const defaultIndustries = [
      { name: "hvac", label: "HVAC", keywords: ["HVAC repair", "air conditioning repair", "heating repair", "HVAC installation", "air conditioning installation", "heating installation", "HVAC service", "air conditioning service", "heating service", "HVAC contractor", "AC repair", "furnace repair"] },
      { name: "plumbing", label: "Plumbing", keywords: ["plumber near me", "plumbing repair", "drain cleaning", "water heater repair", "plumbing service", "emergency plumber", "toilet repair", "pipe repair", "leak repair", "plumbing installation", "sewer cleaning", "faucet repair"] },
      { name: "electrical", label: "Electrical", keywords: ["electrician near me", "electrical repair", "electrical installation", "electrical service", "emergency electrician", "circuit breaker repair", "outlet installation", "electrical wiring", "panel upgrade", "lighting installation", "electrical inspection", "electrical contractor"] },
      { name: "digital-marketing", label: "Digital Marketing", keywords: ["digital marketing agency", "SEO services", "PPC management", "social media marketing", "web design", "online marketing", "search engine optimization", "digital advertising", "content marketing", "email marketing", "local SEO", "website development"] }
    ];

    defaultIndustries.forEach(industry => {
      const id = this.currentIndustryId++;
      const newIndustry: Industry = { ...industry, id };
      this.industries.set(id, newIndustry);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Industry methods
  async getIndustries(): Promise<Industry[]> {
    return Array.from(this.industries.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getIndustry(id: number): Promise<Industry | undefined> {
    return this.industries.get(id);
  }

  async getIndustryByName(name: string): Promise<Industry | undefined> {
    return Array.from(this.industries.values()).find(industry => industry.name === name);
  }

  async createIndustry(insertIndustry: InsertIndustry): Promise<Industry> {
    const id = this.currentIndustryId++;
    const industry: Industry = { 
      id,
      name: insertIndustry.name,
      label: insertIndustry.label,
      keywords: [...(insertIndustry.keywords || [])]
    };
    this.industries.set(id, industry);
    return industry;
  }

  async updateIndustry(id: number, updateData: Partial<InsertIndustry>): Promise<Industry | undefined> {
    const existing = this.industries.get(id);
    if (!existing) return undefined;
    
    const updated: Industry = { 
      ...existing, 
      ...updateData,
      keywords: updateData.keywords ? [...updateData.keywords] : existing.keywords
    };
    this.industries.set(id, updated);
    return updated;
  }

  async deleteIndustry(id: number): Promise<boolean> {
    return this.industries.delete(id);
  }

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    // Check environment variable first, then fall back to in-memory storage
    const envApiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (envApiKey) {
      // If environment variable exists, return settings with env API key
      return {
        id: 1,
        keywordsEverywhereApiKey: envApiKey,
        createdAt: this.settings?.createdAt || new Date(),
        updatedAt: new Date()
      };
    }
    
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    if (!this.settings) {
      this.settings = {
        id: 1,
        keywordsEverywhereApiKey: insertSettings.keywordsEverywhereApiKey || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      this.settings = {
        ...this.settings,
        ...insertSettings,
        updatedAt: new Date()
      };
    }
    return this.settings;
  }

  async createKeywordResearch(insertResearch: InsertKeywordResearch): Promise<KeywordResearch> {
    const id = this.currentResearchId++;
    const research: KeywordResearch = { 
      id,
      industry: insertResearch.industry,
      cities: [...(insertResearch.cities || [])],
      results: [...(insertResearch.results || [])] as KeywordResult[],
      createdAt: new Date()
    };
    this.keywordResearches.set(id, research);
    return research;
  }

  async getKeywordResearches(): Promise<KeywordResearch[]> {
    return Array.from(this.keywordResearches.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getKeywordResearch(id: number): Promise<KeywordResearch | undefined> {
    return this.keywordResearches.get(id);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getIndustries(): Promise<Industry[]> {
    return await db.select().from(industries);
  }

  async getIndustry(id: number): Promise<Industry | undefined> {
    const [industry] = await db.select().from(industries).where(eq(industries.id, id));
    return industry || undefined;
  }

  async getIndustryByName(name: string): Promise<Industry | undefined> {
    const [industry] = await db.select().from(industries).where(eq(industries.name, name));
    return industry || undefined;
  }

  async createIndustry(insertIndustry: InsertIndustry): Promise<Industry> {
    const [industry] = await db
      .insert(industries)
      .values(insertIndustry)
      .returning();
    return industry;
  }

  async updateIndustry(id: number, updateData: Partial<InsertIndustry>): Promise<Industry | undefined> {
    const [industry] = await db
      .update(industries)
      .set(updateData)
      .where(eq(industries.id, id))
      .returning();
    return industry || undefined;
  }

  async deleteIndustry(id: number): Promise<boolean> {
    const result = await db.delete(industries).where(eq(industries.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSettings(): Promise<Settings | undefined> {
    // Check environment variable first, then fall back to database
    const envApiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (envApiKey) {
      // If environment variable exists, return settings with env API key
      const [dbSettings] = await db.select().from(settings).limit(1);
      return {
        id: dbSettings?.id || 1,
        keywordsEverywhereApiKey: envApiKey,
        createdAt: dbSettings?.createdAt || new Date(),
        updatedAt: new Date()
      };
    }
    
    const [dbSettings] = await db.select().from(settings).limit(1);
    return dbSettings || undefined;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await db.select().from(settings).limit(1);
    
    if (existing.length === 0) {
      const [newSettings] = await db
        .insert(settings)
        .values(insertSettings)
        .returning();
      return newSettings;
    } else {
      const [updatedSettings] = await db
        .update(settings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(settings.id, existing[0].id))
        .returning();
      return updatedSettings;
    }
  }

  async createKeywordResearch(insertResearch: InsertKeywordResearch): Promise<KeywordResearch> {
    const [research] = await db
      .insert(keywordResearches)
      .values(insertResearch)
      .returning();
    return research;
  }

  async getKeywordResearches(): Promise<KeywordResearch[]> {
    return await db
      .select()
      .from(keywordResearches)
      .orderBy(desc(keywordResearches.createdAt));
  }

  async getKeywordResearch(id: number): Promise<KeywordResearch | undefined> {
    const [research] = await db.select().from(keywordResearches).where(eq(keywordResearches.id, id));
    return research || undefined;
  }
}

export const storage = new DatabaseStorage();
