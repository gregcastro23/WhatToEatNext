#!/usr/bin/env node

/**
 * Test File Variable Detection System
 *
 * This module implements sophisticated pattern matching for test file variables
 * to ensure preservation of test-specific variables (mock, stub, test, expect, describe, it),
 * recipe and ingredient domain variables, and culinary domain variable detection patterns.
 *
 * Requirements: 2.5
 */

class TestFileDetector {
  constructor() {
    this.patterns = this.initializeTestPatterns();
  }

  /**
   * Initialize comprehensive test file patterns
   */
  initializeTestPatterns() {
    return {
      // Core testing framework variables
      testingFramework: {
        patterns: [
          // Jest/Vitest testing framework
          /\b(describe|it|test|expect|beforeEach|afterEach|beforeAll|afterAll)\b/i,
          /\b(jest|vitest|jasmine|mocha|chai|sinon)\b/i,
          /\b(suite|spec|should|assert|toBe|toEqual|toMatch|toContain)\b/i,

          // Test lifecycle and setup
          /\b(setup|teardown|cleanup|initialize|configure)\b/i,
          /\b(testSetup|testTeardown|testConfig|testOptions)\b/i,
          /\b(beforeTest|afterTest|testHook|testRunner)\b/i,

          // Test utilities and helpers
          /\b(testUtils|testHelpers|testFixtures|testData)\b/i,
          /\b(createTest|runTest|executeTest|validateTest)\b/i,
        ],
        reason: 'Testing framework variable - essential for test infrastructure',
        confidence: 0.9,
        category: 'testing-framework'
      },

      // Mock and stub variables
      mockingSystem: {
        patterns: [
          // Core mocking patterns
          /\b(mock|mocks|mocked|mocking|mockery)\b/i,
          /\b(stub|stubs|stubbed|stubbing|spy|spies|spied)\b/i,
          /\b(fake|fakes|faked|faking|dummy|dummies)\b/i,

          // Mock creation and management
          /\b(createMock|makeMock|buildMock|setupMock|configureMock)\b/i,
          /\b(mockFunction|mockMethod|mockClass|mockObject|mockModule)\b/i,
          /\b(mockImplementation|mockReturnValue|mockResolvedValue|mockRejectedValue)\b/i,

          // Mock verification and cleanup
          /\b(clearMocks|resetMocks|restoreMocks|verifyMocks)\b/i,
          /\b(mockCalls|mockResults|mockInstances|mockContext)\b/i,
          /\b(toHaveBeenCalled|toHaveBeenCalledWith|toHaveBeenCalledTimes)\b/i,
        ],
        reason: 'Mock/stub variable - critical for test isolation and verification',
        confidence: 0.9,
        category: 'mocking-system'
      },

      // Test fixtures and factories
      testFixtures: {
        patterns: [
          // Test data and fixtures
          /\b(fixture|fixtures|factory|factories|builder|builders)\b/i,
          /\b(testData|sampleData|mockData|dummyData|fakeData)\b/i,
          /\b(testCase|testCases|scenario|scenarios|example|examples)\b/i,

          // Factory and builder patterns
          /\b(createFixture|buildFixture|makeFixture|generateFixture)\b/i,
          /\b(fixtureBuilder|dataBuilder|objectBuilder|entityBuilder)\b/i,
          /\b(factoryMethod|builderPattern|testObjectFactory)\b/i,

          // Test data management
          /\b(seedData|testSeed|fixtureData|baselineData)\b/i,
          /\b(testConstants|testConfig|testSettings|testEnvironment)\b/i,
        ],
        reason: 'Test fixture variable - important for test data management',
        confidence: 0.85,
        category: 'test-fixtures'
      },

      // Recipe and ingredient domain (culinary testing)
      culinaryDomain: {
        patterns: [
          // Core culinary entities
          /\b(recipe|recipes|ingredient|ingredients|dish|dishes)\b/i,
          /\b(cuisine|cuisines|cooking|culinary|food|foods)\b/i,
          /\b(meal|meals|dish|dishes|plate|plates)\b/i,

          // Ingredient categories
          /\b(spice|spices|herb|herbs|vegetable|vegetables|fruit|fruits)\b/i,
          /\b(protein|proteins|grain|grains|dairy|oil|oils)\b/i,
          /\b(seasoning|seasonings|condiment|condiments|sauce|sauces)\b/i,

          // Cooking methods and techniques
          /\b(cooking|baking|roasting|grilling|frying|steaming|boiling)\b/i,
          /\b(preparation|prep|method|methods|technique|techniques)\b/i,
          /\b(cookingMethod|preparationMethod|cookingTechnique)\b/i,

          // Culinary properties
          /\b(flavor|flavors|taste|tastes|aroma|aromas|texture|textures)\b/i,
          /\b(nutritional|nutrition|dietary|allergen|allergens)\b/i,
          /\b(temperature|timing|duration|serving|servings)\b/i,
        ],
        reason: 'Culinary domain variable - important for recipe and ingredient testing',
        confidence: 0.8,
        category: 'culinary-domain'
      },

      // Astrological culinary integration (test context)
      astrologicalCulinary: {
        patterns: [
          // Astrological cooking integration
          /\b(astrologicalCooking|celestialCuisine|cosmicCooking)\b/i,
          /\b(planetaryInfluence|zodiacCooking|lunarCooking|solarCooking)\b/i,
          /\b(elementalCooking|elementalPreparation|elementalIngredient)\b/i,

          // Elemental culinary properties
          /\b(fireIngredient|waterIngredient|earthIngredient|airIngredient)\b/i,
          /\b(fireCooking|waterCooking|earthCooking|airCooking)\b/i,
          /\b(elementalBalance|elementalHarmony|elementalSynergy)\b/i,

          // Astrological timing and recommendations
          /\b(astrologicalTiming|celestialTiming|optimalTiming)\b/i,
          /\b(planetaryRecommendation|zodiacRecommendation|lunarRecommendation)\b/i,
          /\b(astrologicalMatch|celestialMatch|cosmicMatch)\b/i,
        ],
        reason: 'Astrological culinary variable - bridges cooking and celestial calculations in tests',
        confidence: 0.8,
        category: 'astrological-culinary'
      },

      // Test-specific React components
      reactTesting: {
        patterns: [
          // React testing utilities
          /\b(render|screen|fireEvent|userEvent|waitFor|act)\b/i,
          /\b(renderHook|renderWithProviders|renderComponent)\b/i,
          /\b(testRenderer|shallowRenderer|mountRenderer)\b/i,

          // React testing library patterns
          /\b(getByText|getByRole|getByTestId|getByLabelText)\b/i,
          /\b(queryByText|queryByRole|findByText|findByRole)\b/i,
          /\b(getAllByText|queryAllByText|findAllByText)\b/i,

          // Component testing
          /\b(component|wrapper|container|element|node)\b/i,
          /\b(props|state|context|ref|instance)\b/i,
          /\b(testComponent|mockComponent|stubComponent)\b/i,
        ],
        reason: 'React testing variable - essential for component testing',
        confidence: 0.85,
        category: 'react-testing'
      },

      // API and service testing
      apiTesting: {
        patterns: [
          // API testing patterns
          /\b(api|endpoint|request|response|client|server)\b/i,
          /\b(mockApi|stubApi|fakeApi|testApi|apiMock)\b/i,
          /\b(httpClient|restClient|graphqlClient|apiClient)\b/i,

          // Service testing
          /\b(service|services|provider|providers|adapter|adapters)\b/i,
          /\b(mockService|stubService|testService|serviceStub)\b/i,
          /\b(serviceLayer|businessLogic|dataLayer|persistenceLayer)\b/i,

          // Network and integration testing
          /\b(network|http|https|fetch|axios|request|response)\b/i,
          /\b(integration|e2e|endToEnd|acceptance|functional)\b/i,
          /\b(testServer|mockServer|testDatabase|mockDatabase)\b/i,
        ],
        reason: 'API/service testing variable - important for integration testing',
        confidence: 0.8,
        category: 'api-testing'
      },

      // Performance and load testing
      performanceTesting: {
        patterns: [
          // Performance testing
          /\b(performance|benchmark|load|stress|volume)\b/i,
          /\b(timing|duration|latency|throughput|memory|cpu)\b/i,
          /\b(performanceTest|loadTest|stressTest|benchmarkTest)\b/i,

          // Metrics and monitoring in tests
          /\b(metrics|measurement|profiling|monitoring|tracking)\b/i,
          /\b(testMetrics|performanceMetrics|loadMetrics)\b/i,
          /\b(baseline|threshold|target|limit|budget)\b/i,
        ],
        reason: 'Performance testing variable - valuable for quality assurance',
        confidence: 0.75,
        category: 'performance-testing'
      }
    };
  }

  /**
   * Detect test file variables in a given context
   * @param {string} variableName - The variable name to analyze
   * @param {string} filePath - The file path for context
   * @param {string} fileContent - The file content for additional context
   * @returns {Object} Detection result with preservation recommendation
   */
  detectTestDomain(variableName, filePath, fileContent = '') {
    // First check if this is actually a test file
    if (!this.isTestFile(filePath)) {
      return {
        shouldPreserve: false,
        domain: 'generic',
        confidence: 0.1,
        reason: 'Not a test file - no test domain patterns apply'
      };
    }

    const detectionResults = [];

    // Check each pattern category
    for (const [categoryName, categoryConfig] of Object.entries(this.patterns)) {
      const matchResult = this.checkPatternMatch(
        variableName,
        filePath,
        fileContent,
        categoryConfig
      );

      if (matchResult.isMatch) {
        detectionResults.push({
          category: categoryName,
          subcategory: categoryConfig.category,
          confidence: categoryConfig.confidence,
          reason: categoryConfig.reason,
          matchType: matchResult.matchType,
          matchedPattern: matchResult.matchedPattern
        });
      }
    }

    // Return the most specific match
    if (detectionResults.length > 0) {
      const sortedResults = detectionResults.sort((a, b) => {
        const aSpecific = this.getCategorySpecificity(a.category, variableName);
        const bSpecific = this.getCategorySpecificity(b.category, variableName);

        if (aSpecific !== bSpecific) {
          return bSpecific - aSpecific; // Higher specificity first
        }

        return b.confidence - a.confidence; // Higher confidence first
      });

      const bestMatch = sortedResults[0];

      return {
        shouldPreserve: true,
        domain: 'test',
        category: bestMatch.category,
        subcategory: bestMatch.subcategory,
        confidence: bestMatch.confidence,
        reason: bestMatch.reason,
        matchType: bestMatch.matchType,
        matchedPattern: bestMatch.matchedPattern,
        allMatches: detectionResults
      };
    }

    // Even in test files, preserve variables that might be test-related
    return {
      shouldPreserve: true,
      domain: 'test',
      category: 'generic-test',
      confidence: 0.6,
      reason: 'Variable in test file - preserved for testing infrastructure'
    };
  }

  /**
   * Check if a file is a test file
   * @param {string} filePath - File path to check
   * @returns {boolean} Whether the file is a test file
   */
  isTestFile(filePath) {
    const testFilePatterns = [
      /\.test\./i,
      /\.spec\./i,
      /\/__tests__\//i,
      /\/tests\//i,
      /\/test\//i,
      /\.test$/i,
      /\.spec$/i,
      /test.*\.ts$/i,
      /test.*\.js$/i,
      /spec.*\.ts$/i,
      /spec.*\.js$/i
    ];

    return testFilePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Get category specificity score for better matching
   * @param {string} category - Category name
   * @param {string} variableName - Variable name being matched
   * @returns {number} Specificity score (higher = more specific)
   */
  getCategorySpecificity(category, variableName) {
    const specificityMap = {
      // Most specific categories
      'testingFramework': variableName.toLowerCase().includes('test') ||
                         variableName.toLowerCase().includes('describe') ||
                         variableName.toLowerCase().includes('expect') ? 10 : 1,
      'mockingSystem': variableName.toLowerCase().includes('mock') ||
                      variableName.toLowerCase().includes('stub') ||
                      variableName.toLowerCase().includes('spy') ? 10 : 1,
      'culinaryDomain': variableName.toLowerCase().includes('recipe') ||
                       variableName.toLowerCase().includes('ingredient') ||
                       variableName.toLowerCase().includes('cuisine') ? 10 : 1,
      'astrologicalCulinary': variableName.toLowerCase().includes('elemental') ||
                             variableName.toLowerCase().includes('planetary') ||
                             variableName.toLowerCase().includes('astrological') ? 10 : 1,
      'reactTesting': variableName.toLowerCase().includes('render') ||
                     variableName.toLowerCase().includes('component') ? 10 : 1,

      // Medium specific categories
      'testFixtures': 5,
      'apiTesting': 4,
      'performanceTesting': 3,

      // Less specific categories
      'generic-test': 1
    };

    return specificityMap[category] || 1;
  }

  /**
   * Check if a variable matches a specific pattern category
   * @param {string} variableName - Variable name to check
   * @param {string} filePath - File path for context
   * @param {string} fileContent - File content for context
   * @param {Object} categoryConfig - Pattern configuration
   * @returns {Object} Match result
   */
  checkPatternMatch(variableName, filePath, fileContent, categoryConfig) {
    // Check variable name patterns
    for (const pattern of categoryConfig.patterns) {
      if (pattern.test(variableName)) {
        return {
          isMatch: true,
          matchType: 'variable-name',
          matchedPattern: pattern.toString()
        };
      }
    }

    // Check file content for context
    if (fileContent) {
      for (const pattern of categoryConfig.patterns) {
        if (pattern.test(fileContent) && this.isVariableInContext(variableName, fileContent)) {
          return {
            isMatch: true,
            matchType: 'file-context',
            matchedPattern: pattern.toString()
          };
        }
      }
    }

    return {
      isMatch: false,
      matchType: 'none',
      matchedPattern: null
    };
  }

  /**
   * Check if a variable name appears in the context of test operations
   * @param {string} variableName - Variable to check
   * @param {string} fileContent - File content to search
   * @returns {boolean} Whether variable appears in test context
   */
  isVariableInContext(variableName, fileContent) {
    // Look for the variable name in lines that contain test keywords
    const lines = fileContent.split('\n');
    const testKeywords = [
      'test', 'describe', 'it', 'expect', 'mock', 'stub', 'spy',
      'recipe', 'ingredient', 'cuisine', 'cooking', 'culinary',
      'render', 'component', 'api', 'service', 'fixture', 'factory'
    ];

    return lines.some(line => {
      const containsVariable = line.includes(variableName);
      const containsTestKeyword = testKeywords.some(keyword =>
        line.toLowerCase().includes(keyword)
      );
      return containsVariable && containsTestKeyword;
    });
  }

  /**
   * Get file-specific preservation rules based on file path
   * @param {string} filePath - File path to analyze
   * @returns {Object} File-specific preservation configuration
   */
  getFileSpecificRules(filePath) {
    const rules = {
      preservationLevel: 'high', // Test files generally have high preservation
      batchSize: 10,
      requiresManualReview: false,
      specialInstructions: []
    };

    // Critical test infrastructure files
    const criticalTestPaths = [
      /jest\.setup/i,
      /test.*setup/i,
      /test.*config/i,
      /vitest\.config/i,
      /jest\.config/i
    ];

    if (criticalTestPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'maximum';
      rules.batchSize = 3;
      rules.requiresManualReview = true;
      rules.specialInstructions.push('Critical test infrastructure - preserve all testing framework variables');
    }

    // Integration and E2E test files
    const integrationTestPaths = [
      /integration/i,
      /e2e/i,
      /end.*to.*end/i,
      /acceptance/i
    ];

    if (integrationTestPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'high';
      rules.batchSize = 8;
      rules.specialInstructions.push('Integration test file - preserve API and service testing variables');
    }

    // Culinary domain test files
    const culinaryTestPaths = [
      /recipe.*test/i,
      /ingredient.*test/i,
      /cuisine.*test/i,
      /culinary.*test/i,
      /cooking.*test/i
    ];

    if (culinaryTestPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'high';
      rules.batchSize = 8;
      rules.specialInstructions.push('Culinary domain test - preserve recipe and ingredient variables');
    }

    return rules;
  }

  /**
   * Generate preservation report for test file domain
   * @param {Array} variables - Array of variables to analyze
   * @returns {Object} Comprehensive preservation report
   */
  generatePreservationReport(variables) {
    const report = {
      totalVariables: variables.length,
      preservedVariables: 0,
      testFiles: 0,
      nonTestFiles: 0,
      categoryBreakdown: {},
      fileAnalysis: {},
      recommendations: []
    };

    variables.forEach(variable => {
      const isTestFile = this.isTestFile(variable.filePath);

      if (isTestFile) {
        report.testFiles++;
      } else {
        report.nonTestFiles++;
      }

      const detection = this.detectTestDomain(
        variable.variableName,
        variable.filePath,
        variable.fileContent || ''
      );

      if (detection.shouldPreserve) {
        report.preservedVariables++;

        // Category breakdown
        const category = detection.category || 'unknown';
        report.categoryBreakdown[category] = (report.categoryBreakdown[category] || 0) + 1;

        // File analysis
        const fileName = variable.filePath.split('/').pop();
        if (!report.fileAnalysis[fileName]) {
          report.fileAnalysis[fileName] = {
            totalVariables: 0,
            preservedVariables: 0,
            isTestFile: isTestFile,
            categories: new Set()
          };
        }
        report.fileAnalysis[fileName].totalVariables++;
        report.fileAnalysis[fileName].preservedVariables++;
        report.fileAnalysis[fileName].categories.add(category);
      }
    });

    // Generate recommendations
    report.recommendations = this.generateTestRecommendations(report);

    return report;
  }

  /**
   * Generate specific recommendations for test file preservation
   * @param {Object} report - Analysis report
   * @returns {Array} Array of recommendations
   */
  generateTestRecommendations(report) {
    const recommendations = [];

    // Test file coverage
    const testFilePercentage = (report.testFiles / (report.testFiles + report.nonTestFiles)) * 100;
    if (testFilePercentage > 20) {
      recommendations.push({
        type: 'high-test-coverage',
        percentage: testFilePercentage.toFixed(1),
        message: `${testFilePercentage.toFixed(1)}% of analyzed files are test files`,
        action: 'Ensure test infrastructure variables are properly preserved',
        priority: 'medium'
      });
    }

    // Mock system concentration
    if (report.categoryBreakdown['mockingSystem'] > 10) {
      recommendations.push({
        type: 'mock-system-concentration',
        count: report.categoryBreakdown['mockingSystem'],
        message: `High concentration of mocking system variables (${report.categoryBreakdown['mockingSystem']})`,
        action: 'Consider consolidating mock setup and teardown logic',
        priority: 'low'
      });
    }

    // Culinary domain testing
    if (report.categoryBreakdown['culinaryDomain'] > 5) {
      recommendations.push({
        type: 'culinary-testing-opportunity',
        count: report.categoryBreakdown['culinaryDomain'],
        message: `${report.categoryBreakdown['culinaryDomain']} culinary domain variables in tests`,
        action: 'Consider expanding recipe and ingredient test coverage',
        priority: 'medium'
      });
    }

    // Test infrastructure recommendations
    Object.entries(report.fileAnalysis).forEach(([fileName, analysis]) => {
      if (analysis.isTestFile && analysis.preservedVariables > 15) {
        recommendations.push({
          type: 'test-file-complexity',
          fileName,
          count: analysis.preservedVariables,
          message: `Test file ${fileName} has ${analysis.preservedVariables} preserved variables`,
          action: 'Consider breaking down complex test files into smaller, focused test suites',
          priority: 'low'
        });
      }
    });

    return recommendations;
  }
}

module.exports = TestFileDetector;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.TestFileDetector = TestFileDetector;
}
