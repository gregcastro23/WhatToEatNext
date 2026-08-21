import type { NatalChart } from "@/types/natalChart";
import type { Session } from "next-auth";

export type ProfileStep = "birth-data" | "preferences" | "dashboard";

export interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: "mild" | "medium" | "hot";
  complexity: "simple" | "moderate" | "complex";
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRestrictions: [],
  preferredCuisines: [],
  dislikedIngredients: [],
  spicePreference: "medium",
  complexity: "moderate",
};

export interface LocationData {
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface UserProfileData {
  userId?: string;
  name?: string;
  email?: string;
  natalChart?: NatalChart;
  preferences?: UserPreferences;
  [key: string]: unknown;
}

export interface DashboardProps {
  session: Session | null;
  profileData: UserProfileData | null;
  natalChart: NatalChart;
  preferences: UserPreferences;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}
