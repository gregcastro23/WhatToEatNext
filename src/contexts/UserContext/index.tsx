"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { _logger } from "@/lib/logger";
import type { ReactNode } from "react";

// Import { UserProfile } from '../../services/userService';
// Import * as userService from '../../services/userService',

import type {
  BirthData,
  NatalChart,
  GroupMember,
  DiningGroup,
} from "@/types/natalChart";

// Extended UserProfile interface with natal chart and group support
interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
  birthData?: BirthData;
  natalChart?: NatalChart;
  groupMembers?: GroupMember[];
  diningGroups?: DiningGroup[];
}

// Mock userService for build compatibility
const userService = {
  getUserProfile: async (userId: string): Promise<UserProfile> => ({
    userId,
    name: "Mock User",
    email: "mock@example.com",
    groupMembers: [],
    diningGroups: [],
  }),
  saveUserProfile: async (
    profile: Partial<UserProfile>,
  ): Promise<UserProfile> => {
    const baseProfile: UserProfile = {
      userId: profile.userId || "mock",
      name: profile.name || "Mock User",
      email: profile.email || "mock@example.com",
      groupMembers: profile.groupMembers || [],
      diningGroups: profile.diningGroups || [],
    };
    return { ...baseProfile, ...profile };
  },
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

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to load from localStorage first
      const storedProfile =
        typeof window !== "undefined"
          ? localStorage.getItem("userProfile")
          : null;

      if (storedProfile) {
        const profile = JSON.parse(storedProfile) as UserProfile;
        setCurrentUser(profile);
      } else {
        // Fallback to mock user
        const user = await userService.getUserProfile("mock-user-id");
        setCurrentUser(user);
      }
    } catch (err) {
      setError("Failed to load user profile");
      _logger.error("Error loading profile: ", err as any);
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
        throw new Error("No user profile loaded");
      }

      const updatedProfile = await userService.saveUserProfile({
        ...data,
        userId: currentUser.userId,
      });

      setCurrentUser(updatedProfile);

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      }

      return updatedProfile;
    } catch (err) {
      setError("Failed to update profile");
      _logger.error("Error updating profile: ", err as any);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    // Clear localStorage on logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("userProfile");
    }
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
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Export types for use in other modules
export type { UserProfile };
