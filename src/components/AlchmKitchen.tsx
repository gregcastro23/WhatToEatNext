'use client';

import { useEffect, useState } from 'react';
import { getTarotCardsForDate } from '@/lib/tarotCalculations';
import { getRecipesForTarotCard } from '@/lib/recipeCalculations';
import styles from './AlchmKitchen.module.css';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import { createLogger } from '@/utils/logger';
import ElementalVisualizer from '@/components/ElementalVisualizer';
import AlchemicalPropertiesDisplay from '@/components/AlchemicalPropertiesDisplay';
import { getAccuratePlanetaryPositions } from '@/utils/accurateAstronomy';
import { calculatePlanetaryAlchemicalValues, calculateElementalBalance } from '@/utils/alchemicalCalculations';

const logger = createLogger('AlchmKitchen');

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  preparation: string;
  astrologicalInfluences: string[];
}

type TimeFrame = 'current' | 'tomorrow' | 'nextWeek' | 'nextMonth';

/**
 * Simple helper to determine if it's daytime (6 AM to 6 PM)
 */
const checkIsDaytime = (date: Date): boolean => {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
};

export default function AlchmKitchen() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [renderCount, setRenderCount] = useState(0);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('current');
  
  // Custom states for when we calculate future timeframes
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [isDaytimeTarget, setIsDaytimeTarget] = useState<boolean>(true);
  const [currentSuit, setCurrentSuit] = useState<string | undefined>(undefined);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [displayElementalState, setDisplayElementalState] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [displayAlchemicalValues, setDisplayAlchemicalValues] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [displayPositions, setDisplayPositions] = useState<any>(null);

  // Get current state from AlchemicalContext
  // Get current state from AlchemicalContext using the new shorthands
  const { 
    elementalState, 
    alchemicalValues, 
    astrologicalState,
    planetaryHour: ctxPlanetaryHour,
    lunarPhase: ctxLunarPhase,
    planetaryPositions
  } = useAlchemical();

  // Current states to use (either global context or custom calculated)
  const currentSign = astrologicalState?.sunSign || 'unknown';
  const planetaryHour = ctxPlanetaryHour || 'Unknown';
  const lunarPhase = ctxLunarPhase || 'Unknown';

  const activeElementalState = displayElementalState || elementalState || DEFAULT_ELEMENTAL_PROPERTIES;
  const activeAlchemicalValues = displayAlchemicalValues || alchemicalValues || { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  const activePositions = displayPositions || planetaryPositions;
  const activeIsDaytime = timeFrame === 'current' ? (astrologicalState?.isDaytime ?? checkIsDaytime(new Date())) : isDaytimeTarget;

  useEffect(() => {
    setMounted(true);
    if (renderCount === 0) {
      setRenderCount((prev) => prev + 1);
    }
  }, [renderCount]);

  // Update target date and values when time frame changes
  useEffect(() => {
    const calculateTimeFrame = async () => {
      setLoading(true);
      const newDate = new Date();
      
      switch (timeFrame) {
        case 'tomorrow':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'nextWeek':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'nextMonth':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case 'current':
        default:
          break;
      }
      
      const isDay = checkIsDaytime(newDate);
      setTargetDate(newDate);
      setIsDaytimeTarget(isDay);

      if (timeFrame !== 'current') {
        try {
          const newPositions = await getAccuratePlanetaryPositions(newDate);
          setDisplayPositions(newPositions);
          
          // Get tarot card for future date to apply suit boost
          const tarotUtils = await import('@/lib/tarotCalculations');
          const cards = tarotUtils.getTarotCardsForDate(
            newDate,
            newPositions.sun && {
              sign: (newPositions.sun.sign as string) || 'aries',
              degree: newPositions.sun.degree || 0,
            }
          );
          const suit = cards.minorCard.suit;
          setCurrentSuit(suit);
          
          const newElementalState = calculateElementalBalance(newPositions as any, isDay, suit);
          setDisplayElementalState(newElementalState);
          
          const newAlchemicalValues = calculatePlanetaryAlchemicalValues(newPositions as any, isDay, suit);
          setDisplayAlchemicalValues(newAlchemicalValues);
        } catch (err) {
          logger.error('Failed to calculate future state', err);
        }
      } else {
        setDisplayPositions(null);
        setDisplayElementalState(null);
        setDisplayAlchemicalValues(null);
        
        // Also get suit for current moment
        const tarotUtils = await import('@/lib/tarotCalculations');
        const cards = tarotUtils.getTarotCardsForDate(
          new Date(),
          planetaryPositions.sun
            ? {
                sign: ((planetaryPositions.sun as any).sign as string) || 'aries',
                degree: (planetaryPositions.sun as any).degree || 0,
              }
            : undefined
        );
        setCurrentSuit(cards.minorCard.suit);
      }
      setLoading(false);
    };
    
    calculateTimeFrame();
  }, [timeFrame, planetaryPositions.sun]);

  // Fetch tarot cards and recipes for the active configuration
  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get tarot cards for the target date
        const cards = getTarotCardsForDate(
          targetDate,
          activePositions?.sun && {
            sign: activePositions.sun.sign || 'aries',
            degree: activePositions.sun.degree || 0,
          }
        );

        // Get recipes based on tarot cards
        const fetchedRecipes = await getRecipesForTarotCard({
          minorCard: {
            name: cards.minorCard.name,
            suit: cards.minorCard.suit,
            number: cards.minorCard.number,
            keywords: cards.minorCard.keywords || [],
            quantum: cards.minorCard.quantum || 0,
            element: cards.minorCard.element,
            associatedRecipes: cards.minorCard.associatedRecipes,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          majorCard: cards.majorCard as any,
        });

        setFilteredRecipes(fetchedRecipes);
        setLoading(false);
      } catch (err) {
        logger.error('Error fetching recipe data', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [activePositions?.sun, targetDate, mounted, currentSign, planetaryHour]);

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  // Format elemental balance for display
  const elementalBalancePercentage = {
    Fire: Math.round(activeElementalState.Fire * 100) || 0,
    Water: Math.round(activeElementalState.Water * 100) || 0,
    Earth: Math.round(activeElementalState.Earth * 100) || 0,
    Air: Math.round(activeElementalState.Air * 100) || 0,
  };

  return (
    <div className={`${styles.container} ${activeIsDaytime ? styles.daytimeTheme : styles.nighttimeTheme}`}>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Alchm Kitchen</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${activeIsDaytime ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-900 text-indigo-100 border border-indigo-700'}`}>
          {activeIsDaytime ? '☀️ DIURNAL' : '🌙 NOCTURNAL'}
          {currentSuit && <span className="ml-2">• 🎴 {currentSuit} Boost</span>}
        </div>
      </div>
      <h2 className="text-xl mb-6 text-center">The Menu of the Moment in the Stars and Elements</h2>

      <div className="mb-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-indigo-100">
        <label htmlFor="timeFrameSelector" className="font-semibold text-indigo-900">
          Select Celestial Timeframe:
        </label>
        <select
          id="timeFrameSelector"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
          className="px-4 py-2 bg-white border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-800 font-medium"
        >
          <option value="current">Current Moment</option>
          <option value="tomorrow">Tomorrow (+24 Hours)</option>
          <option value="nextWeek">Next Week (+7 Days)</option>
          <option value="nextMonth">Next Month (+30 Days)</option>
        </select>
        <div className="text-sm text-indigo-600 italic mt-2 md:mt-0">
          Target Date: {targetDate.toLocaleDateString()} {targetDate.toLocaleTimeString()}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading celestial configurations...</div>
      ) : (
        <div className={styles.content}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AlchemicalPropertiesDisplay values={activeAlchemicalValues} isDaytime={activeIsDaytime} className="h-full" />
            <div className="p-6 bg-white rounded-xl shadow-sm border border-indigo-100 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4 text-indigo-900 text-center">Elemental Balance</h3>
              <ElementalVisualizer 
                elementalProperties={activeElementalState} 
                visualizationType="radar" 
                size="md"
                darkMode={!activeIsDaytime}
              />
              <div className="mt-4 text-xs text-indigo-400 text-center">
                Reflecting {activeIsDaytime ? 'Daytime' : 'Nighttime'} planetary dignities
                {currentSuit && <><br />+ Tarot {currentSuit} suit influence</>}
              </div>
            </div>
          </div>
          
          <div className={styles.recipeList}>
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className={styles.recipeCard}>
                <h3>{recipe.name}</h3>
                <div className={styles.ingredients}>
                  <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
                </div>
                <div className={styles.preparation}>
                  <strong>Preparation:</strong> {recipe.preparation}
                </div>
                <div className={styles.astrologicalInfluences}>
                  <strong>Astrological Influences:</strong> {recipe.astrologicalInfluences.join(', ')}
                </div>
              </div>
            ))}
            {filteredRecipes.length === 0 && !loading && (
              <div className="col-span-full text-center py-8 text-indigo-400">
                No recipes found for the current celestial alignment.
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.debugInfo}>
        <h3>Debug Info</h3>
        <div>Mounted: {mounted.toString()}</div>
        <div>Renders: {renderCount}</div>
        <div>Time Frame: {timeFrame}</div>
        <div>Is Daytime: {activeIsDaytime.toString()}</div>
        <div>Tarot Suit: {currentSuit || 'none'}</div>
        <div>Current Sign: {currentSign}</div>
        <div>Planetary Hour: {planetaryHour}</div>
        <div>Lunar Phase: {lunarPhase}</div>
        <h4>Elemental Balance:</h4>
        <div>Fire: {elementalBalancePercentage.Fire}%</div>
        <div>Water: {elementalBalancePercentage.Water}%</div>
        <div>Earth: {elementalBalancePercentage.Earth}%</div>
        <div>Air: {elementalBalancePercentage.Air}%</div>
      </div>
    </div>
  );
}
