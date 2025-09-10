[2025-09-10T03:55:19.747Z] ESLint Mass Reduction Campaign - Phase 12.2 Started
[2025-09-10T03:55:19.772Z] Target: Reduce 7,089 violations to <500 (93%+ reduction)
[2025-09-10T03:55:19.772Z] Starting ESLint Mass Reduction Campaign - Phase 12.2
[2025-09-10T03:55:19.773Z] Target: Reduce 7,089 violations to <500 (93%+ reduction)
[2025-09-10T03:55:19.774Z] 
=== Phase 1: Fixing Critical Parsing Errors ===
[2025-09-10T03:55:19.774Z] Fixing parsing errors in: src/utils/astrologyUtils.ts
[2025-09-10T03:55:19.779Z]   ✅ Fixed octal literals in src/utils/astrologyUtils.ts
[2025-09-10T03:55:19.788Z]   ✅ Fixed syntax errors in src/utils/astrologyUtils.ts
[2025-09-10T03:55:19.789Z] Fixing parsing errors in: src/utils/elementalUtils.ts
[2025-09-10T03:55:19.793Z]   ✅ Fixed octal literals in src/utils/elementalUtils.ts
[2025-09-10T03:55:19.800Z]   ✅ Fixed syntax errors in src/utils/elementalUtils.ts
[2025-09-10T03:55:19.800Z] Fixing parsing errors in: src/utils/accurateAstronomy.ts
[2025-09-10T03:55:19.804Z]   ✅ Fixed octal literals in src/utils/accurateAstronomy.ts
[2025-09-10T03:55:19.808Z]   ✅ Fixed syntax errors in src/utils/accurateAstronomy.ts
[2025-09-10T03:55:19.809Z] Fixing parsing errors in: src/lib/alchemicalEngine.ts
[2025-09-10T03:55:19.811Z]   ✅ Fixed octal literals in src/lib/alchemicalEngine.ts
[2025-09-10T03:55:19.815Z]   ✅ Fixed syntax errors in src/lib/alchemicalEngine.ts
[2025-09-10T03:55:19.816Z] Fixing parsing errors in: src/calculations/gregsEnergy.ts
[2025-09-10T03:55:19.817Z]   ✅ Fixed octal literals in src/calculations/gregsEnergy.ts
[2025-09-10T03:55:19.823Z]   ✅ Fixed syntax errors in src/calculations/gregsEnergy.ts
[2025-09-10T03:55:19.825Z] Fixing parsing errors in: src/data/integrations/seasonal.ts
[2025-09-10T03:55:19.828Z]   ✅ Fixed octal literals in src/data/integrations/seasonal.ts
[2025-09-10T03:55:19.830Z]   ✅ Fixed syntax errors in src/data/integrations/seasonal.ts
[2025-09-10T03:55:19.831Z] Fixing parsing errors in: src/contexts/AlchemicalContext/server.ts
[2025-09-10T03:55:19.832Z]   ✅ Fixed octal literals in src/contexts/AlchemicalContext/server.ts
[2025-09-10T03:55:19.833Z]   ✅ Fixed syntax errors in src/contexts/AlchemicalContext/server.ts
[2025-09-10T03:55:19.833Z] Fixing parsing errors in: src/data/unified/unifiedFlavorEngine.ts
[2025-09-10T03:55:19.835Z]   ✅ Fixed octal literals in src/data/unified/unifiedFlavorEngine.ts
[2025-09-10T03:55:19.841Z]   ✅ Fixed syntax errors in src/data/unified/unifiedFlavorEngine.ts
[2025-09-10T03:55:19.841Z] Fixing parsing errors in: src/data/ingredients/fruits/index.ts
[2025-09-10T03:55:19.844Z]   ✅ Fixed octal literals in src/data/ingredients/fruits/index.ts
[2025-09-10T03:55:19.877Z]   ✅ Fixed syntax errors in src/data/ingredients/fruits/index.ts
[2025-09-10T03:55:19.878Z] Fixing parsing errors in: src/services/AlchemicalRecommendationService.ts
[2025-09-10T03:55:19.878Z]   ✅ Fixed octal literals in src/services/AlchemicalRecommendationService.ts
[2025-09-10T03:55:19.880Z]   ✅ Fixed syntax errors in src/services/AlchemicalRecommendationService.ts
[2025-09-10T03:55:19.880Z] ✅ Phase 1 Complete: Fixed parsing errors in 20 files
[2025-09-10T03:55:19.880Z] Validating build stability...
[2025-09-10T03:55:29.924Z] ❌ Build validation failed
[2025-09-10T03:55:29.924Z] Build error: Command failed: yarn build
Failed to compile.

./src/calculations/alchemicalTransformation.ts
Error:   [31mx[0m Expected ',', got 'numeric literal (0.15, .15)'
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/calculations/alchemicalTransformation.ts[0m:318:1]
 [2m315[0m | 
 [2m316[0m |     // Calculate base enhancement factor - stronger effect on dominant elements
 [2m317[0m |     // Enhanced by planetary boost, but cap the enhancement factor to prevent excessive values
 [2m318[0m |     const enhancementFactor = Math.min(0.10.15 * planetaryBoost) * 0.5;
     : [35;1m                                           ^^^[0m
 [2m319[0m | 
 [2m320[0m |     // Get the dominant original element to preserve character
 [2m321[0m |     const dominantElement = getDominantElement(originalProperties);
     `----

Caused by:
    Syntax Error

Import trace for requested module:
./src/calculations/alchemicalTransformation.ts
./src/utils/alchemicalTransformationUtils.ts
./src/utils/testRecommendations.ts
./src/app/debug/page.tsx

./src/constants/alchemicalPillars.ts
Error:   [31mx[0m Legacy octal literals are not available when targeting ECMAScript 5 and higher
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/constants/alchemicalPillars.ts[0m:616:1]
 [2m613[0m |       .sort((ab) => b.compatibility - a.compatibility);
 [2m614[0m | 
 [2m615[0m |     return {
 [2m616[0m |       recommendations: compatibleMethods.slice(05),
     : [35;1m                                               ^^[0m
 [2m617[0m |       analysis: {
 [2m618[0m |         totalOptions: compatibleMethods.length,
 [2m619[0m |         averageCompatibility:
     `----
  [31mx[0m Legacy octal escape is not permitted in strict mode
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/constants/alchemicalPillars.ts[0m:616:1]
 [2m613[0m |       .sort((ab) => b.compatibility - a.compatibility);
 [2m614[0m | 
 [2m615[0m |     return {
 [2m616[0m |       recommendations: compatibleMethods.slice(05),
     : [35;1m                                               ^^[0m
 [2m617[0m |       analysis: {
 [2m618[0m |         totalOptions: compatibleMethods.length,
 [2m619[0m |         averageCompatibility:
     `----
  [31mx[0m Legacy octal literals are not available when targeting ECMAScript 5 and higher
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/constants/alchemicalPillars.ts[0m:809:1]
 [2m806[0m |       .sort((ab) => b.compatibility - a.compatibility);
 [2m807[0m | 
 [2m808[0m |     return {
 [2m809[0m |       recommendations: compatibleElements.slice(05),
     : [35;1m                                                ^^[0m
 [2m810[0m |       analysis: {
 [2m811[0m |         totalOptions: compatibleElements.length,
 [2m812[0m |         averageCompatibility:
     `----
  [31mx[0m Legacy octal escape is not permitted in strict mode
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/constants/alchemicalPillars.ts[0m:809:1]
 [2m806[0m |       .sort((ab) => b.compatibility - a.compatibility);
 [2m807[0m | 
 [2m808[0m |     return {
 [2m809[0m |       recommendations: compatibleElements.slice(05),
     : [35;1m                                                ^^[0m
 [2m810[0m |       analysis: {
 [2m811[0m |         totalOptions: compatibleElements.length,
 [2m812[0m |         averageCompatibility:
     `----
  [31mx[0m Legacy octal literals are not available when targeting ECMAScript 5 and higher
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/constants/alchemicalPillars.ts[0m:948:1]
 [2m945[0m |       .sort((ab) => b.compatibility - a.compatibility);
 [2m946[0m | 
 [2m947[0m |     return {
 [2m948[0m |       recommendations: compatiblePlanets.slice(05),
     : [35;1m                                               ^^[0m
 [2m949[0m |       analysis: {
 [2m950[0m |         totalOptions: compatiblePlanets.length,
 [2m951[0m |         averageCompatibility:
     `----
  [31mx[0m Legacy octal escape is not permitted in strict mode
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/constants/alchemicalPillars.ts[0m:948:1]
 [2m945[0m |       .sort((ab) => b.compatibility - a.compatibility);
 [2m946[0m | 
 [2m947[0m |     return {
 [2m948[0m |       recommendations: compatiblePlanets.slice(05),
     : [35;1m                                               ^^[0m
 [2m949[0m |       analysis: {
 [2m950[0m |         totalOptions: compatiblePlanets.length,
 [2m951[0m |         averageCompatibility:
     `----
  [31mx[0m Legacy octal literals are not available when targeting ECMAScript 5 and higher
      ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/constants/alchemicalPillars.ts[0m:1096:1]
 [2m1093[0m |       .sort((ab) => b.compatibility - a.compatibility);
 [2m1094[0m | 
 [2m1095[0m |     return {
 [2m1096[0m |       recommendations: compatibleCards.slice(05),
      : [35;1m                                             ^^[0m
 [2m1097[0m |       analysis: {
 [2m1098[0m |         totalOptions: compatibleCards.length,
 [2m1099[0m |         averageCompatibility:
      `----
  [31mx[0m Legacy octal escape is not permitted in strict mode
      ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/constants/alchemicalPillars.ts[0m:1096:1]
 [2m1093[0m |       .sort((ab) => b.compatibility - a.compatibility);
 [2m1094[0m | 
 [2m1095[0m |     return {
 [2m1096[0m |       recommendations: compatibleCards.slice(05),
      : [35;1m                                             ^^[0m
 [2m1097[0m |       analysis: {
 [2m1098[0m |         totalOptions: compatibleCards.length,
 [2m1099[0m |         averageCompatibility:
      `----

Caused by:
    Syntax Error

Import trace for requested module:
./src/constants/alchemicalPillars.ts
./src/utils/alchemicalPillarUtils.ts
./src/utils/testRecommendations.ts
./src/app/debug/page.tsx

./src/services/AlchemicalRecommendationService.ts
Error:   [31mx[0m Expected '{', got 'interface'
    ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/services/AlchemicalRecommendationService.ts[0m:17:1]
 [2m14[0m | /**
 [2m15[0m |  * AlchemicalRecommendation interface for providing structured recommendations
 [2m16[0m |  */
 [2m17[0m | export interface AlchemicalRecommendation {
    : [35;1m       ^^^^^^^^^[0m
 [2m18[0m |   dominantElement: keyof ElementalProperties;,
 [2m19[0m |   thermodynamics: ThermodynamicProperties;
 [2m20[0m |   recommendedIngredients: string[];,
    `----

Caused by:
    Syntax Error

Import trace for requested module:
./src/services/AlchemicalRecommendationService.ts
./src/services/ServicesManager.ts
./src/services/index.ts
./src/hooks/useServices.ts
./src/app/test/migrated-components/cuisine-section/page.tsx

./src/services/UnifiedIngredientService.ts
Error:   [31mx[0m Legacy octal literals are not available when targeting ECMAScript 5 and higher
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/services/UnifiedIngredientService.ts[0m:539:1]
 [2m536[0m |     return {
 [2m537[0m |       overallHarmony: 0.5,
 [2m538[0m |       flavorProfile,
 [2m539[0m |       strongPairings: strongPairings.slice(05),
     : [35;1m                                           ^^[0m
 [2m540[0m |       weakPairings: weakPairings.slice(05),
 [2m541[0m |     };
 [2m542[0m |   }
     `----
  [31mx[0m Legacy octal escape is not permitted in strict mode
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/services/UnifiedIngredientService.ts[0m:539:1]
 [2m536[0m |     return {
 [2m537[0m |       overallHarmony: 0.5,
 [2m538[0m |       flavorProfile,
 [2m539[0m |       strongPairings: strongPairings.slice(05),
     : [35;1m                                           ^^[0m
 [2m540[0m |       weakPairings: weakPairings.slice(05),
 [2m541[0m |     };
 [2m542[0m |   }
     `----
  [31mx[0m Legacy octal literals are not available when targeting ECMAScript 5 and higher
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/services/UnifiedIngredientService.ts[0m:540:1]
 [2m537[0m |       overallHarmony: 0.5,
 [2m538[0m |       flavorProfile,
 [2m539[0m |       strongPairings: strongPairings.slice(05),
 [2m540[0m |       weakPairings: weakPairings.slice(05),
     : [35;1m                                       ^^[0m
 [2m541[0m |     };
 [2m542[0m |   }
     `----
  [31mx[0m Legacy octal escape is not permitted in strict mode
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/services/UnifiedIngredientService.ts[0m:540:1]
 [2m537[0m |       overallHarmony: 0.5,
 [2m538[0m |       flavorProfile,
 [2m539[0m |       strongPairings: strongPairings.slice(05),
 [2m540[0m |       weakPairings: weakPairings.slice(05),
     : [35;1m                                       ^^[0m
 [2m541[0m |     };
 [2m542[0m |   }
     `----

Caused by:
    Syntax Error

Import trace for requested module:
./src/services/UnifiedIngredientService.ts
./src/services/ServicesManager.ts
./src/services/index.ts
./src/hooks/useServices.ts
./src/app/test/migrated-components/cuisine-section/page.tsx

./src/services/UnifiedRecipeService.ts
Error:   [31mx[0m Legacy octal literals are not available when targeting ECMAScript 5 and higher
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/services/UnifiedRecipeService.ts[0m:99:1]
 [2m 96[0m |     try {
 [2m 97[0m |       const allRecipes = await this.getAllRecipes();
 [2m 98[0m |       // Simple implementation for now
 [2m 99[0m |       const matches = allRecipes.slice(010);
     : [35;1m                                       ^^^[0m
 [2m100[0m |       return matches as unknown as ExtendedRecipe[];
 [2m101[0m |     } catch (error) {
 [2m102[0m |       console.error('Error getting best recipe matches:', error);
     `----
  [31mx[0m Legacy octal escape is not permitted in strict mode
     ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/services/UnifiedRecipeService.ts[0m:99:1]
 [2m 96[0m |     try {
 [2m 97[0m |       const allRecipes = await this.getAllRecipes();
 [2m 98[0m |       // Simple implementation for now
 [2m 99[0m |       const matches = allRecipes.slice(010);
     : [35;1m                                       ^^^[0m
 [2m100[0m |       return matches as unknown as ExtendedRecipe[];
 [2m101[0m |     } catch (error) {
 [2m102[0m |       console.error('Error getting best recipe matches:', error);
     `----

Caused by:
    Syntax Error

Import trace for requested module:
./src/services/UnifiedRecipeService.ts
./src/services/ServicesManager.ts
./src/services/index.ts
./src/hooks/useServices.ts
./src/app/test/migrated-components/cuisine-section/page.tsx


> Build failed because of webpack errors

[2025-09-10T03:55:29.925Z] 
❌ Campaign failed: Phase 1 failed: Could not fix critical parsing errors
[2025-09-10T03:55:29.925Z] Backup available at: .eslint-mass-reduction-backup-1757476519747
