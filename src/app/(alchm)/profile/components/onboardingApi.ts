import { readJson } from "@/lib/api/json";
import type { BirthData, NatalChart } from "@/types/natalChart";
import {
  type UserPreferences,
  type UserProfileData,
  type LocationData,
  DEFAULT_PREFERENCES,
} from "./types";

export function getStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function parseStoredProfile(
  stored: string | null,
  userId?: string,
  userName?: string | null,
  userEmail?: string | null,
): UserProfileData | null {
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as UserProfileData;
    if (parsed.natalChart) {
      return {
        ...parsed,
        userId: parsed.userId ?? userId,
        name: parsed.name ?? (userName ?? undefined),
        email: parsed.email ?? (userEmail ?? undefined),
      };
    }
  } catch {
    // Parse error ignored
  }
  return null;
}

export function loadInitialPreferences(): UserPreferences {
  const storedPrefs = getStorageItem("userFoodPreferences");
  if (storedPrefs) {
    try {
      return JSON.parse(storedPrefs) as UserPreferences;
    } catch {
      // fallback
    }
  }
  return DEFAULT_PREFERENCES;
}

export async function fetchServerProfile(): Promise<{ profile: UserProfileData | null; serverLoaded: boolean }> {
  try {
    const res = await fetch("/api/user/profile", { credentials: "include" });
    if (res.ok) {
      const data = await readJson<{ success?: boolean; profile?: UserProfileData }>(res);
      if (data.success && data.profile) {
        return { profile: data.profile, serverLoaded: true };
      }
    }
  } catch {
    // Ignore network errors
  }
  return { profile: null, serverLoaded: false };
}

export async function executeOnboarding(
  email: string,
  name: string,
  birthLocation: LocationData,
  birthDateTime: string,
): Promise<{ success: boolean; message?: string; natalChart?: NatalChart; birthData: BirthData }> {
  const birthData: BirthData = {
    dateTime: new Date(birthDateTime).toISOString(),
    latitude: birthLocation.latitude,
    longitude: birthLocation.longitude,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  const response = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, birthData }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      return { success: false, message: "Your session has expired. Please log out and sign in again.", birthData };
    }
    return { success: false, message: `Server error (${response.status})`, birthData };
  }
  const result = await readJson<{
    success?: boolean;
    message?: string;
    natalChart?: NatalChart;
  }>(response);
  return {
    success: Boolean(result.success),
    message: result.message,
    natalChart: result.natalChart,
    birthData,
  };
}

export function triggerQuestReward(updatedPrefs: UserPreferences): void {
  const essentialsFilled =
    updatedPrefs.preferredCuisines.length > 0 &&
    updatedPrefs.dietaryRestrictions.length >= 0 &&
    Boolean(updatedPrefs.spicePreference) &&
    Boolean(updatedPrefs.complexity);

  if (essentialsFilled) {
    fetch("/api/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ event: "preferences_complete" }),
    })
      .then((res) => (res.ok ? readJson<{ completedQuests?: unknown[] }>(res) : null))
      .then((data) => {
        if (data?.completedQuests && data.completedQuests.length > 0 && typeof window !== "undefined") {
          import("@/hooks/useTokenEconomy")
            .then(({ emitTokenEconomyUpdate }) => {
              emitTokenEconomyUpdate({
                source: "quest",
                credits: { spirit: 25, essence: 25, matter: 25, substance: 25 },
              });
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }
}
