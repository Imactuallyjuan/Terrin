#!/usr/bin/env tsx

import { storage } from './storage';

async function seedData() {
  console.log('🌱 Starting seed process...');

  try {
    // Create demo users
    console.log('👥 Creating demo users...');
    
    const homeowner = await storage.upsertUser({
      id: 'demo_homeowner_001',
      email: 'homeowner@demo.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'homeowner',
      initialized: true
    });

    const professional = await storage.upsertUser({
      id: 'demo_professional_001', 
      email: 'professional@demo.com',
      firstName: 'Bob',
      lastName: 'Smith',
      role: 'professional',
      initialized: true
    });

    console.log(`Created users: ${homeowner.firstName} ${homeowner.lastName} (${homeowner.role}) and ${professional.firstName} ${professional.lastName} (${professional.role})`);

    // Create demo contractor profile
    console.log('🔨 Creating contractor profile...');
    const contractor = await storage.createContractor({
      userId: professional.id,
      businessName: 'Smith Construction Co.',
      specialty: 'Kitchen Remodeling',
      location: 'San Francisco, CA',
      serviceArea: 'Bay Area',
      description: 'Professional kitchen remodeling with 15+ years of experience. Specializing in modern designs and custom installations.',
      hourlyRate: "85.00",
      yearsExperience: 15,
      completedProjects: 47,
      rating: "4.8",
      portfolio: ['kitchen1.jpg', 'kitchen2.jpg', 'kitchen3.jpg'],
      certifications: ['Licensed Contractor', 'Certified Kitchen Designer'],
      stripeAccountId: 'acct_demo_professional_001'
    });

    console.log(`Created contractor: ${contractor.businessName}`);

    // Create demo project
    console.log('🏠 Creating demo project...');
    const project = await storage.createProject({
      userId: homeowner.id,
      title: 'Modern Kitchen Renovation',
      description: 'Complete kitchen remodel including new cabinets, countertops, appliances, and lighting. Looking for a modern, clean design with white cabinets and quartz countertops.',
      projectType: 'Kitchen Remodel',
      budgetRange: '$25,000 - $35,000',
      timeline: '6-8 weeks',
      location: 'San Francisco, CA',
      status: 'in_progress',
      priority: 'high',
      squareFootage: '200',
      contractorId: contractor.id,
      startDate: new Date('2025-01-15'),
      completionPercentage: 35
    });

    console.log(`Created project: ${project.title}`);

    // Create estimate
    console.log('💰 Creating cost estimate...');
    const estimate = await storage.createEstimate({
      projectId: project.id,
      userId: homeowner.id,
      totalCostMin: "28000.00",
      totalCostMax: "34000.00",
      timeline: '7 weeks',
      materialsCostMin: "18000.00",
      materialsCostMax: "22000.00",
      laborCostMin: "8000.00",
      laborCostMax: "10000.00",
      permitsCostMin: "1500.00",
      permitsCostMax: "1500.00",
      contingencyCostMin: "500.00",
      contingencyCostMax: "500.00",
      breakdown: {
        materials: {
          cabinets: '$12,000-15,000',
          countertops: '$3,000-4,000',
          appliances: '$2,000-2,500',
          lighting: '$1,000-1,500'
        },
        labor: {
          demolition: '$1,500-2,000',
          installation: '$5,000-6,500',
          electrical: '$1,500-1,500'
        },
        permits: {
          building_permit: '$1,500'
        }
      },
      confidence: 85
    });

    console.log(`Created estimate: $${estimate.totalCostMin}-$${estimate.totalCostMax}`);

    // Create conversation
    console.log('💬 Creating conversation...');
    const conversation = await storage.createConversation({
      title: `Project Discussion - ${project.title}`,
      participants: [homeowner.id, professional.id],
      projectId: project.id,
      lastMessageAt: new Date()
    });

    console.log(`Created conversation: ${conversation.title}`);

    // Create demo messages
    console.log('📨 Creating demo messages...');
    const message1 = await storage.createMessage({
      conversationId: conversation.id,
      senderId: homeowner.id,
      content: 'Hi Bob! I\'m excited to work with you on our kitchen renovation. When can we schedule the initial consultation?',
      messageType: 'text',
      attachments: [],
      readBy: [homeowner.id]
    });

    const message2 = await storage.createMessage({
      conversationId: conversation.id,
      senderId: professional.id,
      content: 'Hello Alice! Great to connect with you. I\'m available for a consultation this Thursday or Friday afternoon. Which works better for you?',
      messageType: 'text',
      attachments: [],
      readBy: [professional.id]
    });

    const message3 = await storage.createMessage({
      conversationId: conversation.id,
      senderId: homeowner.id,
      content: 'Thursday afternoon works perfectly! Around 2 PM would be ideal.',
      messageType: 'text',
      attachments: [],
      readBy: [homeowner.id]
    });

    console.log(`Created ${3} demo messages`);

    // Create project costs
    console.log('📊 Creating project costs...');
    const cost1 = await storage.createProjectCost({
      projectId: project.id,
      userId: homeowner.id,
      category: 'materials',
      description: 'Kitchen cabinet deposit',
      amount: "5000.00",
      vendor: 'Custom Cabinet Works',
      dateIncurred: new Date('2025-01-20'),
      notes: 'Initial deposit for custom white shaker cabinets'
    });

    const cost2 = await storage.createProjectCost({
      projectId: project.id,
      userId: homeowner.id,
      category: 'labor',
      description: 'Demolition work',
      amount: "1800.00",
      vendor: 'Smith Construction Co.',
      dateIncurred: new Date('2025-01-22'),
      notes: 'Complete kitchen demolition and disposal'
    });

    console.log(`Created ${2} project cost entries`);

    // Create milestones
    console.log('🎯 Creating project milestones...');
    const milestone1 = await storage.createProjectMilestone({
      projectId: project.id,
      title: 'Demolition Complete',
      description: 'Remove old cabinets, countertops, and flooring',
      status: 'completed',
      order: 1,
      progressWeight: 15,
      completedDate: new Date('2025-01-25')
    });

    const milestone2 = await storage.createProjectMilestone({
      projectId: project.id,
      title: 'Plumbing and Electrical Rough-in',
      description: 'Install new plumbing lines and electrical outlets',
      status: 'completed',
      order: 2,
      progressWeight: 20,
      completedDate: new Date('2025-01-30')
    });

    const milestone3 = await storage.createProjectMilestone({
      projectId: project.id,
      title: 'Cabinet Installation',
      description: 'Install custom cabinets and hardware',
      status: 'in_progress',
      order: 3,
      progressWeight: 25,
      dueDate: new Date('2025-02-10')
    });

    const milestone4 = await storage.createProjectMilestone({
      projectId: project.id,
      title: 'Countertop Installation',
      description: 'Template, fabricate, and install quartz countertops',
      status: 'pending',
      order: 4,
      progressWeight: 20,
      dueDate: new Date('2025-02-15')
    });

    console.log(`Created ${4} project milestones`);

    // Create notifications
    console.log('🔔 Creating notifications...');
    const notification1 = await storage.createNotification({
      userId: homeowner.id,
      type: 'info',
      message: 'Your kitchen renovation project has started!',
      data: { projectId: project.id },
      read: false
    });

    const notification2 = await storage.createNotification({
      userId: homeowner.id,
      type: 'success',
      message: 'Demolition milestone completed successfully.',
      data: { projectId: project.id, milestoneId: milestone1.id },
      read: false
    });

    const notification3 = await storage.createNotification({
      userId: professional.id,
      type: 'alert',
      message: 'Cabinet installation milestone is due in 3 days.',
      data: { projectId: project.id, milestoneId: milestone3.id },
      read: false
    });

    console.log(`Created ${3} notifications`);

    // Create demo photos
    console.log('📸 Creating demo project photos...');
    const photo1 = await storage.createProjectPhoto({
      projectId: project.id,
      userId: homeowner.id,
      fileName: 'before_kitchen_1.jpg',
      filePath: '/uploads/projects/before_kitchen_1.jpg',
      caption: 'Original kitchen before renovation',
      category: 'before',
      tags: ['original', 'layout', 'cabinets']
    });

    const photo2 = await storage.createProjectPhoto({
      projectId: project.id,
      userId: professional.id,
      fileName: 'progress_demolition.jpg',
      filePath: '/uploads/projects/progress_demolition.jpg',
      caption: 'Demolition complete, ready for rough-in work',
      category: 'progress',
      tags: ['demolition', 'progress', 'framing']
    });

    console.log(`Created ${2} demo photos with tags`);

    // Create demo documents
    console.log('📄 Creating demo project documents...');
    const doc1 = await storage.createProjectDocument({
      projectId: project.id,
      userId: professional.id,
      fileName: 'kitchen_renovation_contract.pdf',
      filePath: '/uploads/docs/kitchen_renovation_contract.pdf',
      fileType: 'pdf',
      fileSize: 524288,
      category: 'contracts',
      description: 'Main construction contract for kitchen renovation',
      tags: ['contract', 'legal', 'signed']
    });

    const doc2 = await storage.createProjectDocument({
      projectId: project.id,
      userId: homeowner.id,
      fileName: 'building_permit.pdf',
      filePath: '/uploads/docs/building_permit.pdf',
      fileType: 'pdf',
      fileSize: 102400,
      category: 'permits',
      description: 'City building permit for kitchen renovation',
      tags: ['permit', 'approved', 'city']
    });

    console.log(`Created ${2} demo documents with tags`);

    console.log('✅ Seed process completed successfully!');
    console.log('\n📋 Demo Data Summary:');
    console.log(`- Users: ${homeowner.firstName} ${homeowner.lastName} (homeowner), ${professional.firstName} ${professional.lastName} (professional)`);
    console.log(`- Project: "${project.title}" (${project.status})`);
    console.log(`- Estimate: $${estimate.totalCostMin}-$${estimate.totalCostMax}`);
    console.log(`- Conversation: "${conversation.title}" with ${3} messages`);
    console.log(`- Costs: ${2} tracked expenses`);
    console.log(`- Milestones: ${4} project milestones`);
    console.log(`- Notifications: ${3} system notifications`);
    console.log(`- Photos: ${2} project photos with tags`);
    console.log(`- Documents: ${2} project documents with tags`);
    console.log('\n🚀 You can now test the application with realistic demo data!');

  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData().then(() => {
  console.log('🌱 Seeding complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});