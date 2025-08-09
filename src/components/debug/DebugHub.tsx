'use client';

import React, { useState } from 'react';

import { CookingMethodRecommenderDebug } from './CookingMethodRecommenderDebug';
import { CuisineRecommenderDebug } from './CuisineRecommenderDebug';
import { IngredientRecommenderDebug } from './IngredientRecommenderDebug';
import { StateInspector } from './StateInspector';

type Tab = 'State' | 'Cuisine' | 'Ingredient' | 'Cooking';

export function DebugHub() {
  const [activeTab, setActiveTab] = useState<Tab>('State');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'State':
        return <StateInspector />;
      case 'Cuisine':
        return <CuisineRecommenderDebug />;
      case 'Ingredient':
        return <IngredientRecommenderDebug />;
      case 'Cooking':
        return <CookingMethodRecommenderDebug />;
      default:
        return <StateInspector />;
    }
  };

  const TabButton = ({ tab, children }: { tab: Tab; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className='mx-auto w-full max-w-7xl'>
      <div className='rounded-lg bg-gray-800 p-4 shadow-2xl'>
        <h2 className='mb-4 text-2xl font-bold text-white'>Application Debug Hub</h2>
        <div className='mb-4 flex space-x-2 border-b border-gray-700 pb-4'>
          <TabButton tab='State'>State Inspector</TabButton>
          <TabButton tab='Cuisine'>Cuisine Recommender</TabButton>
          <TabButton tab='Ingredient'>Ingredient Recommender</TabButton>
          <TabButton tab='Cooking'>Cooking Methods</TabButton>
        </div>
        <div className='mt-4'>{renderTabContent()}</div>
      </div>
    </div>
  );
}
