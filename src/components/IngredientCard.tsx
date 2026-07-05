"use client";

/**
 * IngredientCard Component
 * Modern alchemical ingredient display with glassmorphism and elemental balancing
 */

import { motion } from "framer-motion";
import { ImageIcon, Plus } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { ingredientSummaries } from "@/data/ingredients/ingredientSummaries";
import type { Ingredient, RecipeIngredient } from "@/types";
import { elementalSignature } from "@/utils/elemental/signature";
import { isRecipeIngredient } from "@/utils/ingredientUtils";
import { getAssetUrl } from "@/utils/urlUtils";
import { AddToDiaryModal } from "./food-diary/AddToDiaryModal";

interface IngredientCardProps {
  ingredient: Ingredient | RecipeIngredient;
  showAmount?: boolean;
  onClick?: (ingredient: Ingredient | RecipeIngredient) => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  showAmount = false,
  onClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Route the card's lean through the canonical signature so its label is
  // co-dominant-aware and ties read identically here and everywhere else. The
  // single-hue card art keys off the dominant element.
  const sig = elementalSignature(ingredient.elementalProperties ?? null);
  const dominantElement = sig.dominant;

  const elementColors: Record<string, string> = {
    Fire: "from-orange-500/20 to-red-600/20 border-orange-500/30",
    Water: "from-blue-500/20 to-cyan-600/20 border-blue-500/30",
    Earth: "from-green-500/20 to-emerald-800/20 border-emerald-500/30",
    Air: "from-slate-200/20 to-slate-400/20 border-slate-300/30",
  };

  const elementTextColors: Record<string, string> = {
    Fire: "text-orange-400",
    Water: "text-blue-400",
    Earth: "text-emerald-400",
    Air: "text-slate-300",
  };

  const colorClass = elementColors[dominantElement] || elementColors.Air;
  const textColorClass =
    elementTextColors[dominantElement] || elementTextColors.Air;

  // `ingredient` is `Ingredient | RecipeIngredient`. Several fields below
  // (image_url/imageUrl/image/description/planetaryRuler/alchemicalProperties)
  // are declared on Ingredient but not explicitly on RecipeIngredient, which
  // only covers them via its catch-all `[key: string]: unknown` index
  // signature. Record<string, unknown> is the accurate read for that side of
  // the union (matching the house pattern in RecommendationAdapter.ts /
  // UnifiedIngredientService.ts) in place of the previous `as any` escape.
  const ingredientFields = ingredient as unknown as Record<string, unknown>;

  const rawImageUrl =
    (ingredientFields.image_url as string | undefined) ||
    (ingredientFields.imageUrl as string | undefined) ||
    // Note: `image` is not a declared field on Ingredient or RecipeIngredient;
    // this fallback only ever compiled via RecipeIngredient's index signature
    // and is preserved as-is (pre-existing behavior, not a fix target here).
    (ingredientFields.image as string | undefined);

  const imageUrl = getAssetUrl(rawImageUrl);

  const description =
    (ingredientFields.description as string | undefined) ||
    ingredientSummaries[ingredient.name.toLowerCase().replace(/ /g, "_")];

  // Hoisted out of the JSX below: TS's contextual ReactNode check for the
  // whole children array wants a concretely-typed value here (JSX cannot
  // render `unknown`), and the pre-existing `alchemicalProperties` gap
  // between Ingredient and RecipeIngredient (see comment at the render site)
  // means it only surfaces once a nearby sibling like `description` stops
  // being `any`-typed. Read as Record<string, unknown> | undefined rather
  // than narrowed to AlchemicalResult, so any shape RecipeIngredient happens
  // to carry under this key still renders exactly as it did before this
  // types-only pass.
  const alchemicalStats = ingredientFields.alchemicalProperties as
    | Record<string, unknown>
    | undefined;

  const planetaryRuler = ingredientFields.planetaryRuler as
    | string
    | undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !(e.target as HTMLElement).closest(".add-diary-btn")) {
      onClick(ingredient);
    }
  };

  return (
    <>
      <motion.div
        layout
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={`group relative flex min-h-[420px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-gradient-to-br shadow-xl transition-colors duration-300 hover:shadow-2xl ${colorClass} bg-[#08080e]/80 backdrop-blur-md`}
        onClick={handleClick}
      >
        <div className="relative h-32 w-full overflow-hidden bg-black/30">
          {imageUrl && !imgFailed ? (
            <Image
              src={String(imageUrl)}
              alt={`${ingredient.name} ingredient`}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-800 to-amber-950">
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:20px_20px]" />
              <ImageIcon
                className="relative h-8 w-8 text-white/65"
                aria-hidden="true"
              />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#08080e] to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                {ingredient.name}
              </h3>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${textColorClass}`}
              >
                {sig.tier === "single"
                  ? `${sig.dominant} Dominant`
                  : sig.shortLabel}
              </span>
            </div>
            <button
              className="add-diary-btn flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30 transition-all active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> LOG
            </button>
          </div>

          {/* Description */}
          {description && (
            <p className="mb-4 line-clamp-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-gray-300">
              {String(description)
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/\*(.*?)\*/g, "$1")}
            </p>
          )}

          {/* Amount for Recipe Ingredients */}
          {showAmount && isRecipeIngredient(ingredient) && (
            <div className="bg-white/5 rounded-lg px-3 py-2 mb-4 border border-white/10">
              <span className="text-amber-400 font-bold">
                {ingredient.amount}
              </span>{" "}
              <span className="text-gray-300 text-sm">{ingredient.unit}</span>
              {ingredient.preparation && (
                <span className="text-gray-400 text-xs italic ml-2">
                  ({ingredient.preparation})
                </span>
              )}
            </div>
          )}

          {/* Alchemical Stats (ESMS) */}
          {/*
           * Note: `alchemicalProperties` is declared on Ingredient (as
           * AlchemicalResult) but NOT explicitly on RecipeIngredient, which
           * only covers it via its catch-all index signature. On the
           * RecipeIngredient side of the union this reads as `unknown`,
           * matching the pre-existing (any-derived) runtime behavior exactly:
           * preserved via Record<string, unknown> rather than narrowed to
           * AlchemicalResult, so any shape RecipeIngredient happens to carry
           * under this key still renders exactly as it did before this
           * types-only pass.
           */}
          {alchemicalStats && (
            <div className="grid grid-cols-4 gap-2 mb-4 bg-black/30 rounded-xl p-3 border border-white/5">
              {Object.entries(alchemicalStats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-[10px] uppercase tracking-tighter text-gray-500">
                    {key}
                  </div>
                  <div className="text-sm font-bold text-amber-100">
                    {value as React.ReactNode}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Elemental Bars */}
          {ingredient.elementalProperties && (
            <div className="space-y-1.5 mb-4">
              {Object.entries(ingredient.elementalProperties).map(
                ([el, val]) => (
                  <div key={el} className="flex items-center gap-3">
                    <span className="text-[10px] w-8 text-gray-400 uppercase">
                      {el}
                    </span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          el === "Fire"
                            ? "bg-orange-500"
                            : el === "Water"
                              ? "bg-blue-500"
                              : el === "Earth"
                                ? "bg-emerald-600"
                                : "bg-slate-300"
                        }`}
                        style={{ width: `${val * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] w-8 text-right text-gray-300">
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Details Footer */}
          <div className="flex flex-wrap gap-2 text-[10px] mt-auto">
            {ingredient.category && (
              <span className="bg-white/10 px-2 py-1 rounded border border-white/5 text-gray-300">
                {ingredient.category}
              </span>
            )}
            {planetaryRuler && (
              <span className="bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 text-purple-300 flex items-center gap-1">
                <span>☽</span> {planetaryRuler}
              </span>
            )}
            {isRecipeIngredient(ingredient) && ingredient.optional && (
              <span className="bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 text-blue-300">
                OPTIONAL
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <AddToDiaryModal
          item={ingredient}
          itemType="ingredient"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default IngredientCard;
