// src/components/recipe/RecipeCard.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './RecipeCard.module.css';

interface Ingredient {
    name: string;
    amount: string;
    unit: string;
    category: string;
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
    nutrition?: Nutrition;
    timeToMake: string;
    season?: string[];
    mealType?: string[];
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

    return (
        <motion.div 
            className={`${styles.recipeCard} ${isExpanded ? styles.expanded : ''}`}
            layout
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

                {isExpanded && (
                    <motion.div 
                        className={styles.details}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className={styles.description}>
                            <p>{recipe.description}</p>
                        </div>

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
                                            {ingredient.amount} {ingredient.unit}
                                        </span>
                                        <span className={styles.ingredientName}>
                                            {ingredient.name}
                                        </span>
                                        <span className={styles.category}>
                                            ({ingredient.category})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default RecipeCard;