# 🍽️ INGREDIENT SEARCH FUNCTIONALITY INVENTORY

## WhatToEatNext - Complete Ingredient Search System

**Created:** July 2025  
**Status:** Comprehensive Inventory of Ingredient Search Capabilities  
**Scope:** All files related to ingredient search, filtering, and recommendation
functionality

---

## 📋 **CORE SEARCH SERVICES**

### **Primary Ingredient Services**

1. **`src/services/IngredientService.ts`**
   - Main ingredient service with search functionality
   - `getIngredientByName()` - Direct name lookup
   - `filterIngredients()` - Multi-criteria filtering
   - `applySearchFilterUnified()` - Text-based search across name, tags, health
     benefits, preparation methods, description

2. **`src/services/UnifiedIngredientService.ts`**
   - Unified ingredient service with enhanced search
   - `getIngredientByName()` - Normalized name search
   - `filterIngredients()` - Comprehensive filtering system
   - `applySearchFilter()` - Search across name, description, category,
     subcategory, tags

3. **`src/services/ConsolidatedIngredientService.ts`**
   - Consolidated service with advanced search capabilities
   - `filterIngredients()` - Multi-filter system
   - `applySearchFilter()` - Enhanced text search with qualities/tags support

4. **`src/services/IngredientFilterService.ts`**
   - Dedicated filtering service
   - `filterIngredients()` - Category-based filtering
   - `applySearchFilter()` - Query-based search with preparation notes and
     affinities

### **Enhanced Search Services**

5. **`src/data/unified/enhancedIngredients.ts`**
   - Enhanced ingredient system with advanced search
   - `searchIngredients()` - Criteria-based search
   - Supports: category, subcategory, elemental focus, Kalchm range, seasonal
     alignment, planetary ruler, cooking methods, nutritional focus, flavor
     profile, origin, qualities

6. **`src/services/adapters/UnifiedDataAdapter.ts`**
   - Adapter for enhanced ingredient search
   - `searchIngredients()` - Wrapper for enhanced search functionality

---

## 🎯 **SEARCH COMPONENTS & UI**

### **Main Search Components**

7. **`src/components/IngredientRecommender.tsx`**
   - Primary ingredient recommendation component
   - Astrological and chakra-based recommendations
   - Interactive ingredient selection and display

8. **`src/components/NutritionalDisplay.tsx`**
   - Nutritional search with autocomplete
   - Search input with dropdown suggestions
   - Real-time ingredient filtering

9. **`src/components/CookingMethodsSection.tsx`**
   - Ingredient search for cooking compatibility
   - Search input for ingredient compatibility checking
   - Real-time compatibility calculation

10. **`src/components/CookingMethodsSection.migrated.tsx`**
    - Migrated version with enhanced search features
    - Toggle-able ingredient search section
    - Compatibility analysis for searched ingredients

### **Recommendation Components**

11. **`src/components/Header/FoodRecommender/IngredientRecommendations.tsx`**
    - Header-based ingredient recommendations
    - Top ingredient matches display
    - Interactive recommendation selection

12. **`src/components/FoodRecommender/IngredientRecommendations.tsx`**
    - Food recommender ingredient component
    - Recommended ingredients display
    - Empty state handling

13. **`src/components/FoodRecommender/KalchmRecommender.tsx`**
    - Kalchm-based ingredient recommendations
    - Elemental state filtering
    - Grouped ingredient display

14. **`src/components/FoodRecommender/NutritionalRecommender.tsx`**
    - Nutritional-based ingredient recommendations
    - Balanced recommendations with filters
    - Recipe recommendations based on selected ingredients

15. **`src/components/recommendations/IngredientRecommender.tsx`**
    - Recommendations-specific ingredient component
    - Enhanced ingredient recommendations
    - Astrological integration

### **Display & Debug Components**

16. **`src/components/IngredientDisplay.tsx`**
    - Ingredient display with recommendations
    - Cooking method and pairing recommendations
    - Detailed ingredient information

17. **`src/components/FoodRecommender/IngredientDisplay.tsx`**
    - Food recommender display component
    - Current ingredient recommendations
    - Astrological state integration

18. **`src/components/debug/IngredientRecommenderDebug.tsx`**
    - Debug component for ingredient recommender
    - Testing and development interface

19. **`src/components/debug/StateDebugger.tsx`**
    - Debug component showing recommended ingredients
    - State monitoring and testing

---

## 🔧 **UTILITIES & HELPERS**

### **Search Utilities**

20. **`src/utils/recipe/recipeFiltering.ts`**
    - Recipe filtering with ingredient search
    - `calculateSearchRelevance()` - Search relevance scoring
    - Ingredient-based recipe filtering

21. **`src/utils/recipe/recipeUtils.ts`**
    - Recipe utilities with ingredient search
    - `recipeHasIngredient()` - Ingredient presence checking
    - String and object ingredient handling

22. **`src/utils/ingredientRecommender.ts`**
    - Core ingredient recommendation utilities
    - `getIngredientRecommendations()` - Recommendation generation
    - `getChakraBasedRecommendations()` - Chakra-based filtering

23. **`src/utils/foodRecommender.ts`**
    - Food recommendation utilities
    - `getTopIngredientMatches()` - Top ingredient matching
    - Recommendation scoring and ranking

### **Data Enhancement**

24. **`src/data/unified/recipes.ts`**
    - Recipe enhancer with ingredient search
    - `findUnifiedIngredient()` - Fuzzy ingredient matching
    - Direct lookup and normalized matching

25. **`src/data/unified/data/unified/recipes.js`**
    - JavaScript version of recipe enhancer
    - Ingredient finding functionality

---

## 🎛️ **HOOKS & STATE MANAGEMENT**

### **Custom Hooks**

26. **`src/hooks/useIngredientRecommendations.ts`**
    - Hook for ingredient recommendations
    - Criteria-based recommendation fetching

27. **`src/hooks/useIngredientMapping.ts`**
    - Hook for ingredient mapping service
    - Service integration for components

28. **`src/hooks/useFoodRecommendations.ts`**
    - Hook for food recommendations
    - Astrological state-based recommendations

---

## 📊 **TYPES & INTERFACES**

### **Type Definitions**

29. **`src/types/ingredients.ts`**
    - `IngredientSearchCriteria` - Comprehensive search parameters
    - Elements, seasons, categories, nutritional requirements, cooking methods,
      sustainability, regional origins

30. **`src/types/alchemy.ts`**
    - `IngredientSearchCriteria` - Alchemical search criteria
    - Elements, seasons, categories, nutritional requirements, flavor profile,
      cooking methods, availability

---

## 🔗 **INTEGRATION SERVICES**

### **Recipe Integration**

31. **`src/services/LocalRecipeService.ts`**
    - Recipe search with ingredient filtering
    - `searchRecipes()` - Query-based recipe search
    - Ingredient name matching in recipes

32. **`src/services/RecipeCuisineConnector.ts`**
    - Recipe search with advanced filters
    - `searchRecipes()` - Multi-criteria recipe search
    - Ingredient-based recipe filtering

33. **`src/services/ConsolidatedIngredientService.ts`**
    - Consolidated service with recipe integration
    - Recipe recommendations based on ingredients

---

## 🎨 **UI COMPONENTS & PAGES**

### **Search Pages**

34. **`src/app/nutritional-data/page.tsx`**
    - Nutritional data search page
    - Ingredient search interface
    - Multiple ingredient displays

### **Grid & Display Components**

35. **`src/components/recipes/RecipeGrid.tsx`**
    - Recipe grid with search functionality
    - Search placeholder for recipes, ingredients, cuisines

36. **`src/components/IngredientMapper.tsx`**
    - Ingredient mapping with search
    - Required ingredients filtering

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Search Flow**

1. **User Input** → Search components (IngredientRecommender,
   NutritionalDisplay, etc.)
2. **Query Processing** → Service layer (IngredientService,
   UnifiedIngredientService, etc.)
3. **Filtering** → Filter services (IngredientFilterService, enhanced search)
4. **Results** → Display components with recommendations and compatibility

### **Key Features**

- **Multi-criteria search**: Name, category, elemental properties, nutritional
  values
- **Fuzzy matching**: Normalized name matching with fallbacks
- **Real-time filtering**: Live search with autocomplete
- **Astrological integration**: Planetary and zodiac-based recommendations
- **Compatibility checking**: Cooking method and ingredient compatibility
- **Nutritional analysis**: Health benefits and nutritional profile search

### **Search Capabilities**

- **Text Search**: Name, description, tags, preparation methods
- **Categorical Search**: Category, subcategory, cuisine type
- **Elemental Search**: Fire, Water, Earth, Air properties
- **Nutritional Search**: Health benefits, nutritional requirements
- **Seasonal Search**: Peak seasons, optimal timing
- **Astrological Search**: Planetary rulers, zodiac compatibility
- **Cooking Search**: Preparation methods, cooking techniques

---

## 📈 **PERFORMANCE & OPTIMIZATION**

### **Caching & Performance**

- **Ingredient caching** in services for fast lookups
- **Normalized search** with case-insensitive matching
- **Batch processing** for large ingredient sets
- **Lazy loading** for recommendation components

### **Search Optimization**

- **Indexed lookups** for direct name matching
- **Fuzzy matching** for approximate searches
- **Relevance scoring** for result ranking
- **Progressive filtering** for complex queries

---

## 🎯 **USAGE EXAMPLES**

### **Basic Search**

```typescript
// Direct name lookup
const ingredient = ingredientService.getIngredientByName("spinach");

// Text-based search
const results = ingredientService.filterIngredients({
  searchQuery: "leafy green",
});
```

### **Advanced Search**

```typescript
// Multi-criteria search
const results = enhancedIngredientsSystem.searchIngredients({
  category: "vegetables",
  elementalFocus: "Earth",
  kalchmRange: { min: 0.8, max: 1.2 },
  seasonalAlignment: "spring",
});
```

### **Recipe Search**

```typescript
// Recipe search with ingredients
const recipes = LocalRecipeService.searchRecipes("chicken");
// Searches recipe names, descriptions, and ingredients
```

---

## 🚀 **FUTURE ENHANCEMENTS**

### **Planned Improvements**

- **AI-powered search** with semantic understanding
- **Voice search** integration
- **Image-based search** for ingredient recognition
- **Advanced filtering** with machine learning recommendations
- **Search analytics** for user behavior tracking

### **Integration Opportunities**

- **External APIs** for expanded ingredient databases
- **Barcode scanning** for packaged ingredients
- **OCR integration** for recipe text recognition
- **Social features** for shared ingredient preferences

---

_This inventory represents the comprehensive ingredient search ecosystem in
WhatToEatNext, providing multiple layers of search functionality from basic text
search to advanced astrological and nutritional filtering._
