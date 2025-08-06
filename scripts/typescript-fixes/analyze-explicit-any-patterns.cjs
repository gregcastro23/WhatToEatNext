#!/usr/bin/env node

/**
 * Explicit Any Pattern Analysis Script
 * Analyzes patterns of explicit any usage across the codebase
 * to prepare for domain-aware type replacements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Pattern categories for explicit any usage
const PATTERNS = {
  ERROR_HANDLING: /catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g,
  FUNCTION_PARAMS: /\(([^)]*:\s*any[^)]*)\)/g,
  TYPE_ASSERTION: /as\s+any\b/g,
  PROPERTY_TYPE: /:\s*any\s*[;,\s\)]/g,
  ARRAY_TYPE: /:\s*any\[\]/g,
  PROMISE_TYPE: /Promise<[^>]*any[^>]*>/g,
  RECORD_TYPE: /Record<[^,]+,\s*any>/g,
  CALLBACK_TYPE: /\([^)]*\)\s*=>\s*any/g,
  RETURN_TYPE: /\)\s*:\s*any\s*[{\n]/g,
};

// Domain-specific patterns
const DOMAIN_PATTERNS = {
  ASTROLOGICAL: /(planet|zodiac|element|lunar|celestial|astrological).*:\s*any/gi,
  RECIPE: /(recipe|ingredient|cuisine|cooking|culinary|nutrition).*:\s*any/gi,
  CAMPAIGN: /(campaign|phase|metrics|checkpoint|progress).*:\s*any/gi,
  INTELLIGENCE: /(intelligence|prediction|analysis|recommendation).*:\s*any/gi,
  SERVICE: /(service|controller|system|integration).*:\s*any/gi,
};

class ExplicitAnyAnalyzer {
  constructor() {
    this.results = {
      totalFiles: 0,
      totalInstances: 0,
      byPattern: {},
      byDomain: {},
      byFile: {},
      topFiles: [],
      recommendations: []
    };
    
    // Initialize pattern counters
    Object.keys(PATTERNS).forEach(pattern => {
      this.results.byPattern[pattern] = { count: 0, examples: [] };
    });
    
    Object.keys(DOMAIN_PATTERNS).forEach(domain => {
      this.results.byDomain[domain] = { count: 0, examples: [] };
    });
  }

  async analyze() {
    console.log('🔍 Analyzing explicit any patterns...\n');
    
    // Get all TypeScript files
    const files = this.getTypeScriptFiles();
    this.results.totalFiles = files.length;
    
    // Analyze each file
    for (const file of files) {
      await this.analyzeFile(file);
    }
    
    // Sort and prepare top files
    this.prepareTopFiles();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Display results
    this.displayResults();
    
    // Save detailed report
    this.saveReport();
  }

  getTypeScriptFiles() {
    try {
      const output = execSync('find src -name "*.ts" -o -name "*.tsx" | grep -v node_modules', {
        encoding: 'utf-8',
        cwd: path.resolve(__dirname, '../..')
      });
      
      return output.trim().split('\n').filter(Boolean);
    } catch (error) {
      console.error('Error getting TypeScript files:', error.message);
      return [];
    }
  }

  async analyzeFile(filePath) {
    const fullPath = path.resolve(__dirname, '../..', filePath);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      
      let fileCount = 0;
      const fileExamples = [];
      
      // Check each pattern
      for (const [patternName, pattern] of Object.entries(PATTERNS)) {
        const matches = content.matchAll(pattern);
        
        for (const match of matches) {
          fileCount++;
          this.results.byPattern[patternName].count++;
          
          // Get line number
          const lineNum = this.getLineNumber(content, match.index);
          const example = {
            file: filePath,
            line: lineNum,
            code: lines[lineNum - 1].trim(),
            match: match[0]
          };
          
          // Store limited examples
          if (this.results.byPattern[patternName].examples.length < 5) {
            this.results.byPattern[patternName].examples.push(example);
          }
          
          fileExamples.push(example);
        }
      }
      
      // Check domain patterns
      for (const [domainName, pattern] of Object.entries(DOMAIN_PATTERNS)) {
        const matches = content.matchAll(pattern);
        
        for (const match of matches) {
          this.results.byDomain[domainName].count++;
          
          const lineNum = this.getLineNumber(content, match.index);
          const example = {
            file: filePath,
            line: lineNum,
            code: lines[lineNum - 1].trim(),
            match: match[0]
          };
          
          if (this.results.byDomain[domainName].examples.length < 5) {
            this.results.byDomain[domainName].examples.push(example);
          }
        }
      }
      
      if (fileCount > 0) {
        this.results.byFile[filePath] = {
          count: fileCount,
          examples: fileExamples.slice(0, 3)
        };
        this.results.totalInstances += fileCount;
      }
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  prepareTopFiles() {
    this.results.topFiles = Object.entries(this.results.byFile)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([file, data]) => ({ file, ...data }));
  }

  generateRecommendations() {
    const recs = [];
    
    // Pattern-based recommendations
    if (this.results.byPattern.ERROR_HANDLING.count > 50) {
      recs.push({
        type: 'ERROR_HANDLING',
        priority: 'HIGH',
        suggestion: 'Create standardized error types and use unknown with type guards',
        count: this.results.byPattern.ERROR_HANDLING.count
      });
    }
    
    if (this.results.byPattern.TYPE_ASSERTION.count > 100) {
      recs.push({
        type: 'TYPE_ASSERTION',
        priority: 'HIGH',
        suggestion: 'Replace "as any" with proper interface types or progressive casting',
        count: this.results.byPattern.TYPE_ASSERTION.count
      });
    }
    
    // Domain-based recommendations
    if (this.results.byDomain.ASTROLOGICAL.count > 20) {
      recs.push({
        type: 'ASTROLOGICAL',
        priority: 'MEDIUM',
        suggestion: 'Use ZodiacSign, Planet, Element, ElementalProperties from enhanced-astrology.d.ts',
        count: this.results.byDomain.ASTROLOGICAL.count
      });
    }
    
    if (this.results.byDomain.RECIPE.count > 30) {
      recs.push({
        type: 'RECIPE',
        priority: 'HIGH',
        suggestion: 'Use Recipe, Ingredient, EnhancedRecipe from unified.ts',
        count: this.results.byDomain.RECIPE.count
      });
    }
    
    if (this.results.byDomain.CAMPAIGN.count > 20) {
      recs.push({
        type: 'CAMPAIGN',
        priority: 'MEDIUM',
        suggestion: 'Use CampaignPhase, ProgressMetrics, SafetyEvent from campaign.ts',
        count: this.results.byDomain.CAMPAIGN.count
      });
    }
    
    this.results.recommendations = recs;
  }

  displayResults() {
    console.log('📊 EXPLICIT ANY ANALYSIS RESULTS\n');
    console.log(`Total Files Analyzed: ${this.results.totalFiles}`);
    console.log(`Total Any Instances: ${this.results.totalInstances}\n`);
    
    console.log('📈 BY PATTERN:');
    console.log('─'.repeat(60));
    for (const [pattern, data] of Object.entries(this.results.byPattern)) {
      if (data.count > 0) {
        console.log(`${pattern.padEnd(20)} ${data.count.toString().padStart(6)} instances`);
      }
    }
    
    console.log('\n🎯 BY DOMAIN:');
    console.log('─'.repeat(60));
    for (const [domain, data] of Object.entries(this.results.byDomain)) {
      if (data.count > 0) {
        console.log(`${domain.padEnd(20)} ${data.count.toString().padStart(6)} instances`);
      }
    }
    
    console.log('\n📁 TOP 10 FILES:');
    console.log('─'.repeat(60));
    this.results.topFiles.slice(0, 10).forEach(({ file, count }) => {
      console.log(`${count.toString().padStart(4)} - ${file}`);
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('─'.repeat(60));
    this.results.recommendations.forEach(rec => {
      console.log(`[${rec.priority}] ${rec.type}: ${rec.suggestion} (${rec.count} instances)`);
    });
    
    console.log('\n');
  }

  saveReport() {
    const reportPath = path.join(__dirname, 'explicit-any-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📝 Detailed report saved to: ${reportPath}`);
    
    // Also save examples file
    const examplesPath = path.join(__dirname, 'explicit-any-examples.md');
    const examplesContent = this.generateExamplesMarkdown();
    fs.writeFileSync(examplesPath, examplesContent);
    console.log(`📝 Examples saved to: ${examplesPath}`);
  }

  generateExamplesMarkdown() {
    let content = '# Explicit Any Usage Examples\n\n';
    
    content += '## Pattern Examples\n\n';
    for (const [pattern, data] of Object.entries(this.results.byPattern)) {
      if (data.examples.length > 0) {
        content += `### ${pattern}\n\n`;
        data.examples.forEach(ex => {
          content += `- **${ex.file}:${ex.line}**\n`;
          content += `  \`\`\`typescript\n  ${ex.code}\n  \`\`\`\n\n`;
        });
      }
    }
    
    content += '## Domain Examples\n\n';
    for (const [domain, data] of Object.entries(this.results.byDomain)) {
      if (data.examples.length > 0) {
        content += `### ${domain}\n\n`;
        data.examples.forEach(ex => {
          content += `- **${ex.file}:${ex.line}**\n`;
          content += `  \`\`\`typescript\n  ${ex.code}\n  \`\`\`\n\n`;
        });
      }
    }
    
    return content;
  }
}

// Run analyzer
const analyzer = new ExplicitAnyAnalyzer();
analyzer.analyze().catch(console.error);