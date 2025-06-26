"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainRecommendation = exports.getRecommendedRecipes = exports.calculateRecommendationScore = void 0;
const time_1 = require("../types/time");
// Elemental affinities - which elements go well together
const ELEMENTAL_AFFINITIES = { Fire: ['Fire', 'Air'],
    Earth: ['Earth', 'Water'],
    Air: ['Air', 'Fire'],
    Water: ['Water', 'Earth']
};
// Planetary affinities for cuisines
const PLANET_CUISINE_AFFINITIES = {
    Sun: ['Mediterranean', 'Italian', 'Spanish', 'Greek'],
    Moon: ['Asian', 'Japanese', 'Seafood'],
    Mercury: ['Fusion', 'Eclectic', 'Experimental'],
    Venus: ['French', 'Desserts', 'Romantic'],
    Mars: ['Spicy', 'Mexican', 'Indian', 'Thai'],
    Jupiter: ['American', 'German', 'Hearty', 'Rich'],
    Saturn: ['Traditional', 'Fermented', 'Preserved', 'Slow-cooked'],
    Uranus: ['Innovative', 'Fusion', 'Avant-garde'],
    Neptune: ['Ethereal', 'Seafood', 'Exotic'],
    Pluto: ['Intense', 'Transformative', 'Deep-flavored']
};
// Season to cuisine mapping
const SEASONAL_CUISINE_AFFINITIES = {
    spring: ['Mediterranean', 'Asian', 'Light', 'Fresh'],
    summer: ['Mexican', 'Greek', 'Indian', 'BBQ', 'Salads'],
    fall: ['American', 'German', 'Hearty', 'Spiced'],
    winter: ['Slow-cooked', 'Soup', 'Stew', 'Rich', 'Warming'],
    autumn: ['American', 'German', 'Hearty', 'Spiced'],
    all: ['Traditional', 'Balanced', 'Versatile', 'Adaptable'] // Add all season
};
// Weekday to cuisine mapping
const WEEKDAY_CUISINE_AFFINITIES = {
    Sunday: ['Traditional', 'Roast', 'Family Style'],
    Monday: ['Simple', 'Comfort', 'Easy'],
    Tuesday: ['Spicy', 'Quick', 'Energetic'],
    Wednesday: ['Variety', 'Fusion', 'Creative'],
    Thursday: ['Hearty', 'Abundant', 'Social'],
    Friday: ['Festive', 'Indulgent', 'Special'],
    Saturday: ['Complex', 'Experimental', 'Project Cooking']
};
// Helper function to check if recipe.tags is an array of strings
function hasTagsArray(recipe) {
    return Array.isArray(recipe.tags);
}
// Calculate elemental affinity score
function calculateElementalScore(recipeElement, userElement) {
    if (recipeElement === userElement)
        return 1;
    if (ELEMENTAL_AFFINITIES[userElement].includes(recipeElement))
        return 0.7;
    return 0.3;
}
// Calculate planetary affinity score
function calculatePlanetaryScore(recipe, planetName) {
    const cuisineAffinity = PLANET_CUISINE_AFFINITIES[planetName.toLowerCase()];
    if (!cuisineAffinity)
        return 0.3; // Return default if not found
    if (hasTagsArray(recipe) &&
        cuisineAffinity.some(cuisine => recipe.tags.includes(cuisine))) {
        return 1;
    }
    return 0.3;
}
// Calculate seasonal affinity score
function calculateSeasonalScore(recipe, _season) {
    const seasonalAffinity = SEASONAL_CUISINE_AFFINITIES[season];
    if (!seasonalAffinity)
        return 0.5; // Return default if not found
    if (hasTagsArray(recipe) &&
        seasonalAffinity.some(tag => recipe.tags.includes(tag))) {
        return 1;
    }
    // Check if recipe explicitly mentions seasons
    if (hasTagsArray(recipe) && recipe.tags.includes(season)) {
        return 1;
    }
    return 0.5;
}
// Calculate weekday affinity score
function calculateWeekdayScore(recipe, day) {
    const dayAffinity = WEEKDAY_CUISINE_AFFINITIES[day];
    if (!dayAffinity)
        return 0.5; // Return default if not found
    if (hasTagsArray(recipe) &&
        dayAffinity.some(tag => recipe.tags.includes(tag))) {
        return 1;
    }
    return 0.5;
}
// Calculate meal type appropriateness
function calculateMealTypeScore(recipe, mealType) {
    if (!recipe.mealType)
        return 0.5; // If recipe doesn't specify, assume medium match
    if (Array.isArray(recipe.mealType)) {
        if (recipe.mealType.includes(mealType) || recipe.mealType.includes('Anytime')) {
            return 1;
        }
        // Some meal types can work for others
        if (mealType === 'Lunch' && recipe.mealType.includes('Dinner'))
            return 0.7;
        if (mealType === 'Dinner' && recipe.mealType.includes('Lunch'))
            return 0.7;
    }
    else {
        if (recipe.mealType === mealType || recipe.mealType === 'Anytime') {
            return 1;
        }
        // Some meal types can work for others
        if (mealType === 'Lunch' && recipe.mealType === 'Dinner')
            return 0.7;
        if (mealType === 'Dinner' && recipe.mealType === 'Lunch')
            return 0.7;
    }
    return 0.3;
}
// Calculate Sun sign affinity - certain zodiac signs favor certain flavors/cuisines
function calculateZodiacScore(recipe, sunSign) {
    const zodiacAffinities = {
        'aries': ['Spicy', 'Bold', 'Quick'],
        'taurus': ['Rich', 'Indulgent', 'Traditional'],
        'gemini': ['Varied', 'Fusion', 'Surprising'],
        'cancer': ['Comfort', 'Home-style', 'Nurturing'],
        'leo': ['Luxurious', 'Showy', 'Bold'],
        'virgo': ['Healthy', 'Precise', 'Detailed'],
        'libra': ['Balanced', 'Beautiful', 'Elegant'],
        'scorpio': ['Intense', 'Complex', 'Powerful'],
        'sagittarius': ['Adventurous', 'Exotic', 'Foreign'],
        'capricorn': ['Traditional', 'Classic', 'Quality'],
        'aquarius': ['Unusual', 'Innovative', 'Unexpected'],
        'pisces': ['Ethereal', 'Delicate', 'Romantic']
    };
    const signAffinity = zodiacAffinities[sunSign];
    if (!signAffinity)
        return 0.5; // Return default if not found
    if (hasTagsArray(recipe) &&
        signAffinity.some(tag => recipe.tags.includes(tag))) {
        return 1;
    }
    return 0.5;
}
// Calculate total recommendation score
function calculateRecommendationScore(recipe, astroState, timeFactors) {
    // Cast to enhanced state for backward compatibility
    const astrologicalState = astroState;
    // Base score
    let score = 0;
    let factors = 0;
    // Elemental scores
    if (astrologicalState.dominantElement && recipe.element) {
        score += calculateElementalScore(recipe.element, astrologicalState.dominantElement) * 2;
        factors += 2;
    }
    // Planetary day score
    if (timeFactors.planetaryDay && timeFactors.planetaryDay.planet) {
        score += calculatePlanetaryScore(recipe, timeFactors.planetaryDay.planet) * 1.5;
        factors += 1.5;
    }
    // Planetary hour score
    if (timeFactors.planetaryHour && timeFactors.planetaryHour.planet) {
        score += calculatePlanetaryScore(recipe, timeFactors.planetaryHour.planet);
        factors += 1;
    }
    // Seasonal score
    score += calculateSeasonalScore(recipe, timeFactors.season) * 1.5;
    factors += 1.5;
    // Weekday score
    score += calculateWeekdayScore(recipe, timeFactors.weekDay);
    factors += 1;
    // Meal type score - Check if mealType exists in timeFactors
    const enhancedTimeFactors = timeFactors;
    if (enhancedTimeFactors.mealType) {
        score += calculateMealTypeScore(recipe, enhancedTimeFactors.mealType) * 2;
        factors += 2;
    }
    // Zodiac score
    if (astrologicalState.sunSign) {
        score += calculateZodiacScore(recipe, astrologicalState.sunSign);
        factors += 1;
    }
    // Normalize the score
    return score / factors;
}
exports.calculateRecommendationScore = calculateRecommendationScore;
// Get top recommended recipes
function getRecommendedRecipes(recipes, astroState, count = 3, timeFactors = (0, time_1.getTimeFactors)()) {
    // Cast to enhanced state for backward compatibility
    const astrologicalState = astroState;
    // Score all recipes
    const scoredRecipes = recipes.map(recipe => ({
        recipe,
        score: calculateRecommendationScore(recipe, astrologicalState, timeFactors)
    }));
    // Sort by score (highest first)
    scoredRecipes.sort((a, b) => b.score - a.score);
    // Return top N recipes
    return scoredRecipes.slice(0, count).map(item => item.recipe);
}
exports.getRecommendedRecipes = getRecommendedRecipes;
// Explain why a recipe was recommended
function explainRecommendation(recipe, astroState, timeFactors = (0, time_1.getTimeFactors)()) {
    // Cast to enhanced state for backward compatibility
    const astrologicalState = astroState;
    const reasons = [];
    // Check elemental affinity
    if (astrologicalState.dominantElement && recipe.element) {
        const elementalScore = calculateElementalScore(recipe.element, astrologicalState.dominantElement);
        if (elementalScore > 0.6) {
            reasons.push(`The ${recipe.element} energy of this dish harmonizes with your ${astrologicalState.dominantElement} elemental influence.`);
        }
    }
    // Check planetary day connection
    if (timeFactors.planetaryDay && timeFactors.planetaryDay.planet) {
        const dayPlanetScore = calculatePlanetaryScore(recipe, timeFactors.planetaryDay.planet);
        if (dayPlanetScore > 0.6) {
            reasons.push(`This recipe resonates with ${timeFactors.planetaryDay.planet}, the ruling planet of ${timeFactors.planetaryDay.day}.`);
        }
    }
    // Check meal type appropriateness
    const enhancedTimeFactors = timeFactors;
    if (enhancedTimeFactors.mealType) {
        const mealScore = calculateMealTypeScore(recipe, enhancedTimeFactors.mealType);
        if (mealScore > 0.6) {
            reasons.push(`This is an ideal choice for ${enhancedTimeFactors.mealType.toLowerCase()} during the ${timeFactors.timeOfDay.toLowerCase()}.`);
        }
    }
    // Check seasonal harmony
    const seasonScore = calculateSeasonalScore(recipe, timeFactors.season);
    if (seasonScore > 0.6) {
        reasons.push(`The ingredients and flavors are perfectly in tune with ${timeFactors.season}.`);
    }
    // Check zodiac connection
    if (astrologicalState.sunSign) {
        const zodiacScore = calculateZodiacScore(recipe, astrologicalState.sunSign);
        if (zodiacScore > 0.6) {
            reasons.push(`This dish appeals to your ${astrologicalState.sunSign} nature.`);
        }
    }
    // If we have dominant planets
    if (astrologicalState.dominantPlanets && astrologicalState.dominantPlanets.length > 0) {
        for (const dominantPlanet of astrologicalState.dominantPlanets) {
            const planetScore = calculatePlanetaryScore(recipe, dominantPlanet.name);
            if (planetScore > 0.6) {
                reasons.push(`The influence of ${dominantPlanet.name} in your chart is complemented by this recipe.`);
                break; // Just mention one planet to avoid repetition
            }
        }
    }
    // Return concatenated reasons or default message
    return reasons.length > 0
        ? reasons.join(' ')
        : 'This recipe aligns with your current astrological and temporal state.';
}
exports.explainRecommendation = explainRecommendation;
