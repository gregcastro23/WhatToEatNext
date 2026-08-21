import React from "react";
import type { AgentArtifact } from "@/lib/agents/fetchAgentProfile";
import { RecipeExpandedView } from "./RecipeExpandedView";
import type { RecipeDetail } from "./types";

const ArtifactCardHeader: React.FC<{ artifact: AgentArtifact; isRecipe: boolean; isExpanded: boolean }> = ({
  artifact,
  isRecipe,
  isExpanded,
}) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-500/25 text-amber-300 border border-amber-500/30">
          {artifact.kind}
        </span>
        <span className="text-[10px] text-white/30 font-mono">
          {new Date(artifact.createdAt).toLocaleDateString()}
        </span>
      </div>
      {isRecipe && (
        <span className="text-[10px] font-bold text-purple-300/80 hover:text-purple-200 transition-colors uppercase tracking-wider flex items-center gap-1 font-mono">
          {isExpanded ? "Collapse ▴" : "Expand Recipe ▾"}
        </span>
      )}
    </div>
    <h3 className="text-sm font-bold text-white mb-1">{artifact.title}</h3>
    {!isExpanded && (
      <p className="text-xs text-white/60 leading-relaxed mb-4">{artifact.summary}</p>
    )}
  </div>
);

const ArtifactExpandedBody: React.FC<{
  isLoading: boolean;
  recipe: RecipeDetail | null;
  alchmKitchenPath?: string;
}> = ({ isLoading, recipe, alchmKitchenPath }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
          Drawing recipe from transits...
        </span>
      </div>
    );
  }
  if (recipe) {
    return <RecipeExpandedView recipe={recipe} alchmKitchenPath={alchmKitchenPath} />;
  }
  return null;
};

interface ArtifactCardProps {
  artifact: AgentArtifact;
  isExpanded: boolean;
  isLoading: boolean;
  recipe: RecipeDetail | null;
  onToggleRecipe: (artifactId: string, path?: string) => void;
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  isExpanded,
  isLoading,
  recipe,
  onToggleRecipe,
}) => {
  const isRecipe = artifact.kind === "recipe";
  const handleRecipeToggle = (): void => {
    if (isRecipe) onToggleRecipe(artifact.id, artifact.alchmKitchenPath);
  };

  return (
    <div
      {...(isRecipe
        ? {
            onClick: handleRecipeToggle,
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>): void => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleRecipeToggle();
              }
            },
            role: "button",
            tabIndex: 0,
            "aria-expanded": isExpanded,
          }
        : {})}
      className={`p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isExpanded ? "md:col-span-2 border-purple-500/25 bg-purple-950/10" : ""
      }`}
    >
      <ArtifactCardHeader artifact={artifact} isRecipe={isRecipe} isExpanded={isExpanded} />
      {isExpanded && <div className="h-px bg-white/10 my-4" />}
      {isExpanded && (
        <ArtifactExpandedBody
          isLoading={isLoading}
          recipe={recipe}
          alchmKitchenPath={artifact.alchmKitchenPath}
        />
      )}
    </div>
  );
};

interface ArtifactsSectionProps {
  artifacts: AgentArtifact[];
  expandedRecipes: Record<string, boolean>;
  loadingRecipes: Record<string, boolean>;
  recipeDetails: Record<string, RecipeDetail>;
  onToggleRecipe: (artifactId: string, path?: string) => void;
  getRecipeIdFromPath: (path?: string) => string | null;
}

export const ArtifactsSection: React.FC<ArtifactsSectionProps> = ({
  artifacts,
  expandedRecipes,
  loadingRecipes,
  recipeDetails,
  onToggleRecipe,
  getRecipeIdFromPath,
}) => {
  if (artifacts.length === 0) return null;

  return (
    <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
      <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
        Created by this Agent
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            isExpanded={Boolean(expandedRecipes[artifact.id])}
            isLoading={Boolean(loadingRecipes[getRecipeIdFromPath(artifact.alchmKitchenPath) ?? ""])}
            recipe={recipeDetails[getRecipeIdFromPath(artifact.alchmKitchenPath) ?? ""] ?? null}
            onToggleRecipe={onToggleRecipe}
          />
        ))}
      </div>
    </section>
  );
};
