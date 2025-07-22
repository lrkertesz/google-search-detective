import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export const insertKeywordResearchSchema = createInsertSchema(keywordResearches).pick({
  industry: true,
  cities: true,
  results: true,
});

export const keywordSearchRequestSchema = z.object({
  industry: z.enum(["hvac", "plumbing", "electrical", "digital-marketing"]),
  cities: z.array(z.string().min(1)),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertKeywordResearch = z.infer<typeof insertKeywordResearchSchema>;
export type KeywordResearch = typeof keywordResearches.$inferSelect;
export type KeywordSearchRequest = z.infer<typeof keywordSearchRequestSchema>;

export interface KeywordResult {
  phrase: string;
  city: string;
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
