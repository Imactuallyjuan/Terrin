import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertContractorSchema } from "@shared/schema";
import { generateCostEstimate } from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Cost estimation routes
  app.post('/api/estimate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { projectData } = req.body;

      if (!projectData) {
        return res.status(400).json({ message: "Project data is required" });
      }

      // Generate AI-powered cost estimate
      const aiEstimate = await generateCostEstimate(projectData);

      // Create project if projectId is not provided
      let projectId = req.body.projectId;
      if (!projectId) {
        const project = await storage.createProject({
          ...projectData,
          userId,
        });
        projectId = project.id;
      }

      // Save estimate to database
      const estimate = await storage.createEstimate({
        projectId,
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
      });

      res.json({
        ...estimate,
        projectId,
      });
    } catch (error) {
      console.error("Error generating estimate:", error);
      res.status(500).json({ message: "Failed to generate cost estimate" });
    }
  });

  app.get('/api/estimates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const estimates = await storage.getUserEstimates(userId);
      res.json(estimates);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  app.get('/api/projects/:id/estimate', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const estimate = await storage.getProjectEstimate(projectId);
      
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }

      // Check if user owns the estimate
      if (estimate.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(estimate);
    } catch (error) {
      console.error("Error fetching estimate:", error);
      res.status(500).json({ message: "Failed to fetch estimate" });
    }
  });

  // Contractor routes
  app.post('/api/contractors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
