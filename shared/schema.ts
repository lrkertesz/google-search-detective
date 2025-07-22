import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  industry: text("industry").notNull(),
  cities: json("cities").$type<string[]>().notNull(),
  results: json("results").$type<KeywordResult[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  industry: true,
  cities: true,
  results: true,
});

export const keywordSearchRequestSchema = z.object({
  industry: z.string().min(1),
  cities: z.array(z.string().min(1)),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = typeof industries.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertKeywordResearch = z.infer<typeof insertKeywordResearchSchema>;
export type KeywordResearch = typeof keywordResearches.$inferSelect;
export type KeywordSearchRequest = z.infer<typeof keywordSearchRequestSchema>;

export interface KeywordResult {
  keyword: string; // Full keyword phrase including city
  searchVolume: number;
  cpc: number;
  competition: number;
  opportunity: "High" | "Medium" | "Low";
}

export interface KeywordData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
}
