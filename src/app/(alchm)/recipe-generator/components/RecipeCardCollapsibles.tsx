import React from "react";
import type { RecipePayloadItem } from "./types";

interface RecipeCardCollapsiblesProps {
  recipe: RecipePayloadItem;
  expandedSection: string | null;
  toggleSection: (section: string) => void;
}

const IngredientsSection: React.FC<{ ingredients: NonNullable<RecipePayloadItem["ingredients"]> }> = ({ ingredients }) => (
  <div className="px-5 pb-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {ingredients.map((ing, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            ing.optional ? "bg-gray-50 text-gray-500" : "bg-green-50/50 text-gray-700"
          }`}
        >
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="font-medium">{ing.amount} {ing.unit}</span>
          <span>{ing.name}</span>
          {Boolean(ing.optional) && <span className="text-[10px] text-gray-400 italic ml-auto">(optional)</span>}
          {Boolean(ing.preparation) && <span className="text-[10px] text-gray-400 ml-auto">{ing.preparation}</span>}
        </div>
      ))}
    </div>
    {ingredients.some((ing) => (ing.substitutes?.length ?? 0) > 0) && (
      <div className="mt-3 p-2.5 bg-amber-50 rounded-lg">
        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
          Substitutions
        </div>
        {ingredients
          .filter((ing) => (ing.substitutes?.length ?? 0) > 0)
          .slice(0, 4)
          .map((ing, idx) => (
            <p key={idx} className="text-xs text-amber-700">
              {ing.name} &rarr; {(ing.substitutes ?? []).join(", ")}
            </p>
          ))}
      </div>
    )}
  </div>
);

const InstructionsSection: React.FC<{ instructions: string[] }> = ({ instructions }) => (
  <div className="px-5 pb-4">
    <ol className="space-y-3">
      {instructions.map((step, idx) => (
        <li key={idx} className="flex gap-3">
          <span className="shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center mt-0.5">
            {idx + 1}
          </span>
          <span className="text-sm text-gray-700 leading-relaxed pt-1">{step}</span>
        </li>
      ))}
    </ol>
  </div>
);

const DietaryBadges: React.FC<{ recipe: RecipePayloadItem }> = ({ recipe }) => {
  const hasDietary = Boolean(recipe.isVegetarian ?? recipe.isVegan ?? recipe.isGlutenFree ?? recipe.isDairyFree);
  if (!hasDietary) return null;

  return (
    <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-1.5">
      {Boolean(recipe.isVegan) && <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Vegan</span>}
      {Boolean(recipe.isVegetarian && !recipe.isVegan) && <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Vegetarian</span>}
      {Boolean(recipe.isGlutenFree) && <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Gluten-Free</span>}
      {Boolean(recipe.isDairyFree) && <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Dairy-Free</span>}
    </div>
  );
};

export const RecipeCardCollapsibles: React.FC<RecipeCardCollapsiblesProps> = ({
  recipe,
  expandedSection,
  toggleSection,
}) => (
  <div className="border-t border-gray-100">
    {recipe.ingredients && recipe.ingredients.length > 0 && (
      <div>
        <button
          type="button"
          onClick={() => toggleSection("ingredients")}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-bold text-gray-700">Ingredients ({recipe.ingredients.length})</span>
          <span className="text-gray-400 text-xs">{expandedSection === "ingredients" ? "\u25B2" : "\u25BC"}</span>
        </button>
        {expandedSection === "ingredients" && <IngredientsSection ingredients={recipe.ingredients} />}
      </div>
    )}

    {recipe.instructions && recipe.instructions.length > 0 && (
      <div className="border-t border-gray-100">
        <button
          type="button"
          onClick={() => toggleSection("instructions")}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-bold text-gray-700">Cooking Steps ({recipe.instructions.length})</span>
          <span className="text-gray-400 text-xs">{expandedSection === "instructions" ? "\u25B2" : "\u25BC"}</span>
        </button>
        {expandedSection === "instructions" && <InstructionsSection instructions={recipe.instructions} />}
      </div>
    )}

    <DietaryBadges recipe={recipe} />
  </div>
);
