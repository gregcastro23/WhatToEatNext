/**
 * Any Type Classifier
 * Analyzes each `any` type usage to determine if it's intentional or unintentional
 */

import {
  AnyTypeCategory,
  AnyTypeClassification,
  ClassificationContext,
  ClassificationError,
  ClassificationRules,
  CodeDomain
} from './types';

export class AnyTypeClassifier {
  private rules: ClassificationRules,
  private confidenceWeights: Map<AnyTypeCategory, number>;
  private patternMatchers: Map<AnyTypeCategory, (context: ClassificationContext) => number>,

  constructor(rules?: Partial<ClassificationRules>) {
    this.rules = {
      errorHandlingPatterns: [
        /catch\s*\(\s*\w+\s*:\s*any\s*\)/,
        /error\s*:\s*any/,
        /exception\s*:\s*any/,
        /err\s*:\s*any/,
        /\.catch\s*\(\s*\(\s*\w+\s*:\s*any\s*\)/;
        /try\s*\{[\s\S]*?\}\s*catch\s*\(\s*\w+\s*:\s*any/
      ],
      externalApiPatterns: [
        /response\s*:\s*any/,
        /data\s*:\s*any/,
        /payload\s*:\s*any/,
        /apiResponse\s*:\s*any/,
        /fetch\s*\([\s\S]*?\)\s*\.then\s*\(\s*\w+\s*:\s*any/,
        /axios\.\w+\s*\([\s\S]*?\)\s*:\s*any/,
        /\.json\(\)\s*:\s*any/
      ],
      testMockPatterns: [
        /mock\w*\s*:\s*any/,
        /jest\.fn\(\)\s*as\s*any/;
        /\.mockReturnValue\s*\(\s*\w+\s*as\s*any\s*\)/;
        /\.mockImplementation\s*\(\s*\w+\s*:\s*any/;
        /\.spyOn\s*\([\s\S]*?\)\s*as\s*any/,
        /describe\s*\([\s\S]*?\w+\s*:\s*any/,
        /it\s*\([\s\S]*?\w+\s*:\s*any/,
        /test\s*\([\s\S]*?\w+\s*:\s*any/
      ],
      dynamicConfigPatterns: [
        /config\s*:\s*any/,
        /options\s*:\s*any/,
        /settings\s*:\s*any/,
        /params\s*:\s*any/,
        /props\s*:\s*any/,
        /\.env\s*:\s*any/;
        /process\.env\.\w+\s*as\s*any/
      ],
      legacyCompatibilityPatterns: [
        /legacy\w*\s*:\s*any/,
        /deprecated\w*\s*:\s*any/,
        /old\w*\s*:\s*any/,
        /backward\w*\s*:\s*any/,
        /compat\w*\s*:\s*any/
      ],
      ...rules
    },

    // Initialize confidence weights for different categories
    this.confidenceWeights = new Map([
      [AnyTypeCategory.ERROR_HANDLING, 0.9],
      [AnyTypeCategory.EXTERNAL_API, 0.8],
      [AnyTypeCategory.TEST_MOCK, 0.85],
      [AnyTypeCategory.DYNAMIC_CONFIG, 0.75],
      [AnyTypeCategory.LEGACY_COMPATIBILITY, 0.7],
      [AnyTypeCategory.ARRAY_TYPE, 0.95], // High confidence for replacement
      [AnyTypeCategory.RECORD_TYPE, 0.8],
      [AnyTypeCategory.FUNCTION_PARAM, 0.6],
      [AnyTypeCategory.RETURN_TYPE, 0.65],
      [AnyTypeCategory.TYPE_ASSERTION, 0.5]
    ]);

    // Initialize pattern matchers with confidence scoring
    this.patternMatchers = new Map([
      [AnyTypeCategory.ERROR_HANDLING, this.calculateErrorHandlingConfidence.bind(this)],
      [AnyTypeCategory.EXTERNAL_API, this.calculateExternalApiConfidence.bind(this)],
      [AnyTypeCategory.TEST_MOCK, this.calculateTestMockConfidence.bind(this)],
      [AnyTypeCategory.DYNAMIC_CONFIG, this.calculateDynamicConfigConfidence.bind(this)],
      [
        AnyTypeCategory.LEGACY_COMPATIBILITY;
        this.calculateLegacyCompatibilityConfidence.bind(this)
      ],
      [AnyTypeCategory.ARRAY_TYPE, this.calculateArrayTypeConfidence.bind(this)],
      [AnyTypeCategory.RECORD_TYPE, this.calculateRecordTypeConfidence.bind(this)]
    ]);
  }

  /**
   * Classify a single any type usage using pattern recognition algorithms and contextual analysis
   */
  async classify(context: ClassificationContext): Promise<AnyTypeClassification> {
    try {
      // Perform contextual analysis
      const surroundingContext = this.analyzeSurroundingCodeContext(context);
      const fileTypeInfo = this.analyzeFileType(context.filePath);

      // Check for existing documentation first (highest priority)
      if (context.hasExistingComment && this.hasIntentionalDocumentation(context.existingComment)) {
        return {
          isIntentional: true,
          confidence: 0.95;
          reasoning: `Explicitly documented as intentional${surroundingContext.contextualClues.length > 0 ? ` (${surroundingContext.contextualClues.join(', ')})` : ''}`,
          requiresDocumentation: false,
          category: this.categorizeFromComment(context.existingComment)
        };
      }

      // Run pattern recognition algorithms for all categories
      const categoryScores = new Map<AnyTypeCategory, number>();

      // Calculate confidence scores for each category with contextual adjustments
      for (const [category, matcher] of this.patternMatchers) {
        let score = matcher(context);

        // Apply contextual adjustments
        score = this.applyContextualAdjustments(score, category, surroundingContext, fileTypeInfo);

        if (score > 0) {
          categoryScores.set(category, score)
        }
      }

      // Find the highest scoring category
      let bestCategory: AnyTypeCategory | null = null;
      let bestScore = 0;

      for (const [category, score] of categoryScores) {
        if (score > bestScore) {
          bestScore = score;
          bestCategory = category;
        }
      }

      // If we found a strong pattern match, use it
      if (bestCategory && bestScore >= 0.7) {
        const isIntentional = this.isIntentionalCategory(bestCategory);
        const contextualReasoning = this.buildContextualReasoning(;
          bestCategory,
          surroundingContext,
          fileTypeInfo,
        ),

        return {
          isIntentional,
          confidence: bestScore,
          reasoning: contextualReasoning,
          suggestedReplacement: isIntentional
            ? undefined
            : this.getSuggestedReplacement(bestCategory, context),
          requiresDocumentation: isIntentional,
          category: bestCategory
        };
      }

      // Domain-specific analysis for moderate confidence cases
      const domainClassification = this.analyzeDomainSpecific(context);
      if (domainClassification) {
        // Enhance domain classification with contextual information
        domainClassification.reasoning += this.getContextualEnhancement(
          surroundingContext,
          fileTypeInfo,
        );
        return domainClassification
      }

      // Function parameter and return type analysis
      const functionAnalysis = this.analyzeFunctionContext(context);
      if (functionAnalysis) {
        functionAnalysis.reasoning += this.getContextualEnhancement(
          surroundingContext,
          fileTypeInfo,
        );
        return functionAnalysis
      }

      // Default classification with comprehensive contextual confidence adjustment
      const defaultConfidence = this.calculateContextualConfidence(;
        context,
        surroundingContext,
        fileTypeInfo,
      );
      const contextualReasoning = this.buildDefaultContextualReasoning(;
        defaultConfidence,
        surroundingContext,
        fileTypeInfo,
      );

      return {
        isIntentional: defaultConfidence > 0.6, // Higher threshold with contextual analysis
        confidence: defaultConfidence,
        reasoning: contextualReasoning,
        suggestedReplacement:
          defaultConfidence <= 0.6 ? this.getDefaultSuggestedReplacement(context) : undefined;
        requiresDocumentation: defaultConfidence > 0.6;
        category: AnyTypeCategory.TYPE_ASSERTION
      };
    } catch (error) {
      throw new ClassificationError(
        `Failed to classify any type at ${context.filePath}:${context.lineNumber}`,
        context,
        error as Error,
      );
    }
  }

  /**
   * Classify multiple any type usages in batch
   */
  async classifyBatch(contexts: ClassificationContext[]): Promise<AnyTypeClassification[]> {
    const results: AnyTypeClassification[] = [];

    for (const context of contexts) {
      try {
        const classification = await this.classify(context);
        results.push(classification);
      } catch (error) {
        // Log error but continue with other classifications
        console.warn(`Classification failed for ${context.filePath}:${context.lineNumber}`, error);

        // Provide safe fallback classification
        results.push({
          isIntentional: true, // Conservative fallback to prevent unwanted changes
          confidence: 0.1;
          reasoning: 'Classification failed, marked as intentional for safety',
          requiresDocumentation: true,
          category: AnyTypeCategory.LEGACY_COMPATIBILITY
        });
      }
    }

    return results;
  }

  /**
   * Enhanced comment analysis to detect existing documentation
   */
  private hasIntentionalDocumentation(comment?: string): boolean {
    if (!comment) return false;

    const intentionalKeywords = [
      'intentionally any',
      'deliberately any',
      'explicitly any',
      'must be any',
      'required any',
      'needs to be any',
      'has to be any',
      'should be any',
      'keep as any',
      'leave as any',
      'any is needed',
      'any is required',
      'any type needed',
      'flexible typing',
      'dynamic typing',
      'external library',
      'third party',
      'api response',
      'unknown structure'
    ];

    const lowerComment = comment.toLowerCase();

    // Check for explicit intentional markers
    const hasIntentionalMarker = intentionalKeywords.some(keyword =>;
      lowerComment.includes(keyword);
    );

    // Check for ESLint disable comments with explanations
    const hasEslintDisable =
      lowerComment.includes('eslint-disable') &&;
      (lowerComment.includes('no-explicit-any') ||
        lowerComment.includes('@typescript-eslint/no-explicit-any'));

    // Check for TODO/FIXME comments that indicate temporary usage
    const hasTodoFixme =
      lowerComment.includes('todo') ||;
      lowerComment.includes('fixme') ||
      lowerComment.includes('hack');

    return hasIntentionalMarker || (hasEslintDisable && !hasTodoFixme)
  }

  /**
   * Analyze surrounding code context for better understanding
   */
  private analyzeSurroundingCodeContext(context: ClassificationContext): {
    hasErrorHandling: boolean;
    hasApiCalls: boolean;
    hasTestingCode: boolean;
    hasTypeAssertions: boolean;
    hasComplexLogic: boolean,
    contextualClues: string[]
  } {
    const surroundingCode = this.getCombinedCode(context);
    const lowerCode = surroundingCode.toLowerCase();

    const contextualClues: string[] = [];

    // Error handling detection
    const hasErrorHandling = /try\s*\{|catch\s*\(|\.catch\s*\(|throw\s+|error|exception/i.test(;
      surroundingCode,
    );
    if (hasErrorHandling) contextualClues.push('error handling context');

    // API calls detection
    const hasApiCalls =
      /fetch\s*\(|axios\.|http\.|api\.|request\.|response\.|\.json\(\)|\.then\s*\(/i.test(;
        surroundingCode,
      );
    if (hasApiCalls) contextualClues.push('API interaction context');

    // Testing code detection
    const hasTestingCode =
      /describe\s*\(|it\s*\(|test\s*\(|expect\s*\(|mock|spy|jest\.|beforeEach|afterEach/i.test(;
        surroundingCode,
      );
    if (hasTestingCode) contextualClues.push('testing context');

    // Type assertions detection
    const hasTypeAssertions = /as\s+any|<any>|\(.*\s+as\s+any\s*\)/i.test(surroundingCode);
    if (hasTypeAssertions) contextualClues.push('type assertion context');

    // Complex logic detection (loops, conditions, multiple function calls)
    const hasComplexLogic =
      (surroundingCode.match(/if\s*\(|for\s*\(|while\s*\(|switch\s*\(/g) || []).length > 2 ||;
      (surroundingCode.match(/\.\w+\s*\(/g) || []).length > 3;
    if (hasComplexLogic) contextualClues.push('complex logic context');

    return {
      hasErrorHandling,
      hasApiCalls,
      hasTestingCode,
      hasTypeAssertions,
      hasComplexLogic,
      contextualClues
    };
  }

  /**
   * Enhanced file type detection
   */
  private analyzeFileType(filePath: string): {
    isTestFile: boolean;
    isConfigFile: boolean;
    isTypeDefinitionFile: boolean;
    isServiceFile: boolean;
    isComponentFile: boolean;
    isUtilityFile: boolean,
    fileCategory: string
  } {
    const fileName = filePath.toLowerCase();
    const pathSegments = fileName.split('/');

    // Test file detection
    const isTestFile =
      fileName.includes('.test.') ||;
      fileName.includes('.spec.') ||
      fileName.includes('__tests__') ||
      pathSegments.some(
        segment => segment === 'tests' || segment === '__tests__' || segment === 'test'
      );

    // Config file detection
    const isConfigFile =
      fileName.includes('config') ||;
      fileName.includes('.config.') ||
      fileName.includes('settings') ||
      pathSegments.some(segment => segment === 'config' || segment === 'configs');

    // Type definition file detection
    const isTypeDefinitionFile =
      fileName.endsWith('.d.ts') ||;
      fileName.includes('types.ts') ||
      fileName.includes('interfaces.ts') ||
      pathSegments.some(segment => segment === 'types' || segment === '@types');

    // Service file detection
    const isServiceFile =
      fileName.includes('service') ||;
      fileName.includes('.service.') ||
      pathSegments.some(segment => segment === 'services' || segment === 'api');

    // Component file detection
    const isComponentFile =
      fileName.includes('component') ||;
      fileName.endsWith('.tsx') ||
      pathSegments.some(segment => segment === 'components' || segment === 'ui');

    // Utility file detection
    const isUtilityFile =
      fileName.includes('util') ||;
      fileName.includes('helper') ||
      pathSegments.some(
        segment => segment === 'utils' || segment === 'helpers' || segment === 'lib'
      );

    // Determine file category
    let fileCategory = 'unknown';
    if (isTestFile) fileCategory = 'test';
    else if (isConfigFile) fileCategory = 'config';
    else if (isTypeDefinitionFile) fileCategory = 'types';
    else if (isServiceFile) fileCategory = 'service';
    else if (isComponentFile) fileCategory = 'component';
    else if (isUtilityFile) fileCategory = 'utility';

    return {
      isTestFile,
      isConfigFile,
      isTypeDefinitionFile,
      isServiceFile,
      isComponentFile,
      isUtilityFile,
      fileCategory
    };
  }

  private categorizeFromComment(comment?: string): AnyTypeCategory {
    if (!comment) return AnyTypeCategory.LEGACY_COMPATIBILITY;

    const lowerComment = comment.toLowerCase();

    if (lowerComment.includes('external') || lowerComment.includes('api')) {
      return AnyTypeCategory.EXTERNAL_API;
    }
    if (lowerComment.includes('error') || lowerComment.includes('catch')) {
      return AnyTypeCategory.ERROR_HANDLING;
    }
    if (lowerComment.includes('test') || lowerComment.includes('mock')) {
      return AnyTypeCategory.TEST_MOCK;
    }
    if (lowerComment.includes('config') || lowerComment.includes('dynamic')) {
      return AnyTypeCategory.DYNAMIC_CONFIG;
    }

    return AnyTypeCategory.LEGACY_COMPATIBILITY;
  }

  private matchesErrorHandling(context: ClassificationContext): boolean {
    const codeWithSurrounding = [...context.surroundingLines, context.codeSnippet].join('\n');

    return this.rules.errorHandlingPatterns.some(pattern => pattern.test(codeWithSurrounding));
  }

  private matchesExternalApi(context: ClassificationContext): boolean {
    const codeWithSurrounding = [...context.surroundingLines, context.codeSnippet].join('\n');

    return this.rules.externalApiPatterns.some(pattern => pattern.test(codeWithSurrounding));
  }

  private matchesTestMock(context: ClassificationContext): boolean {
    const codeWithSurrounding = [...context.surroundingLines, context.codeSnippet].join('\n');

    return this.rules.testMockPatterns.some(pattern => pattern.test(codeWithSurrounding));
  }

  private isSimpleArrayType(context: ClassificationContext): boolean {
    // Match patterns like: unknown[], Array<any>
    const arrayPatterns = [/:\s*any\[\]/, /:\s*Array<any>/, /=\s*\[\]\s*as\s*any\[\]/];

    return arrayPatterns.some(pattern => pattern.test(context.codeSnippet));
  }

  private isRecordType(context: ClassificationContext): boolean {
    // Match patterns like: Record<string, any>, Record<number, any>
    const recordPatterns = [
      /:\s*Record<\s*string\s*,\s*any\s*>/,
      /:\s*Record<\s*number\s*,\s*any\s*>/,
      /:\s*\{\s*\[key:\s*string\]\s*:\s*any\s*\}/,
      /\{\s*\[key:\s*string\]\s*:\s*any\s*\}/, // Without colon prefix
      /Record<\w+,\s*any\[\]>/, // Record with any arrays
    ];

    return recordPatterns.some(pattern => pattern.test(context.codeSnippet));
  }

  private suggestRecordReplacement(context: ClassificationContext): string {
    if (context.codeSnippet.includes('Record<string, any>')) {
      return 'Record<string, unknown>'
    }
    if (context.codeSnippet.includes('Record<number, any>')) {
      return 'Record<number, unknown>'
    }
    if (context.codeSnippet.includes('[key: string]: any')) {
      return '[key: string]: unknown'
    }

    return 'unknown';
  }

  private analyzeDomainSpecific(context: ClassificationContext): AnyTypeClassification | null {
    const domain = context.domainContext.domain;

    switch (domain) {
      case CodeDomain.ASTROLOGICAL:
        return this.analyzeAstrologicalDomain(context);
      case CodeDomain.RECIPE:
        return this.analyzeRecipeDomain(context);
      case CodeDomain.CAMPAIGN:
        return this.analyzeCampaignDomain(context);
      case CodeDomain.SERVICE:
        return this.analyzeServiceLayerDomain(context);
      case CodeDomain.INTELLIGENCE:
        return this.analyzeIntelligenceDomain(context);
      default:
        return null
    }
  }

  private analyzeServiceLayerDomain(context: ClassificationContext): AnyTypeClassification | null {
    const codeWithSurrounding = this.getCombinedCode(context);
    const lowerCode = codeWithSurrounding.toLowerCase();

    // Service interface patterns
    const serviceInterfacePatterns = [
      /service\s*interface/i,
      /api\s*service/i,
      /data\s*service/i,
      /business\s*service/i,
      /application\s*service/i,
      /domain\s*service/i
    ];

    // External service integration patterns
    const externalServicePatterns = [
      /external\s*service/i,
      /third\s*party\s*service/i,
      /remote\s*service/i,
      /web\s*service/i,
      /microservice/i,
      /rest\s*api/i,
      /graphql/i,
      /grpc/i
    ];

    // Service configuration patterns
    const serviceConfigPatterns = [
      /service\s*config/i,
      /endpoint\s*config/i,
      /connection\s*config/i,
      /client\s*config/i,
      /service\s*options/i,
      /service\s*settings/i
    ];

    // Data transformation patterns
    const dataTransformPatterns = [
      /data\s*transformer/i,
      /response\s*mapper/i,
      /dto\s*mapper/i,
      /entity\s*mapper/i,
      /serializer/i,
      /deserializer/i
    ];

    let confidence = 0;
    let reasoning = '';
    let suggestedReplacement = '';
    let isIntentional = false;
    let category = AnyTypeCategory.TYPE_ASSERTION;

    // Check for external service integration (intentional)
    if (externalServicePatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.85;
      reasoning =
        'External service integration requires flexible typing for unknown response structures';
      isIntentional = true;
      category = AnyTypeCategory.EXTERNAL_API;
    }
    // Check for service configuration (intentional)
    else if (serviceConfigPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.8;
      reasoning = 'Service configuration requires flexible typing for dynamic setup options';
      isIntentional = true;
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }
    // Check for data transformation (can be more specific)
    else if (dataTransformPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.75;
      reasoning = 'Data transformation can use specific interface types for better type safety';
      suggestedReplacement = 'Record<string, unknown>';
      isIntentional = false;
      category = AnyTypeCategory.TYPE_ASSERTION;
    }
    // Check for service interfaces (can be more specific)
    else if (serviceInterfacePatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.7;
      reasoning =
        'Service interfaces can use specific interface types for better contract definition';
      suggestedReplacement = 'ServiceInterface';
      isIntentional = false;
      category = AnyTypeCategory.TYPE_ASSERTION;
    }
    // General service context
    else if (
      lowerCode.includes('service') &&
      (lowerCode.includes('data') || lowerCode.includes('response'))
    ) {
      confidence = 0.65;
      reasoning = 'Service layer data handling can likely use more specific types';
      suggestedReplacement = 'unknown';
      isIntentional = false;
      category = AnyTypeCategory.TYPE_ASSERTION;
    }

    if (confidence > 0) {
      return {
        isIntentional,
        confidence,
        reasoning,
        suggestedReplacement: isIntentional ? undefined : suggestedReplacement,
        requiresDocumentation: isIntentional,
        category
      };
    }

    return null;
  }

  private analyzeIntelligenceDomain(context: ClassificationContext): AnyTypeClassification | null {
    const codeWithSurrounding = this.getCombinedCode(context);
    const lowerCode = codeWithSurrounding.toLowerCase();

    // Intelligence system patterns
    const intelligencePatterns = [
      /intelligence\s*system/i,
      /enterprise\s*intelligence/i,
      /campaign\s*intelligence/i,
      /analytics\s*engine/i,
      /pattern\s*recognition/i,
      /machine\s*learning/i,
      /ai\s*system/i,
      /predictive\s*analytics/i
    ];

    // Dynamic analysis patterns
    const dynamicAnalysisPatterns = [
      /dynamic\s*analysis/i,
      /runtime\s*analysis/i,
      /adaptive\s*algorithm/i,
      /learning\s*algorithm/i,
      /evolving\s*pattern/i,
      /self\s*adjusting/i
    ];

    let confidence = 0;
    let reasoning = '';
    let category = AnyTypeCategory.DYNAMIC_CONFIG;

    // Check for intelligence systems (high confidence for intentional)
    if (intelligencePatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.9;
      reasoning = 'Intelligence systems require flexible typing for evolving analytical patterns';
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }
    // Check for dynamic analysis
    else if (dynamicAnalysisPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.85;
      reasoning = 'Dynamic analysis systems require flexible typing for adaptive behavior';
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }
    // General intelligence context
    else if (lowerCode.includes('intelligence') || lowerCode.includes('analytics')) {
      confidence = 0.75;
      reasoning =
        'Intelligence domain requires flexible typing for complex analytical data structures';
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }

    if (confidence > 0) {
      return {
        isIntentional: true,
        confidence,
        reasoning,
        requiresDocumentation: true,
        category
      };
    }

    return null;
  }

  private analyzeAstrologicalDomain(context: ClassificationContext): AnyTypeClassification | null {
    const codeWithSurrounding = this.getCombinedCode(context);
    const lowerCode = codeWithSurrounding.toLowerCase();

    // Planetary position recognition patterns
    const planetaryPatterns = [
      /planetary\s*position/i,
      /planet\w*\s*data/i,
      /astro\w*\s*calculation/i,
      /ephemeris/i,
      /zodiac\s*sign/i,
      /celestial\s*body/i,
      /astronomical\s*data/i,
      /transit\s*date/i,
      /lunar\s*phase/i,
      /solar\s*position/i
    ];

    // External astronomy API patterns
    const astronomyApiPatterns = [
      /nasa\s*jpl/i,
      /horizons\s*api/i,
      /swiss\s*ephemeris/i,
      /astronomy\s*engine/i,
      /timeanddate\s*api/i,
      /astronomical\s*api/i,
      /getReliablePlanetaryPositions/i,
      /planetaryConsistencyCheck/i
    ];

    // Astrological calculation patterns
    const calculationPatterns = [
      /elemental\s*properties/i,
      /compatibility\s*score/i,
      /astrological\s*influence/i,
      /planetary\s*correspondence/i,
      /seasonal\s*calculation/i,
      /retrograde\s*motion/i,
      /aspect\s*calculation/i,
      /house\s*position/i
    ];

    let confidence = 0;
    let reasoning = '';
    let category = AnyTypeCategory.EXTERNAL_API;

    // Check for planetary position data (highest confidence)
    if (planetaryPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.9;
      reasoning =
        'Astrological planetary position data requires flexible typing for external API responses';
      category = AnyTypeCategory.EXTERNAL_API;
    }
    // Check for astronomy API integration
    else if (astronomyApiPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.85;
      reasoning = 'Astronomy API integration requires flexible typing for varying response formats';
      category = AnyTypeCategory.EXTERNAL_API;
    }
    // Check for astrological calculations
    else if (calculationPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.8;
      reasoning =
        'Astrological calculations require flexible typing for dynamic elemental properties';
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }
    // General astrological context
    else if (
      lowerCode.includes('astro') ||
      lowerCode.includes('planetary') ||
      lowerCode.includes('zodiac')
    ) {
      confidence = 0.75;
      reasoning =
        'Astrological domain code often requires flexible typing for cosmic data structures';
      category = AnyTypeCategory.LEGACY_COMPATIBILITY;
    }

    if (confidence > 0) {
      return {
        isIntentional: true,
        confidence,
        reasoning,
        requiresDocumentation: true,
        category
      };
    }

    return null;
  }

  private analyzeRecipeDomain(context: ClassificationContext): AnyTypeClassification | null {
    const codeWithSurrounding = this.getCombinedCode(context);
    const lowerCode = codeWithSurrounding.toLowerCase();

    // Food-related type suggestion patterns
    const ingredientPatterns = [
      /ingredient\s*data/i,
      /ingredient\s*properties/i,
      /elemental\s*ingredient/i,
      /culinary\s*ingredient/i,
      /food\s*item/i,
      /nutritional\s*data/i,
      /spoonacular\s*api/i,
      /usda\s*food/i
    ];

    const recipePatterns = [
      /recipe\s*data/i,
      /recipe\s*information/i,
      /cooking\s*method/i,
      /culinary\s*recipe/i,
      /meal\s*plan/i,
      /food\s*recommendation/i,
      /alchemical\s*recipe/i,
      /elemental\s*recipe/i
    ];

    const cuisinePatterns = [
      /cuisine\s*data/i,
      /cultural\s*food/i,
      /ethnic\s*cuisine/i,
      /traditional\s*recipe/i,
      /regional\s*food/i
    ];

    // External food API patterns
    const foodApiPatterns = [
      /spoonacular/i,
      /food\s*api/i,
      /nutrition\s*api/i,
      /recipe\s*api/i,
      /usda\s*api/i,
      /food\s*database/i
    ];

    let confidence = 0;
    let reasoning = '';
    let suggestedReplacement = '';
    let isIntentional = false;
    let category = AnyTypeCategory.TYPE_ASSERTION;

    // Check for external food API integration (intentional)
    if (foodApiPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.85;
      reasoning = 'Food API integration requires flexible typing for varying response structures';
      isIntentional = true;
      category = AnyTypeCategory.EXTERNAL_API;
    }
    // Check for ingredient data (can be typed more specifically)
    else if (ingredientPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.8;
      reasoning = 'Ingredient data can use specific Ingredient interface type';
      suggestedReplacement = 'Ingredient';
      isIntentional = false;
      category = AnyTypeCategory.TYPE_ASSERTION;
    }
    // Check for recipe data (can be typed more specifically)
    else if (recipePatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.8;
      reasoning = 'Recipe data can use specific Recipe interface type';
      suggestedReplacement = 'Recipe';
      isIntentional = false;
      category = AnyTypeCategory.TYPE_ASSERTION;
    }
    // Check for cuisine data (can be typed more specifically)
    else if (cuisinePatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.75;
      reasoning = 'Cuisine data can use specific Cuisine interface type';
      suggestedReplacement = 'Cuisine';
      isIntentional = false;
      category = AnyTypeCategory.TYPE_ASSERTION;
    }
    // General food-related context
    else if (
      lowerCode.includes('ingredient') ||
      lowerCode.includes('recipe') ||
      lowerCode.includes('food')
    ) {
      // Check if it's likely an API response or configuration
      if (
        lowerCode.includes('response') ||
        lowerCode.includes('api') ||
        lowerCode.includes('config')
      ) {
        confidence = 0.7;
        reasoning = 'Food-related API response or configuration may require flexible typing';
        isIntentional = true;
        category = AnyTypeCategory.EXTERNAL_API;
      } else {
        confidence = 0.7;
        reasoning =
          'Food-related data can likely use more specific types (Ingredient, Recipe, etc.)';
        suggestedReplacement = 'Ingredient | Recipe | Cuisine';
        isIntentional = false;
        category = AnyTypeCategory.TYPE_ASSERTION;
      }
    }

    if (confidence > 0) {
      return {
        isIntentional,
        confidence,
        reasoning,
        suggestedReplacement: isIntentional ? undefined : suggestedReplacement,
        requiresDocumentation: isIntentional,
        category
      };
    }

    return null;
  }

  private analyzeCampaignDomain(context: ClassificationContext): AnyTypeClassification | null {
    const codeWithSurrounding = this.getCombinedCode(context);
    const lowerCode = codeWithSurrounding.toLowerCase();

    // Campaign system dynamic configuration patterns
    const campaignConfigPatterns = [
      /campaign\s*config/i,
      /campaign\s*parameters/i,
      /campaign\s*settings/i,
      /dynamic\s*config/i,
      /flexible\s*config/i,
      /runtime\s*config/i,
      /adaptive\s*config/i
    ];

    // Campaign metrics and intelligence patterns
    const metricsPatterns = [
      /campaign\s*metrics/i,
      /progress\s*metrics/i,
      /quality\s*metrics/i,
      /performance\s*metrics/i,
      /intelligence\s*data/i,
      /analytics\s*data/i,
      /campaign\s*intelligence/i,
      /enterprise\s*intelligence/i
    ];

    // Campaign execution and automation patterns
    const executionPatterns = [
      /campaign\s*execution/i,
      /batch\s*processing/i,
      /automation\s*script/i,
      /campaign\s*phase/i,
      /safety\s*protocol/i,
      /rollback\s*mechanism/i,
      /validation\s*framework/i
    ];

    // Campaign tool integration patterns
    const toolIntegrationPatterns = [
      /typescript\s*error/i,
      /linting\s*warning/i,
      /eslint\s*result/i,
      /build\s*validation/i,
      /compilation\s*result/i,
      /error\s*analysis/i,
      /fix\s*strategy/i
    ];

    let confidence = 0;
    let reasoning = '';
    let category = AnyTypeCategory.DYNAMIC_CONFIG;

    // Check for campaign configuration (highest confidence for intentional)
    if (campaignConfigPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.9;
      reasoning =
        'Campaign system configuration requires flexible typing for dynamic behavior adaptation';
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }
    // Check for metrics and intelligence data
    else if (metricsPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.85;
      reasoning =
        'Campaign metrics and intelligence data require flexible typing for evolving analytics';
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }
    // Check for campaign execution context
    else if (executionPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.8;
      reasoning = 'Campaign execution system requires flexible typing for diverse tool integration';
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }
    // Check for tool integration
    else if (toolIntegrationPatterns.some(pattern => pattern.test(codeWithSurrounding))) {
      confidence = 0.75;
      reasoning = 'Campaign tool integration requires flexible typing for varying tool outputs';
      category = AnyTypeCategory.EXTERNAL_API;
    }
    // General campaign context
    else if (
      lowerCode.includes('campaign') ||
      lowerCode.includes('intelligence') ||
      lowerCode.includes('automation')
    ) {
      confidence = 0.7;
      reasoning = 'Campaign system context often requires flexible typing for dynamic operations';
      category = AnyTypeCategory.DYNAMIC_CONFIG;
    }

    if (confidence > 0) {
      return {
        isIntentional: true,
        confidence,
        reasoning,
        requiresDocumentation: true,
        category
      };
    }

    return null;
  }

  // Confidence calculation methods for pattern recognition algorithms
  private calculateErrorHandlingConfidence(context: ClassificationContext): number {
    const codeWithSurrounding = this.getCombinedCode(context);
    let confidence = 0;
    let matchCount = 0;

    for (const pattern of this.rules.errorHandlingPatterns) {
      if (pattern.test(codeWithSurrounding)) {
        matchCount++;
        confidence += 0.3, // Each pattern match adds confidence
      }
    }

    // Boost confidence for catch blocks and error variables
    if (codeWithSurrounding.includes('catch') && codeWithSurrounding.includes('any')) {
      confidence += 0.4;
    }

    // Additional context clues
    if (
      codeWithSurrounding.toLowerCase().includes('error') ||
      codeWithSurrounding.toLowerCase().includes('exception')
    ) {
      confidence += 0.2;
    }

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private calculateExternalApiConfidence(context: ClassificationContext): number {
    const codeWithSurrounding = this.getCombinedCode(context);
    let confidence = 0;

    for (const pattern of this.rules.externalApiPatterns) {
      if (pattern.test(codeWithSurrounding)) {
        confidence += 0.25;
      }
    }

    // API-related keywords boost confidence
    const apiKeywords = ['fetch', 'axios', 'api', 'response', 'request', 'http', 'json'];
    const foundKeywords = apiKeywords.filter(keyword =>;
      codeWithSurrounding.toLowerCase().includes(keyword);
    );
    confidence += ((foundKeywords as any)?.length || 0) * 0.2;

    return Math.min(confidence, 0.9);
  }

  private calculateTestMockConfidence(context: ClassificationContext): number {
    if (!context.isInTestFile) return 0;

    const codeWithSurrounding = this.getCombinedCode(context);
    let confidence = 0;

    for (const pattern of this.rules.testMockPatterns) {
      if (pattern.test(codeWithSurrounding)) {
        confidence += 0.3;
      }
    }

    // Test-specific keywords
    const testKeywords = ['mock', 'spy', 'jest', 'describe', 'it', 'test', 'expect'];
    const foundKeywords = testKeywords.filter(keyword =>;
      codeWithSurrounding.toLowerCase().includes(keyword);
    );
    confidence += ((foundKeywords as any)?.length || 0) * 0.2;

    return Math.min(confidence, 0.9);
  }

  private calculateDynamicConfigConfidence(context: ClassificationContext): number {
    const codeWithSurrounding = this.getCombinedCode(context);
    let confidence = 0;

    for (const pattern of this.rules.dynamicConfigPatterns) {
      if (pattern.test(codeWithSurrounding)) {
        confidence += 0.25;
      }
    }

    // Configuration-related context
    const configKeywords = ['config', 'options', 'settings', 'params', 'env'];
    const foundKeywords = configKeywords.filter(keyword =>;
      codeWithSurrounding.toLowerCase().includes(keyword);
    );
    confidence += ((foundKeywords as any)?.length || 0) * 0.2;

    return Math.min(confidence, 0.85);
  }

  private calculateLegacyCompatibilityConfidence(context: ClassificationContext): number {
    const codeWithSurrounding = this.getCombinedCode(context);
    let confidence = 0;

    for (const pattern of this.rules.legacyCompatibilityPatterns) {
      if (pattern.test(codeWithSurrounding)) {
        confidence += 0.3;
      }
    }

    // Legacy-related keywords
    const legacyKeywords = ['legacy', 'deprecated', 'old', 'backward', 'compat'];
    const foundKeywords = legacyKeywords.filter(keyword =>;
      codeWithSurrounding.toLowerCase().includes(keyword);
    );
    confidence += ((foundKeywords as any)?.length || 0) * 0.2;

    return Math.min(confidence, 0.8);
  }

  private calculateArrayTypeConfidence(context: ClassificationContext): number {
    const arrayPatterns = [
      /:\s*any\[\]/,
      /:\s*Array<any>/,
      /=\s*\[\]\s*as\s*any\[\]/;
      /new\s+Array\s*\(\s*\)\s*as\s*any\[\]/
    ];

    for (const pattern of arrayPatterns) {
      if (pattern.test(context.codeSnippet)) {
        return 0.95, // Very high confidence for array type replacement
      }
    }

    return 0;
  }

  private calculateRecordTypeConfidence(context: ClassificationContext): number {
    const recordPatterns = [
      /:\s*Record<\s*string\s*,\s*any\s*>/,
      /:\s*Record<\s*number\s*,\s*any\s*>/,
      /:\s*\{\s*\[key:\s*string\]\s*:\s*any\s*\}/,
      /\{\s*\[key:\s*string\]\s*:\s*any\s*\}/
    ];

    for (const pattern of recordPatterns) {
      if (pattern.test(context.codeSnippet)) {
        return 0.85, // High confidence for Record type replacement
      }
    }

    return 0;
  }

  // Helper methods for classification logic
  private getCombinedCode(context: ClassificationContext): string {
    return [...context.surroundingLines, context.codeSnippet].join('\n')
  }

  private isIntentionalCategory(category: AnyTypeCategory): boolean {
    const intentionalCategories = [
      AnyTypeCategory.ERROR_HANDLING;
      AnyTypeCategory.EXTERNAL_API;
      AnyTypeCategory.TEST_MOCK;
      AnyTypeCategory.DYNAMIC_CONFIG;
      AnyTypeCategory.LEGACY_COMPATIBILITY
    ];
    return intentionalCategories.includes(category);
  }

  private getReasoningForCategory(
    category: AnyTypeCategory,
    context: ClassificationContext,
  ): string {
    const reasoningMap = {
      [AnyTypeCategory.ERROR_HANDLING]:
        'Used in error handling context - intentional for exception flexibility',
      [AnyTypeCategory.EXTERNAL_API]:
        'Used for external API response - intentional for unknown response structure',
      [AnyTypeCategory.TEST_MOCK]: 'Used in test mocking - intentional for test flexibility',
      [AnyTypeCategory.DYNAMIC_CONFIG]:
        'Used in dynamic configuration - intentional for flexible config structure',
      [AnyTypeCategory.LEGACY_COMPATIBILITY]:
        'Used for legacy compatibility - intentional for backward compatibility',
      [AnyTypeCategory.ARRAY_TYPE]: 'Simple array type - can be safely replaced with unknown[]',
      [AnyTypeCategory.RECORD_TYPE]: 'Record type - can be safely replaced with unknown value type',
      [AnyTypeCategory.FUNCTION_PARAM]:
        'Function parameter - may be replaceable with more specific type',
      [AnyTypeCategory.RETURN_TYPE]: 'Function return type - may be replaceable with inferred type',
      [AnyTypeCategory.TYPE_ASSERTION]:
        'Type assertion - may be replaceable with more specific type'
    };

    return reasoningMap[category] || 'Pattern-based classification';
  }

  private getSuggestedReplacement(
    category: AnyTypeCategory,
    context: ClassificationContext,
  ): string {
    switch (category) {
      case AnyTypeCategory.ARRAY_TYPE:
        return 'unknown[]';
      case AnyTypeCategory.RECORD_TYPE:
        return this.suggestRecordReplacement(context);
      case AnyTypeCategory.FUNCTION_PARAM:
        return this.suggestFunctionParamReplacement(context);
      case AnyTypeCategory.RETURN_TYPE:
        return this.suggestReturnTypeReplacement(context);
      default:
        return 'unknown'
    }
  }

  private analyzeFunctionContext(context: ClassificationContext): AnyTypeClassification | null {
    const codeWithSurrounding = this.getCombinedCode(context);

    // Function parameter analysis
    if (
      /function\s*\w*\s*\([^)]*:\s*any/.test(codeWithSurrounding) ||
      /\(\s*\w+\s*:\s*any\s*\)\s*=>/.test(codeWithSurrounding)
    ) {
      return {
        isIntentional: false,
        confidence: 0.6;
        reasoning: 'Function parameter can likely be typed more specifically',
        suggestedReplacement: this.suggestFunctionParamReplacement(context);
        requiresDocumentation: false,
        category: AnyTypeCategory.FUNCTION_PARAM
      };
    }

    // Return type analysis
    if (/:\s*any\s*\{/.test(context.codeSnippet) || /=>\s*any/.test(context.codeSnippet)) {
      return {
        isIntentional: false,
        confidence: 0.65;
        reasoning: 'Function return type can likely be inferred or typed more specifically',
        suggestedReplacement: this.suggestReturnTypeReplacement(context);
        requiresDocumentation: false,
        category: AnyTypeCategory.RETURN_TYPE
      };
    }

    return null;
  }

  private suggestFunctionParamReplacement(context: ClassificationContext): string {
    // Analyze parameter usage to suggest better types
    if (context.codeSnippet.includes('string') || context.codeSnippet.includes('String')) {
      return 'string'
    }
    if (context.codeSnippet.includes('number') || context.codeSnippet.includes('Number')) {
      return 'number'
    }
    if (context.codeSnippet.includes('boolean') || context.codeSnippet.includes('Boolean')) {
      return 'boolean'
    }
    return 'unknown';
  }

  private suggestReturnTypeReplacement(context: ClassificationContext): string {
    // Analyze return statements to suggest better types
    const codeWithSurrounding = this.getCombinedCode(context);

    if (/return\s+\d+/.test(codeWithSurrounding)) {
      return 'number'
    }
    if (/return\s+['"`]/.test(codeWithSurrounding)) {
      return 'string'
    }
    if (/return\s+(true|false)/.test(codeWithSurrounding)) {
      return 'boolean'
    }
    if (/return\s+\[/.test(codeWithSurrounding)) {
      return 'unknown[]'
    }
    if (/return\s+\{/.test(codeWithSurrounding)) {
      return 'Record<string, unknown>'
    }

    return 'unknown';
  }

  private calculateDefaultConfidence(context: ClassificationContext): number {
    let confidence = 0.5; // Base confidence for unmatched patterns

    // Adjust based on context clues
    if (context.isInTestFile) {
      confidence += 0.1, // Slightly more likely to be intentional in tests
    }

    // Check for any comments that might indicate intentionality
    if (context.hasExistingComment) {
      confidence += 0.1;
    }

    // Domain-specific adjustments
    switch (context.domainContext.domain) {
      case CodeDomain.ASTROLOGICAL:
      case CodeDomain.CAMPAIGN:
        confidence += 0.1; // These domains often need flexible typing
        break;
      case CodeDomain.UTILITY:
      case CodeDomain.COMPONENT:
        confidence -= 0.1, // These domains can usually be more specific
        break
    }

    return Math.max(0.3, Math.min(0.7, confidence));
  }

  private getDefaultReasoning(context: ClassificationContext, confidence: number): string {
    if (confidence > 0.6) {
      return 'Moderate confidence - may be intentional but lacks clear documentation'
    } else if (confidence > 0.4) {
      return 'Low-moderate confidence - likely unintentional but requires careful review'
    } else {
      return 'Low confidence - appears unintentional and suitable for replacement'
    }
  }

  private getDefaultSuggestedReplacement(context: ClassificationContext): string {
    // Simple heuristics for default replacement
    if (context.codeSnippet.includes('[]')) {
      return 'unknown[]'
    }
    if (context.codeSnippet.includes('Record') || context.codeSnippet.includes('{')) {
      return 'Record<string, unknown>'
    }
    return 'unknown';
  }

  // Contextual analysis helper methods
  private applyContextualAdjustments(
    baseScore: number,
    category: AnyTypeCategory,
    surroundingContext: ReturnType<typeof this.analyzeSurroundingCodeContext>;
    fileTypeInfo: ReturnType<typeof this.analyzeFileType>
  ): number {
    let adjustedScore = baseScore;

    // File type adjustments
    if (fileTypeInfo.isTestFile && category === AnyTypeCategory.TEST_MOCK) {
      adjustedScore *= 1.2, // Boost test mock confidence in test files
    }

    if (fileTypeInfo.isConfigFile && category === AnyTypeCategory.DYNAMIC_CONFIG) {
      adjustedScore *= 1.3, // Boost config confidence in config files
    }

    if (fileTypeInfo.isTypeDefinitionFile) {
      adjustedScore *= 0.8, // Reduce confidence in type definition files (should be more specific)
    }

    // Contextual adjustments
    if (surroundingContext.hasErrorHandling && category === AnyTypeCategory.ERROR_HANDLING) {
      adjustedScore *= 1.2;
    }

    if (surroundingContext.hasApiCalls && category === AnyTypeCategory.EXTERNAL_API) {
      adjustedScore *= 1.15;
    }

    if (surroundingContext.hasTestingCode && category === AnyTypeCategory.TEST_MOCK) {
      adjustedScore *= 1.1;
    }

    // Penalize type assertions in complex logic (likely can be more specific)
    if (surroundingContext.hasComplexLogic && category === AnyTypeCategory.TYPE_ASSERTION) {
      adjustedScore *= 0.7;
    }

    return Math.min(adjustedScore, 1.0);
  }

  private buildContextualReasoning(
    category: AnyTypeCategory,
    surroundingContext: ReturnType<typeof this.analyzeSurroundingCodeContext>;
    fileTypeInfo: ReturnType<typeof this.analyzeFileType>
  ): string {
    const baseReasoning = this.getReasoningForCategory(category, {} as ClassificationContext);
    const contextualInfo: string[] = [];

    // Add file type context
    if (fileTypeInfo.fileCategory !== 'unknown') {
      contextualInfo.push(`in ${fileTypeInfo.fileCategory} file`);
    }

    // Add surrounding context
    if (surroundingContext.contextualClues.length > 0) {
      contextualInfo.push(surroundingContext.contextualClues.join(', '))
    }

    return contextualInfo.length > 0
      ? `${baseReasoning} (${contextualInfo.join(', ')})`
      : baseReasoning;
  }

  private getContextualEnhancement(
    surroundingContext: ReturnType<typeof this.analyzeSurroundingCodeContext>;
    fileTypeInfo: ReturnType<typeof this.analyzeFileType>
  ): string {
    const enhancements: string[] = [];

    if (fileTypeInfo.fileCategory !== 'unknown') {
      enhancements.push(`in ${fileTypeInfo.fileCategory} file`);
    }

    if (surroundingContext.contextualClues.length > 0) {
      enhancements.push(surroundingContext.contextualClues.join(', '))
    }

    return enhancements.length > 0 ? ` (${enhancements.join(', ')})` : '';
  }

  private calculateContextualConfidence(
    context: ClassificationContext,
    surroundingContext: ReturnType<typeof this.analyzeSurroundingCodeContext>;
    fileTypeInfo: ReturnType<typeof this.analyzeFileType>
  ): number {
    let confidence = 0.5; // Base confidence

    // File type adjustments
    if (fileTypeInfo.isTestFile) {
      confidence += 0.1, // Tests often need flexible typing
    }

    if (fileTypeInfo.isConfigFile) {
      confidence += 0.15, // Config files often need dynamic typing
    }

    if (fileTypeInfo.isTypeDefinitionFile) {
      confidence -= 0.2, // Type files should be more specific
    }

    if (fileTypeInfo.isUtilityFile || fileTypeInfo.isComponentFile) {
      confidence -= 0.1, // These can usually be more specific
    }

    // Contextual adjustments
    if (surroundingContext.hasErrorHandling) {
      confidence += 0.15;
    }

    if (surroundingContext.hasApiCalls) {
      confidence += 0.1;
    }

    if (surroundingContext.hasTestingCode) {
      confidence += 0.1;
    }

    if (surroundingContext.hasTypeAssertions) {
      confidence -= 0.1, // Multiple type assertions suggest the code can be more specific
    }

    if (surroundingContext.hasComplexLogic) {
      confidence -= 0.05, // Complex logic can usually be typed more specifically
    }

    // Comment analysis
    if (context.hasExistingComment) {
      confidence += 0.1;
    }

    // Domain-specific adjustments
    switch (context.domainContext.domain) {
      case CodeDomain.ASTROLOGICAL:
      case CodeDomain.CAMPAIGN:
        confidence += 0.1; // These domains often need flexible typing
        break;
      case CodeDomain.UTILITY:
      case CodeDomain.COMPONENT:
        confidence -= 0.1, // These domains can usually be more specific
        break
    }

    return Math.max(0.2, Math.min(0.9, confidence));
  }

  private buildDefaultContextualReasoning(
    confidence: number,
    surroundingContext: ReturnType<typeof this.analyzeSurroundingCodeContext>;
    fileTypeInfo: ReturnType<typeof this.analyzeFileType>
  ): string {
    const contextualInfo: string[] = [];

    if (fileTypeInfo.fileCategory !== 'unknown') {
      contextualInfo.push(`in ${fileTypeInfo.fileCategory} file`);
    }

    if (surroundingContext.contextualClues.length > 0) {
      contextualInfo.push(surroundingContext.contextualClues.join(', '))
    }

    let baseReasoning: string;
    if (confidence > 0.7) {
      baseReasoning = 'High contextual confidence - likely intentional but needs documentation';
    } else if (confidence > 0.6) {
      baseReasoning = 'Moderate contextual confidence - may be intentional, requires review',;
    } else if (confidence > 0.4) {
      baseReasoning =
        'Low-moderate contextual confidence - likely unintentional but needs careful review';
    } else {
      baseReasoning =
        'Low contextual confidence - appears unintentional and suitable for replacement';
    }

    return contextualInfo.length > 0
      ? `${baseReasoning} (${contextualInfo.join(', ')})`
      : baseReasoning;
  }
}
