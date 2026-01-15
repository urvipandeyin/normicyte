import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getProfile, createProfile, updateProfile as updateProfileDb } from '@/firebase/database';
import type { Profile } from '@/firebase/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      let profileData = await getProfile(userId);
      
      // If profile doesn't exist, create one
      if (!profileData) {
        profileData = await createProfile(userId, {});
      }
      
      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.uid);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const profileData = await fetchProfile(firebaseUser.uid);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as Error };
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      console.error('Email sign in error:', error);
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      console.error('Email sign up error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Not authenticated') };
    
    try {
      await updateProfileDb(user.uid, updates);
      await refreshProfile();
      return { error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
