'use client';

import React, { useState, useEffect } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { 
  getCuisineRecommendations, 
  calculateElementalMatch, 
  calculateElementalProfileFromZodiac,
  calculateElementalContributionsFromPlanets
, 
  generateTopSauceRecommendations 
} from '@/utils/cuisineRecommender';
import { cuisines } from '@/data/cuisines';
import { getRecipesForCuisineMatch , cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { getAllRecipes } from '@/data/recipes';
import { Recipe, ElementalProperties, ZodiacSign, LunarPhaseWithSpaces } from '@/types/alchemy';
import { Loader2, ChevronDown, ChevronUp, Info, Flame, Droplets, Wind, Mountain } from 'lucide-react';
import { transformCuisines, sortByAlchemicalCompatibility } from '@/utils/alchemicalTransformationUtils';
import CuisineRecommender from '@/components/CuisineRecommender';

type DebugStep = {
  name: string;
  description: string;
  data: any;
  completed: boolean;
  error?: string;
};

interface StepProps {
  step: DebugStep;
  expanded: boolean;
  onToggle: () => void;
}

const StepCard: React.FC<StepProps> = ({ step, expanded, onToggle }) => {
  return (
    <div className="mb-4 border rounded-md overflow-hidden">
      <div 
        className={`p-3 flex justify-between items-center cursor-pointer ${
          step.completed 
            ? step.error 
              ? 'bg-red-100 dark:bg-red-900' 
              : 'bg-green-100 dark:bg-green-900' 
            : 'bg-yellow-100 dark:bg-yellow-900'
        }`}
        onClick={onToggle}
      >
        <div>
          <h3 className="font-semibold">{step.name}</h3>
          <p className="text-sm opacity-75">{step.description}</p>
        </div>
        <div>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          {step.error ? (
            <div className="p-3 bg-red-100 dark:bg-red-800 rounded text-red-800 dark:text-red-200">
              <p className="font-bold">Error:</p>
              <p>{step.error}</p>
            </div>
          ) : step.data ? (
            <pre className="overflow-auto p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {JSON.stringify(step.data, null, 2)}
            </pre>
          ) : (
            <p className="italic text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </div>
      )}
    </div>
  );
};

const ElementalProfileDisplay: React.FC<{ profile: ElementalProperties, title?: string }> = ({ profile, title }) => {
  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded mb-4">
      {title && <h4 className="font-bold mb-2">{title}</h4>}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <Flame className="w-4 h-4 mr-2 text-red-500" />
          <span>Fire: {(profile.Fire * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <Droplets className="w-4 h-4 mr-2 text-blue-500" />
          <span>Water: {(profile.Water * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <Mountain className="w-4 h-4 mr-2 text-green-500" />
          <span>Earth: {(profile.Earth * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <Wind className="w-4 h-4 mr-2 text-purple-500" />
          <span>Air: {(profile.Air * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const MatchScoreBar: React.FC<{ score: number, label?: string }> = ({ score, label }) => {
  let colorClass = "bg-gray-400";
  if (score >= 0.9) colorClass = "bg-green-500";
  else if (score >= 0.7) colorClass = "bg-green-400";
  else if (score >= 0.5) colorClass = "bg-yellow-400";
  else if (score >= 0.3) colorClass = "bg-orange-400";
  else colorClass = "bg-red-400";

  return (
    <div className="mb-2">
      {label && <span className="text-sm">{label}</span>}
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
        <div 
          className={`${colorClass} h-2.5 rounded-full`} 
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <div className="text-xs text-right">{(score * 100).toFixed(1)}%</div>
    </div>
  );
};

export function CuisineRecommenderDebug() {
  return (
    <div className="border border-blue-500 p-4 rounded-lg">
      <h4 className="text-lg font-bold mb-2 text-blue-400">Cuisine Recommender</h4>
      <CuisineRecommender />
    </div>
  );
} 