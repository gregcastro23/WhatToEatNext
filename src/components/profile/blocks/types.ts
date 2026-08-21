import type { ReactNode } from "react";

export type ProfileTab = "Essence" | "Palate" | "Practice";

export interface NatalPlacement {
  planet?: string;
  sign?: string;
  degree?: number;
  minutes?: number;
}

export interface CuisinePreference {
  name: string;
}

export interface TasteGraphData {
  elementalAffinities?: {
    Fire?: number;
    Water?: number;
    Earth?: number;
    Air?: number;
    [key: string]: number | undefined;
  };
  cuisines?: CuisinePreference[];
}

export interface BalanceData {
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
}

export interface ActivityItem {
  id: string;
  eventType: string;
  createdAt: string | number | Date;
}

export interface DietaryPreferencesData {
  restrictions?: string[];
}

export interface ProfileData {
  userId?: string;
  dominantElement?: string | null;
  dietary_preferences?: DietaryPreferencesData;
  natalPositions?: NatalPlacement[];
  tasteGraph?: TasteGraphData;
  balances?: BalanceData;
  recentActivity?: ActivityItem[];
}

export interface ProfileBlockProps {
  data: ProfileData;
  isOwner: boolean;
}

export interface ProfileBlockDef {
  id: string;
  title: string;
  tab: ProfileTab;
  visibleTo: "public" | "owner";
  render: (props: ProfileBlockProps) => ReactNode;
}
