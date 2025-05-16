'use client';

import { useState, useEffect, useRef, memo } from 'react';
import @/contexts  from 'AlchemicalContext ';
import @/utils  from 'safeAstrology ';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DebugInfo = memo(function DebugInfo() {
  const renderCountRef = useRef(1); // Initialize with 1 for the first render
  const hasRenderedRef = useRef(false);
  const { planetaryPositions, state, refreshPlanetaryPositions } = useAlchemical();

  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    astrology: true,
    alchemy: false,
    cuisine: false,
    ingredients: false,
    cookingMethods: false,
    tarot: false
  });

  // Only run once to mark component as mounted
  useEffect(() => {
    if (!hasRenderedRef.current) {
      hasRenderedRef.current = true;
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      hasRenderedRef.current = false;
    };
  }, []);

  // Only increment for renders after the initial one
  if (hasRenderedRef.current) {
    renderCountRef.current += 1;
  }

  // Get moon illumination and age directly from utility functions
  const moonIllumination = getMoonIllumination() * 100;
  const lunarAge = calculateLunarPhase();
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format function for elemental values
  const formatPercentage = (value) => {
    if (typeof value !== 'number') return '0.0%';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Helper to render a debug section with toggle
  const DebugSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="mb-4">
      <div 
        className="flex justify-between items-center bg-gray-200 dark:bg-gray-700 p-2 rounded-t cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="font-semibold">{title}</h3>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {isExpanded && (
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-b border border-t-0 border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg my-4 text-gray-800 dark:text-gray-200">
      <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
      <div className="space-y-1 text-sm mb-4">
        <p>Mounted: {hasRenderedRef.current ? 'true' : 'false'}</p>
        <p>Renders: {renderCountRef.current}</p>
        <button 
          onClick={() => refreshPlanetaryPositions()} 
          className="mt-1 px-3 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Refresh Planetary Data
        </button>
      </div>
      
      {/* Astrological Information */}
      <DebugSection 
        title="Astrological Information" 
        isExpanded={expandedSections.astrology}
        onToggle={() => toggleSection('astrology')}
      >
        <div className="space-y-1 text-sm">
          <p>Current Sun Sign: <span className="font-semibold">{planetaryPositions?.sun?.sign || state?.astrologicalState?.sunSign || 'unknown'}</span></p>
          <p>Current Moon Sign: <span className="font-semibold">{planetaryPositions?.moon?.sign || 'unknown'}</span></p>
          <p>Planetary Hour: <span className="font-semibold">{state?.astrologicalState?.planetaryHour || 'Unknown'}</span></p>
          <p>Ascendant: <span className="font-semibold">{planetaryPositions?.ascendant?.sign || 'unknown'}</span></p>
          <p>
            Lunar Phase: <span className="font-semibold">{state?.lunarPhase || 'Unknown'}</span> 
            <span className="ml-1 text-gray-600 dark:text-gray-400">
              {moonIllumination ? `${moonIllumination.toFixed(0)}%, ${lunarAge.toFixed(2)} days old` : ''}
            </span>
          </p>
          <p>Time of Day: <span className="font-semibold">{state?.astrologicalState?.timeOfDay || 'Unknown'}</span></p>
          <p>Dominant Element: <span className="font-semibold">{state?.astrologicalState?.dominantElement || 'Unknown'}</span></p>
          
          <div className="mt-3">
            <p className="font-medium">Active Planets:</p>
            <ul className="ml-4 list-disc">
              {(state?.astrologicalState?.activePlanets || ['None']).map(planet => (
                <li key={planet}>{planet}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-3">
            <p className="font-medium">Planet Positions:</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {planetaryPositions && Object.entries(planetaryPositions).map(([planet, data]) => (
                <div key={planet} className="bg-white dark:bg-gray-750 p-2 rounded text-xs">
                  <span className="font-medium capitalize">{planet}:</span> {data.sign} {data.degree?.toFixed(1)}°
                  {data.isRetrograde && <span className="text-red-500 ml-1">(R)</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DebugSection>
      
      {/* Alchemical Tokens */}
      <DebugSection 
        title="Alchemical Information" 
        isExpanded={expandedSections.alchemy}
        onToggle={() => toggleSection('alchemy')}
      >
        <div className="space-y-2">
          <h3 className="font-medium">Alchemical Tokens:</h3>
        <ul className="space-y-1">
            <li>⦿ Spirit: <span className="font-mono">{state?.alchemicalValues?.Spirit.toFixed(4) || '0.0000'}</span></li>
            <li>⦿ Essence: <span className="font-mono">{state?.alchemicalValues?.Essence.toFixed(4) || '0.0000'}</span></li>
            <li>⦿ Matter: <span className="font-mono">{state?.alchemicalValues?.Matter.toFixed(4) || '0.0000'}</span></li>
            <li>⦿ Substance: <span className="font-mono">{state?.alchemicalValues?.Substance.toFixed(4) || '0.0000'}</span></li>
        </ul>
        
        <h3 className="font-medium mt-3">Elemental Balance:</h3>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-20">Fire:</div>
              <div className="flex-grow bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{width: `${(state?.elementalState?.Fire || 0) * 100}%`}}
                ></div>
              </div>
              <div className="ml-2 w-12 text-right">{formatPercentage(state?.elementalState?.Fire)}</div>
            </div>
            <div className="flex items-center">
              <div className="w-20">Water:</div>
              <div className="flex-grow bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{width: `${(state?.elementalState?.Water || 0) * 100}%`}}
                ></div>
              </div>
              <div className="ml-2 w-12 text-right">{formatPercentage(state?.elementalState?.Water)}</div>
            </div>
            <div className="flex items-center">
              <div className="w-20">Earth:</div>
              <div className="flex-grow bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{width: `${(state?.elementalState?.Earth || 0) * 100}%`}}
                ></div>
              </div>
              <div className="ml-2 w-12 text-right">{formatPercentage(state?.elementalState?.Earth)}</div>
            </div>
            <div className="flex items-center">
              <div className="w-20">Air:</div>
              <div className="flex-grow bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{width: `${(state?.elementalState?.Air || 0) * 100}%`}}
                ></div>
              </div>
              <div className="ml-2 w-12 text-right">{formatPercentage(state?.elementalState?.Air)}</div>
            </div>
          </div>
        </div>
      </DebugSection>
      
      {/* Cuisine Recommender */}
      <DebugSection 
        title="Cuisine Recommender" 
        isExpanded={expandedSections.cuisine}
        onToggle={() => toggleSection('cuisine')}
      >
        <div className="space-y-2 text-sm">
          <p>Current Elemental Influence: <span className="font-semibold">{state?.astrologicalState?.dominantElement || 'Unknown'}</span></p>
          <p>Zodiac Influence: <span className="font-semibold">{planetaryPositions?.sun?.sign || 'unknown'}</span></p>
          
          <div className="mt-2">
            <p className="font-medium">Recommended Cuisine Types:</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {state?.astrologicalState?.dominantElement === 'Fire' && (
                <>
                  <div className="bg-red-50 dark:bg-red-900/20 p-1 rounded">Spicy cuisines</div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-1 rounded">Grilled dishes</div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-1 rounded">Mexican</div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-1 rounded">Thai</div>
                </>
              )}
              {state?.astrologicalState?.dominantElement === 'Water' && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded">Seafood</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded">Soups and stews</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded">Japanese</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded">Steamed dishes</div>
                </>
              )}
              {state?.astrologicalState?.dominantElement === 'Earth' && (
                <>
                  <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded">Root vegetables</div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded">Slow-cooked</div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded">Italian</div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded">French</div>
                </>
              )}
              {state?.astrologicalState?.dominantElement === 'Air' && (
                <>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-1 rounded">Light preparations</div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-1 rounded">Fusion cuisines</div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-1 rounded">Mediterranean</div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-1 rounded">Vegetarian</div>
                </>
              )}
            </div>
          </div>
        </div>
      </DebugSection>
      
      {/* Ingredient Recommender */}
      <DebugSection 
        title="Ingredient Recommender" 
        isExpanded={expandedSections.ingredients}
        onToggle={() => toggleSection('ingredients')}
      >
        <div className="space-y-2 text-sm">
          <p>Element Influence: <span className="font-semibold">{state?.astrologicalState?.dominantElement || 'Unknown'}</span></p>
          
          <div className="mt-2">
            <p className="font-medium">Ingredient Categories:</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">Proteins</div>
              <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">Vegetables</div>
              <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">Grains</div>
              <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">Fruits</div>
              <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">Herbs</div>
              <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">Spices</div>
              <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">Oils</div>
              <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">Vinegars</div>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="font-medium">Element-Based Ingredients:</p>
            <div className="mt-1">
              <h4 className="text-xs font-medium">Fire:</h4>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded">Chili</span>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded">Ginger</span>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded">Garlic</span>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded">Pepper</span>
              </div>
            </div>
            <div className="mt-1">
              <h4 className="text-xs font-medium">Water:</h4>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Cucumber</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Melon</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Fish</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Seaweed</span>
              </div>
            </div>
            <div className="mt-1">
              <h4 className="text-xs font-medium">Earth:</h4>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">Potatoes</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">Mushrooms</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">Root vegetables</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">Beans</span>
              </div>
            </div>
            <div className="mt-1">
              <h4 className="text-xs font-medium">Air:</h4>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1 rounded">Leafy greens</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1 rounded">Herbs</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1 rounded">Sprouts</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1 rounded">Berries</span>
              </div>
            </div>
          </div>
        </div>
      </DebugSection>
      
      {/* Cooking Methods */}
      <DebugSection 
        title="Cooking Methods" 
        isExpanded={expandedSections.cookingMethods}
        onToggle={() => toggleSection('cookingMethods')}
      >
        <div className="space-y-2 text-sm">
          <p>Element Influence: <span className="font-semibold">{state?.astrologicalState?.dominantElement || 'Unknown'}</span></p>
          
          <div className="mt-2">
            <p className="font-medium">Element-Based Cooking Methods:</p>
            <div className="mt-1">
              <h4 className="text-xs font-medium">Fire:</h4>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded">Grilling</span>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded">Roasting</span>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded">Broiling</span>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded">Searing</span>
              </div>
            </div>
            <div className="mt-1">
              <h4 className="text-xs font-medium">Water:</h4>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Steaming</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Poaching</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Boiling</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Simmering</span>
              </div>
            </div>
            <div className="mt-1">
              <h4 className="text-xs font-medium">Earth:</h4>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">Baking</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">Braising</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">Slow-cooking</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">Fermenting</span>
              </div>
            </div>
            <div className="mt-1">
              <h4 className="text-xs font-medium">Air:</h4>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1 rounded">Whipping</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1 rounded">Infusing</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1 rounded">Smoking</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1 rounded">Aerating</span>
              </div>
            </div>
          </div>
        </div>
      </DebugSection>
      
      {/* Tarot Information */}
      <DebugSection 
        title="Tarot Information" 
        isExpanded={expandedSections.tarot}
        onToggle={() => toggleSection('tarot')}
      >
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-medium">Major Arcana:</p>
            <div className="mt-1 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
              <p>Sun Sign ({planetaryPositions?.sun?.sign || 'unknown'}): <span className="font-semibold">
                {planetaryPositions?.sun?.sign === 'aries' && 'The Emperor'}
                {planetaryPositions?.sun?.sign === 'taurus' && 'The Hierophant'}
                {planetaryPositions?.sun?.sign === 'gemini' && 'The Lovers'}
                {planetaryPositions?.sun?.sign === 'cancer' && 'The Chariot'}
                {planetaryPositions?.sun?.sign === 'leo' && 'Strength'}
                {planetaryPositions?.sun?.sign === 'virgo' && 'The Hermit'}
                {planetaryPositions?.sun?.sign === 'libra' && 'Justice'}
                {planetaryPositions?.sun?.sign === 'scorpio' && 'Death'}
                {planetaryPositions?.sun?.sign === 'sagittarius' && 'Temperance'}
                {planetaryPositions?.sun?.sign === 'capricorn' && 'The Devil'}
                {planetaryPositions?.sun?.sign === 'aquarius' && 'The Star'}
                {planetaryPositions?.sun?.sign === 'pisces' && 'The Moon'}
              </span></p>
              <p>Ascendant ({planetaryPositions?.ascendant?.sign || 'unknown'}): <span className="font-semibold">
                {planetaryPositions?.ascendant?.sign === 'aries' && 'The Emperor'}
                {planetaryPositions?.ascendant?.sign === 'taurus' && 'The Hierophant'}
                {planetaryPositions?.ascendant?.sign === 'gemini' && 'The Lovers'}
                {planetaryPositions?.ascendant?.sign === 'cancer' && 'The Chariot'}
                {planetaryPositions?.ascendant?.sign === 'leo' && 'Strength'}
                {planetaryPositions?.ascendant?.sign === 'virgo' && 'The Hermit'}
                {planetaryPositions?.ascendant?.sign === 'libra' && 'Justice'}
                {planetaryPositions?.ascendant?.sign === 'scorpio' && 'Death'}
                {planetaryPositions?.ascendant?.sign === 'sagittarius' && 'Temperance'}
                {planetaryPositions?.ascendant?.sign === 'capricorn' && 'The Devil'}
                {planetaryPositions?.ascendant?.sign === 'aquarius' && 'The Star'}
                {planetaryPositions?.ascendant?.sign === 'pisces' && 'The Moon'}
              </span></p>
            </div>
          </div>
          
          <div>
            <p className="font-medium">Minor Arcana:</p>
            <div className="mt-1">
              <p className="text-xs font-medium">Sun Sign Decan:</p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                {planetaryPositions?.sun?.sign === 'aries' && planetaryPositions?.sun?.degree < 10 && (
                  <p>1st Decan of Aries: <span className="font-semibold">2 of Wands</span></p>
                )}
                {planetaryPositions?.sun?.sign === 'aries' && planetaryPositions?.sun?.degree >= 10 && planetaryPositions?.sun?.degree < 20 && (
                  <p>2nd Decan of Aries: <span className="font-semibold">3 of Wands</span></p>
                )}
                {planetaryPositions?.sun?.sign === 'aries' && planetaryPositions?.sun?.degree >= 20 && (
                  <p>3rd Decan of Aries: <span className="font-semibold">4 of Wands</span></p>
                )}
                
                {planetaryPositions?.sun?.sign === 'taurus' && planetaryPositions?.sun?.degree < 10 && (
                  <p>1st Decan of Taurus: <span className="font-semibold">5 of Pentacles</span></p>
                )}
                {planetaryPositions?.sun?.sign === 'taurus' && planetaryPositions?.sun?.degree >= 10 && planetaryPositions?.sun?.degree < 20 && (
                  <p>2nd Decan of Taurus: <span className="font-semibold">6 of Pentacles</span></p>
                )}
                {planetaryPositions?.sun?.sign === 'taurus' && planetaryPositions?.sun?.degree >= 20 && (
                  <p>3rd Decan of Taurus: <span className="font-semibold">7 of Pentacles</span></p>
                )}
                
                {/* Other signs would follow the same pattern */}
                
                {(!planetaryPositions?.sun?.sign || 
                  (planetaryPositions?.sun?.sign !== 'aries' && planetaryPositions?.sun?.sign !== 'taurus')) && (
                  <p>Based on Sun in {planetaryPositions?.sun?.sign || 'unknown'} at {planetaryPositions?.sun?.degree?.toFixed(1) || '0'}°</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DebugSection>
    </div>
  );
});

export default DebugInfo; 