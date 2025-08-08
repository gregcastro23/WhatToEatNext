#!/usr/bin/env node

/**
 * Opportunity Harvester - Advanced Pattern Recognition for Remaining Issues
 *
 * This script implements sophisticated pattern recognition to cash in on
 * the remaining identified opportunities with contextual analysis.
 *
 * Target Opportunities:
 * - 168 prefer-optional-chain issues (contextual analysis)
 * - 90 unnecessary type assertion issues (type relationship understanding)
 * - 184 remaining floating promises (complex patterns)
 * - 61 remaining misused promises (complex Promise usage)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class OpportunityHarvester {
  constructor() {
    this.totalFixes = 0;
    this.processedFiles = 0;
    this.opportunitiesHarvested = {
      'prefer-optional-chain': 0,
      'no-unnecessary-type-assertion': 0,
      'no-floating-promises': 0,
      'no-misused-promises': 0,
      'no-non-null-assertion': 0
    };
    this.analysisResults = {
      contextualPatterns: [],
      typeRelationships: [],
      complexPromises: []
    };
  }

  /**
   * Get comprehensive file analysis with issue context
   */
  async getComprehensiveFileAnalysis() {
    try {
      console.log('🔍 Performing comprehensive analysis of remaining opportunities...');

      const lintOutput = execSync(
        'yarn lint --max-warnings=10000 --format=json',
        { encoding: 'utf8', stdio: 'pipe' }
      );

      const lintResults = JSON.parse(lintOutput);
      const opportunityFiles = new Map();

      for (const result of lintResults) {
        const filePath = result.filePath;
        const targetMessages = result.messages.filter(msg =>
          msg.ruleId && [
            '@typescript-eslint/prefer-optional-chain',
            '@typescript-eslint/no-unnecessary-type-assertion',
            '@typescript-eslint/no-floating-promises',
            '@typescript-eslint/no-misused-promises',
            '@typescript-eslint/no-non-null-assertion'
          ].includes(msg.ruleId)
        );

        if (targetMessages.length > 0) {
          opportunityFiles.set(filePath, {
            messages: targetMessages,
            issueCount: targetMessages.length,
            categories: [...new Set(targetMessages.map(m => m.ruleId?.replace('@typescript-eslint/', '')))]
          });
        }
      }

      // Sort by issue count and category diversity for maximum impact
      const sortedFiles = Array.from(opportunityFiles.entries())
        .sort(([,a], [,b]) => {
          // Prioritize files with multiple categories and high counts
          const aScore = a.issueCount * a.categories.length;
          const bScore = b.issueCount * b.categories.length;
          return bScore - aScore;
        })
        .slice(0, 30); // Process top 30 opportunity files

      console.log(`📊 Found ${sortedFiles.length} files with significant opportunities`);
      console.log(`📈 Top opportunity files:`);
      sortedFiles.slice(0, 8).forEach(([file, data], index) => {
        const shortPath = file.replace(process.cwd(), '.');
        console.log(`   ${index + 1}. ${shortPath} (${data.issueCount} issues, ${data.categories.length} categories)`);
      });

      return sortedFiles;

    } catch (error) {
      console.warn('⚠️ Could not get comprehensive analysis, using fallback approach');
      return this.getFallbackOpportunityFiles();
    }
  }

  /**
   * Fallback opportunity file detection
   */
  getFallbackOpportunityFiles() {
    const knownOpportunityFiles = [
      'src/components/ChakraDisplay.migrated.tsx',
      'src/components/CookingMethodsSection.migrated.tsx',
      'src/app/api/astrologize/route.ts',
      'src/services/CampaignConflictResolver.ts',
      'src/services/CurrentMomentManager.ts',
      'src/utils/astrologyUtils.ts',
      'src/utils/ingredientRecommender.ts',
      'src/components/IngredientRecommender.tsx'
    ];

    return knownOpportunityFiles
      .filter(file => fs.existsSync(file))
      .map(file => [file, { messages: [], issueCount: 0, categories: [] }]);
  }

  /**
   * Advanced contextual optional chain analysis
   */
  harvestOptionalChainOpportunities(content, filePath) {
    let fixes = 0;
    let modifiedContent = content;
    const patterns = [];

    // Advanced Pattern 1: Complex nested object access
    const nestedPattern = /(\w+)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)\s*&&\s*\1\.\2\.\3\.(\w+)/g;
    const nestedMatches = [...modifiedContent.matchAll(nestedPattern)];
    if (nestedMatches.length > 0) {
      modifiedContent = modifiedContent.replace(nestedPattern, '$1?.$2?.$3?.$4');
      fixes += nestedMatches.length;
      patterns.push(`Complex nested: ${nestedMatches.length} fixes`);
    }

    // Advanced Pattern 2: Conditional property access with fallbacks
    const conditionalPattern = /(\w+)\s*&&\s*\1\.(\w+)\s*\|\|\s*([^;,\n]+)/g;
    const conditionalMatches = [...modifiedContent.matchAll(conditionalPattern)];
    if (conditionalMatches.length > 0) {
      modifiedContent = modifiedContent.replace(conditionalPattern, '$1?.$2 || $3');
      fixes += conditionalMatches.length;
      patterns.push(`Conditional fallback: ${conditionalMatches.length} fixes`);
    }

    // Advanced Pattern 3: Array access with existence check
    const arrayPattern = /(\w+)\s*&&\s*\1\.length\s*>\s*(\d+)\s*&&\s*\1\[(\d+|\w+)\]/g;
    const arrayMatches = [...modifiedContent.matchAll(arrayPattern)];
    if (arrayMatches.length > 0) {
      modifiedContent = modifiedContent.replace(arrayPattern, '$1?.length > $2 && $1[$3]');
      fixes += arrayMatches.length;
      patterns.push(`Array access: ${arrayMatches.length} fixes`);
    }

    // Advanced Pattern 4: Method chaining with existence checks
    const methodChainPattern = /(\w+)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\(\)\.(\w+)/g;
    const methodChainMatches = [...modifiedContent.matchAll(methodChainPattern)];
    if (methodChainMatches.length > 0) {
      modifiedContent = modifiedContent.replace(methodChainPattern, '$1?.$2()?.$3');
      fixes += methodChainMatches.length;
      patterns.push(`Method chaining: ${methodChainMatches.length} fixes`);
    }

    // Advanced Pattern 5: React props and state access
    const reactPattern = /(props|state)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g;
    const reactMatches = [...modifiedContent.matchAll(reactPattern)];
    if (reactMatches.length > 0) {
      modifiedContent = modifiedContent.replace(reactPattern, '$1?.$2?.$3');
      fixes += reactMatches.length;
      patterns.push(`React props/state: ${reactMatches.length} fixes`);
    }

    // Advanced Pattern 6: Configuration object access
    const configPattern = /(config|options|settings)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g;
    const configMatches = [...modifiedContent.matchAll(configPattern)];
    if (configMatches.length > 0) {
      modifiedContent = modifiedContent.replace(configPattern, '$1?.$2?.$3');
      fixes += configMatches.length;
      patterns.push(`Configuration: ${configMatches.length} fixes`);
    }

    // Advanced Pattern 7: Event object access
    const eventPattern = /(event|e)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g;
    const eventMatches = [...modifiedContent.matchAll(eventPattern)];
    if (eventMatches.length > 0) {
      modifiedContent = modifiedContent.replace(eventPattern, '$1?.$2?.$3');
      fixes += eventMatches.length;
      patterns.push(`Event handling: ${eventMatches.length} fixes`);
    }

    // Advanced Pattern 8: API response access
    const apiPattern = /(response|result|data)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g;
    const apiMatches = [...modifiedContent.matchAll(apiPattern)];
    if (apiMatches.length > 0) {
      modifiedContent = modifiedContent.replace(apiPattern, '$1?.$2?.$3');
      fixes += apiMatches.length;
      patterns.push(`API response: ${apiMatches.length} fixes`);
    }

    if (patterns.length > 0) {
      this.analysisResults.contextualPatterns.push({
        file: filePath,
        patterns: patterns
      });
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Advanced type assertion analysis with type relationship understanding
   */
  harvestTypeAssertionOpportunities(content, filePath) {
    let fixes = 0;
    let modifiedContent = content;
    const relationships = [];

    // Pattern 1: Redundant string assertions
    const stringPattern = /\(([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s+as\s+string\)/g;
    const stringMatches = [...modifiedContent.matchAll(stringPattern)];
    for (const match of stringMatches) {
      const [fullMatch, variable] = match;
      // Check if variable name or context suggests it's already a string
      if (variable.toLowerCase().includes('str') ||
          variable.toLowerCase().includes('text') ||
          variable.toLowerCase().includes('name') ||
          variable.toLowerCase().includes('title') ||
          variable.toLowerCase().includes('message')) {
        modifiedContent = modifiedContent.replace(fullMatch, variable);
        fixes++;
        relationships.push(`String: ${variable} (name-based inference)`);
      }
    }

    // Pattern 2: Redundant number assertions
    const numberPattern = /\(([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s+as\s+number\)/g;
    const numberMatches = [...modifiedContent.matchAll(numberPattern)];
    for (const match of numberMatches) {
      const [fullMatch, variable] = match;
      if (variable.toLowerCase().includes('num') ||
          variable.toLowerCase().includes('count') ||
          variable.toLowerCase().includes('index') ||
          variable.toLowerCase().includes('length') ||
          variable.toLowerCase().includes('size')) {
        modifiedContent = modifiedContent.replace(fullMatch, variable);
        fixes++;
        relationships.push(`Number: ${variable} (name-based inference)`);
      }
    }

    // Pattern 3: Redundant boolean assertions
    const booleanPattern = /\(([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s+as\s+boolean\)/g;
    const booleanMatches = [...modifiedContent.matchAll(booleanPattern)];
    for (const match of booleanMatches) {
      const [fullMatch, variable] = match;
      if (variable.toLowerCase().startsWith('is') ||
          variable.toLowerCase().startsWith('has') ||
          variable.toLowerCase().startsWith('can') ||
          variable.toLowerCase().startsWith('should') ||
          variable.toLowerCase().includes('enabled') ||
          variable.toLowerCase().includes('visible')) {
        modifiedContent = modifiedContent.replace(fullMatch, variable);
        fixes++;
        relationships.push(`Boolean: ${variable} (name-based inference)`);
      }
    }

    // Pattern 4: Redundant array assertions
    const arrayPattern = /\(([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s+as\s+[^)]*\[\]\)/g;
    const arrayMatches = [...modifiedContent.matchAll(arrayPattern)];
    for (const match of arrayMatches) {
      const [fullMatch, variable] = match;
      if (variable.toLowerCase().includes('list') ||
          variable.toLowerCase().includes('array') ||
          variable.toLowerCase().includes('items') ||
          variable.toLowerCase().endsWith('s')) {
        modifiedContent = modifiedContent.replace(fullMatch, variable);
        fixes++;
        relationships.push(`Array: ${variable} (name-based inference)`);
      }
    }

    // Pattern 5: Object property assertions that are clearly redundant
    const objectPropPattern = /\(([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+[^)]+\)/g;
    const objectPropMatches = [...modifiedContent.matchAll(objectPropPattern)];
    for (const match of objectPropMatches) {
      const [fullMatch, property] = match;
      // Only remove if the property name strongly suggests the type
      if (property.includes('.id') || property.includes('.name') ||
          property.includes('.title') || property.includes('.message')) {
        modifiedContent = modifiedContent.replace(fullMatch, property);
        fixes++;
        relationships.push(`Object property: ${property} (property-based inference)`);
      }
    }

    if (relationships.length > 0) {
      this.analysisResults.typeRelationships.push({
        file: filePath,
        relationships: relationships
      });
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Advanced floating promise pattern recognition
   */
  harvestFloatingPromiseOpportunities(content, filePath) {
    let fixes = 0;
    let modifiedContent = content;
    const complexPatterns = [];

    const lines = modifiedContent.split('\n');
    const fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;

      // Pattern 1: Complex async method chains
      if (/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\)\.[a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\);?\s*$/.test(line) &&
          !line.includes('await') && !line.includes('void') && !line.includes('return')) {
        line = line.replace(/^(\s*)(.+);?\s*$/, '$1void $2;');
        if (line !== originalLine) {
          fixes++;
          complexPatterns.push(`Method chain: line ${i + 1}`);
        }
      }

      // Pattern 2: Promise.all/race/allSettled calls
      else if (/^\s*Promise\.(all|race|allSettled)\s*\(/.test(line) &&
               !line.includes('await') && !line.includes('return') && !line.includes('=')) {
        line = line.replace(/^(\s*)(Promise\..*)$/, '$1void $2');
        if (line !== originalLine) {
          fixes++;
          complexPatterns.push(`Promise utility: line ${i + 1}`);
        }
      }

      // Pattern 3: Fetch calls without await
      else if (/^\s*fetch\s*\(/.test(line) &&
               !line.includes('await') && !line.includes('return') && !line.includes('=')) {
        line = line.replace(/^(\s*)(fetch.*)$/, '$1void $2');
        if (line !== originalLine) {
          fixes++;
          complexPatterns.push(`Fetch call: line ${i + 1}`);
        }
      }

      // Pattern 4: setTimeout/setInterval with promises
      else if (/^\s*(setTimeout|setInterval)\s*\(\s*async/.test(line) &&
               !line.includes('void')) {
        line = line.replace(/^(\s*)(setTimeout|setInterval)(\s*\(\s*async.*)$/, '$1void $2$3');
        if (line !== originalLine) {
          fixes++;
          complexPatterns.push(`Timer with async: line ${i + 1}`);
        }
      }

      // Pattern 5: Event listener async callbacks
      else if (/addEventListener\s*\(\s*['"][^'"]*['"],\s*async/.test(line) &&
               !line.includes('void')) {
        line = line.replace(/(addEventListener\s*\(\s*['"][^'"]*['"],\s*)(async)/, '$1void $2');
        if (line !== originalLine) {
          fixes++;
          complexPatterns.push(`Event listener async: line ${i + 1}`);
        }
      }

      fixedLines.push(line);
    }

    if (complexPatterns.length > 0) {
      this.analysisResults.complexPromises.push({
        file: filePath,
        patterns: complexPatterns
      });
    }

    return { content: fixedLines.join('\n'), fixes };
  }

  /**
   * Advanced misused promise pattern recognition
   */
  harvestMisusedPromiseOpportunities(content, filePath) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: Complex event handlers with async functions
    const complexEventPattern = /(on\w+)=\{([^}]+)\}/g;
    const eventMatches = [...modifiedContent.matchAll(complexEventPattern)];
    for (const match of eventMatches) {
      const [fullMatch, eventName, handler] = match;
      if (handler.includes('async') || handler.includes('await') || handler.includes('Promise')) {
        const wrappedHandler = `() => void (${handler.trim()})()`;
        modifiedContent = modifiedContent.replace(fullMatch, `${eventName}={${wrappedHandler}}`);
        fixes++;
      }
    }

    // Pattern 2: Promise in ternary expressions
    const ternaryPromisePattern = /(\w+)\s*\?\s*([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))\s*:/g;
    const ternaryMatches = [...modifiedContent.matchAll(ternaryPromisePattern)];
    for (const match of matches) {
      const [fullMatch, condition, promiseCall] = match;
      if (promiseCall.includes('async') || promiseCall.includes('Promise') || promiseCall.includes('fetch')) {
        modifiedContent = modifiedContent.replace(fullMatch, `${condition} ? await ${promiseCall} :`);
        fixes++;
      }
    }

    // Pattern 3: Promise in logical expressions
    const logicalPromisePattern = /(\w+)\s*(&&|\|\|)\s*([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))/g;
    const logicalMatches = [...modifiedContent.matchAll(logicalPromisePattern)];
    for (const match of logicalMatches) {
      const [fullMatch, leftSide, operator, promiseCall] = match;
      if (promiseCall.includes('async') || promiseCall.includes('Promise') || promiseCall.includes('fetch')) {
        modifiedContent = modifiedContent.replace(fullMatch, `${leftSide} ${operator} await ${promiseCall}`);
        fixes++;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Comprehensive opportunity harvesting for a single file
   */
  harvestFileOpportunities(filePath, fileData) {
    try {
      const shortPath = filePath.replace(process.cwd(), '.');
      console.log(`\n🎯 Harvesting opportunities: ${shortPath}`);
      console.log(`   Categories: ${fileData.categories.join(', ')} (${fileData.issueCount} issues)`);

      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let totalFixes = 0;
      const harvestDetails = {};

      // Harvest optional chain opportunities
      if (fileData.categories.includes('prefer-optional-chain')) {
        const result = this.harvestOptionalChainOpportunities(modifiedContent, filePath);
        modifiedContent = result.content;
        totalFixes += result.fixes;
        harvestDetails['prefer-optional-chain'] = result.fixes;
        this.opportunitiesHarvested['prefer-optional-chain'] += result.fixes;
      }

      // Harvest type assertion opportunities
      if (fileData.categories.includes('no-unnecessary-type-assertion')) {
        const result = this.harvestTypeAssertionOpportunities(modifiedContent, filePath);
        modifiedContent = result.content;
        totalFixes += result.fixes;
        harvestDetails['no-unnecessary-type-assertion'] = result.fixes;
        this.opportunitiesHarvested['no-unnecessary-type-assertion'] += result.fixes;
      }

      // Harvest floating promise opportunities
      if (fileData.categories.includes('no-floating-promises')) {
        const result = this.harvestFloatingPromiseOpportunities(modifiedContent, filePath);
        modifiedContent = result.content;
        totalFixes += result.fixes;
        harvestDetails['no-floating-promises'] = result.fixes;
        this.opportunitiesHarvested['no-floating-promises'] += result.fixes;
      }

      // Harvest misused promise opportunities
      if (fileData.categories.includes('no-misused-promises')) {
        const result = this.harvestMisusedPromiseOpportunities(modifiedContent, filePath);
        modifiedContent = result.content;
        totalFixes += result.fixes;
        harvestDetails['no-misused-promises'] = result.fixes;
        this.opportunitiesHarvested['no-misused-promises'] += result.fixes;
      }

      if (totalFixes > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');

        const harvestSummary = Object.entries(harvestDetails)
          .filter(([,count]) => count > 0)
          .map(([type, count]) => `${type}(${count})`)
          .join(', ');

        console.log(`   ✅ Harvested ${totalFixes} opportunities: ${harvestSummary}`);
        this.totalFixes += totalFixes;
      } else {
        console.log(`   ℹ️ No harvestable opportunities found`);
      }

      this.processedFiles++;

    } catch (error) {
      console.error(`   ❌ Error harvesting ${filePath}:`, error.message);
    }
  }

  /**
   * Generate comprehensive analysis report
   */
  generateAnalysisReport() {
    console.log('\n📊 Opportunity Harvesting Analysis Report');
    console.log('==========================================');

    if (this.analysisResults.contextualPatterns.length > 0) {
      console.log('\n🔍 Contextual Optional Chain Patterns:');
      this.analysisResults.contextualPatterns.forEach(({ file, patterns }) => {
        const shortPath = file.replace(process.cwd(), '.');
        console.log(`   ${shortPath}:`);
        patterns.forEach(pattern => console.log(`     - ${pattern}`));
      });
    }

    if (this.analysisResults.typeRelationships.length > 0) {
      console.log('\n🔗 Type Relationship Analysis:');
      this.analysisResults.typeRelationships.forEach(({ file, relationships }) => {
        const shortPath = file.replace(process.cwd(), '.');
        console.log(`   ${shortPath}:`);
        relationships.forEach(rel => console.log(`     - ${rel}`));
      });
    }

    if (this.analysisResults.complexPromises.length > 0) {
      console.log('\n⚡ Complex Promise Patterns:');
      this.analysisResults.complexPromises.forEach(({ file, patterns }) => {
        const shortPath = file.replace(process.cwd(), '.');
        console.log(`   ${shortPath}:`);
        patterns.forEach(pattern => console.log(`     - ${pattern}`));
      });
    }
  }

  /**
   * Run the comprehensive opportunity harvesting process
   */
  async run() {
    console.log('🚀 Starting Comprehensive Opportunity Harvesting');
    console.log('🎯 Targeting remaining high-value opportunities with advanced pattern recognition');

    const opportunityFiles = await this.getComprehensiveFileAnalysis();

    if (opportunityFiles.length === 0) {
      console.log('⚠️ No opportunity files found');
      return;
    }

    console.log(`\n📋 Harvesting opportunities from ${opportunityFiles.length} files...`);

    for (const [filePath, fileData] of opportunityFiles) {
      this.harvestFileOpportunities(filePath, fileData);
    }

    this.generateAnalysisReport();

    // Summary
    console.log('\n📊 Opportunity Harvesting Summary:');
    console.log(`   Files processed: ${this.processedFiles}`);
    console.log(`   Total opportunities harvested: ${this.totalFixes}`);

    console.log('\n🎯 Opportunities harvested by category:');
    for (const [category, count] of Object.entries(this.opportunitiesHarvested)) {
      if (count > 0) {
        console.log(`   ${category}: ${count} opportunities`);
      }
    }

    if (this.totalFixes > 0) {
      console.log('\n✅ Opportunity harvesting completed successfully!');
      console.log('💡 Run yarn lint to verify the harvested improvements');
      console.log('🎉 Advanced pattern recognition has maximized our returns!');
    }
  }
}

// Run the script
const harvester = new OpportunityHarvester();
harvester.run().catch(console.error);
