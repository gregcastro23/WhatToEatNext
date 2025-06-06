#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Fixes for export definitions and remaining syntax issues
const exportDefinitionFixes = [
  {
    file: 'src/contexts/ChartContext/provider.tsx',
    fixes: [
      {
        // Fix the missing closing brace and structure around return statement
        search: /<\/svg>`\s*\};\s*\};\s*useEffect/s,
        replace: '</svg>`\n    };\n  };\n\n  useEffect'
      }
    ]
  },
  {
    file: 'src/data/ingredients/herbs/index.ts',
    fixes: [
      {
        // Fix malformed export statement in herbs
        search: /export \{ freshHerbs,\s*driedHerbs, \};\s*aromaticHerbs \};\s*medicinalHerbs\s*\};/s,
        replace: 'export {\n  freshHerbs,\n  driedHerbs,\n  aromaticHerbs,\n  medicinalHerbs\n};'
      },
      {
        // Add placeholder definitions for herbs
        search: /\/\/ To ensure we're exporting all available herbs, explicitly export each collection/,
        replace: `// Placeholder herb category definitions (TODO: Import from individual files)
const freshHerbs = {};
const driedHerbs = {};
const aromaticHerbs = {};
const medicinalHerbs = {};

// To ensure we're exporting all available herbs, explicitly export each collection`
      }
    ]
  }
];

// Simple function to comment out problematic exports temporarily
const temporaryExportComments = [
  {
    file: 'src/data/ingredients/fruits/index.ts',
    fixes: [
      {
        // Comment out the export of undefined variables
        search: /export \{ citrus,\s*berries,\s*tropical,\s*stoneFruit,\s*pome,\s*melons \};/,
        replace: '// export { citrus, berries, tropical, stoneFruit, pome, melons }; // TODO: Add placeholder definitions'
      }
    ]
  },
  {
    file: 'src/data/ingredients/grains/index.ts',
    fixes: [
      {
        // Comment out the export of undefined variables
        search: /export \{ wholeGrains,\s*refinedGrains,\s*pseudoGrains \};/,
        replace: '// export { wholeGrains, refinedGrains, pseudoGrains }; // TODO: Add placeholder definitions'
      }
    ]
  }
];

async function applyExportDefinitionFixes() {
  let totalChangesApplied = 0;
  let filesModified = 0;

  // Apply the export definition fixes
  for (const fileConfig of exportDefinitionFixes) {
    const filePath = fileConfig.file;
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      let modifiedContent = content;
      let fileChanges = 0;

      for (const fix of fileConfig.fixes) {
        const beforeLength = modifiedContent.length;
        modifiedContent = modifiedContent.replace(fix.search, fix.replace);
        
        if (modifiedContent.length !== beforeLength || modifiedContent !== content) {
          fileChanges++;
          totalChangesApplied++;
        }
      }

      if (fileChanges > 0) {
        filesModified++;
        
        if (DRY_RUN) {
          log(`[DRY RUN] Would apply ${fileChanges} fixes to ${filePath}`, 'yellow');
        } else {
          await fs.writeFile(filePath, modifiedContent, 'utf8');
          log(`✓ Applied ${fileChanges} fixes to ${filePath}`, 'green');
        }
      } else {
        log(`• No changes needed for ${filePath}`, 'blue');
      }

    } catch (error) {
      log(`✗ Error processing ${filePath}: ${error.message}`, 'red');
    }
  }

  // Apply temporary export comments
  for (const fileConfig of temporaryExportComments) {
    const filePath = fileConfig.file;
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      let modifiedContent = content;
      let fileChanges = 0;

      for (const fix of fileConfig.fixes) {
        const beforeLength = modifiedContent.length;
        modifiedContent = modifiedContent.replace(fix.search, fix.replace);
        
        if (modifiedContent.length !== beforeLength || modifiedContent !== content) {
          fileChanges++;
          totalChangesApplied++;
        }
      }

      if (fileChanges > 0) {
        filesModified++;
        
        if (DRY_RUN) {
          log(`[DRY RUN] Would comment out problematic exports in ${filePath}`, 'yellow');
        } else {
          await fs.writeFile(filePath, modifiedContent, 'utf8');
          log(`✓ Commented out problematic exports in ${filePath}`, 'green');
        }
      } else {
        log(`• No export comments needed for ${filePath}`, 'blue');
      }

    } catch (error) {
      log(`✗ Error processing ${filePath}: ${error.message}`, 'red');
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log(`Export Definition Fixes Summary:`, 'cyan');
  log(`Files processed: ${exportDefinitionFixes.length + temporaryExportComments.length}`, 'blue');
  log(`Files modified: ${filesModified}`, 'green');
  log(`Total fixes applied: ${totalChangesApplied}`, 'green');
  
  if (DRY_RUN) {
    log('\nThis was a dry run. Run without --dry-run to apply changes.', 'yellow');
  } else {
    log('\nRun "yarn build" to test the fixes!', 'green');
  }
}

// Run the script
applyExportDefinitionFixes().catch(error => {
  log(`Script failed: ${error.message}`, 'red');
  process.exit(1);
}); 