import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AuthRequest extends Request {
  user?: any;
}

// Define role permissions
export enum UserRole {
  HOMEOWNER = 'homeowner',
  PROFESSIONAL = 'professional',
  BOTH = 'both',
  VISITOR = 'visitor',
  ADMIN = 'admin'
}

// Define permission levels
export enum Permission {
  VIEW_PROJECTS = 'view_projects',
  CREATE_PROJECTS = 'create_projects',
  EDIT_PROJECTS = 'edit_projects',
  DELETE_PROJECTS = 'delete_projects',
  VIEW_CONTRACTORS = 'view_contractors',
  MANAGE_CONTRACTOR_PROFILE = 'manage_contractor_profile',
  SEND_MESSAGES = 'send_messages',
  CREATE_PAYMENTS = 'create_payments',
  RECEIVE_PAYMENTS = 'receive_payments',
  VIEW_ESTIMATES = 'view_estimates',
  CREATE_ESTIMATES = 'create_estimates',
  MANAGE_USERS = 'manage_users'
}

// Role permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.HOMEOWNER]: [
    Permission.VIEW_PROJECTS,
    Permission.CREATE_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.DELETE_PROJECTS,
    Permission.VIEW_CONTRACTORS,
    Permission.SEND_MESSAGES,
    Permission.CREATE_PAYMENTS,
    Permission.VIEW_ESTIMATES,
    Permission.CREATE_ESTIMATES
  ],
  [UserRole.PROFESSIONAL]: [
    Permission.VIEW_PROJECTS,
    Permission.VIEW_CONTRACTORS,
    Permission.MANAGE_CONTRACTOR_PROFILE,
    Permission.SEND_MESSAGES,
    Permission.RECEIVE_PAYMENTS,
    Permission.VIEW_ESTIMATES
  ],
  [UserRole.BOTH]: [
    // Combined permissions of homeowner and contractor
    Permission.VIEW_PROJECTS,
    Permission.CREATE_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.DELETE_PROJECTS,
    Permission.VIEW_CONTRACTORS,
    Permission.MANAGE_CONTRACTOR_PROFILE,
    Permission.SEND_MESSAGES,
    Permission.CREATE_PAYMENTS,
    Permission.RECEIVE_PAYMENTS,
    Permission.VIEW_ESTIMATES,
    Permission.CREATE_ESTIMATES
  ],
  [UserRole.VISITOR]: [
    Permission.VIEW_PROJECTS,
    Permission.VIEW_CONTRACTORS
  ],
  [UserRole.ADMIN]: [
    // Admin has all permissions
    ...Object.values(Permission)
  ]
};

// Check if user has permission
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[userRole];
  return permissions ? permissions.includes(permission) : false;
}

// Middleware to check role-based permissions
export function requirePermission(permission: Permission) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ message: "Unauthorized: No user authenticated" });
      }

      // Get user from database to check their role
      const user = await storage.getUser(req.user.uid);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      const userRole = (user.role as UserRole) || UserRole.VISITOR;

      if (!hasPermission(userRole, permission)) {
        return res.status(403).json({ 
          message: "Forbidden: You don't have permission to perform this action",
          required_permission: permission,
          user_role: userRole
        });
      }

      // Add user role to request for further use
      req.user.role = userRole;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
}

// Middleware to check if user owns the resource
export function requireOwnership(resourceType: 'project' | 'contractor' | 'conversation') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({ message: "Resource ID required" });
      }

      let isOwner = false;

      switch (resourceType) {
        case 'project':
          const project = await storage.getProject(parseInt(resourceId));
          isOwner = project?.userId === req.user.uid;
          break;
        
        case 'contractor':
          const contractors = await storage.getUserContractors(req.user.uid);
          isOwner = contractors.some(c => c.id === parseInt(resourceId));
          break;
        
        case 'conversation':
          const conversation = await storage.getConversation(parseInt(resourceId));
          isOwner = conversation?.participants.includes(req.user.uid) || false;
          break;
      }

      if (!isOwner) {
        return res.status(403).json({ 
          message: "Forbidden: You don't have access to this resource" 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Error checking ownership" });
    }
  };
}

// Middleware to check if user can access a project
export async function canAccessProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = req.params.projectId || req.params.id;
    if (!projectId) {
      return res.status(400).json({ message: "Project ID required" });
    }

    const project = await storage.getProject(parseInt(projectId));
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user owns the project or is a participant in related conversations
    const isOwner = project.userId === req.user.uid;
    
    // For contractors, check if they have conversations related to this project
    let hasAccess = isOwner;
    
    if (!hasAccess) {
      const user = await storage.getUser(req.user.uid);
      if (user?.role === 'professional' || user?.role === 'both') {
        // Check if contractor has any conversations for this project
        const conversations = await storage.getUserConversations(req.user.uid);
        hasAccess = conversations.some(c => c.projectId === parseInt(projectId));
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ 
        message: "Forbidden: You don't have access to this project" 
      });
    }

    // Add project to request for further use
    (req as any).project = project;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking project access" });
  }
}