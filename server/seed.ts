import { db } from "./db";
import { storage } from "./storage";
import { 
  users, 
  projects, 
  estimates, 
  contractors, 
  conversations, 
  messages, 
  projectCosts, 
  projectMilestones,
  notifications
} from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clean existing data
    console.log("🧹 Cleaning existing demo data...");
    await db.delete(messages);
    await db.delete(conversations);
    await db.delete(projectCosts);
    await db.delete(projectMilestones);
    await db.delete(estimates);
    await db.delete(contractors);
    await db.delete(projects);
    await db.delete(notifications);
    await db.delete(users).where(eq(users.email, "demo@example.com"));
    await db.delete(users).where(eq(users.email, "contractor@example.com"));

    // Create demo users
    console.log("👤 Creating demo users...");
    
    // Homeowner user
    const [homeowner] = await db.insert(users).values({
      id: "demo-homeowner-001",
      email: "demo@example.com",
      name: "John Homeowner",
      role: "homeowner",
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Professional user
    const [professional] = await db.insert(users).values({
      id: "demo-professional-001",
      email: "contractor@example.com",
      name: "Jane Professional",
      role: "professional",
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log("✅ Users created");

    // Create demo project
    console.log("🏗️ Creating demo project...");
    const [project] = await db.insert(projects).values({
      userId: homeowner.id,
      title: "Kitchen Renovation",
      description: "Complete kitchen remodel including new cabinets, countertops, and appliances",
      budget: "50000",
      timeline: "3 months",
      location: "San Francisco, CA",
      status: "active",
      aiGeneratedScope: {
        scope: "Full kitchen renovation with modern updates",
        tasks: [
          "Demo existing kitchen",
          "Install new cabinets",
          "Install granite countertops",
          "Update plumbing and electrical",
          "Install new appliances"
        ]
      },
      costBreakdown: {
        materials: 25000,
        labor: 20000,
        permits: 2000,
        contingency: 3000
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log("✅ Project created");

    // Create contractor profile for professional
    console.log("👷 Creating contractor profile...");
    const [contractor] = await db.insert(contractors).values({
      userId: professional.id,
      businessName: "Jane's Professional Services",
      specialty: "Kitchen & Bath Remodeling",
      licenseNumber: "LIC-123456",
      yearsExperience: 15,
      serviceArea: "San Francisco Bay Area",
      description: "Experienced contractor specializing in high-end kitchen and bathroom renovations",
      phone: "(555) 123-4567",
      website: "https://janespro.com",
      insurance: true,
      bonded: true,
      rating: "4.8",
      reviewCount: 127,
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log("✅ Contractor profile created");

    // Create estimate
    console.log("💰 Creating demo estimate...");
    await db.insert(estimates).values({
      projectId: project.id,
      userId: homeowner.id,
      totalCost: "50000",
      breakdown: {
        materials: 25000,
        labor: 20000,
        permits: 2000,
        contingency: 3000,
        details: "Detailed cost breakdown for kitchen renovation"
      },
      timeline: {
        weeks: 12,
        phases: [
          { name: "Demo", duration: "1 week" },
          { name: "Rough-in", duration: "2 weeks" },
          { name: "Installation", duration: "6 weeks" },
          { name: "Finishing", duration: "3 weeks" }
        ]
      },
      createdAt: new Date()
    });

    console.log("✅ Estimate created");

    // Create conversation
    console.log("💬 Creating demo conversation...");
    const [conversation] = await db.insert(conversations).values({
      projectId: project.id,
      participants: [homeowner.id, professional.id],
      title: "Kitchen Renovation Discussion",
      lastMessageAt: new Date(),
      createdAt: new Date()
    }).returning();

    // Create messages
    console.log("📧 Creating demo messages...");
    await db.insert(messages).values([
      {
        conversationId: conversation.id,
        senderId: homeowner.id,
        content: "Hi Jane, I'm interested in getting a quote for my kitchen renovation.",
        messageType: "text",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        conversationId: conversation.id,
        senderId: professional.id,
        content: "Hello John! I'd be happy to help with your kitchen renovation. Could you share more details about what you have in mind?",
        messageType: "text",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20) // 20 hours ago
      },
      {
        conversationId: conversation.id,
        senderId: homeowner.id,
        content: "I'm looking for a complete remodel - new cabinets, countertops, and appliances. The space is about 200 sq ft.",
        messageType: "text",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18) // 18 hours ago
      },
      {
        conversationId: conversation.id,
        senderId: professional.id,
        content: "That sounds like a great project! Based on your description, I estimate the cost to be around $45,000-$55,000. Would you like me to come by for an in-person consultation?",
        messageType: "text",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16) // 16 hours ago
      }
    ]);

    console.log("✅ Messages created");

    // Create project costs
    console.log("💸 Creating demo project costs...");
    await db.insert(projectCosts).values([
      {
        projectId: project.id,
        userId: homeowner.id,
        category: "materials",
        description: "Kitchen cabinets from Home Depot",
        amount: "8500",
        vendor: "Home Depot",
        dateIncurred: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        notes: "Shaker style white cabinets",
        createdAt: new Date()
      },
      {
        projectId: project.id,
        userId: homeowner.id,
        category: "labor",
        description: "Cabinet installation",
        amount: "3500",
        vendor: "Jane's Professional Services",
        dateIncurred: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        notes: "2-day installation",
        createdAt: new Date()
      },
      {
        projectId: project.id,
        userId: homeowner.id,
        category: "permits",
        description: "Building permit",
        amount: "850",
        vendor: "City of San Francisco",
        dateIncurred: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        notes: "Kitchen remodel permit",
        createdAt: new Date()
      }
    ]);

    console.log("✅ Project costs created");

    // Create milestones
    console.log("🎯 Creating demo milestones...");
    await db.insert(projectMilestones).values([
      {
        projectId: project.id,
        title: "Demolition Complete",
        description: "Remove old cabinets, countertops, and appliances",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        status: "completed",
        completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        order: 1,
        progressWeight: 15,
        estimatedDuration: 3,
        createdAt: new Date()
      },
      {
        projectId: project.id,
        title: "Electrical and Plumbing Rough-in",
        description: "Update electrical wiring and plumbing for new layout",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
        status: "in_progress",
        order: 2,
        progressWeight: 20,
        estimatedDuration: 5,
        createdAt: new Date()
      },
      {
        projectId: project.id,
        title: "Cabinet Installation",
        description: "Install new kitchen cabinets",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21), // 21 days from now
        status: "pending",
        order: 3,
        progressWeight: 25,
        estimatedDuration: 4,
        createdAt: new Date()
      },
      {
        projectId: project.id,
        title: "Countertop Installation",
        description: "Install granite countertops",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28), // 28 days from now
        status: "pending",
        order: 4,
        progressWeight: 20,
        estimatedDuration: 2,
        createdAt: new Date()
      },
      {
        projectId: project.id,
        title: "Final Inspection",
        description: "City inspection and project completion",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35), // 35 days from now
        status: "pending",
        order: 5,
        progressWeight: 20,
        estimatedDuration: 1,
        createdAt: new Date()
      }
    ]);

    console.log("✅ Milestones created");

    // Create notifications
    console.log("🔔 Creating demo notifications...");
    await db.insert(notifications).values([
      {
        userId: homeowner.id,
        type: "info",
        message: "Welcome to Terrin! Start by creating your first project.",
        data: {},
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
      },
      {
        userId: homeowner.id,
        type: "success",
        message: "Your project 'Kitchen Renovation' has been created successfully!",
        data: { projectId: project.id },
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6) // 6 days ago
      },
      {
        userId: homeowner.id,
        type: "alert",
        message: "New message from Jane Professional",
        data: { conversationId: conversation.id },
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16) // 16 hours ago
      },
      {
        userId: professional.id,
        type: "info",
        message: "New project inquiry: Kitchen Renovation",
        data: { projectId: project.id },
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      }
    ]);

    console.log("✅ Notifications created");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Demo Accounts Created:");
    console.log("   Homeowner: demo@example.com");
    console.log("   Professional: contractor@example.com");
    console.log("\n   Use these accounts to test the application!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seed function
seedDatabase();