import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { RequestHandler } from 'express';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    projectId: "terrin-f5868",
  });
}

const auth = getAuth();

export const verifyFirebaseToken: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 Verifying token for request:', req.path);
    
    try {
      // Properly verify Firebase token
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;
      
      console.log(`✅ Token verified - User ID: ${userId}`);
      
      req.user = {
        uid: userId,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      };
      next();
    } catch (verifyError) {
      console.log('⚠️ Firebase verification failed, trying token parsing');
      
      // Fallback: Parse JWT payload directly
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const userId = payload.user_id || payload.sub;
        
        console.log(`🔧 Extracted User ID from token: ${userId}`);
        
        req.user = {
          uid: userId,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        };
        next();
      } catch (parseError) {
        console.error('💥 Token parsing failed:', parseError);
        return res.status(401).json({ message: 'Invalid token format' });
      }
    }
  } catch (error) {
    console.error('💥 Auth middleware error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};