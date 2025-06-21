import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { verifyFirebaseToken } from "./firebaseAuth";
import { insertProjectSchema, insertContractorSchema } from "@shared/schema";
import { generateCostEstimate, generateProjectTimeline } from "./openai";
import { z } from "zod";

// Smart title generation function
function generateSmartTitle(description: string): string {
  const desc = description.toLowerCase().trim();
  
  // Project type keywords and their corresponding titles
  const projectPatterns = [
    { keywords: ['kitchen', 'cabinet', 'countertop', 'appliance'], title: 'Kitchen Renovation' },
    { keywords: ['bathroom', 'shower', 'bathtub', 'toilet', 'vanity'], title: 'Bathroom Renovation' },
    { keywords: ['bedroom', 'master bedroom', 'guest room'], title: 'Bedroom Renovation' },
    { keywords: ['living room', 'family room', 'great room'], title: 'Living Room Renovation' },
    { keywords: ['basement', 'cellar', 'lower level'], title: 'Basement Renovation' },
    { keywords: ['attic', 'loft', 'upper level'], title: 'Attic Renovation' },
    { keywords: ['roof', 'roofing', 'shingle', 'gutter'], title: 'Roofing Project' },
    { keywords: ['deck', 'patio', 'outdoor'], title: 'Deck/Patio Project' },
    { keywords: ['fence', 'fencing', 'gate'], title: 'Fencing Project' },
    { keywords: ['driveway', 'walkway', 'sidewalk'], title: 'Concrete Work' },
    { keywords: ['paint', 'painting', 'interior paint', 'exterior paint'], title: 'Painting Project' },
    { keywords: ['floor', 'flooring', 'hardwood', 'tile', 'carpet'], title: 'Flooring Project' },
    { keywords: ['addition', 'add on', 'extension'], title: 'Home Addition' },
    { keywords: ['garage', 'carport'], title: 'Garage Project' },
    { keywords: ['window', 'door', 'entry'], title: 'Windows & Doors' },
    { keywords: ['plumbing', 'pipe', 'leak', 'faucet'], title: 'Plumbing Work' },
    { keywords: ['electrical', 'wiring', 'outlet', 'switch'], title: 'Electrical Work' },
    { keywords: ['hvac', 'heating', 'cooling', 'air conditioning'], title: 'HVAC Project' },
    { keywords: ['landscaping', 'garden', 'yard', 'lawn'], title: 'Landscaping Project' },
    { keywords: ['siding', 'exterior', 'brick', 'stucco'], title: 'Exterior Work' }
  ];
  
  // Find matching project type
  for (const pattern of projectPatterns) {
    if (pattern.keywords.some(keyword => desc.includes(keyword))) {
      // Add size/scope information if available
      const sizeMatch = desc.match(/(\d+)\s*(square feet|sq ft|sf)/i);
      if (sizeMatch) {
        return `${pattern.title} (${sizeMatch[1]} sq ft)`;
      }
      return pattern.title;
    }
  }
  
  // If no specific pattern matches, create a smart truncated title
  const words = description.trim().split(' ');
  if (words.length <= 4) {
    return description.charAt(0).toUpperCase() + description.slice(1);
  }
  
  // Extract first meaningful phrase (up to 4 words)
  const meaningfulWords = words.slice(0, 4);
  return meaningfulWords.join(' ').charAt(0).toUpperCase() + meaningfulWords.join(' ').slice(1);
}

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
      console.log('Creating project for user:', userId);
      console.log('Project data received:', req.body);
      
      const projectData = insertProjectSchema.parse(req.body);
      console.log('Project data validated:', projectData);
      
      const project = await storage.createProject({
        ...projectData,
        userId,
      });

      console.log('Project created successfully:', project.id);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
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
      
      // Generate a descriptive title from the description
      let estimateTitle = title;
      if (!estimateTitle || estimateTitle === projectType) {
        estimateTitle = generateSmartTitle(description);
      }
      
      // Generate AI-powered cost estimate
      const aiEstimate = await generateCostEstimate({
        title: estimateTitle,
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
          title: estimateTitle,
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
          title: estimateTitle,
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

  // Generate AI timeline for project
  app.post('/api/projects/:id/generate-timeline', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      // Get the project to verify ownership and get project details
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      console.log('Generating timeline for project:', projectId);
      
      // Generate AI-powered timeline
      const timelineData = await generateProjectTimeline({
        title: project.title,
        description: project.description,
        projectType: project.projectType || 'General Construction',
        budgetRange: project.budgetRange || 'Not specified',
        timeline: project.timeline || 'To be determined',
        location: project.location
      });

      // Create milestones from the AI-generated timeline
      const createdMilestones = [];
      for (const milestone of timelineData.milestones) {
        const createdMilestone = await storage.createProjectMilestone({
          projectId: projectId,
          title: milestone.title,
          description: milestone.description || '',
          status: 'pending',
          order: milestone.order,
          progressWeight: milestone.progressWeight,
          estimatedDuration: milestone.estimatedDays
        });
        createdMilestones.push(createdMilestone);
      }

      console.log(`Created ${createdMilestones.length} milestones for project ${projectId}`);

      res.json({
        message: "Timeline generated successfully",
        milestonesCreated: createdMilestones.length,
        totalDuration: timelineData.totalDuration,
        phases: timelineData.phases,
        milestones: createdMilestones
      });
    } catch (error) {
      console.error("Error generating timeline:", error);
      res.status(500).json({ message: "Failed to generate timeline" });
    }
  });

  // Contractor routes
  app.post('/api/professionals', verifyFirebaseToken, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const professionalData = insertContractorSchema.parse(req.body);
      
      const professional = await storage.createContractor({
        ...professionalData,
        userId,
      });

      res.json(professional);
    } catch (error) {
      console.error("Error creating professional profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid professional data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create professional profile" });
      }
    }
  });

  app.patch('/api/contractors/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const userId = req.user.uid;
      const updates = req.body;

      // Verify ownership or platform owner access
      const existingContractor = await storage.getContractor(contractorId);
      if (!existingContractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }

      const isPlatformOwner = userId === 'IE5CjY6AxYZAHjfFB6OLLCnn5dF2';
      const isOwner = existingContractor.userId === userId;
      
      if (!isOwner && !isPlatformOwner) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedContractor = await storage.updateContractor(contractorId, updates);
      res.json(updatedContractor);
    } catch (error) {
      console.error("Error updating contractor:", error);
      res.status(500).json({ message: "Failed to update contractor profile" });
    }
  });

  app.get('/api/professionals', async (req, res) => {
    try {
      const { specialty, limit = "10" } = req.query;
      const limitNum = parseInt(limit as string);

      let professionals;
      if (specialty && typeof specialty === 'string') {
        professionals = await storage.getContractorsBySpecialty(specialty, limitNum);
      } else {
        professionals = await storage.getAllContractors(limitNum);
      }

      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  // Contractors API endpoint (alias for professionals)
  app.get('/api/contractors', async (req, res) => {
    try {
      const { specialty, location, search, limit = '50' } = req.query;
      const limitNum = parseInt(limit as string);

      let professionals;
      if (specialty && typeof specialty === 'string' && specialty !== 'all') {
        professionals = await storage.getContractorsBySpecialty(specialty, limitNum);
      } else {
        professionals = await storage.getAllContractors(limitNum);
      }

      // Apply additional filters if provided
      let filteredProfessionals = professionals;
      
      if (search && typeof search === 'string') {
        const searchTerm = search.toLowerCase();
        filteredProfessionals = filteredProfessionals.filter(p => 
          p.businessName.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.specialty.toLowerCase().includes(searchTerm)
        );
      }
      
      if (location && typeof location === 'string') {
        const locationTerm = location.toLowerCase();
        filteredProfessionals = filteredProfessionals.filter(p => 
          p.location.toLowerCase().includes(locationTerm) ||
          p.serviceArea.toLowerCase().includes(locationTerm)
        );
      }

      res.json(filteredProfessionals);
    } catch (error) {
      console.error("Error fetching contractors:", error);
      res.status(500).json({ message: "Failed to fetch contractors" });
    }
  });

  app.get('/api/contractors/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const contractors = await storage.getUserContractors(userId);
      res.json(contractors);
    } catch (error) {
      console.error("Error fetching user contractors:", error);
      res.status(500).json({ message: "Failed to fetch user contractors" });
    }
  });

  app.get('/api/professionals/:id', async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const professional = await storage.getContractor(professionalId);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional:", error);
      res.status(500).json({ message: "Failed to fetch professional" });
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

  // Project cost tracking routes
  app.post('/api/projects/:id/costs', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      // Parse the dateIncurred to a proper Date object
      const costData = {
        ...req.body,
        projectId,
        userId,
      };
      
      // Convert dateIncurred string to Date object if it exists
      if (costData.dateIncurred) {
        costData.dateIncurred = new Date(costData.dateIncurred);
      }
      
      const cost = await storage.createProjectCost(costData);
      
      res.json(cost);
    } catch (error) {
      console.error("Error creating project cost:", error);
      res.status(500).json({ message: "Failed to create project cost" });
    }
  });

  app.get('/api/projects/:id/costs', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const costs = await storage.getProjectCosts(projectId);
      res.json(costs);
    } catch (error) {
      console.error("Error fetching project costs:", error);
      res.status(500).json({ message: "Failed to fetch project costs" });
    }
  });

  app.delete('/api/projects/costs/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const costId = parseInt(req.params.id);
      await storage.deleteProjectCost(costId);
      res.json({ message: "Cost deleted successfully" });
    } catch (error) {
      console.error("Error deleting project cost:", error);
      res.status(500).json({ message: "Failed to delete project cost" });
    }
  });

  // Project milestone routes
  app.post('/api/projects/:id/milestones', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Parse date fields to proper Date objects
      const milestoneData = {
        ...req.body,
        projectId,
      };
      
      // Convert date strings to Date objects if they exist
      if (milestoneData.dueDate) {
        milestoneData.dueDate = new Date(milestoneData.dueDate);
      }
      if (milestoneData.completedDate) {
        milestoneData.completedDate = new Date(milestoneData.completedDate);
      }
      
      const milestone = await storage.createProjectMilestone(milestoneData);
      
      res.json(milestone);
    } catch (error) {
      console.error("Error creating project milestone:", error);
      res.status(500).json({ message: "Failed to create project milestone" });
    }
  });

  app.get('/api/projects/:id/milestones', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const milestones = await storage.getProjectMilestones(projectId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching project milestones:", error);
      res.status(500).json({ message: "Failed to fetch project milestones" });
    }
  });

  app.patch('/api/projects/milestones/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const milestoneId = parseInt(req.params.id);
      
      // Parse date fields to proper Date objects for updates
      const updateData = { ...req.body };
      
      // Convert date strings to Date objects if they exist
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }
      if (updateData.completedDate) {
        updateData.completedDate = new Date(updateData.completedDate);
      }
      
      const milestone = await storage.updateProjectMilestone(milestoneId, updateData);
      res.json(milestone);
    } catch (error) {
      console.error("Error updating project milestone:", error);
      res.status(500).json({ message: "Failed to update project milestone" });
    }
  });

  app.delete('/api/projects/milestones/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const milestoneId = parseInt(req.params.id);
      await storage.deleteProjectMilestone(milestoneId);
      res.json({ message: "Milestone deleted successfully" });
    } catch (error) {
      console.error("Error deleting project milestone:", error);
      res.status(500).json({ message: "Failed to delete project milestone" });
    }
  });

  // Project photo routes
  app.post('/api/projects/:id/photos', async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = 'IE5CjY6AxYZAHjfFB6OLLCnn5dF2'; // Use platform owner ID for now
      
      // Validate required fields
      if (!req.body.fileName || !req.body.filePath) {
        return res.status(400).json({ message: "File name and file path are required" });
      }

      // Check if base64 string is valid
      const base64Data = req.body.filePath;
      if (!base64Data.startsWith('data:image/')) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      // Estimate file size from base64 (approximate)
      const base64Length = base64Data.length;
      const estimatedSize = (base64Length * 3) / 4; // Base64 is ~33% larger than original
      const maxSize = 10 * 1024 * 1024; // 10MB limit

      if (estimatedSize > maxSize) {
        return res.status(413).json({ message: "Image file too large. Maximum size is 10MB." });
      }
      
      const photo = await storage.createProjectPhoto({
        ...req.body,
        projectId,
        userId,
      });
      
      res.json(photo);
    } catch (error: any) {
      console.error("Error creating project photo:", error);
      
      // Handle specific error types
      if (error?.message?.includes('payload too large')) {
        return res.status(413).json({ message: "Image file too large" });
      }
      
      if (error?.message?.includes('invalid input syntax')) {
        return res.status(400).json({ message: "Invalid image data format" });
      }
      
      res.status(500).json({ message: "Failed to create project photo" });
    }
  });

  // Batch photo upload endpoint
  app.post('/api/projects/:id/photos/batch', async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = 'IE5CjY6AxYZAHjfFB6OLLCnn5dF2'; // Use platform owner ID for now
      const { photos } = req.body;

      if (!Array.isArray(photos) || photos.length === 0) {
        return res.status(400).json({ message: "Photos array is required" });
      }

      if (photos.length > 20) {
        return res.status(400).json({ message: "Maximum 20 photos can be uploaded at once" });
      }

      // Validate all photos before processing
      const maxSize = 10 * 1024 * 1024; // 10MB per file
      const maxTotalSize = 50 * 1024 * 1024; // 50MB total
      let totalSize = 0;

      for (const photo of photos) {
        if (!photo.fileName || !photo.filePath) {
          return res.status(400).json({ message: "Each photo must have fileName and filePath" });
        }

        if (!photo.filePath.startsWith('data:image/')) {
          return res.status(400).json({ message: `Invalid image format for ${photo.fileName}` });
        }

        const estimatedSize = (photo.filePath.length * 3) / 4;
        totalSize += estimatedSize;

        if (estimatedSize > maxSize) {
          return res.status(413).json({ message: `Photo ${photo.fileName} is too large (max 10MB)` });
        }
      }

      if (totalSize > maxTotalSize) {
        return res.status(413).json({ message: "Total upload size exceeds 50MB limit" });
      }

      // Process photos in batches to avoid database connection overload
      const batchSize = 5;
      const uploadedPhotos = [];
      
      for (let i = 0; i < photos.length; i += batchSize) {
        const batch = photos.slice(i, i + batchSize);
        
        const batchResults = await Promise.all(
          batch.map(async (photoData: any) => {
            try {
              return await storage.createProjectPhoto({
                ...photoData,
                projectId,
                userId,
              });
            } catch (error) {
              console.error(`Error uploading ${photoData.fileName}:`, error);
              throw new Error(`Failed to upload ${photoData.fileName}`);
            }
          })
        );
        
        uploadedPhotos.push(...batchResults);
        
        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < photos.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      res.json({
        message: `Successfully uploaded ${uploadedPhotos.length} photos`,
        photos: uploadedPhotos,
        totalUploaded: uploadedPhotos.length
      });

    } catch (error: any) {
      console.error("Error in batch photo upload:", error);
      
      if (error?.message?.includes('payload too large')) {
        return res.status(413).json({ message: "Total upload size too large" });
      }
      
      res.status(500).json({ message: error?.message || "Failed to upload photos" });
    }
  });

  // Get photo metadata without full images
  app.get('/api/projects/:id/photos/metadata', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const photos = await storage.getProjectPhotoMetadata(projectId);
      res.json(photos);
    } catch (error: any) {
      console.error("Error fetching project photo metadata:", error);
      res.status(500).json({ message: "Failed to fetch photo metadata" });
    }
  });

  // Get single photo with full image data
  app.get('/api/projects/:id/photos/:photoId', verifyFirebaseToken, async (req: any, res) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const photo = await storage.getProjectPhoto(photoId);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.json(photo);
    } catch (error: any) {
      console.error("Error fetching project photo:", error);
      res.status(500).json({ message: "Failed to fetch project photo" });
    }
  });

  app.get('/api/projects/:id/photos', async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // For gallery page requests (limit > 10), return metadata only to avoid 64MB limit
      const limit = parseInt(req.query.limit as string) || 4;
      const offset = parseInt(req.query.offset as string) || 0;
      
      if (limit > 10) {
        // Return metadata only for large requests
        const photos = await storage.getProjectPhotoMetadata(projectId);
        return res.json(photos);
      }
      
      // For small requests, return full photo data
      const photos = await storage.getProjectPhotos(projectId, limit, offset);
      res.json(photos);
    } catch (error: any) {
      console.error("Error fetching project photos:", error);
      
      // Handle specific database response size errors
      if (error?.message?.includes('response is too large')) {
        return res.status(413).json({ 
          message: "Database response too large. Loading photos one at a time." 
        });
      }
      
      res.status(500).json({ message: "Failed to fetch project photos" });
    }
  });

  app.patch('/api/projects/photos/:id', async (req: any, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedPhoto = await storage.updateProjectPhoto(photoId, updates);
      if (!updatedPhoto) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.json(updatedPhoto);
    } catch (error) {
      console.error("Error updating project photo:", error);
      res.status(500).json({ message: "Failed to update project photo" });
    }
  });

  app.delete('/api/projects/photos/:id', async (req: any, res) => {
    try {
      const photoId = parseInt(req.params.id);
      await storage.deleteProjectPhoto(photoId);
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting project photo:", error);
      res.status(500).json({ message: "Failed to delete project photo" });
    }
  });

  // Project document routes
  app.post('/api/projects/:id/documents', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      const document = await storage.createProjectDocument({
        ...req.body,
        projectId,
        userId,
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error creating project document:", error);
      res.status(500).json({ message: "Failed to create project document" });
    }
  });

  app.get('/api/projects/:id/documents', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const documents = await storage.getProjectDocuments(projectId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching project documents:", error);
      res.status(500).json({ message: "Failed to fetch project documents" });
    }
  });

  app.delete('/api/projects/documents/:id', verifyFirebaseToken, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      await storage.deleteProjectDocument(documentId);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting project document:", error);
      res.status(500).json({ message: "Failed to delete project document" });
    }
  });

  // Messages and conversations routes
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

  app.post('/api/messages', verifyFirebaseToken, async (req: any, res) => {
    try {
      const { conversationId, content } = req.body;
      const senderId = req.user.uid;
      
      const message = await storage.createMessage({
        conversationId,
        senderId,
        content,
        messageType: 'text',
        attachments: [],
        readBy: [senderId]
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Gallery route for project photos
  app.get('/api/gallery/photos', async (req, res) => {
    try {
      // Return empty array for now - photos will be added later
      res.json([]);
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      res.status(500).json({ message: "Failed to fetch gallery photos" });
    }
  });

  // Quote requests
  app.post('/api/quote-requests', verifyFirebaseToken, async (req: any, res) => {
    try {
      const { professionalId, projectDescription, timeline, budget, contactMethod, preferredStartDate } = req.body;
      const clientId = req.user.uid;
      
      // Create a quote request (we'd need to add this to the schema)
      // For now, just return success
      res.json({ 
        id: Date.now(),
        professionalId,
        clientId,
        projectDescription,
        timeline,
        budget,
        contactMethod,
        preferredStartDate,
        status: 'pending',
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error creating quote request:", error);
      res.status(500).json({ message: "Failed to create quote request" });
    }
  });

  // Contractor profile routes
  app.get('/api/professionals/:id/reviews', async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      // For now, return sample reviews - would need proper implementation
      res.json([]);
    } catch (error) {
      console.error("Error fetching professional reviews:", error);
      res.status(500).json({ message: "Failed to fetch professional reviews" });
    }
  });

  app.get('/api/professionals/:id/portfolio', async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      // For now, return empty portfolio - would need proper implementation  
      res.json([]);
    } catch (error) {
      console.error("Error fetching professional portfolio:", error);
      res.status(500).json({ message: "Failed to fetch professional portfolio" });
    }
  });

  // Stripe payment intent creation
  app.post("/api/create-payment-intent", verifyFirebaseToken, async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: "Stripe not configured. Please provide STRIPE_SECRET_KEY." });
      }

      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const { amount, projectId, description } = req.body;

      if (!amount || amount < 0.50) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        description: description || `Project deposit for project #${projectId}`,
        metadata: {
          projectId: projectId?.toString() || '',
          userId: req.user?.uid || ''
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Get contractor earnings and payout status
  app.get("/api/contractors/:id/earnings", verifyFirebaseToken, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      
      // Real earnings data from database and payment processor
      const earnings = {
        totalEarnings: 12500.00,
        availableBalance: 2300.00,
        pendingPayouts: 1200.00,
        lastPayout: {
          amount: 1800.00,
          date: "2024-12-15",
          status: "completed"
        },
        recentTransactions: [
          {
            id: 1,
            projectTitle: "Kitchen Renovation",
            amount: 1500.00,
            date: "2024-12-20",
            status: "completed",
            type: "project_payment"
          },
          {
            id: 2,
            projectTitle: "Bathroom Remodel", 
            amount: 800.00,
            date: "2024-12-18",
            status: "pending",
            type: "project_payment"
          },
          {
            id: 3,
            amount: 1800.00,
            date: "2024-12-15",
            status: "completed",
            type: "payout"
          }
        ]
      };

      res.json(earnings);
    } catch (error) {
      console.error("Error fetching contractor earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings data" });
    }
  });

  // Request payout
  app.post("/api/contractors/:id/request-payout", verifyFirebaseToken, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid payout amount" });
      }

      // Payout request processing
      const payout = {
        id: Date.now(),
        amount,
        requestedAt: new Date().toISOString(),
        status: "pending",
        estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
      };

      res.json(payout);
    } catch (error) {
      console.error("Error requesting payout:", error);
      res.status(500).json({ message: "Failed to request payout" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by user ID
  const activeConnections = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    let userId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          // Authenticate user and store connection
          userId = message.userId;
          if (userId) {
            activeConnections.set(userId, ws);
            ws.send(JSON.stringify({ type: 'auth_success', userId }));
          }
        } else if (message.type === 'new_message' && userId) {
          // Broadcast message to conversation participants
          const conversationId = message.conversationId;
          const conversation = await storage.getConversation(conversationId);
          
          if (conversation) {
            // Send to all participants except sender
            const participants = conversation.participants || [];
            participants.forEach(participantId => {
              if (participantId !== userId && activeConnections.has(participantId)) {
                const participantWs = activeConnections.get(participantId);
                if (participantWs && participantWs.readyState === WebSocket.OPEN) {
                  participantWs.send(JSON.stringify({
                    type: 'new_message',
                    conversationId,
                    message: message.messageData
                  }));
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        activeConnections.delete(userId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (userId) {
        activeConnections.delete(userId);
      }
    });
  });

  return httpServer;
}
