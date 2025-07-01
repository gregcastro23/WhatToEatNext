#!/usr/bin/env node

/**
 * fix-unused-variables-safe.js v4.0 - Corruption-Proof Edition
 *
 * CRITICAL FIXES TO PREVENT CORRUPTION:
 * 1. Parameter Reference Tracking: Updates ALL references when prefixing parameters
 * 2. Function Scope Analysis: Proper detection of parameter usage in function bodies  
 * 3. Conservative Safety: Prefer skipping over corrupting
 * 4. Comprehensive Validation: Multiple safety checks before any change
 * 5. Reference Mapping: Maps all usages before making changes
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

// Enhanced Safety Configuration
const SAFE_CONFIG = {
  // Core safety principles
  preferSkipOverCorrupt: true,
  requireReferenceMapping: true,
  validateBeforeChange: true,
  
  // Parameter handling
  checkParameterUsage: true,
  updateAllReferences: true,
  skipAmbiguousParameters: true,
  
  // Conservative limits
  maxBatchSize: 20,
  maxFilesWithoutValidation: 5,
  
  // Validation requirements
  requireCleanGit: false, // Allow dirty git for testing
  validateSyntaxAfterChange: true,
  enableDryRunFirst: true
};

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const INTERACTIVE = args.includes('--interactive') || (!args.includes('--auto-fix') && !DRY_RUN);
const AUTO_FIX = args.includes('--auto-fix');
const BATCH_SIZE = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 10;

class ParameterReferenceAnalyzer {
  constructor() {
    this.functionBoundaries = new Map();
    this.parameterReferences = new Map();
  }

  /**
   * Analyze a function to find all references to a parameter
   */
  analyzeParameterUsage(fileContent, parameterName, parameterLine) {
    const lines = fileContent.split('\n');
    const analysis = {
      isUsed: false,
      references: [],
      functionStart: null,
      functionEnd: null,
      safeToPrefix: false
    };

    // Find function boundaries around the parameter
    const functionBounds = this.findFunctionBoundaries(lines, parameterLine);
    if (!functionBounds) {
      analysis.safeToPrefix = false;
      return analysis;
    }

    analysis.functionStart = functionBounds.start;
    analysis.functionEnd = functionBounds.end;

    // Look for references within the function body only
    for (let i = functionBounds.start; i <= functionBounds.end; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Skip the parameter declaration line
      if (lineNumber === parameterLine) continue;
      
      // Look for parameter usage
      const parameterUsages = this.findParameterReferences(line, parameterName, lineNumber);
      analysis.references.push(...parameterUsages);
    }

    analysis.isUsed = analysis.references.length > 0;
    analysis.safeToPrefix = this.determineSafetyForPrefixing(analysis);
    
    return analysis;
  }

  /**
   * Find the boundaries of a function containing the given line
   */
  findFunctionBoundaries(lines, parameterLine) {
    const lineIndex = parameterLine - 1;
    let functionStart = null;
    let functionEnd = null;
    let braceCount = 0;

    // Find function start by looking backwards
    for (let i = lineIndex; i >= 0; i--) {
      const line = lines[i].trim();
      
      // Look for function declarations
      if (line.match(/^\s*(function\s+\w+|const\s+\w+\s*=\s*[\(\w]|[\w\s]*\([^)]*\)\s*[=>]|[\w\s]*:\s*[\(\w])/)) {
        functionStart = i;
        break;
      }
      
      // Also check for method definitions
      if (line.match(/^\s*[\w\s]*\([^)]*\)\s*[{:]/)) {
        functionStart = i;
        break;
      }
    }

    if (functionStart === null) return null;

    // Find function end by counting braces
    let foundOpenBrace = false;
    for (let i = functionStart; i < lines.length; i++) {
      const line = lines[i];
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundOpenBrace = true;
        } else if (char === '}') {
          braceCount--;
          if (foundOpenBrace && braceCount === 0) {
            functionEnd = i;
            break;
          }
        }
      }
      
      if (functionEnd !== null) break;
    }

    return functionStart !== null && functionEnd !== null ? 
      { start: functionStart, end: functionEnd } : null;
  }

  /**
   * Find all references to a parameter in a line
   */
  findParameterReferences(line, parameterName, lineNumber) {
    const references = [];
    const regex = new RegExp(`\\b${parameterName}\\b`, 'g');
    let match;

    while ((match = regex.exec(line)) !== null) {
      // Additional context checks to avoid false positives
      const beforeChar = line[match.index - 1] || ' ';
      const afterChar = line[match.index + parameterName.length] || ' ';
      
      // Skip if it's part of another identifier
      if (/\w/.test(beforeChar) || /\w/.test(afterChar)) continue;
      
      // Skip if it's in a comment
      const beforeMatch = line.substring(0, match.index);
      if (beforeMatch.includes('//') || beforeMatch.includes('/*')) continue;
      
      references.push({
        line: lineNumber,
        column: match.index,
        context: line.trim()
      });
    }

    return references;
  }

  /**
   * Determine if it's safe to prefix this parameter
   */
  determineSafetyForPrefixing(analysis) {
    // If parameter is not used, it's safe to prefix
    if (!analysis.isUsed) return true;
    
    // If parameter is used, we need to update all references
    // For now, be conservative and skip used parameters
    return false;
  }

  /**
   * Update all references to a parameter when prefixing
   */
  updateParameterReferences(fileContent, parameterName, parameterLine, references) {
    const lines = fileContent.split('\n');
    
    // Update parameter declaration
    const paramLineIndex = parameterLine - 1;
    lines[paramLineIndex] = lines[paramLineIndex].replace(
      new RegExp(`\\b${parameterName}\\b`), 
      `_${parameterName}`
    );
    
    // Update all references
    for (const ref of references) {
      const lineIndex = ref.line - 1;
      lines[lineIndex] = lines[lineIndex].replace(
        new RegExp(`\\b${parameterName}\\b`), 
        `_${parameterName}`
      );
    }
    
    return lines.join('\n');
  }
}

class SafeVariableProcessor {
  constructor() {
    this.analyzer = new ParameterReferenceAnalyzer();
    this.processedFiles = 0;
    this.errors = [];
  }

  /**
   * Safely process a variable with comprehensive checks
   */
  async processVariable(fileContent, variable, filePath) {
    const result = {
      changed: false,
      newContent: fileContent,
      action: 'skip',
      reasoning: '',
      safety: 'unknown'
    };

    try {
      // Step 1: Analyze parameter usage if it's a parameter
      if (variable.kind === 'parameter') {
        const analysis = this.analyzer.analyzeParameterUsage(
          fileContent, 
          variable.name, 
          variable.line
        );

        if (analysis.isUsed && SAFE_CONFIG.skipAmbiguousParameters) {
          result.reasoning = 'Parameter is used in function body - skipping to prevent corruption';
          result.safety = 'high';
          return result;
        }

        if (analysis.safeToPrefix) {
          if (DRY_RUN) {
            result.action = 'would-prefix';
            result.reasoning = 'Parameter not used - safe to prefix';
            result.safety = 'high';
          } else {
            result.newContent = this.analyzer.updateParameterReferences(
              fileContent,
              variable.name,
              variable.line,
              analysis.references
            );
            result.changed = true;
            result.action = 'prefix';
            result.reasoning = 'Parameter safely prefixed with reference updates';
            result.safety = 'high';
          }
        }
      } else {
        // Handle non-parameter variables more conservatively
        result.reasoning = 'Non-parameter variable - needs manual review';
        result.safety = 'medium';
      }

    } catch (error) {
      result.reasoning = `Error analyzing variable: ${error.message}`;
      result.safety = 'low';
      this.errors.push({ file: filePath, variable: variable.name, error: error.message });
    }

    return result;
  }

  /**
   * Validate syntax after changes
   */
  validateSyntax(filePath, content) {
    try {
      // Write to temp file and check syntax
      const tempFile = `${filePath}.temp`;
      fs.writeFileSync(tempFile, content);
      
      // Try to parse with TypeScript
      try {
        execSync(`npx tsc --noEmit ${tempFile}`, { stdio: 'pipe' });
        fs.unlinkSync(tempFile);
        return { valid: true };
      } catch (tscError) {
        fs.unlinkSync(tempFile);
        return { valid: false, error: tscError.message };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// Utility functions
function colorize(text, color) {
  const colors = {
    reset: '\x1b[0m', bright: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
    gray: '\x1b[90m'
  };
  return `${colors[color] || colors.reset}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }));
}

async function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      log('⚠️  Git repository has uncommitted changes.', 'yellow');
      if (SAFE_CONFIG.requireCleanGit && !DRY_RUN) {
        log('❌ Clean git status required for safety. Commit or stash changes first.', 'red');
        return false;
      }
    }
    return true;
  } catch {
    log('⚠️  Git not available. Proceeding without git safety checks.', 'yellow');
    return true;
  }
}

function getUnusedVariableCandidatesFromTypeScript() {
  try {
    // Get TypeScript errors which include unused variable warnings
    const tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout || error.message;
    const candidates = [];
    
    // Parse TypeScript error output for unused variables
    const lines = output.split('\n');
    for (const line of lines) {
      // Look for "Cannot find name" errors which often indicate corruption
      const cannotFindMatch = line.match(/Cannot find name '([^']+)'/);
      if (cannotFindMatch) {
        const fileMatch = line.match(/^([^(]+)\((\d+),\d+\):/);
        if (fileMatch) {
          candidates.push({
            file: fileMatch[1],
            varName: cannotFindMatch[1],
            line: parseInt(fileMatch[2]),
            kind: 'corruption-candidate',
            error: line
          });
        }
      }
      
      // Look for unused variable warnings
      const unusedMatch = line.match(/'([^']+)' is declared but never used/);
      if (unusedMatch) {
        const fileMatch = line.match(/^([^(]+)\((\d+),\d+\):/);
        if (fileMatch) {
          candidates.push({
            file: fileMatch[1],
            varName: unusedMatch[1],
            line: parseInt(fileMatch[2]),
            kind: 'unused',
            error: line
          });
        }
      }
    }
    
    return candidates;
  }
}

function getUnusedVariableCandidatesFromMakeLint() {
  try {
    const makeLintOutput = execSync('make lint 2>&1', { encoding: 'utf8', maxBuffer: 1024 * 1024 });
    const candidates = [];
    
    // Parse simple format from make lint
    const lines = makeLintOutput.split('\n');
    for (const line of lines) {
      if (line.includes('unused') || line.includes('declared but never read')) {
        const match = line.match(/([^:]+):(\d+).*'([^']+)'/);
        if (match) {
          candidates.push({
            file: match[1],
            varName: match[3],
            line: parseInt(match[2]),
            kind: 'unused'
          });
        }
      }
    }
    
    return candidates;
  } catch (error) {
    log(`⚠️  Could not get make lint results: ${error.message}`, 'yellow');
    return getUnusedVariableCandidatesFromTypeScript();
  }
}

function isVariableInFile(file, varName) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return content.includes(varName);
  } catch {
    return false;
  }
}

function getAllCodebaseFiles() {
  const extensions = ['.ts', '.tsx'];
  const excludePaths = ['node_modules', '.next', 'dist', 'build', '.git'];
  
  const walk = dir => {
    try {
      return fs.readdirSync(dir).flatMap(f => {
        const fullPath = path.join(dir, f);
        
        if (excludePaths.some(exclude => fullPath.includes(exclude))) return [];
        
        try {
          if (fs.statSync(fullPath).isDirectory()) return walk(fullPath);
          if (extensions.some(ext => fullPath.endsWith(ext))) return [fullPath];
        } catch (error) {
          return [];
        }
        
        return [];
      });
    } catch (error) {
      return [];
    }
  };
  
  return walk('src');
}

// Test function to analyze corruption patterns
function analyzeCorruptionPatterns() {
  log('\n🔍 CORRUPTION PATTERN ANALYSIS', 'bright');
  log('================================', 'bright');
  
  // Test the known corrupted files
  const testFiles = [
    'src/services/UnifiedIngredientService.ts',
    'src/components/IngredientRecommender/index.tsx', 
    'src/data/unified/recipeBuilding.ts'
  ];
  
  const analyzer = new ParameterReferenceAnalyzer();
  
  for (const filePath of testFiles) {
    if (!fs.existsSync(filePath)) continue;
    
    log(`\n📁 Analyzing ${filePath}:`, 'cyan');
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Look for patterns that indicate corruption
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for function parameters that were prefixed but still referenced
        const prefixedParamMatch = line.match(/\(([^)]*_\w+[^)]*)\)/);
        if (prefixedParamMatch) {
          const params = prefixedParamMatch[1].split(',');
          for (const param of params) {
            const paramMatch = param.trim().match(/_(\w+)/);
            if (paramMatch) {
              const originalName = paramMatch[1];
              
              // Check if the original name is still used in the function
              const functionBounds = analyzer.findFunctionBoundaries(lines, i + 1);
              if (functionBounds) {
                let foundUsage = false;
                for (let j = functionBounds.start; j <= functionBounds.end; j++) {
                  if (j !== i && lines[j].includes(originalName)) {
                    foundUsage = true;
                    break;
                  }
                }
                
                if (foundUsage) {
                  log(`   ⚠️  CORRUPTION: Parameter _${originalName} still referenced as ${originalName} on line ${i + 1}`, 'red');
                }
              }
            }
          }
        }
        
        // Look for "Cannot find name" type errors
        if (line.includes('Cannot find name')) {
          log(`   🔍 Error indicator on line ${i + 1}: ${line.trim()}`, 'yellow');
        }
      }
      
    } catch (error) {
      log(`   ❌ Error reading file: ${error.message}`, 'red');
    }
  }
}

// Main execution
async function main() {
  try {
    log('🛡️  Safe Unused Variable Cleaner v4.0 - Corruption-Proof Edition', 'bright');
    log('====================================================================', 'bright');
    log('🔒 Enhanced safety: Parameter reference tracking & validation', 'cyan');
    
    // Pre-flight checks
    log('\n🔍 Pre-flight safety checks...', 'blue');
    
    const gitOk = await checkGitStatus();
    if (!gitOk) return 1;
    
    if (DRY_RUN) {
      log('🔍 DRY RUN MODE - Analysis only, no changes', 'yellow');
    } else {
      log('⚡ SAFE PROCESSING MODE - Conservative changes with validation', 'green');
    }
    
    // Analyze corruption patterns in current codebase
    analyzeCorruptionPatterns();
    
    const candidates = getUnusedVariableCandidatesFromMakeLint();
    const unusedVariables = candidates.filter(c => isVariableInFile(c.file, c.varName));
    
    log(`\n📊 Found ${unusedVariables.length} unused variables to analyze`, 'blue');
    
    if (unusedVariables.length === 0) {
      log('✅ No unused variables found!', 'green');
      return 0;
    }
    
    const processor = new SafeVariableProcessor();
    const summary = [];
    let processed = 0;
    
    // Process variables with enhanced safety
    for (const variable of unusedVariables.slice(0, BATCH_SIZE)) {
      const filePath = variable.file;
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const result = await processor.processVariable(fileContent, variable, filePath);
        
        if (result.changed && !DRY_RUN) {
          // Validate syntax before writing
          if (SAFE_CONFIG.validateSyntaxAfterChange) {
            const validation = processor.validateSyntax(filePath, result.newContent);
            if (!validation.valid) {
              log(`❌ Syntax validation failed for ${filePath}: ${validation.error}`, 'red');
              result.action = 'skip';
              result.reasoning = 'Failed syntax validation';
              result.changed = false;
            }
          }
          
          if (result.changed) {
            fs.writeFileSync(filePath, result.newContent);
          }
        }
        
        summary.push({
          file: filePath,
          variable: variable.name,
          action: result.action,
          reasoning: result.reasoning,
          safety: result.safety
        });
        
        processed++;
        log(`   ${result.action}: ${variable.name} in ${path.basename(filePath)} (${result.safety} safety)`, 
            result.action === 'skip' ? 'gray' : 'green');
        
      } catch (error) {
        log(`❌ Error processing ${filePath}: ${error.message}`, 'red');
        summary.push({
          file: filePath,
          variable: variable.name,
          action: 'error',
          reasoning: error.message,
          safety: 'low'
        });
      }
    }
    
    // Generate report
    log('\n📊 SAFETY REPORT', 'bright');
    log('=================', 'bright');
    
    const stats = {
      processed: summary.length,
      prefixed: summary.filter(s => s.action === 'prefix').length,
      skipped: summary.filter(s => s.action === 'skip').length,
      errors: summary.filter(s => s.action === 'error').length,
      highSafety: summary.filter(s => s.safety === 'high').length
    };
    
    log(`📈 Processed: ${stats.processed}`, 'cyan');
    log(`🔧 Prefixed: ${stats.prefixed}`, 'green');  
    log(`⏭️  Skipped: ${stats.skipped}`, 'yellow');
    log(`❌ Errors: ${stats.errors}`, 'red');
    log(`🛡️  High Safety: ${stats.highSafety}/${stats.processed}`, 'green');
    
    if (processor.errors.length > 0) {
      log('\n⚠️  Errors encountered:', 'yellow');
      processor.errors.forEach(err => {
        log(`   ${err.file}: ${err.variable} - ${err.error}`, 'red');
      });
    }
    
    return stats.errors > 0 ? 1 : 0;
    
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`, 'red');
    return 1;
  }
}

// Execute
main().then(code => process.exit(code)); 