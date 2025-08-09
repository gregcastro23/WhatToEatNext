'use client';

import { Flame, Droplets, Mountain, Wind, Sparkles, Clock, Calendar } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';

import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { getTarotCardsForDate } from '@/lib/tarotCalculations';
import type { PlanetaryPosition } from '@/types/alchemy';
import { SUIT_TO_ELEMENT, SUIT_TO_TOKEN } from '@/utils/tarotMappings';

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
  const [tarotCards, setTarotCards] = useState<{
    minorCard: unknown;
    majorCard: unknown;
    planetaryCards?: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const onTarotLoadedRef = useRef(onTarotLoaded);

  // Get astrological state which includes sun position
  const { currentPlanetaryAlignment, loading: astroLoading } = useAstrologicalState();

  // Type guard to check if currentPlanetaryAlignment has sun property with the right shape
  const hasSunPosition = (
    alignment: Record<string, unknown>,
  ): alignment is { sun: PlanetaryPosition } => {
    return Boolean(
      alignment &&
        typeof alignment === 'object' &&
        'sun' in alignment &&
        alignment.sun &&
        typeof alignment.sun === 'object' &&
        'sign' in alignment.sun,
    );
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
      if (hasSunPosition(currentPlanetaryAlignment as unknown as Record<string, unknown>)) {
        const sunData = currentPlanetaryAlignment.Sun as unknown as Record<string, unknown>;
        sunPosition = {
          sign: String(sunData.sign || ''),
          degree: Number(sunData.degree || 0),
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
          planetaryCards: {}, // Will be populated by the parent component
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
      void loadTarotCards();
    }

    return () => {
      isMounted = false;
    };
  }, [loadTarotCards]);

  // Function to compute alchemical values from tarot card
  const getAlchemicalValues = (card: unknown) => {
    if (!card) return { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

    const cardData = card as Record<string, unknown>;
    const suit = String(cardData.name || '').split(' of ')[1];
    const number = Number(cardData.number || 0);

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
    switch (element.toLowerCase()) {
      case 'fire':
        return <Flame className='h-4 w-4 text-orange-400' />;
      case 'water':
        return <Droplets className='h-4 w-4 text-blue-400' />;
      case 'earth':
        return <Mountain className='h-4 w-4 text-green-400' />;
      case 'air':
        return <Wind className='h-4 w-4 text-purple-400' />;
      default:
        return null;
    }
  };

  const getElementColor = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire':
        return 'bg-gradient-to-br from-orange-800 to-red-900 text-white';
      case 'water':
        return 'bg-gradient-to-br from-blue-800 to-indigo-900 text-white';
      case 'earth':
        return 'bg-gradient-to-br from-green-800 to-emerald-900 text-white';
      case 'air':
        return 'bg-gradient-to-br from-purple-800 to-violet-900 text-white';
      default:
        return 'bg-gradient-to-br from-gray-800 to-slate-900 text-white';
    }
  };

  if (error) return <div className='mb-4 text-red-400'>Tarot unavailable: {error}</div>;
  if (!tarotCards) return <div className='mb-4 text-purple-300'>Divining celestial cards...</div>;

  // Safe access to tarot card properties
  const minorCardData = tarotCards.minorCard as Record<string, unknown>;
  const suit = String(minorCardData.name || '').split(' ')[2];
  const element = suit
    ? SUIT_TO_ELEMENT[suit as keyof typeof SUIT_TO_ELEMENT] || 'Unknown'
    : 'Unknown';
  const token = suit ? SUIT_TO_TOKEN[suit as keyof typeof SUIT_TO_TOKEN] || 'Quantum' : 'Quantum';
  const value = Number(minorCardData.number || 0);

  return (
    <div className='mb-6 mt-2'>
      <h3 className='mb-3 text-lg font-semibold'>Tarot Correspondence for Today</h3>

      <div className='mb-3 flex items-center text-xs text-purple-300'>
        <Calendar className='mr-1 h-3 w-3' />
        <span>Biweekly Period: {currentPeriod}</span>
        <Clock className='ml-3 mr-1 h-3 w-3' />
        <span>Updated daily with planetary positions</span>
        {hasSunPosition(currentPlanetaryAlignment as unknown as Record<string, unknown>) && (
          <span className='ml-3'>
            • Sun:{' '}
            {String((currentPlanetaryAlignment.Sun as unknown as Record<string, unknown>).sign)}{' '}
            {Math.floor(
              Number(
                (currentPlanetaryAlignment.Sun as unknown as Record<string, unknown>).degree || 0,
              ),
            )}
            °
          </span>
        )}
      </div>

      <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className={`rounded-lg bg-opacity-10 p-4 ${getElementColor(element)}`}>
          <div className='flex items-start justify-between'>
            <div>
              <h4 className='text-lg font-bold text-white drop-shadow-md'>
                {String(minorCardData.name || 'Minor Arcana')}
              </h4>
              <div className='mt-1 inline-block flex items-center rounded bg-black bg-opacity-20 px-2 py-1'>
                {getElementIcon(element)}
                <span className='ml-1 text-sm font-medium'>{element}</span>
              </div>
            </div>
            <div className='flex items-center rounded-full bg-black bg-opacity-50 px-3 py-1.5 shadow'>
              <Sparkles className='mr-1.5 h-4 w-4 text-yellow-300' />
              <span className='text-sm font-medium text-white'>
                {token}: {value}
              </span>
            </div>
          </div>

          <div className='mt-4 text-sm'>
            <div className='rounded-md bg-black bg-opacity-30 p-2 font-medium italic text-white'>
              {String(minorCardData.meaning || 'Divine guidance flows through the cards')}
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-opacity-10 bg-gradient-to-br from-purple-900 to-indigo-900 p-4 text-white'>
          <div className='flex items-start justify-between'>
            <div>
              <h4 className='text-lg font-bold text-white drop-shadow-md'>
                {String((tarotCards.majorCard as Record<string, unknown>).name || 'Major Arcana')}
              </h4>
              <div className='mt-1 inline-block flex items-center rounded bg-black bg-opacity-20 px-2 py-1'>
                <Sparkles className='h-4 w-4 text-yellow-300' />
                <span className='ml-1 text-sm font-medium'>Archetypal</span>
              </div>
            </div>
            <div className='flex items-center rounded-full bg-black bg-opacity-50 px-3 py-1.5 shadow'>
              <span className='text-sm font-medium text-white'>
                #{Number((tarotCards.majorCard as Record<string, unknown>).number || 0)}
              </span>
            </div>
          </div>

          <div className='mt-4 text-sm'>
            <div className='rounded-md bg-black bg-opacity-30 p-2 font-medium italic text-white'>
              {String(
                (tarotCards.majorCard as Record<string, unknown>).meaning ||
                  'The path reveals itself',
              )}
            </div>
          </div>
        </div>
      </div>

      {tarotCards.planetaryCards && Object.keys(tarotCards.planetaryCards).length > 0 && (
        <div className='mt-4'>
          <h4 className='mb-2 text-sm font-semibold'>Active Planetary Influences</h4>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4'>
            {Object.entries(tarotCards.planetaryCards).map(([planet, card]) => {
              // Apply surgical type casting with variable extraction
              const cardData = card as Record<string, unknown>;
              const name = cardData.name;
              const energy = cardData.energy;

              return (
                <div key={planet} className='rounded-lg bg-gray-800 bg-opacity-40 p-2 text-xs'>
                  <div className='font-medium text-purple-300'>{planet}</div>
                  <div className='mt-1 text-gray-400'>{String(name || '')}</div>
                  <div className='mt-1 flex items-center'>
                    <div className='h-1 flex-grow overflow-hidden rounded-full bg-gray-700'>
                      <div
                        className='h-1 bg-purple-500'
                        style={{ width: `${Number(energy || 0.5) * 100}%` }}
                      ></div>
                    </div>
                    <span className='ml-1 text-xs text-gray-500'>
                      {Math.round(Number(energy || 0.5) * 100)}%
                    </span>
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
