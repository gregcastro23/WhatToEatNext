"use client";

/**
 * IngredientCard Component
 * Modern alchemical ingredient display with glassmorphism and elemental balancing
 */

import React, { useState } from "react";
import { ingredientSummaries } from "@/data/ingredients/ingredientSummaries";
import type { Ingredient, RecipeIngredient } from "@/types";
import { isRecipeIngredient, getDominantElement } from "@/utils/ingredientUtils";
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

  // Determine the dominant element to style the card
  const dominantElement = getDominantElement(
    ingredient.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    },
  );

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
  const textColorClass = elementTextColors[dominantElement] || elementTextColors.Air;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !(e.target as HTMLElement).closest(".add-diary-btn")) {
      onClick(ingredient);
    }
  };

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${colorClass} backdrop-blur-md bg-[#08080e]/80`}
        onClick={handleClick}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
              {ingredient.name}
            </h3>
            <span className={`text-xs font-semibold uppercase tracking-wider ${textColorClass}`}>
              {dominantElement} Dominant
            </span>
          </div>
          <button
            className="add-diary-btn flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30 transition-all active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <span>+</span> LOG
          </button>
        </div>

        {/* Description */}
        {((ingredient as any).description || ingredientSummaries[ingredient.name.toLowerCase().replace(/ /g, "_")]) && (
          <p className="text-sm text-gray-300 mb-4 line-clamp-2 italic">
            &quot;{(ingredient as any).description || ingredientSummaries[ingredient.name.toLowerCase().replace(/ /g, "_")]}&quot;
          </p>
        )}

        {/* Amount for Recipe Ingredients */}
        {showAmount && isRecipeIngredient(ingredient) && (
          <div className="bg-white/5 rounded-lg px-3 py-2 mb-4 border border-white/10">
            <span className="text-amber-400 font-bold">{ingredient.amount}</span>{" "}
            <span className="text-gray-300 text-sm">{ingredient.unit}</span>
            {ingredient.preparation && (
              <span className="text-gray-400 text-xs italic ml-2">({ingredient.preparation})</span>
            )}
          </div>
        )}

        {/* Alchemical Stats (ESMS) */}
        {ingredient.alchemicalProperties && (
          <div className="grid grid-cols-4 gap-2 mb-4 bg-black/30 rounded-xl p-3 border border-white/5">
            {Object.entries(ingredient.alchemicalProperties).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-[10px] uppercase tracking-tighter text-gray-500">{key}</div>
                <div className="text-sm font-bold text-amber-100">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Elemental Bars */}
        {ingredient.elementalProperties && (
          <div className="space-y-1.5 mb-4">
            {Object.entries(ingredient.elementalProperties).map(([el, val]) => (
              <div key={el} className="flex items-center gap-3">
                <span className="text-[10px] w-8 text-gray-400 uppercase">{el}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      el === "Fire" ? "bg-orange-500" : 
                      el === "Water" ? "bg-blue-500" : 
                      el === "Earth" ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                    style={{ width: `${(val) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] w-8 text-right text-gray-300">{Math.round((val) * 100)}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Details Footer */}
        <div className="flex flex-wrap gap-2 text-[10px] mt-auto">
          {ingredient.category && (
            <span className="bg-white/10 px-2 py-1 rounded border border-white/5 text-gray-300">
              {ingredient.category}
            </span>
          )}
          {(ingredient as any).planetaryRuler && (
            <span className="bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 text-purple-300 flex items-center gap-1">
              <span>☽</span> {(ingredient as any).planetaryRuler}
            </span>
          )}
          {isRecipeIngredient(ingredient) && ingredient.optional && (
            <span className="bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 text-blue-300">
              OPTIONAL
            </span>
          )}
        </div>
      </div>

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
