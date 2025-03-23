"use client"

import React, { useState, useEffect } from 'react';
import styles from './FoodRecommender.module.css';
import { useTarotAstrologyData } from '@/hooks/useTarotAstrologyData';
import { Clock, Flame, Droplets, Mountain, Wind, Leaf, ThermometerSun, ThermometerSnowflake, Pill, Sparkles, Star } from 'lucide-react';
import { getCurrentSeason } from '@/data/integrations/seasonal';
import { RecommendationAdapter } from '@/services/RecommendationAdapter';
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { AlchemicalProperty, ElementalCharacter } from '@/constants/planetaryElements';
import { LunarPhase, PlanetaryDignity } from '@/constants/planetaryFoodAssociations';
import TarotFoodDisplay from '@/components/TarotFoodDisplay';
import { calculateAspects, calculatePlanetaryPositions } from '@/utils/astrologyUtils';
import { useCurrentChart } from '@/context/CurrentChartContext';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { motion } from 'framer-motion';
import { logger } from '@/utils/logger';

// Import ingredient data
import allIngredients from '@/data/ingredients';
import { TAROT_CARDS } from '@/constants/tarotCards';

const FoodRecommender: React.FC = () => {
    const { 
        currentPlanetaryAlignment, 
        currentZodiac, 
        activePlanets, 
        isDaytime, 
        moonPhase,
        minorCard,
        majorCard,
        tarotElementBoosts,
        tarotPlanetaryBoosts,
        currentLunarPhase,
        isLoading,
        error: astroError,
        tarotEnergyBoosts
    } = useTarotAstrologyData();
    
    const { chart, loading: chartLoading, error: chartError } = useCurrentChart();
    
    const [transformedIngredients, setTransformedIngredients] = useState<AlchemicalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string | null>(null);
    const [currentSeason, setCurrentSeason] = useState<string>('');
    const [tarotCards, setTarotCards] = useState<{minorCard: any, majorCard: any} | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                if (chartError) throw new Error(chartError);
                
                // Use chart data instead of calculating positions
                const { planetaryPositions, aspects } = chart;
                
                const season = getCurrentSeason();
                setCurrentSeason(season);
                
                // Check if allIngredients is defined before mapping
                if (!allIngredients || typeof allIngredients !== 'object') {
                    throw new Error('Ingredient data is missing or invalid');
                }
                
                // Add debugging info
                logger.debug(`Ingredient data structure:`, 
                    Object.keys(allIngredients).length,
                    'categories or items');
                
                // Handle different possible structures of allIngredients
                let ingredientsAsElementalItems: ElementalItem[] = [];
                
                // Check if allIngredients is already flat (structure from index.ts)
                if (Object.values(allIngredients).some(item => item && typeof item === 'object' && 'name' in item)) {
                    // Structure is flat
                    ingredientsAsElementalItems = Object.values(allIngredients).map((ingredient: any) => ({
                        id: ingredient.id || ingredient.name.replace(/\s+/g, '_').toLowerCase(),
                        name: ingredient.name,
                        elementalProperties: {
                            Fire: getElementValue(ingredient, 'fire'),
                            Water: getElementValue(ingredient, 'water'),
                            Earth: getElementValue(ingredient, 'earth'),
                            Air: getElementValue(ingredient, 'air')
                        },
                        category: ingredient.category,
                        subCategory: ingredient.subCategory,
                        isInSeason: ingredient.isInSeason,
                        temperatureEffect: ingredient.temperatureEffect,
                        medicinalProperties: ingredient.medicinalProperties,
                        qualities: ingredient.qualities,
                        astrologicalProfile: ingredient.astrologicalProfile
                    }));
                } else {
                    // Structure is categorized (structure from ingredients.ts)
                    // Flatten the structure
                    ingredientsAsElementalItems = Object.entries(allIngredients).flatMap(([category, items]) => {
                        // Handle both array and object structures
                        const ingredientItems = Array.isArray(items) ? items : Object.values(items);
                        
                        return ingredientItems.map((ingredient: any) => ({
                            id: ingredient.id || ingredient.name.replace(/\s+/g, '_').toLowerCase(),
                            name: ingredient.name,
                            elementalProperties: {
                                Fire: getElementValue(ingredient, 'fire'),
                                Water: getElementValue(ingredient, 'water'),
                                Earth: getElementValue(ingredient, 'earth'),
                                Air: getElementValue(ingredient, 'air')
                            },
                            category: ingredient.category || category,
                            subCategory: ingredient.subCategory || '',
                            isInSeason: ingredient.isInSeason,
                            temperatureEffect: ingredient.temperatureEffect,
                            medicinalProperties: ingredient.medicinalProperties,
                            qualities: ingredient.qualities,
                            astrologicalProfile: ingredient.astrologicalProfile
                        }));
                    });
                }
                
                if (ingredientsAsElementalItems.length === 0) {
                    throw new Error('Failed to extract any valid ingredients');
                }
                
                logger.debug(`Processed ${ingredientsAsElementalItems.length} ingredients`);
                
                // Apply seasonal modifiers
                if (season) {
                    const seasonalModifiers: Record<string, Record<string, number>> = {
                        'spring': { 'Air': 0.2, 'Water': 0.1 },
                        'summer': { 'Fire': 0.2, 'Air': 0.1 },
                        'fall': { 'Earth': 0.2, 'Fire': 0.1 },
                        'winter': { 'Water': 0.2, 'Earth': 0.1 }
                    };
                    
                    // Adjust ingredients based on season
                    ingredientsAsElementalItems.forEach(ingredient => {
                        if (seasonalModifiers[season.toLowerCase()]) {
                            Object.entries(seasonalModifiers[season.toLowerCase()]).forEach(([element, modifier]) => {
                                ingredient.elementalProperties[element as ElementalCharacter] += modifier;
                            });
                        }
                        
                        // Mark ingredients that are in season
                        if (ingredient.isInSeason && typeof ingredient.isInSeason === 'object') {
                            ingredient.isCurrentlyInSeason = ingredient.isInSeason[season.toLowerCase()];
                        }
                    });
                }
                
                // Apply tarot card influence to ingredient properties if available 
                if (minorCard) {
                    const tarotElement = minorCard.element;
                    if (tarotElement) {
                        // Find ingredients that match the tarot element and enhance them
                        ingredientsAsElementalItems.forEach(ingredient => {
                            const dominantElement = getDominantElement(ingredient.elementalProperties);
                            if (dominantElement.toLowerCase() === tarotElement.toLowerCase()) {
                                // Enhance ingredient's primary element by quantum value
                                const quantumValue = minorCard.quantum || 1;
                                ingredient.elementalProperties[dominantElement] *= (1 + (quantumValue * 0.1));
                                
                                // Normalize
                                const total = Object.values(ingredient.elementalProperties).reduce((sum, val) => sum + val, 0);
                                if (total > 0) {
                                    Object.keys(ingredient.elementalProperties).forEach(element => {
                                        ingredient.elementalProperties[element as ElementalCharacter] = 
                                            ingredient.elementalProperties[element as ElementalCharacter] / total;
                                    });
                                }
                            }
                        });
                    }
                }
                
                // Enhance ingredients associated with the major arcana's planet
                if (majorCard && majorCard.planet) {
                    const tarotPlanet = majorCard.planet;
                    ingredientsAsElementalItems.forEach(ingredient => {
                        if (ingredient.astrologicalProfile?.rulingPlanets?.includes(tarotPlanet)) {
                            // Add a new property to indicate tarot major arcana affinity
                            ingredient.tarotMajorAffinity = majorCard.name;
                        }
                    });
                }
                
                // Use the RecommendationAdapter with the chart data
                const adapter = new RecommendationAdapter(
                    ingredientsAsElementalItems, 
                    [], 
                    []
                );
                
                await adapter.updatePlanetaryData(
                    planetaryPositions,
                    isDaytime,
                    currentZodiac,
                    currentLunarPhase,
                    tarotElementBoosts,
                    tarotPlanetaryBoosts,
                    aspects
                );
                
                // Get the transformed ingredients
                const transformedIngs = adapter.getRecommendedIngredients(12);
                setTransformedIngredients(transformedIngs);
                
            } catch (err: any) {
                setError(`Error getting recommendations: ${err.message}`);
                console.error('FoodRecommender error:', err);
                setTransformedIngredients([]);
                setDebugInfo(JSON.stringify({
                    allIngredientsType: typeof allIngredients,
                    allIngredientsKeys: allIngredients ? Object.keys(allIngredients) : [],
                    errorMessage: err.message,
                    stack: err.stack
                }, null, 2));
            } finally {
                setLoading(false);
            }
        };

        if (!chartLoading) {
            fetchData();
        }
        
        return () => controller.abort();
    }, [chart, chartLoading, chartError, currentZodiac, isDaytime, currentLunarPhase, minorCard?.id, majorCard?.id, JSON.stringify(tarotElementBoosts), JSON.stringify(tarotPlanetaryBoosts)]);

    // Helper function to get element value from ingredient
    const getElementValue = (ingredient: any, element: string): number => {
        // First check explicit elementalProperties with fallbacks
        const elementKey = element.charAt(0).toUpperCase() + element.slice(1);
        const explicitValue = Number(ingredient?.elementalProperties?.[elementKey]) || 0;
        
        // If we have an explicit value, use it directly
        if (explicitValue > 0) {
            return Math.min(Math.max(explicitValue, 0.1), 1.0);
        }

        // Fallback to astrological profile with validation
        const profile = ingredient?.astrologicalProfile || {};
        const baseElement = profile.elementalAffinity?.base?.toLowerCase();
        const secondaryElement = profile.elementalAffinity?.secondary?.toLowerCase();
        
        return element.toLowerCase() === baseElement ? 0.6 :
               element.toLowerCase() === secondaryElement ? 0.3 :
               0.1; // Minimum value to prevent division by zero
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

    const getTemperatureIcon = (effect: any) => {
        // First check if effect is a string
        if (typeof effect !== 'string') {
            // Return a default icon or null if effect isn't a string
            return <ThermometerSun className="w-4 h-4 text-gray-400" />;
        }
        
        if (effect.includes('warm') || effect.includes('hot')) {
            return <ThermometerSun className="w-4 h-4 text-orange-300" />;
        }
        if (effect.includes('cool') || effect.includes('cold')) {
            return <ThermometerSnowflake className="w-4 h-4 text-blue-300" />;
        }
        
        // Default icon if no matches
        return <ThermometerSun className="w-4 h-4 text-gray-400" />;
    };

    const getAlchemicalPropertyIcon = (property: AlchemicalProperty) => {
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
    };
    
    const getDignityColor = (dignity: PlanetaryDignity) => {
        switch (dignity) {
            case 'Domicile': return 'text-green-400';
            case 'Exaltation': return 'text-blue-400';
            case 'Neutral': return 'text-gray-400';
            case 'Detriment': return 'text-orange-400';
            case 'Fall': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };
    
    // Helper function to determine dominant element of an ingredient
    const getDominantElement = (elementalProperties: Record<ElementalCharacter, number>): ElementalCharacter => {
        let dominant: ElementalCharacter = 'Fire';
        let maxValue = -1;
        
        Object.entries(elementalProperties).forEach(([element, value]) => {
            if (value > maxValue) {
                dominant = element as ElementalCharacter;
                maxValue = value;
            }
        });
        
        return dominant;
    };
    
    // Handle tarot card data when loaded
    const handleTarotLoaded = (cards: {minorCard: any, majorCard: any}) => {
        setTarotCards(cards);
    };

    // Replace the safelyFormatNumber function with a more robust version
    const safelyFormatNumber = (value: any, decimals: number = 2): string => {
        if (value === undefined || value === null) return 'N/A';
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return 'Invalid';
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    return (
        <div className={styles.container}>
            <h2 className="text-2xl font-bold mb-4">Celestial Ingredient Recommendations</h2>
            
            {/* Tarot display */}
            <TarotFoodDisplay onTarotLoaded={handleTarotLoaded} />
            
            {loading && <p className="text-gray-400 mb-4">Calculating celestial alignments...</p>}
            
            {error && (
                <div className="bg-red-900 bg-opacity-20 p-4 rounded mb-4">
                    <p className="text-red-300">{error}</p>
                    {debugInfo && (
                        <details className="mt-2">
                            <summary className="text-sm text-gray-400 cursor-pointer">Technical Details</summary>
                            <pre className="mt-2 text-xs text-gray-500 overflow-x-auto">{debugInfo}</pre>
                        </details>
                    )}
                </div>
            )}
            
            {!loading && !error && (
                <>
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {currentPlanetaryAlignment?.sun && (
                                <div className="bg-yellow-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                                    <span className="text-yellow-400 mr-1">☉</span> 
                                    <span className="text-yellow-100">Sun in {currentPlanetaryAlignment.sun.sign}</span>
                                </div>
                            )}
                            
                            {currentPlanetaryAlignment?.moon && (
                                <div className="bg-blue-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                                    <span className="text-blue-400 mr-1">☽</span> 
                                    <span className="text-blue-100">Moon in {currentPlanetaryAlignment.moon.sign}</span>
                                </div>
                            )}
                            
                            {currentLunarPhase && (
                                <div className="bg-blue-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                                    <span className="text-blue-400 mr-1">☽</span> 
                                    <span className="text-blue-100">{currentLunarPhase}</span>
                                </div>
                            )}
                            
                            {isDaytime !== undefined && (
                                <div className="bg-purple-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                                    <Clock className="w-3 h-3 mr-1 text-purple-400" />
                                    <span className="text-purple-100">{isDaytime ? 'Daytime' : 'Nighttime'}</span>
                                </div>
                            )}
                            
                            {currentSeason && (
                                <div className="bg-green-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                                    <Leaf className="w-3 h-3 mr-1 text-green-400" />
                                    <span className="text-green-100">{currentSeason}</span>
                                </div>
                            )}
                            
                            {currentZodiac && (
                                <div className="bg-purple-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                                    <Star className="w-3 h-3 mr-1 text-purple-400" />
                                    <span className="text-purple-100">{currentZodiac}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {transformedIngredients.length === 0 ? (
                        <div className="bg-purple-900 bg-opacity-20 p-4 rounded">
                            <p className="text-purple-300">No recommended ingredients found for the current planetary alignment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {transformedIngredients.map((ingredient, index) => (
                                <div key={index} className="bg-opacity-20 bg-purple-900 rounded-lg p-4 hover:bg-opacity-30 transition-all">
                                    <h4 className="font-medium text-white capitalize">{ingredient.name.replace('_', ' ')}</h4>
                                    
                                    {ingredient.category && (
                                        <div className="text-xs text-gray-400 mb-2">{ingredient.category}</div>
                                    )}
                                    
                                    {/* Tarot Affinity Badge */}
                                    {ingredient.tarotMajorAffinity && ingredient.tarotMajorAffinity.includes('Ace') && (
                                        <div className="flex items-center mb-2">
                                            <div className="bg-purple-900 bg-opacity-30 px-2 py-0.5 rounded-full text-purple-200 text-xs flex items-center">
                                                <Star className="w-3 h-3 mr-1 text-purple-400" />
                                                <span>
                                                    {TAROT_CARDS[ingredient.tarotMajorAffinity].energyState} Boost: 
                                                    {safelyFormatNumber(
                                                        (tarotEnergyBoosts?.[TAROT_CARDS[ingredient.tarotMajorAffinity].energyState] || 1) * 100
                                                    )}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Planetary Boost Badge */}
                                    {ingredient.planetaryBoost > 1.0 && (
                                        <div className="flex items-center mb-2">
                                            <div className="bg-yellow-900 bg-opacity-30 px-2 py-0.5 rounded-full text-yellow-200 text-xs flex items-center">
                                                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                                                <span>Celestial Boost: {((ingredient.planetaryBoost - 1) * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Elemental Properties with enhanced visualization */}
                                    <div className="mt-2 space-y-2">
                                        {Object.entries(ingredient.transformedElementalProperties || {})
                                            .sort(([_, a], [__, b]) => b - a) // Sort by value, highest first
                                            .map(([element, value]) => {
                                                // Convert raw values to a more meaningful representation
                                                // Instead of showing as percentages, represent as normalized strength (max 100%)
                                                const totalElements = Object.values(ingredient.transformedElementalProperties || {})
                                                    .reduce((sum, val) => sum + val, 0);
                                                
                                                // Calculate the relative strength (normalized to max 100%)
                                                const normalizedValue = totalElements > 0 
                                                    ? value / totalElements 
                                                    : 0;
                                                
                                                // Generate width based on normalized value for visual bar
                                                const width = `${Math.round(normalizedValue * 100)}%`;
                                                
                                                // Get color based on element
                                                const getElementColor = (elem: string) => {
                                                    switch(elem.toLowerCase()) {
                                                        case 'fire': return 'bg-orange-500';
                                                        case 'water': return 'bg-blue-500';
                                                        case 'earth': return 'bg-green-500';
                                                        case 'air': return 'bg-purple-500';
                                                        default: return 'bg-gray-500';
                                                    }
                                                };
                                                
                                                // Show tarot highlight for elements matching the tarot card
                                                const isTarotElement = minorCard && 
                                                    element.toLowerCase() === minorCard.element?.toLowerCase();
                                                
                                                return (
                                                    <div key={element} className="relative">
                                                        <div className="flex items-center text-xs justify-between mb-1">
                                                            <div className="flex items-center">
                                                                {getElementIcon(element)}
                                                                <span className={`ml-1 ${isTarotElement ? 'text-yellow-300 font-medium' : 'text-gray-300'}`}>
                                                                    {element}
                                                                    {isTarotElement && ' ✧'}
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-400">{safelyFormatNumber(normalizedValue * 100)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                            <div 
                                                                className={`${getElementColor(element)} h-1.5 rounded-full`} 
                                                                style={{ width }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                    
                                    {/* Alchemical Property Badge */}
                                    {ingredient.dominantAlchemicalProperty && (
                                        <div className="mt-3 flex items-center text-xs">
                                            <span className="mr-1">{getAlchemicalPropertyIcon(ingredient.dominantAlchemicalProperty)}</span>
                                            <span className="bg-yellow-900 bg-opacity-30 px-2 py-0.5 rounded-full text-yellow-200">
                                                {ingredient.dominantAlchemicalProperty}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Energy Values with better visualization */}
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        <div className="text-xs">
                                            <span className="block text-gray-500 mb-1">Heat</span>
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-800 rounded-full h-1.5 mr-2">
                                                    <div 
                                                        className="bg-red-500 h-1.5 rounded-full" 
                                                        style={{ width: `${Math.min(100, Math.max(0, Math.round((ingredient.heat || 0) * 100)))}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-gray-400">{safelyFormatNumber(ingredient.heat)}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs">
                                            <span className="block text-gray-500 mb-1">Entropy</span>
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-800 rounded-full h-1.5 mr-2">
                                                    <div 
                                                        className="bg-blue-500 h-1.5 rounded-full" 
                                                        style={{ width: `${Math.min(100, Math.max(0, Math.round((ingredient.entropy || 0) * 100)))}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-gray-400">{safelyFormatNumber(ingredient.entropy)}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs">
                                            <span className="block text-gray-500 mb-1">Energy</span>
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-800 rounded-full h-1.5 mr-2">
                                                    <div 
                                                        className="bg-purple-500 h-1.5 rounded-full" 
                                                        style={{ width: `${Math.min(100, Math.max(0, Math.round((ingredient.gregsEnergy || 0) * 100)))}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-gray-400">{safelyFormatNumber(ingredient.gregsEnergy)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Show dominant planets with dignities */}
                                    {ingredient.dominantPlanets && ingredient.dominantPlanets.length > 0 && (
                                        <div className="mt-3">
                                            <span className="text-xs text-gray-500 mb-1 block">Planetary Influence:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {ingredient.dominantPlanets.map((planet, idx) => {
                                                    const planetName = planet.split(' ')[0]; // Handle "Moon (Full Moon)" format
                                                    const dignity = ingredient.planetaryDignities?.[planetName];
                                                    const isTarotPlanet = majorCard && 
                                                        planetName === majorCard.planet;
                                                    
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`bg-gray-800 bg-opacity-50 px-2 py-0.5 rounded-full text-xs flex items-center ${isTarotPlanet ? 'border border-yellow-500' : ''}`}
                                                        >
                                                            <Star className={`w-3 h-3 mr-1 ${dignity ? getDignityColor(dignity) : 'text-yellow-400'}`} />
                                                            <span className={`text-gray-200 ${isTarotPlanet ? 'text-yellow-200' : ''}`}>
                                                                {planet}
                                                                {isTarotPlanet && ' ✧'}
                                                            </span>
                                                            {dignity && (
                                                                <span className={`ml-1 ${getDignityColor(dignity)}`}>
                                                                    ({dignity})
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Show ruling planets */}
                                    {ingredient.astrologicalProfile?.rulingPlanets && (
                                        <p className="text-xs text-gray-400 mb-1 mt-3">
                                            <span className="text-gray-500">Planets:</span> {ingredient.astrologicalProfile.rulingPlanets.join(', ')}
                                        </p>
                                    )}
                                    
                                    {/* Show qualities */}
                                    {ingredient.qualities && ingredient.qualities.length > 0 && (
                                        <p className="text-xs italic text-gray-400 mt-1">
                                            {ingredient.qualities.join(', ')}
                                        </p>
                                    )}

                                    {/* Add this to the ingredient display section */}
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        <div className="text-xs">
                                            <span className="block text-gray-500 mb-1">Spirit</span>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                <div className="bg-purple-500 h-1.5 rounded-full" 
                                                     style={{ width: `${Math.round((ingredient.alchemicalProperties?.Spirit || 0) * 100)}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-xs">
                                            <span className="block text-gray-500 mb-1">Essence</span>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                <div className="bg-blue-500 h-1.5 rounded-full" 
                                                     style={{ width: `${Math.round((ingredient.alchemicalProperties?.Essence || 0) * 100)}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-xs">
                                            <span className="block text-gray-500 mb-1">Matter</span>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                <div className="bg-green-500 h-1.5 rounded-full" 
                                                     style={{ width: `${Math.round((ingredient.alchemicalProperties?.Matter || 0) * 100)}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-xs">
                                            <span className="block text-gray-500 mb-1">Substance</span>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                <div className="bg-yellow-500 h-1.5 rounded-full" 
                                                     style={{ width: `${Math.round((ingredient.alchemicalProperties?.Substance || 0) * 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FoodRecommender;