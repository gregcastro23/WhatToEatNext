// This file helps TypeScript resolve module paths correctly
// It contains explicit re-exports of commonly used modules

import * as alchemyTypes from './types/alchemy';
export { alchemyTypes };

import * as elementalConstants from './constants/elementalConstants';
export { elementalConstants };

import * as ingredientTypes from './data/ingredients/types';
export { ingredientTypes };

// This helps ensure TypeScript can resolve these modules when imported with @ aliases
// and provides better type checking
