import fs from 'fs';
import path from 'path';

const isDryRun = process.argv.includes('--dry-run');

const fixes = [
  // MethodsRecommender.tsx - Fix JSX expression syntax
  {
    file: 'src/components/MethodsRecommender.tsx',
    replacements: [
      {
        search: '({methods || []).map((method) => (',
        replace: '{(methods || []).map((method) => ('
      },
      {
        search: '({technicalTips || []).map((tip, index) => (',
        replace: '{(technicalTips || []).map((tip, index) => ('
      },
      {
        search: '({idealIngredients || []).map((ingredient, index) => (',
        replace: '{(idealIngredients || []).map((ingredient, index) => ('
      }
    ]
  },
  
  // IngredientRecommender.tsx - Fix malformed conditional expressions
  {
    file: 'src/components/recommendations/IngredientRecommender.tsx',
    replacements: [
      {
        search: '(Array.isArray((lowercaseName) ? (lowercaseName.includes(\'pepper\') : (lowercaseName === \'pepper\') &&',
        replace: '(lowercaseName.includes(\'pepper\') &&'
      },
      {
        search: '({comparisonIngredients || []).map(ingredient => {',
        replace: '{(comparisonIngredients || []).map(ingredient => {'
      },
      {
        search: '({displayedItems || []).map((item) => (',
        replace: '{(displayedItems || []).map((item) => ('
      },
      {
        search: '({ingredients || []).length > (displayedItems || []).length',
        replace: '(ingredients || []).length > (displayedItems || []).length'
      },
      {
        search: 'See ({ingredients || []).length - (displayedItems || []).length} more',
        replace: 'See {(ingredients || []).length - (displayedItems || []).length} more'
      },
      {
        search: 'if (Array.isArray((normalized1) ? (normalized1.includes(normalized2) : (normalized1 === normalized2) || (Array.isArray(normalized2) ? normalized2.includes(normalized1) : normalized2 === normalized1)) {',
        replace: 'if ((normalized1.includes && normalized1.includes(normalized2)) || (normalized1 === normalized2) || (normalized2.includes && normalized2.includes(normalized1)) || (normalized2 === normalized1)) {'
      }
    ]
  },
  
  // TarotFoodDisplay.tsx - Fix property access syntax
  {
    file: 'src/components/TarotFoodDisplay.tsx',
    replacements: [
      {
        search: 'Object.keys(tarotCards.(planetaryCards)? || [])',
        replace: 'Object.keys(tarotCards.planetaryCards || [])'
      },
      {
        search: 'Object.entries(tarotCards.(planetaryCards)? || [])',
        replace: 'Object.entries(tarotCards.planetaryCards || [])'
      }
    ]
  },
  
  // _app.tsx - Fix event property access syntax
  {
    file: 'src/pages/_app.tsx',
    replacements: [
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'chrome\')  : message === \'chrome\')',
        replace: 'event.message && event.message.includes(\'chrome\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'tabs\')  : message === \'tabs\')',
        replace: 'event.message && event.message.includes(\'tabs\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'Cannot read properties of undefined\')  : message === \'Cannot read properties of undefined\')',
        replace: 'event.message && event.message.includes(\'Cannot read properties of undefined\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'lockdown\')  : message === \'lockdown\')',
        replace: 'event.message && event.message.includes(\'lockdown\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'Removing unpermitted intrinsics\')  : message === \'Removing unpermitted intrinsics\')',
        replace: 'event.message && event.message.includes(\'Removing unpermitted intrinsics\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'popup\')  : message === \'popup\')',
        replace: 'event.message && event.message.includes(\'popup\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'viewer.js\')  : message === \'viewer.js\')',
        replace: 'event.message && event.message.includes(\'viewer.js\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'Assignment to constant variable\')  : message === \'Assignment to constant variable\')',
        replace: 'event.message && event.message.includes(\'Assignment to constant variable\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'chrome.tabs\')  : message === \'chrome.tabs\')',
        replace: 'event.message && event.message.includes(\'chrome.tabs\')'
      },
      {
        search: 'event.(Array.isArray(message) ? message.includes(\'extension\')  : message === \'extension\')',
        replace: 'event.message && event.message.includes(\'extension\')'
      }
    ]
  }
];

console.log(`🔧 ${isDryRun ? '[DRY RUN] ' : ''}Fixing JSX and JavaScript syntax errors...`);

let totalFixesApplied = 0;

for (const fix of fixes) {
  const filePath = fix.file;
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixesApplied = 0;
  
  for (const replacement of fix.replacements) {
    if (content.includes(replacement.search)) {
      content = content.replace(new RegExp(replacement.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.replace);
      fileFixesApplied++;
      totalFixesApplied++;
      
      if (isDryRun) {
        console.log(`    ✓ Would fix: ${replacement.search.substring(0, 50)}...`);
      }
    }
  }
  
  if (fileFixesApplied > 0) {
    console.log(`📝 ${isDryRun ? '[DRY RUN] ' : ''}${filePath}: ${fileFixesApplied} fixes applied`);
    
    if (!isDryRun) {
      fs.writeFileSync(filePath, content);
    }
  } else {
    console.log(`✅ ${filePath}: No fixes needed`);
  }
}

console.log(`\n🎯 ${isDryRun ? '[DRY RUN] ' : ''}Summary: ${totalFixesApplied} total syntax fixes ${isDryRun ? 'would be' : 'were'} applied`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply these fixes');
} else {
  console.log('\n✅ All syntax errors fixed! Run yarn tsc --noemit to verify.');
} 