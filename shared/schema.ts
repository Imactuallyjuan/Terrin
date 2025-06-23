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
  status: varchar("status").default("planning").notNull(), // planning, active, in_progress, completed, cancelled
  priority: varchar("priority").default("medium").notNull(), // low, medium, high, urgent
  squareFootage: varchar("square_footage"),
  contractorId: integer("contractor_id"),
  actualCost: decimal("actual_cost"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  completionPercentage: integer("completion_percentage").default(0),
  images: text("images").array(),
  documents: text("documents").array(),
  notes: text("notes"),
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
  tradeBreakdowns: jsonb("trade_breakdowns"), // Store trade-specific cost breakdowns
  inputData: text("input_data"), // Store the form input as JSON string
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
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project updates and timeline tracking
export const projectUpdates = pgTable("project_updates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  updateType: varchar("update_type").notNull(), // status_change, progress, note, file_upload, milestone
  title: text("title").notNull(),
  description: text("description"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messaging system
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  participants: text("participants").array().notNull(), // Array of user IDs
  title: text("title"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text").notNull(), // text, image, document, system
  attachments: text("attachments").array(),
  readBy: text("read_by").array().default([]), // Array of user IDs who have read this message
  createdAt: timestamp("created_at").defaultNow(),
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
}).extend({
  hourlyRate: z.union([z.string(), z.number()]).transform(val => String(val)),
  yearsExperience: z.union([z.string(), z.number()]).transform(val => Number(val)),
});

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = typeof projectUpdates.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Cost tracking for individual expenses
export const projectCosts = pgTable("project_costs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  category: varchar("category").notNull(), // materials, labor, permits, equipment, other
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  vendor: text("vendor"),
  dateIncurred: timestamp("date_incurred").notNull(),
  receipt: text("receipt"), // file path or URL
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project milestones and timeline
export const projectMilestones = pgTable("project_milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  status: varchar("status").default("pending").notNull(), // pending, in_progress, completed, overdue
  order: integer("order").notNull(),
  progressWeight: integer("progress_weight").default(10).notNull(), // Weight for progress calculation (1-50)
  estimatedDuration: integer("estimated_duration"), // Duration in days for AI-generated timelines
  createdAt: timestamp("created_at").defaultNow(),
});

// Photo gallery for projects
export const projectPhotos = pgTable("project_photos", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  caption: text("caption"),
  category: varchar("category").default("progress").notNull(), // before, progress, after, materials, issues
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Document management for projects
export const projectDocuments = pgTable("project_documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, doc, docx, xls, xlsx, txt, etc.
  fileSize: integer("file_size").notNull(), // in bytes
  category: varchar("category").default("general").notNull(), // contracts, permits, invoices, estimates, plans, receipts, warranties, general
  description: text("description"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export type ProjectCost = typeof projectCosts.$inferSelect;
export type InsertProjectCost = typeof projectCosts.$inferInsert;

export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = typeof projectMilestones.$inferInsert;

export type ProjectPhoto = typeof projectPhotos.$inferSelect;
export type InsertProjectPhoto = typeof projectPhotos.$inferInsert;

export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type InsertProjectDocument = typeof projectDocuments.$inferInsert;
