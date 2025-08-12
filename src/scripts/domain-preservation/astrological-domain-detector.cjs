#!/usr/bin/env node

/**
 * Astrological Domain Variable Detection System
 *
 * This module implements sophisticated pattern matching for astrological domain variables
 * to ensure preservation of planetary position variables, astronomical calculation variables,
 * and elemental calculation variables (Fire, Water, Earth, Air).
 *
 * Requirements: 2.1, 2.2, 2.4
 */

class AstrologicalDomainDetector {
  constructor() {
    this.patterns = this.initializeAstrologicalPatterns();
  }

  /**
   * Initialize comprehensive astrological domain patterns
   */
  initializeAstrologicalPatterns() {
    return {
      // Core planetary position variables
      planetaryPositions: {
        patterns: [
          // Direct planetary position variables
          /\b(planet|degree|sign|longitude|position|coordinates?)\b/i,
          /\b(planetaryPositions?|planetPos|positions?)\b/i,
          /\b(exactLongitude|zodiacSign|celestialPosition)\b/i,

          // Planetary position properties
          /\b(planet|degree|sign|longitude|position|coordinates?)(?:Data|Info|Value|Prop)?\b/i,
          /\b(?:current|real|exact|precise)(?:Position|Longitude|Degree|Sign)\b/i,

          // Position calculation variables
          /\b(julianDay|jd|T|meanLongitude|trueLongitude)\b/i,
          /\b(eclipticLongitude|rightAscension|declination)\b/i,
          /\b(azimuth|altitude|hourAngle|localSiderealTime)\b/i,
        ],
        reason: 'Planetary position variable - essential for astronomical calculations',
        confidence: 0.95,
        category: 'planetary-positions'
      },

      // Individual planet variables
      planets: {
        patterns: [
          // Major planets
          /\b(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)\b/i,
          /\b(sol|luna|hermes|aphrodite|ares|zeus|kronos|ouranos|poseidon|hades)\b/i,

          // Planet with suffixes
          /\b(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)(?:Pos|Position|Sign|Degree|Data|Info)\b/i,

          // Lunar nodes
          /\b(northNode|southNode|lunarNode|node|rahu|ketu)\b/i,

          // Asteroid and other celestial bodies
          /\b(chiron|ceres|pallas|juno|vesta|lilith|fortuna)\b/i,
        ],
        reason: 'Individual planet variable - core to astrological calculations',
        confidence: 0.9,
        category: 'planets'
      },

      // Zodiac signs and elements
      zodiacSigns: {
        patterns: [
          // Zodiac signs
          /\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i,
          /\b(ram|bull|twins|crab|lion|virgin|scales|scorpion|archer|goat|waterbearer|fish)\b/i,

          // Sign-related variables
          /\b(zodiacSign|astrologySign|signName|signElement|signQuality)\b/i,
          /\b(cardinal|fixed|mutable|quality|modality)\b/i,

          // Sign calculations
          /\b(signDegree|signPosition|signBoundary|signIngress)\b/i,
        ],
        reason: 'Zodiac sign variable - fundamental to astrological system',
        confidence: 0.9,
        category: 'zodiac-signs'
      },

      // Elemental system variables (Fire, Water, Earth, Air)
      elementalSystem: {
        patterns: [
          // Core elements
          /\b(fire|water|earth|air)(?:Element|Properties|Balance|Harmony|Energy|Influence|Value|Score)?\b/i,
          /\b(elemental|element)(?:Properties|Balance|Harmony|Energy|Calculation|System|Type)?\b/i,

          // Extended elemental system
          /\b(metal|wood|void)(?:Element|Properties|Balance|Harmony)?\b/i,

          // Elemental calculations
          /\b(elementalEnergies?|elementalInfluence|elementalCompatibility)\b/i,
          /\b(fireEnergy|waterEnergy|earthEnergy|airEnergy)\b/i,
          /\b(elementalWeights?|elementalScores?|elementalValues?)\b/i,

          // Elemental harmony and compatibility
          /\b(elementalHarmony|elementCompatibility|elementalSynergy)\b/i,
          /\b(selfReinforcement|elementalBalance|harmonicResonance)\b/i,
        ],
        reason: 'Elemental system variable - core to four-element calculations',
        confidence: 0.9,
        category: 'elemental-system'
      },

      // Astronomical calculations
      astronomicalCalculations: {
        patterns: [
          // Transit and aspect calculations
          /\b(transit|retrograde|conjunction|opposition|trine|square|sextile|quincunx)\b/i,
          /\b(aspect|orb|applying|separating|exact|partile)\b/i,

          // Astronomical timing
          /\b(ingress|station|direct|retrograde|eclipse|lunation)\b/i,
          /\b(newMoon|fullMoon|lunarPhase|solarReturn|lunarReturn)\b/i,

          // House system
          /\b(house|cusp|midheaven|ascendant|descendant|imumCoeli|mc|ic|asc|dsc)\b/i,
          /\b(angular|succedent|cadent|houseCusp|housePosition)\b/i,

          // Ephemeris and calculation data
          /\b(ephemeris|almanac|astronomical|celestial|cosmic)\b/i,
          /\b(siderealTime|obliquity|nutation|precession)\b/i,
        ],
        reason: 'Astronomical calculation variable - essential for complex astrological computations',
        confidence: 0.85,
        category: 'astronomical-calculations'
      },

      // Astrological chart and interpretation
      chartInterpretation: {
        patterns: [
          // Chart types and data
          /\b(natal|birth|horoscope|chart|synastry|composite|progressed|solar|lunar)\b/i,
          /\b(chartData|birthData|natalChart|horoscopeData)\b/i,

          // Interpretation variables
          /\b(interpretation|meaning|significance|influence|energy|vibration)\b/i,
          /\b(dignity|exaltation|detriment|fall|rulership|domicile)\b/i,

          // Astrological timing
          /\b(timing|favorable|unfavorable|auspicious|inauspicious)\b/i,
          /\b(optimal|peak|void|critical|sensitive)\b/i,
        ],
        reason: 'Chart interpretation variable - important for astrological analysis',
        confidence: 0.8,
        category: 'chart-interpretation'
      },

      // Complex astronomical libraries
      astronomicalLibraries: {
        patterns: [
          // Library-specific variables (astronomia, astronomy-engine, etc.)
          /\b(astronomia|astronomy|ephemeris|swisseph|vsop|elp|lunar|solar)\b/i,
          /\b(meeus|chapront|simon|bretagnon|francou)\b/i,

          // Mathematical astronomy variables
          /\b(kepler|newton|lagrange|perturbation|orbital|elliptical)\b/i,
          /\b(perihelion|aphelion|perigee|apogee|anomaly|eccentricity)\b/i,

          // Coordinate systems
          /\b(equatorial|ecliptic|galactic|horizontal|topocentric|geocentric|heliocentric)\b/i,
          /\b(coordinate|transformation|conversion|projection)\b/i,
        ],
        reason: 'Complex astronomical library variable - critical for calculation accuracy',
        confidence: 0.85,
        category: 'astronomical-libraries'
      },

      // Culinary astrology integration
      culinaryAstrology: {
        patterns: [
          // Astrological cooking variables
          /\b(culinaryAstrology|astrologicalCooking|cosmicCuisine)\b/i,
          /\b(planetaryInfluence|celestialTiming|astrologicalTiming)\b/i,

          // Elemental cooking
          /\b(elementalCooking|fireMethod|waterMethod|earthMethod|airMethod)\b/i,
          /\b(cookingElement|preparationElement|elementalPreparation)\b/i,

          // Astrological ingredient matching
          /\b(planetaryCorrespondence|astrologicalMatch|celestialHarmony)\b/i,
          /\b(zodiacIngredient|planetaryHerb|astrologicalSpice)\b/i,
        ],
        reason: 'Culinary astrology variable - bridges cooking and celestial calculations',
        confidence: 0.8,
        category: 'culinary-astrology'
      }
    };
  }

  /**
   * Detect astrological domain variables in a given context
   * @param {string} variableName - The variable name to analyze
   * @param {string} filePath - The file path for context
   * @param {string} fileContent - The file content for additional context
   * @returns {Object} Detection result with preservation recommendation
   */
  detectAstrologicalDomain(variableName, filePath, fileContent = '') {
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

    // Return the highest confidence match
    if (detectionResults.length > 0) {
      const bestMatch = detectionResults.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      );

      return {
        shouldPreserve: true,
        domain: 'astrological',
        category: bestMatch.category,
        subcategory: bestMatch.subcategory,
        confidence: bestMatch.confidence,
        reason: bestMatch.reason,
        matchType: bestMatch.matchType,
        matchedPattern: bestMatch.matchedPattern,
        allMatches: detectionResults
      };
    }

    return {
      shouldPreserve: false,
      domain: 'generic',
      confidence: 0.1,
      reason: 'No astrological domain patterns matched'
    };
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

    // Check file path patterns for astrological context
    const astrologicalPaths = [
      /\/calculations\//i,
      /\/astrology\//i,
      /\/celestial\//i,
      /\/planetary\//i,
      /\/elemental\//i,
      /astrological/i,
      /planetary/i,
      /celestial/i,
      /elemental/i
    ];

    const isAstrologicalFile = astrologicalPaths.some(pathPattern =>
      pathPattern.test(filePath)
    );

    if (isAstrologicalFile) {
      // In astrological files, be more lenient with pattern matching
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
   * Check if a variable name appears in the context of astrological calculations
   * @param {string} variableName - Variable to check
   * @param {string} fileContent - File content to search
   * @returns {boolean} Whether variable appears in astrological context
   */
  isVariableInContext(variableName, fileContent) {
    // Look for the variable name in lines that contain astrological keywords
    const lines = fileContent.split('\n');
    const astrologicalKeywords = [
      'planet', 'sign', 'degree', 'longitude', 'position', 'element',
      'fire', 'water', 'earth', 'air', 'astrological', 'celestial',
      'zodiac', 'lunar', 'solar', 'mercury', 'venus', 'mars', 'jupiter'
    ];

    return lines.some(line => {
      const containsVariable = line.includes(variableName);
      const containsAstrologicalKeyword = astrologicalKeywords.some(keyword =>
        line.toLowerCase().includes(keyword)
      );
      return containsVariable && containsAstrologicalKeyword;
    });
  }

  /**
   * Get file-specific preservation rules based on file path
   * @param {string} filePath - File path to analyze
   * @returns {Object} File-specific preservation configuration
   */
  getFileSpecificRules(filePath) {
    const rules = {
      preservationLevel: 'standard',
      batchSize: 15,
      requiresManualReview: false,
      specialInstructions: []
    };

    // High-preservation files
    const highPreservationPaths = [
      /\/calculations\/.*astronomical/i,
      /\/calculations\/.*planetary/i,
      /\/calculations\/.*elemental/i,
      /\/services\/.*celestial/i,
      /\/utils\/.*astronomy/i,
      /reliableAstronomy/i,
      /planetaryConsistencyCheck/i
    ];

    if (highPreservationPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'maximum';
      rules.batchSize = 5;
      rules.requiresManualReview = true;
      rules.specialInstructions.push('Critical astrological calculation file - preserve all domain variables');
    }

    // Complex astronomical library files
    const complexLibraryPaths = [
      /astronomia/i,
      /astronomy-engine/i,
      /ephemeris/i,
      /meeus/i
    ];

    if (complexLibraryPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'maximum';
      rules.batchSize = 3;
      rules.requiresManualReview = true;
      rules.specialInstructions.push('Complex astronomical library - apply conservative elimination patterns');
    }

    // Elemental calculation files
    const elementalPaths = [
      /elemental.*calculation/i,
      /four.*element/i,
      /fire.*water.*earth.*air/i
    ];

    if (elementalPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'high';
      rules.batchSize = 8;
      rules.specialInstructions.push('Elemental calculation file - preserve Fire, Water, Earth, Air variables');
    }

    return rules;
  }

  /**
   * Generate preservation report for astrological domain
   * @param {Array} variables - Array of variables to analyze
   * @returns {Object} Comprehensive preservation report
   */
  generatePreservationReport(variables) {
    const report = {
      totalVariables: variables.length,
      preservedVariables: 0,
      categoryBreakdown: {},
      fileAnalysis: {},
      recommendations: []
    };

    variables.forEach(variable => {
      const detection = this.detectAstrologicalDomain(
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
            categories: new Set()
          };
        }
        report.fileAnalysis[fileName].totalVariables++;
        report.fileAnalysis[fileName].preservedVariables++;
        report.fileAnalysis[fileName].categories.add(category);
      }
    });

    // Generate recommendations
    report.recommendations = this.generateAstrologicalRecommendations(report);

    return report;
  }

  /**
   * Generate specific recommendations for astrological domain preservation
   * @param {Object} report - Analysis report
   * @returns {Array} Array of recommendations
   */
  generateAstrologicalRecommendations(report) {
    const recommendations = [];

    // High preservation rate recommendation
    const preservationRate = (report.preservedVariables / report.totalVariables) * 100;
    if (preservationRate > 30) {
      recommendations.push({
        type: 'high-preservation-rate',
        message: `${preservationRate.toFixed(1)}% of variables preserved for astrological domain`,
        action: 'Consider transforming preserved variables into active features',
        priority: 'medium'
      });
    }

    // Category-specific recommendations
    Object.entries(report.categoryBreakdown).forEach(([category, count]) => {
      if (count > 10) {
        recommendations.push({
          type: 'category-concentration',
          category,
          count,
          message: `High concentration of ${category} variables (${count})`,
          action: `Review ${category} variables for potential consolidation or activation`,
          priority: 'low'
        });
      }
    });

    // File-specific recommendations
    Object.entries(report.fileAnalysis).forEach(([fileName, analysis]) => {
      if (analysis.preservedVariables > 5) {
        recommendations.push({
          type: 'file-concentration',
          fileName,
          count: analysis.preservedVariables,
          message: `File ${fileName} has ${analysis.preservedVariables} preserved astrological variables`,
          action: 'Consider refactoring to consolidate astrological calculations',
          priority: 'low'
        });
      }
    });

    return recommendations;
  }
}

module.exports = AstrologicalDomainDetector;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.AstrologicalDomainDetector = AstrologicalDomainDetector;
}
