import { users, industries, settings, keywordResearches, type User, type InsertUser, type Industry, type InsertIndustry, type Settings, type InsertSettings, type KeywordResearch, type InsertKeywordResearch } from "@shared/schema";

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
    const industry: Industry = { ...insertIndustry, id };
    this.industries.set(id, industry);
    return industry;
  }

  async updateIndustry(id: number, updateData: Partial<InsertIndustry>): Promise<Industry | undefined> {
    const existing = this.industries.get(id);
    if (!existing) return undefined;
    
    const updated: Industry = { ...existing, ...updateData };
    this.industries.set(id, updated);
    return updated;
  }

  async deleteIndustry(id: number): Promise<boolean> {
    return this.industries.delete(id);
  }

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
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
      ...insertResearch, 
      id,
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

export const storage = new MemStorage();
