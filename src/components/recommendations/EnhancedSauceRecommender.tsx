"use client";

import React, { useState, useMemo } from "react";
import { allSauces } from "@/data/sauces";
import type { Sauce } from "@/utils/cuisine/intelligentSauceRecommender";
import { recommendSauces } from "@/utils/cuisine/intelligentSauceRecommender";

export default function EnhancedSauceRecommender() {
  const [selectedRole, setSelectedRole] = useState<"complement" | "contrast" | "enhance" | "balance">("complement");
  
  // Dummy target properties for demonstration since we aren't hooked into a global state
  const targetElementalProperties = { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 };
  const targetAlchemicalProperties = { Spirit: 3.0, Essence: 4.5, Matter: 5.0, Substance: 4.5 };
  const targetThermodynamicProperties = { heat: 0.05, entropy: 0.2, reactivity: 1.5, gregsEnergy: -0.6 };

  // Convert the imported sauces into the format expected by the recommender
  const availableSauces = useMemo(() => {
    return Object.entries(allSauces).map(([id, s]) => ({
      id,
      name: s.name,
      description: s.description,
      keyIngredients: s.keyIngredients,
      elementalProperties: s.elementalProperties,
      alchemicalProperties: s.alchemicalProperties,
      thermodynamicProperties: s.thermodynamicProperties,
      flavorTags: s.astrologicalInfluences,
      cuisineAssociations: s.cuisine ? [s.cuisine] : undefined
    })) as Sauce[];
  }, []);

  const recommendations = useMemo(() => {
    return recommendSauces(
      {
        targetElementalProperties,
        targetAlchemicalProperties,
        targetThermodynamicProperties,
        sauceRole: selectedRole,
        maxRecommendations: 6,
        minCompatibilityThreshold: 0.1,
      },
      availableSauces
    );
  }, [availableSauces, selectedRole]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <h2 className="text-2xl font-bold text-slate-800">Intelligent Sauce Recommender</h2>
        <p className="text-slate-600 mt-1 text-sm">
          Alchemically balanced sauce pairings utilizing P=IV circuit optimization.
        </p>
      </div>

      <div className="p-6">
        {/* Role Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["complement", "contrast", "enhance", "balance"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedRole === role
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.sauce.id}
              className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-100 to-transparent -z-10" />
              
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-slate-800 leading-tight">
                  {rec.sauce.name}
                </h3>
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">
                  {(rec.compatibilityScore * 100).toFixed(0)}% Match
                </div>
              </div>
              
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {rec.sauce.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {rec.sauce.keyIngredients?.slice(0, 3).map((ing, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">
                      {ing}
                    </span>
                  ))}
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
                  <div className="font-medium text-slate-700 mb-1">Alchemical Reasoning</div>
                  <p className="text-slate-600 italic">"{rec.reason}"</p>
                  
                  {rec.enhancement.thermalEffect && (
                    <div className="mt-2 flex items-center text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
                      Thermal Effect: <span className="font-medium ml-1 text-slate-700 capitalize">{rec.enhancement.thermalEffect}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No sauces found matching the current criteria.
          </div>
        )}
      </div>
    </div>
  );
}
