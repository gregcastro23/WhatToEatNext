"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaMagic, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useToast } from '@/components/common/Toast';
import { useRecipeBuilder } from '@/contexts/RecipeBuilderContext';
import { useUser } from '@/contexts/UserContext';
import type { MonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';
import { mintRecipe as submitRecipeMint, mintResultMessage } from '@/lib/recipe-nft/mintClient';
import type { cosmicRecipeSchema } from '@/types/cosmicRecipeSchema';
import { getAllCuisineNames } from '@/utils/cuisine/cuisineIndex';
import { saveRecipeToStore } from '@/utils/generatedRecipeStore';
import type { z } from 'zod';

type CosmicRecipe = z.infer<typeof cosmicRecipeSchema>;

/**
 * Adapts a streamed `CosmicRecipe` into the `MonicaOptimizedRecipe` shape
 * consumed by `/generated-recipe/[id]`. We don't fabricate monica/seasonal
 * metadata — those fields remain empty placeholders; the destination page
 * already guards each section with optional chaining.
 */
function mapCosmicToStoreRecipe(
  cosmic: CosmicRecipe,
  cuisineHint?: string,
): MonicaOptimizedRecipe {
  const id = `cosmic-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  const elementalRaw = cosmic.elementalBalance ?? {};
  const normalize = (v: unknown) => {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n)) return 0;
    return n > 1 ? n / 100 : n;
  };
  const elementalProperties = {
    Fire: normalize((elementalRaw as any).fire),
    Water: normalize((elementalRaw as any).water),
    Earth: normalize((elementalRaw as any).earth),
    Air: normalize((elementalRaw as any).air),
  };

  const ingredients = (cosmic.ingredients ?? []).map((ing) => {
    const rawQty = ing?.quantity;
    const numeric = Number(rawQty);
    return {
      name: ing?.name ?? "",
      amount: Number.isFinite(numeric) ? numeric : (rawQty ?? 0),
      unit: ing?.unit ?? "",
      notes: ing?.household_description ?? undefined,
    };
  });

  const instructions = (cosmic.steps ?? [])
    .slice()
    .sort((a, b) => (a?.step_number ?? 0) - (b?.step_number ?? 0))
    .map((step) => step?.instruction ?? "")
    .filter(Boolean);

  const cuisine = cosmic.cuisine ?? cuisineHint ?? "Fusion";

  const totalMinutes = cosmic.total_time ?? undefined;

  const nutrition = cosmic.nutrition
    ? {
        calories: cosmic.nutrition.calories,
        protein: cosmic.nutrition.protein,
        carbs: cosmic.nutrition.carbohydrates,
        fat: cosmic.nutrition.fat,
      }
    : undefined;

  return {
    id,
    name: cosmic.title ?? "Cosmic Recipe",
    description: cosmic.short_description ?? "",
    cuisine,
    mealType: cosmic.tags?.meal_type ? [cosmic.tags.meal_type] : [],
    prepTime: totalMinutes ? `${totalMinutes} min` : undefined,
    cookTime: undefined,
    numberOfServings: cosmic.yields ?? undefined,
    ingredients: ingredients as any,
    instructions: instructions as any,
    elementalProperties: elementalProperties as any,
    nutrition: nutrition as any,
    monicaOptimization: {
      originalMonica: null,
      optimizedMonica: 0,
      optimizationScore: 0,
      temperatureAdjustments: [],
      timingAdjustments: [],
      intensityModifications: [],
      planetaryTimingRecommendations: cosmic.astro_explanation?.correspondences ?? [],
    },
    seasonalAdaptation: {
      currentSeason: "spring" as any,
      seasonalScore: 0,
      seasonalIngredientSubstitutions: [],
      seasonalCookingMethodAdjustments: [],
    },
    cuisineIntegration: {
      authenticity: 0,
      fusionPotential: 0,
      culturalNotes: cosmic.astro_explanation?.summary
        ? [cosmic.astro_explanation.summary]
        : [],
    } as any,
  } as unknown as MonicaOptimizedRecipe;
}

export default function CosmicRecipeGenerator() {
  const { currentUser } = useUser();
  const builder = useRecipeBuilder();

  const [prompt, setPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ingredientsMain, setIngredientsMain] = useState("");
  const [disallowedIngredients, setDisallowedIngredients] = useState("");
  const [preferredCuisine, setPreferredCuisine] = useState<string>("");
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null);
  const [storedRecipe, setStoredRecipe] = useState<MonicaOptimizedRecipe | null>(null);
  const [isLikingRecipe, setIsLikingRecipe] = useState(false);
  const [likedRecipe, setLikedRecipe] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const { showSuccess, showError } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareNameOptIn, setShareNameOptIn] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);

  const handleMintNft = async () => {
    if (!object) return;
    setIsMinting(true);
    try {
      const result = await submitRecipeMint(object);
      const message = mintResultMessage(result);
      if (result.ok) {
        showSuccess(message);
        setHasMinted(true);
      } else {
        showError(message);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const handleShareToFeed = async () => {
    if (!object || !savedRecipeId) return;
    setIsSharing(true);
    try {
      const res = await fetch("/api/feed/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareType: "recipe",
          shareName: shareNameOptIn,
          payload: {
            recipeName: object.title,
            recipeId: savedRecipeId,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        let questMessage = "";
        if (data.completedQuests && data.completedQuests.length > 0) {
          const rewardQuest = data.completedQuests[0];
          questMessage = ` 🏆 Quest completed! Earned ${rewardQuest.tokenRewardAmount} ${rewardQuest.tokenRewardType}!`;
        }
        showSuccess(`Successfully shared to community feed!${questMessage}`);
        setHasShared(true);
        setShowShareModal(false);
      } else {
        showError(data.message || "Failed to share to feed");
      }
    } catch (err) {
      showError("Error sharing recipe to feed");
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  const cuisineOptions = useMemo(() => {
    const names = getAllCuisineNames();
    return names.length > 0
      ? names
      : [
          "American",
          "Chinese",
          "French",
          "Greek",
          "Indian",
          "Italian",
          "Japanese",
          "Korean",
          "Mediterranean",
          "Mexican",
          "Middle Eastern",
          "Thai",
          "Vietnamese",
        ];
  }, []);

  // Auto-sync preferred cuisine from the Recipe Builder if the user has
  // exactly one selected — the single most common case we want to support.
  useEffect(() => {
    if (builder.selectedCuisines.length === 1 && !preferredCuisine) {
      setPreferredCuisine(builder.selectedCuisines[0]);
    }
  }, [builder.selectedCuisines, preferredCuisine]);

  const handleUseBuilderSelections = () => {
    if (builder.selectedIngredients.length > 0) {
      setIngredientsMain(
        builder.selectedIngredients.map((i) => i.name).join(", "),
      );
    }
    if (builder.allergies.length > 0) {
      setDisallowedIngredients(builder.allergies.join(", "));
    }
    if (builder.selectedCuisines.length > 0) {
      setPreferredCuisine(builder.selectedCuisines[0]);
    }
    setShowAdvanced(true);
  };

  // Parse birthData from UserContext if available
  const bd = currentUser?.birthData;
  const birthData = bd?.dateTime ? (() => {
      const dt = new Date(bd.dateTime);
      return {
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
        day: dt.getDate(),
        hour: dt.getHours(),
        minute: dt.getMinutes(),
        latitude: bd.latitude ?? 40.7128,
        longitude: bd.longitude ?? -74.0060,
      };
  })() : undefined;

  const preferences = currentUser?.preferences;
  const dietArray = (preferences?.dietaryRestrictions ?? []) as string[];
  const diet = dietArray.length ? dietArray.join(", ") : "no-restrictions";

  const preferredCuisineRef = useRef<string>("");
  preferredCuisineRef.current = preferredCuisine;

  const [object, setObject] = useState<Partial<CosmicRecipe> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<unknown>(null);

  const submit = async (payload: any) => {
    setIsLoading(true);
    setObject(undefined);
    setErrorMessage(null);
    setLastPayload(payload);
    try {
      const res = await fetch('/api/generate-cosmic-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = "We couldn't conjure a recipe this time. Please try again.";
        if (res.status === 401) message = "Please sign in to generate cosmic recipes.";
        else if (res.status === 402) message = "Upgrade to premium to keep generating recipes.";
        else if (res.status === 429) message = "You're generating recipes faster than the cosmos can keep up. Please wait a moment.";
        else if (res.status >= 500) message = "The recipe service is temporarily unavailable. Please try again shortly.";
        try {
          const data = await res.json();
          if (typeof data?.message === "string") message = data.message;
          else if (typeof data?.error === "string") message = data.error;
        } catch {
          /* keep default message */
        }
        setErrorMessage(message);
        return;
      }
      const data = await res.json();
      setObject(data);
      if (data?.title) {
        try {
          const stored = mapCosmicToStoreRecipe(
            data as CosmicRecipe,
            preferredCuisineRef.current || undefined,
          );
          saveRecipeToStore(stored);
          setStoredRecipe(stored);
          setSavedRecipeId(stored.id);
        } catch (err) {
          console.error("Failed to persist cosmic recipe", err);
        }
        await generateImage(data.title, data.short_description || "");
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Network error while generating your recipe. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastGeneration = () => {
    if (lastPayload) void submit(lastPayload);
  };

  const handleGenerate = () => {
    setImageUrl(null);
    setSavedRecipeId(null);
    setStoredRecipe(null);
    setLikedRecipe(false);
    void submit({
      prompt: prompt || "A nourishing, restorative meal",
      diet,
      ingredients_main: ingredientsMain.split(',').map(i => i.trim()).filter(Boolean),
      disallowed_ingredients: disallowedIngredients.split(',').map(i => i.trim()).filter(Boolean),
      birthData,
      preferredCuisine: preferredCuisine || undefined,
    });
  };

  const handleLikeRecipe = async () => {
    if (!storedRecipe) return;
    saveRecipeToStore(storedRecipe);
    if (!currentUser) {
      setLikedRecipe(true);
      showSuccess("Liked locally. Sign in to sync your cookbook.");
      return;
    }

    setIsLikingRecipe(true);
    try {
      const res = await fetch("/api/users/me/recipes/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: storedRecipe.name,
          cuisine: storedRecipe.cuisine,
          source: "cosmic-generator",
          sourceRecipeId: storedRecipe.id,
          payload: storedRecipe,
          action: "like",
        }),
      });
      if (res.status === 401) {
        setLikedRecipe(true);
        showSuccess("Liked locally. Sign in to sync your cookbook.");
        return;
      }
      if (!res.ok) throw new Error("Failed to like recipe");
      setLikedRecipe(true);
      showSuccess("Recipe liked and saved to your cookbook.");
    } catch (err) {
      console.error(err);
      setLikedRecipe(true);
      showError("Liked locally, but cookbook sync failed.");
    } finally {
      setIsLikingRecipe(false);
    }
  };

  const generateImage = async (title: string, description: string) => {
    try {
      setIsGeneratingImage(true);
      const res = await fetch('/api/nanobanana/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) setImageUrl(data.url);
      }
    } catch (e) {
      console.error("Nanobanana 2 Image Generation failed", e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 font-sans">
      {!currentUser && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✨</div>
            <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
              Sign in to unlock personalized recipes woven from your unique <span className="font-bold underline decoration-purple-300">astrological blueprint</span>.
            </p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new Event('open-signin-modal'))}
            className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm hover:bg-purple-50 dark:hover:bg-slate-700 transition-all"
          >
            Sign In Now
          </button>
        </div>
      )}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent flex items-center justify-center sm:justify-start gap-3">
          <FaMagic className="w-8 h-8 text-purple-600" />
          The Alchemist&apos;s Kitchen
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Describe what you&apos;re craving. We&apos;ll weave your astrological blueprint and the High Science Culinary Arts into the perfect dish.
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should we create? (e.g., A warm, grounding stew for Saturn day...)"
            className="flex-1 px-5 py-3.5 text-lg border border-slate-300 dark:border-slate-600 shadow-sm rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Manifesting...
              </>
            ) : (
              <>
                Generate
                <FaMagic className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors"
          >
            <FaCog className="w-4 h-4" />
            {showAdvanced ? 'Hide Elements & Restrictions' : 'Expand Culinary Settings'}
            {showAdvanced ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
          </button>
          {(builder.selectedIngredients.length > 0 ||
            builder.selectedCuisines.length > 0 ||
            builder.allergies.length > 0) && (
            <button
              type="button"
              onClick={handleUseBuilderSelections}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full px-3 py-1.5 transition-colors"
            >
              Use Recipe Builder selections
            </button>
          )}
          
          {showAdvanced && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Key Ingredients (use comma)
                </label>
                <input 
                  type="text" 
                  value={ingredientsMain}
                  onChange={(e) => setIngredientsMain(e.target.value)}
                  placeholder="e.g., Chicken, Basil, Garlic"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Avoid Ingredients
                </label>
                <input 
                  type="text" 
                  value={disallowedIngredients}
                  onChange={(e) => setDisallowedIngredients(e.target.value)}
                  placeholder="e.g., Peanuts, Coriander"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Preferred Cuisine
                </label>
                <select
                  value={preferredCuisine}
                  onChange={(e) => setPreferredCuisine(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Any (let the stars decide)</option>
                  {cuisineOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 mt-2">
                <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 bg-white dark:bg-slate-900 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-purple-600">Active Profile:</span>
                  <span>{birthData ? `Birth Chart Attached` : `No Chart Provided`}</span>
                  <span className="mx-2">|</span>
                  <span className="capitalize text-slate-600 font-medium">Diet: {diet || 'None'}</span>
                  {preferredCuisine && (
                    <>
                      <span className="mx-2">|</span>
                      <span className="text-slate-600 font-medium">Cuisine: {preferredCuisine}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {errorMessage && !isLoading && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              Couldn&apos;t generate a recipe
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={retryLastGeneration}
            disabled={!lastPayload}
            className="whitespace-nowrap px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results Section */}
      {object && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header Section */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-8 text-center sm:text-left">
            {object.tags?.meal_type && (
               <span className="inline-block px-3 py-1 mb-4 bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wide rounded-full">
                 {object.tags.meal_type}
               </span>
            )}
            <h2 className="text-4xl sm:text-5xl font-black mb-4 text-slate-900 dark:text-white leading-tight">
              {object.title || "Consulting the Stars..."}
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 font-serif italic max-w-3xl">
              {object.short_description}
            </p>
            {savedRecipeId && !isLoading && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/generated-recipe/${savedRecipeId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  View full recipe page
                </Link>
                <button
                  onClick={() => { void handleLikeRecipe(); }}
                  disabled={likedRecipe || isLikingRecipe}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors ${
                    likedRecipe
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-750"
                      : "bg-white hover:bg-slate-50 text-pink-700 border border-pink-200 disabled:opacity-60"
                  }`}
                >
                  {likedRecipe ? "Liked" : isLikingRecipe ? "Liking..." : "Like Recipe"}
                </button>
                <Link
                  href="/recipe-builder"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-purple-700 text-sm font-semibold border border-purple-200 transition-colors"
                >
                  Back to Recipe Builder
                </Link>
                <button
                  onClick={() => {
                    setShareNameOptIn(false);
                    setShowShareModal(true);
                  }}
                  disabled={hasShared}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors ${
                    hasShared
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-750"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  }`}
                >
                  {hasShared ? "✓ Shared to Feed" : "📢 Share to Feed"}
                </button>
                <button
                  onClick={() => { void handleMintNft(); }}
                  disabled={isMinting || hasMinted}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors ${
                    hasMinted
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-750"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white disabled:opacity-60"
                  }`}
                  title="Spend ESMS equal to this recipe's alchemical fingerprint to mint it as an on-chain NFT"
                >
                  {hasMinted ? "✓ Minted" : isMinting ? "Minting…" : "⛓ Mint as NFT"}
                </button>
              </div>
            )}
            
            {/* Image Box */}
            {!isLoading && (
              <div className="mt-8 transition-opacity duration-1000">
                {imageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden shadow-2xl">
	                     <Image
	                       src={imageUrl}
	                       alt={object.title || "Recipe Result"}
	                       fill
	                       unoptimized
	                       sizes="100vw"
	                       className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
	                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : isGeneratingImage ? (
                   <div className="w-full h-96 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                     <FaMagic className="w-10 h-10 text-purple-400 mb-3 animate-bounce" />
                     <p className="text-slate-500 font-semibold uppercase tracking-wider">Nanobanana 2 Visualizing...</p>
                   </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column (Meta & Elements) */}
            <div className="space-y-6">
               {/* Quick Stats */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Time</p>
                       <p className="font-semibold text-lg">{object.total_time?.toString() || '--'} min</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Serves</p>
                       <p className="font-semibold text-lg">{object.yields?.toString() || '--'}</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Difficulty</p>
                       <p className="font-semibold text-lg capitalize">{object.difficulty || '--'}</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Cuisine</p>
                       <p className="font-semibold text-lg capitalize">{object.cuisine || '--'}</p>
                     </div>
                  </div>
               </div>

              {/* Elemental Balance Bar */}
              {object.elementalBalance && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <span className="text-amber-500">✧</span> Elemental Profile
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Fire', val: object.elementalBalance.fire, color: 'bg-red-500', icon: '🔥' },
                      { name: 'Earth', val: object.elementalBalance.earth, color: 'bg-emerald-600', icon: '🌍' },
                      { name: 'Air', val: object.elementalBalance.air, color: 'bg-amber-400', icon: '💨' },
                      { name: 'Water', val: object.elementalBalance.water, color: 'bg-blue-500', icon: '💧' }
                    ].map((el) => (
                      <div key={el.name} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold flex items-center gap-2">{el.icon} {el.name}</span>
                          <span className="text-slate-500 font-medium">{el.val || 0}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${el.color} transition-all duration-1000 ease-out`} 
                            style={{ width: `${Math.min(100, el.val || 0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Astro Details */}
              {object.astro_explanation && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6 rounded-2xl border border-indigo-100 dark:border-purple-900/50">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-indigo-900 dark:text-indigo-200">
                    Cosmic Mapping
                  </h3>
                  <p className="mb-4 text-indigo-800 dark:text-indigo-300 text-sm leading-relaxed font-medium">
                    {object.astro_explanation.summary}
                  </p>
                  <ul className="space-y-2.5">
                    {object.astro_explanation.correspondences?.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-indigo-700 dark:text-indigo-400 text-sm">
                        <span className="text-indigo-400 shrink-0">✦</span> 
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column (Ingredients & Methods) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Ingredients */}
              <div>
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  Ingredients
                  <span className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    {object.ingredients?.length || 0} items
                  </span>
                </h3>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {object.ingredients?.map((ing, i) => (
                    <li key={i} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">{ing?.name}</span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold whitespace-nowrap ml-4">
                          {ing?.quantity} {ing?.unit}
                        </span>
                      </div>
                      {ing?.household_description && (
                        <span className="text-sm text-slate-500 block">{ing.household_description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Methods */}
              <div>
                <h3 className="text-2xl font-black mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                  Alchemical Process
                </h3>
                <div className="space-y-6">
                  {object.steps?.sort((a,b)=>((a?.step_number || 0) - (b?.step_number || 0))).map((step, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-lg border-2 border-white dark:border-slate-900 shadow-sm shadow-purple-200 dark:shadow-none group-hover:scale-110 transition-transform">
                        {step?.step_number}
                      </div>
                      <div className="flex-1 pt-1.5 border-b border-slate-100 dark:border-slate-800/50 pb-6 last:border-0 last:pb-0">
                        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                          {step?.instruction}
                        </p>
                        {step?.tips && step.tips.length > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl text-sm text-amber-900 dark:text-amber-200 border border-amber-100 dark:border-amber-900/30">
                            <div className="font-bold flex items-center gap-2 mb-2 uppercase tracking-wide text-[11px]">
                              <span>💡</span> Chef&apos;s Insight
                            </div>
                            <ul className="space-y-1.5 ml-1">
                               {step.tips.map((t, index) => <li key={index} className="flex gap-2"><span className="opacity-50">•</span> {t}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Share to Feed Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Share Recipe to Feed
              </h2>
            </div>

            <div className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
              <p className="text-sm">
                Share your newly generated recipe, <span className="font-semibold text-purple-600 dark:text-purple-400">{object?.title}</span>, with the alchm.kitchen community!
              </p>

              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900/50">
                <input
                  type="checkbox"
                  checked={shareNameOptIn}
                  onChange={(e) => setShareNameOptIn(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded"
                />
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                  Opt-in to share my name (defaults to Anonymous Alchemist)
                </span>
              </label>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                disabled={isSharing}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => { void handleShareToFeed(); }}
                disabled={isSharing}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-all font-semibold"
              >
                {isSharing ? "Sharing..." : "Share to Feed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
