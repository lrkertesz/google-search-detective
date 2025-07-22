import { users, keywordResearches, type User, type InsertUser, type KeywordResearch, type InsertKeywordResearch } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createKeywordResearch(research: InsertKeywordResearch): Promise<KeywordResearch>;
  getKeywordResearches(): Promise<KeywordResearch[]>;
  getKeywordResearch(id: number): Promise<KeywordResearch | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private keywordResearches: Map<number, KeywordResearch>;
  private currentUserId: number;
  private currentResearchId: number;

  constructor() {
    this.users = new Map();
    this.keywordResearches = new Map();
    this.currentUserId = 1;
    this.currentResearchId = 1;
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
