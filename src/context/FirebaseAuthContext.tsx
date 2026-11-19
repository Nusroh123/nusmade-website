import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider, isAuthorizedAdmin } from '../lib/firebase';
import { formatPlainError } from '../lib/formatError';

interface FirebaseAuthContextValue {
  user: User | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  authError: string | null;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setIsAuthReady(true);
      },
      (err) => {
        setAuthError(formatPlainError(err, 'Could not verify your sign-in session. Please refresh the page.'));
        setIsAuthReady(true);
      }
    );
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(formatPlainError(err, 'Google sign-in could not be completed. Please try again.'));
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setAuthError(formatPlainError(err, 'Could not sign out cleanly. Please refresh the page.'));
    }
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        isAuthReady,
        isAdmin: isAuthorizedAdmin(user),
        authError,
        isSigningIn,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export function useFirebaseAuth(): FirebaseAuthContextValue {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) {
    throw new Error('useFirebaseAuth must be used inside FirebaseProvider');
  }
  return ctx;
}
