"use client";

import React, { useState } from "react";

interface PreferencesEditorProps {
  preferences: {
    cuisines: string[];
    ingredients: {
      favorites: string[];
      dislikes: string[];
    };
    complexity: "simple" | "moderate" | "complex";
  };
  onUpdate?: (preferences: PreferencesEditorProps["preferences"]) => void;
}

const COMMON_CUISINES = [
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Indian",
  "Thai",
  "French",
  "Greek",
  "Mediterranean",
  "American",
  "Korean",
  "Vietnamese",
  "Middle-Eastern",
  "Spanish",
];

const COMMON_DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Halal",
  "Kosher",
];

export const PreferencesEditor: React.FC<PreferencesEditorProps> = ({
  preferences,
  onUpdate,
}) => {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    preferences.cuisines || [],
  );
  const [complexity, setComplexity] = useState<"simple" | "moderate" | "complex">(
    preferences.complexity || "moderate",
  );
  const [favoriteIngredient, setFavoriteIngredient] = useState("");
  const [dislikedIngredient, setDislikedIngredient] = useState("");

  const toggleCuisine = (cuisine: string) => {
    const updated = selectedCuisines.includes(cuisine)
      ? selectedCuisines.filter((c) => c !== cuisine)
      : [...selectedCuisines, cuisine];
    setSelectedCuisines(updated);
    onUpdate?.({
      ...preferences,
      cuisines: updated,
    });
  };

  const handleComplexityChange = (newComplexity: "simple" | "moderate" | "complex") => {
    setComplexity(newComplexity);
    onUpdate?.({
      ...preferences,
      complexity: newComplexity,
    });
  };

  const addFavoriteIngredient = () => {
    if (favoriteIngredient.trim() && !preferences.ingredients.favorites.includes(favoriteIngredient.trim())) {
      const updated = {
        ...preferences,
        ingredients: {
          ...preferences.ingredients,
          favorites: [...preferences.ingredients.favorites, favoriteIngredient.trim()],
        },
      };
      onUpdate?.(updated);
      setFavoriteIngredient("");
    }
  };

  const addDislikedIngredient = () => {
    if (dislikedIngredient.trim() && !preferences.ingredients.dislikes.includes(dislikedIngredient.trim())) {
      const updated = {
        ...preferences,
        ingredients: {
          ...preferences.ingredients,
          dislikes: [...preferences.ingredients.dislikes, dislikedIngredient.trim()],
        },
      };
      onUpdate?.(updated);
      setDislikedIngredient("");
    }
  };

  const removeFavorite = (ingredient: string) => {
    const updated = {
      ...preferences,
      ingredients: {
        ...preferences.ingredients,
        favorites: preferences.ingredients.favorites.filter((i) => i !== ingredient),
      },
    };
    onUpdate?.(updated);
  };

  const removeDisliked = (ingredient: string) => {
    const updated = {
      ...preferences,
      ingredients: {
        ...preferences.ingredients,
        dislikes: preferences.ingredients.dislikes.filter((i) => i !== ingredient),
      },
    };
    onUpdate?.(updated);
  };

  return (
    <div className="alchm-card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold alchm-gradient-text mb-2">
          Cuisine Preferences
        </h2>
        <p className="text-gray-600 mb-4">Select your favorite cuisines</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => toggleCuisine(cuisine)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCuisines.includes(cuisine)
                  ? "bg-gradient-to-r from-purple-600 to-orange-600 text-white alchm-glow"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Recipe Complexity
        </h3>
        <p className="text-gray-600 mb-4">Choose your preferred recipe complexity level</p>
        <div className="flex gap-3">
          {(["simple", "moderate", "complex"] as const).map((level) => (
            <button
              key={level}
              onClick={() => handleComplexityChange(level)}
              className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                complexity === level
                  ? "bg-gradient-to-r from-purple-600 to-orange-600 text-white alchm-glow"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Favorite Ingredients
        </h3>
        <p className="text-gray-600 mb-4">Add ingredients you love</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={favoriteIngredient}
            onChange={(e) => setFavoriteIngredient(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addFavoriteIngredient()}
            placeholder="Enter ingredient name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={addFavoriteIngredient}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {preferences.ingredients.favorites.map((ingredient) => (
            <div
              key={ingredient}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-full text-sm"
            >
              <span>✓ {ingredient}</span>
              <button
                onClick={() => removeFavorite(ingredient)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          ))}
          {preferences.ingredients.favorites.length === 0 && (
            <p className="text-gray-500 text-sm italic">No favorites added yet</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Disliked Ingredients
        </h3>
        <p className="text-gray-600 mb-4">Add ingredients you want to avoid</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={dislikedIngredient}
            onChange={(e) => setDislikedIngredient(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addDislikedIngredient()}
            placeholder="Enter ingredient name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={addDislikedIngredient}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-200"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {preferences.ingredients.dislikes.map((ingredient) => (
            <div
              key={ingredient}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-full text-sm"
            >
              <span>✗ {ingredient}</span>
              <button
                onClick={() => removeDisliked(ingredient)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
          {preferences.ingredients.dislikes.length === 0 && (
            <p className="text-gray-500 text-sm italic">No dislikes added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
