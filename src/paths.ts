// This file helps TypeScript resolve module paths correctly
// It contains explicit re-exports of commonly used modules

import * as _elementalConstants from "./constants/elementalConstants";
import * as _ingredientTypes from "./data/ingredients/types";
import * as _alchemyTypes from "./types/alchemy";
// This helps ensure TypeScript can resolve these modules when imported with @ aliases
// and provides better type checking
