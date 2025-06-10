import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  projectType: varchar("project_type").notNull(),
  budgetRange: varchar("budget_range").notNull(),
  timeline: varchar("timeline").notNull(),
  location: text("location").notNull(),
  status: varchar("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  totalCostMin: decimal("total_cost_min").notNull(),
  totalCostMax: decimal("total_cost_max").notNull(),
  timeline: varchar("timeline").notNull(),
  materialsCostMin: decimal("materials_cost_min").notNull(),
  materialsCostMax: decimal("materials_cost_max").notNull(),
  laborCostMin: decimal("labor_cost_min").notNull(),
  laborCostMax: decimal("labor_cost_max").notNull(),
  permitsCostMin: decimal("permits_cost_min").notNull(),
  permitsCostMax: decimal("permits_cost_max").notNull(),
  contingencyCostMin: decimal("contingency_cost_min").notNull(),
  contingencyCostMax: decimal("contingency_cost_max").notNull(),
  aiAnalysis: jsonb("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  businessName: text("business_name").notNull(),
  specialty: text("specialty").notNull(),
  description: text("description").notNull(),
  hourlyRate: decimal("hourly_rate").notNull(),
  location: text("location").notNull(),
  rating: decimal("rating").default("0"),
  reviewCount: integer("review_count").default(0),
  verified: boolean("verified").default(false),
  licenseNumber: varchar("license_number"),
  yearsExperience: integer("years_experience").notNull(),
  serviceArea: text("service_area").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type Estimate = typeof estimates.$inferSelect;
export type InsertEstimate = typeof estimates.$inferInsert;

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = typeof contractors.$inferInsert;
export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  userId: true,
  rating: true,
  reviewCount: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
});
