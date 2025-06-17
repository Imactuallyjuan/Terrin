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
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        setUserRole(userData.role || 'visitor');
      } else {
        setUserRole('visitor');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('visitor');
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserRole(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserRole(firebaseUser);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
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