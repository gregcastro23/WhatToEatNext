#!/usr/bin/env node

/**
 * Enterprise Explicit Any Replacement Script
 * Replaces explicit any types with proper enterprise types from the WhatToEatNext type system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ts = require('typescript');

// Domain-aware type mappings
const ENTERPRISE_TYPE_MAPPINGS = {
  // Astrological domain
  planet: 'Planet',
  zodiac: 'ZodiacSign',
  element: 'Element',
  lunar: 'LunarPhase',
  celestial: 'CelestialBody',
  astrological: 'AstrologicalState',
  elementalProperties: 'ElementalProperties',
  planetaryPosition: 'PlanetaryPosition',

  // Recipe/Culinary domain
  recipe: 'Recipe',
  ingredient: 'Ingredient',
  cuisine: 'CuisineProfile',
  cooking: 'CookingMethod',
  culinary: 'CulinaryProperties',
  nutrition: 'NutritionalData',
  flavor: 'FlavorProfile',

  // Campaign system
  campaign: 'CampaignPhase',
  phase: 'CampaignPhase',
  metrics: 'ProgressMetrics',
  checkpoint: 'SafetyCheckpoint',
  progress: 'ProgressMetrics',
  safetyEvent: 'SafetyEvent',

  // Intelligence system
  intelligence: 'IntelligenceResult',
  prediction: 'PredictiveIntelligenceResult',
  analysis: 'CompatibilityAnalysis',
  recommendation: 'OptimizationRecommendations',
  compatibility: 'CompatibilityAnalysis',

  // Service/Integration
  service: 'ServiceInterface',
  controller: 'CampaignController',
  integration: 'EnterpriseIntelligenceIntegration',
  config: 'EnterpriseIntelligenceConfig',

  // Common patterns
  error: 'Error',
  response: 'Response',
  request: 'Request',
  data: 'unknown',
  result: 'unknown',
  callback: 'Function',
  handler: 'Function',
};

// Import statements to add if needed
const REQUIRED_IMPORTS = {
  Planet: "import type { Planet } from '@/types/alchemy';",
  ZodiacSign: "import type { ZodiacSign } from '@/types/alchemy';",
  Element: "import type { Element } from '@/types/alchemy';",
  ElementalProperties: "import type { ElementalProperties } from '@/types/alchemy';",
  Recipe: "import type { Recipe } from '@/types/unified';",
  Ingredient: "import type { Ingredient } from '@/types/unified';",
  CampaignPhase: "import type { CampaignPhase } from '@/types/campaign';",
  ProgressMetrics: "import type { ProgressMetrics } from '@/types/campaign';",
  SafetyEvent: "import type { SafetyEvent } from '@/types/campaign';",
  PredictiveIntelligenceResult:
    "import type { PredictiveIntelligenceResult } from '@/types/predictiveIntelligence';",
  CompatibilityAnalysis:
    "import type { CompatibilityAnalysis } from '@/types/enterpriseIntelligence';",
  EnterpriseIntelligenceConfig:
    "import type { EnterpriseIntelligenceConfig } from '@/types/enterpriseIntelligence';",
};

class EnterpriseAnyReplacer {
  constructor() {
    this.replacements = 0;
    this.filesProcessed = 0;
    this.errors = [];
    this.backupDir = '.explicit-any-enterprise-backups';
    this.metricsFile = '.explicit-any-enterprise-metrics.json';
    this.requiredImports = new Set();

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }

    // Load previous metrics
    this.loadMetrics();
  }

  loadMetrics() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf-8');
        this.previousMetrics = JSON.parse(data);
      } else {
        this.previousMetrics = { totalReplacements: 0, sessions: [] };
      }
    } catch (error) {
      this.previousMetrics = { totalReplacements: 0, sessions: [] };
    }
  }

  saveMetrics() {
    const sessionMetrics = {
      timestamp: new Date().toISOString(),
      filesProcessed: this.filesProcessed,
      replacements: this.replacements,
      errors: this.errors.length,
      errorDetails: this.errors,
    };

    this.previousMetrics.totalReplacements += this.replacements;
    this.previousMetrics.sessions.push(sessionMetrics);

    fs.writeFileSync(this.metricsFile, JSON.stringify(this.previousMetrics, null, 2));
  }

  async processFiles(files, options = {}) {
    console.log(`🚀 Processing ${files.length} files for enterprise any replacements...\n`);

    // Create git stash for safety
    this.createSafetyStash();

    for (const file of files) {
      await this.processFile(file, options);

      // Check build every 5 files
      if (this.filesProcessed % 5 === 0 && this.filesProcessed > 0) {
        console.log('\n🔨 Checking TypeScript compilation...');
        if (!this.checkBuild()) {
          console.error('❌ Build failed! Stopping processing.');
          break;
        }
        console.log('✅ Build successful, continuing...\n');
      }
    }

    // Final report
    this.displayReport();
    this.saveMetrics();
  }

  createSafetyStash() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      execSync(`git stash push -m "explicit-any-enterprise-fix-${timestamp}"`, {
        cwd: path.resolve(__dirname, '../..'),
        stdio: 'pipe',
      });
      console.log('✅ Safety stash created\n');
    } catch (error) {
      console.warn('⚠️  Could not create git stash:', error.message);
    }
  }

  async processFile(filePath, options) {
    const fullPath = path.resolve(__dirname, '../..', filePath);

    try {
      // Read file
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Create backup
      const timestamp = Date.now();
      const backupPath = path.join(
        this.backupDir,
        `${path.basename(filePath)}.${timestamp}.backup`,
      );
      fs.writeFileSync(backupPath, content);

      // Process replacements
      let modified = content;
      let fileReplacements = 0;
      this.requiredImports.clear();

      // Pattern 1: Error handling - catch (error: any)
      modified = modified.replace(/catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g, (match, varName) => {
        fileReplacements++;
        return `catch (${varName}: unknown)`;
      });

      // Pattern 2: Type assertions - as any
      modified = modified.replace(/(\w+)\s+as\s+any\b/g, (match, variable) => {
        const inferredType = this.inferTypeFromContext(variable, modified);
        if (inferredType && inferredType !== 'unknown') {
          fileReplacements++;
          this.addRequiredImport(inferredType);
          return `${variable} as ${inferredType}`;
        }
        return match;
      });

      // Pattern 3: Property types - : any
      modified = modified.replace(/(\w+)\s*:\s*any(\s*[;,\s\)])/g, (match, propName, suffix) => {
        const inferredType = this.inferTypeFromPropertyName(propName);
        if (inferredType) {
          fileReplacements++;
          this.addRequiredImport(inferredType);
          return `${propName}: ${inferredType}${suffix}`;
        }
        fileReplacements++;
        return `${propName}: unknown${suffix}`;
      });

      // Pattern 4: Array types - : any[]
      modified = modified.replace(/(\w+)\s*:\s*any\[\]/g, (match, varName) => {
        const inferredType = this.inferArrayTypeFromContext(varName, modified);
        fileReplacements++;
        if (inferredType) {
          this.addRequiredImport(inferredType);
          return `${varName}: ${inferredType}[]`;
        }
        return `${varName}: unknown[]`;
      });

      // Pattern 5: Function parameters
      modified = modified.replace(/\(([^)]*:\s*any[^)]*)\)/g, (match, params) => {
        const modifiedParams = params.replace(/(\w+)\s*:\s*any/g, (paramMatch, paramName) => {
          const inferredType = this.inferTypeFromPropertyName(paramName);
          if (inferredType) {
            fileReplacements++;
            this.addRequiredImport(inferredType);
            return `${paramName}: ${inferredType}`;
          }
          fileReplacements++;
          return `${paramName}: unknown`;
        });
        return `(${modifiedParams})`;
      });

      // Pattern 6: Generic any in types like Promise<any>, Record<string, any>
      modified = modified.replace(/Promise<any>/g, () => {
        fileReplacements++;
        return 'Promise<unknown>';
      });

      modified = modified.replace(/Record<(\w+),\s*any>/g, (match, keyType) => {
        fileReplacements++;
        return `Record<${keyType}, unknown>`;
      });

      // Add required imports if file was modified
      if (fileReplacements > 0 && this.requiredImports.size > 0) {
        modified = this.addImports(modified);
      }

      // Write modified file if changes were made
      if (fileReplacements > 0) {
        fs.writeFileSync(fullPath, modified);
        this.filesProcessed++;
        this.replacements += fileReplacements;
        console.log(`✅ ${filePath}: ${fileReplacements} replacements`);
      } else {
        console.log(`⏭️  ${filePath}: No replacements needed`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  inferTypeFromContext(variable, content) {
    // Check if variable name matches known patterns
    for (const [pattern, type] of Object.entries(ENTERPRISE_TYPE_MAPPINGS)) {
      if (variable.toLowerCase().includes(pattern.toLowerCase())) {
        return type;
      }
    }

    // Check surrounding context
    const variableRegex = new RegExp(`${variable}\\s*[=:]\\s*([^;\\n]+)`, 'g');
    const match = variableRegex.exec(content);
    if (match) {
      const assignment = match[1];
      if (assignment.includes('getRecipe') || assignment.includes('recipe')) {
        return 'Recipe';
      }
      if (assignment.includes('getIngredient') || assignment.includes('ingredient')) {
        return 'Ingredient';
      }
      if (assignment.includes('campaign') || assignment.includes('phase')) {
        return 'CampaignPhase';
      }
    }

    return 'unknown';
  }

  inferTypeFromPropertyName(propName) {
    // Direct mapping
    if (ENTERPRISE_TYPE_MAPPINGS[propName]) {
      return ENTERPRISE_TYPE_MAPPINGS[propName];
    }

    // Check for partial matches
    const lowerProp = propName.toLowerCase();
    for (const [pattern, type] of Object.entries(ENTERPRISE_TYPE_MAPPINGS)) {
      if (lowerProp.includes(pattern.toLowerCase())) {
        return type;
      }
    }

    return null;
  }

  inferArrayTypeFromContext(varName, content) {
    if (varName.toLowerCase().includes('recipe')) return 'Recipe';
    if (varName.toLowerCase().includes('ingredient')) return 'Ingredient';
    if (varName.toLowerCase().includes('planet')) return 'Planet';
    if (varName.toLowerCase().includes('zodiac')) return 'ZodiacSign';
    if (varName.toLowerCase().includes('element')) return 'Element';
    if (varName.toLowerCase().includes('phase')) return 'CampaignPhase';
    if (varName.toLowerCase().includes('metric')) return 'ProgressMetrics';

    return null;
  }

  addRequiredImport(type) {
    if (
      REQUIRED_IMPORTS[type] &&
      !['unknown', 'Error', 'Function', 'Response', 'Request'].includes(type)
    ) {
      this.requiredImports.add(type);
    }
  }

  addImports(content) {
    // Find the position to insert imports (after existing imports or at top)
    const importRegex = /^import\s+.*$/gm;
    const lastImport = [...content.matchAll(importRegex)].pop();

    let importStatements = '';
    for (const type of this.requiredImports) {
      if (REQUIRED_IMPORTS[type] && !content.includes(type)) {
        importStatements += REQUIRED_IMPORTS[type] + '\n';
      }
    }

    if (importStatements) {
      if (lastImport) {
        const insertPos = lastImport.index + lastImport[0].length;
        return content.slice(0, insertPos) + '\n' + importStatements + content.slice(insertPos);
      } else {
        return importStatements + '\n' + content;
      }
    }

    return content;
  }

  checkBuild() {
    try {
      execSync('yarn build', {
        cwd: path.resolve(__dirname, '../..'),
        stdio: 'pipe',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  displayReport() {
    console.log('\n📊 ENTERPRISE ANY REPLACEMENT REPORT');
    console.log('════════════════════════════════════════');
    console.log(`Files processed: ${this.filesProcessed}`);
    console.log(`Total replacements: ${this.replacements}`);
    console.log(`Errors encountered: ${this.errors.length}`);
    console.log(
      `Total replacements (all sessions): ${this.previousMetrics.totalReplacements + this.replacements}`,
    );

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }

    console.log('\n✅ Backup directory:', this.backupDir);
    console.log('📝 Metrics saved to:', this.metricsFile);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    maxFiles: 25,
    dryRun: false,
    targetFiles: [],
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--max-files' && args[i + 1]) {
      options.maxFiles = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (args[i] === '--file' && args[i + 1]) {
      options.targetFiles.push(args[i + 1]);
      i++;
    }
  }

  const replacer = new EnterpriseAnyReplacer();

  // Get files to process
  let files;
  if (options.targetFiles.length > 0) {
    files = options.targetFiles;
  } else {
    // Get files with most any issues from analysis
    const analysisPath = path.join(__dirname, 'explicit-any-analysis.json');
    if (fs.existsSync(analysisPath)) {
      const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
      files = analysis.topFiles.slice(0, options.maxFiles).map(f => f.file);
    } else {
      console.error('❌ No analysis file found. Run analyze-explicit-any-patterns.cjs first.');
      process.exit(1);
    }
  }

  console.log('🎯 Enterprise Explicit Any Replacement Tool');
  console.log('═══════════════════════════════════════════');
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Max files: ${options.maxFiles}`);
  console.log(`Target files: ${files.length}\n`);

  if (options.dryRun) {
    console.log('DRY RUN - No files will be modified\n');
    files.forEach(file => console.log(`  - ${file}`));
  } else {
    await replacer.processFiles(files, options);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EnterpriseAnyReplacer };
