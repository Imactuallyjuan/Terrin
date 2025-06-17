import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserData {
  role: 'homeowner' | 'contractor' | 'both' | 'visitor';
  email: string;
  profilePhotoUrl?: string;
  createdAt?: any;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (firebaseUser: User) => {
    try {
      // Cache the role to avoid repeated calls
      const cachedRole = sessionStorage.getItem(`userRole_${firebaseUser.uid}`);
      if (cachedRole) {
        setUserRole(cachedRole);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        const role = userData.role || 'visitor';
        setUserRole(role);
        sessionStorage.setItem(`userRole_${firebaseUser.uid}`, role);
      } else {
        setUserRole('visitor');
        sessionStorage.setItem(`userRole_${firebaseUser.uid}`, 'visitor');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('visitor');
    }
  };

  const refreshUserData = async () => {
    if (user) {
      // Clear cache when explicitly refreshing
      sessionStorage.removeItem(`userRole_${user.uid}`);
      await fetchUserRole(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Set loading to false immediately for auth, fetch role in background
        setLoading(false);
        await fetchUserRole(firebaseUser);
      } else {
        setUser(null);
        setUserRole(null);
        // Clear all cached roles
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('userRole_')) {
            sessionStorage.removeItem(key);
          }
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userRole,
    loading,
    isAuthenticated: !!user,
    refreshUserData,
  };
}