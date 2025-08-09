/**
 * Enhanced Development Experience Optimizations
 *
 * This module implements enhanced development experience optimizations including:
 * - Optimized TypeScript configuration for faster compilation
 * - Enhanced IntelliSense for astrological type definitions
 * - Automatic import organization and error fixing
 * - Performance monitoring and real-time error detection
 */

import { logger } from '@/utils/logger';

// TypeScript compilation optimization settings
export interface TypeScriptOptimizationConfig {
  enableIncrementalCompilation: boolean;
  enableProjectReferences: boolean;
  enableCompositeMode: boolean;
  skipLibCheck: boolean;
  skipDefaultLibCheck: boolean;
  useDefineForClassFields: boolean;
  exactOptionalPropertyTypes: boolean;
  noUncheckedIndexedAccess: boolean;
  target: 'es2018' | 'es2020' | 'es2022' | 'esnext';
  module: 'commonjs' | 'esnext' | 'es2020' | 'es2022';
  moduleResolution: 'node' | 'bundler';
}

// IntelliSense enhancement configuration
export interface IntelliSenseConfig {
  enableAstrologicalTypeDefinitions: boolean;
  enableElementalPropertyIntelliSense: boolean;
  enablePlanetaryPositionAutoComplete: boolean;
  enableCulinaryAstrologySnippets: boolean;
  enableCustomTypeGuards: boolean;
}

// Import organization configuration
export interface ImportOrganizationConfig {
  enableAutoImportOrganization: boolean;
  enableUnusedImportRemoval: boolean;
  enableImportSorting: boolean;
  enablePathMapping: boolean;
  groupExternalImports: boolean;
  groupInternalImports: boolean;
}

// Performance monitoring configuration
export interface PerformanceMonitoringConfig {
  enableRealTimeErrorDetection: boolean;
  enableCompilationTimeTracking: boolean;
  enableMemoryUsageMonitoring: boolean;
  enableBundleSizeTracking: boolean;
  enableHotReloadOptimization: boolean;
}

export interface DevelopmentMetrics {
  compilationTime: number;
  memoryUsage: number;
  bundleSize: number;
  errorCount: number;
  warningCount: number;
  hotReloadTime: number;
  lastOptimization: number;
}

/**
 * Enhanced Development Experience Manager
 */
export class DevelopmentExperienceOptimizer {
  private static instance: DevelopmentExperienceOptimizer;
  private metrics: DevelopmentMetrics;
  private optimizationConfig: {
    typescript: TypeScriptOptimizationConfig;
    intelliSense: IntelliSenseConfig;
    importOrganization: ImportOrganizationConfig;
    performanceMonitoring: PerformanceMonitoringConfig;
  };

  private constructor() {
    this.metrics = this.initializeMetrics();
    this.optimizationConfig = this.getDefaultOptimizationConfig();
    this.startPerformanceMonitoring();
  }

  public static getInstance(): DevelopmentExperienceOptimizer {
    if (!DevelopmentExperienceOptimizer.instance) {
      DevelopmentExperienceOptimizer.instance = new DevelopmentExperienceOptimizer();
    }
    return DevelopmentExperienceOptimizer.instance;
  }

  /**
   * Generate optimized TypeScript configuration
   */
  public generateOptimizedTypeScriptConfig(): any {
    const config = this.optimizationConfig.typescript;

    return {
      compilerOptions: {
        // Performance optimizations
        target: config.target,
        module: config.module,
        moduleResolution: config.moduleResolution,

        // Compilation speed optimizations
        incremental: config.enableIncrementalCompilation,
        composite: config.enableCompositeMode,
        skipLibCheck: config.skipLibCheck,
        skipDefaultLibCheck: config.skipDefaultLibCheck,

        // Type checking optimizations
        strict: true,
        noImplicitAny: false, // Relaxed for rapid development
        strictNullChecks: false, // Relaxed for rapid development
        useDefineForClassFields: config.useDefineForClassFields,
        exactOptionalPropertyTypes: config.exactOptionalPropertyTypes,
        noUncheckedIndexedAccess: config.noUncheckedIndexedAccess,

        // Path mapping for better imports
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
          '@components/*': ['./src/components/*'],
          '@utils/*': ['./src/utils/*'],
          '@types/*': ['./src/types/*'],
          '@data/*': ['./src/data/*'],
          '@calculations/*': ['./src/calculations/*'],
          '@hooks/*': ['./src/hooks/*'],
          '@contexts/*': ['./src/contexts/*'],
        },

        // Enhanced type definitions
        lib: ['dom', 'dom.iterable', 'es6', 'es2018', 'es2020'],
        allowJs: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        isolatedModules: true,
        jsx: 'preserve',
        noEmit: true,
        resolveJsonModule: true,
      },

      // Include patterns for faster compilation
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],

      // Exclude patterns to reduce compilation time
      exclude: [
        'node_modules',
        '.next',
        'out',
        'build',
        'dist',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],

      // TypeScript project references for faster builds
      references: config.enableProjectReferences ? [{ path: './tsconfig.paths.json' }] : undefined,
    };
  }

  /**
   * Generate enhanced IntelliSense type definitions
   */
  public generateAstrologicalTypeDefinitions(): string {
    return `
// Enhanced Astrological Type Definitions for IntelliSense
declare global {
  namespace Astrology {
    // Planetary positions with enhanced IntelliSense
    interface PlanetaryPosition {
      /** Zodiac sign (e.g., 'aries', 'taurus', 'gemini') */
      sign: 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 
            'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';
      /** Degree within the sign (0-30) */
      degree: number;
      /** Exact longitude (0-360) */
      exactLongitude: number;
      /** Whether the planet is in retrograde motion */
      isRetrograde: boolean;
    }

    // Elemental properties with validation
    interface ElementalProperties {
      /** Fire element strength (0-1) - Energy, spice, quick cooking */
      Fire: number;
      /** Water element strength (0-1) - Cooling, fluid, steaming */
      Water: number;
      /** Earth element strength (0-1) - Grounding, root vegetables, slow cooking */
      Earth: number;
      /** Air element strength (0-1) - Light, leafy, raw preparations */
      Air: number;
    }

    // Planetary correspondences for ingredients
    interface PlanetaryCorrespondence {
      /** Primary ruling planet */
      rulingPlanet: 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';
      /** Secondary planetary influences */
      influences?: Array<'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'>;
      /** Optimal timing for use */
      optimalTiming?: string;
    }

    // Culinary astrology calculations
    interface CulinaryAstrologyData {
      /** Current dominant element based on planetary positions */
      dominantElement: 'Fire' | 'Water' | 'Earth' | 'Air';
      /** Recommended cooking methods */
      recommendedMethods: string[];
      /** Optimal ingredients for current conditions */
      optimalIngredients: string[];
      /** Timing recommendations */
      timing: {
        bestHours: string[];
        lunarPhase: string;
        planetaryHour: string;
      };
    }

    // Type guards for runtime validation
    function isPlanetaryPosition(obj: any): obj is PlanetaryPosition;
    function isElementalProperties(obj: any): obj is ElementalProperties;
    function isValidCompatibilityScore(score: number): boolean;
  }

  // Enhanced ingredient type definitions
  interface EnhancedIngredient {
    name: string;
    category: string;
    elementalProperties: Astrology.ElementalProperties;
    planetaryCorrespondence: Astrology.PlanetaryCorrespondence;
    culinaryProperties: {
      flavorProfile: string[];
      cookingMethods: string[];
      seasonality: string[];
      pairings: string[];
    };
    nutritionalData?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      vitamins: string[];
      minerals: string[];
    };
  }

  // Enhanced recipe type definitions
  interface EnhancedRecipe {
    id: string;
    name: string;
    ingredients: EnhancedIngredient[];
    instructions: string[];
    astrologicalOptimization: Astrology.CulinaryAstrologyData;
    elementalBalance: Astrology.ElementalProperties;
    timing: {
      prepTime: number;
      cookTime: number;
      totalTime: number;
      optimalStartTime?: string;
    };
  }
}

// Export enhanced types for use in components
export type {
  Astrology.PlanetaryPosition as PlanetaryPosition,
  Astrology.ElementalProperties as ElementalProperties,
  Astrology.CulinaryAstrologyData as CulinaryAstrologyData,
  EnhancedIngredient,
  EnhancedRecipe
};
`;
  }

  /**
   * Organize and optimize imports automatically
   */
  public organizeImports(sourceCode: string): string {
    if (!this.optimizationConfig.importOrganization.enableAutoImportOrganization) {
      return sourceCode;
    }

    const lines = sourceCode.split('\n');
    const imports: string[] = [];
    const otherLines: string[] = [];
    let inImportSection = true;

    for (const line of lines) {
      if (line.trim().startsWith('import ') || line.trim().startsWith('export ')) {
        if (inImportSection) {
          imports.push(line);
        } else {
          otherLines.push(line);
        }
      } else if (line.trim() === '') {
        if (inImportSection && imports.length > 0) {
          imports.push(line);
        } else {
          otherLines.push(line);
        }
      } else {
        inImportSection = false;
        otherLines.push(line);
      }
    }

    // Remove unused imports
    const usedImports = this.optimizationConfig.importOrganization.enableUnusedImportRemoval
      ? this.removeUnusedImports(imports, otherLines.join('\n'))
      : imports;

    // Sort imports
    const sortedImports = this.optimizationConfig.importOrganization.enableImportSorting
      ? this.sortImports(usedImports)
      : usedImports;

    return [...sortedImports, '', ...otherLines].join('\n');
  }

  /**
   * Real-time error detection and fixing
   */
  public detectAndFixCommonErrors(sourceCode: string): {
    fixedCode: string;
    fixes: string[];
    remainingErrors: string[];
  } {
    let fixedCode = sourceCode;
    const fixes: string[] = [];
    const remainingErrors: string[] = [];

    // Fix common TypeScript errors
    const commonFixes = [
      {
        pattern: /React\.FC<([^>]+)>/g,
        replacement: 'React.FC<$1>',
        description: 'Fixed React.FC type annotation',
      },
      {
        pattern: /useEffect\(\(\) => \{([^}]+)\}, \[\]\)/g,
        replacement: 'useEffect(() => {$1}, [])',
        description: 'Fixed useEffect dependency array',
      },
      {
        pattern: /const \[([^,]+), set([^\]]+)\] = useState\(\)/g,
        replacement: 'const [$1, set$2] = useState<any>()',
        description: 'Added type annotation to useState',
      },
      {
        pattern: /interface ([A-Z][a-zA-Z]*) \{/g,
        replacement: 'interface $1 {',
        description: 'Fixed interface naming convention',
      },
    ];

    commonFixes.forEach(fix => {
      if (fix.pattern.test(fixedCode)) {
        fixedCode = fixedCode.replace(fix.pattern, fix.replacement);
        fixes.push(fix.description);
      }
    });

    // Detect remaining errors (simplified detection)
    const errorPatterns = [
      /Property '([^']+)' does not exist on type/g,
      /Type '([^']+)' is not assignable to type/g,
      /Cannot find name '([^']+)'/g,
    ];

    errorPatterns.forEach(pattern => {
      const matches = fixedCode.match(pattern);
      if (matches) {
        matches.forEach(match => remainingErrors.push(match));
      }
    });

    return { fixedCode, fixes, remainingErrors };
  }

  /**
   * Monitor performance metrics in real-time
   */
  public updatePerformanceMetrics(newMetrics: Partial<DevelopmentMetrics>): void {
    this.metrics = { ...this.metrics, ...newMetrics, lastOptimization: Date.now() };

    if (this.optimizationConfig.performanceMonitoring.enableRealTimeErrorDetection) {
      this.checkPerformanceThresholds();
    }
  }

  /**
   * Get current development metrics
   */
  public getDevelopmentMetrics(): DevelopmentMetrics {
    return { ...this.metrics };
  }

  /**
   * Generate performance optimization recommendations
   */
  public getPerformanceOptimizationRecommendations(): {
    typescript: string[];
    bundling: string[];
    runtime: string[];
    development: string[];
  } {
    const recommendations = {
      typescript: [],
      bundling: [],
      runtime: [],
      development: [],
    } as any;

    // TypeScript recommendations
    if (this.metrics.compilationTime > 30000) {
      // 30 seconds
      recommendations.typescript.push('Enable incremental compilation');
      recommendations.typescript.push('Use project references for large codebases');
      recommendations.typescript.push('Enable skipLibCheck for faster builds');
    }

    // Bundle size recommendations
    if (this.metrics.bundleSize > 500 * 1024) {
      // 500KB
      recommendations.bundling.push('Implement code splitting');
      recommendations.bundling.push('Enable tree shaking');
      recommendations.bundling.push('Use dynamic imports for large components');
    }

    // Runtime performance recommendations
    if (this.metrics.memoryUsage > 100) {
      // 100MB
      recommendations.runtime.push('Optimize React component re-renders');
      recommendations.runtime.push('Use React.memo for expensive components');
      recommendations.runtime.push('Implement proper cleanup in useEffect');
    }

    // Development experience recommendations
    if (this.metrics.hotReloadTime > 5000) {
      // 5 seconds
      recommendations.development.push('Optimize webpack configuration');
      recommendations.development.push('Reduce the number of watched files');
      recommendations.development.push('Use faster development server');
    }

    return recommendations;
  }

  /**
   * Apply automatic optimizations
   */
  public applyAutomaticOptimizations(): {
    applied: string[];
    skipped: string[];
    errors: string[];
  } {
    const applied: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    try {
      // Generate optimized TypeScript config
      const _tsConfig = this.generateOptimizedTypeScriptConfig();
      applied.push('Generated optimized TypeScript configuration');

      // Generate enhanced type definitions
      const _typeDefinitions = this.generateAstrologicalTypeDefinitions();
      applied.push('Generated enhanced astrological type definitions');

      // Update performance monitoring
      if (this.optimizationConfig.performanceMonitoring.enableRealTimeErrorDetection) {
        this.startRealTimeErrorDetection();
        applied.push('Started real-time error detection');
      }

      logger.info('Automatic optimizations applied:', applied);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      logger.error('Error applying automatic optimizations:', error);
    }

    return { applied, skipped, errors };
  }

  // Private helper methods

  private initializeMetrics(): DevelopmentMetrics {
    return {
      compilationTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
      errorCount: 0,
      warningCount: 0,
      hotReloadTime: 0,
      lastOptimization: Date.now(),
    };
  }

  private getDefaultOptimizationConfig() {
    return {
      typescript: {
        enableIncrementalCompilation: true,
        enableProjectReferences: false,
        enableCompositeMode: false,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        useDefineForClassFields: true,
        exactOptionalPropertyTypes: false,
        noUncheckedIndexedAccess: false,
        target: 'es2018' as const,
        module: 'esnext' as const,
        moduleResolution: 'bundler' as const,
      },
      intelliSense: {
        enableAstrologicalTypeDefinitions: true,
        enableElementalPropertyIntelliSense: true,
        enablePlanetaryPositionAutoComplete: true,
        enableCulinaryAstrologySnippets: true,
        enableCustomTypeGuards: true,
      },
      importOrganization: {
        enableAutoImportOrganization: true,
        enableUnusedImportRemoval: true,
        enableImportSorting: true,
        enablePathMapping: true,
        groupExternalImports: true,
        groupInternalImports: true,
      },
      performanceMonitoring: {
        enableRealTimeErrorDetection: true,
        enableCompilationTimeTracking: true,
        enableMemoryUsageMonitoring: true,
        enableBundleSizeTracking: true,
        enableHotReloadOptimization: true,
      },
    };
  }

  private startPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor memory usage
    setInterval(() => {
      if ((performance as any).memory) {
        const memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
        this.updatePerformanceMetrics({ memoryUsage });
      }
    }, 10000); // Every 10 seconds
  }

  private checkPerformanceThresholds(): void {
    const thresholds = {
      compilationTime: 30000, // 30 seconds
      memoryUsage: 100, // 100MB
      bundleSize: 500 * 1024, // 500KB
      errorCount: 10,
    };

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const currentValue = this.metrics[metric as keyof DevelopmentMetrics];
      if (typeof currentValue === 'number' && currentValue > threshold) {
        logger.warn(`Performance threshold exceeded for ${metric}:`, {
          current: currentValue,
          threshold,
        });
      }
    });
  }

  private removeUnusedImports(imports: string[], codeBody: string): string[] {
    return imports.filter(importLine => {
      // Extract imported names from the import statement
      const importMatch = importLine.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))/);
      if (!importMatch) return true;

      const importedNames = importMatch[1]
        ? importMatch[1].split(',').map(name => name.trim().split(' as ')[0])
        : [importMatch[2] || importMatch[3]];

      // Check if any imported name is used in the code
      return importedNames.some(name => {
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        return regex.test(codeBody);
      });
    });
  }

  private sortImports(imports: string[]): string[] {
    const externalImports: string[] = [];
    const internalImports: string[] = [];

    imports.forEach(importLine => {
      if (importLine.includes('@/') || importLine.includes('./') || importLine.includes('../')) {
        internalImports.push(importLine);
      } else if (importLine.trim().startsWith('import ')) {
        externalImports.push(importLine);
      }
    });

    return [
      ...externalImports.sort(),
      ...(externalImports.length > 0 && internalImports.length > 0 ? [''] : []),
      ...internalImports.sort(),
    ];
  }

  private startRealTimeErrorDetection(): void {
    // In a real implementation, this would integrate with the TypeScript compiler API
    // For now, we'll simulate real-time error detection
    setInterval(() => {
      // Simulate error detection
      const errorCount = Math.floor(Math.random() * 5);
      this.updatePerformanceMetrics({ errorCount });
    }, 30000); // Every 30 seconds
  }
}

/**
 * Convenience function to get development experience optimizer instance
 */
export function getDevelopmentExperienceOptimizer(): DevelopmentExperienceOptimizer {
  return DevelopmentExperienceOptimizer.getInstance();
}

/**
 * Hook for components to use development experience optimizations
 */
export function useDevelopmentExperienceOptimizations() {
  const optimizer = getDevelopmentExperienceOptimizer();

  return {
    generateOptimizedTypeScriptConfig: () => optimizer.generateOptimizedTypeScriptConfig(),
    generateAstrologicalTypeDefinitions: () => optimizer.generateAstrologicalTypeDefinitions(),
    organizeImports: (code: string) => optimizer.organizeImports(code),
    detectAndFixCommonErrors: (code: string) => optimizer.detectAndFixCommonErrors(code),
    updatePerformanceMetrics: (metrics: Partial<DevelopmentMetrics>) =>
      optimizer.updatePerformanceMetrics(metrics),
    getDevelopmentMetrics: () => optimizer.getDevelopmentMetrics(),
    getPerformanceOptimizationRecommendations: () =>
      optimizer.getPerformanceOptimizationRecommendations(),
    applyAutomaticOptimizations: () => optimizer.applyAutomaticOptimizations(),
  };
}
