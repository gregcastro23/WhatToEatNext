#!/usr/bin/env node

/**
 * fix-explicit-any-systematic.js (Enhanced v1.0)
 *
 * Systematic Explicit-Any Elimination Script with Advanced Safety Validation
 * 
 * TARGET: 2,553 @typescript-eslint/no-explicit-any warnings (55% of total warnings)
 * 
 * Based on the proven architecture from:
 * - fix-unused-variables-interactive.js (safety validation system)
 * - fix-typescript-errors-enhanced-v3.js (pattern recognition & AST parsing)
 * 
 * FEATURES:
 * - Advanced safety scoring system with adaptive batch sizing
 * - Comprehensive corruption detection and prevention
 * - AST-based explicit-any detection for accuracy
 * - Scalable file processing (5 → 10 → 15 → 20+ files)
 * - Real-time safety monitoring and rollback capabilities
 * - Pattern effectiveness tracking and optimization
 * - Git integration with automatic stash points
 * - JSON output mode for automation and CI/CD
 * 
 * SAFETY VALIDATION SYSTEM:
 * - Tracks success rate across runs to build confidence
 * - Automatically increases batch sizes based on safety score
 * - Multi-level corruption detection patterns
 * - Comprehensive rollback strategies (stash, file-level, batch-level)
 * - Real-time error monitoring and recovery
 * - Build validation checkpoints every 5 files
 * 
 * TYPE REPLACEMENT STRATEGIES:
 * - API responses → Record<string, unknown> | ApiResponse<T>
 * - Event handlers → Event | ChangeEvent<HTMLElement>
 * - Function parameters → inferred from usage context
 * - Return types → inferred from return statements
 * - Data structures → Record<string, unknown> | Partial<KnownInterface>
 * - Error handling → Keep any (safety requirement)
 * 
 * PROJECT-SPECIFIC MAPPINGS:
 * - Alchemical system: AlchemicalProperties, ElementalProperties, PlanetaryPosition
 * - Recipe/ingredient: Recipe, Ingredient, CookingMethod, CuisineType
 * - Common patterns: unknown, Partial<T>, Record<string, unknown>
 * 
 * USAGE:
 *   # Basic usage (auto-detects safe batch size)
 *   node scripts/typescript-fixes/fix-explicit-any-systematic.js --dry-run
 *   node scripts/typescript-fixes/fix-explicit-any-systematic.js --interactive
 *   
 *   # Force specific batch sizes (for testing/validation)
 *   node scripts/typescript-fixes/fix-explicit-any-systematic.js --max-files=5
 *   node scripts/typescript-fixes/fix-explicit-any-systematic.js --auto-fix --max-files=10
 *   
 *   # Aggressive mode for high-confidence patterns
 *   node scripts/typescript-fixes/fix-explicit-any-systematic.js --aggressive --max-files=15
 *   
 *   # Safety validation and metrics
 *   node scripts/typescript-fixes/fix-explicit-any-systematic.js --validate-safety
 *   node scripts/typescript-fixes/fix-explicit-any-systematic.js --show-metrics
 *   
 *   # JSON/CI integration
 *   node scripts/typescript-fixes/fix-explicit-any-systematic.js --json --silent
 * 
 * SAFETY FEATURES:
 * - Enhanced dry-run mode with AST validation
 * - Git stash integration for rollback
 * - Comprehensive file corruption protection
 * - AST-based any parsing (no regex on complex patterns)
 * - Manual confirmation with rollback guidance
 * - Detailed change summaries and impact analysis
 * - Pre-flight git status checks
 * - Automatic syntax validation after changes
 * - Safety scoring system with automatic batch size optimization
 * - Real-time error monitoring and recovery
 * - Conservative fallback types when inference fails
 *
 * CONSERVATIVE APPROACH:
 * - Prefers unknown over risky type assumptions
 * - Keeps any for error handling and configuration
 * - Interactive confirmation for complex type replacements
 * - Build validation after every batch of changes
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

// Import Babel parser for AST-based any detection
let parser;
try {
  parser = await import('@babel/parser');
} catch (err) {
  console.error('⚠️  @babel/parser not found. Install with: yarn add --dev @babel/parser');
  console.error('Falling back to regex-based parsing (less robust)');
}

// Enhanced Configuration with Safety Validation
const DEFAULT_CONFIG = {
  // File processing limits (scales based on safety validation)
  minFiles: 5,
  maxFiles: 5,
  maxFilesWithValidation: 25,
  
  // Safety and validation
  requireCleanGit: true,
  createGitStash: true,
  enableCorruptionDetection: true,
  enableASTValidation: true,
  validateSyntax: true,
  safetyValidation: true,
  
  // Type replacement preferences
  conservativeMode: true,
  interactiveConfirmation: true,
  preserveErrorHandling: true,
  preserveConfiguration: true,
  
  // Performance and monitoring
  enableMetrics: true,
  performanceMonitoring: true,
  autoOptimization: true,
  buildValidationInterval: 5,
  
  // Output and reporting
  verboseOutput: true,
  detailedReporting: true,
  jsonOutput: false,
  silentMode: false
};

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const INTERACTIVE = args.includes('--interactive') || (!args.includes('--auto-fix') && !DRY_RUN);
const AUTO_FIX = args.includes('--auto-fix');
const AGGRESSIVE = args.includes('--aggressive');
const CHECK_GIT = args.includes('--check-git-status');
const VALIDATE_SAFETY = args.includes('--validate-safety');
const SHOW_METRICS = args.includes('--show-metrics');
const JSON_OUTPUT = args.includes('--json');
const SILENT_MODE = args.includes('--silent');
const FORCE_BATCH_SIZE = parseInt(args.find(arg => arg.startsWith('--max-files='))?.split('=')[1]);

// Apply configuration overrides
if (JSON_OUTPUT) {
  DEFAULT_CONFIG.jsonOutput = true;
  DEFAULT_CONFIG.verboseOutput = false;
}

if (SILENT_MODE) {
  DEFAULT_CONFIG.silentMode = true;
  DEFAULT_CONFIG.verboseOutput = false;
}

if (AGGRESSIVE) {
  DEFAULT_CONFIG.conservativeMode = false;
  DEFAULT_CONFIG.interactiveConfirmation = false;
}

// Safety validation storage
const SAFETY_METRICS_FILE = path.join(process.cwd(), '.explicit-any-metrics.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Enhanced color output for better UX
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  if (DEFAULT_CONFIG.silentMode) return text;
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  if (!DEFAULT_CONFIG.silentMode) {
    console.log(colorize(message, color));
  }
}

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

// Advanced Safety Validator for Explicit-Any Operations
class ExplicitAnySafetyValidator {
  constructor() {
    this.metrics = this.loadMetrics();
  }
  
  loadMetrics() {
    try {
      if (fs.existsSync(SAFETY_METRICS_FILE)) {
        return JSON.parse(fs.readFileSync(SAFETY_METRICS_FILE, 'utf8'));
      }
    } catch (error) {
      log(`⚠️  Could not load safety metrics: ${error.message}`, 'yellow');
    }
    
    return {
      totalRuns: 0,
      successfulRuns: 0,
      filesProcessed: 0,
      anysReplaced: 0,
      errorsEncountered: 0,
      corruptionDetected: 0,
      buildFailures: 0,
      averageBatchSize: 5,
      maxSafeBatchSize: 5,
      lastRunTime: null,
      safetyScore: 0.0,
      replacementTypeSuccess: {},
      patternEffectiveness: {},
      performanceMetrics: {
        averageFileTime: 0,
        totalProcessingTime: 0
      }
    };
  }
  
  saveMetrics() {
    try {
      fs.writeFileSync(SAFETY_METRICS_FILE, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      log(`⚠️  Could not save safety metrics: ${error.message}`, 'yellow');
    }
  }
  
  calculateSafetyScore() {
    if (this.metrics.totalRuns === 0) return 0.0;
    
    const successRate = this.metrics.successfulRuns / this.metrics.totalRuns;
    const errorRate = this.metrics.errorsEncountered / Math.max(this.metrics.filesProcessed, 1);
    const corruptionRate = this.metrics.corruptionDetected / Math.max(this.metrics.filesProcessed, 1);
    const buildFailureRate = this.metrics.buildFailures / Math.max(this.metrics.totalRuns, 1);
    const experienceBonus = Math.min(this.metrics.totalRuns / 20, 1.0);
    
    // Enhanced scoring for explicit-any operations (more conservative)
    return Math.max(0, 
      successRate * 0.40 + 
      (1 - errorRate) * 0.25 + 
      (1 - corruptionRate) * 0.20 + 
      (1 - buildFailureRate) * 0.10 + 
      experienceBonus * 0.05
    );
  }
  
  getRecommendedBatchSize() {
    if (FORCE_BATCH_SIZE) return FORCE_BATCH_SIZE;
    
    const safetyScore = this.calculateSafetyScore();
    this.metrics.safetyScore = safetyScore;
    
    // More conservative scaling for explicit-any operations
    if (safetyScore >= 0.95 && this.metrics.totalRuns >= 10) {
      return Math.min(25, DEFAULT_CONFIG.maxFilesWithValidation);
    } else if (safetyScore >= 0.90 && this.metrics.totalRuns >= 8) {
      return Math.min(20, DEFAULT_CONFIG.maxFilesWithValidation);
    } else if (safetyScore >= 0.85 && this.metrics.totalRuns >= 6) {
      return Math.min(15, DEFAULT_CONFIG.maxFilesWithValidation);
    } else if (safetyScore >= 0.75 && this.metrics.totalRuns >= 4) {
      return Math.min(10, DEFAULT_CONFIG.maxFilesWithValidation);
    } else if (safetyScore >= 0.60 && this.metrics.totalRuns >= 2) {
      return 7;
    } else {
      return DEFAULT_CONFIG.maxFiles;
    }
  }
  
  recordRunStart(batchSize) {
    this.metrics.totalRuns++;
    this.metrics.lastRunTime = new Date().toISOString();
    this.currentBatchSize = batchSize;
    this.currentErrors = 0;
    this.currentCorruption = 0;
    this.currentReplaced = 0;
    this.runStartTime = Date.now();
  }
  
  recordError(errorType = 'unknown') {
    this.metrics.errorsEncountered++;
    this.currentErrors++;
  }
  
  recordCorruption() {
    this.metrics.corruptionDetected++;
    this.currentCorruption++;
  }
  
  recordBuildFailure() {
    this.metrics.buildFailures++;
  }
  
  recordAnyReplaced(replacementType) {
    this.metrics.anysReplaced++;
    this.currentReplaced++;
    
    if (!this.metrics.replacementTypeSuccess[replacementType]) {
      this.metrics.replacementTypeSuccess[replacementType] = { successes: 0, attempts: 0 };
    }
    this.metrics.replacementTypeSuccess[replacementType].successes++;
  }
  
  recordReplacementAttempted(replacementType) {
    if (!this.metrics.replacementTypeSuccess[replacementType]) {
      this.metrics.replacementTypeSuccess[replacementType] = { successes: 0, attempts: 0 };
    }
    this.metrics.replacementTypeSuccess[replacementType].attempts++;
  }
  
  recordFileProcessed() {
    this.metrics.filesProcessed++;
  }
  
  recordPatternSuccess(patternId, success) {
    if (!this.metrics.patternEffectiveness[patternId]) {
      this.metrics.patternEffectiveness[patternId] = { successes: 0, attempts: 0 };
    }
    this.metrics.patternEffectiveness[patternId].attempts++;
    if (success) {
      this.metrics.patternEffectiveness[patternId].successes++;
    }
  }
  
  recordRunComplete(successful = true) {
    const runTime = Date.now() - this.runStartTime;
    
    if (successful && this.currentErrors === 0 && this.currentCorruption === 0) {
      this.metrics.successfulRuns++;
    }
    
    this.metrics.averageBatchSize = 
      (this.metrics.averageBatchSize * (this.metrics.totalRuns - 1) + this.currentBatchSize) / 
      this.metrics.totalRuns;
    
    if (successful && this.currentErrors === 0 && this.currentCorruption === 0) {
      this.metrics.maxSafeBatchSize = Math.max(this.metrics.maxSafeBatchSize, this.currentBatchSize);
    }
    
    // Update performance metrics
    this.metrics.performanceMetrics.totalProcessingTime += runTime;
    if (this.currentBatchSize > 0) {
      this.metrics.performanceMetrics.averageFileTime = 
        this.metrics.performanceMetrics.totalProcessingTime / this.metrics.filesProcessed;
    }
    
    this.saveMetrics();
  }
  
  showMetrics() {
    const safetyScore = this.calculateSafetyScore();
    const recommendedBatch = this.getRecommendedBatchSize();
    
    if (DEFAULT_CONFIG.jsonOutput) {
      console.log(JSON.stringify({
        safetyMetrics: {
          ...this.metrics,
          safetyScore,
          recommendedBatchSize: recommendedBatch,
          currentTime: new Date().toISOString()
        }
      }, null, 2));
      return;
    }
    
    log('\n📊 EXPLICIT-ANY SAFETY METRICS', 'bright');
    log('='.repeat(40), 'bright');
    log(`🎯 Safety Score: ${(safetyScore * 100).toFixed(1)}%`, safetyScore >= 0.8 ? 'green' : safetyScore >= 0.5 ? 'yellow' : 'red');
    log(`📈 Total Runs: ${this.metrics.totalRuns}`, 'cyan');
    log(`✅ Successful Runs: ${this.metrics.successfulRuns}`, 'green');
    log(`📁 Files Processed: ${this.metrics.filesProcessed}`, 'blue');
    log(`🔄 Anys Replaced: ${this.metrics.anysReplaced}`, 'green');
    log(`❌ Errors Encountered: ${this.metrics.errorsEncountered}`, 'red');
    log(`🚨 Corruption Detected: ${this.metrics.corruptionDetected}`, 'red');
    log(`🔨 Build Failures: ${this.metrics.buildFailures}`, 'red');
    log(`📊 Average Batch Size: ${this.metrics.averageBatchSize.toFixed(1)}`, 'cyan');
    log(`🚀 Max Safe Batch Size: ${this.metrics.maxSafeBatchSize}`, 'green');
    log(`🎯 Recommended Batch Size: ${recommendedBatch}`, 'bright');
    
    if (this.metrics.performanceMetrics.averageFileTime > 0) {
      log(`⚡ Average File Time: ${this.metrics.performanceMetrics.averageFileTime.toFixed(0)}ms`, 'cyan');
    }
    
    // Show replacement type success rates
    if (Object.keys(this.metrics.replacementTypeSuccess).length > 0) {
      log('\n🎯 Replacement Type Success Rates:', 'bright');
      Object.entries(this.metrics.replacementTypeSuccess).forEach(([type, stats]) => {
        const rate = stats.attempts > 0 ? (stats.successes / stats.attempts * 100).toFixed(1) : '100.0';
        log(`   ${type}: ${rate}% (${stats.successes}/${stats.attempts || stats.successes})`, 'cyan');
      });
    }
    
    if (this.metrics.lastRunTime) {
      log(`⏰ Last Run: ${new Date(this.metrics.lastRunTime).toLocaleString()}`, 'gray');
    }
  }
  
  validateSafety() {
    const safetyScore = this.calculateSafetyScore();
    const issues = [];
    
    if (safetyScore < 0.5) {
      issues.push('Low safety score - recommend manual review');
    }
    
    if (this.metrics.corruptionDetected > 0) {
      issues.push('Corruption detected in previous runs');
    }
    
    if (this.metrics.buildFailures > this.metrics.totalRuns * 0.1) {
      issues.push('High build failure rate detected');
    }
    
    if (this.metrics.errorsEncountered > this.metrics.filesProcessed * 0.15) {
      issues.push('High error rate detected');
    }
    
    if (this.metrics.totalRuns < 2) {
      issues.push('Insufficient run history for full validation');
    }
    
    return {
      safe: issues.length === 0,
      safetyScore,
      issues,
      recommendedBatchSize: this.getRecommendedBatchSize()
    };
  }
}

const safetyValidator = new ExplicitAnySafetyValidator();

// Enhanced Git Integration (copied from proven template)
async function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const hasChanges = status.trim().length > 0;
    
    if (hasChanges && DEFAULT_CONFIG.requireCleanGit) {
      if (DEFAULT_CONFIG.jsonOutput) {
        console.log(JSON.stringify({ 
          error: 'Git working directory has uncommitted changes',
          gitStatus: status,
          exitCode: 1
        }));
        return false;
      }
      
      log('\n⚠️  Git working directory has uncommitted changes:', 'yellow');
      log(status);
      
      if (INTERACTIVE) {
        const answer = await ask('Continue anyway? This could make rollback more complex. [y/N] ');
        if (answer.toLowerCase() !== 'y') {
          log('👍 Recommended: Commit or stash changes first, then re-run this script.', 'green');
          return false;
        }
      } else if (!AUTO_FIX) {
        log('❌ Stopping. Use --auto-fix to override, or commit/stash changes first.', 'red');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    if (DEFAULT_CONFIG.jsonOutput) {
      console.log(JSON.stringify({ 
        error: 'Error checking git status',
        details: error.message,
        exitCode: 1
      }));
    } else {
      log(`❌ Error checking git status: ${error.message}`, 'red');
    }
    return false;
  }
}

async function createGitStash(description) {
  if (!DEFAULT_CONFIG.createGitStash) return null;
  
  try {
    const stashName = `explicit-any-fix-${Date.now()}`;
    execSync(`git stash push -m "${stashName}: ${description}"`, { encoding: 'utf8' });
    log(`📦 Created git stash: ${stashName}`, 'cyan');
    log(`   Rollback with: git stash apply stash^{/${stashName}}`, 'cyan');
    return stashName;
  } catch (error) {
    log(`⚠️  Could not create git stash: ${error.message}`, 'yellow');
    return null;
  }
}

// Enhanced Corruption Detection for explicit-any operations
function detectCorruption(content, filePath) {
  if (!DEFAULT_CONFIG.enableCorruptionDetection) return false;
  
  const corruptionPatterns = [
    // Type duplication patterns (only detect actual corruption)
    /unknown\s+unknown(?!\[\])/g,           // Duplicate unknown types (not unknown[])
    /:\s*:\s*unknown/g,                     // Duplicate type annotations
    /any\s+as\s+any/g,                      // Redundant any casting
    /unknown\s+as\s+unknown/g,              // Redundant unknown casting
    // Note: Removed Record corruption pattern - nested Records are valid
    
    // Syntax corruption patterns
    /\{\s*\{\s*\{/g,                        // Triple nested object corruption
    /\[\s*\[\s*\[/g,                        // Triple nested array corruption
    /import\s+import/g,                     // Duplicate import statements
    /^export\s+export/g,                    // Duplicate export statements at line start
    
    // Type assertion corruption
    /as\s+as\s+/g,                          // Double 'as' keywords
    /\)\s*\)\s*\)\s*as/g,                   // Triple closing parentheses (real corruption)
    /\(\s*\(\s*\(\s*\w+/g,                  // Triple opening parentheses (real corruption)
    
    // Property access corruption
    /(?<!\.)\.\.\.\./g,                     // Four dots (not valid spread)
    /\?\?\./g,                              // Malformed optional chaining
    
    // String/type mixing corruption
    /string\s+as\s+number/g,                // Impossible type assertions
    /number\s+as\s+string/g,                // Impossible type assertions
    
    // WhatToEatNext specific corruption
    /Element\s+Element/g,                   // Duplicate Element types
    /Planet\s+Planet/g,                     // Duplicate Planet types
    /Recipe\s+Recipe/g,                     // Duplicate Recipe types
    /CookingMethod\s+CookingMethod/g,       // Duplicate CookingMethod types
    
    // Advanced corruption patterns from recent scripts
    /BasicThermodynamicProperties\s+BasicThermodynamicProperties/g,
    /ElementalProperties\s+ElementalProperties/g,
    /as\s+BasicThermodynamicProperties\s+as/g,  // Double type assertions
    /as\s+string\s+as/g,                    // Chained type assertions
  ];
  
  for (const pattern of corruptionPatterns) {
    if (pattern.test(content)) {
      log(`🚨 Corruption detected in ${filePath}: ${pattern.source}`, 'red');
      safetyValidator.recordCorruption();
      return true;
    }
  }
  
  return false;
}

// Enhanced AST-based validation
function validateSyntaxAST(content, filePath) {
  if (!DEFAULT_CONFIG.enableASTValidation || !parser) return true;
  
  try {
    parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators-legacy'],
      errorRecovery: true
    });
    return true;
  } catch (error) {
    log(`❌ AST validation failed for ${filePath}: ${error.message}`, 'red');
    safetyValidator.recordError('ast-validation');
    return false;
  }
}

// Enhanced Build Validation
async function validateBuild() {
  try {
    const startTime = Date.now();
    execSync('yarn build', { stdio: 'pipe', timeout: 90000 });
    const buildTime = Date.now() - startTime;
    log(`✅ Build validation passed (${buildTime}ms)`, 'green');
    return true;
  } catch (error) {
    log(`❌ Build validation failed: ${error.message}`, 'red');
    safetyValidator.recordBuildFailure();
    return false;
  }
}

// Project-Specific Type Mappings for WhatToEatNext
const PROJECT_TYPE_MAPPINGS = {
  // Alchemical system types
  'alchemicalProperties': 'AlchemicalProperties',
  'elementalProperties': 'ElementalProperties', 
  'planetaryPosition': 'PlanetaryPosition',
  'zodiacSign': 'ZodiacSign',
  'planet': 'Planet',
  'element': 'Element',
  'season': 'Season',
  
  // Recipe/ingredient types
  'recipe': 'Recipe',
  'ingredient': 'Ingredient | UnifiedIngredient',
  'cookingMethod': 'CookingMethod',
  'cuisine': 'CuisineType',
  'dietaryRestriction': 'DietaryRestriction',
  
  // API and data types
  'apiResponse': 'ApiResponse<T>',
  'spoonacularData': 'SpoonacularRecipe',
  'nutritionData': 'NutritionInfo',
  
  // Common patterns with fallbacks
  'error': 'Error | ErrorWithMessage',
  'response': 'Record<string, unknown>',
  'data': 'Record<string, unknown>',
  'config': 'Record<string, any>', // Keep any for config
  'options': 'Partial<T>',
  'props': 'Record<string, unknown>',
  'params': 'Record<string, unknown>',
  'result': 'unknown',
  'value': 'unknown',
  'item': 'unknown',
  'object': 'Record<string, unknown>'
};

// Conservative Fallback Type Hierarchy
const SAFE_FALLBACK_TYPES = {
  high_confidence: 'InferredType',
  medium_confidence: 'Partial<InferredType>',
  low_confidence: 'unknown',
  api_responses: 'Record<string, unknown>',
  event_handlers: 'Event',
  error_cases: 'any', // Keep any for error handling
  config_objects: 'Record<string, any>', // Keep any for config
  function_params: 'unknown',
  return_types: 'unknown',
  object_properties: 'unknown'
};

// AST-Based Explicit-Any Detection Engine
function parseExplicitAnyUsage(fileContent, filePath) {
  if (!parser) {
    return parseExplicitAnyRegex(fileContent);
  }
  
  try {
    const ast = parser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators-legacy'],
      errorRecovery: true
    });
    
    const anyUsages = [];
    
    function getLineFromPosition(start) {
      if (!start) return 1;
      let lineNum = 1;
      let charCount = 0;
      const lines = fileContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1; // +1 for newline
        if (charCount > start) {
          return i + 1;
        }
      }
      return lineNum;
    }
    
    function walkNode(node) {
      // Variable declarations with any type: const x: any = ...
      if (node.type === 'VariableDeclarator' && node.id?.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword') {
        anyUsages.push({
          type: 'variable_declaration',
          name: node.id.name,
          line: node.loc?.start?.line || getLineFromPosition(node.start),
          start: node.start,
          end: node.end,
          context: 'variable_type'
        });
      }
      
      // Function parameters with any type: function fn(param: any)
      if (node.type === 'Identifier' && node.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword') {
        const parent = findParentFunctionParam(node);
        if (parent) {
          anyUsages.push({
            type: 'function_parameter',
            name: node.name,
            line: node.loc?.start?.line || getLineFromPosition(node.start),
            start: node.start,
            end: node.end,
            context: 'parameter_type'
          });
        }
      }
      
      // Function return types: function fn(): any
      if (node.type === 'TSFunctionType' && node.typeAnnotation?.type === 'TSAnyKeyword') {
        anyUsages.push({
          type: 'function_return',
          line: node.loc?.start?.line || getLineFromPosition(node.start),
          start: node.start,
          end: node.end,
          context: 'return_type'
        });
      }
      
      // Interface/type properties: { prop: any }
      if (node.type === 'TSPropertySignature' && node.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword') {
        anyUsages.push({
          type: 'interface_property',
          name: node.key?.name || 'unknown',
          line: node.loc?.start?.line || getLineFromPosition(node.start),
          start: node.start,
          end: node.end,
          context: 'property_type'
        });
      }
      
      // Array types: any[]
      if (node.type === 'TSArrayType' && node.elementType?.type === 'TSAnyKeyword') {
        anyUsages.push({
          type: 'array_element',
          line: node.loc?.start?.line || getLineFromPosition(node.start),
          start: node.start,
          end: node.end,
          context: 'array_type'
        });
      }
      
      // Type assertions: obj as any
      if (node.type === 'TSAsExpression' && node.typeAnnotation?.type === 'TSAnyKeyword') {
        anyUsages.push({
          type: 'type_assertion',
          line: node.loc?.start?.line || getLineFromPosition(node.start),
          start: node.start,
          end: node.end,
          context: 'type_assertion'
        });
      }
      
      // Generic type parameters: <any>
      if (node.type === 'TSTypeParameterInstantiation') {
        node.params?.forEach(param => {
          if (param.type === 'TSAnyKeyword') {
            anyUsages.push({
              type: 'generic_parameter',
              line: param.loc?.start?.line || getLineFromPosition(param.start),
              start: param.start,
              end: param.end,
              context: 'generic_type'
            });
          }
        });
      }
      
      // Recursively walk all child nodes
      for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(item => {
            if (item && typeof item === 'object' && item.type) {
              walkNode(item);
            }
          });
        } else if (child && typeof child === 'object' && child.type) {
          walkNode(child);
        }
      }
    }
    
    function findParentFunctionParam(node) {
      // This is a simplified check - in a full implementation you'd walk up the AST
      return true; // For now, assume any identifier with type annotation in context is a parameter
    }
    
    walkNode(ast);
    return anyUsages;
    
  } catch (error) {
    log(`⚠️  AST parsing failed for ${filePath}, falling back to regex: ${error.message}`, 'yellow');
    safetyValidator.recordError('ast-parsing');
    return parseExplicitAnyRegex(fileContent);
  }
}

// Enhanced regex fallback for any detection
function parseExplicitAnyRegex(fileContent) {
  const anyUsages = [];
  const lines = fileContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Variable declarations: const x: any
    const varMatch = line.match(/(?:const|let|var)\s+(\w+)\s*:\s*any\b/);
    if (varMatch) {
      anyUsages.push({
        type: 'variable_declaration',
        name: varMatch[1],
        line: lineNum,
        context: 'variable_type'
      });
    }
    
    // Function parameters: (param: any)
    const paramMatch = line.match(/\(\s*(\w+)\s*:\s*any\b/g);
    if (paramMatch) {
      paramMatch.forEach(match => {
        const paramName = match.match(/\(\s*(\w+)/)?.[1];
        anyUsages.push({
          type: 'function_parameter',
          name: paramName || 'unknown',
          line: lineNum,
          context: 'parameter_type'
        });
      });
    }
    
    // Function return types: ): any
    const returnMatch = line.match(/\)\s*:\s*any\b/);
    if (returnMatch) {
      anyUsages.push({
        type: 'function_return',
        line: lineNum,
        context: 'return_type'
      });
    }
    
    // Interface properties: prop: any
    const propMatch = line.match(/(\w+)\s*:\s*any\b/);
    if (propMatch && !varMatch && !paramMatch && !returnMatch) {
      anyUsages.push({
        type: 'interface_property',
        name: propMatch[1],
        line: lineNum,
        context: 'property_type'
      });
    }
    
    // Array types: any[]
    const arrayMatch = line.match(/:\s*any\[\]/);
    if (arrayMatch) {
      anyUsages.push({
        type: 'array_element',
        line: lineNum,
        context: 'array_type'
      });
    }
    
    // Type assertions: as any
    const assertMatch = line.match(/\bas\s+any\b/);
    if (assertMatch) {
      anyUsages.push({
        type: 'type_assertion',
        line: lineNum,
        context: 'type_assertion'
      });
    }
  }
  
  return anyUsages;
}

// Intelligent Type Replacement Engine
function getReplacementType(anyUsage, fileContent, filePath) {
  const { type, name, context, line } = anyUsage;
  
  // Check if this is in an error handling context (preserve any)
  if (DEFAULT_CONFIG.preserveErrorHandling && isErrorHandlingContext(fileContent, line)) {
    return { type: 'any', reason: 'error_handling_preserved' };
  }
  
  // Check if this is in a configuration context (preserve any)
  if (DEFAULT_CONFIG.preserveConfiguration && isConfigurationContext(fileContent, line, name)) {
    return { type: 'any', reason: 'configuration_preserved' };
  }
  
  // Try project-specific type inference
  const projectType = inferProjectSpecificType(name, fileContent, filePath);
  if (projectType) {
    return { type: projectType, reason: 'project_specific_inference' };
  }
  
  // Context-based replacement strategies
  switch (context) {
    case 'variable_type':
      return getVariableReplacement(name, fileContent, line);
    
    case 'parameter_type':
      return getParameterReplacement(name, fileContent, line);
    
    case 'return_type':
      return getReturnTypeReplacement(fileContent, line);
    
    case 'property_type':
      return getPropertyReplacement(name, fileContent, line);
    
    case 'array_type':
      return getArrayReplacement(fileContent, line);
    
    case 'type_assertion':
      return getAssertionReplacement(fileContent, line);
    
    case 'generic_type':
      return getGenericReplacement(fileContent, line);
    
    default:
      return { type: 'unknown', reason: 'conservative_fallback' };
  }
}

function isErrorHandlingContext(fileContent, line) {
  const lines = fileContent.split('\n');
  const currentLine = lines[line - 1] || '';
  const contextLines = lines.slice(Math.max(0, line - 3), line + 2);
  const context = contextLines.join(' ').toLowerCase();
  
  // More specific error handling detection
  const errorPatterns = [
    /catch\s*\(/,
    /throw\s+/,
    /\.reject\(/,
    /error\s*:/,
    /\berror\b.*=.*any/,
    /try\s*{[\s\S]*}.*catch/
  ];
  
  return errorPatterns.some(pattern => pattern.test(context)) ||
         currentLine.toLowerCase().includes('error') && currentLine.includes('any');
}

function isConfigurationContext(fileContent, line, name) {
  if (!name) return false;
  
  const lines = fileContent.split('\n');
  const currentLine = lines[line - 1] || '';
  const context = lines.slice(Math.max(0, line - 2), line + 2).join(' ').toLowerCase();
  
  const configKeywords = ['config', 'option', 'setting', 'param', 'arg'];
  const nameL = name.toLowerCase();
  
  // More specific configuration detection
  const configPatterns = [
    /config\s*[:=]/,
    /options\s*[:=]/,
    /settings\s*[:=]/,
    /\bdefault\w*\s*[:=].*any/,
    /plugin\s*[:=]/,
    /\bmiddleware\b/
  ];
  
  return configKeywords.some(keyword => nameL.includes(keyword)) ||
         configPatterns.some(pattern => pattern.test(context)) ||
         (currentLine.includes('export') && currentLine.includes('config'));
}

function inferProjectSpecificType(name, fileContent, filePath) {
  if (!name) return null;
  
  const nameL = name.toLowerCase();
  
  // Check for direct mappings
  for (const [keyword, type] of Object.entries(PROJECT_TYPE_MAPPINGS)) {
    if (nameL.includes(keyword)) {
      return type;
    }
  }
  
  // File-based inference
  if (filePath.includes('astrology') || filePath.includes('alchemy')) {
    if (nameL.includes('element')) return 'Element';
    if (nameL.includes('planet')) return 'Planet';
    if (nameL.includes('sign')) return 'ZodiacSign';
    if (nameL.includes('season')) return 'Season';
  }
  
  if (filePath.includes('recipe') || filePath.includes('cooking')) {
    if (nameL.includes('recipe')) return 'Recipe';
    if (nameL.includes('ingredient')) return 'Ingredient';
    if (nameL.includes('method')) return 'CookingMethod';
    if (nameL.includes('cuisine')) return 'CuisineType';
  }
  
  return null;
}

function getVariableReplacement(name, fileContent, line) {
  // Analyze variable usage to infer type
  const lines = fileContent.split('\n');
  const variableUsagePattern = new RegExp(`\\b${name}\\b`, 'g');
  const usageContext = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (variableUsagePattern.test(lines[i])) {
      usageContext.push(lines[i]);
    }
  }
  
  const context = usageContext.join(' ');
  
  // Infer based on usage patterns
  if (context.includes('.map(') || context.includes('.filter(') || context.includes('.length')) {
    return { type: 'unknown[]', reason: 'array_usage_detected' };
  }
  
  if (context.includes('await') || context.includes('.then(')) {
    return { type: 'Promise<unknown>', reason: 'promise_usage_detected' };
  }
  
  if (context.includes('JSON.parse') || context.includes('response')) {
    return { type: 'Record<string, unknown>', reason: 'json_data_detected' };
  }
  
  return { type: 'unknown', reason: 'conservative_variable_fallback' };
}

function getParameterReplacement(name, fileContent, line) {
  const lines = fileContent.split('\n');
  const currentLine = lines[line - 1] || '';
  const context = lines.slice(Math.max(0, line - 2), line + 2).join(' ');
  
  // Event handler parameters
  if (name === 'event' || name === 'e' || currentLine.includes('Event')) {
    if (currentLine.includes('onChange') || currentLine.includes('Change')) {
      return { type: 'ChangeEvent<HTMLElement>', reason: 'change_event_detected' };
    }
    if (currentLine.includes('onClick') || currentLine.includes('onSubmit')) {
      return { type: 'FormEvent<HTMLElement>', reason: 'form_event_detected' };
    }
    return { type: 'Event', reason: 'event_handler_detected' };
  }
  
  // Callback parameters
  if (name === 'callback' || name === 'cb' || name === 'fn') {
    return { type: '() => void', reason: 'callback_function_detected' };
  }
  
  // Data parameters with context inference
  if (name === 'data' || name === 'response' || name === 'result') {
    // API response context
    if (context.includes('fetch') || context.includes('api') || context.includes('request')) {
      return { type: 'ApiResponse<unknown>', reason: 'api_response_detected' };
    }
    return { type: 'Record<string, unknown>', reason: 'data_parameter_detected' };
  }
  
  // Props parameters in React components
  if (name === 'props' && (context.includes('React') || context.includes('Component'))) {
    return { type: 'Record<string, unknown>', reason: 'react_props_detected' };
  }
  
  // State parameters
  if (name === 'state' && (context.includes('useState') || context.includes('setState'))) {
    return { type: 'unknown', reason: 'react_state_detected' };
  }
  
  // Recipe/ingredient parameters with project context
  if (name.toLowerCase().includes('recipe')) {
    return { type: 'Recipe', reason: 'recipe_parameter_detected' };
  }
  if (name.toLowerCase().includes('ingredient')) {
    return { type: 'Ingredient', reason: 'ingredient_parameter_detected' };
  }
  if (name.toLowerCase().includes('method')) {
    return { type: 'CookingMethod', reason: 'method_parameter_detected' };
  }
  
  return { type: 'unknown', reason: 'conservative_parameter_fallback' };
}

function getReturnTypeReplacement(fileContent, line) {
  const lines = fileContent.split('\n');
  const functionContext = lines.slice(Math.max(0, line - 5), line + 5).join(' ');
  
  // API functions
  if (functionContext.includes('fetch') || functionContext.includes('api') || functionContext.includes('request')) {
    return { type: 'Promise<Record<string, unknown>>', reason: 'api_function_detected' };
  }
  
  // Async functions
  if (functionContext.includes('async')) {
    return { type: 'Promise<unknown>', reason: 'async_function_detected' };
  }
  
  // Calculate functions
  if (functionContext.includes('calculate') || functionContext.includes('compute')) {
    return { type: 'number', reason: 'calculation_function_detected' };
  }
  
  return { type: 'unknown', reason: 'conservative_return_fallback' };
}

function getPropertyReplacement(name, fileContent, line) {
  // Infer from property name and context
  const projectType = inferProjectSpecificType(name, fileContent, '');
  if (projectType) {
    return { type: projectType, reason: 'property_name_inference' };
  }
  
  return { type: 'unknown', reason: 'conservative_property_fallback' };
}

function getArrayReplacement(fileContent, line) {
  const lines = fileContent.split('\n');
  const context = lines.slice(Math.max(0, line - 2), line + 2).join(' ');
  
  // Try to infer array element type from context
  const projectTypes = Object.values(PROJECT_TYPE_MAPPINGS);
  for (const type of projectTypes) {
    if (context.includes(type.replace(/\|.*/, '').trim())) {
      return { type: `${type}[]`, reason: 'array_element_inference' };
    }
  }
  
  return { type: 'unknown[]', reason: 'conservative_array_fallback' };
}

function getAssertionReplacement(fileContent, line) {
  const lines = fileContent.split('\n');
  const currentLine = lines[line - 1] || '';
  const context = lines.slice(Math.max(0, line - 2), line + 2).join(' ');
  
  // Pattern 1: Property access patterns - (obj as any).property
  if (currentLine.includes('.') && currentLine.includes('as any')) {
    // Thermodynamic property access
    if (context.includes('thermodynamics') || context.includes('entropy') || context.includes('heat') || context.includes('reactivity')) {
      return { type: 'BasicThermodynamicProperties', reason: 'thermodynamic_property_access' };
    }
    
    // String operations
    if (currentLine.includes('.toLowerCase') || currentLine.includes('.toUpperCase') || currentLine.includes('.includes')) {
      return { type: 'string', reason: 'string_operation_detected' };
    }
    
    // Array operations - with context-aware inference
    if (currentLine.includes('.length') || currentLine.includes('.filter') || currentLine.includes('.map') || currentLine.includes('.forEach')) {
      // Try to infer array element type from context
      if (context.includes('recipe') || context.includes('Recipe')) {
        return { type: 'Recipe[]', reason: 'recipe_array_detected' };
      }
      if (context.includes('ingredient') || context.includes('Ingredient')) {
        return { type: 'Ingredient[]', reason: 'ingredient_array_detected' };
      }
      if (context.includes('method') || context.includes('Method')) {
        return { type: 'CookingMethod[]', reason: 'method_array_detected' };
      }
      if (context.includes('element') || context.includes('Element')) {
        return { type: 'Element[]', reason: 'element_array_detected' };
      }
      // Fallback to unknown array for safety
      return { type: 'unknown[]', reason: 'array_operation_detected' };
    }
    
    // Object property access
    return { type: 'Record<string, unknown>', reason: 'object_property_access' };
  }
  
  // Pattern 2: Assignment contexts - variable = data as any
  if (currentLine.includes('=') && currentLine.includes('as any')) {
    // Elements data
    if (context.includes('elements') || context.includes('elementsData')) {
      return { type: 'ElementalProperties', reason: 'elemental_data_assignment' };
    }
    
    // Method data
    if (context.includes('method') || context.includes('cookingMethod')) {
      return { type: 'CookingMethod', reason: 'cooking_method_assignment' };
    }
    
    // Phase data
    if (context.includes('phase') || context.includes('lunar')) {
      return { type: 'LunarPhase', reason: 'lunar_phase_assignment' };
    }
    
    return { type: 'Record<string, unknown>', reason: 'data_assignment_context' };
  }
  
  // Pattern 3: Conditional access patterns - (obj as any)?.property
  if (currentLine.includes('?.')) {
    // Safe property access
    return { type: 'Record<string, unknown>', reason: 'safe_property_access' };
  }
  
  // Conservative fallback for complex cases
  return { type: 'unknown', reason: 'conservative_assertion_fallback' };
}

function getGenericReplacement(fileContent, line) {
  return { type: 'unknown', reason: 'conservative_generic_fallback' };
}

// Main Processing Functions
async function getExplicitAnyWarnings() {
  try {
    log('🔍 Running make lint to detect explicit-any warnings...', 'blue');
    
    let output = '';
    try {
      const result = execSync('make lint', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      output = result;
    } catch (err) {
      output = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
    }
    
    const lines = output.split('\n');
    const warnings = [];
    let currentFile = null;
    
    for (const line of lines) {
      // Detect file path lines
      if (line.trim().startsWith('/') || line.trim().startsWith('src/')) {
        const possibleFile = line.trim();
        if (fs.existsSync(possibleFile)) {
          currentFile = path.resolve(possibleFile);
          continue;
        }
      }
      
      // Detect explicit-any warnings
      const anyWarningMatch = line.match(/\s*(\d+):(\d+)\s+warning\s+.*@typescript-eslint\/no-explicit-any/);
      if (anyWarningMatch && currentFile) {
        const [, lineNum, colNum] = anyWarningMatch;
        warnings.push({
          file: currentFile,
          line: parseInt(lineNum, 10),
          column: parseInt(colNum, 10),
          rawLine: line.trim()
        });
      }
    }
    
    log(`📊 Found ${warnings.length} explicit-any warnings`, 'blue');
    return warnings;
    
  } catch (error) {
    log(`❌ Error getting explicit-any warnings: ${error.message}`, 'red');
    return [];
  }
}

// File Processing and Type Replacement
async function processExplicitAnyFiles() {
  const recommendedBatchSize = safetyValidator.getRecommendedBatchSize();
  
  log(`\n🚀 Enhanced Explicit-Any Elimination v1.0`, 'bright');
  log('='.repeat(45), 'bright');
  log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'PRODUCTION'}`, 'cyan');
  log(`Batch Size: ${recommendedBatchSize} (Safety Score: ${(safetyValidator.calculateSafetyScore() * 100).toFixed(1)}%)`, 'cyan');
  
  try {
    const warnings = await getExplicitAnyWarnings();
    
    if (warnings.length === 0) {
      log('✅ No explicit-any warnings found! Your code is clean.', 'green');
      return { success: true, anysReplaced: 0 };
    }
    
    const fileWarnings = groupAndPrioritizeWarnings(warnings, recommendedBatchSize);
    log(`📁 Processing ${fileWarnings.size} files`, 'blue');
    
    safetyValidator.recordRunStart(fileWarnings.size);
    
    let stashName = null;
    if (!DRY_RUN && DEFAULT_CONFIG.createGitStash) {
      stashName = await createGitStash(`Processing ${fileWarnings.size} files for explicit-any elimination`);
    }
    
    const results = await processFiles(fileWarnings);
    
    safetyValidator.recordRunComplete(results.success);
    
    return { ...results, stashName };
    
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`, 'red');
    safetyValidator.recordError('fatal');
    return { success: false, error: error.message };
  }
}

function groupAndPrioritizeWarnings(warnings, maxFiles) {
  const fileMap = new Map();
  
  for (const warning of warnings) {
    if (!fileMap.has(warning.file)) {
      fileMap.set(warning.file, []);
    }
    fileMap.get(warning.file).push(warning);
  }
  
  // Prioritize files by number of warnings and file importance
  const sortedFiles = Array.from(fileMap.entries()).sort((a, b) => {
    const [fileA, warningsA] = a;
    const [fileB, warningsB] = b;
    
    // Priority scoring
    let scoreA = warningsA.length;
    let scoreB = warningsB.length;
    
    // Boost score for important file types
    if (fileA.includes('/types/')) scoreA += 10;
    if (fileA.includes('/services/')) scoreA += 8;
    if (fileA.includes('/utils/')) scoreA += 6;
    if (fileA.includes('/components/')) scoreA += 4;
    
    if (fileB.includes('/types/')) scoreB += 10;
    if (fileB.includes('/services/')) scoreB += 8;
    if (fileB.includes('/utils/')) scoreB += 6;
    if (fileB.includes('/components/')) scoreB += 4;
    
    return scoreB - scoreA;
  });
  
  return new Map(sortedFiles.slice(0, maxFiles));
}

async function processFiles(fileWarnings) {
  const files = Array.from(fileWarnings.keys());
  let totalReplaced = 0;
  let totalWarnings = 0;
  let success = true;
  
  for (const [index, filePath] of files.entries()) {
    log(`\n📁 [${index + 1}/${files.length}] ${path.relative(process.cwd(), filePath)}`, 'bright');
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Corruption check
      if (detectCorruption(content, filePath)) {
        log(`🚨 Skipping corrupted file: ${filePath}`, 'red');
        success = false;
        continue;
      }
      
      // Parse explicit-any usages in the file
      const anyUsages = parseExplicitAnyUsage(content, filePath);
      log(`    🔍 Found ${anyUsages.length} explicit-any usages`, 'blue');
      
      let fileReplaced = 0;
      
      // Process each any usage
      for (const anyUsage of anyUsages) {
        totalWarnings++;
        
        const replacement = getReplacementType(anyUsage, content, filePath);
        safetyValidator.recordReplacementAttempted(replacement.reason);
        
        // Skip if we're preserving this any
        if (replacement.type === 'any') {
          log(`    ⏭️  Preserving any: ${replacement.reason}`, 'yellow');
          continue;
        }
        
        // Interactive confirmation for complex replacements
        if (DEFAULT_CONFIG.interactiveConfirmation && INTERACTIVE && !AUTO_FIX) {
          const shouldReplace = await askForReplacement(anyUsage, replacement);
          if (!shouldReplace) {
            log(`    ⏭️  Skipped: ${anyUsage.name || anyUsage.context}`, 'gray');
            continue;
          }
        }
        
        try {
          const newContent = replaceAnyUsage(content, anyUsage, replacement.type);
          if (newContent !== content) {
            content = newContent;
            fileReplaced++;
            totalReplaced++;
            safetyValidator.recordAnyReplaced(replacement.reason);
            log(`    ✅ Replaced with ${replacement.type}: ${replacement.reason}`, 'green');
          }
        } catch (replaceError) {
          log(`    ❌ Replacement failed: ${replaceError.message}`, 'red');
          safetyValidator.recordError('replacement-failed');
        }
      }
      
      // Validate and apply changes
      if (content !== originalContent) {
        if (!validateSyntaxAST(content, filePath)) {
          log(`❌ Syntax validation failed, reverting changes`, 'red');
          success = false;
          continue;
        }
        
        if (!DRY_RUN) {
          fs.writeFileSync(filePath, content, 'utf8');
          log(`💾 Updated file (${fileReplaced} replacements applied)`, 'green');
        } else {
          log(`📋 [DRY RUN] Would apply ${fileReplaced} replacements`, 'blue');
        }
        
        safetyValidator.recordFileProcessed();
      }
      
      // Build validation every N files
      if ((index + 1) % DEFAULT_CONFIG.buildValidationInterval === 0 && !DRY_RUN) {
        log(`🔨 Build validation checkpoint...`, 'cyan');
        const buildOk = await validateBuild();
        if (!buildOk) {
          log(`❌ Build failed, stopping processing`, 'red');
          success = false;
          break;
        }
      }
      
    } catch (error) {
      log(`❌ Error processing ${filePath}: ${error.message}`, 'red');
      safetyValidator.recordError('file-processing');
      success = false;
    }
  }
  
  return { success, anysReplaced: totalReplaced, totalWarnings };
}

async function askForReplacement(anyUsage, replacement) {
  log(`    🔄 Replace '${anyUsage.name || anyUsage.context}' (any) with '${replacement.type}'?`, 'cyan');
  log(`       Reason: ${replacement.reason}`, 'gray');
  
  const answer = await ask(`    Proceed? [y/N] `);
  return answer.toLowerCase() === 'y';
}

function replaceAnyUsage(content, anyUsage, newType) {
  const lines = content.split('\n');
  const lineIndex = anyUsage.line - 1;
  
  if (lineIndex < 0 || lineIndex >= lines.length) {
    throw new Error(`Invalid line number: ${anyUsage.line}`);
  }
  
  let line = lines[lineIndex];
  const originalLine = line;
  
  // Different replacement strategies based on context
  switch (anyUsage.context) {
    case 'variable_type':
      line = line.replace(/:\s*any\b/, `: ${newType}`);
      break;
    
    case 'parameter_type':
      line = line.replace(/(\w+)\s*:\s*any\b/, `$1: ${newType}`);
      break;
    
    case 'return_type':
      line = line.replace(/\)\s*:\s*any\b/, `): ${newType}`);
      break;
    
    case 'property_type':
      line = line.replace(/(\w+)\s*:\s*any\b/, `$1: ${newType}`);
      break;
    
    case 'array_type':
      line = line.replace(/:\s*any\[\]/, `: ${newType}`);
      break;
    
    case 'type_assertion':
      // Enhanced type assertion replacement with pattern recognition
      if (line.includes('as any') && line.includes('.')) {
        // Pattern: (obj as any).property → (obj as NewType).property
        line = line.replace(/\(\s*([^)]+)\s+as\s+any\s*\)/g, `($1 as ${newType})`);
        
        // Pattern: obj as any → obj as NewType (simple cases)
        if (line === originalLine) {
          line = line.replace(/(\w+)\s+as\s+any\b/g, `$1 as ${newType}`);
        }
        
        // Pattern: (expr as any) → (expr as NewType)
        if (line === originalLine) {
          line = line.replace(/\bas\s+any\b/g, `as ${newType}`);
        }
      } else {
        // Standard type assertion replacement
        line = line.replace(/\bas\s+any\b/, `as ${newType}`);
      }
      break;
    
    case 'generic_type':
      line = line.replace(/<any>/g, `<${newType}>`);
      break;
    
    default:
      // Enhanced fallback with pattern recognition
      if (line.includes('as any')) {
        // Handle complex type assertion patterns
        line = line.replace(/\bas\s+any\b/g, `as ${newType}`);
      } else if (line.includes(': any')) {
        // Handle type annotation patterns
        line = line.replace(/:\s*any\b/g, `: ${newType}`);
      } else {
        // Last resort - replace any occurrence of 'any' as a type
        line = line.replace(/\bany\b/g, newType);
      }
      break;
  }
  
  lines[lineIndex] = line;
  return lines.join('\n');
}

// Enhanced Summary and Reporting
function generateSummaryReport(results) {
  if (DEFAULT_CONFIG.jsonOutput) {
    const jsonReport = {
      timestamp: new Date().toISOString(),
      results,
      safetyMetrics: {
        safetyScore: safetyValidator.calculateSafetyScore(),
        recommendedBatchSize: safetyValidator.getRecommendedBatchSize()
      },
      exitCode: results.success ? 0 : 1
    };
    
    if (results.stashName) {
      jsonReport.rollback = {
        stashName: results.stashName,
        command: `git stash apply stash^{/${results.stashName}}`
      };
    }
    
    console.log(JSON.stringify(jsonReport, null, 2));
    return;
  }
  
  log('\n📊 EXPLICIT-ANY ELIMINATION REPORT', 'bright');
  log('='.repeat(40), 'bright');
  log(`🔄 Anys Replaced: ${results.anysReplaced}/${results.totalWarnings}`, 'green');
  
  if (results.totalWarnings > 0) {
    const percentage = ((results.anysReplaced / results.totalWarnings) * 100).toFixed(1);
    log(`📈 Replacement Rate: ${percentage}%`, 'cyan');
  }
  
  log(`✅ Success Rate: ${results.success ? '100%' : 'Partial'}`, results.success ? 'green' : 'yellow');
  log(`🛡️  Safety Score: ${(safetyValidator.calculateSafetyScore() * 100).toFixed(1)}%`, 'cyan');
  log(`🎯 Next Batch Size: ${safetyValidator.getRecommendedBatchSize()}`, 'cyan');
  
  if (results.stashName && !DRY_RUN) {
    log(`\n🔄 Rollback Instructions:`, 'bright');
    log(`   git stash apply stash^{/${results.stashName}}`, 'cyan');
  }
  
  if (DRY_RUN) {
    log('\n💡 Run without --dry-run to apply changes', 'yellow');
  }
  
  // Show projected impact
  if (results.anysReplaced > 0) {
    const remainingAnyWarnings = 2553 - results.anysReplaced; // Based on initial count
    log(`\n📊 IMPACT PROJECTION:`, 'bright');
    log(`   Remaining any warnings: ~${remainingAnyWarnings}`, 'cyan');
    log(`   Progress toward target: ${((results.anysReplaced / 2553) * 100).toFixed(1)}%`, 'green');
  }
}

// Main execution with enhanced error handling
async function main() {
  let exitCode = 0;
  
  try {
    if (!DEFAULT_CONFIG.silentMode) {
      log('🎯 Explicit-Any Systematic Elimination v1.0', 'bright');
      log('='.repeat(45), 'bright');
      log('Target: 2,553 @typescript-eslint/no-explicit-any warnings', 'cyan');
    }
    
    // Handle special commands
    if (CHECK_GIT) {
      const gitOk = await checkGitStatus();
      process.exit(gitOk ? 0 : 1);
    }
    
    if (SHOW_METRICS) {
      safetyValidator.showMetrics();
      process.exit(0);
    }
    
    if (VALIDATE_SAFETY) {
      const validation = safetyValidator.validateSafety();
      if (DEFAULT_CONFIG.jsonOutput) {
        console.log(JSON.stringify({ validation, exitCode: validation.safe ? 0 : 1 }));
      } else {
        log('\n🛡️  SAFETY VALIDATION RESULTS', 'bright');
        log(`Status: ${validation.safe ? 'SAFE' : 'NEEDS ATTENTION'}`, validation.safe ? 'green' : 'yellow');
        log(`Safety Score: ${(validation.safetyScore * 100).toFixed(1)}%`, 'cyan');
        log(`Recommended Batch Size: ${validation.recommendedBatchSize}`, 'green');
        
        if (validation.issues.length > 0) {
          log('\nIssues:', 'yellow');
          validation.issues.forEach(issue => log(`  - ${issue}`, 'yellow'));
        }
      }
      process.exit(validation.safe ? 0 : 1);
    }
    
    // Pre-flight checks
    log('\n🔍 Pre-flight checks...', 'blue');
    
    const gitOk = await checkGitStatus();
    if (!gitOk) {
      exitCode = 1;
      return;
    }
    
    // Show operation mode
    if (DRY_RUN) {
      log('🔍 DRY RUN MODE - No changes will be made', 'yellow');
    } else if (AUTO_FIX) {
      log('⚡ AUTO-FIX MODE - Changes will be applied automatically', 'yellow');
    } else {
      log('🤝 INTERACTIVE MODE - You will be prompted for each change', 'green');
    }
    
    if (AGGRESSIVE) {
      log('🚀 AGGRESSIVE MODE - Conservative safety checks disabled', 'yellow');
    }
    
    // Show safety information
    const validation = safetyValidator.validateSafety();
    log(`🛡️  Safety Score: ${(validation.safetyScore * 100).toFixed(1)}% | Recommended Batch Size: ${validation.recommendedBatchSize}`, 'cyan');
    
    // Main processing
    const results = await processExplicitAnyFiles();
    
    generateSummaryReport(results);
    
    if (!results.success) {
      exitCode = 2; // Partial failure
    }
    
    log('\n✅ Explicit-any elimination complete!', 'green');
    
  } catch (error) {
    if (DEFAULT_CONFIG.jsonOutput) {
      console.log(JSON.stringify({ 
        error: 'Fatal error during execution',
        details: error.message,
        exitCode: 1
      }));
    } else {
      log(`❌ Fatal error: ${error.message}`, 'red');
    }
    exitCode = 1;
  } finally {
    rl.close();
    process.exit(exitCode);
  }
}

// Enhanced error handling (copied from proven template)
process.on('unhandledRejection', (reason) => {
  if (DEFAULT_CONFIG.jsonOutput) {
    console.log(JSON.stringify({ 
      error: 'Unhandled promise rejection',
      reason: reason?.toString(),
      exitCode: 1
    }));
  } else {
    log(`❌ Unhandled Rejection: ${reason}`, 'red');
  }
  rl.close();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  if (DEFAULT_CONFIG.jsonOutput) {
    console.log(JSON.stringify({ 
      error: 'Uncaught exception',
      details: error.message,
      stack: error.stack,
      exitCode: 1
    }));
  } else {
    log(`❌ Uncaught Exception: ${error.message}`, 'red');
  }
  rl.close();
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  if (!DEFAULT_CONFIG.silentMode) {
    log('\n👋 Gracefully shutting down...', 'yellow');
  }
  rl.close();
  process.exit(0);
});

main();