#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = process.cwd();
const SEARCH_DIRS = ['src', 'lib'];
const EXCLUDED_DIRS = ['node_modules', '.next', 'dist', 'build'];
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Patterns to search for that indicate problematic elemental logic
const PROBLEMATIC_PATTERNS = [
  // Opposing elements patterns
  {
    pattern: /const opposites\s*=\s*{[^}]*Fire:\s*['"]Water['"][^}]*Water:\s*['"]Fire['"][^}]*}/s,
    description: 'Elements defined as opposites',
    fixType: 'opposites'
  },
  {
    pattern: /const opposites\s*=\s*{[^}]*Earth:\s*['"]Air['"][^}]*Air:\s*['"]Earth['"][^}]*}/s,
    description: 'Elements defined as opposites',
    fixType: 'opposites'
  },
  // Opposing or "balancing" elements logic
  {
    pattern: /if\s*\(\s*element1\s*===\s*['"]Fire['"]\s*&&\s*element2\s*===\s*['"]Water['"]\s*\)\s*{\s*return\s*[0-9.]+;/,
    description: 'Fire and Water treated as opposing',
    fixType: 'elementComparison'
  },
  {
    pattern: /if\s*\(\s*element1\s*===\s*['"]Earth['"]\s*&&\s*element2\s*===\s*['"]Air['"]\s*\)\s*{\s*return\s*[0-9.]+;/,
    description: 'Earth and Air treated as opposing',
    fixType: 'elementComparison'
  },
  // TypeScript element comparison logic
  {
    pattern: /\/\/\s*Opposing elements with low compatibility/,
    description: 'TypeScript opposing elements logic',
    fixType: 'tsElementComparison'
  },
  // Function that gets "opposing" elements
  {
    pattern: /getOpposingElement|getOpposingElements/,
    description: 'Function that gets opposing elements',
    fixType: 'functionName'
  },
  // "Balancing" elements patterns
  {
    pattern: /function getBalancingElement[^{]*{(?![\s\S]*?\/\/\s*Elements work best with themselves[\s\S]*?return element)/,
    description: 'Function that gets "balancing" elements',
    fixType: 'balancing'
  },
  // Fire/Water Earth/Air pairings
  {
    pattern: /const fireWater|const earthAir|fireWater.*=|earthAir.*=/,
    description: 'Fire/Water and Earth/Air treated as pairs',
    fixType: 'elementPairs'
  }
];

// Fixes for different types of problematic code
const FIXES = {
  // Fix functions that return opposing elements
  opposites: {
    find: /const opposites\s*=\s*{[^}]*Fire:\s*['"]Water['"][^}]*Water:\s*['"]Fire['"][^}]*Earth:\s*['"]Air['"][^}]*Air:\s*['"]Earth['"][^}]*}/s,
    replace: `const complementary = {
      Fire: 'Fire', // Fire reinforces itself
      Water: 'Water', // Water reinforces itself
      Earth: 'Earth', // Earth reinforces itself
      Air: 'Air' // Air reinforces itself
    }`
  },
  // Fix elemental comparison logic
  elementComparison: {
    find: /(if\s*\(\s*element1\s*===\s*element2\s*\)[^}]*})\s*(\/\/.*\n)?\s*(if\s*\(\s*(?:\([^)]*\)\s*\|\|\s*)*\([^)]*\)\s*\)[^}]*})\s*(.*?)(?=\s*return)/s,
    replace: `$1
    
  // All different elements have good compatibility
  // Each element brings its own unique qualities
  `
  },
  // Fix TypeScript-specific element comparison logic
  tsElementComparison: {
    find: /\/\/\s*Opposing elements with low compatibility\s*\n\s*if\s*\(\s*(?:\([^)]*\)\s*\|\|\s*)*\([^)]*\)\s*\)\s*{\s*return\s*[0-9.]+;\s*\/\/\s*Opposing elements have low compatibility\s*}/s,
    replace: `// All different elements have good compatibility
  // Each element brings its own unique qualities
  if (element1 !== element2) {
    return 0.7; // Different elements have good compatibility
  }`
  },
  // Fix function names that imply elements oppose each other
  functionName: {
    find: /getOpposingElements?/g,
    replace: 'getComplementaryElements'
  },
  // Fix "balancing" elements logic to reinforce that elements work best with themselves
  balancing: {
    find: /function getBalancingElement[^{]*{[^}]*}/s,
    replace: `function getBalancingElement(element) {
  // Elements work best with themselves - reinforcing the current energy
  return element;
}`
  },
  // Fix element pair logic
  elementPairs: {
    find: /const fireWater[^;]*;.*?const earthAir[^;]*;/s,
    replace: `// Each element is valuable individually
// No need to combine elements into pairs`
  }
};

// Find all target files
function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        results = results.concat(findFiles(fullPath));
      }
    } else {
      const ext = path.extname(file);
      if (FILE_EXTENSIONS.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  
  return results;
}

// Check file for problematic patterns
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  for (const pattern of PROBLEMATIC_PATTERNS) {
    if (pattern.pattern.test(content)) {
      issues.push({
        filePath,
        description: pattern.description,
        fixType: pattern.fixType
      });
    }
  }
  
  return issues;
}

// Fix file based on identified issues
function fixFile(filePath, issues) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;
  
  for (const issue of issues) {
    const fix = FIXES[issue.fixType];
    if (fix) {
      const newContent = content.replace(fix.find, fix.replace);
      if (newContent !== content) {
        content = newContent;
        fixed = true;
      }
    }
  }
  
  if (fixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Fix if elements are treated as pairs in elemental calculations
function fixElementalCalculations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for calculateElemental* functions that have logic that needs fixing
  if (content.includes('function calculateElemental') && 
      (content.includes('opposites') || content.includes('opposing'))) {
    
    // Define the replacement - treating each element on its own merit
    const newContent = content.replace(
      /(function calculateElemental[^{]*{)([^}]*)}/s, 
      (match, funcSig, body) => {
        // Fix body to treat elements individually
        const newBody = body
          .replace(/if\s*\([^)]*opposing[^)]*\)[^}]*}/gs, '')
          .replace(/\/\/\s*Opposing elements.*\n/g, '')
          .replace(/const opposites[^;]*;\n/g, '');
          
        return `${funcSig}
  // Each element is valuable on its own
  // Elements are not opposed to each other
  ${newBody}
}`;
      }
    );
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
  }
  
  return false;
}

// Main function
function main() {
  let targetDirs = [];
  
  for (const dir of SEARCH_DIRS) {
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
      targetDirs.push(fullPath);
    }
  }
  
  // Find and check all files
  let allFiles = [];
  for (const dir of targetDirs) {
    allFiles = allFiles.concat(findFiles(dir));
  }
  
  console.log(`Scanning ${allFiles.length} files for problematic elemental logic...`);
  
  // Find issues
  let allIssues = [];
  for (const file of allFiles) {
    const issues = checkFile(file);
    if (issues.length > 0) {
      allIssues = allIssues.concat(issues);
    }
  }
  
  console.log(`Found ${allIssues.length} issues in ${new Set(allIssues.map(i => i.filePath)).size} files.`);
  
  // Fix issues
  let fixedFiles = 0;
  const fileIssues = {};
  
  for (const issue of allIssues) {
    if (!fileIssues[issue.filePath]) {
      fileIssues[issue.filePath] = [];
    }
    fileIssues[issue.filePath].push(issue);
  }
  
  for (const [filePath, issues] of Object.entries(fileIssues)) {
    console.log(`\nFixing issues in ${filePath}:`);
    issues.forEach(issue => console.log(` - ${issue.description}`));
    
    const wasFixed = fixFile(filePath, issues) || fixElementalCalculations(filePath);
    if (wasFixed) {
      fixedFiles++;
      console.log(` ✓ File fixed`);
    } else {
      console.log(` ⚠ Unable to automatically fix - may need manual review`);
    }
  }
  
  console.log('\nSummary:');
  console.log(`- Scanned ${allFiles.length} files`);
  console.log(`- Found ${allIssues.length} issues in ${Object.keys(fileIssues).length} files`);
  console.log(`- Fixed ${fixedFiles} files`);
  
  if (fixedFiles < Object.keys(fileIssues).length) {
    console.log(`- ${Object.keys(fileIssues).length - fixedFiles} files may need manual review`);
  }
}

// Run the script
main(); 