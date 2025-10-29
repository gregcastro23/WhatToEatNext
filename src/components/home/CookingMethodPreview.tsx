'use client';

/**
 * Cooking Method Preview Component
 * Shows a preview of cooking method recommendations
 * Displays methods by category with elemental properties
 */

import React, { useState } from 'react';

interface CookingMethod {
  id: string;
  name: string;
  description: string;
  category: string;
  score: number;
  elements: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  duration: string;
}

const mockMethods: CookingMethod[] = [
  {
    id: 'grilling',
    name: 'Grilling',
    description: 'High heat cooking over open flame or hot surface',
    category: 'Dry',
    score: 0.93,
    elements: { Fire: 0.95, Water: 0.1, Earth: 0.3, Air: 0.7 },
    duration: '10-30 min'
  },
  {
    id: 'steaming',
    name: 'Steaming',
    description: 'Gentle cooking with hot vapor',
    category: 'Wet',
    score: 0.89,
    elements: { Fire: 0.4, Water: 0.9, Earth: 0.2, Air: 0.6 },
    duration: '5-20 min'
  },
  {
    id: 'roasting',
    name: 'Roasting',
    description: 'Slow cooking in dry heat environment',
    category: 'Dry',
    score: 0.87,
    elements: { Fire: 0.8, Water: 0.2, Earth: 0.7, Air: 0.4 },
    duration: '30-120 min'
  },
  {
    id: 'braising',
    name: 'Braising',
    description: 'Combination of searing and slow cooking in liquid',
    category: 'Wet',
    score: 0.85,
    elements: { Fire: 0.6, Water: 0.8, Earth: 0.6, Air: 0.3 },
    duration: '60-180 min'
  },
  {
    id: 'fermentation',
    name: 'Fermentation',
    description: 'Transformation through microbial activity',
    category: 'Transformation',
    score: 0.84,
    elements: { Fire: 0.2, Water: 0.6, Earth: 0.8, Air: 0.5 },
    duration: '1-30 days'
  },
  {
    id: 'sous-vide',
    name: 'Sous Vide',
    description: 'Precision temperature water bath cooking',
    category: 'Molecular',
    score: 0.82,
    elements: { Fire: 0.3, Water: 0.9, Earth: 0.4, Air: 0.2 },
    duration: '30-240 min'
  }
];

const categories = [
  { id: 'all', name: 'All Methods', icon: '🌟' },
  { id: 'Dry', name: 'Dry Heat', icon: '🔥' },
  { id: 'Wet', name: 'Wet Heat', icon: '💧' },
  { id: 'Molecular', name: 'Molecular', icon: '🧪' },
  { id: 'Transformation', name: 'Transformation', icon: '⚗️' }
];

export default function CookingMethodPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const filteredMethods = selectedCategory === 'all'
    ? mockMethods
    : mockMethods.filter(method => method.category === selectedCategory);

  const toggleMethod = (methodId: string) => {
    setExpandedMethod(expandedMethod === methodId ? null : methodId);
  };

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMethods.map(method => (
          <div key={method.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleMethod(method.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    ⏱️ {method.duration} • {method.category}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                    {(method.score * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-400">
                    {expandedMethod === method.id ? '−' : '+'}
                  </div>
                </div>
              </div>
            </div>

            {expandedMethod === method.id && (
              <div className="px-4 pb-4 border-t border-gray-200 pt-3">
                <div className="text-xs font-medium text-gray-600 mb-2">Elemental Effects</div>
                <div className="space-y-2">
                  {Object.entries(method.elements).map(([element, value]) => (
                    <div key={element} className="flex items-center gap-2">
                      <span className="text-xs w-12 text-gray-600">{element}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            element === 'Fire' ? 'bg-red-500' :
                            element === 'Water' ? 'bg-blue-500' :
                            element === 'Earth' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{(value * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMethods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No cooking methods in this category.
        </div>
      )}
    </div>
  );
}
