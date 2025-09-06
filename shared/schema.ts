import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - keeping existing serial ID and adapting for Replit Auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(), // Keep existing serial ID
  replitId: varchar("replit_id").unique(), // Store Replit user ID separately 
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"), 
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add new tables for admin functionality
export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  keywords: json("keywords").$type<string[]>().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  keywordsEverywhereApiKey: text("keywords_everywhere_api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const keywordResearches = pgTable("keyword_researches", {
  id: serial("id").primaryKey(),
  title: text("title"),
  industry: text("industry").notNull(),
  cities: json("cities").$type<string[]>().notNull(),
  results: json("results").$type<KeywordResult[]>().notNull(),
  source: text("source").notNull().default("Admin"), // Track if search came from BIS or Admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  replitId: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  replitId: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertIndustrySchema = createInsertSchema(industries).pick({
  name: true,
  label: true,
  keywords: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  keywordsEverywhereApiKey: true,
});

export const insertKeywordResearchSchema = createInsertSchema(keywordResearches).pick({
  title: true,
  industry: true,
  cities: true,
  results: true,
  source: true,
});

export const updateKeywordResearchSchema = createInsertSchema(keywordResearches).pick({
  title: true,
}).partial();

export const keywordSearchRequestSchema = z.object({
  industry: z.string().min(1),
  cities: z.array(z.string().min(1)),
  source: z.string().optional().default("Admin"), // Optional, defaults to Admin for regular requests
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = typeof industries.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertKeywordResearch = z.infer<typeof insertKeywordResearchSchema>;
export type UpdateKeywordResearch = z.infer<typeof updateKeywordResearchSchema>;
export type KeywordResearch = typeof keywordResearches.$inferSelect;
export type KeywordSearchRequest = z.infer<typeof keywordSearchRequestSchema>;

export interface KeywordResult {
  keyword: string; // Full keyword phrase including city
  searchVolume: number;
  cpc: number;
  competition?: number; // Competition score from API
  opportunity?: string; // Calculated opportunity level: High/Medium/Low
}

export interface TAMCalculation {
  annualSearchVolume: number;
  fullSystemReplacements: {
    annualVolume: number;
    revenue: number;
  };
  refrigerantRecharge: {
    annualVolume: number;
    revenue: number;
  };
  compressorFanReplacements: {
    annualVolume: number;
    revenue: number;
  };
  totalNewRevenueOpportunity: number;
}

export interface KeywordData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
}
