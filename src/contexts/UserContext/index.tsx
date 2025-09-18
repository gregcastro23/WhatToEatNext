'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import { UserProfile } from '../../services/userService';
// Import * as userService from '../../services/userService';

// Mock UserProfile interface for build compatibility
interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
}

// Mock userService for build compatibility
const userService = {
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    return { userId, name: 'Mock User', email: 'mock@example.com' };
  },
  saveUserProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    return { userId: profile.userId || 'mock', ...profile } as UserProfile;
  },
};

interface UserContextType {
  currentUser: UserProfile | null,
  isLoading: boolean,
  error: string | null,
  loadProfile: () => void,
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>,
  logout: () => void,
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock user ID for demo purposes
      const user = await userService.getUserProfile('mock-user-id');
      setCurrentUser(user);
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser) {
        throw new Error('No user profile loaded');
      }

      const updatedProfile = await userService.saveUserProfile({
        ...data,
        userId: currentUser.userId,
      });

      setCurrentUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const value = {
    currentUser,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
