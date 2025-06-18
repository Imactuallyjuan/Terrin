import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyFirebaseToken } from "./firebaseAuth";
import { insertProjectSchema, insertContractorSchema } from "@shared/schema";
import { generateCostEstimate } from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {

  // Auth routes
  app.get('/api/auth/user', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUser(userId);
      res.json(user || { id: userId, email: req.user.email });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.post('/api/projects', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const projectData = insertProjectSchema.parse(req.body);
      
      const project = await storage.createProject({
        ...projectData,
        userId,
      });

      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  });

  app.get('/api/projects', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.user.uid) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Delete project
  app.delete('/api/projects/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const projectId = parseInt(req.params.id);
      
      // First check if project exists and belongs to user
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Cost estimation routes
  app.post('/api/estimate', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      console.log('Request body:', req.body);
      
      // Handle both direct data and projectData wrapper
      const projectData = req.body.projectData || req.body;
      const { title, description, location, projectType, budgetRange, timeline } = projectData;

      // Validate required fields
      if (!description || !location) {
        return res.status(400).json({ 
          message: "Missing required fields: description and location are required" 
        });
      }

      console.log('Generating estimate for user:', userId);
      
      // Generate AI-powered cost estimate
      const aiEstimate = await generateCostEstimate({
        title: title || projectType || 'Construction Project',
        description,
        projectType: projectType || 'General Construction',
        budgetRange: budgetRange || 'Not specified',
        timeline: timeline || 'To be determined',
        location
      });

      // Save estimate to database
      const estimate = await storage.createEstimate({
        projectId: 0, // Standalone estimate, not tied to a project
        userId,
        totalCostMin: aiEstimate.totalCostMin,
        totalCostMax: aiEstimate.totalCostMax,
        timeline: aiEstimate.timeline,
        materialsCostMin: aiEstimate.materialsCostMin,
        materialsCostMax: aiEstimate.materialsCostMax,
        laborCostMin: aiEstimate.laborCostMin,
        laborCostMax: aiEstimate.laborCostMax,
        permitsCostMin: aiEstimate.permitsCostMin,
        permitsCostMax: aiEstimate.permitsCostMax,
        contingencyCostMin: aiEstimate.contingencyCostMin,
        contingencyCostMax: aiEstimate.contingencyCostMax,
        aiAnalysis: aiEstimate.analysis,
        tradeBreakdowns: aiEstimate.tradeBreakdowns,
        inputData: JSON.stringify({
          title,
          description,
          location,
          projectType,
          budgetRange,
          timeline
        })
      });

      console.log('Estimate saved successfully:', estimate.id);

      res.json({
        id: estimate.id,
        ...aiEstimate,
        inputData: {
          title,
          description,
          location,
          projectType,
          budgetRange,
          timeline
        },
        createdAt: estimate.createdAt
      });
    } catch (error) {
      console.error("Error generating estimate:", error);
      res.status(500).json({ message: "Failed to generate cost estimate" });
    }
  });

  app.get('/api/estimates', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const estimates = await storage.getUserEstimates(userId);
      res.json(estimates);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  // Delete estimate
  app.delete('/api/estimates/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const estimateId = parseInt(req.params.id);
      
      // First check if estimate exists and belongs to user
      const estimate = await storage.getEstimate(estimateId);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      
      if (estimate.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteEstimate(estimateId);
      res.json({ message: "Estimate deleted successfully" });
    } catch (error) {
      console.error("Error deleting estimate:", error);
      res.status(500).json({ message: "Failed to delete estimate" });
    }
  });

  app.get('/api/projects/:id/estimate', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const estimate = await storage.getProjectEstimate(projectId);
      
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }

      // Check if user owns the estimate
      if (estimate.userId !== req.user.uid) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(estimate);
    } catch (error) {
      console.error("Error fetching estimate:", error);
      res.status(500).json({ message: "Failed to fetch estimate" });
    }
  });

  // Contractor routes
  app.post('/api/contractors', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const contractorData = insertContractorSchema.parse(req.body);
      
      const contractor = await storage.createContractor({
        ...contractorData,
        userId,
      });

      res.json(contractor);
    } catch (error) {
      console.error("Error creating contractor profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contractor data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contractor profile" });
      }
    }
  });

  app.get('/api/contractors', async (req, res) => {
    try {
      const { specialty, limit = "10" } = req.query;
      const limitNum = parseInt(limit as string);

      let contractors;
      if (specialty && typeof specialty === 'string') {
        contractors = await storage.getContractorsBySpecialty(specialty, limitNum);
      } else {
        contractors = await storage.getAllContractors(limitNum);
      }

      res.json(contractors);
    } catch (error) {
      console.error("Error fetching contractors:", error);
      res.status(500).json({ message: "Failed to fetch contractors" });
    }
  });

  app.get('/api/contractors/:id', async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const contractor = await storage.getContractor(contractorId);
      
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }

      res.json(contractor);
    } catch (error) {
      console.error("Error fetching contractor:", error);
      res.status(500).json({ message: "Failed to fetch contractor" });
    }
  });

  // Enhanced Project Management Routes
  app.get('/api/projects/:id/updates', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const updates = await storage.getProjectUpdates(projectId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching project updates:", error);
      res.status(500).json({ message: "Failed to fetch project updates" });
    }
  });

  app.post('/api/projects/:id/updates', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      const update = await storage.createProjectUpdate({
        projectId,
        userId,
        ...req.body
      });
      
      res.json(update);
    } catch (error) {
      console.error("Error creating project update:", error);
      res.status(500).json({ message: "Failed to create project update" });
    }
  });

  app.patch('/api/projects/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.uid;
      const updates = req.body;

      // Create update record for significant changes
      if (updates.status || updates.completionPercentage !== undefined) {
        await storage.createProjectUpdate({
          projectId,
          userId,
          updateType: 'status_change',
          title: `Project ${updates.status ? 'status changed' : 'progress updated'}`,
          description: updates.status ? `Status changed to ${updates.status}` : `Progress updated to ${updates.completionPercentage}%`,
          oldValue: '',
          newValue: updates.status || updates.completionPercentage?.toString()
        });
      }

      const project = await storage.updateProject(projectId, updates);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Messaging System Routes
  app.get('/api/conversations', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/conversations', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { projectId, participants, title } = req.body;
      
      // Check if conversation already exists for this project
      let conversation;
      if (projectId) {
        conversation = await storage.getProjectConversation(projectId);
      }
      
      if (!conversation) {
        conversation = await storage.createConversation({
          projectId,
          participants: [...(participants || []), userId],
          title
        });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/conversations/:id/messages', verifyFirebaseToken, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations/:id/messages', verifyFirebaseToken, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const senderId = req.user.uid;
      const { content, messageType = 'text', attachments = [] } = req.body;
      
      const message = await storage.createMessage({
        conversationId,
        senderId,
        content,
        messageType,
        attachments,
        readBy: [senderId]
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch('/api/messages/:id/read', verifyFirebaseToken, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      await storage.markMessageAsRead(messageId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
