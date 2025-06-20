import type { Express } from "express";
import { createServer, type Server } from "http";
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
  app.post('/api/projects/:id/photos', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      const photo = await storage.createProjectPhoto({
        ...req.body,
        projectId,
        userId,
      });
      
      res.json(photo);
    } catch (error) {
      console.error("Error creating project photo:", error);
      res.status(500).json({ message: "Failed to create project photo" });
    }
  });

  app.get('/api/projects/:id/photos', verifyFirebaseToken, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const photos = await storage.getProjectPhotos(projectId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching project photos:", error);
      res.status(500).json({ message: "Failed to fetch project photos" });
    }
  });

  app.delete('/api/projects/photos/:id', verifyFirebaseToken, async (req: any, res) => {
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
      // Sample construction project gallery photos
      const sampleGalleryPhotos = [
        {
          id: 1,
          projectId: 101,
          projectTitle: "Modern Kitchen Renovation",
          fileName: "kitchen-after.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmM2Y0ZjYiIHN0cm9rZS1kYXNoYXJyYXk9IjUsNSIgc3Ryb2tlPSIjOWNhM2FmIiBmaWxsPSJub25lIi8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmOTdkMTYiLz48cmVjdCB4PSIxMDAiIHk9IjE2MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzNzMwMGIiLz48cmVjdCB4PSIzMDAiIHk9IjE2MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzIzMWYyMCIvPjx0ZXh0IHg9IjMwMCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM0YjU1NjMiPk1vZGVybiBLaXRjaGVuPC90ZXh0Pjx0ZXh0IHg9IjMwMCIgeT0iMzQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2Yjc0ODMiPlJlbm92YXRpb248L3RleHQ+PC9zdmc+",
          caption: "Complete kitchen transformation with modern cabinets, quartz countertops, and stainless steel appliances",
          category: "after",
          uploadedAt: "2024-12-15T00:00:00Z",
          location: "Austin, TX",
          professionalName: "Premier Kitchen Designs"
        },
        {
          id: 2,
          projectId: 102,
          projectTitle: "Bathroom Remodel",
          fileName: "bathroom-progress.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNkZGZkZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNiZmRiZmUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZDFkNWRiIi8+PHJlY3QgeD0iMTIwIiB5PSIxMjAiIHdpZHRoPSIxNDAiIGhlaWdodD0iMTYwIiBmaWxsPSIjMzMzMzMzIiBzdHJva2U9IiM2NjY2NjYiLz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjMwMCIgeT0iMzQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM0YjU1NjMiPkJhdGhyb29tIFJlbW9kZWw8L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzQ4MyI+SW4gUHJvZ3Jlc3M8L3RleHQ+PC9zdmc+",
          caption: "Master bathroom remodel in progress - new tile work and fixtures being installed",
          category: "progress",
          uploadedAt: "2024-12-10T00:00:00Z",
          location: "Denver, CO",
          professionalName: "Colorado Bath Solutions"
        },
        {
          id: 3,
          projectId: 103,
          projectTitle: "Living Room Extension",
          fileName: "living-room-before.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZWZlZmUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU1ZTUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjgwIiB5PSIxMDAiIHdpZHRoPSI0NDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2IiBzdHJva2U9IiNkMWQ1ZGIiLz48cmVjdCB4PSIxMDAiIHk9IjEyMCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzY2NjY2NiIvPjxyZWN0IHg9IjMwMCIgeT0iMTMwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iMzAwIiB5PSIzNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzRiNTU2MyI+TGl2aW5nIFJvb20gQmVmb3JlPC90ZXh0Pjx0ZXh0IHg9IjMwMCIgeT0iMzYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2Yjc0ODMiPk9yaWdpbmFsIFNwYWNlPC90ZXh0Pjwvc3ZnPg==",
          caption: "Original living room before extension - cramped space with outdated layout",
          category: "before",
          uploadedAt: "2024-11-28T00:00:00Z",
          location: "Portland, OR",
          professionalName: "Northwest Home Builders"
        },
        {
          id: 4,
          projectId: 104,
          projectTitle: "Roof Replacement",
          fileName: "roofing-materials.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZGZkZmQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU1ZTUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxwb2x5Z29uIHBvaW50cz0iMzAwLDEwMCA1MDAsMjUwIDEwMCwyNTAiIGZpbGw9IiM3Nzc3NzciLz48cmVjdCB4PSIyMDAiIHk9IjE1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM0NDQ0NDQiLz48cmVjdCB4PSIxNTAiIHk9IjI3MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzk5OTk5OSIvPjxyZWN0IHg9IjM1MCIgeT0iMjcwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTk5OTk5Ii8+PHRleHQgeD0iMzAwIiB5PSIzNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzRiNTU2MyI+UHJlbWl1bSBTaGluZ2xlczwvdGV4dD48dGV4dCB4PSIzMDAiIHk9IjM2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNmI3NDgzIj5Sb29maW5nIE1hdGVyaWFsczwvdGV4dD48L3N2Zz4=",
          caption: "High-quality architectural shingles and materials for complete roof replacement",
          category: "materials",
          uploadedAt: "2024-12-05T00:00:00Z",
          location: "Phoenix, AZ",
          professionalName: "Desert Roofing Co."
        },
        {
          id: 5,
          projectId: 105,
          projectTitle: "Basement Finishing",
          fileName: "basement-after.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjUwIiB5PSI4MCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iI2QxZDVkYiIvPjxyZWN0IHg9IjgwIiB5PSIxMTAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzc0MTUxIi8+PHJlY3QgeD0iMzIwIiB5PSIxMTAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiIGZpbGw9IiM2Mzc0OGYiLz48cmVjdCB4PSI4MCIgeT0iMjQwIiB3aWR0aD0iNDQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTJhM2I4Ii8+PHRleHQgeD0iMzAwIiB5PSIzNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzRiNTU2MyI+RmluaXNoZWQgQmFzZW1lbnQ8L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzQ4MyI+RXh0cmEgTGl2aW5nIFNwYWNlPC90ZXh0Pjwvc3ZnPg==",
          caption: "Transformed basement into comfortable family recreation room with modern finishes",
          category: "after",
          uploadedAt: "2024-12-12T00:00:00Z",
          location: "Chicago, IL",
          professionalName: "Midwest Basement Experts"
        },
        {
          id: 6,
          projectId: 106,
          projectTitle: "Deck Construction",
          fileName: "deck-framing.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZWZlZmUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlZmVmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjEwMCIgeT0iMTUwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2RkNjMzMSIgc3Ryb2tlPSIjOTI0MDBkIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIxMjAiIHk9IjE3MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjExMCIgZmlsbD0iI2FhNTUyOCIvPjxyZWN0IHg9IjE4MCIgeT0iMTcwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTEwIiBmaWxsPSIjYWE1NTI4Ii8+PHJlY3QgeD0iMjQwIiB5PSIxNzAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxMTAiIGZpbGw9IiNhYTU1MjgiLz48cmVjdCB4PSIzMDAiIHk9IjE3MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjExMCIgZmlsbD0iI2FhNTUyOCIvPjxyZWN0IHg9IjM2MCIgeT0iMTcwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTEwIiBmaWxsPSIjYWE1NTI4Ii8+PHJlY3QgeD0iNDIwIiB5PSIxNzAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxMTAiIGZpbGw9IiNhYTU1MjgiLz48dGV4dCB4PSIzMDAiIHk9IjM0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNGI1NTYzIj5EZWNrIEZyYW1pbmc8L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzQ4MyI+Q29uc3RydWN0aW9uIFBoYXNlPC90ZXh0Pjwvc3ZnPg==",
          caption: "Deck framing and structural work in progress - pressure-treated lumber construction",
          category: "progress",
          uploadedAt: "2024-11-30T00:00:00Z",
          location: "Nashville, TN",
          professionalName: "Southern Deck Builders"
        },
        {
          id: 7,
          projectId: 107,
          projectTitle: "Electrical Upgrade",
          fileName: "electrical-panel.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmN2Y3Zjc0Lz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMmUyZTIiLz4sL2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjIwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIyMjAiIHk9IjEyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDA5OWZmIi8+PHJlY3QgeD0iMjgwIiB5PSIxMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwOTlmZiIvPjxyZWN0IHg9IjM0MCIgeT0iMTIwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDk5ZmYiLz48cmVjdCB4PSIyMjAiIHk9IjE2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDBhMGNjIi8+PHJlY3QgeD0iMjgwIiB5PSIxNjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwOTlmZiIvPjxyZWN0IHg9IjM0MCIgeT0iMTYwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDk5ZmYiLz48cmVjdCB4PSIyMjAiIHk9IjIwMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDA5OWZmIi8+PHJlY3QgeD0iMjgwIiB5PSIyMDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwOTlmZiIvPjxyZWN0IHg9IjM0MCIgeT0iMjAwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDk5ZmYiLz48dGV4dCB4PSIzMDAiIHk9IjM0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNGI1NTYzIj5OZXcgRWxlY3RyaWNhbCBQYW5lbDwvdGV4dD48dGV4dCB4PSIzMDAiIHk9IjM2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNmI3NDgzIj5TZXJ2aWNlIFVwZ3JhZGU8L3RleHQ+PC9zdmc+",
          caption: "New 200-amp electrical panel installation with modern circuit breakers for home safety",
          category: "after",
          uploadedAt: "2024-12-08T00:00:00Z",
          location: "Seattle, WA",
          professionalName: "Pacific Electric Services"
        },
        {
          id: 8,
          projectId: 108,
          projectTitle: "Hardwood Floor Installation",
          fileName: "flooring-materials.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmNWY1ZjUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjEwMCIgeT0iMTUwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Q2OTEzOSIvPjxyZWN0IHg9IjEwMCIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjYjY3NzNhIi8+PHJlY3QgeD0iMTYwIiB5PSIxNTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNkNjkxMzkiLz48cmVjdCB4PSIyMjAiIHk9IjE1MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2MyNzUzZCIvPjxyZWN0IHg9IjI4MCIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZDY5MTM5Ii8+PHJlY3QgeD0iMzQwIiB5PSIxNTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNiNjc3M2EiLz48cmVjdCB4PSI0MDAiIHk9IjE1MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Q2OTEzOSIvPjxyZWN0IHg9IjQ2MCIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjYzI3NTNkIi8+PHRleHQgeD0iMzAwIiB5PSIzMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzRiNTU2MyI+UHJlbWl1bSBPYWsgRmxvb3Jpbmc8L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzQ4MyI+Rmxvb3JpbmcgTWF0ZXJpYWxzPC90ZXh0Pjwvc3ZnPg==",
          caption: "Premium oak hardwood flooring planks ready for installation in main living areas",
          category: "materials",
          uploadedAt: "2024-12-03T00:00:00Z",
          location: "Atlanta, GA",
          professionalName: "Elite Flooring Solutions"
        },
        {
          id: 9,
          projectId: 109,
          projectTitle: "Landscaping Project",
          fileName: "landscaping-after.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNiZGZiZjMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4N2NlZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjUwIiB5PSIyNTAiIHdpZHRoPSI1MDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjJjNTVlIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMjAwIiByPSI0MCIgZmlsbD0iIzI0NzMzZCIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE4MCIgcj0iNTAiIGZpbGw9IiMxNjUzM2EiLz48Y2lyY2xlIGN4PSI0NTAiIGN5PSIyMTAiIHI9IjM1IiBmaWxsPSIjMjQ3MzNkIi8+PHJlY3QgeD0iMjAwIiB5PSIyODAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAiIGZpbGw9IiNkOTc3MDYiLz48dGV4dCB4PSIzMDAiIHk9IjM2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMTE3NzRlIj5MYW5kc2NhcGUgVHJhbnNmb3JtYXRpb248L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzEzNTYzZiI+Q29tcGxldGVkIFlhcmQ8L3RleHQ+PC9zdmc+",
          caption: "Complete landscape transformation with native plants, new lawn, and stone pathways",
          category: "after",
          uploadedAt: "2024-12-01T00:00:00Z",
          location: "San Diego, CA",
          professionalName: "Southwest Landscape Design"
        },
        {
          id: 10,
          projectId: 110,
          projectTitle: "Plumbing Issue",
          fileName: "pipe-repair.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjIwMCIgcj0iODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZiN2E2ZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48cmVjdCB4PSIyMDAiIHk9IjE4MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzY2NjY2NiIvPjxyZWN0IHg9IjI4MCIgeT0iMTEwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjNjY2NjY2Ii8+PHJlY3QgeD0iMjUwIiB5PSIyNDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAiIGZpbGw9IiNkNjk5MTkiLz48dGV4dCB4PSIzMDAiIHk9IjMwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZGY0NTQzIj5QaXBlIExlYWsgUmVwYWlyPC90ZXh0Pjx0ZXh0IHg9IjMwMCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5YjI2MjEiPkVtZXJnZW5jeSBJc3N1ZTwvdGV4dD48Y3JvdyB4PSIxMDAiIHk9IjEwMCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZiN2E2ZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDMiLz48L3N2Zz4=",
          caption: "Emergency pipe leak repair in basement - water damage assessment and restoration needed",
          category: "issues",
          uploadedAt: "2024-12-14T00:00:00Z",
          location: "Boston, MA",
          professionalName: "Metro Plumbing Solutions"
        },
        {
          id: 11,
          projectId: 111,
          projectTitle: "Fence Installation",
          fileName: "fence-before.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlZmVmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjUwIiB5PSIzMDAiIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAiIGZpbGw9IiMyMmM1NWUiLz48cmVjdCB4PSIxMDAiIHk9IjI4MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjOTQ0ZTNkIi8+PHJlY3QgeD0iMjAwIiB5PSIyODAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzk0NGUzZCIvPjxyZWN0IHg9IjMwMCIgeT0iMjgwIiB3aWR0aD0iMTAiIGhlaWdodD0iMjAiIGZpbGw9IiM5NDRlM2QiLz48cmVjdCB4PSI0MDAiIHk9IjI4MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjOTQ0ZTNkIi8+PHJlY3QgeD0iNTAwIiB5PSIyODAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzk0NGUzZCIvPjxsaW5lIHgxPSIxMDAiIHkxPSIyOTAiIHgyPSI1MDAiIHkyPSIyOTAiIHN0cm9rZT0iIzk0NGUzZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDEwIi8+PHRleHQgeD0iMzAwIiB5PSIzNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzRiNTU2MyI+T2xkIEZlbmNlIFNlY3Rpb248L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzQ4MyI+QmVmb3JlIFJlcGxhY2VtZW50PC90ZXh0Pjwvc3ZnPg==",
          caption: "Old deteriorating fence section needing complete replacement with modern privacy fencing",
          category: "before",
          uploadedAt: "2024-11-25T00:00:00Z",
          location: "Dallas, TX",
          professionalName: "Texas Fence & Gate Co."
        },
        {
          id: 12,
          projectId: 112,
          projectTitle: "HVAC System Upgrade",
          fileName: "hvac-installation.jpg",
          filePath: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmN2Y3Zjc0Lz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlOGU4ZTgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjIwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSIjNjY2NjY2Ii8+PGNpcmNsZSBjeD0iMzAwIiBjeT0iMTUwIiByPSIzMCIgZmlsbD0iIzAwNzNlNiIvPjxyZWN0IHg9IjE1MCIgeT0iMjIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNjY2NjY2Ii8+PHJlY3QgeD0iMTcwIiB5PSIyMzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzMzMzMzMyIvPjxyZWN0IHg9IjIzMCIgeT0iMjMwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiMzMzMzMzMiLz48cmVjdCB4PSIyOTAiIHk9IjIzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMzMzMzMzIi8+PHJlY3QgeD0iMzUwIiB5PSIyMzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzMzMzMzMyIvPjxyZWN0IHg9IjQxMCIgeT0iMjMwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiMzMzMzMzMiLz48dGV4dCB4PSIzMDAiIHk9IjMwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNGI1NTYzIj5IVKFDIFN5c3RlbSBJbnN0YWxsPC90ZXh0Pjx0ZXh0IHg9IjMwMCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2Yjc0ODMiPkNvb2xpbmcgVW5pdCAmIER1Y3R3b3JrPC90ZXh0Pjwvc3ZnPg==",
          caption: "New high-efficiency HVAC system installation with modern ductwork and smart controls",
          category: "progress",
          uploadedAt: "2024-12-07T00:00:00Z",
          location: "Miami, FL",
          professionalName: "Sunshine Air Conditioning"
        }
      ];

      res.json(sampleGalleryPhotos);
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

  const httpServer = createServer(app);
  return httpServer;
}
