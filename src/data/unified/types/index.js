"use strict";
const __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    let desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
const __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (const p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRecipeIngredient = exports.ZODIAC_SEASONS = exports.MEAL_TIMES = void 0;
// Time-related types
exports.MEAL_TIMES = ['breakfast', 'lunch', 'snack', 'dinner'];
// Define zodiac signs as seasons
exports.ZODIAC_SEASONS = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];
// Export essential utils
__exportStar(require("./utils"), exports);
__exportStar(require("./cuisine"), exports);
// Export time-related modules first
__exportStar(require("./time"), exports);
// Re-export all relevant types from their modules in a specific order to avoid conflicts
__exportStar(require("./elemental"), exports);
__exportStar(require("./nutrition"), exports);
__exportStar(require("./spoonacular"), exports);
__exportStar(require("./zodiac"), exports);
__exportStar(require("./cuisine"), exports);
__exportStar(require("./chakra"), exports);
__exportStar(require("./astrology"), exports);
__exportStar(require("./astrological"), exports);
__exportStar(require("./lunar"), exports);
__exportStar(require("./food"), exports);
__exportStar(require("./ingredient"), exports);
__exportStar(require("./cookingMethod"), exports);
// Export RecipeIngredient interface and validateIngredient function with explicit names
const recipeIngredient_1 = require("./recipeIngredient");
Object.defineProperty(exports, "validateRecipeIngredient", { enumerable: true, get: function () { return recipeIngredient_1.validateIngredient; } });
