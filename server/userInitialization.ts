import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function ensureUserInitialized(userId: string, email: string) {
  try {
    console.log(`🔍 Checking initialization for user: ${userId}`);
    
    // Check if user exists and is initialized
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (existingUser) {
      if (!existingUser.initialized) {
        // Mark as initialized if not already
        await db
          .update(users)
          .set({ initialized: true, updatedAt: new Date() })
          .where(eq(users.id, userId));
        console.log(`✅ Marked existing user as initialized: ${userId}`);
      }
      return existingUser;
    }
    
    // Create new user with visitor role
    console.log(`➕ Creating new user with auto-initialization: ${userId}`);
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email: email || 'unknown@terrin.com',
        role: 'visitor',
        initialized: true
      })
      .returning();
    
    console.log(`✅ Successfully created and initialized user: ${userId}`);
    return newUser;
    
  } catch (error) {
    console.error(`❌ Failed to initialize user ${userId}:`, error);
    throw error;
  }
}

export async function upgradeUserToRole(userId: string, newRole: 'homeowner' | 'professional' | 'both') {
  try {
    console.log(`🔄 Upgrading user ${userId} to role: ${newRole}`);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        role: newRole, 
        initialized: true,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    
    console.log(`✅ Successfully upgraded user to ${newRole}: ${userId}`);
    return updatedUser;
    
  } catch (error) {
    console.error(`❌ Failed to upgrade user ${userId} to ${newRole}:`, error);
    throw error;
  }
}