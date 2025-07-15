#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SEARCH_DIRS = ['src', 'lib'];
const ROOT_DIR = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('--check-only');

// Patterns to identify and fix
const PROBLEMATIC_PATTERNS = [
  {
    name: 'Opposing Element Mappings',
    pattern: /const\s+opposites\s*=\s*\{[^}]*fire\s*:\s*['"`]water['"`][^}]*\}/gs,
    fix: (content) => {
      return content.replace(
        /const\s+opposites\s*=\s*\{[^}]*\}/gs,
        `const complementary = {
    Fire: 'Fire',    // Fire reinforces itself
    Water: 'Water',  // Water reinforces itself
    Earth: 'Earth',  // Earth reinforces itself
    Air: 'Air'       // Air reinforces itself
  }`
      );
    }
  },
  {
    name: 'Opposing Element Functions',
    pattern: /function\s+getOppos(ing|ite)Element\s*\([^)]*\)\s*\{[^}]*\}/gs,
    fix: (content) => {
      return content.replace(
        /function\s+getOppos(ing|ite)Element\s*\([^)]*\)\s*\{[^}]*\}/gs,
        `function getComplementaryElement(element) {
  // Each element complements itself most strongly
  const complementary = {
    Fire: 'Fire',    // Fire reinforces itself
    Water: 'Water',  // Water reinforces itself
    Earth: 'Earth',  // Earth reinforces itself
    Air: 'Air'       // Air reinforces itself
  };
  return complementary[element];
}`
      );
    }
  },
  {
    name: 'Low Compatibility for Element PAirs',
    pattern: /return\s+0\.[0-3]\d*;\s*\/\/.*[Oo]ppos(ing|ite)/g,
    fix: (content) => {
      return content.replace(
        /return\s+0\.[0-3]\d*;\s*\/\/.*[Oo]ppos(ing|ite)[^}]*/g,
        'return 0.7; // All different elements have good compatibility'
      );
    }
  },
  {
    name: 'Opposing Elements Comments',
    pattern: /\/\/.*[Oo]ppos(ing|ite)\s+elements.*low\s+compatibility/gi,
    fix: (content) => {
      return content.replace(
        /\/\/.*[Oo]ppos(ing|ite)\s+elements.*low\s+compatibility/gi,
        '// All different elements have good compatibility'
      );
    }
  },
  {
    name: 'Fire-Water and Earth-Air PAiring Logic',
    pattern: /(firewater|earthAir)\s*=\s*[^;]+;/g,
    fix: (content) => {
      return content.replace(
        /(firewater|earthAir)\s*=\s*[^;]+;/g,
        (match) => {
          if (match.includes('firewater')) {
            return '// Elements are treated individually, not as opposing pAirs';
          } else {
            return '// Elements are treated individually, not as opposing pAirs';
          }
        }
      );
    }
  },
  {
    name: 'Balancing Element Logic',
    pattern: /function\s+get.*[Bb]alanc(ing|e).*Element\s*\([^)]*\)\s*\{[^}]*if\s*\([^)]*===\s*['"`]fire['"`]\)[^}]*return\s*['"`]water['"`][^}]*\}/gs,
    fix: (content) => {
      return content.replace(
        /function\s+get.*[Bb]alanc(ing|e).*Element\s*\([^)]*\)\s*\{[^}]*\}/gs,
        `function getComplementaryElement(element) {
  // Elements work best with themselves - like reinforces like
  return element;
}`
      );
    }
  },
  {
    name: 'fire-water Opposition Checks',
    pattern: /\(\s*element1\s*===\s*['"`]fire['"`]\s*&&\s*element2\s*===\s*['"`]water['"`]\s*\)\s*\|\|\s*\(\s*element1\s*===\s*['"`]water['"`]\s*&&\s*element2\s*===\s*['"`]fire['"`]\s*\)/g,
    fix: (content) => {
      return content.replace(
        /\(\s*element1\s*===\s*['"`]fire['"`]\s*&&\s*element2\s*===\s*['"`]water['"`]\s*\)\s*\|\|\s*\(\s*element1\s*===\s*['"`]water['"`]\s*&&\s*element2\s*===\s*['"`]fire['"`]\s*\)/g,
        'false // No opposing elements in our system'
      );
    }
  },
  {
    name: 'earth-Air Opposition Checks',
    pattern: /\(\s*element1\s*===\s*['"`]earth['"`]\s*&&\s*element2\s*===\s*['"`]Air['"`]\s*\)\s*\|\|\s*\(\s*element1\s*===\s*['"`]Air['"`]\s*&&\s*element2\s*===\s*['"`]earth['"`]\s*\)/g,
    fix: (content) => {
      return content.replace(
        /\(\s*element1\s*===\s*['"`]earth['"`]\s*&&\s*element2\s*===\s*['"`]Air['"`]\s*\)\s*\|\|\s*\(\s*element1\s*===\s*['"`]Air['"`]\s*&&\s*element2\s*===\s*['"`]earth['"`]\s*\)/g,
        'false // No opposing elements in our system'
      );
    }
  }
];

// File extensions to process
const VALID_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

// Function to recursively find all files
function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, and other common directories
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
        findFiles(fullPath, files);
      }
    } else if (VALID_EXTENSIONS.includes(path.extname(item))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;
    const appliedFixes = [];
    
    // Apply each pattern fix
    for (const pattern of PROBLEMATIC_PATTERNS) {
      const beforeFix = modifiedContent;
      modifiedContent = pattern.fix(modifiedContent);
      
      if (beforeFix !== modifiedContent) {
        hasChanges = true;
        appliedFixes.push(pattern.name);
      }
    }
    
    // Write changes if not in dry run mode
    if (hasChanges && !DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
    }
    
    return {
      hasChanges,
      appliedFixes,
      filePath: path.relative(ROOT_DIR, filePath)
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

// Main execution
function main() {
  console.log('🔍 Scanning for elemental logic violations...\n');
  
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No files will be modified\n');
  }
  
  const allFiles = [];
  
  // Find files in specified directories
  for (const searchDir of SEARCH_DIRS) {
    const fullSearchPath = path.join(ROOT_DIR, searchDir);
    if (fs.existsSync(fullSearchPath)) {
      findFiles(fullSearchPath, allFiles);
    }
  }
  
  console.log(`📁 Found ${allFiles.length} files to scan\n`);
  
  const results = [];
  let totalFilesWithIssues = 0;
  let totalFixesApplied = 0;
  
  // Process each file
  for (const filePath of allFiles) {
    const result = processFile(filePath);
    if (result && result.hasChanges) {
      results.push(result);
      totalFilesWithIssues++;
      totalFixesApplied += result.appliedFixes.length;
    }
  }
  
  // Report results
  console.log('📊 SCAN RESULTS:\n');
  
  if (results.length === 0) {
    console.log('✅ No elemental logic violations found!');
  } else {
    console.log(`🔧 Found violations in ${totalFilesWithIssues} files:`);
    console.log(`🛠️  Applied ${totalFixesApplied} fixes\n`);
    
    for (const result of results) {
      console.log(`📄 ${result.filePath}`);
      for (const fix of result.appliedFixes) {
        console.log(`   ✓ ${fix}`);
      }
      console.log('');
    }
  }
  
  if (DRY_RUN && results.length > 0) {
    console.log('💡 To apply these fixes, run the script without --dry-run flag');
  }
  
  console.log('\n🎯 Elemental Logic Principles:');
  console.log('   • fire reinforces fire (not opposed by water)');
  console.log('   • water reinforces water (not opposed by fire)');
  console.log('   • earth reinforces earth (not opposed by Air)');
  console.log('   • Air reinforces Air (not opposed by earth)');
  console.log('   • All element combinations have good compatibility (0.7+)');
  console.log('   • Same elements have highest compatibility (0.9)');
}

// Run the script
main(); 