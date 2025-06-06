import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getAllScripts() {
  const scripts = {};
  const scriptsDirs = [
    'ingredient-scripts',
    'typescript-fixes', 
    'syntax-fixes',
    'elemental-fixes',
    'cleanup-scripts',
    'cuisine-fixes',
    'uncategorized'
  ];
  
  for (const dir of scriptsDirs) {
    const dirPath = path.resolve(ROOT_DIR, 'scripts', dir);
    
    if (await fileExists(dirPath)) {
      const files = await fs.readdir(dirPath);
      scripts[dir] = files.filter(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.mjs'));
    }
  }
  
  return scripts;
}

async function updateQuickReference() {
  const content = `# Fix Scripts Quick Reference

## 🚀 Most Commonly Used Scripts

### Build & Syntax Issues
\`\`\`bash
# Fix remaining syntax errors
node scripts/syntax-fixes/fix-remaining-syntax-errors.js --dry-run

# Fix TypeScript errors  
node scripts/typescript-fixes/fix-duplicate-identifiers-systematic.js --dry-run
\`\`\`

### Elemental Logic Issues (CRITICAL)
\`\`\`bash
# Fix elemental logic violations (elements treated as opposites)
node scripts/elemental-fixes/fix-elemental-logic.js --dry-run

# Fix casing conventions for elements/planets/signs
node scripts/elemental-fixes/fix-casing-conventions.js --dry-run
\`\`\`

### Import/Export Issues
\`\`\`bash
# Fix ingredient imports
node scripts/ingredient-scripts/fix-all-ingredient-imports.js --dry-run

# Fix API usage issues
node scripts/typescript-fixes/fix-astrologize-api-usage.js --dry-run
\`\`\`

## 📂 Script Categories

### TypeScript Fixes
- **fix-ingredient-type.ts** - Fix ingredient type definitions
- **fix-planetary-types.ts** - Fix planetary type definitions  
- **fix-promise-awaits.ts** - Fix async/await patterns
- **fix-season-types.ts** - Fix seasonal type definitions
- **fixTypeInconsistencies.ts** - Fix general type inconsistencies
- **updateCookingMethodTypes.ts** - Update cooking method types

### Syntax Fixes
- **fixZodiacSignLiterals.ts** - Fix zodiac sign literal types

### Ingredient Scripts
- **fixIngredientMappings.ts** - Fix ingredient mapping issues

### Elemental Fixes
- **fix-elemental-logic.js** - Fix elemental opposition logic
- **fix-casing-conventions.js** - Fix element/planet/sign casing

### Cleanup Scripts
- Various cleanup and maintenance scripts

## 🔧 Usage Patterns

### Always Test First
\`\`\`bash
# Always run with --dry-run first
node scripts/category/script-name.js --dry-run

# Review changes
git diff

# Apply if satisfied
node scripts/category/script-name.js
\`\`\`

### Build Verification
\`\`\`bash
# After running fixes, always test build
yarn build
\`\`\`

## 📋 Project-Specific Notes

- **Use yarn, not npm**
- **Elements are NOT opposites** (Fire doesn't oppose Water)
- **All scripts support --dry-run mode**
- **No backup files are created** (use git for version control)
- **Always run yarn build after fixes**
`;

  await fs.writeFile(path.resolve(ROOT_DIR, 'scripts', 'QUICK_REFERENCE.md'), content);
  console.log('✅ Updated QUICK_REFERENCE.md');
}

async function updateInventory() {
  const scripts = await getAllScripts();
  
  let content = `# Scripts Inventory

## 📊 Current Script Organization

`;

  for (const [category, files] of Object.entries(scripts)) {
    if (files.length === 0) continue;
    
    content += `### ${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
    content += `**Location**: \`scripts/${category}/\`\n\n`;
    
    files.forEach(file => {
      content += `- **${file}**\n`;
    });
    content += '\n';
  }

  content += `## 📈 Statistics

`;

  const totalFiles = Object.values(scripts).reduce((sum, files) => sum + files.length, 0);
  content += `- **Total organized scripts**: ${totalFiles}\n`;
  content += `- **Categories**: ${Object.keys(scripts).length}\n`;
  
  for (const [category, files] of Object.entries(scripts)) {
    if (files.length > 0) {
      content += `- **${category}**: ${files.length} files\n`;
    }
  }

  content += `
## 🔍 Recently Cleaned Up

- Deleted 12 obsolete TypeScript scripts (261.9KB saved)
- Moved all scripts from \`src/scripts/\` to organized \`scripts/\` directory
- Fixed syntax errors in remaining scripts
- Categorized scripts by functionality

## 📝 Notes

- All scripts support \`--dry-run\` mode
- Scripts use ES modules (\`import\`/\`export\`)
- No backup files are created
- TypeScript scripts are validated for syntax errors
`;

  await fs.writeFile(path.resolve(ROOT_DIR, 'scripts', 'INVENTORY.md'), content);
  console.log('✅ Updated INVENTORY.md');
}

async function main() {
  console.log('📝 Updating script documentation...\n');
  
  try {
    await updateQuickReference();
    await updateInventory();
    
    console.log('\n🎉 Documentation updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating documentation:', error);
    process.exit(1);
  }
}

main(); 