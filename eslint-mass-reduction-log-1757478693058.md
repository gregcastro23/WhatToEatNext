[2025-09-10T04:31:33.065Z] ESLint Mass Reduction Campaign - Phase 12.2 Started
[2025-09-10T04:31:33.096Z] Target: Reduce 7,089 violations to <500 (93%+ reduction)
[2025-09-10T04:31:33.096Z] Starting ESLint Mass Reduction Campaign - Phase 12.2
[2025-09-10T04:31:33.097Z] Target: Reduce 7,089 violations to <500 (93%+ reduction)
[2025-09-10T04:31:33.098Z]
=== Phase 1: Fixing Critical Parsing Errors ===
[2025-09-10T04:31:33.098Z] Fixing parsing errors in: src/utils/astrologyUtils.ts
[2025-09-10T04:31:33.108Z] ✅ Fixed syntax errors in src/utils/astrologyUtils.ts
[2025-09-10T04:31:33.108Z] Fixing parsing errors in: src/utils/elementalUtils.ts
[2025-09-10T04:31:33.117Z] ✅ Fixed syntax errors in src/utils/elementalUtils.ts
[2025-09-10T04:31:33.119Z] Fixing parsing errors in: src/utils/accurateAstronomy.ts
[2025-09-10T04:31:33.123Z] ✅ Fixed syntax errors in src/utils/accurateAstronomy.ts
[2025-09-10T04:31:33.124Z] Fixing parsing errors in: src/lib/alchemicalEngine.ts
[2025-09-10T04:31:33.127Z] ✅ Fixed syntax errors in src/lib/alchemicalEngine.ts
[2025-09-10T04:31:33.127Z] Fixing parsing errors in: src/calculations/gregsEnergy.ts
[2025-09-10T04:31:33.131Z] ✅ Fixed syntax errors in src/calculations/gregsEnergy.ts
[2025-09-10T04:31:33.131Z] Fixing parsing errors in: src/data/integrations/seasonal.ts
[2025-09-10T04:31:33.132Z] Fixing parsing errors in: src/contexts/AlchemicalContext/server.ts
[2025-09-10T04:31:33.132Z] Fixing parsing errors in: src/data/unified/unifiedFlavorEngine.ts
[2025-09-10T04:31:33.139Z] ✅ Fixed syntax errors in src/data/unified/unifiedFlavorEngine.ts
[2025-09-10T04:31:33.140Z] Fixing parsing errors in: src/data/ingredients/fruits/index.ts
[2025-09-10T04:31:33.173Z] ✅ Fixed syntax errors in src/data/ingredients/fruits/index.ts
[2025-09-10T04:31:33.174Z] Fixing parsing errors in: src/services/AlchemicalRecommendationService.ts
[2025-09-10T04:31:33.179Z] ✅ Fixed syntax errors in src/services/AlchemicalRecommendationService.ts
[2025-09-10T04:31:33.179Z] ✅ Phase 1 Complete: Fixed parsing errors in 8 files
[2025-09-10T04:31:33.179Z] Validating build stability...
[2025-09-10T04:31:43.247Z] ❌ Build validation failed
[2025-09-10T04:31:43.248Z] Build error: Command failed: yarn build
Failed to compile.

./src/calculations/alchemicalTransformation.ts
Error: [31mx[0m Expected '{', got 'interface'
,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/calculations/alchemicalTransformation.ts[0m:28:1]
[2m25[0m | /\*_
[2m26[0m | _ Interface for transformed items with both elemental and alchemical data
[2m27[0m | \*/
[2m28[0m | export interface AlchemicalItem extends ElementalItem {
: [35;1m ^^^^^^^^^[0m
[2m29[0m | alchemicalProperties: Record<AlchemicalProperty, number>;
[2m30[0m | transformedElementalProperties: Record<ElementalCharacter, number>;
[2m31[0m | heat: number;
`----

Caused by:
Syntax Error

Import trace for requested module:
./src/calculations/alchemicalTransformation.ts
./src/utils/alchemicalTransformationUtils.ts
./src/utils/testRecommendations.ts
./src/app/debug/page.tsx

./src/contexts/AlchemicalContext/provider.tsx
Error: [31mx[0m Expected ident
,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/contexts/AlchemicalContext/provider.tsx[0m:126:1]
[2m123[0m | ? (state.astrologicalState.alchemicalValues as {
[2m124[0m | Spirit: number;
[2m125[0m | Essence: number,
[2m126[0m | Matter: number,,
: [35;1m ^[0m
[2m127[0m | Substance: number
[2m128[0m | })
[2m129[0m | : { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 },
`----

Caused by:
Syntax Error

Import trace for requested module:
./src/contexts/AlchemicalContext/provider.tsx
./src/app/alchm-kitchen/page.tsx

./src/data/cuisines/index.ts
Error: [31mx[0m Expected '{', got 'CuisineData'
,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/data/cuisines/index.ts[0m:284:1]
[2m281[0m | } as const;
[2m282[0m |
[2m283[0m | // Type for cuisine data
[2m284[0m | export type CuisineData = {
: [35;1m ^^^^^^^^^^^[0m
[2m285[0m | name: string;
[2m286[0m | elementalProperties: {
[2m287[0m | Fire: number;
`----

Caused by:
Syntax Error

Import trace for requested module:
./src/data/cuisines/index.ts
./src/data/cuisines.ts
./src/services/ingredientMappingService.ts
./src/services/index.ts
./src/hooks/useServices.ts
./src/app/test/migrated-components/cooking-methods-section/page.tsx

./src/data/ingredients/fruits/index.ts
Error: [31mx[0m Expected '{', got 'FruitAstrologicalProfile'
,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/data/ingredients/fruits/index.ts[0m:74:1]
[2m71[0m | export type FruitTexture = 'firm' | 'soft' | 'juicy' | 'crisp' | 'creamy';
[2m72[0m |
[2m73[0m | // Update type definitions
[2m74[0m | export type FruitAstrologicalProfile = {
: [35;1m ^^^^^^^^^^^^^^^^^^^^^^^^[0m
[2m75[0m | rulingPlanets: string[];,
[2m76[0m | favorableZodiac: string[],
[2m77[0m | elementalAffinity: {,
`----

Caused by:
Syntax Error

Import trace for requested module:
./src/data/ingredients/fruits/index.ts
./src/data/ingredients/index.ts
./src/services/ingredientMappingService.ts
./src/services/index.ts
./src/hooks/useServices.ts
./src/app/test/migrated-components/cooking-methods-section/page.tsx

./src/data/ingredients/grains/wholeGrains.ts
Error: [31mx[0m A numeric separator is only allowed between two digits
,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/data/ingredients/grains/wholeGrains.ts[0m:56:1]
[2m53[0m | fiber: 1.8
[2m54[0m | },
[2m55[0m | vitamins: {
[2m56[0m | B1: 0.11_B3: 0.13_B6: 0.14_E: 0.08,
: [35;1m ^^[0m
[2m57[0m | folate: 0.4
[2m58[0m | },
[2m59[0m | minerals: {
`----
  [31mx[0m Identifier cannot follow number
    ,-[[36;1;4m/Users/GregCastro/Desktop/WhatToEatNext/src/data/ingredients/grains/wholeGrains.ts[0m:56:1]
 [2m53[0m |         fiber: 1.8
 [2m54[0m |       },
 [2m55[0m |       vitamins: {
 [2m56[0m |   B1: 0.11_B3: 0.13_B6: 0.14_E: 0.08,
    : [35;1m           ^[0m
 [2m57[0m |         folate: 0.4
 [2m58[0m |       },
 [2m59[0m |       minerals: {
    `----

Caused by:
Syntax Error

Import trace for requested module:
./src/data/ingredients/grains/wholeGrains.ts
./src/data/ingredients/grains/index.ts
./src/data/ingredients/index.ts
./src/services/ingredientMappingService.ts
./src/services/index.ts
./src/hooks/useServices.ts
./src/app/test/migrated-components/cooking-methods-section/page.tsx

> Build failed because of webpack errors

[2025-09-10T04:31:43.248Z]
❌ Campaign failed: Phase 1 failed: Could not fix critical parsing errors
[2025-09-10T04:31:43.248Z] Backup available at: .eslint-mass-reduction-backup-1757478693058
