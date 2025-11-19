"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { _logger } from "@/lib/logger";
import type { ReactNode } from "react";
import type { BirthData, NatalChart } from "@/services/natalChartService";

// Import { UserProfile } from '../../services/userService';
// Import * as userService from '../../services/userService',

// Mock UserProfile interface for build compatibility
interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
  birthData?: BirthData;
  natalChart?: NatalChart;
}

// Mock userService for build compatibility
const userService = {
  getUserProfile: async (userId: string): Promise<UserProfile> => ({
    userId,
    name: "Mock User",
    email: "mock@example.com",
  }),
  saveUserProfile: async (
    profile: Partial<UserProfile>,
  ): Promise<UserProfile> =>
    ({ userId: profile.userId || "mock", ...profile }) as UserProfile,
};

interface UserContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
          setCurrentUser(JSON.parse(storedProfile));
        }
      } catch (err) {
        _logger.error("Error loading profile from localStorage: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromLocalStorage();
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem("userProfile", JSON.stringify(currentUser));
      } catch (err) {
        _logger.error("Error saving profile to localStorage: ", err);
      }
    }
  }, [currentUser]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock user ID for demo purposes
      const user = await userService.getUserProfile("mock-user-id");
      // Merge with existing data from localStorage
      setCurrentUser((prev) => ({
        ...user,
        ...prev,
        userId: user.userId,
      }));
    } catch (err) {
      setError("Failed to load user profile");
      _logger.error("Error loading profile: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    data: Partial<UserProfile>,
  ): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser) {
        // Create a new profile if one doesn't exist
        const newProfile: UserProfile = {
          userId: "mock-user-id",
          ...data,
        };
        setCurrentUser(newProfile);
        return newProfile;
      }

      // Merge new data with existing profile
      const updatedProfile: UserProfile = {
        ...currentUser,
        ...data,
      };

      // Save to mock service (in real app, this would be an API call)
      await userService.saveUserProfile(updatedProfile);

      setCurrentUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError("Failed to update profile");
      _logger.error("Error updating profile: ", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("userProfile");
  };

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
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
