"use strict";
// ===== UNIFIED SEASONAL SYSTEM =====
// Phase 3 of WhatToEatNext Data Consolidation
// Consolidates seasonal.ts, seasonalPatterns.ts, and seasonalUsage.ts
// Integrates Monica constants and Kalchm values from the existing systems.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMajorArcanaForSeason = exports.getMinorArcanaForSeason = exports.getTarotRecommendationsForSeason = exports.getSeasonalUsageData = exports.getRecommendedCookingMethodByTarotCard = exports.getSeasonalIngredientsByTarotCard = exports.getTarotInfluenceForSeason = exports.seasonalUsage = exports.seasonalPatterns = exports.getSeasonalRecommendations = exports.isInSeason = exports.getSeasonalData = exports.getSeasonalScore = exports.getCurrentSeason = exports.unifiedSeasonalSystem = exports.UnifiedSeasonalSystem = exports.unifiedSeasonalProfiles = void 0;
const alchemicalPillars_js_1 = require("../../constants/alchemicalPillars.js");
const ingredients_js_1 = require("./ingredients.js");
// ===== CONSOLIDATED SEASONAL DATA =====
exports.unifiedSeasonalProfiles = {
    spring: {
        elementalDominance: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2
        },
        kalchmRange: { min: 0.8, max: 1.2 },
        monicaModifiers: {
            temperatureAdjustment: 10,
            timingAdjustment: -5,
            intensityModifier: 'increase',
            planetaryAlignment: 0.8,
            lunarPhaseBonus: 0.7
        },
        // Ingredient availability (from seasonalPatterns.ts)
        ingredients: {
            "asparagus": 0.9,
            "peas": 0.85,
            "artichokes": 0.82,
            "rhubarb": 0.78,
            "radishes": 0.75,
            "spring_greens": 0.92,
            "fava_beans": 0.8,
            "morels": 0.87,
            "strawberries": 0.7,
            "new_potatoes": 0.76
        },
        // Traditional usage (from seasonalUsage.ts)
        growing: ['basil', 'oregano', 'thyme'],
        herbs: ['mint', 'chives', 'parsley', 'dill'],
        vegetables: ['asparagus', 'peas', 'artichokes', 'spring onions'],
        cuisines: {
            'greek': {
                combinations: ['mint + parsley', 'dill + garlic'],
                dishes: ['spring lamb', 'fresh salads']
            },
            'italian': {
                combinations: ['basil + tomato', 'pea + mint'],
                dishes: ['primavera pasta', 'spring risotto']
            }
        },
        // Astrological profile (from seasonalUsage.ts)
        tarotProfile: {
            minorArcana: ['2 of Wands', '3 of Wands', '4 of Wands', '5 of Pentacles', '6 of Pentacles', '7 of Pentacles', '8 of Swords', '9 of Swords', '10 of Swords'],
            majorArcana: ['The Emperor', 'The Hierophant', 'The Lovers'],
            zodiacSigns: ['aries', 'taurus', 'gemini'],
            cookingRecommendations: [
                'Use energetic Fire elements (aries) for quick cooking methods like stir-frying and grilling',
                'Incorporate Earth elements (taurus) for grounding dishes with root vegetables',
                'Experiment with Air elements (gemini) for dishes with variety and contrast',
                'Balance bold flavors (2 of Wands) with fresh spring ingredients',
                'Consider fermentation and pickling for slower transformations (7 of Pentacles)'
            ],
            tarotInfluences: {
                "2_of_wands": {
                    element: "Fire",
                    effect: 0.85,
                    ingredients: ["radishes", "spring_greens"],
                    cookingMethod: "grilling"
                },
                "3_of_wands": {
                    element: "Fire",
                    effect: 0.8,
                    ingredients: ["asparagus", "morels"],
                    cookingMethod: "roasting"
                },
                "4_of_wands": {
                    element: "Fire",
                    effect: 0.75,
                    ingredients: ["strawberries", "new_potatoes"],
                    cookingMethod: "baking"
                },
                "5_of_pentacles": {
                    element: "Earth",
                    effect: 0.7,
                    ingredients: ["rhubarb", "fava_beans"],
                    cookingMethod: "simmering"
                },
                "dominant_element": "Fire",
                "secondary_element": "Air"
            },
            dominant_element: 'Fire',
            secondary_element: 'Air'
        },
        optimalIngredients: ['asparagus', 'spring_greens', 'morels', 'peas', 'artichokes'],
        optimalCookingMethods: ['grilling', 'roasting', 'sauteing', 'steaming'],
        elementalInfluence: 0.8
    },
    summer: {
        elementalDominance: { Fire: 0.5, Water: 0.3, Earth: 0.1, Air: 0.1
        },
        kalchmRange: { min: 0.8, max: 1.2 },
        monicaModifiers: {
            temperatureAdjustment: -15,
            timingAdjustment: -10,
            intensityModifier: 'decrease',
            planetaryAlignment: 0.9,
            lunarPhaseBonus: 0.8
        },
        ingredients: {
            "tomatoes": 0.9,
            "corn": 0.85,
            "peaches": 0.88,
            "watermelon": 0.92,
            "berries": 0.87,
            "summer_squash": 0.82,
            "eggplant": 0.79,
            "bell_peppers": 0.84,
            "cucumbers": 0.86,
            "cherries": 0.88
        },
        growing: ['basil', 'rosemary', 'cilantro'],
        herbs: ['basil', 'oregano', 'tarragon', 'cilantro'],
        vegetables: ['tomatoes', 'zucchini', 'eggplant', 'peppers'],
        cuisines: {
            'greek': {
                combinations: ['cucumber + mint', 'tomato + feta'],
                dishes: ['tzatziki', 'greek salad', 'souvlaki']
            },
            'italian': {
                combinations: ['tomato + basil', 'zucchini + mint'],
                dishes: ['caprese salad', 'summer pasta', 'grilled vegetables']
            }
        },
        tarotProfile: {
            minorArcana: ['2 of Cups', '3 of Cups', '4 of Cups', '5 of Wands', '6 of Wands', '7 of Wands', '8 of Pentacles', '9 of Pentacles', '10 of Pentacles'],
            majorArcana: ['The Chariot', 'Strength', 'The Hermit'],
            zodiacSigns: ['cancer', 'leo', 'virgo'],
            cookingRecommendations: [
                'Embrace Water elements (cancer) for emotional and nurturing dishes',
                'Use Fire elements (leo) for bold, vibrant cooking with strong flavors',
                'Incorporate Earth elements (virgo) for meticulous preparation and wholesome ingredients',
                'Create communal dishes that bring people together (3 of Cups)',
                'Showcase achievements with presentation-focused dishes (6 of Wands)',
                'Perfect cooking techniques with attention to detail (8 of Pentacles)'
            ],
            tarotInfluences: {
                "2_of_cups": {
                    element: "Water",
                    effect: 0.85,
                    ingredients: ["watermelon", "cucumbers"],
                    cookingMethod: "raw"
                },
                "3_of_cups": {
                    element: "Water",
                    effect: 0.9,
                    ingredients: ["berries", "peaches"],
                    cookingMethod: "fermenting"
                },
                "5_of_wands": {
                    element: "Fire",
                    effect: 0.85,
                    ingredients: ["tomatoes", "bell_peppers"],
                    cookingMethod: "grilling"
                },
                "6_of_wands": {
                    element: "Fire",
                    effect: 0.8,
                    ingredients: ["corn", "summer_squash"],
                    cookingMethod: "roasting"
                },
                "dominant_element": "Fire",
                "secondary_element": "Water"
            },
            dominant_element: 'Fire',
            secondary_element: 'Water'
        },
        optimalIngredients: ['tomatoes', 'watermelon', 'berries', 'peaches', 'cucumbers'],
        optimalCookingMethods: ['grilling', 'raw', 'fermenting', 'steaming'],
        elementalInfluence: 0.9
    },
    autumn: {
        elementalDominance: { Fire: 0.1, Water: 0.3, Earth: 0.4, Air: 0.2
        },
        kalchmRange: { min: 0.8, max: 1.2 },
        monicaModifiers: {
            temperatureAdjustment: 5,
            timingAdjustment: 10,
            intensityModifier: 'maintain',
            planetaryAlignment: 0.7,
            lunarPhaseBonus: 0.6
        },
        ingredients: {
            "apples": 0.9,
            "pumpkin": 0.95,
            "butternut_squash": 0.92,
            "sweet_potatoes": 0.87,
            "brussels_sprouts": 0.84,
            "cranberries": 0.82,
            "figs": 0.78,
            "grapes": 0.83,
            "mushrooms": 0.79,
            "pears": 0.88
        },
        growing: ['sage', 'rosemary', 'thyme'],
        herbs: ['sage', 'rosemary', 'thyme', 'bay leaf'],
        vegetables: ['pumpkin', 'squash', 'mushrooms', 'cauliflower'],
        cuisines: {
            'greek': {
                combinations: ['spinach + feta', 'lamb + herbs'],
                dishes: ['moussaka', 'stuffed peppers', 'roasted lamb']
            },
            'french': {
                combinations: ['mushroom + thyme', 'apple + cinnamon'],
                dishes: ['ratatouille', 'mushroom soup', 'apple tart']
            }
        },
        tarotProfile: {
            minorArcana: ['2 of Swords', '3 of Swords', '4 of Swords', '5 of Cups', '6 of Cups', '7 of Cups', '8 of Wands', '9 of Wands', '10 of Wands'],
            majorArcana: ['Justice', 'The Hanged Man', 'Death'],
            zodiacSigns: ['libra', 'scorpio', 'sagittarius'],
            cookingRecommendations: [
                'Balance Air elements (libra) with harmonious flavor combinations',
                'Use Water elements (scorpio) for deep, transformative dishes with complex flavors',
                'Incorporate Fire elements (sagittarius) for bold, exploratory cooking',
                'Find equilibrium in dish components (2 of Swords)',
                'Create nostalgic comfort food (6 of Cups)',
                'Balance workload with efficient meal preparation (10 of Wands)'
            ],
            tarotInfluences: {
                "2_of_swords": {
                    element: "Air",
                    effect: 0.7,
                    ingredients: ["apples", "pears"],
                    cookingMethod: "baking"
                },
                "5_of_cups": {
                    element: "Water",
                    effect: 0.75,
                    ingredients: ["cranberries", "figs"],
                    cookingMethod: "poaching"
                },
                "6_of_cups": {
                    element: "Water",
                    effect: 0.8,
                    ingredients: ["pumpkin", "sweet_potatoes"],
                    cookingMethod: "roasting"
                },
                "8_of_wands": {
                    element: "Fire",
                    effect: 0.65,
                    ingredients: ["grapes", "mushrooms"],
                    cookingMethod: "sauteing"
                },
                "dominant_element": "Earth",
                "secondary_element": "Water"
            },
            dominant_element: 'Earth',
            secondary_element: 'Water'
        },
        optimalIngredients: ['pumpkin', 'butternut_squash', 'apples', 'sweet_potatoes', 'pears'],
        optimalCookingMethods: ['roasting', 'baking', 'braising', 'poaching'],
        elementalInfluence: 0.7
    },
    fall: {
        elementalDominance: { Fire: 0.1, Water: 0.3, Earth: 0.4, Air: 0.2
        },
        kalchmRange: { min: 0.8, max: 1.2 },
        monicaModifiers: {
            temperatureAdjustment: 5,
            timingAdjustment: 10,
            intensityModifier: 'maintain',
            planetaryAlignment: 0.7,
            lunarPhaseBonus: 0.6
        },
        // Same as autumn (supporting both terms)
        ingredients: {
            "apples": 0.9,
            "pumpkin": 0.95,
            "butternut_squash": 0.92,
            "sweet_potatoes": 0.87,
            "brussels_sprouts": 0.84,
            "cranberries": 0.82,
            "figs": 0.78,
            "grapes": 0.83,
            "mushrooms": 0.79,
            "pears": 0.88
        },
        growing: ['sage', 'rosemary', 'thyme'],
        herbs: ['sage', 'rosemary', 'thyme', 'bay leaf'],
        vegetables: ['pumpkin', 'squash', 'mushrooms', 'cauliflower'],
        cuisines: {
            'greek': {
                combinations: ['spinach + feta', 'lamb + herbs'],
                dishes: ['moussaka', 'stuffed peppers', 'roasted lamb']
            },
            'french': {
                combinations: ['mushroom + thyme', 'apple + cinnamon'],
                dishes: ['ratatouille', 'mushroom soup', 'apple tart']
            }
        },
        tarotProfile: {
            minorArcana: ['2 of Swords', '3 of Swords', '4 of Swords', '5 of Cups', '6 of Cups', '7 of Cups', '8 of Wands', '9 of Wands', '10 of Wands'],
            majorArcana: ['Justice', 'The Hanged Man', 'Death'],
            zodiacSigns: ['libra', 'scorpio', 'sagittarius'],
            cookingRecommendations: [
                'Balance Air elements (libra) with harmonious flavor combinations',
                'Use Water elements (scorpio) for deep, transformative dishes with complex flavors',
                'Incorporate Fire elements (sagittarius) for bold, exploratory cooking',
                'Find equilibrium in dish components (2 of Swords)',
                'Create nostalgic comfort food (6 of Cups)',
                'Balance workload with efficient meal preparation (10 of Wands)'
            ],
            tarotInfluences: {
                "2_of_swords": {
                    element: "Air",
                    effect: 0.7,
                    ingredients: ["apples", "pears"],
                    cookingMethod: "baking"
                },
                "5_of_cups": {
                    element: "Water",
                    effect: 0.75,
                    ingredients: ["cranberries", "figs"],
                    cookingMethod: "poaching"
                },
                "6_of_cups": {
                    element: "Water",
                    effect: 0.8,
                    ingredients: ["pumpkin", "sweet_potatoes"],
                    cookingMethod: "roasting"
                },
                "8_of_wands": {
                    element: "Fire",
                    effect: 0.65,
                    ingredients: ["grapes", "mushrooms"],
                    cookingMethod: "sauteing"
                },
                "dominant_element": "Earth",
                "secondary_element": "Water"
            },
            dominant_element: 'Earth',
            secondary_element: 'Water'
        },
        optimalIngredients: ['pumpkin', 'butternut_squash', 'apples', 'sweet_potatoes', 'pears'],
        optimalCookingMethods: ['roasting', 'baking', 'braising', 'poaching'],
        elementalInfluence: 0.7
    },
    winter: {
        elementalDominance: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1
        },
        kalchmRange: { min: 0.8, max: 1.2 },
        monicaModifiers: {
            temperatureAdjustment: 20,
            timingAdjustment: 15,
            intensityModifier: 'increase',
            planetaryAlignment: 0.6,
            lunarPhaseBonus: 0.5
        },
        ingredients: {
            "citrus": 0.85,
            "kale": 0.8,
            "root_vegetables": 0.9,
            "pomegranates": 0.82,
            "winter_squash": 0.88,
            "persimmons": 0.76,
            "leeks": 0.79,
            "brussels_sprouts": 0.75,
            "turnips": 0.77,
            "cranberries": 0.72
        },
        growing: ['rosemary', 'thyme', 'sage'],
        herbs: ['rosemary', 'thyme', 'sage', 'bay leaf'],
        vegetables: ['kale', 'brussels sprouts', 'root vegetables', 'cabbage'],
        cuisines: {
            'greek': {
                combinations: ['lemon + oregano', 'olive + herb'],
                dishes: ['avgolemono soup', 'winter stews', 'baked fish']
            },
            'french': {
                combinations: ['thyme + red wine', 'rosemary + garlic'],
                dishes: ['beef bourguignon', 'cassoulet', 'onion soup']
            }
        },
        tarotProfile: {
            minorArcana: ['2 of Pentacles', '3 of Pentacles', '4 of Pentacles', '5 of Swords', '6 of Swords', '7 of Swords', '8 of Cups', '9 of Cups', '10 of Cups'],
            majorArcana: ['Temperance', 'The Devil', 'The Tower'],
            zodiacSigns: ['capricorn', 'aquarius', 'pisces'],
            cookingRecommendations: [
                'Embrace Earth elements (capricorn) for traditional and structured cooking',
                'Use Air elements (aquarius) for innovative and unconventional approaches',
                'Incorporate Water elements (pisces) for intuitive and fluid cooking styles',
                'Balance resources and manage ingredients efficiently (2 of Pentacles)',
                'Focus on collaborative cooking projects (3 of Pentacles)',
                'Create dishes that bring joy and fulfillment (9 of Cups, 10 of Cups)'
            ],
            tarotInfluences: {
                "2_of_pentacles": {
                    element: "Earth",
                    effect: 0.75,
                    ingredients: ["root_vegetables", "winter_squash"],
                    cookingMethod: "braising"
                },
                "3_of_pentacles": {
                    element: "Earth",
                    effect: 0.8,
                    ingredients: ["kale", "leeks"],
                    cookingMethod: "stewing"
                },
                "8_of_cups": {
                    element: "Water",
                    effect: 0.7,
                    ingredients: ["citrus", "pomegranates"],
                    cookingMethod: "poaching"
                },
                "9_of_cups": {
                    element: "Water",
                    effect: 0.85,
                    ingredients: ["persimmons", "cranberries"],
                    cookingMethod: "simmering"
                },
                "dominant_element": "Earth",
                "secondary_element": "Water"
            },
            dominant_element: 'Earth',
            secondary_element: 'Water'
        },
        optimalIngredients: ['root_vegetables', 'winter_squash', 'kale', 'citrus', 'pomegranates'],
        optimalCookingMethods: ['braising', 'stewing', 'roasting', 'simmering'],
        elementalInfluence: 0.6
    },
    all: {
        elementalDominance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        },
        kalchmRange: { min: 0.8, max: 1.2 },
        monicaModifiers: {
            temperatureAdjustment: 0,
            timingAdjustment: 0,
            intensityModifier: 'maintain',
            planetaryAlignment: 0.75,
            lunarPhaseBonus: 0.65
        },
        ingredients: {
            "onions": 0.9,
            "garlic": 0.95,
            "carrots": 0.85,
            "potatoes": 0.88,
            "herbs": 0.8
        },
        growing: ['basil', 'rosemary', 'thyme', 'sage', 'oregano'],
        herbs: ['parsley', 'thyme', 'rosemary', 'bay leaf', 'oregano'],
        vegetables: ['onions', 'garlic', 'carrots', 'potatoes'],
        cuisines: {
            'global': {
                combinations: ['garlic + herbs', 'lemon + herbs'],
                dishes: ['roasted meats', 'soups', 'stews']
            }
        },
        tarotProfile: {
            minorArcana: [
                'Ace of Wands', 'Ace of Cups', 'Ace of Swords', 'Ace of Pentacles',
                'Queen of Wands', 'Queen of Cups', 'Queen of Swords', 'Queen of Pentacles',
                'King of Wands', 'King of Cups', 'King of Swords', 'King of Pentacles'
            ],
            majorArcana: ['The Fool', 'The Magician', 'The High Priestess', 'The World'],
            zodiacSigns: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'],
            cookingRecommendations: [
                'Use the universal energy of the Aces for starting new culinary projects',
                'Balance all four elements (Fire, Water, Air, Earth) in year-round cooking',
                'Draw on the nurturing energy of the Queens for comforting dishes',
                'Use the mastery of the Kings for perfecting signature dishes',
                'Embrace the cyclical nature of The World for seasonal adaptations',
                'Trust intuition with High Priestess energy for experimental cooking'
            ],
            tarotInfluences: {
                "ace_of_wands": {
                    element: "Fire",
                    effect: 0.8,
                    ingredients: ["garlic", "herbs"],
                    cookingMethod: "sauteing"
                },
                "ace_of_cups": {
                    element: "Water",
                    effect: 0.8,
                    ingredients: ["onions", "carrots"],
                    cookingMethod: "simmering"
                },
                "ace_of_swords": {
                    element: "Air",
                    effect: 0.8,
                    ingredients: ["herbs", "potatoes"],
                    cookingMethod: "roasting"
                },
                "ace_of_pentacles": {
                    element: "Earth",
                    effect: 0.8,
                    ingredients: ["root_vegetables", "grains"],
                    cookingMethod: "baking"
                },
                "dominant_element": "Earth",
                "secondary_element": "Fire"
            },
            dominant_element: 'Earth',
            secondary_element: 'Fire'
        },
        optimalIngredients: ['garlic', 'onions', 'herbs', 'potatoes', 'carrots'],
        optimalCookingMethods: ['sauteing', 'roasting', 'simmering', 'baking'],
        elementalInfluence: 0.75
    }
};
// ===== UNIFIED SEASONAL SYSTEM CLASS =====
class UnifiedSeasonalSystem {
    constructor() {
        this.enhancedCookingMethods = (0, alchemicalPillars_js_1.getAllEnhancedCookingMethods)();
    }
    // ===== CORE SEASONAL FUNCTIONS =====
    /**
     * Get current season based on date
     */
    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4)
            return 'spring';
        if (month >= 5 && month <= 7)
            return 'summer';
        if (month >= 8 && month <= 10)
            return 'autumn';
        return 'winter';
    }
    /**
     * Get seasonal score for an ingredient in the current or specified season
     */
    getSeasonalScore(ingredientName, season = this.getCurrentSeason()) {
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        if (!seasonProfile)
            return 0.1;
        // Check if the ingredient exists in seasonal patterns
        if (seasonProfile.ingredients[ingredientName]) {
            return seasonProfile.ingredients[ingredientName];
        }
        // If ingredient is not found in the specific season, check if it's marked as 'all' seasons
        if (season !== 'all' && exports.unifiedSeasonalProfiles['all'].ingredients[ingredientName]) {
            return exports.unifiedSeasonalProfiles['all'].ingredients[ingredientName];
        }
        return 0.1; // Default low score if not found
    }
    /**
     * Get complete seasonal data for an ingredient with Kalchm integration
     */
    getSeasonalIngredientProfile(ingredientName, season = this.getCurrentSeason()) {
        const availability = this.getSeasonalScore(ingredientName, season);
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        // Get traditional use from seasonal usage data
        const traditionalUse = [];
        if (seasonProfile.growing.includes(ingredientName))
            traditionalUse.push('growing');
        if (seasonProfile.herbs.includes(ingredientName))
            traditionalUse.push('culinary herb');
        if (seasonProfile.vegetables.includes(ingredientName))
            traditionalUse.push('seasonal vegetable');
        // Get complementary flavors for the season (top scoring ingredients)
        const complementaryFlavors = Object.entries(seasonProfile.ingredients)
            .filter(([key, value]) => value > 0.7 && key !== ingredientName)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name]) => name);
        // Calculate Kalchm compatibility
        const unifiedIngredient = ingredients_js_1.unifiedIngredients[ingredientName];
        const kalchmCompatibility = unifiedIngredient
            ? this.calculateKalchmSeasonalCompatibility(unifiedIngredient.kalchm, season)
            : 0.5;
        // Calculate Monica resonance
        const monicaResonance = this.calculateMonicaSeasonalResonance(season, availability);
        return {
            availability,
            traditionalUse,
            complementaryFlavors,
            kalchmCompatibility,
            monicaResonance
        };
    }
    /**
     * Calculate Kalchm compatibility with seasonal range
     */
    calculateKalchmSeasonalCompatibility(ingredientKalchm, season) {
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        const { min, max } = seasonProfile.kalchmRange;
        // Perfect compatibility if within range
        if (ingredientKalchm >= min && ingredientKalchm <= max) {
            return 1.0;
        }
        // Calculate compatibility based on distance from range
        const distance = ingredientKalchm < min
            ? min - ingredientKalchm
            : ingredientKalchm - max;
        // Use exponential decay for compatibility (max distance of 0.5 gives 0.6 compatibility)
        return Math.max(0.1, Math.exp(-distance * 2));
    }
    /**
     * Calculate Monica resonance for seasonal cooking
     */
    calculateMonicaSeasonalResonance(season, availability) {
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        const baseResonance = seasonProfile.monicaModifiers.lunarPhaseBonus;
        // Higher availability increases Monica resonance
        return Math.min(1.0, baseResonance * (0.5 + availability * 0.5));
    }
    /**
     * Check if an ingredient is in season
     */
    isInSeason(ingredientName, threshold = 0.5) {
        const score = this.getSeasonalScore(ingredientName);
        return score >= threshold;
    }
    // ===== ENHANCED SEASONAL CALCULATIONS =====
    /**
     * Calculate seasonal compatibility for an ingredient with current conditions
     */
    calculateSeasonalCompatibility(ingredient, season, currentConditions) {
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        // Base seasonal score
        const baseScore = this.getSeasonalScore(ingredient.name, season);
        // Kalchm compatibility
        const kalchmCompatibility = this.calculateKalchmSeasonalCompatibility(ingredient.kalchm, season);
        // Elemental compatibility
        const elementalCompatibility = this.calculateElementalSeasonalCompatibility(ingredient.elementalProperties, seasonProfile.elementalDominance);
        // Combine scores with weights
        let totalCompatibility = (baseScore * 0.4 +
            kalchmCompatibility * 0.3 +
            elementalCompatibility * 0.3);
        // Apply current conditions modifiers if provided
        if (currentConditions) {
            const conditionModifier = this.calculateConditionModifier(currentConditions, seasonProfile);
            totalCompatibility *= conditionModifier;
        }
        return Math.min(1.0, Math.max(0.0, totalCompatibility));
    }
    /**
     * Calculate elemental compatibility between ingredient and season
     */
    calculateElementalSeasonalCompatibility(ingredientElements, seasonalElements) {
        // Following elemental self-reinforcement principles
        let compatibility = 0;
        let totalWeight = 0;
        for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
            const ingredientValue = ingredientElements[element];
            const seasonalValue = seasonalElements[element];
            if (ingredientValue > 0 && seasonalValue > 0) {
                // Same element reinforcement (0.9 compatibility)
                compatibility += ingredientValue * seasonalValue * 0.9;
                totalWeight += ingredientValue * seasonalValue;
            }
            else if (ingredientValue > 0 || seasonalValue > 0) {
                // Different elements still have good compatibility (0.7)
                const value = Math.max(ingredientValue, seasonalValue);
                compatibility += value * 0.7;
                totalWeight += value;
            }
        }
        return totalWeight > 0 ? compatibility / totalWeight : 0.7;
    }
    /**
     * Calculate condition modifier based on current astrological/environmental conditions
     */
    calculateConditionModifier(conditions, seasonProfile) {
        let modifier = 1.0;
        // Lunar phase modifier
        if (conditions.lunarPhase) {
            modifier *= (1 + seasonProfile.monicaModifiers.lunarPhaseBonus * 0.1);
        }
        // Planetary hour modifier
        if (conditions.planetaryHour) {
            modifier *= (1 + seasonProfile.monicaModifiers.planetaryAlignment * 0.1);
        }
        // Temperature modifier
        if (conditions.temperature) {
            const optimalTemp = 70 + seasonProfile.monicaModifiers.temperatureAdjustment;
            const tempDifference = Math.abs(conditions.temperature - optimalTemp);
            const tempModifier = Math.max(0.8, 1 - (tempDifference / 100));
            modifier *= tempModifier;
        }
        return modifier;
    }
    // ===== MONICA-ENHANCED SEASONAL RECOMMENDATIONS =====
    /**
     * Get seasonal recommendations with Monica optimization
     */
    getSeasonalRecommendations(season, targetMonica, kalchmRange) {
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        // Use provided ranges or seasonal defaults
        const effectiveKalchmRange = kalchmRange || seasonProfile.kalchmRange;
        // Get compatible ingredients
        const compatibleIngredients = this.getSeasonalCompatibleIngredients(season, effectiveKalchmRange);
        // Get optimal cooking methods
        const optimalCookingMethods = this.getSeasonalOptimalCookingMethods(season, targetMonica);
        // Calculate optimization scores
        const monicaOptimization = this.calculateSeasonalMonicaOptimization(season, targetMonica, optimalCookingMethods);
        const kalchmHarmony = this.calculateSeasonalKalchmHarmony(compatibleIngredients, effectiveKalchmRange);
        return {
            ingredients: compatibleIngredients,
            cookingMethods: optimalCookingMethods,
            recipes: [],
            monicaOptimization,
            kalchmHarmony};
    }
    /**
     * Get ingredients compatible with seasonal Kalchm range
     */
    getSeasonalCompatibleIngredients(season, kalchmRange) {
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        const compatibleIngredients = [];
        // Get ingredients that are in season
        const seasonalIngredientNames = Object.keys(seasonProfile.ingredients);
        for (const ingredientName of seasonalIngredientNames) {
            const ingredient = ingredients_js_1.unifiedIngredients[ingredientName];
            if (!ingredient)
                continue;
            // Check Kalchm compatibility
            const kalchmCompatibility = this.calculateKalchmSeasonalCompatibility(ingredient.kalchm, season);
            // Check if within desired Kalchm range
            const inRange = ingredient.kalchm >= kalchmRange.min && ingredient.kalchm <= kalchmRange.max;
            if (kalchmCompatibility >= 0.7 || inRange) {
                compatibleIngredients.push(ingredient);
            }
        }
        // Sort by seasonal score and Kalchm compatibility
        return compatibleIngredients.sort((a, b) => {
            const scoreA = this.getSeasonalScore(a.name, season) +
                this.calculateKalchmSeasonalCompatibility(a.kalchm, season);
            const scoreB = this.getSeasonalScore(b.name, season) +
                this.calculateKalchmSeasonalCompatibility(b.kalchm, season);
            return scoreB - scoreA;
        });
    }
    /**
     * Get optimal cooking methods for season with Monica integration
     */
    getSeasonalOptimalCookingMethods(season, targetMonica) {
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        const optimalMethods = [];
        // Get methods listed as optimal for the season
        for (const methodName of seasonProfile.optimalCookingMethods) {
            const enhancedMethod = this.enhancedCookingMethods[methodName];
            if (enhancedMethod) {
                optimalMethods.push(enhancedMethod);
            }
        }
        // If target Monica is specified, find compatible methods
        if (targetMonica !== undefined) {
            const monicaCompatibleMethods = (0, alchemicalPillars_js_1.getMonicaCompatibleCookingMethods)(targetMonica, 0.3);
            // Add Monica-compatible methods that aren't already included
            for (const method of monicaCompatibleMethods) {
                if (!optimalMethods.find(m => m.name === method.name)) {
                    optimalMethods.push(method);
                }
            }
        }
        // Sort by seasonal compatibility and Monica alignment
        return optimalMethods.sort((a, b) => {
            const scoreA = this.calculateMethodSeasonalScore(a, season, targetMonica);
            const scoreB = this.calculateMethodSeasonalScore(b, season, targetMonica);
            return scoreB - scoreA;
        });
    }
    /**
     * Calculate cooking method seasonal compatibility score
     */
    calculateMethodSeasonalScore(method, season, targetMonica) {
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        let score = 0;
        // Base seasonal compatibility
        if (seasonProfile.optimalCookingMethods.includes(method.name)) {
            score += 1.0;
        }
        // Monica compatibility
        if (targetMonica !== undefined && !isNaN(method.monicaConstant)) {
            const monicaDifference = Math.abs(method.monicaConstant - targetMonica);
            score += Math.max(0, 1 - monicaDifference);
        }
        // Elemental compatibility
        const methodElement = method.alchemicalPillar.elementalAssociations?.primary;
        if (methodElement) {
            const elementalScore = seasonProfile.elementalDominance[methodElement] || 0;
            score += elementalScore;
        }
        return score;
    }
    /**
     * Calculate seasonal Monica optimization score
     */
    calculateSeasonalMonicaOptimization(season, targetMonica, cookingMethods) {
        if (targetMonica === undefined || cookingMethods.length === 0) {
            return 0.5; // Neutral optimization
        }
        const seasonProfile = exports.unifiedSeasonalProfiles[season];
        let totalOptimization = 0;
        let validMethods = 0;
        for (const method of cookingMethods) {
            if (!isNaN(method.monicaConstant)) {
                const monicaDifference = Math.abs(method.monicaConstant - targetMonica);
                const methodOptimization = Math.max(0, 1 - monicaDifference);
                // Apply seasonal Monica modifiers
                const seasonalBonus = seasonProfile.monicaModifiers.lunarPhaseBonus;
                totalOptimization += methodOptimization * (1 + seasonalBonus * 0.2);
                validMethods++;
            }
        }
        return validMethods > 0 ? totalOptimization / validMethods : 0.5;
    }
    /**
     * Calculate seasonal Kalchm harmony score
     */
    calculateSeasonalKalchmHarmony(ingredients, kalchmRange) {
        if (ingredients.length === 0)
            return 0.5;
        let totalHarmony = 0;
        for (const ingredient of ingredients) {
            // Calculate how well the ingredient fits the seasonal Kalchm range
            const kalchm = ingredient.kalchm;
            if (kalchm >= kalchmRange.min && kalchm <= kalchmRange.max) {
                // Perfect harmony if within range
                totalHarmony += 1.0;
            }
            else {
                // Partial harmony based on distance from range
                const distance = kalchm < kalchmRange.min
                    ? kalchmRange.min - kalchm
                    : kalchm - kalchmRange.max;
                const harmony = Math.max(0.1, Math.exp(-distance * 2));
                totalHarmony += harmony;
            }
        }
        return totalHarmony / ingredients.length;
    }
    // ===== SEASONAL TRANSITION LOGIC =====
    /**
     * Calculate seasonal transition profile
     */
    calculateSeasonalTransition(fromSeason, toSeason, transitionProgress // 0-1
    ) {
        const fromProfile = exports.unifiedSeasonalProfiles[fromSeason];
        const toProfile = exports.unifiedSeasonalProfiles[toSeason];
        // Blend elemental profiles
        const blendedElementalProfile = this.blendElementalProperties(fromProfile.elementalDominance, toProfile.elementalDominance, transitionProgress);
        // Blend Kalchm ranges
        const blendedKalchmRange = {
            min: fromProfile.kalchmRange.min +
                (toProfile.kalchmRange.min - fromProfile.kalchmRange.min) * transitionProgress,
            max: fromProfile.kalchmRange.max +
                (toProfile.kalchmRange.max - fromProfile.kalchmRange.max) * transitionProgress
        };
        // Blend Monica modifiers
        const blendedMonicaModifiers = this.blendMonicaModifiers(fromProfile.monicaModifiers, toProfile.monicaModifiers, transitionProgress);
        // Get transitional recommendations
        const recommendedIngredients = this.getTransitionalIngredients(fromSeason, toSeason, transitionProgress);
        const recommendedCookingMethods = this.getTransitionalCookingMethods(fromSeason, toSeason, transitionProgress);
        return {
            fromSeason,
            toSeason,
            transitionProgress,
            blendedElementalProfile,
            blendedKalchmRange,
            blendedMonicaModifiers,
            recommendedIngredients,
            recommendedCookingMethods
        };
    }
    /**
     * Blend elemental properties between seasons
     */
    blendElementalProperties(from, to, progress) {
        return { Fire: from.Fire + (to.Fire - from.Fire) * progress, Water: from.Water + (to.Water - from.Water) * progress, Earth: from.Earth + (to.Earth - from.Earth) * progress, Air: from.Air + (to.Air - from.Air) * progress
        };
    }
    /**
     * Blend Monica modifiers between seasons
     */
    blendMonicaModifiers(from, to, progress) {
        return {
            temperatureAdjustment: from.temperatureAdjustment +
                (to.temperatureAdjustment - from.temperatureAdjustment) * progress,
            timingAdjustment: from.timingAdjustment +
                (to.timingAdjustment - from.timingAdjustment) * progress,
            intensityModifier: progress < 0.5 ? from.intensityModifier : to.intensityModifier,
            planetaryAlignment: from.planetaryAlignment +
                (to.planetaryAlignment - from.planetaryAlignment) * progress,
            lunarPhaseBonus: from.lunarPhaseBonus +
                (to.lunarPhaseBonus - from.lunarPhaseBonus) * progress
        };
    }
    /**
     * Get ingredients suitable for seasonal transition
     */
    getTransitionalIngredients(fromSeason, toSeason, progress) {
        const fromIngredients = this.getSeasonalCompatibleIngredients(fromSeason, exports.unifiedSeasonalProfiles[fromSeason].kalchmRange);
        const toIngredients = this.getSeasonalCompatibleIngredients(toSeason, exports.unifiedSeasonalProfiles[toSeason].kalchmRange);
        // Combine and weight based on transition progress
        const transitionalIngredients = [];
        // Add ingredients from departing season (weighted by 1-progress)
        for (const ingredient of fromIngredients.slice(0, 10)) {
            if (Math.random() < (1 - progress)) {
                transitionalIngredients.push(ingredient);
            }
        }
        // Add ingredients from arriving season (weighted by progress)
        for (const ingredient of toIngredients.slice(0, 10)) {
            if (Math.random() < progress &&
                !transitionalIngredients.find(i => i.name === ingredient.name)) {
                transitionalIngredients.push(ingredient);
            }
        }
        return transitionalIngredients;
    }
    /**
     * Get cooking methods suitable for seasonal transition
     */
    getTransitionalCookingMethods(fromSeason, toSeason, progress) {
        const fromMethods = this.getSeasonalOptimalCookingMethods(fromSeason);
        const toMethods = this.getSeasonalOptimalCookingMethods(toSeason);
        const transitionalMethods = [];
        // Add methods from departing season
        for (const method of fromMethods.slice(0, 3)) {
            if (Math.random() < (1 - progress)) {
                transitionalMethods.push(method);
            }
        }
        // Add methods from arriving season
        for (const method of toMethods.slice(0, 3)) {
            if (Math.random() < progress &&
                !transitionalMethods.find(m => m.name === method.name)) {
                transitionalMethods.push(method);
            }
        }
        return transitionalMethods;
    }
}
exports.UnifiedSeasonalSystem = UnifiedSeasonalSystem;
// ===== UNIFIED SEASONAL SYSTEM INSTANCE =====
exports.unifiedSeasonalSystem = new UnifiedSeasonalSystem();
// ===== BACKWARD COMPATIBILITY EXPORTS =====
// Export functions that match the original seasonal.ts interface
const getCurrentSeason = () => exports.unifiedSeasonalSystem.getCurrentSeason();
exports.getCurrentSeason = getCurrentSeason;
const getSeasonalScore = (ingredientName, season) => exports.unifiedSeasonalSystem.getSeasonalScore(ingredientName, season);
exports.getSeasonalScore = getSeasonalScore;
const getSeasonalData = (ingredientName, season) => exports.unifiedSeasonalSystem.getSeasonalIngredientProfile(ingredientName, season);
exports.getSeasonalData = getSeasonalData;
const isInSeason = (ingredientName, threshold) => exports.unifiedSeasonalSystem.isInSeason(ingredientName, threshold);
exports.isInSeason = isInSeason;
const getSeasonalRecommendations = (season, targetMonica, kalchmRange) => exports.unifiedSeasonalSystem.getSeasonalRecommendations(season, targetMonica, kalchmRange);
exports.getSeasonalRecommendations = getSeasonalRecommendations;
// Export consolidated data for backward compatibility
exports.seasonalPatterns = Object.fromEntries(Object.entries(exports.unifiedSeasonalProfiles).map(([season, profile]) => [
    season,
    {
        ...profile.ingredients,
        elementalInfluence: profile.elementalInfluence,
        tarotInfluences: profile.tarotProfile.tarotInfluences
    }
]));
exports.seasonalUsage = Object.fromEntries(Object.entries(exports.unifiedSeasonalProfiles).map(([season, profile]) => [
    season,
    {
        growing: profile.growing,
        herbs: profile.herbs,
        vegetables: profile.vegetables,
        cuisines: profile.cuisines,
        tarotAssociations: {
            minorArcana: profile.tarotProfile.minorArcana,
            majorArcana: profile.tarotProfile.majorArcana,
            zodiacSigns: profile.tarotProfile.zodiacSigns,
            cookingRecommendations: profile.tarotProfile.cookingRecommendations
        }
    }
]));
// Export helper functions from original seasonalPatterns.ts
function getTarotInfluenceForSeason(season) {
    return exports.unifiedSeasonalProfiles[season]?.tarotProfile.tarotInfluences || {};
}
exports.getTarotInfluenceForSeason = getTarotInfluenceForSeason;
function getSeasonalIngredientsByTarotCard(season, cardKey) {
    const tarotInfluence = exports.unifiedSeasonalProfiles[season]?.tarotProfile.tarotInfluences[cardKey];
    if (tarotInfluence && typeof tarotInfluence === 'object' && 'ingredients' in tarotInfluence) {
        return tarotInfluence.ingredients;
    }
    return [];
}
exports.getSeasonalIngredientsByTarotCard = getSeasonalIngredientsByTarotCard;
function getRecommendedCookingMethodByTarotCard(season, cardKey) {
    const tarotInfluence = exports.unifiedSeasonalProfiles[season]?.tarotProfile.tarotInfluences[cardKey];
    if (tarotInfluence && typeof tarotInfluence === 'object' && 'cookingMethod' in tarotInfluence) {
        return tarotInfluence.cookingMethod;
    }
    return '';
}
exports.getRecommendedCookingMethodByTarotCard = getRecommendedCookingMethodByTarotCard;
// Export helper functions from original seasonalUsage.ts
function getSeasonalUsageData(ingredient, season) {
    const seasonProfile = exports.unifiedSeasonalProfiles[season];
    if (!seasonProfile)
        return { inGrowing: false, inHerbs: false, inVegetables: false };
    return {
        inGrowing: seasonProfile.growing.includes(ingredient),
        inHerbs: seasonProfile.herbs.includes(ingredient),
        inVegetables: seasonProfile.vegetables.includes(ingredient)
    };
}
exports.getSeasonalUsageData = getSeasonalUsageData;
function getTarotRecommendationsForSeason(season) {
    return exports.unifiedSeasonalProfiles[season]?.tarotProfile.cookingRecommendations || [];
}
exports.getTarotRecommendationsForSeason = getTarotRecommendationsForSeason;
function getMinorArcanaForSeason(season) {
    return exports.unifiedSeasonalProfiles[season]?.tarotProfile.minorArcana || [];
}
exports.getMinorArcanaForSeason = getMinorArcanaForSeason;
function getMajorArcanaForSeason(season) {
    return exports.unifiedSeasonalProfiles[season]?.tarotProfile.majorArcana || [];
}
exports.getMajorArcanaForSeason = getMajorArcanaForSeason;
// ===== EXPORTS =====
exports.default = exports.unifiedSeasonalSystem;
