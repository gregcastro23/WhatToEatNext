"use client";

/**
 * RecipeCard Component
 * Modern alchemical recipe display with glassmorphism and elemental metadata
 */

import Image from "next/image";
import React, { useState } from "react";
import type { Recipe } from "@/types/recipe";
import { getAssetUrl } from "@/utils/urlUtils";
import { AddToDiaryModal } from "./food-diary/AddToDiaryModal";

interface ExtendedRecipeCardData extends Partial<Recipe> {
  cookingTime?: string | number;
  Spirit?: number;
  Essence?: number;
  Matter?: number;
  Substance?: number;
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
  rating?: number | string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const extRecipe = recipe as unknown as ExtendedRecipeCardData;

  // Extract elemental properties for display
  const elements = recipe.elementalProperties;

  const handleSelect = (target: EventTarget | null): void => {
    if (onClick && !(target instanceof HTMLElement && target.closest(".add-diary-btn"))) {
      onClick();
    }
  };

  const displayImage = getAssetUrl(recipe.image);
  const cookingTimeDisplay = extRecipe.cookingTime ?? recipe.cookTime;

  const spiritVal = extRecipe.spirit ?? extRecipe.Spirit;
  const essenceVal = extRecipe.essence ?? extRecipe.Essence;
  const matterVal = extRecipe.matter ?? extRecipe.Matter;
  const substanceVal = extRecipe.substance ?? extRecipe.Substance;
  const hasAlchemicalStats =
    spiritVal !== undefined ||
    essenceVal !== undefined ||
    matterVal !== undefined ||
    substanceVal !== undefined;

  return (
    <>
      <div
        className="group relative max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#08080e]/80 backdrop-blur-lg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
        onClick={(event) => handleSelect(event.target)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect(event.target);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* Recipe Image */}
        <div className="relative h-48 w-full overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={recipe.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-900/40 to-black flex items-center justify-center">
              <span className="text-4xl text-indigo-500/30">✦</span>
            </div>
          )}
          {/* Badge Overlay */}
          <div className="absolute top-3 left-3 flex gap-2">
            {recipe.cuisine && (
              <span className="bg-black/60 backdrop-blur-md text-teal-400 text-[10px] font-bold px-2 py-1 rounded-full border border-teal-500/30 uppercase tracking-wider">
                {recipe.cuisine}
              </span>
            )}
            {cookingTimeDisplay !== undefined && (
              <span className="bg-black/60 backdrop-blur-md text-purple-400 text-[10px] font-bold px-2 py-1 rounded-full border border-purple-500/30 uppercase tracking-wider">
                {cookingTimeDisplay} MIN
              </span>
            )}
          </div>
          {/* Add to Diary Button Overlay */}
          <button
            className="add-diary-btn absolute top-3 right-3 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg transition-all active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            + LOG
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
            {recipe.name}
          </h3>

          {recipe.description && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-2 italic">
              {recipe.description}
            </p>
          )}

          {/* Alchemical Metrics (ESMS) */}
          {hasAlchemicalStats && (
            <div className="grid grid-cols-4 gap-2 mb-4 bg-white/5 rounded-xl p-3 border border-white/5">
              {[
                { label: "SPI", val: spiritVal },
                { label: "ESS", val: essenceVal },
                { label: "MAT", val: matterVal },
                { label: "SUB", val: substanceVal },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold">
                    {stat.label}
                  </div>
                  <div className="text-xs font-bold text-amber-100">{stat.val ?? 0}</div>
                </div>
              ))}
            </div>
          )}

          {/* Elemental Balance Mini-View */}
          <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden mb-4 bg-white/5">
            <div className="bg-orange-500" style={{ width: `${(elements.Fire || 0) * 100}%` }} title="Fire" />
            <div className="bg-blue-500" style={{ width: `${(elements.Water || 0) * 100}%` }} title="Water" />
            <div className="bg-emerald-600" style={{ width: `${(elements.Earth || 0) * 100}%` }} title="Earth" />
            <div className="bg-slate-300" style={{ width: `${(elements.Air || 0) * 100}%` }} title="Air" />
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between">
            {Boolean(extRecipe.rating) && (
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-white text-xs font-bold">{Number(extRecipe.rating).toFixed(1)}</span>
              </div>
            )}
            <div className="flex gap-2">
              {recipe.isVegetarian && (
                <span className="text-[10px] text-emerald-500 font-bold border border-emerald-500/20 px-1.5 rounded">VEG</span>
              )}
              {recipe.isGlutenFree && (
                <span className="text-[10px] text-amber-600 font-bold border border-amber-500/20 px-1.5 rounded">GF</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddToDiaryModal
          item={recipe}
          itemType="recipe"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default RecipeCard;
