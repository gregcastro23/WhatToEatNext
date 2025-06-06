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

// Specific fixes for build-blocking syntax errors
const buildBlockingFixes = [
  {
    file: 'src/contexts/ChartContext/provider.tsx',
    fixes: [
      {
        // Fix missing closing brace in houseEffects object literal
        search: /const houseEffects: \{ \[key: string\]: number \} = \{ Fire: 0, Water: 0, Earth: 0, Air: 0$/m,
        replace: 'const houseEffects: { [key: string]: number } = { Fire: 0, Water: 0, Earth: 0, Air: 0 };'
      },
      {
        // Fix missing closing brace for calculateStelliums function
        search: /return stelliums;\s*$/m,
        replace: 'return stelliums;\n  };'
      },
      {
        // Fix missing closing brace for calculateHouseEffects function
        search: /return houseEffects;\s*$/m,
        replace: 'return houseEffects;\n  };'
      },
      {
        // Fix missing closing brace for getElementFromSign function
        search: /return '';\s*$/m,
        replace: "return '';\n  };"
      },
      {
        // Fix missing closing brace in try-catch block
        search: /setLoading\(false\);\s*\}\s*$/m,
        replace: 'setLoading(false);\n    }\n  };'
      },
      {
        // Fix missing closing brace in createChartSvg function
        search: /stroke-width="1"\/>\s*<text x="150" y="150" text-anchor="middle">Loading Chart Data\.\.\.<\/text>\s*<\/svg>`\s*$/m,
        replace: 'stroke-width="1"/>\n          <text x="150" y="150" text-anchor="middle">Loading Chart Data...</text>\n        </svg>`\n      };\n    }'
      },
      {
        // Fix missing closing brace in planet data object
        search: /exactLongitude: data\.exactLongitude \|\| 0 \};\s*$/m,
        replace: 'exactLongitude: data.exactLongitude || 0\n      };\n    });'
      },
      {
        // Fix missing closing brace in SVG template
        search: /<\/svg>`\s*$/m,
        replace: '</svg>`\n    };\n  };'
      }
    ]
  },
  {
    file: 'src/data/cooking/methods/dry/index.ts',
    fixes: [
      {
        // Fix malformed export statement
        search: /export \{ baking,\s*roasting,\s*frying,\s*stirFrying, \};\s*grilling, broiling  \};\s*\/\/ broiling \};/s,
        replace: 'export {\n  baking,\n  roasting,\n  frying,\n  stirFrying,\n  grilling,\n  broiling\n};'
      },
      {
        // Fix object literal in dryCookingMethods
        search: /export const dryCookingMethods = \{ baking,\s*roasting,\s*frying,\s*stir_frying: stirFrying,\s*grilling,\s*broiling,\s*\/\/ Add other cooking methods as they are implemented\s*\/\/ broiling \};/s,
        replace: 'export const dryCookingMethods = {\n  baking,\n  roasting,\n  frying,\n  stir_frying: stirFrying,\n  grilling,\n  broiling\n  // Add other cooking methods as they are implemented\n};'
      }
    ]
  },
  {
    file: 'src/data/cooking/methods/traditional/index.ts',
    fixes: [
      {
        // Fix missing closing brace in traditionalCookingMethods object
        search: /export const traditionalCookingMethods = \{\s*fermentation,\s*pickling,\s*\/\/ Add other cooking methods as they are implemented\s*\/\/ smoking,\s*\/\/ curing\s*$/m,
        replace: 'export const traditionalCookingMethods = {\n  fermentation,\n  pickling\n  // Add other cooking methods as they are implemented\n  // smoking,\n  // curing\n};'
      },
      {
        // Fix malformed export statement
        search: /export \{ fermentation, \};\s*pickling, \/\/ smoking  \};\s*\/\/ curing/s,
        replace: 'export {\n  fermentation,\n  pickling\n  // smoking,\n  // curing\n};'
      }
    ]
  },
  {
    file: 'src/data/cooking/index.ts',
    fixes: [
      {
        // Fix missing closing brace for getAstrologicalEffect function
        search: /return Math\.max\(0\.0, Math\.min\(1\.0, effectScore\)\);\s*$/m,
        replace: 'return Math.max(0.0, Math.min(1.0, effectScore));\n};'
      },
      {
        // Fix missing closing brace for calculateModifiedElementalEffect function
        search: /return baseEffect;\s*$/m,
        replace: 'return baseEffect;\n};'
      },
      {
        // Fix missing closing brace in CookingState interface
        search: /techniques\?: string\[\];\s*$/m,
        replace: 'techniques?: string[];\n  };\n}'
      },
      {
        // Fix malformed export statement
        search: /export \{ allCookingMethods,\s*dryCookingMethods,\s*wetCookingMethods, \};\s*molecularCookingMethods, traditionalCookingMethods, rawCookingMethods \};/s,
        replace: 'export {\n  allCookingMethods,\n  dryCookingMethods,\n  wetCookingMethods,\n  molecularCookingMethods,\n  traditionalCookingMethods,\n  rawCookingMethods\n};'
      }
    ]
  },
  {
    file: 'src/data/cooking/methods/index.ts',
    fixes: [
      {
        // Fix missing closing brace for getMethodsForZodiacSign function
        search: /\.reduce\(\(acc, \[key, value\]\) => \(\{ \.\.\.acc, \[key\]: value \}\), \{\}\);\s*$/m,
        replace: '.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});\n};'
      },
      {
        // Fix malformed export statement
        search: /export \{ dryCookingMethods,\s*wetCookingMethods,\s*molecularCookingMethods, \};\s*traditionalCookingMethods, rawCookingMethods, transformationMethods \};/s,
        replace: 'export {\n  dryCookingMethods,\n  wetCookingMethods,\n  molecularCookingMethods,\n  traditionalCookingMethods,\n  rawCookingMethods,\n  transformationMethods\n};'
      }
    ]
  }
];

async function applyBuildBlockingFixes() {
  let totalChangesApplied = 0;
  let filesModified = 0;

  for (const fileConfig of buildBlockingFixes) {
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

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log(`Build Blocking Syntax Fixes Summary:`, 'cyan');
  log(`Files processed: ${buildBlockingFixes.length}`, 'blue');
  log(`Files modified: ${filesModified}`, 'green');
  log(`Total fixes applied: ${totalChangesApplied}`, 'green');
  
  if (DRY_RUN) {
    log('\nThis was a dry run. Run without --dry-run to apply changes.', 'yellow');
  } else {
    log('\nRun "yarn build" to test the fixes!', 'green');
  }
}

// Run the script
applyBuildBlockingFixes().catch(error => {
  log(`Script failed: ${error.message}`, 'red');
  process.exit(1);
}); 