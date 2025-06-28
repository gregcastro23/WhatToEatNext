"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { getTarotCardsForDate } from '@/lib/tarotCalculations';
import { SUIT_TO_ELEMENT, SUIT_TO_TOKEN } from '@/utils/tarotMappings';
import { Flame, Droplets, Mountain, Wind, Sparkles, Clock, Calendar } from 'lucide-react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import type { PlanetaryPosition } from '@/types/alchemy';

export interface AlchemicalValues {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

export interface TarotFoodDisplayProps {
  onTarotLoaded?: (data: { 
    minorCard: unknown; 
    majorCard: unknown; 
    planetaryCards?: Record<string, unknown>;
    alchemicalValues?: AlchemicalValues;
  }) => void;
}

export default function TarotFoodDisplay({ onTarotLoaded }: TarotFoodDisplayProps) {
  const [tarotCards, setTarotCards] = useState<{ minorCard: unknown, majorCard: unknown, planetaryCards?: Record<string, unknown> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const onTarotLoadedRef = useRef(onTarotLoaded);
  
  // Get astrological state which includes sun position
  const { currentPlanetaryAlignment, loading: astroLoading } = useAstrologicalState();

  // Type guard to check if currentPlanetaryAlignment has sun property with the right shape
  const hasSunPosition = (alignment: Record<string, unknown>): alignment is { sun: PlanetaryPosition } => {
    return alignment && 
           typeof alignment === 'object' && 
           'sun' in alignment && 
           alignment.sun && 
           typeof alignment.sun === 'object' &&
           'sign' in alignment.sun;
  };

  // Update the ref when onTarotLoaded changes
  useEffect(() => {
    onTarotLoadedRef.current = onTarotLoaded;
  }, [onTarotLoaded]);

  const loadTarotCards = useCallback(async () => {
    try {
      const currentDate = new Date();
      
      // Calculate biweekly period (1-26)
      const startOfYear = new Date(currentDate.getFullYear(), 0, 0);
      const diff = currentDate.getTime() - startOfYear.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      const weekOfYear = Math.floor(dayOfYear / 7);
      const biWeeklyPeriod = Math.floor(weekOfYear / 2) + 1;
      
      // Format the date range for this period
      const periodStart = new Date(currentDate.getFullYear(), 0, biWeeklyPeriod * 14 - 13);
      const periodEnd = new Date(currentDate.getFullYear(), 0, biWeeklyPeriod * 14);
      const formatDate = (date: Date) => {
        const month = date.toLocaleString('default', { month: 'short' });
        return `${month} ${date.getDate()}`;
      };
      setCurrentPeriod(`${formatDate(periodStart)} - ${formatDate(periodEnd)}`);
      
      // Get sun position from planetary alignment if available
      let sunPosition;
      if (hasSunPosition(currentPlanetaryAlignment)) {
        const sunData = currentPlanetaryAlignment.sun as any;
        sunPosition = {
          sign: sunData?.sign || '',
          degree: sunData?.degree || 0
        };
      }
      
      // Get the cards with sun position
      const cards = getTarotCardsForDate(currentDate, sunPosition);
      
      // Only update state if cards have changed
      setTarotCards(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(cards)) {
          return cards;
        }
        return prev;
      });
      
      // Use ref for callback to prevent re-renders
      if (onTarotLoadedRef.current && cards) {
        // Calculate alchemical values
        const alchemicalValues = getAlchemicalValues(cards.minorCard);
        
        // Add values to the callback data
        onTarotLoadedRef.current({
          ...cards,
          alchemicalValues,
          planetaryCards: {} // Will be populated by the parent component
        });
      }
    } catch (err) {
      setError('Failed to load tarot cards');
      console.error(err);
    }
  }, [currentPlanetaryAlignment]);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      loadTarotCards();
    }

    return () => {
      isMounted = false;
    };
  }, [loadTarotCards]);

  // Function to compute alchemical values from tarot card
  const getAlchemicalValues = (card: unknown) => {
    if (!card) return { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    
    const cardData = card as any;
    const suit = cardData?.name?.split(' of ')[1];
    const number = cardData?.number || 0;
    
    // Create base object with all values at 0
    const values = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    
    // Map suit to alchemical value
    if (suit === 'Wands') values.Spirit = number;
    else if (suit === 'Cups') values.Essence = number;
    else if (suit === 'Pentacles') values.Matter = number;
    else if (suit === 'Swords') values.Substance = number;
    
    return values;
  };

  const getElementIcon = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'fire': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'water': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'earth': return <Mountain className="w-4 h-4 text-green-400" />;
      case 'air': return <Wind className="w-4 h-4 text-purple-400" />;
      default: return null;
    }
  };

  const getElementColor = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'fire': return 'bg-gradient-to-br from-orange-800 to-red-900 text-white';
      case 'water': return 'bg-gradient-to-br from-blue-800 to-indigo-900 text-white';
      case 'earth': return 'bg-gradient-to-br from-green-800 to-emerald-900 text-white';
      case 'air': return 'bg-gradient-to-br from-purple-800 to-violet-900 text-white';
      default: return 'bg-gradient-to-br from-gray-800 to-slate-900 text-white';
    }
  };

  if (error) return <div className="text-red-400 mb-4">Tarot unavailable: {error}</div>;
  if (!tarotCards) return <div className="text-purple-300 mb-4">Divining celestial cards...</div>;

  // Safe access to tarot card properties
  const minorCardData = tarotCards.minorCard as any;
  const suit = minorCardData?.name?.split(' ')[2];
  const element = suit ? (SUIT_TO_ELEMENT[suit as keyof typeof SUIT_TO_ELEMENT] || 'Unknown') : 'Unknown';
  const token = suit ? (SUIT_TO_TOKEN[suit as keyof typeof SUIT_TO_TOKEN] || 'Quantum') : 'Quantum';
  const value = minorCardData?.number || 0;

  return (
    <div className="mb-6 mt-2">
      <h3 className="text-lg font-semibold mb-3">Tarot Correspondence for Today</h3>
      
      <div className="flex items-center mb-3 text-xs text-purple-300">
        <Calendar className="w-3 h-3 mr-1" />
        <span>Biweekly Period: {currentPeriod}</span>
        <Clock className="w-3 h-3 ml-3 mr-1" />
        <span>Updated daily with planetary positions</span>
        {hasSunPosition(currentPlanetaryAlignment) && (
          <span className="ml-3">
            • Sun: {(currentPlanetaryAlignment.sun as any)?.sign} {Math.floor((currentPlanetaryAlignment.sun as any)?.degree || 0)}°
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className={`rounded-lg p-4 bg-opacity-10 ${getElementColor(element)}`}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-white text-lg drop-shadow-md">{minorCardData?.name || 'Minor Arcana'}</h4>
              <div className="flex items-center mt-1 bg-black bg-opacity-20 rounded px-2 py-1 inline-block">
                {getElementIcon(element)}
                <span className="ml-1 text-sm font-medium">{element}</span>
              </div>
            </div>
            <div className="flex items-center bg-black bg-opacity-50 px-3 py-1.5 rounded-full shadow">
              <Sparkles className="w-4 h-4 mr-1.5 text-yellow-300" />
              <span className="text-sm text-white font-medium">{token}: {value}</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            <div className="italic font-medium text-white bg-black bg-opacity-30 p-2 rounded-md">
              {minorCardData?.meaning || 'Divine guidance flows through the cards'}
            </div>
          </div>
        </div>
        
        <div className="rounded-lg p-4 bg-gradient-to-br from-purple-900 to-indigo-900 text-white bg-opacity-10">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-white text-lg drop-shadow-md">{(tarotCards.majorCard as any)?.name || 'Major Arcana'}</h4>
              <div className="flex items-center mt-1 bg-black bg-opacity-20 rounded px-2 py-1 inline-block">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="ml-1 text-sm font-medium">Archetypal</span>
              </div>
            </div>
            <div className="flex items-center bg-black bg-opacity-50 px-3 py-1.5 rounded-full shadow">
              <span className="text-sm text-white font-medium">#{(tarotCards.majorCard as any)?.number || 0}</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            <div className="italic font-medium text-white bg-black bg-opacity-30 p-2 rounded-md">
              {(tarotCards.majorCard as any)?.meaning || 'The path reveals itself'}
            </div>
          </div>
        </div>
      </div>
      
      {tarotCards.planetaryCards && Object.keys(tarotCards.planetaryCards).length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Active Planetary Influences</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(tarotCards.planetaryCards).map(([planet, card]) => {
              // Apply surgical type casting with variable extraction
              const cardData = card as any;
              const name = cardData?.name;
              const energy = cardData?.energy;
              
              return (
                <div key={planet} className="rounded-lg p-2 bg-gray-800 bg-opacity-40 text-xs">
                  <div className="font-medium text-purple-300">{planet}</div>
                  <div className="text-gray-400 mt-1">{name}</div>
                  <div className="flex items-center mt-1">
                    <div className="h-1 bg-gray-700 flex-grow rounded-full overflow-hidden">
                      <div 
                        className="h-1 bg-purple-500" 
                        style={{ width: `${(energy || 0.5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs text-gray-500">{Math.round((energy || 0.5) * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 