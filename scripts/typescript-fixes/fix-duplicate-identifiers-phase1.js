#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { glob } from 'glob';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔧 Fix Duplicate Identifiers Phase 1${DRY_RUN ? ' (DRY RUN)' : ''}`);
console.log('Targeting: Element, AstrologicalState, ElementalProperties duplicates\n');

// Track fixes
let totalFixesMade = 0;
const fixedFiles = [];

/**
 * Fix duplicate imports in a file
 */
function fixDuplicateImports(filePath, content) {
  let fixes = 0;
  let newContent = content;
  
  // Track what we've imported to avoid duplicates
  const importTracker = new Map();
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip if not an import line
    if (!trimmed.startsWith('import ')) {
      newLines.push(line);
      continue;
    }
    
    // Extract import details
    const importMatch = line.match(/import\s*\{([^}]+)\}\s*from\s*['"`]([^'"`]+)['"`]/);
    if (!importMatch) {
      newLines.push(line);
      continue;
    }
    
    const [, imports, fromPath] = importMatch;
    const importList = imports.split(',').map(imp => imp.trim());
    
    // Check for duplicates
    const key = `${fromPath}:${importList.join(',')}`;
    if (importTracker.has(key)) {
      // Skip duplicate import
      fixes++;
      console.log(`  ❌ Duplicate import removed: ${trimmed}`);
      continue;
    }
    
    importTracker.set(key, true);
    newLines.push(line);
  }
  
  if (fixes > 0) {
    return {
      content: newLines.join('\n'),
      fixes
    };
  }
  
  return { content, fixes: 0 };
}

/**
 * Fix specific duplicate identifier patterns
 */
function fixSpecificDuplicates(filePath, content) {
  let fixes = 0;
  let newContent = content;
  
  // Common problematic duplicate import patterns
  const duplicatePatterns = [
    // Element duplicates
    {
      pattern: /import\s*\{\s*Element\s*\}\s*from\s*['"`][^'"`]*types\/alchemy['"`][\s\S]*?import\s*\{\s*Element\s*\}\s*from\s*['"`][^'"`]*types\/celestial['"`]/g,
      replacement: "import { Element } from '../types/celestial'",
      description: 'Element type duplicate imports'
    },
    
    // AstrologicalState duplicates  
    {
      pattern: /import\s*\{\s*AstrologicalState\s*\}\s*from\s*['"`][^'"`]*types\/alchemy['"`][\s\S]*?import\s*\{\s*AstrologicalState\s*\}\s*from\s*['"`][^'"`]*types\/celestial['"`]/g,
      replacement: "import { AstrologicalState } from '../types/celestial'",
      description: 'AstrologicalState duplicate imports'
    },
    
    // ElementalProperties duplicates
    {
      pattern: /import\s*\{\s*ElementalProperties\s*\}\s*from\s*['"`][^'"`]*types\/alchemy['"`][\s\S]*?import\s*\{\s*ElementalProperties\s*\}\s*from\s*['"`][^'"`]*types\/celestial['"`]/g,
      replacement: "import { ElementalProperties } from '../types/celestial'",  
      description: 'ElementalProperties duplicate imports'
    }
  ];
  
  for (const { pattern, replacement, description } of duplicatePatterns) {
    const matches = newContent.match(pattern);
    if (matches) {
      newContent = newContent.replace(pattern, replacement);
      fixes += matches.length;
      console.log(`  ✓ Fixed ${description}: ${matches.length} instances`);
    }
  }
  
  return { content: newContent, fixes };
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  if (!existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return 0;
  }
  
  const originalContent = readFileSync(filePath, 'utf8');
  let { content, fixes } = fixDuplicateImports(filePath, originalContent);
  
  // Apply specific duplicate fixes
  const specificResult = fixSpecificDuplicates(filePath, content);
  content = specificResult.content;
  fixes += specificResult.fixes;
  
  if (fixes > 0) {
    console.log(`📝 ${filePath}: ${fixes} fixes`);
    
    if (!DRY_RUN) {
      writeFileSync(filePath, content, 'utf8');
    }
    
    fixedFiles.push(filePath);
    return fixes;
  }
  
  return 0;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Target files with known duplicate identifier issues
    const patterns = [
      'src/**/*.ts',
      'src/**/*.tsx', 
      'pages/**/*.tsx',
      'src/__tests__/**/*.ts'
    ];
    
    const allFiles = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { ignore: ['node_modules/**'] });
      allFiles.push(...files);
    }
    
    console.log(`Found ${allFiles.length} files to process\n`);
    
    // Process files
    for (const file of allFiles) {
      const fixes = await processFile(file);
      totalFixesMade += fixes;
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`Files processed: ${allFiles.length}`);
    console.log(`Files modified: ${fixedFiles.length}`);
    console.log(`Total fixes: ${totalFixesMade}`);
    
    if (DRY_RUN) {
      console.log('\n⚠️  DRY RUN - No changes were made');
      console.log('Run without --dry-run to apply fixes');
    } else if (totalFixesMade > 0) {
      console.log('\n✅ Fixes applied successfully');
      console.log('Run "yarn tsc --noEmit" to check remaining errors');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default { processFile, fixDuplicateImports, fixSpecificDuplicates }; 