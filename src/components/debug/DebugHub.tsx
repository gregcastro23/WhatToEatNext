'use client';

import React, { useState } from 'react';
import { StateInspector } from './StateInspector';
import { CuisineRecommenderDebug } from './CuisineRecommenderDebug';
import { IngredientRecommenderDebug } from './IngredientRecommenderDebug';
import { CookingMethodRecommenderDebug } from './CookingMethodRecommenderDebug';

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
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-white">Application Debug Hub</h2>
        <div className="flex space-x-2 mb-4 border-b border-gray-700 pb-4">
          <TabButton tab="State">State Inspector</TabButton>
          <TabButton tab="Cuisine">Cuisine Recommender</TabButton>
          <TabButton tab="Ingredient">Ingredient Recommender</TabButton>
          <TabButton tab="Cooking">Cooking Methods</TabButton>
        </div>
        <div className="mt-4">{renderTabContent()}</div>
      </div>
    </div>
  );
} 