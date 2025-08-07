import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    projectId: "terrin-f5868",
  });
}

const auth = getAuth();

async function createDemoUsers() {
  console.log("🔐 Creating Firebase demo users...\n");

  const demoUsers = [
    {
      uid: 'demo-homeowner-001',
      email: 'demo@example.com',
      password: 'demo123',
      displayName: 'John Homeowner',
      role: 'homeowner'
    },
    {
      uid: 'demo-professional-001', 
      email: 'contractor@example.com',
      password: 'contractor123',
      displayName: 'Jane Professional',
      role: 'professional'
    }
  ];

  try {
    for (const user of demoUsers) {
      try {
        // Try to get existing user
        await auth.getUser(user.uid);
        console.log(`✅ User ${user.email} already exists`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          await auth.createUser({
            uid: user.uid,
            email: user.email,
            password: user.password,
            displayName: user.displayName,
            emailVerified: true
          });
          console.log(`✅ Created user: ${user.email} (password: ${user.password})`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n🎉 Demo users ready!");
    console.log("\n📋 Demo Accounts:");
    console.log("   Homeowner: demo@example.com (password: demo123)");
    console.log("   Professional: contractor@example.com (password: contractor123)");
    console.log("\n   Use these to log in and see the seeded demo data!");

  } catch (error) {
    console.error("❌ Error creating demo users:", error);
    process.exit(1);
  }

  process.exit(0);
}

createDemoUsers();