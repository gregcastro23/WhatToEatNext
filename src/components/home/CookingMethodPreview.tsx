'use client';

/**
 * Cooking Method Preview Component
 * Shows cooking methods from real data organized by category
 * Uses actual cooking method database with elemental properties
 */

import React, { useState, useMemo } from 'react';
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods
} from '@/data/cooking/methods';

interface MethodData {
  name: string;
  description: string;
  elementalEffect: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  time_range?: { min: number; max: number };
  suitable_for?: string[];
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  methods: Record<string, MethodData>;
}

const categories: CategoryConfig[] = [
  {
    id: 'dry',
    name: 'Dry Heat',
    icon: '🔥',
    methods: dryCookingMethods as Record<string, MethodData>
  },
  {
    id: 'wet',
    name: 'Wet Heat',
    icon: '💧',
    methods: wetCookingMethods as Record<string, MethodData>
  },
  {
    id: 'molecular',
    name: 'Molecular',
    icon: '🧪',
    methods: molecularCookingMethods as Record<string, MethodData>
  },
  {
    id: 'traditional',
    name: 'Traditional',
    icon: '🏺',
    methods: traditionalCookingMethods as Record<string, MethodData>
  },
  {
    id: 'transformation',
    name: 'Transformation',
    icon: '⚗️',
    methods: transformationMethods as Record<string, MethodData>
  }
];

// Calculate score based on elemental balance
function calculateScore(method: MethodData): number {
  const avg = (method.elementalEffect.Fire +
    method.elementalEffect.Water +
    method.elementalEffect.Earth +
    method.elementalEffect.Air) / 4;
  return avg;
}

export default function CookingMethodPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('dry');
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const currentMethods = useMemo(() => {
    const category = categories.find(cat => cat.id === selectedCategory);
    if (!category) return [];

    return Object.entries(category.methods)
      .map(([id, method]) => ({
        id,
        ...method,
        score: calculateScore(method)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [selectedCategory]);

  const toggleMethod = (methodId: string) => {
    setExpandedMethod(expandedMethod === methodId ? null : methodId);
  };

  const formatDuration = (time_range?: { min: number; max: number }) => {
    if (!time_range) return 'Variable';
    if (time_range.min >= 1440) {
      return `${Math.floor(time_range.min / 1440)}-${Math.floor(time_range.max / 1440)} days`;
    }
    if (time_range.min >= 60) {
      return `${Math.floor(time_range.min / 60)}-${Math.floor(time_range.max / 60)} hrs`;
    }
    return `${time_range.min}-${time_range.max} min`;
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
        {currentMethods.map(method => (
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
                    ⏱️ {formatDuration(method.time_range)}
                    {method.suitable_for && method.suitable_for.length > 0 && (
                      <span className="ml-2">
                        • {method.suitable_for.slice(0, 2).join(', ')}
                      </span>
                    )}
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
                  {Object.entries(method.elementalEffect).map(([element, value]) => (
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

                {/* Suitable For */}
                {method.suitable_for && method.suitable_for.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Suitable For:</div>
                    <div className="flex flex-wrap gap-1">
                      {method.suitable_for.map((item, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {currentMethods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No cooking methods in this category.
        </div>
      )}
    </div>
  );
}
