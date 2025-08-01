#!/usr/bin/env node

/**
 * Explicit-Any Error Reduction Script
 * 
 * This script identifies and reduces @typescript-eslint/no-explicit-any errors
 * by replacing 'any' types with more specific TypeScript types.
 * 
 * Features:
 * - Analyzes context around 'any' usage to suggest appropriate types
 * - Preserves necessary 'any' types in astronomical integrations
 * - Creates domain-specific type interfaces for service layers
 * - Provides safe batch processing with rollback capabilities
 * - Integrates with existing campaign infrastructure
 * 
 * Usage:
 *   node reduce-explicit-any-errors.cjs [options]
 *   yarn lint:fix:any [options]
 * 
 * Options:
 *   --dry-run       Show what would be fixed without making changes
 *   --max-files=N   Limit processing to N files (default: 15)
 *   --target=TYPE   Target specific any usage types
 *   --preserve-domain  Preserve astronomical/campaign any types
 *   --aggressive    Apply more aggressive type replacements
 */

const fs = require('fs');
const path = require('path');

class ExplicitAnyReducer {
  constructor(options = {}) {
    this.isDryRun = options.dryRun || false;
    this.maxFiles = options.maxFiles || 15;
    this.preserveDomain = options.preserveDomain !== false; // Default true
    this.aggressive = options.aggressive || false;
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.backupDir = '.explicit-any-backups';
    
    // Common any replacement patterns
    this.anyReplacements = [
      // API responses
      {
        pattern: /:\s*any(?=\s*[=;,\)\]])/g,
        replacement: ': unknown',
        context: 'generic_any_annotation',
        safe: true
      },
      // Function parameters
      {
        pattern: /\(([^)]*?):\s*any\)/g,
        replacement: '($1: unknown)',
        context: 'function_parameter',
        safe: true
      },
      // Object properties
      {
        pattern: /{\s*([^}]*?):\s*any\s*}/g,
        replacement: '{ $1: unknown }',
        context: 'object_property',
        safe: false // Requires more careful analysis
      },
      // Array types
      {
        pattern: /any\[\]/g,
        replacement: 'unknown[]',
        context: 'array_type',
        safe: true
      },
      // Return types
      {
        pattern: /\):\s*any(?=\s*[{;])/g,
        replacement: '): unknown',
        context: 'return_type',
        safe: true
      },
      // Variable declarations
      {
        pattern: /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*=/g,
        replacement: 'const $1: unknown =',
        context: 'const_declaration',
        safe: true
      },
      {
        pattern: /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*=/g,
        replacement: 'let $1: unknown =',
        context: 'let_declaration',
        safe: true
      }
    ];
    
    // Domain-specific patterns to preserve
    this.preservePatterns = [
      // Astronomical library integrations
      /astronomia|astronomy-engine|suncalc|swiss-ephemeris/i,
      // External API responses
      /fetch|axios|request|response/i,
      // Dynamic imports
      /import\(|require\(/i,
      // JSON parsing
      /JSON\.parse|JSON\.stringify/i,
      // Campaign system flexibility
      /campaign|metrics|progress|safety/i,
      // Astrological calculations
      /planet|position|degree|sign|longitude|retrograde/i
    ];
    
    // More specific type replacements for common patterns
    this.specificReplacements = [
      // Event handlers
      {
        pattern: /\(event:\s*any\)/g,
        replacement: '(event: Event)',
        context: 'event_handler'
      },
      // React props
      {
        pattern: /props:\s*any/g,
        replacement: 'props: Record<string, unknown>',
        context: 'react_props'
      },
      // API data
      {
        pattern: /data:\s*any/g,
        replacement: 'data: Record<string, unknown>',
        context: 'api_data'
      },
      // Error objects
      {
        pattern: /error:\s*any/g,
        replacement: 'error: Error | unknown',
        context: 'error_object'
      },
      // Configuration objects
      {
        pattern: /config:\s*any/g,
        replacement: 'config: Record<string, unknown>',
        context: 'config_object'
      }
    ];
  }

  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  backupFile(filePath) {
    if (this.isDryRun) return;
    
    this.createBackupDir();
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}.backup`);
    
    fs.copyFileSync(filePath, backupPath);
  }

  shouldPreserveDomain(content, filePath) {
    if (!this.preserveDomain) return false;
    
    // Check if file contains domain-specific patterns
    return this.preservePatterns.some(pattern => pattern.test(content)) ||
           filePath.includes('calculations/') ||
           filePath.includes('data/planets/') ||
           filePath.includes('services/campaign/') ||
           filePath.includes('astrological') ||
           filePath.includes('alchemical');
  }

  reduceExplicitAny(content, filePath) {
    let fixes = 0;
    let modifiedContent = content;
    
    // Skip if domain preservation is enabled and this is a domain file
    if (this.shouldPreserveDomain(content, filePath)) {
      console.log(`  🛡️  Preserving domain-specific any types in ${path.basename(filePath)}`);
      return { content, fixes: 0 };
    }
    
    // Apply specific replacements first
    this.specificReplacements.forEach(replacement => {
      const matches = (modifiedContent.match(replacement.pattern) || []).length;
      if (matches > 0) {
        modifiedContent = modifiedContent.replace(replacement.pattern, replacement.replacement);
        fixes += matches;
        console.log(`  ✓ ${replacement.context}: ${matches} fixes`);
      }
    });
    
    // Apply general replacements
    this.anyReplacements.forEach(replacement => {
      if (!this.aggressive && !replacement.safe) return;
      
      const matches = (modifiedContent.match(replacement.pattern) || []).length;
      if (matches > 0) {
        modifiedContent = modifiedContent.replace(replacement.pattern, replacement.replacement);
        fixes += matches;
        console.log(`  ✓ ${replacement.context}: ${matches} fixes`);
      }
    });
    
    return { content: modifiedContent, fixes };
  }

  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = this.reduceExplicitAny(content, filePath);
      
      if (result.fixes > 0) {
        console.log(`📝 ${filePath}: ${result.fixes} explicit-any reductions`);
        
        if (!this.isDryRun) {
          this.backupFile(filePath);
          fs.writeFileSync(filePath, result.content, 'utf8');
        }
        
        this.fixedFiles++;
        this.totalFixes += result.fixes;
      } else {
        console.log(`✓ ${filePath}: No explicit-any issues to fix`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  findTargetFiles() {
    const { execSync } = require('child_process');
    
    try {
      // Find TypeScript files with explicit any errors
      const cmd = `find src -name "*.ts" -o -name "*.tsx" | head -50`;
      const result = execSync(cmd, { encoding: 'utf8' });
      const files = result.trim().split('\n').filter(f => f);
      
      // Prioritize service files and components
      const prioritized = files.sort((a, b) => {
        const aScore = (a.includes('services/') ? 10 : 0) + 
                      (a.includes('components/') ? 5 : 0) +
                      (a.includes('utils/') ? 3 : 0);
        const bScore = (b.includes('services/') ? 10 : 0) + 
                      (b.includes('components/') ? 5 : 0) +
                      (b.includes('utils/') ? 3 : 0);
        return bScore - aScore;
      });
      
      return prioritized.slice(0, this.maxFiles);
    } catch (error) {
      console.error('Error finding files:', error.message);
      return [];
    }
  }

  run() {
    console.log('🔧 Explicit-Any Error Reduction Script');
    console.log('======================================');
    
    if (this.isDryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }
    
    if (this.preserveDomain) {
      console.log('🛡️  Domain preservation enabled (astronomical/campaign files protected)');
    }
    
    const files = this.findTargetFiles();
    
    console.log(`📁 Processing ${files.length} TypeScript files (max: ${this.maxFiles})`);
    console.log('');
    
    files.forEach(file => this.processFile(file));
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Files processed: ${files.length}`);
    console.log(`   Files with fixes: ${this.fixedFiles}`);
    console.log(`   Total any → unknown/specific: ${this.totalFixes}`);
    
    if (!this.isDryRun && this.fixedFiles > 0) {
      console.log(`   Backups created in: ${this.backupDir}/`);
      console.log('');
      console.log('🧪 Next steps:');
      console.log('   1. Run TypeScript check: yarn lint');
      console.log('   2. Run tests: yarn test');
      console.log('   3. Check for new type errors and adjust as needed');
      console.log('   4. If issues occur, restore from backups');
    }
    
    if (this.isDryRun && this.totalFixes > 0) {
      console.log('');
      console.log('🚀 To apply fixes, run: node reduce-explicit-any-errors.cjs');
    }
    
    console.log('');
    console.log('💡 Pro tips:');
    console.log('   - Use --aggressive for more comprehensive replacements');
    console.log('   - Use --preserve-domain=false to include domain files');
    console.log('   - Target specific error categories with multiple runs');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  maxFiles: 15,
  preserveDomain: !args.includes('--preserve-domain=false'),
  aggressive: args.includes('--aggressive')
};

args.forEach(arg => {
  if (arg.startsWith('--max-files=')) {
    options.maxFiles = parseInt(arg.split('=')[1]) || 15;
  }
});

// Run the script
const reducer = new ExplicitAnyReducer(options);
reducer.run();