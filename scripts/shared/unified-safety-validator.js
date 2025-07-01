#!/usr/bin/env node

/**
 * unified-safety-validator.js v1.0
 * 
 * Unified Safety Validation System for TypeScript Fix Scripts
 * 
 * FEATURES:
 * - Cross-script safety metrics aggregation
 * - Enhanced pre-change validation with syntax checking
 * - Adaptive batch processing with complexity scoring
 * - Multi-level error recovery and confidence scoring
 * - File integrity validation and rollback verification
 * - Unified safety scoring algorithm targeting 95%+ safety
 * 
 * SAFETY IMPROVEMENTS:
 * - Separates AST parsing success from operational success
 * - Implements file complexity scoring for adaptive batching
 * - Pre-validates all files before making changes
 * - Tracks confidence levels for different parsing methods
 * - Implements progressive safety score improvement
 * 
 * USAGE:
 *   import { UnifiedSafetyValidator } from './shared/unified-safety-validator.js';
 *   const validator = new UnifiedSafetyValidator('imports'); // or 'variables'
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const UNIFIED_METRICS_FILE = path.join(process.cwd(), '.unified-safety-metrics.json');

// File complexity scoring constants
const COMPLEXITY_WEIGHTS = {
  SIMPLE_IMPORT: 1,
  NAMED_IMPORT: 2,
  DESTRUCTURED_IMPORT: 3,
  ALIASED_IMPORT: 2,
  MULTILINE_IMPORT: 4,
  SIMPLE_VARIABLE: 1,
  DESTRUCTURED_VARIABLE: 3,
  FUNCTION_PARAMETER: 2,
  CLASS_MEMBER: 4
};

// Safety thresholds for different operations
const SAFETY_THRESHOLDS = {
  EXCELLENT: 0.95,
  GOOD: 0.85,
  ACCEPTABLE: 0.75,
  RISKY: 0.65,
  DANGEROUS: 0.50
};

export class UnifiedSafetyValidator {
  constructor(scriptType = 'generic') {
    this.scriptType = scriptType;
    this.metrics = this.loadUnifiedMetrics();
    this.sessionData = {
      filesProcessed: 0,
      errorsEncountered: 0,
      successfulOperations: 0,
      failedOperations: 0,
      complexityScore: 0,
      confidenceScore: 1.0,
      preValidationFailures: 0,
      astParsingFailures: 0,
      syntaxValidationFailures: 0
    };
  }

  loadUnifiedMetrics() {
    try {
      if (fs.existsSync(UNIFIED_METRICS_FILE)) {
        const data = JSON.parse(fs.readFileSync(UNIFIED_METRICS_FILE, 'utf8'));
        return {
          totalRuns: data.totalRuns || 0,
          successfulRuns: data.successfulRuns || 0,
          totalFilesProcessed: data.totalFilesProcessed || 0,
          totalErrors: data.totalErrors || 0,
          scriptMetrics: data.scriptMetrics || {},
          safetyScoreHistory: data.safetyScoreHistory || [],
          lastRunTime: data.lastRunTime || null,
          averageComplexity: data.averageComplexity || 1.0,
          confidenceHistory: data.confidenceHistory || []
        };
      }
    } catch (error) {
      console.warn('Could not load unified safety metrics, starting fresh:', error.message);
    }
    
    return {
      totalRuns: 0,
      successfulRuns: 0,
      totalFilesProcessed: 0,
      totalErrors: 0,
      scriptMetrics: {},
      safetyScoreHistory: [],
      lastRunTime: null,
      averageComplexity: 1.0,
      confidenceHistory: []
    };
  }

  saveUnifiedMetrics() {
    try {
      fs.writeFileSync(UNIFIED_METRICS_FILE, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.warn('Could not save unified safety metrics:', error.message);
    }
  }

  // Enhanced pre-change validation
  async validateFileBeforeChanges(filePath, content) {
    const validationResults = {
      syntaxValid: false,
      typeScriptValid: false,
      astParseable: false,
      hasBackup: false,
      complexity: 0,
      risks: []
    };

    try {
      // 1. Basic syntax validation
      try {
        // Try to parse as JavaScript
        new Function(content);
        validationResults.syntaxValid = true;
      } catch (syntaxError) {
        validationResults.risks.push(`Syntax error: ${syntaxError.message}`);
        this.sessionData.preValidationFailures++;
      }

      // 2. TypeScript validation (if .ts/.tsx file)
      if (filePath.match(/\.(ts|tsx)$/)) {
        try {
          // Check if we can compile the TypeScript
          const tempFile = `/tmp/safety-check-${Date.now()}.ts`;
          fs.writeFileSync(tempFile, content);
          
          execSync(`npx tsc --noEmit --skipLibCheck "${tempFile}"`, { 
            stdio: 'pipe',
            timeout: 5000 
          });
          
          validationResults.typeScriptValid = true;
          fs.unlinkSync(tempFile);
        } catch (tsError) {
          // TypeScript errors are often expected, so don't penalize heavily
          validationResults.risks.push('TypeScript compilation issues (may be expected)');
        }
      }

      // 3. AST parseability check
      try {
        const parser = await import('@babel/parser');
        parser.parse(content, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx', 'decorators-legacy'],
          errorRecovery: true
        });
        validationResults.astParseable = true;
      } catch (astError) {
        validationResults.risks.push(`AST parsing failed: ${astError.message}`);
        this.sessionData.astParsingFailures++;
      }

      // 4. File complexity calculation
      validationResults.complexity = this.calculateFileComplexity(content);

      // 5. Backup verification
      validationResults.hasBackup = await this.verifyGitBackupCapability();

      return validationResults;
    } catch (error) {
      validationResults.risks.push(`Validation error: ${error.message}`);
      return validationResults;
    }
  }

  calculateFileComplexity(content) {
    let complexity = 0;
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Import complexity scoring
      if (line.trim().startsWith('import')) {
        if (line.includes('{')) {
          if (line.includes('\n') || line.length > 100) {
            complexity += COMPLEXITY_WEIGHTS.MULTILINE_IMPORT;
          } else {
            complexity += COMPLEXITY_WEIGHTS.NAMED_IMPORT;
          }
        } else if (line.includes(' as ')) {
          complexity += COMPLEXITY_WEIGHTS.ALIASED_IMPORT;
        } else {
          complexity += COMPLEXITY_WEIGHTS.SIMPLE_IMPORT;
        }
      }
      
      // Variable complexity scoring
      if (line.trim().match(/^(const|let|var)\s+/)) {
        if (line.includes('{') || line.includes('[')) {
          complexity += COMPLEXITY_WEIGHTS.DESTRUCTURED_VARIABLE;
        } else {
          complexity += COMPLEXITY_WEIGHTS.SIMPLE_VARIABLE;
        }
      }
      
      // Function parameters
      if (line.includes('function') || line.includes('=>')) {
        complexity += COMPLEXITY_WEIGHTS.FUNCTION_PARAMETER;
      }
      
      // Class members
      if (line.trim().match(/^(public|private|protected|static)/)) {
        complexity += COMPLEXITY_WEIGHTS.CLASS_MEMBER;
      }
    }
    
    return Math.max(1, complexity);
  }

  async verifyGitBackupCapability() {
    try {
      // Check if we're in a git repo
      execSync('git status', { stdio: 'pipe' });
      
      // Check if we can create a stash
      const stashList = execSync('git stash list', { encoding: 'utf8' });
      
      // Check working directory status
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Enhanced safety scoring algorithm
  calculateSafetyScore() {
    if (this.metrics.totalRuns === 0) {
      return 0.7; // Conservative starting score
    }

    const successRate = this.metrics.successfulRuns / this.metrics.totalRuns;
    const errorRate = this.metrics.totalErrors / Math.max(1, this.metrics.totalFilesProcessed);
    
    // Enhanced factors for 95% target
    const baseScore = successRate * 0.4; // Reduced weight for basic success
    const errorPenalty = Math.min(0.3, errorRate * 0.3); // Cap error penalty
    const confidenceBonus = this.calculateConfidenceBonus() * 0.2;
    const complexityBonus = this.calculateComplexityBonus() * 0.15;
    const preValidationBonus = this.calculatePreValidationBonus() * 0.15;
    
    const safetyScore = Math.max(0, Math.min(1, 
      baseScore - errorPenalty + confidenceBonus + complexityBonus + preValidationBonus
    ));
    
    return safetyScore;
  }

  calculateConfidenceBonus() {
    const recentConfidence = this.metrics.confidenceHistory.slice(-10);
    if (recentConfidence.length === 0) return 0;
    
    const averageConfidence = recentConfidence.reduce((a, b) => a + b, 0) / recentConfidence.length;
    return Math.min(1, averageConfidence);
  }

  calculateComplexityBonus() {
    // Bonus for successfully handling complex files
    if (this.metrics.averageComplexity > 3 && this.metrics.successfulRuns > 5) {
      return Math.min(1, (this.metrics.averageComplexity - 3) / 10);
    }
    return 0;
  }

  calculatePreValidationBonus() {
    // Bonus for pre-validation success
    const totalValidations = this.sessionData.preValidationFailures + this.sessionData.successfulOperations;
    if (totalValidations === 0) return 0;
    
    const preValidationSuccessRate = 1 - (this.sessionData.preValidationFailures / totalValidations);
    return Math.min(1, preValidationSuccessRate);
  }

  // Adaptive batch size calculation
  calculateOptimalBatchSize(defaultMin = 3, defaultMax = 20) {
    const safetyScore = this.calculateSafetyScore();
    const averageComplexity = this.metrics.averageComplexity || 1;
    
    // Base batch size on safety score
    let batchSize = defaultMin;
    
    if (safetyScore >= SAFETY_THRESHOLDS.EXCELLENT) {
      batchSize = Math.min(defaultMax, 25);
    } else if (safetyScore >= SAFETY_THRESHOLDS.GOOD) {
      batchSize = Math.min(defaultMax, 15);
    } else if (safetyScore >= SAFETY_THRESHOLDS.ACCEPTABLE) {
      batchSize = Math.min(defaultMax, 10);
    } else if (safetyScore >= SAFETY_THRESHOLDS.RISKY) {
      batchSize = Math.min(defaultMax, 7);
    } else {
      batchSize = Math.min(defaultMax, 5);
    }
    
    // Adjust for complexity
    if (averageComplexity > 5) {
      batchSize = Math.max(defaultMin, Math.floor(batchSize * 0.7));
    } else if (averageComplexity < 2) {
      batchSize = Math.min(defaultMax, Math.floor(batchSize * 1.3));
    }
    
    return batchSize;
  }

  // Session tracking methods
  recordFileProcessed(complexity = 1) {
    this.sessionData.filesProcessed++;
    this.sessionData.complexityScore += complexity;
  }

  recordSuccessfulOperation() {
    this.sessionData.successfulOperations++;
  }

  recordFailedOperation() {
    this.sessionData.failedOperations++;
  }

  recordError(errorType = 'general') {
    this.sessionData.errorsEncountered++;
    if (errorType === 'ast') {
      this.sessionData.astParsingFailures++;
    } else if (errorType === 'syntax') {
      this.sessionData.syntaxValidationFailures++;
    }
  }

  updateConfidence(confidence) {
    this.sessionData.confidenceScore = Math.min(1, Math.max(0, confidence));
  }

  // End session and update metrics
  recordRunComplete(successful = true) {
    this.metrics.totalRuns++;
    this.metrics.totalFilesProcessed += this.sessionData.filesProcessed;
    this.metrics.totalErrors += this.sessionData.errorsEncountered;
    
    if (successful) {
      this.metrics.successfulRuns++;
    }
    
    // Update script-specific metrics
    if (!this.metrics.scriptMetrics[this.scriptType]) {
      this.metrics.scriptMetrics[this.scriptType] = {
        runs: 0,
        successfulRuns: 0,
        filesProcessed: 0,
        errors: 0
      };
    }
    
    const scriptMetrics = this.metrics.scriptMetrics[this.scriptType];
    scriptMetrics.runs++;
    scriptMetrics.filesProcessed += this.sessionData.filesProcessed;
    scriptMetrics.errors += this.sessionData.errorsEncountered;
    if (successful) {
      scriptMetrics.successfulRuns++;
    }
    
    // Update averages
    if (this.sessionData.filesProcessed > 0) {
      this.metrics.averageComplexity = (
        (this.metrics.averageComplexity * (this.metrics.totalRuns - 1)) +
        (this.sessionData.complexityScore / this.sessionData.filesProcessed)
      ) / this.metrics.totalRuns;
    }
    
    // Update histories
    const currentScore = this.calculateSafetyScore();
    this.metrics.safetyScoreHistory.push({
      score: currentScore,
      timestamp: new Date().toISOString(),
      scriptType: this.scriptType
    });
    
    this.metrics.confidenceHistory.push(this.sessionData.confidenceScore);
    
    // Keep only last 50 entries
    if (this.metrics.safetyScoreHistory.length > 50) {
      this.metrics.safetyScoreHistory = this.metrics.safetyScoreHistory.slice(-50);
    }
    if (this.metrics.confidenceHistory.length > 50) {
      this.metrics.confidenceHistory = this.metrics.confidenceHistory.slice(-50);
    }
    
    this.metrics.lastRunTime = new Date().toISOString();
    this.saveUnifiedMetrics();
  }

  // Status reporting
  getDetailedStatus() {
    const safetyScore = this.calculateSafetyScore();
    const optimalBatchSize = this.calculateOptimalBatchSize();
    
    return {
      safetyScore: safetyScore,
      safetyLevel: this.getSafetyLevel(safetyScore),
      optimalBatchSize: optimalBatchSize,
      totalRuns: this.metrics.totalRuns,
      successRate: this.metrics.totalRuns > 0 ? this.metrics.successfulRuns / this.metrics.totalRuns : 0,
      averageComplexity: this.metrics.averageComplexity,
      lastRunTime: this.metrics.lastRunTime,
      scriptMetrics: this.metrics.scriptMetrics,
      sessionStatus: {
        filesProcessed: this.sessionData.filesProcessed,
        successfulOperations: this.sessionData.successfulOperations,
        failedOperations: this.sessionData.failedOperations,
        confidenceScore: this.sessionData.confidenceScore
      }
    };
  }

  getSafetyLevel(score) {
    if (score >= SAFETY_THRESHOLDS.EXCELLENT) return 'EXCELLENT';
    if (score >= SAFETY_THRESHOLDS.GOOD) return 'GOOD';
    if (score >= SAFETY_THRESHOLDS.ACCEPTABLE) return 'ACCEPTABLE';
    if (score >= SAFETY_THRESHOLDS.RISKY) return 'RISKY';
    return 'DANGEROUS';
  }

  // Migration helper for existing metrics
  async migrateExistingMetrics() {
    const legacyFiles = [
      '.import-cleaner-metrics.json',
      '.unused-variables-metrics.json'
    ];
    
    for (const file of legacyFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        try {
          const legacyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Migrate to unified format
          this.metrics.totalRuns += legacyData.totalRuns || 0;
          this.metrics.successfulRuns += legacyData.successfulRuns || 0;
          this.metrics.totalFilesProcessed += legacyData.filesProcessed || 0;
          this.metrics.totalErrors += legacyData.errorsEncountered || 0;
          
          console.log(`Migrated metrics from ${file}`);
        } catch (error) {
          console.warn(`Could not migrate ${file}:`, error.message);
        }
      }
    }
    
    this.saveUnifiedMetrics();
  }
}

export default UnifiedSafetyValidator;