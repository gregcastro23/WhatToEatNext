"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { _logger } from "@/lib/logger";
import type { ReactNode } from "react";

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

// Keys for localStorage
const STORAGE_KEY = "userProfile";

interface UserContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean; // Flag for first-time users
  isProfileIncomplete: boolean; // Flag for users with missing data
  loadProfile: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  logout: () => void;
  refreshFromServer: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState<boolean>(false);


  // Check if the profile is missing essential information
  const checkProfileCompleteness = (profile: UserProfile | null) => {
    if (!profile || !profile.birthData) {
      setIsProfileIncomplete(true);
    } else {
      setIsProfileIncomplete(false);
    }
  };


  // Load profile from localStorage first, then optionally sync with server
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsNewUser(false);


    try {
      // Try to load from localStorage first
      const storedProfile =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;

      let profileLoaded = false;
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile) as UserProfile;
          setCurrentUser(profile);
          checkProfileCompleteness(profile);
          profileLoaded = true;
          _logger.info("Profile loaded from localStorage", {
            userId: profile.userId,
          });
        } catch (parseError) {
          _logger.error("Failed to parse stored profile", parseError as any);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // If no stored profile, check if there's an authenticated session
      if (!profileLoaded) {
        try {
          const response = await fetch("/api/user/profile", {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.profile) {
              const profile: UserProfile = {
                userId: data.profile.userId || data.profile.id,
                name: data.profile.name,
                email: data.profile.email,
                preferences: data.profile.preferences,
                birthData: data.profile.birthData,
                natalChart: data.profile.natalChart,
                groupMembers: data.profile.groupMembers || [],
                diningGroups: data.profile.diningGroups || [],
              };
              setCurrentUser(profile);
              checkProfileCompleteness(profile);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
              profileLoaded = true;
              _logger.info("Profile loaded from server", {
                userId: profile.userId,
              });
            }
          }
        } catch (fetchError) {
          _logger.info("No authenticated session found");
        }
      }

      // If no profile was loaded from either source, it's a new user
      if (!profileLoaded) {
        setIsNewUser(true);
        _logger.info("No profile found, marking as new user.");
      }
    } catch (err) {
      setError("Failed to load user profile");
      _logger.error("Error loading profile: ", err as any);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh profile from server (for manual sync)
  const refreshFromServer = useCallback(async () => {
    if (!currentUser?.userId) return;

    try {
      const response = await fetch("/api/user/profile", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          const profile: UserProfile = {
            userId:
              data.profile.userId || data.profile.id || currentUser.userId,
            name: data.profile.name,
            email: data.profile.email,
            preferences: data.profile.preferences,
            birthData: data.profile.birthData,
            natalChart: data.profile.natalChart,
            groupMembers: data.profile.groupMembers || [],
            diningGroups: data.profile.diningGroups || [],
          };
          setCurrentUser(profile);
          checkProfileCompleteness(profile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          _logger.info("Profile refreshed from server");
        }
      }
    } catch (err) {
      _logger.error("Failed to refresh profile from server", err as any);
    }
  }, [currentUser?.userId]);

  const updateProfile = async (
    data: Partial<UserProfile>,
  ): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // For a new user, create a basic profile structure
      const baseProfile = currentUser || {
        userId: `local-${new Date().getTime()}`, // Create a temporary local ID
      };

      // Merge with existing profile
      const updatedProfile: UserProfile = {
        ...baseProfile,
        ...data,
      } as UserProfile;

      // Try to update on server first
      try {
        const response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedProfile),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.profile) {
            // Use server response as source of truth
            const serverProfile: UserProfile = {
              userId:
                result.profile.userId ||
                result.profile.id ||
                updatedProfile.userId,
              name: result.profile.name,
              email: result.profile.email,
              preferences: result.profile.preferences,
              birthData: result.profile.birthData,
              natalChart: result.profile.natalChart,
              groupMembers: result.profile.groupMembers || [],
              diningGroups: result.profile.diningGroups || [],
            };
            setCurrentUser(serverProfile);
            checkProfileCompleteness(serverProfile);
            setIsNewUser(false); // No longer a new user
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProfile));
            _logger.info("Profile updated on server", {
              userId: serverProfile.userId,
            });
            return serverProfile;
          }
        }
      } catch (fetchError) {
        _logger.warn("Server update failed, saving locally", fetchError as any);
      }
      
      // Fallback: Save locally if server update fails
      setCurrentUser(updatedProfile);
      checkProfileCompleteness(updatedProfile);
      setIsNewUser(false); // No longer a new user after first update
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      }

      _logger.info("Profile updated locally", {
        userId: updatedProfile.userId,
      });
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
    setIsNewUser(false);
    setIsProfileIncomplete(false);
    // Clear localStorage on logout
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    _logger.info("User logged out");
  };

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const value = {
    currentUser,
    isLoading,
    error,
    isNewUser,
    isProfileIncomplete,
    loadProfile,
    updateProfile,
    logout,
    refreshFromServer,
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
