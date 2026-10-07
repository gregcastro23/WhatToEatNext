"use client";

/**
 * Recipe Builder Page
 * Combines the Recipe Builder (ingredient search, preferences) and the
 * planetary recommendation pipeline into a single cohesive interface.
 *
 * Features:
 *  - Quick Generate bar (breakfast / lunch / dinner / snack)
 *  - Full builder panel (ingredients, cuisines, cooking methods, dietary)
 *  - Swipeable recipe carousel powered by planetary + natal-chart alignment
 *  - Personalized suggestions when the user is signed in
 *
 * @file src/app/recipe-builder/page.tsx
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useMemo } from "react";
import GenerateRecipeButton from "@/components/recipe-builder/GenerateRecipeButton";
import QuickGenerateBar from "@/components/recipe-builder/QuickGenerateBar";
import {
  useRecipeGeneration,
  type RecipeGeneration,
} from "@/components/recipe-builder/useRecipeGeneration";
import { useUser } from "@/contexts/UserContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { currentDayOfWeek } from "@/lib/recipe-builder/generateRecommendations";
import { createLogger } from "@/utils/logger";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";

const RecipeBuilderPanel = dynamic(
  () => import("@/components/recipe-builder/RecipeBuilderPanel"),
);
const RecipeSuggestionCarousel = dynamic(
  () => import("@/components/recipe-builder/RecipeSuggestionCarousel"),
);
const CosmicAlignmentPreview = dynamic(
  () => import("@/components/recipe-builder/CosmicAlignmentPreview"),
  { ssr: false },
);

const logger = createLogger("RecipeBuilder");

const NAV_LINK =
  "px-3.5 py-1.5 rounded-xl text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";

function NatalChartBanner(): React.JSX.Element {
  return (
    <div className="p-4 sm:p-5 glass-card-premium rounded-2xl border border-amber-500/30 bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-purple-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-3.5">
        <span className="text-2xl" aria-hidden>✨</span>
        <div>
          <p className="text-sm font-semibold text-amber-200">Harmonize with Your Celestial Blueprint</p>
          <p className="text-xs text-amber-300/80 mt-0.5">
            Connect your Natal Chart to unlock personalized alchemical resonance scores and custom transits.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-signin-modal"))}
        className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-bold rounded-xl shadow-md hover:from-amber-400 hover:to-orange-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
      >
        Connect Natal Chart
      </button>
    </div>
  );
}

function PageHero({ isPersonalized }: { isPersonalized: boolean }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="t-tag px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300">
            Crucible &bull; Alchemical Synthesis
          </span>
        </div>
        <h1 className="t-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-amber-100 to-orange-200">
          Recipe Builder
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-xl">
          {isPersonalized
            ? "Formulate bespoke recipes dynamically aligned with your natal chart and planetary transits."
            : "Synthesize cosmically-aligned recipes from live planetary harmonics and kitchen ingredients."}
        </p>
      </div>
      <nav aria-label="Recipe pages" className="flex items-center gap-2 shrink-0">
        <Link
          href="/cosmic-recipe"
          className={`${NAV_LINK} bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 font-medium border border-purple-500/25 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]`}
        >
          Cosmic Recipe
        </Link>
        <Link
          href="/recipes"
          className={`${NAV_LINK} bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white font-medium border border-white/10`}
        >
          All Recipes
        </Link>
        <Link href="/" className={`${NAV_LINK} bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white`}>
          Home
        </Link>
      </nav>
    </div>
  );
}

function ResultsPanel({
  generation,
  isPersonalized,
}: {
  generation: RecipeGeneration;
  isPersonalized: boolean;
}): React.JSX.Element {
  const { suggestions, lastGeneratedFrom } = generation;
  const count = suggestions.length;
  const resonance = isPersonalized ? "natal chart" : "planetary";

  return (
    <section
      aria-label="Synthesized recipes"
      className="glass-card-premium rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500"
    >
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div>
          <h2 className="t-display text-xl font-medium text-white">
            {count > 0
              ? `${count} Alchemical Formulation${count !== 1 ? "s" : ""} Synthesized`
              : "No Recipes Synthesized"}
          </h2>
          <p className="t-mono text-[11px] text-white/50 mt-0.5">
            {lastGeneratedFrom === "quick" ? "Quick synthesis" : "Crucible parameters"} · {resonance} resonance
          </p>
        </div>
        <button
          type="button"
          onClick={generation.clear}
          className="text-xs text-white/40 hover:text-red-400 hover:bg-red-950/30 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          Clear Results
        </button>
      </div>
      <div className="p-4 sm:p-6">
        <RecipeSuggestionCarousel
          suggestions={suggestions}
          currentIndex={generation.carouselIndex}
          onIndexChange={generation.setCarouselIndex}
          isLoading={generation.isGenerating}
          isPersonalized={isPersonalized}
          onSaveToQueue={(meal) => logger.info(`Queued recipe: ${meal.recipe.name}`)}
        />
      </div>
    </section>
  );
}

function PersonalizationNudge(): React.JSX.Element {
  return (
    <div className="glass-card-premium rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-purple-950/40 p-5 shadow-lg">
      <div className="flex items-start gap-4">
        <span className="text-3xl" aria-hidden>🔮</span>
        <div>
          <p className="text-sm font-semibold text-purple-200">Elevate to Natal Alchemical Precision</p>
          <p className="text-xs text-purple-300/80 mt-1 max-w-xl leading-relaxed">
            Sign in and add your birth chart data. The crucible factors your natal sun, moon, and rising alignments into every ingredient pairing and planetary hour recommendation.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-md transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
          >
            <span>Configure Natal Profile</span>
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RecipeBuilderPage(): React.JSX.Element {
  const astroState = useAstrologicalState();
  const { currentUser } = useUser();
  const generation = useRecipeGeneration();
  const { isGenerating, hasGenerated, generationError, quickGenerate } = generation;
  const planetaryDayInfo = useMemo(() => getPlanetaryDayCharacteristics(currentDayOfWeek()), []);
  const isPersonalized = Boolean(currentUser?.natalChart);

  return (
    <div className="relative text-[#f2edff] py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 space-y-7">
        {!isPersonalized && <NatalChartBanner />}
        <PageHero isPersonalized={isPersonalized} />
        <QuickGenerateBar
          onGenerate={(mealType) => {
            quickGenerate(mealType).catch((err: unknown) => logger.error("Quick generate failed:", err));
          }}
          isGenerating={isGenerating}
          planetaryInfo={planetaryDayInfo}
          planetaryHour={astroState.currentPlanetaryHour}
          lunarPhase={astroState.lunarPhase}
          isPersonalized={isPersonalized}
        />
        <RecipeBuilderPanel />
        <CosmicAlignmentPreview />
        <GenerateRecipeButton
          onGenerated={generation.onBuilderGenerated}
          onGeneratingChange={generation.onGeneratingChange}
          onError={generation.setGenerationError}
          isGenerating={isGenerating}
        />
        {generationError && (
          <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-red-200 text-xs flex items-center gap-2">
            <span aria-hidden>⚠️</span>
            <span>{generationError}</span>
          </div>
        )}
        {hasGenerated && <ResultsPanel generation={generation} isPersonalized={isPersonalized} />}
        {isGenerating && !hasGenerated && (
          <div className="glass-card-premium rounded-3xl border border-white/10 p-8 shadow-2xl">
            <RecipeSuggestionCarousel suggestions={[]} currentIndex={0} onIndexChange={() => undefined} isLoading />
          </div>
        )}
        {!isPersonalized && !hasGenerated && <PersonalizationNudge />}
      </div>
    </div>
  );
}
