import { users, industries, settings, keywordResearches, type User, type InsertUser, type Industry, type InsertIndustry, type Settings, type InsertSettings, type KeywordResearch, type InsertKeywordResearch } from "@shared/schema";
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
  deleteKeywordResearch(id: number): Promise<boolean>;
}

// Database storage implementation (REAL DATA ONLY)
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
      .values({
        name: insertIndustry.name,
        label: insertIndustry.label,
        keywords: insertIndustry.keywords
      })
      .returning();
    return industry;
  }

  async updateIndustry(id: number, updateData: Partial<InsertIndustry>): Promise<Industry | undefined> {
    const updateValues: any = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.label !== undefined) updateValues.label = updateData.label;
    if (updateData.keywords !== undefined) updateValues.keywords = updateData.keywords;
    
    const [industry] = await db
      .update(industries)
      .set(updateValues)
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
      .values({
        industry: insertResearch.industry,
        cities: insertResearch.cities,
        results: insertResearch.results
      })
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

  async deleteKeywordResearch(id: number): Promise<boolean> {
    const result = await db.delete(keywordResearches).where(eq(keywordResearches.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();