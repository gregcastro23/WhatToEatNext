'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../../types/user';
import { UserProfileService } from '../../services/user/UserProfileService';

interface UserContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => void;
  clearProfile: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  isLoading: false,
  error: null,
  loadProfile: () => {},
  clearProfile: () => {},
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const userProfileService = UserProfileService.getInstance();

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get all profiles and use the first one
      const profiles = userProfileService.getAllUserProfiles();
      if (profiles.length > 0) {
        setCurrentUser(profiles[0]);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const clearProfile = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      isLoading, 
      error, 
      loadProfile, 
      clearProfile 
    }}>
      {children}
    </UserContext.Provider>
  );
}; 