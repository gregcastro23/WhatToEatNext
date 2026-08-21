import React from "react";
import { AlchemicalConstitutionBlock } from "./blocks/AlchemicalConstitutionBlock";
import { DataPrivacyAndLearningBlock } from "./blocks/DataPrivacyBlock";
import { DietaryPrefsBlock } from "./blocks/DietaryPrefsBlock";
import { InsightsTicker } from "./blocks/InsightsTicker";
import { NatalChartBlock } from "./blocks/NatalChartBlock";
import { RecentActivityBlock } from "./blocks/RecentActivityBlock";
import { TasteGraphBlock } from "./blocks/TasteGraphBlock";
import { TokenEconomyBlock } from "./blocks/TokenEconomyBlock";
import type { ProfileBlockDef, ProfileTab, ProfileBlockProps, ProfileData } from "./blocks/types";

export type { ProfileTab, ProfileBlockDef, ProfileBlockProps, ProfileData };

export const PROFILE_BLOCKS: Record<string, ProfileBlockDef> = {
  tasteGraph: {
    id: "tasteGraph",
    title: "Taste Graph",
    tab: "Palate",
    visibleTo: "public",
    render: ({ data, isOwner }) => <TasteGraphBlock data={data} isOwner={isOwner} />,
  },
  dietaryPrefs: {
    id: "dietaryPrefs",
    title: "Dietary Preferences",
    tab: "Palate",
    visibleTo: "public",
    render: ({ data, isOwner }) => <DietaryPrefsBlock data={data} isOwner={isOwner} />,
  },
  insightsTicker: {
    id: "insightsTicker",
    title: "Insights Ticker",
    tab: "Palate",
    visibleTo: "owner",
    render: ({ data }) => <InsightsTicker data={data} />,
  },
  natalChart: {
    id: "natalChart",
    title: "Natal Chart Wheel",
    tab: "Essence",
    visibleTo: "public",
    render: ({ data }) => <NatalChartBlock data={data} />,
  },
  alchemicalConstitution: {
    id: "alchemicalConstitution",
    title: "Alchemical Constitution",
    tab: "Essence",
    visibleTo: "public",
    render: ({ data }) => <AlchemicalConstitutionBlock data={data} />,
  },
  tokenEconomy: {
    id: "tokenEconomy",
    title: "Token Economy & Yield",
    tab: "Practice",
    visibleTo: "owner",
    render: ({ data }) => <TokenEconomyBlock data={data} />,
  },
  recentActivity: {
    id: "recentActivity",
    title: "Recent Activity",
    tab: "Practice",
    visibleTo: "public",
    render: ({ data }) => <RecentActivityBlock data={data} />,
  },
  dataPrivacy: {
    id: "dataPrivacy",
    title: "Data & Privacy",
    tab: "Practice",
    visibleTo: "owner",
    render: ({ data, isOwner }) => <DataPrivacyAndLearningBlock data={data} isOwner={isOwner} />,
  },
};
