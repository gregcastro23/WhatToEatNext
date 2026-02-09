"use client";

import React, { useEffect, useState } from "react";
import { fetchAstrologicalRecipes } from "../services/astrologizeApi";

export default function CosmicRecipeWidget() {
  const [recipes, setRecipes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sampleBirthData = {
    year: 1992,
    month: 8,
    day: 12,
    hour: 7,
    minute: 15,
    latitude: 34.0522,
    longitude: -118.2437,
  };

  useEffect(() => {
    fetchAstrologicalRecipes(sampleBirthData)
      .then(setRecipes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-4 text-amber-200 animate-pulse">
        Aligning celestial bodies...
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-red-400 border border-red-800 rounded">
        Cosmic Error: {error}
      </div>
    );

  return (
    <div className="p-6 rounded-lg shadow-2xl bg-indigo-950 border border-amber-400 text-amber-50 font-serif my-8">
      <h2 className="text-3xl mb-6 text-center text-amber-300 border-b border-amber-500/30 pb-4">
        ✨ Cosmic Menu ✨
      </h2>
      <div className="grid gap-6">
        {recipes &&
          Object.entries(recipes).map(([sign, recipe]: [string, any]) => (
            <div
              key={sign}
              className="bg-indigo-900/60 p-4 rounded border border-indigo-700/50"
            >
              <div className="uppercase text-xs tracking-[0.2em] text-amber-400 mb-1 opacity-80">
                {sign}
              </div>
              <h3 className="text-xl font-bold text-amber-100">
                {recipe.name || "Mysterious Dish"}
              </h3>
              <p className="text-sm text-indigo-200 mt-2 italic">
                {recipe.description || "A dish aligned with your stars."}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
