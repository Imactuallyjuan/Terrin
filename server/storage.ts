import {
  users,
  projects,
  estimates,
  contractors,
  projectUpdates,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Estimate,
  type InsertEstimate,
  type Contractor,
  type InsertContractor,
  type ProjectUpdate,
  type InsertProjectUpdate,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  
  // Estimate operations
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  getProjectEstimate(projectId: number): Promise<Estimate | undefined>;
  getUserEstimates(userId: string): Promise<Estimate[]>;
  
  // Contractor operations
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  getContractor(id: number): Promise<Contractor | undefined>;
  getContractorsBySpecialty(specialty: string, limit?: number): Promise<Contractor[]>;
  getAllContractors(limit?: number): Promise<Contractor[]>;
  updateContractor(id: number, updates: Partial<InsertContractor>): Promise<Contractor | undefined>;
  
  // Project Updates operations
  createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate>;
  getProjectUpdates(projectId: number): Promise<ProjectUpdate[]>;
  
  // Messaging operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getProjectConversation(projectId: number): Promise<Conversation | undefined>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  markMessageAsRead(messageId: number, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  // Estimate operations
  async createEstimate(estimate: InsertEstimate): Promise<Estimate> {
    const [newEstimate] = await db
      .insert(estimates)
      .values(estimate)
      .returning();
    return newEstimate;
  }

  async getProjectEstimate(projectId: number): Promise<Estimate | undefined> {
    const [estimate] = await db
      .select()
      .from(estimates)
      .where(eq(estimates.projectId, projectId))
      .orderBy(desc(estimates.createdAt))
      .limit(1);
    return estimate;
  }

  async getUserEstimates(userId: string): Promise<Estimate[]> {
    return await db
      .select()
      .from(estimates)
      .where(eq(estimates.userId, userId))
      .orderBy(desc(estimates.createdAt));
  }

  // Contractor operations
  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const [newContractor] = await db
      .insert(contractors)
      .values(contractor)
      .returning();
    return newContractor;
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const [contractor] = await db
      .select()
      .from(contractors)
      .where(eq(contractors.id, id));
    return contractor;
  }

  async getContractorsBySpecialty(specialty: string, limit: number = 10): Promise<Contractor[]> {
    return await db
      .select()
      .from(contractors)
      .where(and(eq(contractors.specialty, specialty), eq(contractors.verified, true)))
      .orderBy(desc(contractors.rating))
      .limit(limit);
  }

  async getAllContractors(limit: number = 10): Promise<Contractor[]> {
    return await db
      .select()
      .from(contractors)
      .where(eq(contractors.verified, true))
      .orderBy(desc(contractors.rating))
      .limit(limit);
  }

  async updateContractor(id: number, updates: Partial<InsertContractor>): Promise<Contractor | undefined> {
    const [updatedContractor] = await db
      .update(contractors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contractors.id, id))
      .returning();
    return updatedContractor;
  }

  // Project Updates operations
  async createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate> {
    const [projectUpdate] = await db
      .insert(projectUpdates)
      .values(update)
      .returning();
    return projectUpdate;
  }

  async getProjectUpdates(projectId: number): Promise<ProjectUpdate[]> {
    return await db
      .select()
      .from(projectUpdates)
      .where(eq(projectUpdates.projectId, projectId))
      .orderBy(desc(projectUpdates.createdAt));
  }

  // Messaging operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.participants, [userId]))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getProjectConversation(projectId: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.projectId, projectId));
    return conversation;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    // Update conversation's lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async markMessageAsRead(messageId: number, userId: string): Promise<void> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));
    
    if (message) {
      const readBy = message.readBy || [];
      if (!readBy.includes(userId)) {
        await db
          .update(messages)
          .set({ readBy: [...readBy, userId] })
          .where(eq(messages.id, messageId));
      }
    }
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    // This would need a more complex query in production
    // For now, return 0 as placeholder
    return 0;
  }
}

export const storage = new DatabaseStorage();
