# Phase 3: Core Feature Implementation - Comprehensive Prompt

**Project:** WhatToEatNext - Alchemical Culinary Recommendation System
**Phase:** 3 - Core Feature Implementation
**Prerequisites:** Phase 2 Complete (Build stable, 21 pages, providers restored)
**Branch:** phase-3-implementation (to be created from phase-2-restoration)
**Estimated Time:** 8-16 hours for High Priority items

---

## Executive Summary

Implement the two critical missing UI components (KalchmRecommender and IngredientRecommender) that are currently showing placeholder messages on the main feature pages. These components are the primary user-facing features of the application and have all necessary backend infrastructure already in place.

**Current State:**
- ✅ Backend services complete and functional
- ✅ API routes working with fallback modes
- ✅ Data layer complete
- ✅ Providers and context working
- ❌ Main recommendation UI components are placeholders

**Goal State:**
- ✅ Functional KalchmRecommender on `/what-to-eat-next`
- ✅ Functional IngredientRecommender on `/ingredients`
- ✅ Fixed cooking method data exports
- ✅ All core features operational

---

## 🎯 OBJECTIVE 1: Implement KalchmRecommender Component

### Background Context

**Current Situation:**
- Location: `src/app/what-to-eat-next/page.tsx`
- Current Implementation: Placeholder div showing "KalchmRecommender unavailable."
- Page Status: ✅ Building and loading successfully
- Backend Support: ✅ Complete (hooks, services, API routes all functional)

**What KalchmRecommender Should Do:**
Display personalized ingredient/recipe recommendations based on:
1. Current astrological moment (planetary positions)
2. Elemental harmony calculations
3. Alchemical properties (Spirit, Essence, Matter, Substance - ESMS)
4. Thermodynamic properties (Heat, Entropy, Reactivity, Greg's Energy, Kalchm, Monica)
5. User preferences (dietary restrictions, cuisine preferences)

### Implementation Approach

#### Option A: Wire Up Existing EnhancedRecommendationEngine (RECOMMENDED - Fastest)

**Rationale:** We have a complete `EnhancedRecommendationEngine` component at `src/components/EnhancedRecommendationEngine.tsx` that already implements recommendation UI patterns.

**Steps:**

1. **Analyze EnhancedRecommendationEngine Component**
   ```bash
   # Read the component to understand its interface
   cat src/components/EnhancedRecommendationEngine.tsx
   ```

2. **Create KalchmRecommender Wrapper Component**
   ```typescript
   // src/components/recommendations/KalchmRecommender.tsx
   'use client';

   import React, { useEffect, useState } from 'react';
   import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';
   import { useAlchemicalContext } from '@/contexts/AlchemicalContext';

   interface KalchmRecommenderProps {
     maxRecommendations?: number;
     showFilters?: boolean;
     showScoring?: boolean;
   }

   export const KalchmRecommender: React.FC<KalchmRecommenderProps> = ({
     maxRecommendations = 18,
     showFilters = true,
     showScoring = true
   }) => {
     // Use existing hook to get recommendations
     const {
       ingredients,
       recipes,
       loading,
       error,
       getIngredientRecommendations,
       getRecipeRecommendations
     } = useEnhancedRecommendations({
       datetime: new Date(),
       useBackendInfluence: true
     });

     // Get current alchemical state
     const alchemicalContext = useAlchemicalContext();

     // Fetch recommendations on mount
     useEffect(() => {
       void getIngredientRecommendations();
       void getRecipeRecommendations();
     }, [getIngredientRecommendations, getRecipeRecommendations]);

     // Implementation details...
   };
   ```

3. **Design the UI Layout**

   **Layout Structure:**
   ```
   ┌─────────────────────────────────────────────────────┐
   │  Current Moment Summary                              │
   │  Season: Spring | Time: Morning | Element: Fire     │
   │  Planetary Hour: Venus | Harmony: 91%               │
   └─────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────┐
   │  Filters (Optional)                                  │
   │  [Dietary] [Cuisine] [Difficulty] [Time]           │
   └─────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────┐
   │  Top Recommended Ingredients                         │
   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
   │  │ 🍅   │ │ 🧄   │ │ 🌿   │ │ 🧅   │              │
   │  │ Tom. │ │ Gar. │ │ Bas. │ │ Oni. │              │
   │  │ 95%  │ │ 92%  │ │ 89%  │ │ 87%  │              │
   │  └──────┘ └──────┘ └──────┘ └──────┘              │
   └─────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────┐
   │  Recommended Recipes                                 │
   │  ┌───────────────────────────────────────────────┐  │
   │  │ Margherita Pizza                   Score: 94% │  │
   │  │ Fire: ████░ Water: ███░░ Earth: ██░░░         │  │
   │  │ [View Recipe] [Save]                          │  │
   │  └───────────────────────────────────────────────┘  │
   │  ┌───────────────────────────────────────────────┐  │
   │  │ ...                                            │  │
   └─────────────────────────────────────────────────────┘
   ```

4. **Implement Core Features**

   **Required Features:**
   - ✅ Display current astrological moment summary
   - ✅ Show top N recommendations (default: 18)
   - ✅ Display compatibility scores (Kalchm values)
   - ✅ Show elemental breakdown for each recommendation
   - ✅ Loading states while fetching data
   - ✅ Error handling with user-friendly messages
   - ✅ Optional filtering UI
   - ✅ Responsive grid layout

   **Optional Features:**
   - Sorting controls (by score, by element, alphabetical)
   - Save/favorite functionality
   - Detailed view modal
   - Print/export recommendations

5. **Update the Page to Use New Component**
   ```typescript
   // src/app/what-to-eat-next/page.tsx
   'use client';

   import { AlchemicalProvider } from '@/contexts/AlchemicalContext';
   import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';
   import { KalchmRecommender } from '@/components/recommendations/KalchmRecommender';

   export default function WhatToEatNextPage() {
     const { cuisines, loading, error, getCuisineRecommendations } = useEnhancedRecommendations({
       datetime: new Date(),
       useBackendInfluence: true
     });

     return (
       <div className='container mx-auto px-4 py-8'>
         <header className='mb-8 text-center'>
           <h1 className='mb-3 text-4xl font-bold'>What to Eat Next</h1>
           <p className='text-xl text-gray-600'>
             Personalized ingredient recommendations based on alchemical calculations
           </p>
         </header>

         <div className='overflow-hidden rounded-lg bg-white shadow-md'>
           <AlchemicalProvider>
             <KalchmRecommender maxRecommendations={18} />
           </AlchemicalProvider>
         </div>

         {/* Rune/context banner */}
         {!loading && !error && cuisines?.context?.rune && (
           <div className='mt-4 flex items-center justify-center'>
             <div className='flex max-w-3xl items-center gap-3 rounded-md bg-indigo-50 p-3'>
               <div className='text-2xl'>{cuisines.context.rune.symbol}</div>
               <div>
                 <div className='text-sm font-semibold'>{cuisines.context.rune.name}</div>
                 <div className='text-xs text-indigo-800'>{cuisines.context.rune.guidance}</div>
               </div>
             </div>
           </div>
         )}

         {/* Existing about section */}
         <div className='mt-8 rounded-lg bg-blue-50 p-6'>
           {/* ... existing content ... */}
         </div>
       </div>
     );
   }
   ```

#### Option B: Create New Component from Scratch (More Control)

**Use if:** You want complete control over the recommendation display logic

**Steps:**

1. **Create Component Structure**
   ```typescript
   // src/components/recommendations/KalchmRecommender.tsx
   'use client';

   import React, { useEffect, useState, useMemo } from 'react';
   import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';
   import { useAlchemicalContext } from '@/contexts/AlchemicalContext';
   import type { EnhancedIngredient, EnhancedRecipe } from '@/types/recommendations';

   interface KalchmRecommenderProps {
     maxRecommendations?: number;
   }

   export const KalchmRecommender: React.FC<KalchmRecommenderProps> = ({
     maxRecommendations = 18
   }) => {
     // State
     const [view, setView] = useState<'ingredients' | 'recipes'>('ingredients');
     const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

     // Hooks
     const {
       ingredients,
       recipes,
       loading,
       error,
       getIngredientRecommendations,
       getRecipeRecommendations
     } = useEnhancedRecommendations({
       datetime: new Date(),
       useBackendInfluence: true
     });

     const alchemicalContext = useAlchemicalContext();

     // Effects
     useEffect(() => {
       if (view === 'ingredients') {
         void getIngredientRecommendations();
       } else {
         void getRecipeRecommendations();
       }
     }, [view, getIngredientRecommendations, getRecipeRecommendations]);

     // Computed values
     const sortedRecommendations = useMemo(() => {
       const items = view === 'ingredients' ? ingredients?.items : recipes?.items;
       if (!items) return [];

       return [...items]
         .sort((a, b) => {
           if (sortBy === 'score') {
             return (b.kalchmScore || 0) - (a.kalchmScore || 0);
           }
           return a.name.localeCompare(b.name);
         })
         .slice(0, maxRecommendations);
     }, [view, ingredients, recipes, sortBy, maxRecommendations]);

     // Render functions
     const renderCurrentMoment = () => {
       if (!alchemicalContext) return null;

       return (
         <div className="mb-6 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
           <h3 className="mb-2 text-lg font-semibold">Current Alchemical Moment</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div>
               <div className="text-sm text-gray-600">Season</div>
               <div className="font-medium">{alchemicalContext.state.currentSeason}</div>
             </div>
             <div>
               <div className="text-sm text-gray-600">Time of Day</div>
               <div className="font-medium">{alchemicalContext.state.timeOfDay}</div>
             </div>
             <div>
               <div className="text-sm text-gray-600">Dominant Element</div>
               <div className="font-medium">{alchemicalContext.getDominantElement()}</div>
             </div>
             <div>
               <div className="text-sm text-gray-600">Harmony</div>
               <div className="font-medium">
                 {(alchemicalContext.getAlchemicalHarmony() * 100).toFixed(0)}%
               </div>
             </div>
           </div>
         </div>
       );
     };

     const renderRecommendationCard = (item: any) => {
       return (
         <div
           key={item.id || item.name}
           className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
         >
           <div className="flex items-start justify-between mb-2">
             <h4 className="text-lg font-semibold">{item.name}</h4>
             <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
               {(item.kalchmScore * 100).toFixed(0)}%
             </div>
           </div>

           {item.description && (
             <p className="text-sm text-gray-600 mb-3">{item.description}</p>
           )}

           {/* Elemental properties */}
           {item.elementalProperties && (
             <div className="space-y-1">
               {Object.entries(item.elementalProperties).map(([element, value]) => (
                 <div key={element} className="flex items-center gap-2">
                   <span className="text-xs font-medium w-12">{element}</span>
                   <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                     <div
                       className="h-full bg-indigo-500"
                       style={{ width: `${(value as number) * 100}%` }}
                     />
                   </div>
                   <span className="text-xs text-gray-500">
                     {((value as number) * 100).toFixed(0)}%
                   </span>
                 </div>
               ))}
             </div>
           )}
         </div>
       );
     };

     // Main render
     if (loading) {
       return (
         <div className="flex items-center justify-center p-12">
           <div className="text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
             <p className="text-gray-600">Calculating alchemical recommendations...</p>
           </div>
         </div>
       );
     }

     if (error) {
       return (
         <div className="rounded-lg bg-red-50 border border-red-200 p-6">
           <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Recommendations</h3>
           <p className="text-red-600">{error.message || 'An unexpected error occurred'}</p>
           <button
             onClick={() => view === 'ingredients' ? getIngredientRecommendations() : getRecipeRecommendations()}
             className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
           >
             Try Again
           </button>
         </div>
       );
     }

     return (
       <div className="p-6">
         {renderCurrentMoment()}

         {/* View toggle */}
         <div className="mb-6 flex items-center justify-between">
           <div className="flex gap-2">
             <button
               onClick={() => setView('ingredients')}
               className={`px-4 py-2 rounded ${
                 view === 'ingredients'
                   ? 'bg-indigo-600 text-white'
                   : 'bg-gray-200 text-gray-700'
               }`}
             >
               Ingredients
             </button>
             <button
               onClick={() => setView('recipes')}
               className={`px-4 py-2 rounded ${
                 view === 'recipes'
                   ? 'bg-indigo-600 text-white'
                   : 'bg-gray-200 text-gray-700'
               }`}
             >
               Recipes
             </button>
           </div>

           <select
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
             className="px-4 py-2 border border-gray-300 rounded"
           >
             <option value="score">Sort by Score</option>
             <option value="name">Sort by Name</option>
           </select>
         </div>

         {/* Recommendations grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {sortedRecommendations.map(renderRecommendationCard)}
         </div>

         {sortedRecommendations.length === 0 && (
           <div className="text-center py-12 text-gray-500">
             No recommendations available at this time.
           </div>
         )}
       </div>
     );
   };

   export default KalchmRecommender;
   ```

2. **Add TypeScript Types**
   ```typescript
   // src/types/recommendations.ts

   import type { Element } from './celestial';

   export interface ElementalProperties {
     Fire: number;
     Water: number;
     Earth: number;
     Air: number;
   }

   export interface AlchemicalProperties {
     Spirit: number;
     Essence: number;
     Matter: number;
     Substance: number;
   }

   export interface ThermodynamicProperties {
     heat: number;
     entropy: number;
     reactivity: number;
     gregsEnergy: number;
     kalchm: number;
     monica: number;
   }

   export interface EnhancedIngredient {
     id: string;
     name: string;
     category: string;
     description?: string;
     elementalProperties: ElementalProperties;
     alchemicalProperties?: AlchemicalProperties;
     thermodynamicProperties?: ThermodynamicProperties;
     kalchmScore: number;
     harmonyCurrent: number;
     seasonal: {
       bestSeasons: string[];
       currentSuitability: number;
     };
   }

   export interface EnhancedRecipe {
     id: string;
     name: string;
     cuisine: string;
     description: string;
     ingredients: string[];
     cookingMethod: string;
     cookingTime: number;
     difficulty: 'Easy' | 'Medium' | 'Hard';
     elementalProperties: ElementalProperties;
     alchemicalProperties: AlchemicalProperties;
     thermodynamicProperties: ThermodynamicProperties;
     kalchmScore: number;
     harmonyCurrent: number;
   }

   export interface RecommendationContext {
     timestamp: number;
     season: string;
     timeOfDay: string;
     dominantElement: Element;
     harmony: number;
     rune?: {
       symbol: string;
       name: string;
       guidance: string;
     };
   }

   export interface RecommendationsResponse {
     items: (EnhancedIngredient | EnhancedRecipe)[];
     context: RecommendationContext;
     meta: {
       total: number;
       filtered: number;
       timestamp: number;
     };
   }
   ```

### Testing KalchmRecommender

**Test Checklist:**

```bash
# 1. Build succeeds
yarn build

# 2. Dev server starts without errors
yarn dev

# 3. Page loads without console errors
# Open http://localhost:3000/what-to-eat-next
# Check browser console (F12)

# 4. Recommendations display
# - Should see current moment summary
# - Should see list of recommendations
# - Should see scores for each item

# 5. Loading states work
# - Should show spinner while loading
# - Should transition to content when loaded

# 6. Error handling works
# - Kill backend or block network
# - Should show error message with retry button

# 7. Interactions work
# - Toggle between ingredients/recipes (if implemented)
# - Sort controls work (if implemented)
# - Cards are clickable/hoverable

# 8. Responsive design
# - Test on mobile viewport (DevTools)
# - Test on tablet viewport
# - Test on desktop
```

**Expected Output:**
- ✅ Page shows "KalchmRecommender" instead of "unavailable"
- ✅ Displays 1-18 recommendations with scores
- ✅ Shows current alchemical moment info
- ✅ No console errors
- ✅ Build completes successfully

---

## 🎯 OBJECTIVE 2: Implement IngredientRecommender Component

### Background Context

**Current Situation:**
- Location: `src/app/ingredients/page.tsx`
- Current Implementation: Placeholder div showing "Ingredient recommender component unavailable in this build."
- Page Status: ✅ Building and loading successfully
- Page Features: ✅ Navigation, state preservation, rune banner all working
- Backend Support: ✅ Complete (useEnhancedRecommendations hook ready)

**What IngredientRecommender Should Do:**
Display categorized ingredient recommendations with:
1. Category browser (Spices, Vegetables, Proteins, Grains, etc.)
2. Ingredient cards with scores and properties
3. Detail view for selected ingredients
4. Search/filter functionality
5. Integration with URL parameters (category, ingredient)

### Implementation Approach

#### Step-by-Step Implementation

1. **Create IngredientRecommender Component**
   ```typescript
   // src/components/recommendations/IngredientRecommender.tsx
   'use client';

   import React, { useEffect, useState, useMemo } from 'react';
   import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';
   import { useAlchemicalContext } from '@/contexts/AlchemicalContext';

   interface IngredientRecommenderProps {
     initialCategory?: string | null;
     initialSelectedIngredient?: string | null;
     isFullPageVersion?: boolean;
     onCategoryChange?: (category: string) => void;
     onIngredientSelect?: (ingredient: string) => void;
   }

   export const IngredientRecommender: React.FC<IngredientRecommenderProps> = ({
     initialCategory,
     initialSelectedIngredient,
     isFullPageVersion = false,
     onCategoryChange,
     onIngredientSelect
   }) => {
     // State
     const [selectedCategory, setSelectedCategory] = useState<string | null>(
       initialCategory || null
     );
     const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
       initialSelectedIngredient || null
     );
     const [searchQuery, setSearchQuery] = useState('');

     // Hooks
     const {
       ingredients,
       loading,
       error,
       getIngredientRecommendations
     } = useEnhancedRecommendations({
       datetime: new Date(),
       useBackendInfluence: true
     });

     const alchemicalContext = useAlchemicalContext();

     // Fetch recommendations
     useEffect(() => {
       void getIngredientRecommendations({
         category: selectedCategory || undefined,
         limit: isFullPageVersion ? 50 : 20
       });
     }, [selectedCategory, getIngredientRecommendations, isFullPageVersion]);

     // Categories (could be fetched from service)
     const categories = [
       { id: 'spices', name: 'Spices & Herbs', icon: '🌿' },
       { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
       { id: 'proteins', name: 'Proteins', icon: '🥩' },
       { id: 'grains', name: 'Grains & Legumes', icon: '🌾' },
       { id: 'dairy', name: 'Dairy', icon: '🧀' },
       { id: 'fruits', name: 'Fruits', icon: '🍎' },
       { id: 'oils', name: 'Oils & Fats', icon: '🫒' },
       { id: 'sweeteners', name: 'Sweeteners', icon: '🍯' }
     ];

     // Filter ingredients
     const filteredIngredients = useMemo(() => {
       if (!ingredients?.items) return [];

       return ingredients.items.filter(item => {
         const matchesSearch = !searchQuery ||
           item.name.toLowerCase().includes(searchQuery.toLowerCase());
         const matchesCategory = !selectedCategory ||
           item.category === selectedCategory;
         return matchesSearch && matchesCategory;
       });
     }, [ingredients, searchQuery, selectedCategory]);

     // Handlers
     const handleCategorySelect = (categoryId: string) => {
       setSelectedCategory(categoryId);
       setSelectedIngredient(null);
       onCategoryChange?.(categoryId);
     };

     const handleIngredientSelect = (ingredientId: string) => {
       setSelectedIngredient(ingredientId);
       onIngredientSelect?.(ingredientId);
     };

     // Render functions
     const renderCategoryGrid = () => {
       return (
         <div className="mb-6">
           <h3 className="text-lg font-semibold mb-3">Browse by Category</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {categories.map(category => (
               <button
                 key={category.id}
                 onClick={() => handleCategorySelect(category.id)}
                 className={`p-4 rounded-lg border-2 transition-all ${
                   selectedCategory === category.id
                     ? 'border-indigo-500 bg-indigo-50'
                     : 'border-gray-200 bg-white hover:border-indigo-300'
                 }`}
               >
                 <div className="text-3xl mb-2">{category.icon}</div>
                 <div className="text-sm font-medium">{category.name}</div>
               </button>
             ))}
           </div>
         </div>
       );
     };

     const renderSearchBar = () => {
       return (
         <div className="mb-6">
           <input
             type="text"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search ingredients..."
             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
           />
         </div>
       );
     };

     const renderIngredientCard = (ingredient: any) => {
       const isSelected = selectedIngredient === ingredient.id;

       return (
         <div
           key={ingredient.id}
           onClick={() => handleIngredientSelect(ingredient.id)}
           className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
             isSelected
               ? 'border-indigo-500 bg-indigo-50 shadow-lg'
               : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
           }`}
         >
           {/* Score badge */}
           <div className="flex items-start justify-between mb-2">
             <h4 className="text-lg font-semibold">{ingredient.name}</h4>
             <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
               {(ingredient.kalchmScore * 100).toFixed(0)}%
             </div>
           </div>

           {/* Category */}
           <div className="text-xs text-gray-500 mb-2">
             {ingredient.category}
           </div>

           {/* Elemental properties mini-view */}
           {ingredient.elementalProperties && (
             <div className="grid grid-cols-2 gap-1 text-xs">
               {Object.entries(ingredient.elementalProperties).map(([element, value]) => (
                 <div key={element} className="flex items-center gap-1">
                   <span className="font-medium">{element}:</span>
                   <span className="text-gray-600">
                     {((value as number) * 100).toFixed(0)}%
                   </span>
                 </div>
               ))}
             </div>
           )}

           {/* Expand for details */}
           {isSelected && ingredient.description && (
             <div className="mt-3 pt-3 border-t border-gray-200">
               <p className="text-sm text-gray-700">{ingredient.description}</p>

               {/* Detailed properties */}
               {ingredient.thermodynamicProperties && (
                 <div className="mt-3 space-y-1">
                   <div className="text-xs font-semibold text-gray-700">
                     Alchemical Properties:
                   </div>
                   <div className="text-xs space-y-1">
                     <div>Heat: {ingredient.thermodynamicProperties.heat?.toFixed(2)}</div>
                     <div>Entropy: {ingredient.thermodynamicProperties.entropy?.toFixed(2)}</div>
                     <div>Kalchm: {ingredient.thermodynamicProperties.kalchm?.toFixed(2)}</div>
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
       );
     };

     // Main render
     if (loading) {
       return (
         <div className="flex items-center justify-center p-12">
           <div className="text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
             <p className="text-gray-600">Loading ingredients...</p>
           </div>
         </div>
       );
     }

     if (error) {
       return (
         <div className="rounded-lg bg-red-50 border border-red-200 p-6">
           <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Ingredients</h3>
           <p className="text-red-600">{error.message || 'An unexpected error occurred'}</p>
           <button
             onClick={() => getIngredientRecommendations()}
             className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
           >
             Try Again
           </button>
         </div>
       );
     }

     return (
       <div className="p-6">
         {/* Current moment (if context available) */}
         {alchemicalContext && (
           <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
             <div className="flex items-center justify-between">
               <div>
                 <div className="text-sm text-gray-600">Dominant Element</div>
                 <div className="text-lg font-semibold">
                   {alchemicalContext.getDominantElement()}
                 </div>
               </div>
               <div>
                 <div className="text-sm text-gray-600">Harmony</div>
                 <div className="text-lg font-semibold">
                   {(alchemicalContext.getAlchemicalHarmony() * 100).toFixed(0)}%
                 </div>
               </div>
               <div>
                 <div className="text-sm text-gray-600">Season</div>
                 <div className="text-lg font-semibold capitalize">
                   {alchemicalContext.state.currentSeason}
                 </div>
               </div>
             </div>
           </div>
         )}

         {renderCategoryGrid()}
         {renderSearchBar()}

         {/* Selected category indicator */}
         {selectedCategory && (
           <div className="mb-4 flex items-center gap-2">
             <span className="text-sm text-gray-600">Showing:</span>
             <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
               {categories.find(c => c.id === selectedCategory)?.name}
             </span>
             <button
               onClick={() => {
                 setSelectedCategory(null);
                 setSearchQuery('');
               }}
               className="text-sm text-indigo-600 hover:text-indigo-800"
             >
               Clear filters
             </button>
           </div>
         )}

         {/* Ingredients grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredIngredients.map(renderIngredientCard)}
         </div>

         {filteredIngredients.length === 0 && (
           <div className="text-center py-12 text-gray-500">
             {searchQuery || selectedCategory
               ? 'No ingredients match your filters.'
               : 'No ingredients available at this time.'}
           </div>
         )}
       </div>
     );
   };

   export default IngredientRecommender;
   ```

2. **Update the Ingredients Page**
   ```typescript
   // src/app/ingredients/page.tsx
   'use client';

   import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';
   import { ArrowLeft, Home } from 'lucide-react';
   import { useRouter, useSearchParams } from 'next/navigation';
   import { useEffect, useState } from 'react';
   import { useNavigationContext, useScrollPreservation } from '@/hooks/useStatePreservation';
   import { IngredientRecommender } from '@/components/recommendations/IngredientRecommender';

   export default function IngredientsPage() {
     const searchParams = useSearchParams();
     const router = useRouter();
     const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
     const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);

     const { preserveContext, restoreContext } = useNavigationContext();
     const { restoreScrollPosition } = useScrollPreservation('ingredients-page');

     // Restore context from URL or state preservation
     useEffect(() => {
       const categoryParam = searchParams?.get('category');
       const ingredientParam = searchParams?.get('ingredient');

       if (categoryParam) setSelectedCategory(categoryParam);
       if (ingredientParam) setSelectedIngredient(ingredientParam);

       if (!categoryParam && !ingredientParam) {
         const restoredContext = restoreContext();
         if (restoredContext) {
           if (restoredContext.selectedIngredientCategory) {
             setSelectedCategory(restoredContext.selectedIngredientCategory);
           }
           if (restoredContext.selectedIngredient) {
             setSelectedIngredient(restoredContext.selectedIngredient);
           }
         }
       }

       setTimeout(() => restoreScrollPosition(), 100);
     }, [searchParams, restoreContext, restoreScrollPosition]);

     const handleBackToMain = () => {
       preserveContext({
         fromPage: 'ingredients',
         selectedItems: selectedIngredient ? [selectedIngredient] : [],
         activeSection: 'ingredients',
         scrollPosition: window.scrollY,
         timestamp: Date.now()
       });
       router.push('/#ingredients');
     };

     const handleGoHome = () => {
       router.push('/');
     };

     // Update URL when selections change
     const handleCategoryChange = (category: string) => {
       setSelectedCategory(category);
       const params = new URLSearchParams();
       params.set('category', category);
       router.push(`/ingredients?${params.toString()}`);
     };

     const handleIngredientSelect = (ingredient: string) => {
       setSelectedIngredient(ingredient);
       const params = new URLSearchParams(window.location.search);
       params.set('ingredient', ingredient);
       router.push(`/ingredients?${params.toString()}`);
     };

     // Enhanced ingredient recommendations context (rune/agent banner)
     const {
       ingredients: enhancedIngredients,
       loading: recLoading,
       error: recError,
       getIngredientRecommendations
     } = useEnhancedRecommendations({
       datetime: new Date(),
       useBackendInfluence: true
     });

     useEffect(() => {
       void getIngredientRecommendations();
     }, [getIngredientRecommendations]);

     return (
       <div className='min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100'>
         <div className='container mx-auto px-4 py-8'>
           {/* Header with navigation */}
           <header className='mb-8'>
             <div className='mb-4 flex items-center justify-between'>
               <div className='flex items-center gap-4'>
                 <button
                   onClick={handleBackToMain}
                   className='flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800'
                 >
                   <ArrowLeft size={20} />
                   Back to Main
                 </button>
                 <button
                   onClick={handleGoHome}
                   className='flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800'
                 >
                   <Home size={20} />
                   Home
                 </button>
               </div>
             </div>

             <div className='text-center'>
               <h1 className='mb-2 text-3xl font-bold text-indigo-900 md:text-4xl'>
                 Ingredient Recommendations
               </h1>
               <p className='mb-4 text-indigo-600'>
                 Explore ingredients aligned with current celestial energies
               </p>

               {/* Context indicators */}
               {(selectedCategory || selectedIngredient) && (
                 <div className='inline-flex items-center gap-4 rounded-lg bg-white px-4 py-2 shadow-sm'>
                   {selectedCategory && (
                     <span className='text-sm text-gray-600'>
                       Category: <span className='font-medium text-indigo-600'>{selectedCategory}</span>
                     </span>
                   )}
                   {selectedIngredient && (
                     <span className='text-sm text-gray-600'>
                       Selected: <span className='font-medium text-indigo-600'>{selectedIngredient}</span>
                     </span>
                   )}
                 </div>
               )}
             </div>
           </header>

           {/* Main content */}
           <main className='mx-auto max-w-6xl'>
             <div className='rounded-lg bg-white p-6 shadow-md'>
               {/* Rune banner */}
               {!recLoading && !recError && enhancedIngredients?.context?.rune && (
                 <div className='mb-4 flex items-center gap-3 rounded-md bg-indigo-50 p-3'>
                   <div className='text-2xl'>{enhancedIngredients.context.rune.symbol}</div>
                   <div>
                     <div className='text-sm font-semibold'>
                       {enhancedIngredients.context.rune.name}
                     </div>
                     <div className='text-xs text-indigo-700'>
                       {enhancedIngredients.context.rune.guidance}
                     </div>
                   </div>
                 </div>
               )}

               {/* Ingredient Recommender */}
               <IngredientRecommender
                 initialCategory={selectedCategory}
                 initialSelectedIngredient={selectedIngredient}
                 isFullPageVersion={true}
                 onCategoryChange={handleCategoryChange}
                 onIngredientSelect={handleIngredientSelect}
               />
             </div>
           </main>
         </div>
       </div>
     );
   }
   ```

### Testing IngredientRecommender

**Test Checklist:**

```bash
# 1. Build succeeds
yarn build

# 2. Page loads
# Open http://localhost:3000/ingredients

# 3. Category selection works
# - Click on category buttons
# - Should filter ingredients
# - URL should update with ?category=spices

# 4. Search works
# - Type in search box
# - Results should filter in real-time

# 5. Ingredient selection works
# - Click on ingredient card
# - Should expand to show details
# - URL should update with ?ingredient=tomato

# 6. Navigation works
# - "Back to Main" button works
# - "Home" button works
# - State preservation on navigation

# 7. Rune banner displays
# - Should show if recommendations have context

# 8. Responsive design
# - Test mobile, tablet, desktop viewports
```

**Expected Output:**
- ✅ Page shows "IngredientRecommender" with categories
- ✅ Category filtering works
- ✅ Search filtering works
- ✅ Ingredient selection shows details
- ✅ URL params update correctly
- ✅ No console errors

---

## 🎯 OBJECTIVE 3: Fix Cooking Method Data Exports

### Background Context

**Issue:** Build warnings about missing exports:
```
Attempted import error: 'pressureCooking' is not exported from './pressure-cooking'
export 'sousVide' (reexported as 'sousVide') was not found in './sous-vide' (possible exports: _sousVide)
```

**Impact:** Cooking methods page may have incomplete data

### Fix Approach

#### Option A: Add Non-Underscore Exports (RECOMMENDED)

**Steps:**

1. **Find the Affected Files**
   ```bash
   find src/data/cooking/methods -name "*pressure-cooking*" -o -name "*sous-vide*"
   ```

2. **Check Current Exports**
   ```bash
   grep "export" src/data/cooking/methods/wet/pressure-cooking.ts
   grep "export" src/data/cooking/methods/wet/sous-vide.ts
   ```

3. **Add Non-Underscore Exports**
   ```typescript
   // src/data/cooking/methods/wet/pressure-cooking.ts

   // Existing export (underscore-prefixed)
   export const _pressureCooking = {
     // ... method data
   };

   // Add non-underscore export
   export const pressureCooking = _pressureCooking;
   ```

   ```typescript
   // src/data/cooking/methods/wet/sous-vide.ts

   // Existing export (underscore-prefixed)
   export const _sousVide = {
     // ... method data
   };

   // Add non-underscore export
   export const sousVide = _sousVide;
   ```

4. **Verify Imports**
   ```bash
   grep -r "import.*pressureCooking\|import.*sousVide" src/data/cooking/methods/
   ```

5. **Test Build**
   ```bash
   yarn build 2>&1 | grep -i "pressure\|sous"
   ```

#### Option B: Update Import Statements

**Alternative if you want to keep underscore convention:**

1. **Find Import Statements**
   ```bash
   grep -r "import.*pressureCooking" src/
   grep -r "import.*sousVide" src/
   ```

2. **Update to Use Underscore Imports**
   ```typescript
   // src/data/cooking/methods/wet/index.ts

   // OLD:
   import { pressureCooking } from './pressure-cooking';
   import { sousVide } from './sous-vide';

   // NEW:
   import { _pressureCooking as pressureCooking } from './pressure-cooking';
   import { _sousVide as sousVide } from './sous-vide';
   ```

### Testing

```bash
# 1. Build should complete without warnings
yarn build 2>&1 | grep -i "pressure\|sous"

# 2. Cooking methods page should load all methods
# Open http://localhost:3000/cooking-methods
# Click "Wet" tab
# Should see "Pressure Cooking" and "Sous Vide" in the list

# 3. Check data is accessible
# Open browser console
# Navigate to cooking methods page
# Should see methods in rendered output
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Pre-Implementation

- [ ] Read [INCOMPLETE_IMPLEMENTATIONS.md](INCOMPLETE_IMPLEMENTATIONS.md)
- [ ] Read [INVESTIGATION_SUMMARY.md](INVESTIGATION_SUMMARY.md)
- [ ] Read [CLAUDE.md](CLAUDE.md) for coding standards
- [ ] Verify build is currently successful (`yarn build`)
- [ ] Create new branch: `git checkout -b phase-3-implementation`

### KalchmRecommender Implementation

- [ ] Create component file: `src/components/recommendations/KalchmRecommender.tsx`
- [ ] Implement current moment display
- [ ] Implement recommendations grid
- [ ] Implement loading states
- [ ] Implement error handling
- [ ] Add TypeScript types
- [ ] Update `/what-to-eat-next/page.tsx` to use component
- [ ] Test build: `yarn build`
- [ ] Test in browser: `yarn dev`
- [ ] Verify no console errors
- [ ] Test loading states (network throttling)
- [ ] Test error states (block API)
- [ ] Test responsive design
- [ ] Commit changes

### IngredientRecommender Implementation

- [ ] Create component file: `src/components/recommendations/IngredientRecommender.tsx`
- [ ] Implement category grid
- [ ] Implement search functionality
- [ ] Implement ingredient cards
- [ ] Implement detail view
- [ ] Implement URL parameter handling
- [ ] Add TypeScript types
- [ ] Update `/ingredients/page.tsx` to use component
- [ ] Test build: `yarn build`
- [ ] Test in browser: `yarn dev`
- [ ] Verify category filtering works
- [ ] Verify search works
- [ ] Verify URL params update
- [ ] Verify state preservation
- [ ] Test responsive design
- [ ] Commit changes

### Data Export Fixes

- [ ] Find affected files
- [ ] Check current exports
- [ ] Add non-underscore exports OR update imports
- [ ] Test build has no warnings
- [ ] Test cooking methods page loads all methods
- [ ] Verify "Wet" category shows all methods
- [ ] Commit changes

### Final Verification

- [ ] Run full build: `yarn build`
- [ ] Verify build time < 15 seconds
- [ ] Verify 21+ pages generated
- [ ] Test all restored pages load:
  - [ ] `/` (home)
  - [ ] `/what-to-eat-next`
  - [ ] `/ingredients`
  - [ ] `/cuisines`
  - [ ] `/cooking-methods`
- [ ] Test API endpoints:
  - [ ] `/api/health`
  - [ ] `/api/current-moment`
  - [ ] `/api/recipes`
- [ ] Check browser console for errors
- [ ] Test responsive layouts
- [ ] Run linter: `yarn lint`
- [ ] Create PR or merge to main

---

## 🔧 TROUBLESHOOTING

### Issue: "Cannot find module '@/components/recommendations/...'"

**Solution:**
```bash
# Verify directory exists
ls -la src/components/recommendations/

# Create directory if needed
mkdir -p src/components/recommendations

# Verify tsconfig paths
grep "paths" tsconfig.json
```

### Issue: "Type errors in new component"

**Solution:**
```bash
# Check if types exist
ls -la src/types/recommendations.ts

# Run type check
yarn tsc --noEmit src/components/recommendations/KalchmRecommender.tsx

# Add missing imports
# Use existing types from src/types/celestial.ts, src/types/unified.ts
```

### Issue: "useEnhancedRecommendations returns undefined"

**Solution:**
```typescript
// Check hook is exported
grep "export.*useEnhancedRecommendations" src/hooks/useEnhancedRecommendations.ts

// Verify import path
import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';

// Add null checks
if (!ingredients?.items) {
  return <div>Loading...</div>;
}
```

### Issue: "AlchemicalContext is undefined"

**Solution:**
```typescript
// Wrap component in provider if not already
<AlchemicalProvider>
  <KalchmRecommender />
</AlchemicalProvider>

// Or check if context is available before using
const alchemicalContext = useAlchemicalContext();
if (!alchemicalContext) {
  // Handle no context case
  return null;
}
```

### Issue: "Build succeeds but page shows errors in browser"

**Solution:**
```bash
# Check browser console (F12) for specific error
# Common issues:

# 1. Missing 'use client' directive
# Add to top of component file:
'use client';

# 2. Server/client mismatch
# Ensure client-side-only code is in useEffect:
useEffect(() => {
  // Client-side code here
}, []);

# 3. Circular dependencies
# Check import order, may need dynamic imports
```

---

## 📊 SUCCESS CRITERIA

### Minimum Viable Implementation (MVP)

- ✅ KalchmRecommender displays on `/what-to-eat-next`
- ✅ Shows at least 5 recommendations with scores
- ✅ IngredientRecommender displays on `/ingredients`
- ✅ Category filtering works
- ✅ No placeholder "unavailable" messages
- ✅ Build completes successfully
- ✅ No console errors on page load

### Full Implementation

- ✅ All MVP criteria
- ✅ Current moment display with alchemical data
- ✅ Loading states with spinners
- ✅ Error handling with retry buttons
- ✅ Search functionality in ingredients
- ✅ Detail views expand on selection
- ✅ URL parameter handling for deep linking
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations and transitions
- ✅ Cooking method exports fixed
- ✅ No build warnings

### Excellence Implementation

- ✅ All Full Implementation criteria
- ✅ Sorting controls
- ✅ Advanced filtering options
- ✅ Keyboard navigation support
- ✅ Loading skeletons instead of spinners
- ✅ Optimistic UI updates
- ✅ Accessibility (ARIA labels, focus management)
- ✅ Performance optimized (memoization, virtualization)
- ✅ Unit tests for components
- ✅ Documentation comments

---

## 🎓 CODING STANDARDS (From CLAUDE.md)

### Casing Conventions (CRITICAL)

```typescript
// Elements - Capitalized
type Element = 'Fire' | 'Water' | 'Earth' | 'Air';

// Planets - Capitalized
type Planet = 'Sun' | 'Moon' | 'Mercury' | 'Venus';

// Zodiac Signs - Lowercase
type ZodiacSign = 'aries' | 'taurus' | 'gemini';

// Alchemical Properties - Capitalized
type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';

// Cuisine Types - Capitalized with hyphens
type CuisineType = 'Italian' | 'Mexican' | 'Middle-Eastern';
```

### Key Principles

1. **NEVER use lazy fixes or placeholder functionality**
2. **ALWAYS use existing codebase functionality**
3. **Follow proven casing conventions**
4. **No opposing elements concept** (Fire doesn't oppose Water)
5. **Use systematic approaches**

### ESMS Calculations

**The ONLY Correct Way:**
```typescript
import { calculateAlchemicalFromPlanets } from '@/utils/planetaryAlchemyMapping';

const alchemical = calculateAlchemicalFromPlanets({
  Sun: 'Gemini',
  Moon: 'Leo',
  Mercury: 'Taurus',
  // ... other planets
});
```

### Type Safety

- Never use `as any` - use proper type assertions
- Prefix unused variables with underscore: `_unusedVar`
- Use `@/` path aliases for imports
- Interface-first development

---

## 📦 RESOURCES

### Key Files to Reference

**Services:**
- `src/services/index.ts` - Service manager
- `src/services/UnifiedScoringService.ts` - Scoring logic

**Utilities:**
- `src/utils/planetaryAlchemyMapping.ts` - ESMS calculations
- `src/utils/hierarchicalRecipeCalculations.ts` - Recipe computation
- `src/utils/cuisineAggregations.ts` - Statistical signatures

**Hooks:**
- `src/hooks/useEnhancedRecommendations.ts` - Main recommendation hook
- `src/hooks/useStatePreservation.ts` - Navigation state preservation

**Types:**
- `src/types/celestial.ts` - Core types (Planet, Element, ESMS)
- `src/types/unified.ts` - Unified data types

**Contexts:**
- `src/contexts/AlchemicalContext/` - Alchemical state management

**Templates:**
- `src/components/EnhancedRecommendationEngine.tsx` - Recommendation UI template
- `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` - Working example

### Commands

```bash
# Development
yarn dev                          # Start dev server
yarn build                        # Production build
yarn lint                         # Run ESLint
yarn lint --fix                   # Auto-fix issues
yarn tsc --noEmit                 # Type check only

# Testing specific page
curl http://localhost:3000/what-to-eat-next

# Check API
curl -X POST http://localhost:3000/api/current-moment \
  -H "Content-Type: application/json" \
  -d '{}'

# Find component
find src -name "*Recommender*"

# Search for usage
grep -r "useEnhancedRecommendations" src/
```

### External Dependencies

**Backend API:**
- URL: `https://alchm-backend.onrender.com`
- Status: Currently unavailable (timeouts)
- Fallback: Application uses fallback modes
- Note: Will need to wake up backend (cold start on Render.com)

**Frontend Libraries:**
- React 19
- Next.js 15.3.4
- TypeScript 5.7.3
- Tailwind CSS (styling)
- Material-UI (@mui/material) - used in cooking-methods
- Lucide React (icons)

---

## 📝 DELIVERABLES

### Code Deliverables

1. **KalchmRecommender Component**
   - File: `src/components/recommendations/KalchmRecommender.tsx`
   - Export: `export const KalchmRecommender`
   - Tests: Component renders, displays data, handles errors

2. **IngredientRecommender Component**
   - File: `src/components/recommendations/IngredientRecommender.tsx`
   - Export: `export const IngredientRecommender`
   - Tests: Category filtering, search, selection work

3. **Type Definitions** (if needed)
   - File: `src/types/recommendations.ts`
   - Exports: `EnhancedIngredient`, `EnhancedRecipe`, etc.

4. **Updated Pages**
   - File: `src/app/what-to-eat-next/page.tsx` (using KalchmRecommender)
   - File: `src/app/ingredients/page.tsx` (using IngredientRecommender)

5. **Data Export Fixes**
   - Files: Cooking method data files with fixed exports

### Documentation Deliverables

1. **Implementation Notes**
   - File: `PHASE_3_IMPLEMENTATION_NOTES.md`
   - Content: What was implemented, decisions made, challenges overcome

2. **Updated INCOMPLETE_IMPLEMENTATIONS.md**
   - Remove completed items
   - Update status of remaining items

3. **Component Documentation**
   - JSDoc comments in component files
   - Props interfaces with descriptions
   - Usage examples in comments

### Testing Deliverables

1. **Manual Test Results**
   - Checklist completed (from this prompt)
   - Screenshots of working features
   - Browser console logs (no errors)

2. **Build Verification**
   - Build output showing success
   - List of generated pages (21+)
   - Build time confirmation (< 15s)

---

## 🚀 NEXT STEPS AFTER PHASE 3

Once Phase 3 is complete, consider:

1. **Phase 4: Enhanced Features**
   - Complete recipe building methods
   - Implement seasonal calculations
   - Add cuisine aggregation enhancements

2. **Phase 5: User Experience Polish**
   - Add animations and transitions
   - Implement keyboard navigation
   - Add accessibility features
   - Create loading skeletons

3. **Phase 6: Backend Integration**
   - Verify backend deployment
   - Implement retry logic
   - Add fallback UI indicators
   - Create offline mode

4. **Phase 7: Testing & Deployment**
   - Write unit tests
   - Add integration tests
   - Performance optimization
   - Production deployment

---

## ✅ FINAL CHECKLIST

Before starting:
- [ ] Read entire prompt thoroughly
- [ ] Review [INCOMPLETE_IMPLEMENTATIONS.md](INCOMPLETE_IMPLEMENTATIONS.md)
- [ ] Review [INVESTIGATION_SUMMARY.md](INVESTIGATION_SUMMARY.md)
- [ ] Review [CLAUDE.md](CLAUDE.md)
- [ ] Verify current build is successful
- [ ] Create new git branch
- [ ] Have dev server running for testing

During implementation:
- [ ] Follow coding standards strictly
- [ ] Test frequently during development
- [ ] Commit after each completed objective
- [ ] Document decisions and challenges
- [ ] Ask questions if anything is unclear

After completion:
- [ ] All three objectives completed
- [ ] All tests pass
- [ ] Build succeeds without warnings
- [ ] No console errors in browser
- [ ] Documentation updated
- [ ] Code committed and pushed
- [ ] Ready for PR/review

---

**End of Phase 3 Implementation Prompt**

*This prompt provides everything needed to implement the core missing features of WhatToEatNext. Follow the steps systematically, test frequently, and maintain code quality. Good luck!* 🚀
