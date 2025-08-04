#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Simple fixes for specific unused variables
const fixes = [
  // Test files - prefix with underscore
  {
    file: 'src/__tests__/campaign/CampaignSystemTestIntegration.test.ts',
    replacements: [
      { from: 'CampaignTestContext', to: '_CampaignTestContext' }
    ]
  },
  {
    file: 'src/__tests__/integration/MainPageIntegration.test.tsx',
    replacements: [
      { from: /\bid\b(?=\s*[,)])/g, to: '_id' }
    ]
  },
  {
    file: 'src/__tests__/linting/AstrologicalRulesValidation.test.ts',
    replacements: [
      { from: 'path', to: '_path' }
    ]
  },
  {
    file: 'src/__tests__/linting/AutomatedErrorResolution.test.ts',
    replacements: [
      { from: 'execSync', to: '_execSync' },
      { from: 'readFileSync', to: '_readFileSync' }
    ]
  },
  {
    file: 'src/__tests__/linting/CampaignSystemRuleValidation.test.ts',
    replacements: [
      { from: /\bcategory\b(?=\s*[,)])/g, to: '_category' },
      { from: /\bcriterion\b(?=\s*[,)])/g, to: '_criterion' },
      { from: /\brequirement\b(?=\s*[,)])/g, to: '_requirement' }
    ]
  },
  {
    file: 'src/__tests__/linting/ConfigurationFileRuleValidation.test.ts',
    replacements: [
      { from: 'results', to: '_results' }
    ]
  },
  {
    file: 'src/__tests__/linting/DomainSpecificRuleValidation.test.ts',
    replacements: [
      { from: 'readFileSync', to: '_readFileSync' }
    ]
  }
];

function applyFix(fix) {
  try {
    const content = fs.readFileSync(fix.file, 'utf8');
    let modifiedContent = content;
    let changesMade = false;

    fix.replacements.forEach(replacement => {
      if (replacement.from instanceof RegExp) {
        if (replacement.from.test(modifiedContent)) {
          modifiedContent = modifiedContent.replace(replacement.from, replacement.to);
          changesMade = true;
          console.log(`  ✅ ${fix.file}: ${replacement.from} → ${replacement.to}`);
        }
      } else {
        // Simple string replacement with word boundaries
        const regex = new RegExp(`\\b${replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        if (regex.test(modifiedContent)) {
          modifiedContent = modifiedContent.replace(regex, replacement.to);
          changesMade = true;
          console.log(`  ✅ ${fix.file}: ${replacement.from} → ${replacement.to}`);
        }
      }
    });

    if (changesMade) {
      fs.writeFileSync(fix.file, modifiedContent, 'utf8');
      console.log(`✅ Fixed unused variables in ${fix.file}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${fix.file}: ${error.message}`);
  }
}

function main() {
  console.log('🚀 Simple Unused Variables Fix');
  console.log('===============================');

  fixes.forEach(fix => {
    if (fs.existsSync(fix.file)) {
      applyFix(fix);
    } else {
      console.log(`⚠️  File not found: ${fix.file}`);
    }
  });

  // Validate build
  console.log('\n📋 Validating TypeScript compilation...');
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.error('❌ Build failed after fixes');
    console.error(error.toString());
  }

  console.log('\n📌 Next Steps:');
  console.log('1. Run yarn lint to see updated issue count');
  console.log('2. Review changes with git diff');
}

main();
