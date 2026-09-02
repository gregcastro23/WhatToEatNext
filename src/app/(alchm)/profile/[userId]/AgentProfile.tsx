"use client";

import { useSession } from "next-auth/react";
import React from "react";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import type { AgentInteraction, AgentAction, AgentArtifact } from "@/lib/agents/fetchAgentProfile";
import {
  NatalChartSection,
  HistoricalDietSection,
  BirthDataSection,
  ActionHistorySection,
  InteractionsSection,
} from "./agent-components/AgentAstrologySections";
import {
  AboutSection,
  EssenceSection,
  QuotesAndBeliefsSection,
  PersonalityAndShadowsSection,
  AbilitiesSection,
  ConsciousnessSection,
} from "./agent-components/AgentBioSections";
import { AgentHeroHeader } from "./agent-components/AgentHeroHeader";
import { ArtifactsSection } from "./agent-components/ArtifactsSection";
import { SynastrySection } from "./agent-components/SynastrySection";
import { TransitOverlaySection } from "./agent-components/TransitOverlaySection";
import { useAgentRecipeViewer } from "./agent-components/useAgentRecipeViewer";
import { useAgentRelationalData } from "./agent-components/useAgentRelationalData";
import type { Balances, TransitOverlayData, SynastryData, ViewerProfileData, RecipeDetail } from "./agent-components/types";

interface AgentProfileProps {
  agent: CraftedAgentProfile;
  balances: Balances;
  handle?: string | null;
  interactions?: AgentInteraction[];
  actions?: AgentAction[];
  artifacts?: AgentArtifact[];
  userId?: string;
  viewer?: { follows: boolean; followedBy: boolean; isCommensal: boolean } | null;
}

interface RelationalDataBundle {
  transitOverlay: TransitOverlayData | null;
  loadingTransit: boolean;
  synastryData: SynastryData | null;
  loadingSynastry: boolean;
  viewerProfile: ViewerProfileData | null;
}

interface RecipeViewerBundle {
  expandedRecipes: Record<string, boolean>;
  loadingRecipes: Record<string, boolean>;
  recipeDetails: Record<string, RecipeDetail>;
  toggleRecipe: (artifactId: string, path?: string) => Promise<void>;
  getRecipeIdFromPath: (path?: string) => string | null;
}

const AgentRelationalSections: React.FC<{
  agent: CraftedAgentProfile;
  accent: string;
  currentUserId?: string;
  relational: RelationalDataBundle;
}> = ({ agent, accent, currentUserId, relational }) => (
  <>
    <AboutSection agent={agent} />
    <EssenceSection agent={agent} />
    <QuotesAndBeliefsSection agent={agent} accent={accent} />
    <PersonalityAndShadowsSection agent={agent} />
    <AbilitiesSection agent={agent} />
    <ConsciousnessSection agent={agent} accent={accent} />
    {(relational.loadingTransit || relational.transitOverlay) && (
      <TransitOverlaySection
        transitOverlay={relational.transitOverlay}
        loadingTransit={relational.loadingTransit}
        agentName={agent.name}
      />
    )}
    <SynastrySection
      synastryData={relational.synastryData}
      loadingSynastry={relational.loadingSynastry}
      viewerProfile={relational.viewerProfile}
      agentName={agent.name}
      dominantElement={agent.consciousness?.dominantElement}
      isLoggedIn={Boolean(currentUserId)}
    />
  </>
);

const AgentArtifactsAndHistory: React.FC<{
  agent: CraftedAgentProfile;
  accent: string;
  interactions: AgentInteraction[];
  actions: AgentAction[];
  artifacts: AgentArtifact[];
  viewer: RecipeViewerBundle;
}> = ({ agent, accent, interactions, actions, artifacts, viewer }) => (
  <>
    <InteractionsSection interactions={interactions} />
    <ArtifactsSection
      artifacts={artifacts}
      expandedRecipes={viewer.expandedRecipes}
      loadingRecipes={viewer.loadingRecipes}
      recipeDetails={viewer.recipeDetails}
      onToggleRecipe={(id, p): void => { viewer.toggleRecipe(id, p).catch(() => {}); }}
      getRecipeIdFromPath={viewer.getRecipeIdFromPath}
    />
    <ActionHistorySection actions={actions} />
    <NatalChartSection agent={agent} />
    <HistoricalDietSection agent={agent} accent={accent} />
    <BirthDataSection agent={agent} />
  </>
);

export default function AgentProfile(props: AgentProfileProps): React.ReactElement {
  const { agent, balances, handle, interactions = [], actions = [], artifacts = [], userId, viewer } = props;
  const accent = agent.appearance?.color ?? "#7c3aed";
  const slug = handle ? (handle.split("@")[0] ?? null) : null;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? undefined;

  const relational = useAgentRelationalData(agent.name, slug, currentUserId);
  const recipeViewer = useAgentRecipeViewer();

  return (
    <>
      <AgentHeroHeader agent={agent} balances={balances} handle={handle} slug={slug} userId={userId} viewer={viewer} accent={accent} />
      <AgentRelationalSections agent={agent} accent={accent} currentUserId={currentUserId} relational={relational} />
      <AgentArtifactsAndHistory agent={agent} accent={accent} interactions={interactions} actions={actions} artifacts={artifacts} viewer={recipeViewer} />
    </>
  );
}
