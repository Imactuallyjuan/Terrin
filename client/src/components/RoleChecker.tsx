import { useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

/**
 * Component that ensures new users are properly initialized in the database
 * This prevents role recognition issues for future accounts
 */
export default function RoleChecker() {
  const { user, userRole } = useFirebaseAuth();

  useEffect(() => {
    const initializeUserIfNeeded = async () => {
      if (!user || !user.email) return;

      try {
        // Check if user has a valid role
        if (!userRole || userRole === null) {
          console.log('🔄 User has no role, initializing...');
          
          // Trigger role fetch which will auto-initialize if needed
          const token = await user.getIdToken();
          const response = await fetch('/api/user/role', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const { role } = await response.json();
            console.log('✅ User role initialized:', role);
          }
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };

    initializeUserIfNeeded();
  }, [user, userRole]);

  // This component doesn't render anything
  return null;
}