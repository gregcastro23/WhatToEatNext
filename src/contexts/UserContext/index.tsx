"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { signIn } from "next-auth/react";
import type {
  BirthData,
  NatalChart,
  GroupMember,
  DiningGroup,
  Friendship,
  LinkedFriend,
  SavedChart,
} from "@/types/natalChart";
import { calculateAlchemicalProfile } from "@/utils/astrology/natalAlchemy";
import { logger } from "@/utils/logger";

// Define the user's alchemical constitution
interface AlchemicalProfile {
  // Elemental
  fire: number;
  water: number;
  air: number;
  earth: number;
  // Alchemical
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  // Thermodynamic Metrics
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kAlchm: number;
  monicaConstant: number;
}

// Extended UserProfile interface with natal chart, group, and social support
interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
  birthData?: BirthData;
  natalChart?: NatalChart;
  groupMembers?: GroupMember[];
  diningGroups?: DiningGroup[];
  stats?: AlchemicalProfile;
  // Social features
  friendships?: Friendship[];
  linkedFriends?: LinkedFriend[];
  // Multi-chart cosmic identities
  savedCharts?: SavedChart[];
}

// Keys for localStorage
const STORAGE_KEY = "userProfile";
const PENDING_UPDATES_KEY = "alchm_pending_updates";

interface PendingUpdate {
  data: Partial<UserProfile>;
  timestamp: number;
}

interface UserContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean;
  isProfileIncomplete: boolean;
  isOffline: boolean;
  loadProfile: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  logout: () => void;
  refreshFromServer: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

/** Parse a server profile response into our UserProfile shape */
function parseServerProfile(
  data: Record<string, unknown>,
  fallbackUserId?: string,
): UserProfile {
  return {
    userId: (data.userId || data.id || fallbackUserId || "") as string,
    name: data.name as string | undefined,
    email: data.email as string | undefined,
    preferences: data.preferences as Record<string, unknown> | undefined,
    birthData: data.birthData as BirthData | undefined,
    natalChart: data.natalChart as NatalChart | undefined,
    groupMembers: (data.groupMembers || []) as GroupMember[],
    diningGroups: (data.diningGroups || []) as DiningGroup[],
    stats: data.stats as AlchemicalProfile | undefined,
    friendships: (data.friendships || []) as Friendship[],
    linkedFriends: (data.linkedFriends || []) as LinkedFriend[],
    savedCharts: (data.savedCharts || []) as SavedChart[],
  };
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [isProfileIncomplete, setIsProfileIncomplete] =
    useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const pendingUpdatesRef = useRef<PendingUpdate[]>([]);

  // Track online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const goOnline = () => {
      setIsOffline(false);
      // Flush pending updates when coming back online
      void flushPendingUpdates();
    };
    const goOffline = () => setIsOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if the profile is missing essential information
  const checkProfileCompleteness = (profile: UserProfile | null) => {
    if (!profile || !profile.birthData) {
      setIsProfileIncomplete(true);
    } else {
      setIsProfileIncomplete(false);
    }
  };

  /** Handle 401 responses — session expired, trigger silent re-auth */
  const handleAuthError = useCallback(() => {
    logger.warn("Session expired, redirecting to sign in");
    // Don't clear localStorage — preserve profile for fast reload after re-auth
    void signIn(undefined, { callbackUrl: window.location.href });
  }, []);

  /** Flush queued updates that were made while offline */
  const flushPendingUpdates = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(PENDING_UPDATES_KEY);
      if (!raw) return;

      const pending: PendingUpdate[] = JSON.parse(raw);
      if (pending.length === 0) return;

      logger.info(`Flushing ${pending.length} pending profile updates`);

      // Merge all pending updates into one
      const merged: Partial<UserProfile> = {};
      for (const update of pending) {
        Object.assign(merged, update.data);
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(merged),
      });

      if (response.ok) {
        localStorage.removeItem(PENDING_UPDATES_KEY);
        pendingUpdatesRef.current = [];
        logger.info("Pending updates flushed successfully");
      } else if (response.status === 401) {
        handleAuthError();
      }
    } catch (err) {
      logger.error("Failed to flush pending updates", err as any);
    }
  }, [handleAuthError]);

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
          logger.info("Profile loaded from localStorage", {
            userId: profile.userId,
          });
        } catch (parseError) {
          logger.error("Failed to parse stored profile", parseError as any);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // If no stored profile (or missing natalChart), try fetching from server
      if (!profileLoaded) {
        try {
          const response = await fetch("/api/user/profile", {
            method: "GET",
            credentials: "include",
          });

          if (response.status === 401) {
            // Not authenticated — this is normal for unauthenticated visitors
            setIsNewUser(true);
          } else if (response.ok) {
            const data = await response.json();
            if (data.success && data.profile) {
              const profile = parseServerProfile(data.profile);
              setCurrentUser(profile);
              checkProfileCompleteness(profile);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
              profileLoaded = true;
              logger.info("Profile loaded from server", {
                userId: profile.userId,
              });
            }
          }
        } catch (fetchError) {
          if (!profileLoaded) {
            setIsOffline(true);
          }
          logger.info("No authenticated session found");
        }
      }

      // If no profile was loaded from either source, it's a new user
      if (!profileLoaded) {
        setIsNewUser(true);
        logger.info("No profile found, marking as new user.");
      }
    } catch (err) {
      setError("Failed to load user profile");
      logger.error("Error loading profile: ", err as any);
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

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          const profile = parseServerProfile(
            data.profile,
            currentUser.userId,
          );
          setCurrentUser(profile);
          checkProfileCompleteness(profile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          logger.info("Profile refreshed from server");
        }
      }
    } catch (err) {
      setIsOffline(true);
      logger.error("Failed to refresh profile from server", err as any);
    }
  }, [currentUser?.userId, handleAuthError]);

  const updateProfile = async (
    data: Partial<UserProfile>,
  ): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // For a new user, create a basic profile structure
      const baseProfile = currentUser || {
        userId: `local-${new Date().getTime()}`,
      };

      // Merge with existing profile
      const updatedProfile: UserProfile = {
        ...baseProfile,
        ...data,
      } as UserProfile;

      // If birthData is being updated, and we have a natal chart, recalculate stats
      if (data.birthData && updatedProfile.natalChart) {
        updatedProfile.stats = calculateAlchemicalProfile(updatedProfile.natalChart);
      }

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

        if (response.status === 401) {
          handleAuthError();
          return null;
        }

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.profile) {
            const serverProfile = parseServerProfile(
              result.profile,
              updatedProfile.userId,
            );
            setCurrentUser(serverProfile);
            checkProfileCompleteness(serverProfile);
            setIsNewUser(false);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProfile));
            logger.info("Profile updated on server", {
              userId: serverProfile.userId,
            });
            return serverProfile;
          }
        }
      } catch (fetchError) {
        logger.warn("Server update failed, saving locally", fetchError as any);
        setIsOffline(true);

        // Queue update for later sync
        const pending: PendingUpdate = { data, timestamp: Date.now() };
        pendingUpdatesRef.current.push(pending);
        try {
          localStorage.setItem(
            PENDING_UPDATES_KEY,
            JSON.stringify(pendingUpdatesRef.current),
          );
        } catch {
          // localStorage full — non-critical
        }
      }

      // Fallback: Save locally if server update fails
      setCurrentUser(updatedProfile);
      checkProfileCompleteness(updatedProfile);
      setIsNewUser(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      }

      logger.info("Profile updated locally", {
        userId: updatedProfile.userId,
      });
      return updatedProfile;
    } catch (err) {
      setError("Failed to update profile");
      logger.error("Error updating profile: ", err as any);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsNewUser(false);
    setIsProfileIncomplete(false);
    setIsOffline(false);
    // Clear localStorage on logout
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PENDING_UPDATES_KEY);
      sessionStorage.removeItem("alchm_subscription_cache");
    }
    logger.info("User logged out");
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
    isOffline,
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
export type { UserProfile, AlchemicalProfile };
