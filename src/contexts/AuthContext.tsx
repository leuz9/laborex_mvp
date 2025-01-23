import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import * as authService from '../lib/auth';
import type { UserProfile } from '../types/auth';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: typeof authService.signIn;
  signUp: typeof authService.signUp;
  signOut: typeof authService.signOut;
  resetPassword: typeof authService.resetPassword;
  hasPermission: typeof authService.hasPermission;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider rendered:', { loading, currentUser: currentUser?.email });

  useEffect(() => {
    console.log('Setting up auth listener...');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', {
        user: user?.email,
        timestamp: new Date().toISOString()
      });
      
      setCurrentUser(user);
      
      if (user) {
        try {
          console.log('Fetching user profile...');
          const profile = await authService.getUserProfile(user.uid);
          console.log('Profile fetched:', profile);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserProfile(null);
        }
      } else {
        console.log('No user, clearing profile');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    resetPassword: authService.resetPassword,
    hasPermission: authService.hasPermission
  };

  if (loading) {
    console.log('AuthProvider is loading...');
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};