import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { auth } from '@/lib/firebase';
import { checkUserExistsAndUpdateAvatar } from '@/lib/userService';
import type { User } from '@/types/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  clearError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          if (!firebaseUser.email) {
            // User doesn't have email, sign out
            await signOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }

          // Check user exists and update avatar
          const avatar = await checkUserExistsAndUpdateAvatar(
            firebaseUser.email,
            firebaseUser.photoURL
          );

          // Clear any previous error
          setError(null);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            avatar,
          });
        } else {
          setUser(null);
          // Don't clear error if it exists - let it persist for display on login page
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Authentication failed';
        console.error('Auth error:', error);
        // Set error message
        setError(errorMessage);
        // Sign out user if verification fails
        if (firebaseUser) {
          await signOut(auth);
        }
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
