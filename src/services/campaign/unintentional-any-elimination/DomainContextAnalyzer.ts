/**
 * Domain Context Analyzer
 * Provides domain-specific analysis for astrological, recipe, campaign, and service code
 *
 * Features:
 * - File path analysis to determine code domain
 * - Content analysis for domain-specific patterns
 * - Subdomain classification for specialized areas
 * - Domain-specific type suggestions and preservation reasons
 */

import {
    ClassificationContext,
    CodeDomain,
    DomainContext,
    IntentionalityHint
} from './types';

export class DomainContextAnalyzer {
  private domainPatterns: Map<CodeDomain, RegExp[]>;
  private typeMapping: Map<CodeDomain, string[]>;
  private pathPatterns: Map<CodeDomain, RegExp[]>;
  private contentPatterns: Map<CodeDomain, RegExp[]>;
  private subDomainPatterns: Map<CodeDomain, Map<string, RegExp[]>>;

  constructor() {
    this.domainPatterns = this.initializeDomainPatterns();
    this.typeMapping = this.initializeTypeMapping();
    this.pathPatterns = this.initializePathPatterns();
    this.contentPatterns = this.initializeContentPatterns();
    this.subDomainPatterns = this.initializeSubDomainPatterns();
  }

  /**
   * Analyze the domain context for a given classification context
   */
  async analyzeDomain(context: ClassificationContext): Promise<DomainContext> {
    const domain = this.detectDomain(context);
    const subDomain = this.detectSubDomain(context, domain);
    const intentionalityHints = this.generateIntentionalityHints(context, domain);
    const suggestedTypes = this.getDomainSpecificSuggestions(domain, context);
    const preservationReasons = this.getPreservationReasons(context, domain);

    return {
      domain,
      subDomain,
      intentionalityHints,
      suggestedTypes,
      preservationReasons
    };
  }

  /**
   * Get domain-specific type suggestions
   */
  getDomainSpecificSuggestions(domain: CodeDomain, context: ClassificationContext): string[] {
    const baseSuggestions = this.typeMapping.get(domain) || ['unknown'];
    const contextualSuggestions = this.getContextualSuggestions(context, domain);
    const variableNameSuggestions = this.getVariableNameBasedSuggestions(context, domain);
    const patternBasedSuggestions = this.getPatternBasedSuggestions(context, domain);

    return [...new Set([)
      ...contextualSuggestions,      // Prioritize contextual suggestions
      ...variableNameSuggestions,    // Then variable name suggestions
      ...patternBasedSuggestions,    // Then pattern-based suggestions
      ...baseSuggestions             // Finally base suggestions
    ])];
  }

  /**
   * Get type suggestions based on variable names and patterns
   */
  private getVariableNameBasedSuggestions(context: ClassificationContext, domain: CodeDomain): string[] {
    const suggestions: string[] = [];

    // Extract variable name from code snippet
    const variableMatch = context.codeSnippet.match(/(?:const|let|var)\s+(\w+)\s*:/);
    const variableName = variableMatch ? variableMatch[1].toLowerCase() : '';

    if (!variableName) return suggestions;

    switch (domain) {
      case CodeDomain.ASTROLOGICAL:
        if (variableName.includes('planet')) suggestions.push('PlanetaryPosition', 'Planet');
        if (variableName.includes('sun')) suggestions.push('SunPosition');
        if (variableName.includes('moon')) suggestions.push('MoonPosition');
        if (variableName.includes('mercury')) suggestions.push('MercuryPosition');
        if (variableName.includes('venus')) suggestions.push('VenusPosition');
        if (variableName.includes('mars')) suggestions.push('MarsPosition');
        if (variableName.includes('jupiter')) suggestions.push('JupiterPosition');
        if (variableName.includes('saturn')) suggestions.push('SaturnPosition');
        if (variableName.includes('element')) suggestions.push('ElementalProperties');
        if (variableName.includes('sign')) suggestions.push('ZodiacSign');
        if (variableName.includes('position')) suggestions.push('PlanetaryPosition');
        if (variableName.includes('transit')) suggestions.push('TransitData');
        if (variableName.includes('ephemeris')) suggestions.push('EphemerisData');
        break;

      case CodeDomain.RECIPE:
        if (variableName.includes('ingredient')) suggestions.push('Ingredient');
        if (variableName.includes('recipe')) suggestions.push('Recipe');
        if (variableName.includes('spice')) suggestions.push('Spice');
        if (variableName.includes('herb')) suggestions.push('Herb');
        if (variableName.includes('vegetable')) suggestions.push('Vegetable');
        if (variableName.includes('fruit')) suggestions.push('Fruit');
        if (variableName.includes('cooking')) suggestions.push('CookingMethod');
        if (variableName.includes('nutrition')) suggestions.push('NutritionalInfo');
        if (variableName.includes('flavor')) suggestions.push('FlavorProfile');
        if (variableName.includes('cuisine')) suggestions.push('CuisineType');
        break;

      case CodeDomain.CAMPAIGN:
        if (variableName.includes('metrics')) suggestions.push('ProgressMetrics', 'MetricsData');
        if (variableName.includes('config')) suggestions.push('CampaignConfig');
        if (variableName.includes('result')) suggestions.push('CampaignResult');
        if (variableName.includes('error')) suggestions.push('TypeScriptError', 'ValidationResult');
        if (variableName.includes('typescript')) suggestions.push('TypeScriptError');
        if (variableName.includes('lint')) suggestions.push('LintingResult');
        if (variableName.includes('performance')) suggestions.push('PerformanceMetrics');
        if (variableName.includes('safety')) suggestions.push('SafetyEvent');
        break;

      case CodeDomain.SERVICE:
        if (variableName.includes('response')) suggestions.push('ApiResponse<T>', 'HttpResponse');
        if (variableName.includes('request')) suggestions.push('ApiRequest', 'RequestConfig');
        if (variableName.includes('api')) suggestions.push('ApiResponse<T>', 'ApiRequest');
        if (variableName.includes('service')) suggestions.push('ServiceData');
        if (variableName.includes('data')) suggestions.push('ServiceData');
        break;

      case CodeDomain.COMPONENT:
        if (variableName.includes('props')) suggestions.push('ComponentProps');
        if (variableName.includes('state')) suggestions.push('ComponentState');
        if (variableName.includes('event')) suggestions.push('React.SyntheticEvent');
        if (variableName.includes('ref')) suggestions.push('React.RefObject<T>');
        if (variableName.includes('context')) suggestions.push('ContextValue');
        break;

      case CodeDomain.TEST:
        if (variableName.includes('mock')) suggestions.push('jest.Mock', 'MockData');
        if (variableName.includes('spy')) suggestions.push('jest.SpyInstance');
        if (variableName.includes('test')) suggestions.push('TestData');
        if (variableName.includes('fixture')) suggestions.push('TestFixture');
        break;
    }

    return suggestions;
  }

  /**
   * Get type suggestions based on code patterns and usage
   */
  private getPatternBasedSuggestions(context: ClassificationContext, domain: CodeDomain): string[] {
    const suggestions: string[] = [];
    const codeSnippet = context.codeSnippet;

    // Array pattern analysis
    if (codeSnippet.includes('any[]') {
      switch (domain) {
        case CodeDomain.ASTROLOGICAL:
          suggestions.push('PlanetaryPosition[]', 'Planet[]', 'ZodiacSign[]');
          break;
        case CodeDomain.RECIPE:
          suggestions.push('Ingredient[]', 'Recipe[]', 'CookingMethod[]');
          break;
        case CodeDomain.CAMPAIGN:
          suggestions.push('TypeScriptError[]', 'ValidationResult[]', 'SafetyEvent[]');
          break;
        case CodeDomain.COMPONENT:
          suggestions.push('React.ReactNode[]', 'ComponentProps[]');
          break;
        default:
          suggestions.push('unknown[]');
      }
    }

    // Record pattern analysis
    if (codeSnippet.includes('Record<') || codeSnippet.includes('{ [key:') {
      switch (domain) {
        case CodeDomain.ASTROLOGICAL:
          suggestions.push('Record<string, PlanetaryPosition>', 'Record<Planet, number>');
          break;
        case CodeDomain.RECIPE:
          suggestions.push('Record<string, Ingredient>', 'Record<string, number>');
          break;
        case CodeDomain.CAMPAIGN:
          suggestions.push('Record<string, MetricsData>', 'Record<string, number>');
          break;
        default:
          suggestions.push('Record<string, unknown>');
      }
    }

    // Function parameter analysis
    if (codeSnippet.includes('(') && codeSnippet.includes('any') {
      const paramMatch = codeSnippet.match(/\(\s*\w+\s*:\s*any/);
      if (paramMatch) {
        switch (domain) {
          case CodeDomain.ASTROLOGICAL:
            suggestions.push('PlanetaryPosition', 'ElementalProperties');
            break;
          case CodeDomain.RECIPE:
            suggestions.push('Ingredient', 'Recipe');
            break;
          case CodeDomain.CAMPAIGN:
            suggestions.push('CampaignConfig', 'ProgressMetrics');
            break;
          case CodeDomain.COMPONENT:
            suggestions.push('ComponentProps', 'React.SyntheticEvent');
            break;
          default:
            suggestions.push('unknown');
        }
      }
    }

    // Return type analysis
    if (codeSnippet.includes('): any') {
      switch (domain) {
        case CodeDomain.ASTROLOGICAL:
          suggestions.push('PlanetaryPosition', 'ElementalProperties', 'AstronomicalCalculation');
          break;
        case CodeDomain.RECIPE:
          suggestions.push('Recipe', 'Ingredient', 'CookingMethod');
          break;
        case CodeDomain.CAMPAIGN:
          suggestions.push('CampaignResult', 'ProgressMetrics', 'ValidationResult');
          break;
        case CodeDomain.SERVICE:
          suggestions.push('ApiResponse<T>', 'ServiceData');
          break;
        case CodeDomain.COMPONENT:
          suggestions.push('JSX.Element', 'React.ReactNode');
          break;
        default:
          suggestions.push('unknown');
      }
    }

    // Promise pattern analysis
    if (codeSnippet.includes('Promise<any>') {
      switch (domain) {
        case CodeDomain.ASTROLOGICAL:
          suggestions.push('Promise<PlanetaryPosition>', 'Promise<ElementalProperties>');
          break;
        case CodeDomain.RECIPE:
          suggestions.push('Promise<Recipe>', 'Promise<Ingredient>');
          break;
        case CodeDomain.SERVICE:
          suggestions.push('Promise<ApiResponse<T>>', 'Promise<ServiceData>');
          break;
        default:
          suggestions.push('Promise<unknown>');
      }
    }

    return suggestions;
  }

  /**
   * Detect the primary domain based on file path and content analysis
   */
  private detectDomain(context: ClassificationContext): CodeDomain {
    // First, try path-based detection (most reliable)
    const pathDomain = this.detectDomainByPath(context.filePath);
    if (pathDomain !== CodeDomain.UTILITY) {
      return pathDomain;
    }

    // Then try content-based detection
    const contentDomain = this.detectDomainByContent(context);
    if (contentDomain !== CodeDomain.UTILITY) {
      return contentDomain;
    }

    // Finally, try import/dependency analysis
    const importDomain = this.detectDomainByImports(context);
    return importDomain;
  }

  /**
   * Detect domain based on file path patterns
   * Uses priority order - first match wins
   */
  private detectDomainByPath(filePath: string): CodeDomain {
    const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');

    // Check in priority order (test files first, then components, etc.)
    const orderedDomains = [
      CodeDomain.TEST,
      CodeDomain.COMPONENT,
      CodeDomain.ASTROLOGICAL,
      CodeDomain.CAMPAIGN,
      CodeDomain.RECIPE,
      CodeDomain.SERVICE,
      CodeDomain.UTILITY
    ];

    for (const domain of orderedDomains) {
      const patterns = this.pathPatterns.get(domain) || [];
      if (patterns.some(pattern => pattern.test(normalizedPath)) {
        return domain;
      }
    }

    return CodeDomain.UTILITY;
  }

  /**
   * Detect domain based on code content patterns
   */
  private detectDomainByContent(context: ClassificationContext): CodeDomain {
    const codeContent = [context.codeSnippet, ...context.surroundingLines]
      .join('\n')
      .toLowerCase();

    // Score each domain based on pattern matches
    const domainScores = new Map<CodeDomain, number>();

    for (const [domain, patterns] of this.contentPatterns.entries() {
      let score = 0;
      for (const pattern of patterns) {
        const matches = codeContent.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }
      if (score > 0) {
        domainScores.set(domain, score);
      }
    }

    // Return the domain with the highest score
    if (domainScores.size > 0) {
      const sortedDomains = Array.from(domainScores.entries())
        .sort(([, a], [, b]) => b - a);
      return sortedDomains[0][0];
    }

    return CodeDomain.UTILITY;
  }

  /**
   * Detect domain based on import statements and dependencies
   */
  private detectDomainByImports(context: ClassificationContext): CodeDomain {
    const codeContent = [context.codeSnippet, ...context.surroundingLines].join('\n');

    // Look for import patterns
    const importMatches = codeContent.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
    const requireMatches = codeContent.match(/require\(['"`]([^'"`]+)['"`]\)/g) || [];

    const allImports = [...importMatches, ...requireMatches].join(' ').toLowerCase();

    // Priority order for import-based detection
    if (allImports.includes('jest') ||
        allImports.includes('@testing-library') ||
        allImports.includes('vitest') {
      return CodeDomain.TEST;
    }

    if (allImports.includes('react') ||
        allImports.includes('@/components') ||
        allImports.includes('next/') ||
        allImports.includes('jsx') ||
        allImports.includes('tsx') {
      return CodeDomain.COMPONENT;
    }

    if (allImports.includes('astronomia') ||
        allImports.includes('astronomy-engine') ||
        allImports.includes('suncalc') ||
        allImports.includes('/calculations/') ||
        allImports.includes('/astro') {
      return CodeDomain.ASTROLOGICAL;
    }

    if (allImports.includes('/campaign') ||
        allImports.includes('metrics') ||
        allImports.includes('intelligence') {
      return CodeDomain.CAMPAIGN;
    }

    if (allImports.includes('/recipe') ||
        allImports.includes('/ingredient') ||
        allImports.includes('/food') {
      return CodeDomain.RECIPE;
    }

    if (allImports.includes('/service') ||
        allImports.includes('/api') ||
        allImports.includes('axios') ||
        allImports.includes('fetch') {
      return CodeDomain.SERVICE;
    }

    return CodeDomain.UTILITY;
  }

  /**
   * Detect specialized subdomain within the primary domain
   */
  private detectSubDomain(context: ClassificationContext, domain: CodeDomain): string | undefined {
    const filePath = context.filePath.toLowerCase().replace(/\\/g, '/');
    const codeContent = [context.codeSnippet, ...context.surroundingLines]
      .join('\n')
      .toLowerCase();

    const subDomainPatterns = this.subDomainPatterns.get(domain);
    if (!subDomainPatterns) {
      return undefined;
    }

    // Score each subdomain based on pattern matches
    const subDomainScores = new Map<string, number>();

    for (const [subDomain, patterns] of subDomainPatterns.entries() {
      let score = 0;

      // Check file path patterns
      for (const pattern of patterns) {
        if (pattern.test(filePath) {
          score += 2; // Path matches are weighted higher
        }
      }

      if (score > 0) {
        subDomainScores.set(subDomain, score);
      }
    }

    // Return the subdomain with the highest score
    if (subDomainScores.size > 0) {
      const sortedSubDomains = Array.from(subDomainScores.entries())
        .sort(([, a], [, b]) => b - a);
      return sortedSubDomains[0][0];
    }

    return undefined;
  }

  private generateIntentionalityHints(context: ClassificationContext, domain: CodeDomain): IntentionalityHint[] {
    const hints: IntentionalityHint[] = [];

    switch (domain) {
      case CodeDomain.ASTROLOGICAL:
        hints.push({
          reason: 'Astrological calculations often require flexible typing for external astronomical data',
          confidence: 0.8,
          suggestedAction: 'preserve'
        });

        if (context.codeSnippet.includes('position') || context.codeSnippet.includes('planetary') {
          hints.push({
            reason: 'Planetary position data from external APIs may need any type for compatibility',
            confidence: 0.9,
            suggestedAction: 'document'
          });
        }
        break;

      case CodeDomain.RECIPE:
        if (context.codeSnippet.includes('ingredient') || context.codeSnippet.includes('recipe') {
          hints.push({
            reason: 'Recipe and ingredient data can often use specific types',
            confidence: 0.7,
            suggestedAction: 'replace'
          });
        }
        break;

      case CodeDomain.CAMPAIGN:
        hints.push({
          reason: 'Campaign system requires flexibility for dynamic configurations and metrics',
          confidence: 0.85,
          suggestedAction: 'preserve'
        });

        if (context.codeSnippet.includes('metrics') || context.codeSnippet.includes('config') {
          hints.push({
            reason: 'Dynamic campaign configurations benefit from flexible typing',
            confidence: 0.9,
            suggestedAction: 'document'
          });
        }
        break;

      case CodeDomain.TEST:
        hints.push({
          reason: 'Test files often need flexible typing for mocks and test data',
          confidence: 0.8,
          suggestedAction: 'preserve'
        });
        break;

      case CodeDomain.SERVICE:
        if (context.codeSnippet.includes('api') || context.codeSnippet.includes('response') {
          hints.push({
            reason: 'API responses may require any type for external service compatibility',
            confidence: 0.8,
            suggestedAction: 'document'
          });
        } else {
          hints.push({
            reason: 'Service layer can often use more specific types',
            confidence: 0.6,
            suggestedAction: 'review'
          });
        }
        break;

      default:
        hints.push({
          reason: 'No domain-specific patterns detected, consider replacement',
          confidence: 0.5,
          suggestedAction: 'review'
        });
    }

    return hints;
  }

  private getContextualSuggestions(context: ClassificationContext, domain: CodeDomain): string[] {
    const suggestions: string[] = [];
    const codeContent = context.codeSnippet.toLowerCase();
    const surroundingContent = context.surroundingLines.join('\n').toLowerCase();
    const allContent = `${codeContent} ${surroundingContent}`;

    switch (domain) {
      case CodeDomain.ASTROLOGICAL:
        suggestions.push(...this.getAstrologicalTypeSuggestions(allContent, context));
        break;

      case CodeDomain.RECIPE:
        suggestions.push(...this.getRecipeTypeSuggestions(allContent, context));
        break;

      case CodeDomain.CAMPAIGN:
        suggestions.push(...this.getCampaignTypeSuggestions(allContent, context));
        break;

      case CodeDomain.SERVICE:
        suggestions.push(...this.getServiceTypeSuggestions(allContent, context));
        break;

      case CodeDomain.COMPONENT:
        suggestions.push(...this.getComponentTypeSuggestions(allContent, context));
        break;

      case CodeDomain.UTILITY:
        suggestions.push(...this.getUtilityTypeSuggestions(allContent, context));
        break;

      case CodeDomain.TEST:
        suggestions.push(...this.getTestTypeSuggestions(allContent, context));
        break;
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Get astrological type suggestions based on content analysis
   */
  private getAstrologicalTypeSuggestions(content: string, context: ClassificationContext): string[] {
    const suggestions: string[] = [];

    // Planetary position analysis
    if (content.includes('position') || content.includes('degree') || content.includes('longitude') {
      suggestions.push('PlanetaryPosition');

      // Specific planet positions
      if (content.includes('sun')) suggestions.push('SunPosition');
      if (content.includes('moon')) suggestions.push('MoonPosition');
      if (content.includes('mercury')) suggestions.push('MercuryPosition');
      if (content.includes('venus')) suggestions.push('VenusPosition');
      if (content.includes('mars')) suggestions.push('MarsPosition');
      if (content.includes('jupiter')) suggestions.push('JupiterPosition');
      if (content.includes('saturn')) suggestions.push('SaturnPosition');
      if (content.includes('uranus')) suggestions.push('UranusPosition');
      if (content.includes('neptune')) suggestions.push('NeptunePosition');
      if (content.includes('pluto')) suggestions.push('PlutoPosition');
    }

    // Elemental analysis
    if (content.includes('element') || content.includes('fire') || content.includes('water') ||
        content.includes('earth') || content.includes('air') {
      suggestions.push('ElementalProperties');

      if (content.includes('fire')) suggestions.push('FireElement');
      if (content.includes('water')) suggestions.push('WaterElement');
      if (content.includes('earth')) suggestions.push('EarthElement');
      if (content.includes('air')) suggestions.push('AirElement');
      if (content.includes('compatibility')) suggestions.push('ElementalCompatibility');
    }

    // Zodiac and sign analysis
    if (content.includes('sign') || content.includes('zodiac') ||
        /aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces/.test(content) {
      suggestions.push('ZodiacSign');
    }

    // Lunar analysis
    if (content.includes('moon') || content.includes('lunar') || content.includes('phase') {
      suggestions.push('LunarPhase');
    }

    // Transit and ephemeris analysis
    if (content.includes('transit') || content.includes('ephemeris') {
      suggestions.push('TransitData', 'EphemerisData');
    }

    // Calculation analysis
    if (content.includes('calculate') || content.includes('compute') || content.includes('algorithm') {
      suggestions.push('AstronomicalCalculation');
    }

    // Coordinate system analysis
    if (content.includes('coordinate') || content.includes('latitude') || content.includes('longitude') {
      suggestions.push('CoordinateSystem');
    }

    // General astrological data
    if (content.includes('astro') || content.includes('planet') {
      suggestions.push('Planet', 'AstrologicalData');
    }

    return suggestions;
  }

  /**
   * Get recipe/ingredient type suggestions based on content analysis
   */
  private getRecipeTypeSuggestions(content: string, context: ClassificationContext): string[] {
    const suggestions: string[] = [];

    // Core recipe analysis
    if (content.includes('recipe') {
      suggestions.push('Recipe');
      if (content.includes('step')) suggestions.push('RecipeStep');
      if (content.includes('instruction')) suggestions.push('CookingInstruction');
    }

    // Ingredient analysis
    if (content.includes('ingredient') {
      suggestions.push('Ingredient');
      if (content.includes('quantity') || content.includes('amount')) suggestions.push('IngredientQuantity');
    }

    // Specific ingredient types
    if (content.includes('spice')) suggestions.push('Spice');
    if (content.includes('herb')) suggestions.push('Herb');
    if (content.includes('vegetable')) suggestions.push('Vegetable');
    if (content.includes('fruit')) suggestions.push('Fruit');
    if (content.includes('protein') || content.includes('meat') || content.includes('fish')) suggestions.push('Protein');
    if (content.includes('grain') || content.includes('rice') || content.includes('wheat')) suggestions.push('Grain');
    if (content.includes('dairy') || content.includes('milk') || content.includes('cheese')) suggestions.push('Dairy');

    // Cooking method analysis
    if (content.includes('cooking') || content.includes('method') ||
        /bake|boil|fry|steam|grill|roast|sauté/.test(content) {
      suggestions.push('CookingMethod');
    }

    // Nutrition analysis
    if (content.includes('nutrition') || content.includes('calorie') || content.includes('vitamin') {
      suggestions.push('NutritionalInfo');
    }

    // Flavor and profile analysis
    if (content.includes('flavor') || content.includes('taste') || content.includes('profile') {
      suggestions.push('FlavorProfile');
    }

    // Cuisine analysis
    if (content.includes('cuisine') || /italian|chinese|mexican|indian|french|thai|japanese/.test(content) {
      suggestions.push('CuisineType');
    }

    // Dietary restrictions
    if (content.includes('dietary') || content.includes('restriction') ||
        /vegan|vegetarian|gluten|dairy/.test(content) {
      suggestions.push('DietaryRestriction');
    }

    // Seasonal analysis
    if (content.includes('seasonal') || /spring|summer|fall|winter|autumn/.test(content) {
      suggestions.push('SeasonalAvailability');
    }

    // Elemental properties (shared with astrological domain)
    if (content.includes('element') || content.includes('fire') || content.includes('water') ||
        content.includes('earth') || content.includes('air') {
      suggestions.push('ElementalProperties');
    }

    return suggestions;
  }

  /**
   * Get campaign system type suggestions based on content analysis
   */
  private getCampaignTypeSuggestions(content: string, context: ClassificationContext): string[] {
    const suggestions: string[] = [];

    // Core campaign types
    if (content.includes('campaign') {
      suggestions.push('CampaignConfig', 'CampaignResult');
    }

    // Metrics analysis
    if (content.includes('metrics') || content.includes('progress') {
      suggestions.push('ProgressMetrics', 'MetricsData');
    }

    // TypeScript error analysis
    if (content.includes('typescript') || content.includes('ts') || /ts\d+/.test(content) {
      suggestions.push('TypeScriptError', 'CompilationResult', 'ErrorAnalysis');
    }

    // Compilation analysis
    if (content.includes('compile') || content.includes('build') {
      suggestions.push('CompilationResult', 'BuildMetrics');
    }

    // Error and fix analysis
    if (content.includes('error') || content.includes('fix') {
      suggestions.push('ValidationResult', 'FixAttempt');
    }

    // Linting analysis
    if (content.includes('lint') || content.includes('eslint') {
      suggestions.push('LintingResult', 'ESLintRule', 'LintingWarning');
    }

    // Performance analysis
    if (content.includes('performance') || content.includes('memory') || content.includes('bundle') {
      suggestions.push('PerformanceMetrics');
      if (content.includes('memory')) suggestions.push('MemoryUsage');
      if (content.includes('bundle')) suggestions.push('BundleAnalysis');
    }

    // Safety and validation
    if (content.includes('safety') || content.includes('validation') {
      suggestions.push('SafetyEvent', 'ValidationResult');
    }

    // Intelligence analysis
    if (content.includes('intelligence') || content.includes('pattern') || content.includes('analysis') {
      suggestions.push('IntelligenceData', 'PatternAnalysis');
    }

    // Predictive analysis
    if (content.includes('predict') || content.includes('forecast') {
      suggestions.push('PredictiveMetrics');
    }

    return suggestions;
  }

  /**
   * Get service type suggestions based on content analysis
   */
  private getServiceTypeSuggestions(content: string, context: ClassificationContext): string[] {
    const suggestions: string[] = [];

    // API analysis
    if (content.includes('api') || content.includes('endpoint') {
      suggestions.push('ApiResponse<T>', 'ApiRequest');
    }

    // HTTP analysis
    if (content.includes('http') || content.includes('response') || content.includes('request') {
      suggestions.push('HttpResponse', 'RestApiResponse', 'RequestConfig');
    }

    // Service-specific analysis
    if (content.includes('recommendation')) suggestions.push('RecommendationService');
    if (content.includes('astro')) suggestions.push('AstrologicalService');
    if (content.includes('recipe')) suggestions.push('RecipeService');
    if (content.includes('ingredient')) suggestions.push('IngredientService');

    // Data processing
    if (content.includes('data') || content.includes('process') {
      suggestions.push('ServiceData', 'DataTransform');
    }

    // Validation and schema
    if (content.includes('validate') || content.includes('schema') {
      suggestions.push('ValidationSchema');
    }

    // Cache analysis
    if (content.includes('cache') {
      suggestions.push('CacheEntry');
    }

    // Error handling
    if (content.includes('error') {
      suggestions.push('ServiceError');
    }

    return suggestions;
  }

  /**
   * Get React component type suggestions based on content analysis
   */
  private getComponentTypeSuggestions(content: string, context: ClassificationContext): string[] {
    const suggestions: string[] = [];

    // Props analysis
    if (content.includes('props') {
      suggestions.push('ComponentProps', 'React.ComponentProps<T>');

      // Specific component props
      if (content.includes('button')) suggestions.push('ButtonProps');
      if (content.includes('input')) suggestions.push('InputProps');
      if (content.includes('form')) suggestions.push('FormProps');
      if (content.includes('modal')) suggestions.push('ModalProps');
      if (content.includes('chart')) suggestions.push('ChartProps');
      if (content.includes('recipe')) suggestions.push('RecipeCardProps');
      if (content.includes('ingredient')) suggestions.push('IngredientCardProps');
    }

    // Component types
    if (content.includes('component') {
      suggestions.push('React.FC<T>', 'React.Component<T>');
    }

    // Event analysis
    if (content.includes('event') || content.includes('onclick') || content.includes('onchange') {
      suggestions.push('React.SyntheticEvent');
      if (content.includes('click') || content.includes('mouse')) suggestions.push('React.MouseEvent');
      if (content.includes('change') || content.includes('input')) suggestions.push('React.ChangeEvent');
      if (content.includes('form') || content.includes('submit')) suggestions.push('React.FormEvent');
    }

    // State analysis
    if (content.includes('state') || content.includes('usestate') {
      suggestions.push('ComponentState', 'HookState');
    }

    // Context analysis
    if (content.includes('context') || content.includes('usecontext') {
      suggestions.push('ContextValue');
    }

    // JSX analysis
    if (content.includes('jsx') || content.includes('element') || content.includes('render') {
      suggestions.push('JSX.Element', 'React.ReactNode');
    }

    return suggestions;
  }

  /**
   * Get utility type suggestions based on content analysis
   */
  private getUtilityTypeSuggestions(content: string, context: ClassificationContext): string[] {
    const suggestions: string[] = [];

    // Basic type analysis
    if (content.includes('string')) suggestions.push('string');
    if (content.includes('number')) suggestions.push('number');
    if (content.includes('boolean')) suggestions.push('boolean');
    if (content.includes('date')) suggestions.push('Date');
    if (content.includes('array')) suggestions.push('Array<unknown>');
    if (content.includes('promise')) suggestions.push('Promise<unknown>');

    // Object analysis
    if (content.includes('object') || content.includes('record') {
      suggestions.push('Record<string, unknown>', 'object');
    }

    return suggestions;
  }

  /**
   * Get test type suggestions based on content analysis
   */
  private getTestTypeSuggestions(content: string, context: ClassificationContext): string[] {
    const suggestions: string[] = [];

    // Jest analysis
    if (content.includes('jest') || content.includes('mock') {
      suggestions.push('jest.Mock', 'jest.MockedFunction<T>');
      if (content.includes('spy')) suggestions.push('jest.SpyInstance');
    }

    // Testing library analysis
    if (content.includes('render') || content.includes('@testing-library') {
      suggestions.push('RenderResult', 'Screen');
    }

    if (content.includes('fireevent') {
      suggestions.push('FireEvent');
    }

    // Test data analysis
    if (content.includes('test') || content.includes('mock') {
      suggestions.push('TestData', 'MockData');
    }

    if (content.includes('fixture') {
      suggestions.push('TestFixture');
    }

    if (content.includes('context') {
      suggestions.push('TestContext');
    }

    if (content.includes('case') {
      suggestions.push('TestCase');
    }

    return suggestions;
  }

  private getPreservationReasons(context: ClassificationContext, domain: CodeDomain): string[] {
    const reasons: string[] = [];

    if (domain === CodeDomain.ASTROLOGICAL) {
      reasons.push('Astrological calculations require compatibility with external astronomical libraries');
      reasons.push('Planetary position data structures vary between different API sources');
    }

    if (domain === CodeDomain.CAMPAIGN) {
      reasons.push('Campaign system needs flexibility for evolving metrics and configurations');
      reasons.push('Dynamic tool integration requires adaptable type structures');
    }

    if (domain === CodeDomain.TEST) {
      reasons.push('Test flexibility for mocking and test data generation');
      reasons.push('Jest and testing library compatibility requirements');
    }

    if (context.isInTestFile) {
      reasons.push('Test file context allows for more flexible typing patterns');
    }

    if (context.hasExistingComment) {
      reasons.push('Existing documentation suggests intentional usage');
    }

    return reasons;
  }

  /**
   * Initialize path-based domain detection patterns
   * Order matters - more specific patterns should come first
   */
  private initializePathPatterns(): Map<CodeDomain, RegExp[]> {
    return new Map([)
      [CodeDomain.TEST, [
        /__tests__/i,
        /\.test\./i,
        /\.spec\./i,
        /\/test/i,
        /\/spec/i
      ]],
      [CodeDomain.COMPONENT, [
        /\/component/i,
        /\.tsx$/i,
        /\.jsx$/i,
        /\/ui\//i,
        /\/pages\//i,
        /\/app\//i
      ]],
      [CodeDomain.ASTROLOGICAL, [
        /\/calculations\//i,
        /\/astro/i,
        /planetary/i,
        /elemental/i,
        /lunar/i,
        /solar/i,
        /zodiac/i,
        /ephemeris/i
      ]],
      [CodeDomain.CAMPAIGN, [
        /\/campaign/i,
        /\/intelligence/i,
        /typescript.*error/i,
        /linting/i,
        /validation/i,
        /metrics/i,
        /progress/i
      ]],
      [CodeDomain.RECIPE, [
        /\/recipe/i,
        /\/ingredient/i,
        /\/food/i,
        /\/culinary/i,
        /\/cooking/i,
        /\/nutrition/i,
        /\/data\/.*ingredient/i,
        /\/data\/.*recipe/i
      ]],
      [CodeDomain.SERVICE, [
        /\/service/i,
        /\/api/i,
        /\/client/i,
        /\/adapter/i,
        /recommendation.*service/i
      ]],
      [CodeDomain.UTILITY, [
        /\/utils/i,
        /\/helper/i,
        /\/common/i,
        /\/shared/i,
        /\/lib/i
      ]]
    ]);
  }

  /**
   * Initialize content-based domain detection patterns
   */
  private initializeContentPatterns(): Map<CodeDomain, RegExp[]> {
    return new Map([)
      [CodeDomain.ASTROLOGICAL, [
        /planetary|planet|astro|zodiac|sign|element|lunar|solar/gi,
        /position|degree|longitude|latitude|ephemeris/gi,
        /fire|water|earth|air|elemental/gi,
        /astronomia|astronomy-engine|suncalc/gi,
        /PlanetaryPosition|ElementalProperties|ZodiacSign/gi
      ]],
      [CodeDomain.RECIPE, [
        /recipe|ingredient|food|culinary|cooking|nutrition/gi,
        /flavor|taste|spice|herb|vegetable|fruit/gi,
        /meal|dish|cuisine|dietary/gi,
        /Ingredient|Recipe|NutritionalInfo|CookingMethod/gi
      ]],
      [CodeDomain.CAMPAIGN, [
        /campaign|metrics|progress|typescript|linting|error/gi,
        /validation|safety|rollback|checkpoint/gi,
        /intelligence|enterprise|automation/gi,
        /CampaignConfig|ProgressMetrics|ValidationResult/gi
      ]],
      [CodeDomain.SERVICE, [
        /service|api|request|response|client|server/gi,
        /endpoint|http|fetch|axios|data/gi,
        /ApiResponse|ServiceData|RequestConfig/gi
      ]],
      [CodeDomain.COMPONENT, [
        /component|props|state|render|jsx|tsx/gi,
        /react|hook|context|provider/gi,
        /ComponentProps|React\.Component|JSX\.Element/gi
      ]],
      [CodeDomain.UTILITY, [
        /util|helper|common|shared|lib/gi,
        /function|method|tool|format/gi
      ]],
      [CodeDomain.TEST, [
        /test|spec|mock|jest|describe|it|expect/gi,
        /fixture|stub|spy|beforeEach|afterEach/gi,
        /jest\.Mock|MockedFunction|TestData/gi
      ]]
    ]);
  }

  /**
   * Initialize subdomain detection patterns
   */
  private initializeSubDomainPatterns(): Map<CodeDomain, Map<string, RegExp[]>> {
    return new Map([)
      [CodeDomain.ASTROLOGICAL, new Map([)
        ['planetary', [/planetary|planet/gi, /position|degree|longitude/gi]],
        ['elemental', [/elemental|element/gi, /fire|water|earth|air/gi]],
        ['lunar', [/lunar|moon/gi, /phase|cycle/gi]],
        ['solar', [/solar|sun/gi, /sunrise|sunset/gi]],
        ['zodiac', [/zodiac|sign/gi, /aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces/gi]],
        ['calculations', [/calculation|compute|algorithm/gi, /ephemeris|transit/gi]]
      ])],
      [CodeDomain.RECIPE, new Map([)
        ['ingredients', [/ingredient/gi, /spice|herb|vegetable|fruit/gi]],
        ['cooking-methods', [/cooking|method/gi, /bake|boil|fry|steam|grill/gi]],
        ['nutrition', [/nutrition|nutrient/gi, /calorie|vitamin|mineral/gi]],
        ['cuisines', [/cuisine|cultural/gi, /italian|chinese|mexican|indian/gi]],
        ['recipes', [/recipe|dish|meal/gi, /preparation|instruction/gi]]
      ])],
      [CodeDomain.CAMPAIGN, new Map([)
        ['typescript-errors', [/typescript|ts\d+/gi, /error|compilation/gi]],
        ['linting', [/lint|eslint/gi, /warning|rule/gi]],
        ['performance', [/performance|optimization/gi, /memory|speed|bundle/gi]],
        ['metrics', [/metrics|progress/gi, /tracking|measurement/gi]],
        ['intelligence', [/intelligence|enterprise/gi, /analytics|insights/gi]],
        ['safety', [/safety|validation/gi, /rollback|checkpoint/gi]]
      ])],
      [CodeDomain.SERVICE, new Map([)
        ['recommendation', [/recommendation|suggest/gi, /algorithm|matching/gi]],
        ['api-integration', [/api|integration/gi, /request|response|endpoint/gi]],
        ['data-processing', [/data|processing/gi, /transform|parse|validate/gi]],
        ['caching', [/cache|storage/gi, /redis|memory/gi]]
      ])],
      [CodeDomain.COMPONENT, new Map([)
        ['ui-components', [/component|ui/gi, /button|input|modal/gi]],
        ['pages', [/page|route/gi, /navigation|layout/gi]],
        ['hooks', [/hook|use[A-Z]/gi, /state|effect|context/gi]],
        ['forms', [/form|input/gi, /validation|submit/gi]]
      ])],
      [CodeDomain.TEST, new Map([)
        ['unit-tests', [/unit|test/gi, /describe|it|expect/gi]],
        ['integration-tests', [/integration|e2e/gi, /workflow|scenario/gi]],
        ['mocks', [/mock|stub|spy/gi, /jest\.mock|mockImplementation/gi]]
      ])],
      [CodeDomain.UTILITY, new Map([)
        ['validation', [/validation|validate/gi, /schema|rule/gi]],
        ['formatting', [/format|transform/gi, /string|date|number/gi]],
        ['helpers', [/helper|utility/gi, /common|shared/gi]]
      ])]
    ]);
  }

  /**
   * Legacy method for backward compatibility
   */
  private initializeDomainPatterns(): Map<CodeDomain, RegExp[]> {
    // This method is kept for backward compatibility
    // The actual patterns are now in initializeContentPatterns
    return this.initializeContentPatterns();
  }

  private initializeTypeMapping(): Map<CodeDomain, string[]> {
    return new Map([)
      [CodeDomain.ASTROLOGICAL, [
        // Core astrological types
        'PlanetaryPosition',
        'ElementalProperties',
        'ZodiacSign',
        'Planet',
        'AstrologicalData',
        'LunarPhase',
        'TransitData',
        'EphemerisData',
        // Specific planetary types
        'SunPosition',
        'MoonPosition',
        'MercuryPosition',
        'VenusPosition',
        'MarsPosition',
        'JupiterPosition',
        'SaturnPosition',
        'UranusPosition',
        'NeptunePosition',
        'PlutoPosition',
        // Elemental and calculation types
        'FireElement',
        'WaterElement',
        'EarthElement',
        'AirElement',
        'ElementalCompatibility',
        'AstronomicalCalculation',
        'CoordinateSystem',
        'unknown'
      ]],
      [CodeDomain.RECIPE, [
        // Core recipe types
        'Ingredient',
        'Recipe',
        'NutritionalInfo',
        'CookingMethod',
        'CulinaryData',
        'ElementalProperties',
        // Specific ingredient types
        'Spice',
        'Herb',
        'Vegetable',
        'Fruit',
        'Protein',
        'Grain',
        'Dairy',
        // Recipe-related types
        'RecipeStep',
        'CookingInstruction',
        'IngredientQuantity',
        'FlavorProfile',
        'CuisineType',
        'DietaryRestriction',
        'SeasonalAvailability',
        'unknown'
      ]],
      [CodeDomain.CAMPAIGN, [
        // Core campaign types
        'ProgressMetrics',
        'CampaignConfig',
        'CampaignResult',
        'ValidationResult',
        'SafetyEvent',
        'MetricsData',
        // TypeScript-specific types
        'TypeScriptError',
        'CompilationResult',
        'ErrorAnalysis',
        'FixAttempt',
        // Linting types
        'LintingResult',
        'ESLintRule',
        'LintingWarning',
        // Performance types
        'PerformanceMetrics',
        'BuildMetrics',
        'MemoryUsage',
        'BundleAnalysis',
        // Intelligence types
        'IntelligenceData',
        'PatternAnalysis',
        'PredictiveMetrics',
        'Record<string, unknown>'
      ]],
      [CodeDomain.SERVICE, [
        // API types
        'ApiResponse<T>',
        'ApiRequest',
        'ServiceData',
        'RequestConfig',
        'ResponseData',
        'HttpResponse',
        'RestApiResponse',
        // Service-specific types
        'RecommendationService',
        'AstrologicalService',
        'RecipeService',
        'IngredientService',
        // Data processing types
        'DataTransform',
        'ValidationSchema',
        'CacheEntry',
        'ServiceError',
        'unknown'
      ]],
      [CodeDomain.COMPONENT, [
        // React component types
        'ComponentProps',
        'React.ComponentProps<T>',
        'React.ReactNode',
        'JSX.Element',
        'React.FC<T>',
        'React.Component<T>',
        // Event types
        'React.SyntheticEvent',
        'React.MouseEvent',
        'React.ChangeEvent',
        'React.FormEvent',
        // State and context types
        'ComponentState',
        'ContextValue',
        'HookState',
        // Prop-specific types
        'ButtonProps',
        'InputProps',
        'FormProps',
        'ModalProps',
        'ChartProps',
        'RecipeCardProps',
        'IngredientCardProps',
        'unknown'
      ]],
      [CodeDomain.UTILITY, [
        'unknown',
        'Record<string, unknown>',
        'object',
        'string',
        'number',
        'boolean',
        'Date',
        'Array<unknown>',
        'Promise<unknown>'
      ]],
      [CodeDomain.TEST, [
        // Jest types
        'jest.Mock',
        'jest.MockedFunction<T>',
        'jest.SpyInstance',
        'MockedFunction<T>',
        // Testing library types
        'RenderResult',
        'FireEvent',
        'Screen',
        // Test data types
        'TestData',
        'MockData',
        'TestFixture',
        'TestContext',
        'TestCase',
        'unknown'
      ]]
    ]);
  }
}
