// src/components/recipe/RecipeCard.tsx

'use client';

import React from 'react';
import { getTimeFactors } from '@/types/time';
import styles from './RecipeCard.module.css';

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
    const timeFactors = React.useMemo(() => getTimeFactors(), []);

    // Check if current planetary day/hour is favorable/unfavorable
    const planetaryDayInfluence = React.useMemo(() => {
        if (!recipe.planetaryInfluences || !recipe.planetaryInfluences.favorable || !recipe.planetaryInfluences.unfavorable) return null;

        const isFavorable = recipe.planetaryInfluences.favorable.includes(timeFactors.planetaryDay.planet);
        const isUnfavorable = recipe.planetaryInfluences.unfavorable.includes(timeFactors.planetaryDay.planet);
        
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
                            <span>🌱 {recipe.season.join(", ")}</span>
                        )}
                        {recipe.mealType && (
                            <span>🍽 {recipe.mealType.join(", ")}</span>
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
                                            <span key={i} className={`${styles.spiceDot} ${i < recipe.spiceLevel ? styles.active : ''}`}>
                                                🌶️
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p>{recipe.spiceLevel}</p>
                                )}
                            </div>
                        )}

                        {/* Planetary Influences Section - Expanded view */}
                        {recipe.planetaryInfluences && (
                            <div className={styles.planetarySection}>
                                <h4 className={styles.sectionTitle}>Planetary Influences</h4>
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

                        <div className={styles.ingredientsSection}>
                            <h4 className={styles.sectionTitle}>Ingredients</h4>
                            <ul>
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index} className={styles.ingredient}>
                                        <span className={styles.amount}>
                                            {ingredient.amount.toString()} {ingredient.unit}
                                        </span>
                                        <span className={styles.ingredientName}>
                                            {ingredient.name}
                                        </span>
                                        {ingredient.category && (
                                            <span className={styles.category}>
                                                ({ingredient.category})
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Substitutions */}
                        {recipe.substitutions && recipe.substitutions.length > 0 && (
                            <div className={styles.substitutionsSection}>
                                <h4 className={styles.sectionTitle}>Suggested Substitutions</h4>
                                <ul className={styles.substitutionsList}>
                                    {recipe.substitutions.map((sub, index) => (
                                        <li key={index} className={styles.substitution}>
                                            <span className={styles.originalIngredient}>{sub.original}:</span>
                                            <span className={styles.alternatives}>{sub.alternatives.join(", ")}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Preparation Notes */}
                        {recipe.preparationNotes && (
                            <div className={styles.preparationNotesSection}>
                                <h4 className={styles.sectionTitle}>Preparation Notes</h4>
                                <p className={styles.preparationNotes}>{recipe.preparationNotes}</p>
                            </div>
                        )}

                        {/* Technical Tips */}
                        {recipe.technicalTips && recipe.technicalTips.length > 0 && (
                            <div className={styles.technicalTipsSection}>
                                <h4 className={styles.sectionTitle}>Technical Tips</h4>
                                <ul className={styles.tipsList}>
                                    {recipe.technicalTips.map((tip, index) => (
                                        <li key={index} className={styles.tip}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeCard;