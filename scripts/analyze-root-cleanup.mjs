#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');

console.log(`🔍 Root Directory Cleanup Analysis ${DRY_RUN ? '(DRY RUN)' : ''}`);
console.log('=' .repeat(60));

// File categorization rules
const categories = {
  // Keep - Essential project files
  essential: [
    'package.json',
    'yarn.lock',
    'README.md',
    'tsconfig.json',
    'next.config.js',
    'jest.config.js',
    'eslint.config.cjs',
    'postcss.config.cjs',
    'jsconfig.json',
    'next-env.d.ts',
    'global.d.ts',
    'jest-dom.d.ts',
    '.gitignore',
    '.gitattributes',
    '.npmrc',
    '.nvmrc',
    '.prettierrc',
    '.yarnrc',
    'astro.config.mjs',
    'tailwind.config.js',
    'jest.setup.js',
    'tsconfig.jest.json',
    'CONTRIBUTING.md',
    '.env.local'
  ],

  // Move to docs/ - Documentation files
  documentation: [
    'DOCUMENTATION_INDEX.md',
    'PRODUCTION_DEPLOYMENT_GUIDE.md',
    'PROJECT_STATUS.md',
    'PHASE_8_PERFORMANCE_OPTIMIZATION_COMPLETE.md',
    'PHASE_4_FLAVOR_AUDIT_REPORT.md',
    'PHASE_9_SUMMARY.md',
    'PHASE_9_CONSOLIDATION_COMPLETE.md',
    'DATA_CONSOLIDATION_PLAN.md',
    'DATA_CONSOLIDATION_SUMMARY.md',
    'COMPONENTS_CONSOLIDATION_PROMPT.md',
    'CONTEXT_CONSOLIDATION_SUMMARY.md',
    'hooks-consolidation-summary.md',
    'hooks-consolidation-README.md',
    'hooks-consolidation-plan.md',
    'types-consolidation-README.md',
    'types-consolidation-plan.md',
    'constants-consolidation-summary.md',
    'service-consolidation-summary.md',
    'KALCHM_MONICA_DEBUG_ENHANCEMENT.md',
    'COOKING_METHOD_MONICA_IMPLEMENTATION_COMPLETE.md',
    'CUISINE_KALCHM_IMPLEMENTATION_COMPLETE.md',
    'typescript-error-analysis-summary.md',
    'typescript-fixes.md',
    'typescript-fix-scripts-README.md',
    'typescript-fix-progress.md',
    'typescript-error-fix-plan.md',
    'LINTING.md',
    'NEW_CHAT_PROMPT.md',
    'README-ChakraSystem.md',
    'elemental-fixing-tools.md',
    'elemental-principles-guide.md',
    'error-plan.md',
    'readme.txt'
  ],

  // Move to scripts/ - Utility and test scripts
  scripts: [
    'test-phase8-performance-simple.mjs',
    'test-phase8-performance.mjs',
    'test-unified-flavor-basic.mjs',
    'test-unified-flavor-engine.mjs',
    'simple-enhanced-test.mjs',
    'test-enhanced-ingredients-system.mjs',
    'test-unified-systems-integration.mjs',
    'debug-cuisine-error.mjs',
    'fix-test-imports.mjs',
    'fix-import-extensions.mjs',
    'test-unified-nutritional-system.mjs',
    'test-unified-recipe-building.mjs',
    'test-unified-cuisine-integration.mjs',
    'validate-seasonal-consolidation.mjs',
    'test-seasonal-simple.mjs',
    'test-unified-seasonal.mjs',
    'test-cooking-method-monica.mjs',
    'test-unified-cuisines.mjs',
    'test-unified-recipes.mjs',
    'test-kalchm-integration.mjs',
    'fix-elemental-logic.js',
    'cleanup-duplicates-and-corruption.js',
    'fix-corrupted-imports.js',
    'safe-test-cleanup.js',
    'cleanup-remaining-corrupted-files.js',
    'restore-abbreviated-files.js',
    'audit-abbreviated-files.js',
    'final-cuisine-cleanup.js',
    'restore-cuisine-data.js',
    'analyze-typescript-errors.js',
    'compare-fixers.js',
    'validate-ts-file.js',
    'test-script.js',
    'cuisine-fixer.js',
    'simple-fix.js',
    'build-script.js',
    'cleanup-backups.sh',
    'cleanup-root-duplicates.sh',
    'find-unused-files.sh',
    'fix.sh',
    'install.sh',
    'migrate-contexts.sh',
    'push_changes.sh',
    'push_retry.sh',
    'push_script.sh',
    'react-version-fix.js',
    'server-fix.js',
    'update-imports.sh',
    'test-elemental-logic.js',
    'test-recommendations.js',
    'test-recommendations.mjs',
    'analyze-root-cleanup.mjs'
  ],

  // Delete - Temporary/obsolete files
  delete: [
    'tsconfig.tsbuildinfo',
    'tsconfig.check.tsbuildinfo',
    'tsconfig.check.json',
    'types-consolidation-report.json',
    'ingredient-consolidation-results.json',
    'ingredient-analysis-results.json',
    'test-jsx-errors.tsx',
    'tmp-recipe-id.tsx',
    'App.tsx',
    '.DS_Store',
    '.eslintrc.js.old',
    'eslint.config.mjs', // Duplicate of eslint.config.cjs
    'next.config.mjs', // Duplicate of next.config.js
    'module-resolver.config.js',
    'package.json-scripts',
    'page_output.html',
    'paths.js',
    'terminal',
    'index.js'
  ],

  // Move to patches/ - Git patches
  patches: [
    '0001-Enhanced-ingredient-cards-to-display-culinary-proper.patch',
    '0001-Improve-cooking-method-and-ingredient-recommendation.patch'
  ],

  // Directories to clean up
  directories: {
    delete: [
      'backup-20250526-193619',
      'duplicate-backup-20250526-194143',
      'types-backup',
      'test-output',
      'ingredient-recommender-fixes',
      'test-scripts',
      'lint-reports'
    ]
  }
};

// Analyze current root directory
function analyzeRootDirectory() {
  const files = fs.readdirSync('.').filter(item => {
    const stat = fs.statSync(item);
    return stat.isFile();
  });

  const dirs = fs.readdirSync('.').filter(item => {
    const stat = fs.statSync(item);
    return stat.isDirectory() && !item.startsWith('.') && !['node_modules', 'src', 'public', 'pages', 'data', 'docs', 'scripts'].includes(item);
  });

  console.log('\n📊 ANALYSIS RESULTS:');
  console.log('-'.repeat(40));

  // Categorize files
  const categorized = {
    essential: [],
    documentation: [],
    scripts: [],
    patches: [],
    delete: [],
    uncategorized: []
  };

  files.forEach(file => {
    let found = false;
    for (const [category, fileList] of Object.entries(categories)) {
      if (category !== 'directories' && fileList.includes(file)) {
        categorized[category].push(file);
        found = true;
        break;
      }
    }
    if (!found) {
      categorized.uncategorized.push(file);
    }
  });

  // Display categorization
  Object.entries(categorized).forEach(([category, files]) => {
    if (files.length > 0) {
      console.log(`\n${category.toUpperCase()} (${files.length} files):`);
      files.forEach(file => {
        const size = fs.statSync(file).size;
        const sizeStr = size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)}MB` : 
                       size > 1024 ? `${(size / 1024).toFixed(1)}KB` : `${size}B`;
        console.log(`  • ${file} (${sizeStr})`);
      });
    }
  });

  // Display directories to clean
  console.log(`\nDIRECTORIES TO DELETE (${categories.directories.delete.length}):`);
  categories.directories.delete.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`  • ${dir}/`);
    }
  });

  return { categorized, dirs: categories.directories.delete };
}

// Execute cleanup actions
function executeCleanup(analysis) {
  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN - No files will be moved or deleted');
    return;
  }

  console.log('\n🚀 EXECUTING CLEANUP...');

  // Ensure target directories exist
  ['docs', 'scripts', 'patches'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}/`);
    }
  });

  // Move documentation files
  analysis.categorized.documentation.forEach(file => {
    if (fs.existsSync(file)) {
      const target = path.join('docs', file);
      fs.renameSync(file, target);
      console.log(`📄 Moved ${file} → docs/${file}`);
    }
  });

  // Move script files
  analysis.categorized.scripts.forEach(file => {
    if (fs.existsSync(file)) {
      const target = path.join('scripts', file);
      fs.renameSync(file, target);
      console.log(`🔧 Moved ${file} → scripts/${file}`);
    }
  });

  // Move patch files
  analysis.categorized.patches.forEach(file => {
    if (fs.existsSync(file)) {
      const target = path.join('patches', file);
      fs.renameSync(file, target);
      console.log(`🩹 Moved ${file} → patches/${file}`);
    }
  });

  // Delete obsolete files
  analysis.categorized.delete.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️  Deleted ${file}`);
    }
  });

  // Delete obsolete directories
  analysis.dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`🗑️  Deleted directory ${dir}/`);
    }
  });
}

// Main execution
try {
  const analysis = analyzeRootDirectory();
  
  console.log('\n📋 SUMMARY:');
  console.log(`  Essential files: ${analysis.categorized.essential.length}`);
  console.log(`  Documentation to move: ${analysis.categorized.documentation.length}`);
  console.log(`  Scripts to move: ${analysis.categorized.scripts.length}`);
  console.log(`  Patches to move: ${analysis.categorized.patches.length}`);
  console.log(`  Files to delete: ${analysis.categorized.delete.length}`);
  console.log(`  Directories to delete: ${analysis.dirs.length}`);
  console.log(`  Uncategorized: ${analysis.categorized.uncategorized.length}`);

  if (analysis.categorized.uncategorized.length > 0) {
    console.log('\n⚠️  UNCATEGORIZED FILES (need manual review):');
    analysis.categorized.uncategorized.forEach(file => console.log(`  • ${file}`));
  }

  if (!DRY_RUN) {
    console.log('\n❓ Proceed with cleanup? (This will move/delete files)');
    console.log('   Run with --dry-run first to preview changes');
  }

  executeCleanup(analysis);

  console.log('\n✅ Analysis complete!');
  if (DRY_RUN) {
    console.log('   Run without --dry-run to execute cleanup');
  }

} catch (error) {
  console.error('❌ Error during analysis:', error.message);
  process.exit(1);
} 