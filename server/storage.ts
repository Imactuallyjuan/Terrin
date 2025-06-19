import {
  users,
  projects,
  estimates,
  contractors,
  projectUpdates,
  conversations,
  messages,
  projectCosts,
  projectMilestones,
  projectPhotos,
  projectDocuments,
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
  type ProjectCost,
  type InsertProjectCost,
  type ProjectMilestone,
  type InsertProjectMilestone,
  type ProjectPhoto,
  type InsertProjectPhoto,
  type ProjectDocument,
  type InsertProjectDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

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
  deleteProject(id: number): Promise<void>;
  
  // Estimate operations
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  getEstimate(id: number): Promise<Estimate | undefined>;
  getProjectEstimate(projectId: number): Promise<Estimate | undefined>;
  getUserEstimates(userId: string): Promise<Estimate[]>;
  deleteEstimate(id: number): Promise<void>;
  
  // Contractor operations
  createContractor(professional: InsertContractor): Promise<Contractor>;
  getContractor(id: number): Promise<Contractor | undefined>;
  getContractorsBySpecialty(specialty: string, limit?: number): Promise<Contractor[]>;
  getAllContractors(limit?: number): Promise<Contractor[]>;
  getUserContractors(userId: string): Promise<Contractor[]>;
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
  
  // Cost tracking operations
  createProjectCost(cost: InsertProjectCost): Promise<ProjectCost>;
  getProjectCosts(projectId: number): Promise<ProjectCost[]>;
  updateProjectCost(id: number, updates: Partial<InsertProjectCost>): Promise<ProjectCost | undefined>;
  deleteProjectCost(id: number): Promise<void>;
  
  // Milestone operations
  createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone>;
  getProjectMilestones(projectId: number): Promise<ProjectMilestone[]>;
  updateProjectMilestone(id: number, updates: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined>;
  deleteProjectMilestone(id: number): Promise<void>;
  
  // Photo operations
  createProjectPhoto(photo: InsertProjectPhoto): Promise<ProjectPhoto>;
  getProjectPhotos(projectId: number): Promise<ProjectPhoto[]>;
  deleteProjectPhoto(id: number): Promise<void>;
  
  // Document operations
  createProjectDocument(document: InsertProjectDocument): Promise<ProjectDocument>;
  getProjectDocuments(projectId: number): Promise<ProjectDocument[]>;
  deleteProjectDocument(id: number): Promise<void>;
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

  async deleteProject(id: number): Promise<void> {
    await db
      .delete(projects)
      .where(eq(projects.id, id));
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

  async getEstimate(id: number): Promise<Estimate | undefined> {
    const [estimate] = await db
      .select()
      .from(estimates)
      .where(eq(estimates.id, id));
    return estimate;
  }

  async deleteEstimate(id: number): Promise<void> {
    await db
      .delete(estimates)
      .where(eq(estimates.id, id));
  }

  // Contractor operations
  async createContractor(professional: InsertContractor): Promise<Contractor> {
    const [newContractor] = await db
      .insert(contractors)
      .values(professional)
      .returning();
    return newContractor;
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const [professional] = await db
      .select()
      .from(contractors)
      .where(eq(contractors.id, id));
    return professional;
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

  async getUserContractors(userId: string): Promise<Contractor[]> {
    return await db
      .select()
      .from(contractors)
      .where(eq(contractors.userId, userId))
      .orderBy(desc(contractors.createdAt));
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

  // Cost tracking operations
  async createProjectCost(cost: InsertProjectCost): Promise<ProjectCost> {
    const [newCost] = await db
      .insert(projectCosts)
      .values(cost)
      .returning();
    return newCost;
  }

  async getProjectCosts(projectId: number): Promise<ProjectCost[]> {
    return await db
      .select()
      .from(projectCosts)
      .where(eq(projectCosts.projectId, projectId))
      .orderBy(desc(projectCosts.dateIncurred));
  }

  async updateProjectCost(id: number, updates: Partial<InsertProjectCost>): Promise<ProjectCost | undefined> {
    const [updatedCost] = await db
      .update(projectCosts)
      .set(updates)
      .where(eq(projectCosts.id, id))
      .returning();
    return updatedCost;
  }

  async deleteProjectCost(id: number): Promise<void> {
    await db.delete(projectCosts).where(eq(projectCosts.id, id));
  }

  // Milestone operations
  async createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone> {
    const [newMilestone] = await db
      .insert(projectMilestones)
      .values(milestone)
      .returning();
    
    // Update project completion percentage after creating milestone
    await this.updateProjectCompletion(newMilestone.projectId);
    
    return newMilestone;
  }

  async getProjectMilestones(projectId: number): Promise<ProjectMilestone[]> {
    return await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, projectId))
      .orderBy(projectMilestones.order);
  }

  async updateProjectMilestone(id: number, updates: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined> {
    const [updatedMilestone] = await db
      .update(projectMilestones)
      .set(updates)
      .where(eq(projectMilestones.id, id))
      .returning();
    
    // Update project completion percentage after milestone change
    if (updatedMilestone) {
      await this.updateProjectCompletion(updatedMilestone.projectId);
    }
    
    return updatedMilestone;
  }

  async deleteProjectMilestone(id: number): Promise<void> {
    // Get the milestone first to know which project to update
    const milestone = await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.id, id))
      .limit(1);
      
    await db.delete(projectMilestones).where(eq(projectMilestones.id, id));
    
    // Update project completion percentage after deletion
    if (milestone.length > 0) {
      await this.updateProjectCompletion(milestone[0].projectId);
    }
  }

  // Calculate and update project completion percentage based on milestone weights
  async updateProjectCompletion(projectId: number): Promise<void> {
    const milestones = await this.getProjectMilestones(projectId);
    
    if (milestones.length === 0) {
      // No milestones, set completion to 0
      await this.updateProject(projectId, { completionPercentage: 0 });
      return;
    }
    
    // Calculate total weight and completed weight
    const totalWeight = milestones.reduce((sum, milestone) => sum + (milestone.progressWeight || 10), 0);
    const completedWeight = milestones
      .filter(milestone => milestone.status === 'completed')
      .reduce((sum, milestone) => sum + (milestone.progressWeight || 10), 0);
    
    // Calculate completion percentage
    const completionPercentage = Math.round((completedWeight / totalWeight) * 100);
    
    // Update the project with new completion percentage
    await this.updateProject(projectId, { completionPercentage });
  }

  // Photo operations
  async createProjectPhoto(photo: InsertProjectPhoto): Promise<ProjectPhoto> {
    const [newPhoto] = await db
      .insert(projectPhotos)
      .values(photo)
      .returning();
    return newPhoto;
  }

  async getProjectPhotos(projectId: number): Promise<ProjectPhoto[]> {
    return await db
      .select()
      .from(projectPhotos)
      .where(eq(projectPhotos.projectId, projectId))
      .orderBy(desc(projectPhotos.uploadedAt));
  }

  async deleteProjectPhoto(id: number): Promise<void> {
    await db.delete(projectPhotos).where(eq(projectPhotos.id, id));
  }

  // Document operations
  async createProjectDocument(documentData: InsertProjectDocument): Promise<ProjectDocument> {
    const [newDocument] = await db
      .insert(projectDocuments)
      .values({
        ...documentData,
        uploadedAt: new Date(),
      })
      .returning();
    return newDocument;
  }

  async getProjectDocuments(projectId: number): Promise<ProjectDocument[]> {
    return await db
      .select()
      .from(projectDocuments)
      .where(eq(projectDocuments.projectId, projectId))
      .orderBy(desc(projectDocuments.uploadedAt));
  }

  async deleteProjectDocument(id: number): Promise<void> {
    await db.delete(projectDocuments).where(eq(projectDocuments.id, id));
  }
}

export const storage = new DatabaseStorage();
