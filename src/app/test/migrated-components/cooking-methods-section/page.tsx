'use client';

import React, { useState } from 'react';
import { CookingMethodsSection } from '@/components/CookingMethodsSection';
import { CookingMethodsSectionMigrated } from '@/components/CookingMethodsSection.migrated';
import { useServices } from '@/hooks/useServices';
import { _logger } from '@/utils/logger';

// Sample cooking methods for testing
const sampleMethods = [
  {
    id: 'grilling',
    name: 'Grilling',
    description: 'Cooking food over direct heat, usually on a grill with Fire or charcoal beneath.',
    score: 0.85,
    culturalOrigin: 'Global',
    elementalEffect: { Fire: 0.85, Water: 0.15, Earth: 0.4, Air: 0.6
    },
    duration: {
      min: 10,
      max: 30
    },
    suitable_for: ['Meats', 'Vegetables', 'Seafood'],
    alchemicalProperties: {
      Spirit: 0.7,
      Essence: 0.3,
      Matter: 0.2,
      Substance: 0.5
    },
    variations: [
      {
        id: 'charcoal-grilling',
        name: 'Charcoal Grilling',
        description: 'Grilling with charcoal for a smoky flavor.',
        elementalEffect: { Fire: 0.9, Water: 0.1, Earth: 0.5, Air: 0.5
        }
      },
      {
        id: 'gas-grilling',
        name: 'Gas Grilling',
        description: 'Grilling with gas for convenient temperature control.',
        elementalEffect: { Fire: 0.75, Water: 0.15, Earth: 0.3, Air: 0.7
        }
      }
    ]
  },
  {
    id: 'boiling',
    name: 'Boiling',
    description: 'Cooking food in Water heated to its boiling point.',
    score: 0.7,
    culturalOrigin: 'Global',
    elementalEffect: { Fire: 0.4, Water: 0.9, Earth: 0.2, Air: 0.3
    },
    duration: {
      min: 5,
      max: 45
    },
    suitable_for: ['Pasta', 'Vegetables', 'Eggs'],
    alchemicalProperties: {
      Spirit: 0.2,
      Essence: 0.8,
      Matter: 0.5,
      Substance: 0.2
    }
  },
  {
    id: 'baking',
    name: 'Baking',
    description: 'Cooking food using dry heat in an oven.',
    score: 0.75,
    culturalOrigin: 'Global',
    elementalEffect: { Fire: 0.7, Water: 0.3, Earth: 0.7, Air: 0.6
    },
    duration: {
      min: 20,
      max: 120
    },
    suitable_for: ['Breads', 'Pastries', 'Casseroles'],
    alchemicalProperties: {
      Spirit: 0.4,
      Essence: 0.3,
      Matter: 0.6,
      Substance: 0.7
    },
    variations: [
      {
        id: 'roasting',
        name: 'Roasting',
        description: 'Baking with higher heat, usually for meats and vegetables.',
        elementalEffect: { Fire: 0.8, Water: 0.2, Earth: 0.6, Air: 0.6
        }
      }
    ]
  },
  {
    id: 'steaming',
    name: 'Steaming',
    description: 'Cooking food with steam from boiling Water.',
    score: 0.65,
    culturalOrigin: 'Asian',
    elementalEffect: { Fire: 0.3, Water: 0.8, Earth: 0.2, Air: 0.7
    },
    duration: {
      min: 5,
      max: 30
    },
    suitable_for: ['Vegetables', 'Fish', 'Dumplings'],
    alchemicalProperties: {
      Spirit: 0.3,
      Essence: 0.8,
      Matter: 0.2,
      Substance: 0.1
    }
  }
];

export default function CookingMethodsSectionTestPage() {
  // Component state
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [showToggle, setShowToggle] = useState<boolean>(true);
  const [initiallyExpanded, setInitiallyExpanded] = useState<boolean>(false);
  const [methods, setMethods] = useState(sampleMethods);
  
  // Get services
  useServices();
  
  const handleSelectMethod = (method: Record<string, unknown>) => {
    setSelectedMethodId(String(method?.id || ''));
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">CookingMethodsSection Component Migration Test</h1>
      
      {/* Controls */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Component Controls</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={showToggle} 
                onChange={(e) => setShowToggle(e.target.checked)}
                className="rounded"
              />
              <span>Show Toggle</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={initiallyExpanded} 
                onChange={(e) => setInitiallyExpanded(e.target.checked)}
                className="rounded"
              />
              <span>Initially Expanded</span>
            </label>
          </div>
          <div>
            <button 
              onClick={() => setSelectedMethodId(null)}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
            >
              Clear Selection
            </button>
          </div>
        </div>
        
        {selectedMethodId && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Selected Method: <strong>{methods.find(m => m.id === selectedMethodId)?.name || selectedMethodId}</strong>
            </p>
          </div>
        )}
      </div>
      
      {/* Comparison */}
      <div className="grid grid-cols-1 gap-8">
        {/* Original Implementation */}
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">🔄 Original Implementation</h2>
          <div className="bg-white rounded-lg">
            <CookingMethodsSection
              methods={methods}
              onSelectMethod={handleSelectMethod}
              selectedMethodId={selectedMethodId}
              showToggle={showToggle}
              initiallyExpanded={initiallyExpanded}
            />
          </div>
        </div>
        
        {/* Migrated Implementation */}
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">✨ Migrated Implementation</h2>
          <div className="bg-white rounded-lg">
            <CookingMethodsSectionMigrated
              methods={methods}
              onSelectMethod={handleSelectMethod}
              selectedMethodId={selectedMethodId}
              showToggle={showToggle}
              initiallyExpanded={initiallyExpanded}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">💡 Implementation Notes</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Replaced the custom <code>useIngredientMapping</code> hook with service-based API</li>
          <li>Added proper service dependency checks to prevent errors</li>
          <li>Implemented async ingredient compatibility calculation</li>
          <li>Added better loading states and error handling</li>
          <li>Maintained all UI functionality including method variations and elemental effects</li>
          <li>Added enhanced fallback states when services are unavailable</li>
          <li>Improved TypeScript typing for component parameters and state</li>
        </ul>
      </div>
    </div>
  );
} 