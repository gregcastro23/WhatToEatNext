# Explicit Any Usage Examples

## Pattern Examples

### ERROR_HANDLING

- **src/context/UnifiedContext.tsx:125**
  ```typescript
  } catch (e: any) {
  ```

- **src/utils/buildQualityMonitor.ts:347**
  ```typescript
  } catch (error: any) {
  ```

- **src/utils/buildQualityMonitor.ts:926**
  ```typescript
  } catch (error: any) {
  ```

- **src/utils/typescriptCampaignTrigger.ts:265**
  ```typescript
  } catch (error: any) {
  ```

- **src/utils/__tests__/errorHandling.test.ts:141**
  ```typescript
  } catch (enhancedError: any) {
  ```

### FUNCTION_PARAMS

- **src/context/ChartContext.tsx:11**
  ```typescript
  updateChart: (data: any) => void;
  ```

- **src/context/ChartContext.tsx:28**
  ```typescript
  const updateChart = (data: any) => {
  ```

- **src/context/UnifiedContext.tsx:125**
  ```typescript
  } catch (e: any) {
  ```

- **src/app/api/nutrition/direct.ts:199**
  ```typescript
  nutrients.forEach((n: any) => {
  ```

- **src/constants/chakraSymbols.ts:436**
  ```typescript
  analyzeDemonstrationPlatform: (allChakraData: any) => {
  ```

### TYPE_ASSERTION

- **src/types/guards.ts:6**
  ```typescript
  * pervasive `as any` casts while we continue the systematic error-reduction
  ```

- **src/contexts/AlchemicalContext/provider.tsx:74**
  ```typescript
  // Safe type conversion function to replace 'as any' casts
  ```

- **src/context/CurrentChartContext.tsx:76**
  ```typescript
  const planetData = data as any;
  ```

- **src/context/CurrentChartContext.tsx:105**
  ```typescript
  const planetData = data as any;
  ```

- **src/context/CurrentChartContext.tsx:207**
  ```typescript
  const planetData = data as any;
  ```

### PROPERTY_TYPE

- **src/context/ChartContext.tsx:8**
  ```typescript
  currentChart: any;
  ```

- **src/context/ChartContext.tsx:11**
  ```typescript
  updateChart: (data: any) => void;
  ```

- **src/context/ChartContext.tsx:28**
  ```typescript
  const updateChart = (data: any) => {
  ```

- **src/context/UnifiedContext.tsx:125**
  ```typescript
  } catch (e: any) {
  ```

- **src/app/api/nutrition/direct.ts:199**
  ```typescript
  nutrients.forEach((n: any) => {
  ```

### ARRAY_TYPE

- **src/utils/strictNullChecksHelper.ts:70**
  ```typescript
  export function safeCall<T extends (...args: any[]) => any>(
  ```

- **src/utils/nextConfigOptimizer.ts:10**
  ```typescript
  private readonly logger: (message: string, ...args: any[]) => void;
  ```

- **src/utils/naturalLanguageProcessor.ts:432**
  ```typescript
  items: any[],
  ```

- **src/utils/naturalLanguageProcessor.ts:435**
  ```typescript
  ): any[] {
  ```

- **src/utils/naturalLanguageProcessor.ts:488**
  ```typescript
  export function applyFilters(items: any[], filters: SearchFilters): any[] {
  ```

### PROMISE_TYPE

- **src/utils/recommendation/ingredientRecommendation.ts:421**
  ```typescript
  export const getAllIngredientsData = async (): Promise<any[]> => {
  ```

- **src/utils/errorHandling.ts:44**
  ```typescript
  recover: (error: EnhancedError) => Promise<any> | any;
  ```

- **src/utils/errorHandling.ts:163**
  ```typescript
  async handleError(error: Error | EnhancedError, context?: Record<string, any>): Promise<any> {
  ```

- **src/utils/mcpServerIntegration.ts:470**
  ```typescript
  private async simulateMCPCall(serverName: string, method: string, params: any): Promise<any> {
  ```

- **src/utils/mcpServerIntegration.ts:590**
  ```typescript
  private async getFallbackAstrologicalData(date: Date): Promise<any> {
  ```

### RECORD_TYPE

- **src/types/advancedIntelligence.ts:51**
  ```typescript
  planetaryPositions?: Record<string, any>;
  ```

- **src/types/advancedIntelligence.ts:104**
  ```typescript
  planetaryPositions: Record<string, any>;
  ```

- **src/types/advancedIntelligence.ts:161**
  ```typescript
  userPreferences?: Record<string, any>;
  ```

- **src/types/advancedIntelligence.ts:162**
  ```typescript
  seasonalFactors?: Record<string, any>;
  ```

- **src/types/advancedIntelligence.ts:222**
  ```typescript
  planetaryPositions: Record<string, any>;
  ```

### CALLBACK_TYPE

- **src/types/global.d.ts:45**
  ```typescript
  show: () => any;
  ```

- **src/types/global.d.ts:46**
  ```typescript
  hide: () => any;
  ```

- **src/types/global.d.ts:47**
  ```typescript
  update: () => any;
  ```

- **src/types/global.d.ts:49**
  ```typescript
  trigger: (event: string) => any;
  ```

- **src/types/global.d.ts:51**
  ```typescript
  show: () => any;
  ```

### RETURN_TYPE

- **src/utils/mcpServerIntegration.ts:635**
  ```typescript
  private generateMockPlanetaryData(date: Date): any {
  ```

- **src/utils/mcpServerIntegration.ts:646**
  ```typescript
  private generateMockNutritionalData(ingredient: string): any {
  ```

- **src/utils/mcpServerIntegration.ts:659**
  ```typescript
  private generateMockRecipeData(query: string, options: any): any {
  ```

- **src/utils/statePreservation.ts:132**
  ```typescript
  export function getComponentState(componentId: string): any {
  ```

- **src/utils/elementalUtils.ts:473**
  ```typescript
  ensureLowercaseFormat(properties: unknown): any {
  ```

## Domain Examples

### ASTROLOGICAL

- **src/constants/alchemicalPillars.ts:1272**
  ```typescript
  export function calculatePlanetaryAlignment(enhancedPillar: AlchemicalPillar & { monicaProperties?: any }): number {
  ```

- **src/constants/alchemicalPillars.ts:1293**
  ```typescript
  export function calculateLunarPhaseBonus(enhancedPillar: AlchemicalPillar & { monicaProperties?: any }): number {
  ```

- **src/utils/astrologyUtils.ts:2192**
  ```typescript
  planetaryPositions: { [key: string]: any },
  ```

- **src/utils/astrologyUtils.ts:2308**
  ```typescript
  planetaryPositions: { [key: string]: any },
  ```

- **src/utils/astrologyUtils.ts:2376**
  ```typescript
  planetaryPositions: { [key: string]: any },
  ```

### RECIPE

- **src/constants/chakraSymbols.ts:608**
  ```typescript
  function generateNutritionalRecommendations(analysis: any): string[] {
  ```

- **src/utils/recipe/recipeUtils.ts:39**
  ```typescript
  export function isRecipeIngredient(ingredient: any): ingredient is RecipeIngredient {
  ```

- **src/utils/recipe/recipeMatching.ts:512**
  ```typescript
  recipeProfile: { [key: string]: any },
  ```

- **src/utils/mcpServerIntegration.ts:617**
  ```typescript
  private async getFallbackRecipeData(query: string, options: any): Promise<any> {
  ```

- **src/utils/mcpServerIntegration.ts:646**
  ```typescript
  private generateMockNutritionalData(ingredient: string): any {
  ```

### CAMPAIGN

- **src/constants/alchemicalPillars.ts:1293**
  ```typescript
  export function calculateLunarPhaseBonus(enhancedPillar: AlchemicalPillar & { monicaProperties?: any }): number {
  ```

- **src/utils/automatedQualityAssurance.ts:533**
  ```typescript
  private triggerCampaign(campaignType: string, context: any): void {
  ```

- **src/utils/automatedQualityAssurance.ts:565**
  ```typescript
  monitorBuildQuality: (metrics: any) => qa.monitorBuildQuality(metrics),
  ```

- **src/components/quality/QualityMetricsDashboard.tsx:9**
  ```typescript
  buildMetrics: any;
  ```

- **src/components/quality/QualityMetricsDashboard.tsx:11**
  ```typescript
  campaignProgress: any;
  ```

### INTELLIGENCE

- **src/constants/chakraSymbols.ts:572**
  ```typescript
  function generateMantraRecommendations(analysis: any): string[] {
  ```

- **src/constants/chakraSymbols.ts:590**
  ```typescript
  function generateVisualRecommendations(analysis: any): string[] {
  ```

- **src/constants/chakraSymbols.ts:608**
  ```typescript
  function generateNutritionalRecommendations(analysis: any): string[] {
  ```

- **src/constants/chakraSymbols.ts:626**
  ```typescript
  function generateFunctionalRecommendations(analysis: any): string[] {
  ```

- **src/constants/chakraSymbols.ts:644**
  ```typescript
  function generatePlatformRecommendations(analysis: any): string[] {
  ```

### SERVICE

- **src/components/MoonDisplay.migrated.tsx:192**
  ```typescript
  const getMoonTimes = serviceData.getMoonTimes as ((date: Date, coords: any) => Promise<any>) | undefined;
  ```

- **src/components/campaign/CampaignIntegrationDashboard.tsx:277**
  ```typescript
  systemHealth: any;
  ```

- **src/__tests__/types/testUtils.ts:160**
  ```typescript
  controller: any;
  ```

- **src/__tests__/types/testUtils.ts:163**
  ```typescript
  testController: any;
  ```

- **src/services/linting/LintingProgressTracker.ts:493**
  ```typescript
  private saveCampaignIntegration(data: any): void {
  ```

