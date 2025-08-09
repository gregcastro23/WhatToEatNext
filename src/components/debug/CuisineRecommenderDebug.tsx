'use client';

import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  Flame,
  Droplets,
  Wind,
  Mountain,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import CuisineRecommender from '@/components/CuisineRecommender';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { getRecipesForCuisineMatch, cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { cuisines } from '@/data/cuisines';
import { getAllRecipes } from '@/data/recipes';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { ElementalProperties, ZodiacSign, LunarPhaseWithSpaces } from '@/types/alchemy';
import { Recipe } from '@/types/unified';
import {
  transformCuisines,
  sortByAlchemicalCompatibility,
} from '@/utils/alchemicalTransformationUtils';
import {
  getCuisineRecommendations,
  calculateElementalMatch,
  calculateElementalProfileFromZodiac,
  calculateElementalContributionsFromPlanets,
  generateTopSauceRecommendations,
} from '@/utils/cuisineRecommender';

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
    <div className='mb-4 overflow-hidden rounded-md border'>
      <div
        className={`flex cursor-pointer items-center justify-between p-3 ${
          step.completed
            ? step.error
              ? 'bg-red-100 dark:bg-red-900'
              : 'bg-green-100 dark:bg-green-900'
            : 'bg-yellow-100 dark:bg-yellow-900'
        }`}
        onClick={onToggle}
      >
        <div>
          <h3 className='font-semibold'>{step.name}</h3>
          <p className='text-sm opacity-75'>{step.description}</p>
        </div>
        <div>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
      </div>

      {expanded && (
        <div className='bg-gray-50 p-4 dark:bg-gray-800'>
          {step.error ? (
            <div className='rounded bg-red-100 p-3 text-red-800 dark:bg-red-800 dark:text-red-200'>
              <p className='font-bold'>Error:</p>
              <p>{step.error}</p>
            </div>
          ) : step.data ? (
            <pre className='overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-700'>
              {JSON.stringify(step.data, null, 2)}
            </pre>
          ) : (
            <p className='italic text-gray-500 dark:text-gray-400'>No data available</p>
          )}
        </div>
      )}
    </div>
  );
};

const ElementalProfileDisplay: React.FC<{ profile: ElementalProperties; title?: string }> = ({
  profile,
  title,
}) => {
  return (
    <div className='mb-4 rounded bg-gray-100 p-3 dark:bg-gray-700'>
      {title && <h4 className='mb-2 font-bold'>{title}</h4>}
      <div className='grid grid-cols-2 gap-2'>
        <div className='flex items-center'>
          <Flame className='mr-2 h-4 w-4 text-red-500' />
          <span>Fire: {(profile.Fire * 100).toFixed(1)}%</span>
        </div>
        <div className='flex items-center'>
          <Droplets className='mr-2 h-4 w-4 text-blue-500' />
          <span>Water: {(profile.Water * 100).toFixed(1)}%</span>
        </div>
        <div className='flex items-center'>
          <Mountain className='mr-2 h-4 w-4 text-green-500' />
          <span>Earth: {(profile.Earth * 100).toFixed(1)}%</span>
        </div>
        <div className='flex items-center'>
          <Wind className='mr-2 h-4 w-4 text-purple-500' />
          <span>Air: {(profile.Air * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const MatchScoreBar: React.FC<{ score: number; label?: string }> = ({ score, label }) => {
  let colorClass = 'bg-gray-400';
  if (score >= 0.9) colorClass = 'bg-green-500';
  else if (score >= 0.7) colorClass = 'bg-green-400';
  else if (score >= 0.5) colorClass = 'bg-yellow-400';
  else if (score >= 0.3) colorClass = 'bg-orange-400';
  else colorClass = 'bg-red-400';

  return (
    <div className='mb-2'>
      {label && <span className='text-sm'>{label}</span>}
      <div className='h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-600'>
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${score * 100}%` }} />
      </div>
      <div className='text-right text-xs'>{(score * 100).toFixed(1)}%</div>
    </div>
  );
};

export function CuisineRecommenderDebug() {
  return (
    <div className='rounded-lg border border-blue-500 p-4'>
      <h4 className='mb-2 text-lg font-bold text-blue-400'>Cuisine Recommender</h4>
      <CuisineRecommender />
    </div>
  );
}
