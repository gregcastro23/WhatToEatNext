// src / (components || 1)/recipe / (RecipeCard || 1).tsx

'use client';

import React, { useEffect, useState } from 'react';
import { getTimeFactors } from '@/utils/time';
import styles from './RecipeCard.module.css';
import { Flame, Droplets, Mountain, Wind } from 'lucide-react';
import cuisinesMap from '@/data/cuisines/index';

// Add missing type definitions
type ViewOption = 'grid' | 'list' | 'compact';
type ElementalFilter = 'Fire' | 'Water' | 'Earth' | 'Air' | 'none';

interface Ingredient {
    name: string;
    amount: number;
    unit: string;
    category?: string;
    preparation?: string;
    optional?: boolean;
}

interface Nutrition {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    vitamins?: string[];
    minerals?: string[];
}

interface Recipe {
    name: string;
    description: string;
    cuisine: string;
    regionalCuisine?: string;
    ingredients: Ingredient[];
    instructions: string[];
    nutrition?: Nutrition;
    timeToMake: string;
    season?: string[];
    mealType?: string[];
    elementalProperties?: {
        Fire: number;
        Water: number;
        Earth: number;
        Air: number;
        [key: string]: number;
    };
    // Astrological properties
    zodiacInfluences?: string[];
    lunarPhaseInfluences?: string[];
    astrologicalInfluences?: string[];
    planetaryInfluences?: {
        favorable: string[];   // Planet names that enhance this recipe
        unfavorable: string[]; // Planet names that diminish this recipe
    };
    // Standardized fields
    servingSize?: number;
    substitutions?: { original: string; alternatives: string[] }[];
    tools?: string[];
    spiceLevel?: number | 'mild' | 'medium' | 'hot' | 'very hot';
    preparationNotes?: string;
    technicalTips?: string[];
    cookingMethod?: string;
    cookingTechniques?: string[];
    cookingMethods?: string[];
    alchemicalScores?: {
        elementalScore: number;
        zodiacalScore: number;
        lunarScore: number;
        planetaryScore: number;
        seasonalScore: number;
    };
    matchScore?: number;
    // Additional culinary information
    culturalNotes?: string;
    pairingRecommendations?: {
        wines?: string[];
        beverages?: string[];
        sides?: string[];
        condiments?: string[];
    };
    traditionalOccasion?: string[];
    seasonalAdjustments?: string;
    origin?: string;
}

interface RegionalCuisine {
    name: string;
    description: string;
    signature?: string[];
    signatureDishes?: string[];
    keyIngredients?: string[];
    cookingTechniques?: string[];
    elementalProperties?: {
        Fire: number;
        Water: number;
        Earth: number;
        Air: number;
    };
    astrologicalInfluences?: string[];
}

interface CuisineData {
    id: string;
    name: string;
    description?: string;
    cookingTechniques?: string[];
    regionalCuisines?: Record<string, RegionalCuisine>;
    elementalProperties?: {
        Fire: number;
        Water: number;
        Earth: number;
        Air: number;
    };
    astrologicalInfluences?: string[];
    motherSauces?: Record<string, { description?: string } | any>;
    traditionalSauces?: Record<string, any>;
    sauceRecommender?: {
        forProtein?: Record<string, any>;
        forVegetable?: Record<string, any>;
        forCookingMethod?: Record<string, Record<string, any>>;
        byAstrological?: Record<string, any>;
        byRegion?: Record<string, any>;
        byDietary?: Record<string, any>;
    };
}

interface RecipeCardProps {
    recipe: Recipe;
    viewMode: ViewOption;
    elementalHighlight: ElementalFilter;
    matchPercentage: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
    recipe, 
    viewMode, 
    elementalHighlight,
    matchPercentage 
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [cuisineInfo, setCuisineInfo] = useState<CuisineData | null>(null);
    const [regionalInfo, setRegionalInfo] = useState<RegionalCuisine | null>(null);
    const timeFactors = React.useMemo(() => getTimeFactors(), []);

    // Fetch cuisine data when recipe changes or expands
    useEffect(() => {
        if (isExpanded && recipe.cuisine) {
            // Get cuisine info from cuisinesMap - try different case variants
            const cuisineName = recipe.cuisine;
            const cuisineKey = Object.keys(cuisinesMap).find(
                (key) => key.toLowerCase() === cuisineName.toLowerCase()
            );
            
            if (cuisineKey && cuisinesMap[cuisineKey]) {
                setCuisineInfo(cuisinesMap[cuisineKey]);
                
                // If there's a regional cuisine specified, find that info too
                if (recipe.regionalCuisine && cuisinesMap[cuisineKey].regionalCuisines) {
                    const regionalKey = Object.keys(cuisinesMap[cuisineKey].regionalCuisines).find(
                        (key) => key.toLowerCase() === recipe.regionalCuisine?.toLowerCase()
                    );
                    
                    if (regionalKey) {
                        setRegionalInfo(cuisinesMap[cuisineKey].regionalCuisines[regionalKey]);
                    } else {
                        setRegionalInfo(null);
                    }
                } else {
                    setRegionalInfo(null);
                }
            } else {
                setCuisineInfo(null);
                setRegionalInfo(null);
            }
        }
    }, [isExpanded, recipe.cuisine, recipe.regionalCuisine]);

    // Check if current planetary day / (hour || 1) is favorable / (unfavorable || 1)
    const planetaryDayInfluence = React.useMemo(() => {
        if (!recipe.planetaryInfluences || !recipe.planetaryInfluences.favorable || !recipe.planetaryInfluences.unfavorable) return null;

        let isFavorable = recipe.planetaryInfluences.favorable.includes(timeFactors.planetaryDay.planet);
        let isUnfavorable = recipe.planetaryInfluences.unfavorable.includes(timeFactors.planetaryDay.planet);
        
        return { 
            planet: timeFactors.planetaryDay.planet,
            day: timeFactors.planetaryDay.day,
            isFavorable, 
            isUnfavorable 
        };
    }, [recipe.planetaryInfluences, timeFactors.planetaryDay]);

    // Check planetary hour influence
    const planetaryHourInfluence = React.useMemo(() => {
        if (!recipe.planetaryInfluences || !recipe.planetaryInfluences.favorable || !recipe.planetaryInfluences.unfavorable) return null;

        const isFavorable = recipe.planetaryInfluences.favorable.includes(timeFactors.planetaryHour.planet);
        const isUnfavorable = recipe.planetaryInfluences.unfavorable.includes(timeFactors.planetaryHour.planet);
        
        return { 
            planet: timeFactors.planetaryHour.planet,
            hourOfDay: timeFactors.planetaryHour.hourOfDay,
            isFavorable, 
            isUnfavorable 
        };
    }, [recipe.planetaryInfluences, timeFactors.planetaryHour]);

    // Helper to get element icon
    const getElementIcon = (element: string) => {
        switch (element) {
            case 'Fire':
                return <Flame className="w-4 h-4 text-red-500" />;
            case 'Water':
                return <Droplets className="w-4 h-4 text-blue-500" />;
            case 'Earth':
                return <Mountain className="w-4 h-4 text-green-500" />;
            case 'Air':
                return <Wind className="w-4 h-4 text-purple-500" />;
            default:
                return null;
        }
    };

    // Helper to get element color class
    const getElementColorClass = (element: string) => {
        switch (element) {
            case 'Fire':
                return 'bg-red-500';
            case 'Water':
                return 'bg-blue-500';
            case 'Earth':
                return 'bg-green-500';
            case 'Air':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div 
            className={`${styles.recipeCard} ${isExpanded ? styles.expanded : ''} transition-all duration-300`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{recipe.name}</h3>
                    <div className={styles.matchScore}>
                        <span className={`${styles.matchPercentage} ${
                            matchPercentage > 70 ? styles.highMatch :
                            matchPercentage > 40 ? styles.mediumMatch :
                            styles.lowMatch
                        }`}>
                            {matchPercentage}% Match
                        </span>
                    </div>
                </div>

                <div className={styles.basicInfo}>
                    <div className={styles.timeInfo}>
                        <span>🕒 {recipe.timeToMake}</span>
                    </div>
                    <div className={styles.moreInfo}>
                        {recipe.season && (
                            <span>🌱 {Array.isArray(recipe.season) ? recipe.season.join(", ") : recipe.season}</span>
                        )}
                        {recipe.mealType && (
                            <span>🍽 {Array.isArray(recipe.mealType) ? recipe.mealType.join(", ") : recipe.mealType}</span>
                        )}
                    </div>
                </div>

                {/* Planetary Influences Badges - Always visible */}
                {(planetaryDayInfluence || planetaryHourInfluence) && (
                    <div className={styles.planetaryBadges}>
                        {planetaryDayInfluence && (
                            <span className={`${styles.planetaryBadge} ${
                                planetaryDayInfluence.isFavorable ? styles.favorablePlanet :
                                planetaryDayInfluence.isUnfavorable ? styles.unfavorablePlanet :
                                ''
                            }`}>
                                {planetaryDayInfluence.planet} Day
                                {planetaryDayInfluence.isFavorable && ' ✓'}
                                {planetaryDayInfluence.isUnfavorable && ' ✗'}
                            </span>
                        )}
                        {planetaryHourInfluence && (
                            <span className={`${styles.planetaryBadge} ${
                                planetaryHourInfluence.isFavorable ? styles.favorablePlanet :
                                planetaryHourInfluence.isUnfavorable ? styles.unfavorablePlanet :
                                ''
                            }`}>
                                {planetaryHourInfluence.planet} Hour
                                {planetaryHourInfluence.isFavorable && ' ✓'}
                                {planetaryHourInfluence.isUnfavorable && ' ✗'}
                            </span>
                        )}
                    </div>
                )}

                {isExpanded && (
                    <div 
                        className={`${styles.details} animate-fade-in`}
                    >
                        <div className={styles.description}>
                            <p>{recipe.description}</p>
                        </div>

                        {/* Cuisine Information Section */}
                        <div className={styles.cuisineSection}>
                            <h4 className={styles.sectionTitle}>Cuisine</h4>
                            <div className={styles.cuisineInfo}>
                                <div className={styles.cuisineName}>
                                    <strong>{recipe.cuisine}</strong>
                                    {recipe.regionalCuisine && (
                                        <span> ({recipe.regionalCuisine})</span>
                                    )}
                                </div>
                                
                                {cuisineInfo?.description && (
                                    <p className={styles.cuisineDescription}>{cuisineInfo.description}</p>
                                )}
                                
                                {regionalInfo?.description && (
                                    <div className={styles.regionalInfo}>
                                        <h5>Regional Variation: {regionalInfo.name}</h5>
                                        <p>{regionalInfo.description}</p>
                                        
                                        {regionalInfo.keyIngredients && regionalInfo.keyIngredients.length > 0 && (
                                            <div className={styles.keyIngredients}>
                                                <span className="font-medium">Key Ingredients: </span>
                                                <span>{regionalInfo.keyIngredients.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Culinary Profile Section - New section showcasing cuisine-specific context */}
                        <div className={styles.culinaryProfileSection}>
                            <h4 className={styles.sectionTitle}>Culinary Profile</h4>
                            <div className={styles.culinaryProfileGrid}>
                                {/* Traditional Techniques from this cuisine */}
                                {cuisineInfo?.cookingTechniques && cuisineInfo.cookingTechniques.length > 0 && (
                                    <div className={styles.profileItem}>
                                        <h5 className={styles.profileLabel}>Traditional Techniques</h5>
                                        <div className={styles.techniqueList}>
                                            {cuisineInfo.cookingTechniques
                                                .filter(technique => 
                                                    !(recipe.cookingTechniques || []).includes(technique) && 
                                                    !(recipe.cookingMethods || []).includes(technique)
                                                )
                                                .slice(0, 5)
                                                .map((technique, index) => (
                                                    <span key={index} className={styles.techniqueBadge}>
                                                        {technique}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Mother Sauces if available (especially for French cuisine) */}
                                {cuisineInfo?.motherSauces && Object.keys(cuisineInfo.motherSauces).length > 0 && (
                                    <div className={styles.profileItem}>
                                        <h5 className={styles.profileLabel}>Mother Sauces</h5>
                                        <div className={styles.sauceList}>
                                            {Object.entries(cuisineInfo.motherSauces)
                                                .slice(0, 3)
                                                .map(([sauceName, sauceDetails], index) => (
                                                    <div key={index} className={styles.sauceItem}>
                                                        <span className={styles.sauceName}>{sauceName}</span>
                                                        {typeof sauceDetails === 'object' && sauceDetails.description && (
                                                            <span className={styles.sauceDescription}>
                                                                {sauceDetails.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            }
                                            {Object.keys(cuisineInfo.motherSauces).length > 3 && (
                                                <span className={styles.moreIndicator}>+{Object.keys(cuisineInfo.motherSauces).length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Traditional Sauces that pair with this type of dish */}
                                {cuisineInfo?.traditionalSauces && Object.keys(cuisineInfo.traditionalSauces).length > 0 && (
                                    <div className={styles.profileItem}>
                                        <h5 className={styles.profileLabel}>Traditional Sauces</h5>
                                        <div className={styles.sauceList}>
                                            {Object.entries(cuisineInfo.traditionalSauces)
                                                .slice(0, 4)
                                                .map(([sauceName, sauceDetails], index) => (
                                                    <span key={index} className={styles.sauceTag}>
                                                        {sauceName}
                                                    </span>
                                                ))
                                            }
                                            {Object.keys(cuisineInfo.traditionalSauces).length > 4 && (
                                                <span className={styles.moreIndicator}>+{Object.keys(cuisineInfo.traditionalSauces).length - 4} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Sauce Recommendations for this specific dish type */}
                                {recipe.mealType && cuisineInfo?.sauceRecommender?.forCookingMethod && (
                                    <div className={styles.profileItem}>
                                        <h5 className={styles.profileLabel}>Recommended Sauces</h5>
                                        <div className={styles.sauceList}>
                                            {recipe.cookingMethod && cuisineInfo.sauceRecommender.forCookingMethod[recipe.cookingMethod] && (
                                                Object.entries(cuisineInfo.sauceRecommender.forCookingMethod[recipe.cookingMethod])
                                                    .slice(0, 3)
                                                    .map(([sauceName, suitability], index) => (
                                                        <span key={index} className={`${styles.sauceTag} ${Number(suitability) > 0.7 ? styles.highMatch : styles.mediumMatch}`}>
                                                            {sauceName}
                                                        </span>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Regional Variations if available */}
                                {cuisineInfo?.regionalCuisines && Object.keys(cuisineInfo.regionalCuisines).length > 0 && !regionalInfo && (
                                    <div className={styles.profileItem}>
                                        <h5 className={styles.profileLabel}>Regional Variations</h5>
                                        <div className={styles.regionList}>
                                            {Object.entries(cuisineInfo.regionalCuisines)
                                                .slice(0, 3)
                                                .map(([regionName, regionData], index) => (
                                                    <span key={index} className={styles.regionTag}>
                                                        {regionData.name || regionName}
                                                    </span>
                                                ))
                                            }
                                            {Object.keys(cuisineInfo.regionalCuisines).length > 3 && (
                                                <span className={styles.moreIndicator}>+{Object.keys(cuisineInfo.regionalCuisines).length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Astrological Influences specific to the cuisine */}
                                {cuisineInfo?.astrologicalInfluences && cuisineInfo.astrologicalInfluences.length > 0 && (
                                    <div className={styles.profileItem}>
                                        <h5 className={styles.profileLabel}>Astrological Associations</h5>
                                        <div className={styles.influenceList}>
                                            {cuisineInfo.astrologicalInfluences
                                                .filter(influence => 
                                                    !(recipe.astrologicalInfluences || []).includes(influence)
                                                )
                                                .slice(0, 3)
                                                .map((influence, index) => (
                                                    <span key={index} className={styles.influenceTag}>
                                                        {influence}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cooking Methods Section */}
                        <div className={styles.cookingMethodsSection}>
                            <h4 className={styles.sectionTitle}>Cooking Method</h4>
                            <div className={styles.cookingMethods}>
                                {recipe.cookingMethod && (
                                    <div className={styles.primaryMethod}>
                                        <span className="font-medium">Primary Method: </span>
                                        <span>{recipe.cookingMethod}</span>
                                    </div>
                                )}
                                
                                {(recipe.cookingTechniques || recipe.cookingMethods || cuisineInfo?.cookingTechniques) && (
                                    <div className={styles.techniques}>
                                        <span className="font-medium">Techniques: </span>
                                        <span>
                                            {[
                                                ...(recipe.cookingTechniques || []),
                                                ...(recipe.cookingMethods || []),
                                                ...(cuisineInfo?.cookingTechniques || [])
                                            ].filter((technique, index, self) => 
                                                self.indexOf(technique) === index
                                            ).join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Serving Size */}
                        {recipe.servingSize && (
                            <div className={styles.servingInfo}>
                                <h4 className={styles.sectionTitle}>Serves</h4>
                                <p>{recipe.servingSize} {recipe.servingSize === 1 ? 'person' : 'people'}</p>
                            </div>
                        )}

                        {/* Spice Level */}
                        {recipe.spiceLevel && (
                            <div className={styles.spiceLevelInfo}>
                                <h4 className={styles.sectionTitle}>Spice Level</h4>
                                {typeof recipe.spiceLevel === 'number' ? (
                                    <div className={styles.spiceIndicator}>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`${styles.spiceDot} ${typeof recipe.spiceLevel === 'number' && i < recipe.spiceLevel ? styles.active : ''}`}>
                                                🌶️
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p>{recipe.spiceLevel}</p>
                                )}
                            </div>
                        )}

                        {/* Enhanced Elemental Properties */}
                        {recipe.elementalProperties && (
                            <div className={styles.elementalSection}>
                                <h4 className={styles.sectionTitle}>Elemental Properties</h4>
                                <div className={styles.elementalGrid}>
                                    {Object.entries(recipe.elementalProperties)
                                        .sort(([, valueA], [, valueB]) => valueB - valueA)
                                        .map(([element, value]) => (
                                            <div key={element} className={styles.elementalProperty}>
                                                <div className={`${styles.elementalIcon} ${getElementColorClass(element)}`}>
                                                    {getElementIcon(element)}
                                                </div>
                                                <div>
                                                    <div className={styles.elementName}>{element}</div>
                                                    <div className={styles.elementBar}>
                                                        <div 
                                                            className={`${styles.elementFill} ${getElementColorClass(element)}`}
                                                            style={{ width: `${value * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className={styles.elementValue}>{Math.round(value * 100)}%</div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Enhanced Astrological Information */}
                        <div className={styles.astrologicalSection}>
                            <h4 className={styles.sectionTitle}>Astrological Influences</h4>
                            
                            {/* Display zodiac influences */}
                            {recipe.zodiacInfluences && recipe.zodiacInfluences.length > 0 && (
                                <div className={styles.zodiacInfluences}>
                                    <h5>Zodiac Influences</h5>
                                    <div className={styles.influencesList}>
                                        {recipe.zodiacInfluences.map((sign, index) => (
                                            <span key={index} className={styles.influenceTag}>
                                                {sign}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Display lunar phase influences */}
                            {recipe.lunarPhaseInfluences && recipe.lunarPhaseInfluences.length > 0 && (
                                <div className={styles.lunarInfluences}>
                                    <h5>Lunar Influences</h5>
                                    <div className={styles.influencesList}>
                                        {recipe.lunarPhaseInfluences.map((phase, index) => (
                                            <span key={index} className={styles.influenceTag}>
                                                {phase}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Display other astrological influences */}
                            {recipe.astrologicalInfluences && recipe.astrologicalInfluences.length > 0 && (
                                <div className={styles.generalInfluences}>
                                    <h5>Other Influences</h5>
                                    <div className={styles.influencesList}>
                                        {recipe.astrologicalInfluences.map((influence, index) => (
                                            <span key={index} className={styles.influenceTag}>
                                                {influence}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Planetary Influences Section - Expanded view */}
                            {recipe.planetaryInfluences && (
                                <div className={styles.planetaryInfluences}>
                                    <h5>Planetary Influences</h5>
                                    <div className={styles.planetaryGrid}>
                                        {recipe.planetaryInfluences.favorable.length > 0 && (
                                            <div className={styles.favorable}>
                                                <span>Favorable:</span>
                                                <span>{recipe.planetaryInfluences.favorable.join(", ")}</span>
                                            </div>
                                        )}
                                        {recipe.planetaryInfluences.unfavorable.length > 0 && (
                                            <div className={styles.unfavorable}>
                                                <span>Unfavorable:</span>
                                                <span>{recipe.planetaryInfluences.unfavorable.join(", ")}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.currentInfluences}>
                                        <p className={styles.currentTimeLabel}>Current Time Influences:</p>
                                        <div className={styles.timeInfluenceDetails}>
                                            <span>{timeFactors.planetaryDay.day}: {timeFactors.planetaryDay.planet}</span>
                                            <span>Hour: {timeFactors.planetaryHour.planet}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Alchemical Scores if available */}
                        {recipe.alchemicalScores && (
                            <div className={styles.alchemicalScoresSection}>
                                <h4 className={styles.sectionTitle}>Alchemical Scores</h4>
                                <div className={styles.scoresGrid}>
                                    {Object.entries(recipe.alchemicalScores).map(([scoreName, value]) => (
                                        <div key={scoreName} className={styles.scoreItem}>
                                            <span className={styles.scoreName}>
                                                {scoreName.replace(/Score$/, '').replace(/^./, c => c.toUpperCase())}:
                                            </span>
                                            <div className={styles.scoreBar}>
                                                <div 
                                                    className={styles.scoreFill}
                                                    style={{ 
                                                        width: `${value * 100}%`,
                                                        backgroundColor: 
                                                            value > 0.7 ? '#22c55e' : 
                                                            value > 0.4 ? '#eab308' : 
                                                            '#ef4444'
                                                    }}
                                                ></div>
                                            </div>
                                            <span className={styles.scoreValue}>{Math.round(value * 100)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.ingredientsSection}>
                            <h4 className={styles.sectionTitle}>Ingredients</h4>
                            <ul>
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index} className={styles.ingredient}>
                                        <span className={styles.amount}>
                                            {typeof ingredient.amount === 'number' ? ingredient.amount.toString() : ingredient.amount} {ingredient.unit}
                                        </span>
                                        <span className={styles.ingredientName}>
                                            {ingredient.name}
                                        </span>
                                        {ingredient.category && (
                                            <span className={styles.category}>
                                                ({ingredient.category})
                                            </span>
                                        )}
                                        {ingredient.preparation && (
                                            <span className={styles.preparation}>
                                                , {ingredient.preparation}
                                            </span>
                                        )}
                                        {ingredient.optional && (
                                            <span className={styles.optional}> (optional)</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Substitutions - Moved closer to ingredients for better context */}
                        {recipe.substitutions && recipe.substitutions.length > 0 && (
                            <div className={styles.substitutionsSection}>
                                <h4 className={styles.sectionTitle}>Ingredient Substitutions</h4>
                                <ul className={styles.substitutionsList}>
                                    {recipe.substitutions.map((sub, index) => (
                                        <li key={index} className={styles.substitution}>
                                            <div className={styles.substitutionHeader}>
                                                <span className={styles.originalIngredient}>{sub.original}</span>
                                                <span className={styles.substitutionArrow}>→</span>
                                            </div>
                                            <div className={styles.alternativesList}>
                                                {sub.alternatives.map((alt, altIndex) => (
                                                    <span key={altIndex} className={styles.alternativeItem}>
                                                        {alt}{altIndex < sub.alternatives.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Instructions Section */}
                        {recipe.instructions && recipe.instructions.length > 0 && (
                            <div className={styles.instructionsSection}>
                                <h4 className={styles.sectionTitle}>Instructions</h4>
                                <ol className={styles.instructionsList}>
                                    {recipe.instructions.map((instruction, index) => (
                                        <li key={index}>{instruction}</li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Culinary Notes Section - New comprehensive section */}
                        <div className={styles.culinaryNotesSection}>
                            <h4 className={styles.sectionTitle}>Culinary Notes</h4>
                            
                            {/* Preparation Notes */}
                            {recipe.preparationNotes && (
                                <div className={styles.prepNotesSubsection}>
                                    <h5 className={styles.culinarySubtitle}>Preparation Notes</h5>
                                    <p className={styles.preparationNotes}>{recipe.preparationNotes}</p>
                                </div>
                            )}

                            {/* Technical Tips */}
                            {recipe.technicalTips && recipe.technicalTips.length > 0 && (
                                <div className={styles.techTipsSubsection}>
                                    <h5 className={styles.culinarySubtitle}>Technical Tips</h5>
                                    <ul className={styles.tipsList}>
                                        {recipe.technicalTips.map((tip, index) => (
                                            <li key={index} className={styles.tip}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {/* Cultural Context */}
                            {recipe.culturalNotes && (
                                <div className={styles.culturalSubsection}>
                                    <h5 className={styles.culinarySubtitle}>Cultural Context</h5>
                                    <p className={styles.culturalNotes}>{recipe.culturalNotes}</p>
                                </div>
                            )}
                            
                            {/* Origin Information */}
                            {recipe.origin && (
                                <div className={styles.originSubsection}>
                                    <h5 className={styles.culinarySubtitle}>Origin</h5>
                                    <p className={styles.originInfo}>{recipe.origin}</p>
                                </div>
                            )}
                            
                            {/* Traditional Occasions */}
                            {recipe.traditionalOccasion && recipe.traditionalOccasion.length > 0 && (
                                <div className={styles.occasionSubsection}>
                                    <h5 className={styles.culinarySubtitle}>Traditional Occasions</h5>
                                    <div className={styles.occasionTags}>
                                        {recipe.traditionalOccasion.map((occasion, index) => (
                                            <span key={index} className={styles.occasionTag}>{occasion}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Seasonal Adjustments */}
                            {recipe.seasonalAdjustments && (
                                <div className={styles.seasonalSubsection}>
                                    <h5 className={styles.culinarySubtitle}>Seasonal Adjustments</h5>
                                    <p className={styles.seasonalNotes}>{recipe.seasonalAdjustments}</p>
                                </div>
                            )}
                            
                            {/* Pairing Recommendations */}
                            {recipe.pairingRecommendations && (
                                <div className={styles.pairingSubsection}>
                                    <h5 className={styles.culinarySubtitle}>Pairing Suggestions</h5>
                                    
                                    {recipe.pairingRecommendations.wines && recipe.pairingRecommendations.wines.length > 0 && (
                                        <div className={styles.pairingGroup}>
                                            <span className={styles.pairingLabel}>Wine:</span>
                                            <span className={styles.pairingItems}>{recipe.pairingRecommendations.wines.join(', ')}</span>
                                        </div>
                                    )}
                                    
                                    {recipe.pairingRecommendations.beverages && recipe.pairingRecommendations.beverages.length > 0 && (
                                        <div className={styles.pairingGroup}>
                                            <span className={styles.pairingLabel}>Beverages:</span>
                                            <span className={styles.pairingItems}>{recipe.pairingRecommendations.beverages.join(', ')}</span>
                                        </div>
                                    )}
                                    
                                    {recipe.pairingRecommendations.sides && recipe.pairingRecommendations.sides.length > 0 && (
                                        <div className={styles.pairingGroup}>
                                            <span className={styles.pairingLabel}>Side Dishes:</span>
                                            <span className={styles.pairingItems}>{recipe.pairingRecommendations.sides.join(', ')}</span>
                                        </div>
                                    )}
                                    
                                    {recipe.pairingRecommendations.condiments && recipe.pairingRecommendations.condiments.length > 0 && (
                                        <div className={styles.pairingGroup}>
                                            <span className={styles.pairingLabel}>Condiments:</span>
                                            <span className={styles.pairingItems}>{recipe.pairingRecommendations.condiments.join(', ')}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Required Tools */}
                        {recipe.tools && recipe.tools.length > 0 && (
                            <div className={styles.toolsSection}>
                                <h4 className={styles.sectionTitle}>Required Tools</h4>
                                <ul className={styles.toolsList}>
                                    {recipe.tools.map((tool, index) => (
                                        <li key={index}>{tool}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {recipe.nutrition && (
                            <div className={styles.nutritionalInfo}>
                                <h4 className={styles.sectionTitle}>Nutritional Information</h4>
                                <div className={styles.nutritionGrid}>
                                    {recipe.nutrition.calories !== undefined && (
                                        <div>
                                            <span>Calories</span>
                                            <strong>{recipe.nutrition.calories}</strong>
                                        </div>
                                    )}
                                    {recipe.nutrition.protein !== undefined && (
                                        <div>
                                            <span>Protein</span>
                                            <strong>{recipe.nutrition.protein}g</strong>
                                        </div>
                                    )}
                                    {recipe.nutrition.carbs !== undefined && (
                                        <div>
                                            <span>Carbs</span>
                                            <strong>{recipe.nutrition.carbs}g</strong>
                                        </div>
                                    )}
                                    {recipe.nutrition.fat !== undefined && (
                                        <div>
                                            <span>Fat</span>
                                            <strong>{recipe.nutrition.fat}g</strong>
                                        </div>
                                    )}
                                </div>
                                {(recipe.nutrition.vitamins || recipe.nutrition.minerals) && (
                                    <div className={styles.micronutrients}>
                                        {recipe.nutrition.vitamins && (
                                            <div>
                                                <span>Vitamins:</span>
                                                <span>{recipe.nutrition.vitamins.join(", ")}</span>
                                            </div>
                                        )}
                                        {recipe.nutrition.minerals && (
                                            <div>
                                                <span>Minerals:</span>
                                                <span>{recipe.nutrition.minerals.join(", ")}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeCard;