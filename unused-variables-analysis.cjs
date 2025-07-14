#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Analysis patterns for unused variables
const patterns = {
  imports: /^import\s+(?:(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*)\s+from\s+['"][^'"]*['"];?$/gm,
  constDeclarations: /^(?:export\s+)?const\s+(\w+)(?:\s*:\s*[^=]+)?\s*=\s*[^;]+;?$/gm,
  letDeclarations: /^(?:export\s+)?let\s+(\w+)(?:\s*:\s*[^=]+)?\s*=\s*[^;]+;?$/gm,
  varDeclarations: /^(?:export\s+)?var\s+(\w+)(?:\s*:\s*[^=]+)?\s*=\s*[^;]+;?$/gm,
  functionDeclarations: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/gm,
  arrowFunctions: /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=>]+)?\s*=>\s*/gm,
  interfaces: /^(?:export\s+)?interface\s+(\w+)\s*(?:<[^>]*>)?\s*\{/gm,
  types: /^(?:export\s+)?type\s+(\w+)(?:\s*<[^>]*>)?\s*=\s*/gm,
  enums: /^(?:export\s+)?enum\s+(\w+)\s*\{/gm,
  classes: /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s*<[^>]*>)?\s*(?:extends\s+[^{]+)?\s*(?:implements\s+[^{]+)?\s*\{/gm,
  destructuredImports: /import\s+\{([^}]+)\}\s+from\s+['"][^'"]*['"];?/gm,
  defaultImports: /import\s+(\w+)\s+from\s+['"][^'"]*['"];?/gm,
  namespaceImports: /import\s+\*\s+as\s+(\w+)\s+from\s+['"][^'"]*['"];?/gm,
  
  // Additional patterns for unused variables
  unusedPrefix: /^(?:const|let|var)\s+_(\w+)/gm,
  commentedOut: /\/\/.*(?:const|let|var)\s+(\w+)/gm,
  
  // React-specific patterns
  reactImports: /import\s+React(?:\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"];?/gm,
  reactHooks: /import\s+\{[^}]*\}\s+from\s+['"]react['"];?/gm,
  
  // Next.js specific patterns
  nextImports: /import\s+[^}]*\s+from\s+['"]next\/[^'"]*['"];?/gm,
  
  // Type-only imports
  typeImports: /import\s+type\s+[^}]*\s+from\s+['"][^'"]*['"];?/gm
};

// Function to extract all declared variables from a file
function extractDeclarations(content) {
  const declarations = new Set();
  
  // Extract imports
  const importMatches = content.match(patterns.imports) || [];
  importMatches.forEach(match => {
    // Extract individual imports from destructured imports
    const destructuredMatch = match.match(/\{([^}]+)\}/);
    if (destructuredMatch) {
      const imports = destructuredMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim());
      imports.forEach(imp => declarations.add(imp));
    }
    
    // Extract default imports
    const defaultMatch = match.match(/import\s+(\w+)\s+from/);
    if (defaultMatch) {
      declarations.add(defaultMatch[1]);
    }
    
    // Extract namespace imports
    const namespaceMatch = match.match(/import\s+\*\s+as\s+(\w+)\s+from/);
    if (namespaceMatch) {
      declarations.add(namespaceMatch[1]);
    }
  });
  
  // Extract const declarations
  let match;
  const constRegex = /(?:^|\n)(?:export\s+)?const\s+(\w+)(?:\s*:\s*[^=]+)?\s*=/gm;
  while ((match = constRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  // Extract let declarations
  const letRegex = /(?:^|\n)(?:export\s+)?let\s+(\w+)(?:\s*:\s*[^=]+)?\s*=/gm;
  while ((match = letRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  // Extract var declarations
  const varRegex = /(?:^|\n)(?:export\s+)?var\s+(\w+)(?:\s*:\s*[^=]+)?\s*=/gm;
  while ((match = varRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  // Extract function declarations
  const funcRegex = /(?:^|\n)(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm;
  while ((match = funcRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  // Extract arrow functions
  const arrowRegex = /(?:^|\n)(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=>]+)?\s*=>/gm;
  while ((match = arrowRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  // Extract interfaces
  const interfaceRegex = /(?:^|\n)(?:export\s+)?interface\s+(\w+)(?:\s*<[^>]*>)?\s*\{/gm;
  while ((match = interfaceRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  // Extract types
  const typeRegex = /(?:^|\n)(?:export\s+)?type\s+(\w+)(?:\s*<[^>]*>)?\s*=/gm;
  while ((match = typeRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  // Extract enums
  const enumRegex = /(?:^|\n)(?:export\s+)?enum\s+(\w+)\s*\{/gm;
  while ((match = enumRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  // Extract classes
  const classRegex = /(?:^|\n)(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s*<[^>]*>)?\s*/gm;
  while ((match = classRegex.exec(content)) !== null) {
    declarations.add(match[1]);
  }
  
  return Array.from(declarations);
}

// Function to check if a variable is used in the content
function isVariableUsed(variable, content) {
  // Remove the declaration line to avoid false positives
  const withoutDeclaration = content.replace(
    new RegExp(`(?:^|\\n)(?:export\\s+)?(?:const|let|var|interface|type|enum|class|function)\\s+${variable}(?:\\s*[:=<(]|\\s*\\{).*?(?:\\n|$)`, 'gm'),
    ''
  );
  
  // Check for usage patterns
  const usagePatterns = [
    new RegExp(`\\b${variable}\\b`, 'g'), // Any word boundary usage
    new RegExp(`\\$\\{${variable}\\}`, 'g'), // Template literal usage
    new RegExp(`"[^"]*\\b${variable}\\b[^"]*"`, 'g'), // String usage
    new RegExp(`'[^']*\\b${variable}\\b[^']*'`, 'g'), // String usage
    new RegExp(`\\[${variable}\\]`, 'g'), // Array/object access
    new RegExp(`\\.${variable}\\b`, 'g'), // Property access
    new RegExp(`${variable}\\.`, 'g'), // Method call
    new RegExp(`\\(${variable}\\)`, 'g'), // Function parameter
    new RegExp(`\\{${variable}\\}`, 'g'), // Destructuring
    new RegExp(`\\<${variable}\\>`, 'g'), // Generic type usage
    new RegExp(`implements\\s+${variable}\\b`, 'g'), // Interface implementation
    new RegExp(`extends\\s+${variable}\\b`, 'g'), // Class extension
    new RegExp(`instanceof\\s+${variable}\\b`, 'g'), // instanceof check
    new RegExp(`typeof\\s+${variable}\\b`, 'g'), // typeof check
    new RegExp(`\\s${variable}\\s*\\(`, 'g'), // Function call
    new RegExp(`\\s${variable}\\s*\\[`, 'g'), // Array access
    new RegExp(`\\s${variable}\\s*\\.`, 'g'), // Property access
    new RegExp(`\\s${variable}\\s*=`, 'g'), // Assignment (but not declaration)
    new RegExp(`=\\s*${variable}\\b`, 'g'), // Assignment right side
    new RegExp(`\\bof\\s+${variable}\\b`, 'g'), // for...of loop
    new RegExp(`\\bin\\s+${variable}\\b`, 'g'), // for...in loop
    new RegExp(`\\breturn\\s+${variable}\\b`, 'g'), // return statement
    new RegExp(`\\bthrow\\s+${variable}\\b`, 'g'), // throw statement
    new RegExp(`\\byield\\s+${variable}\\b`, 'g'), // yield statement
    new RegExp(`\\bawait\\s+${variable}\\b`, 'g'), // await statement
    new RegExp(`\\bnew\\s+${variable}\\b`, 'g'), // constructor call
    new RegExp(`\\bcase\\s+${variable}\\b`, 'g'), // switch case
    new RegExp(`\\bcatch\\s*\\(${variable}\\)`, 'g'), // catch block
    new RegExp(`\\?\\s*${variable}\\b`, 'g'), // ternary operator
    new RegExp(`\\:\\s*${variable}\\b`, 'g'), // ternary operator or object property
    new RegExp(`\\bif\\s*\\(.*\\b${variable}\\b.*\\)`, 'g'), // if condition
    new RegExp(`\\bwhile\\s*\\(.*\\b${variable}\\b.*\\)`, 'g'), // while condition
    new RegExp(`\\bfor\\s*\\(.*\\b${variable}\\b.*\\)`, 'g'), // for loop
    new RegExp(`\\bswitch\\s*\\(.*\\b${variable}\\b.*\\)`, 'g'), // switch statement
  ];
  
  return usagePatterns.some(pattern => pattern.test(withoutDeclaration));
}

// Function to analyze a single file
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const declarations = extractDeclarations(content);
    const unused = [];
    
    declarations.forEach(variable => {
      // Skip variables that are intentionally prefixed with underscore
      if (variable.startsWith('_')) {
        return;
      }
      
      // Skip common React/Next.js variables that might appear unused
      if (['React', 'Component', 'Fragment', 'useState', 'useEffect', 'useCallback', 'useMemo', 'useContext', 'useReducer', 'useRef', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue', 'NextPage', 'GetServerSideProps', 'GetStaticProps', 'GetStaticPaths'].includes(variable)) {
        return;
      }
      
      if (!isVariableUsed(variable, content)) {
        unused.push(variable);
      }
    });
    
    return {
      filePath,
      totalDeclarations: declarations.length,
      unusedCount: unused.length,
      unusedVariables: unused,
      unusedRatio: declarations.length > 0 ? unused.length / declarations.length : 0
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return {
      filePath,
      totalDeclarations: 0,
      unusedCount: 0,
      unusedVariables: [],
      unusedRatio: 0,
      error: error.message
    };
  }
}

// Function to find all TypeScript/JavaScript files
function findTSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && !['node_modules', 'dist', 'build', '__tests__', 'coverage'].includes(item)) {
        files.push(...findTSFiles(fullPath));
      }
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
      files.push(fullPath);
    }
  });
  
  return files;
}

// Main analysis function
function analyzeProject() {
  const srcDir = path.join(__dirname, 'src');
  console.log('🔍 Analyzing project for unused variables...\n');
  
  const files = findTSFiles(srcDir);
  console.log(`Found ${files.length} TypeScript/JavaScript files\n`);
  
  const results = [];
  
  files.forEach((file, index) => {
    if (index % 50 === 0) {
      console.log(`Progress: ${index}/${files.length} files analyzed`);
    }
    
    const result = analyzeFile(file);
    results.push(result);
  });
  
  // Sort by unused count (descending)
  results.sort((a, b) => b.unusedCount - a.unusedCount);
  
  // Generate report
  console.log('\n📊 UNUSED VARIABLES ANALYSIS REPORT\n');
  console.log('=' * 50);
  
  // Summary statistics
  const totalFiles = results.length;
  const filesWithUnused = results.filter(r => r.unusedCount > 0).length;
  const totalUnused = results.reduce((sum, r) => sum + r.unusedCount, 0);
  const totalDeclarations = results.reduce((sum, r) => sum + r.totalDeclarations, 0);
  
  console.log(`📈 SUMMARY STATISTICS`);
  console.log(`Total files analyzed: ${totalFiles}`);
  console.log(`Files with unused variables: ${filesWithUnused} (${((filesWithUnused / totalFiles) * 100).toFixed(1)}%)`);
  console.log(`Total unused variables: ${totalUnused}`);
  console.log(`Total declarations: ${totalDeclarations}`);
  console.log(`Overall unused ratio: ${((totalUnused / totalDeclarations) * 100).toFixed(1)}%`);
  console.log('');
  
  // Top 10 files with most unused variables
  console.log('🏆 TOP 10 FILES WITH MOST UNUSED VARIABLES\n');
  console.log('Rank | File | Unused Count | Total Declarations | Unused Ratio');
  console.log('-'.repeat(80));
  
  results.slice(0, 10).forEach((result, index) => {
    const relativeFile = result.filePath.replace(process.cwd() + '/', '');
    const ratio = (result.unusedRatio * 100).toFixed(1);
    console.log(`${(index + 1).toString().padEnd(4)} | ${relativeFile.slice(0, 40).padEnd(40)} | ${result.unusedCount.toString().padEnd(12)} | ${result.totalDeclarations.toString().padEnd(18)} | ${ratio}%`);
  });
  
  console.log('');
  
  // Detailed breakdown of top 10
  console.log('🔍 DETAILED BREAKDOWN OF TOP 10 FILES\n');
  
  results.slice(0, 10).forEach((result, index) => {
    const relativeFile = result.filePath.replace(process.cwd() + '/', '');
    console.log(`${index + 1}. ${relativeFile}`);
    console.log(`   Unused variables (${result.unusedCount}): ${result.unusedVariables.join(', ')}`);
    console.log(`   Total declarations: ${result.totalDeclarations}`);
    console.log(`   Unused ratio: ${(result.unusedRatio * 100).toFixed(1)}%`);
    console.log('');
  });
  
  // Files with highest unused ratios
  const highRatioFiles = results.filter(r => r.unusedRatio > 0.5 && r.unusedCount > 3).sort((a, b) => b.unusedRatio - a.unusedRatio);
  
  if (highRatioFiles.length > 0) {
    console.log('⚠️  FILES WITH HIGH UNUSED RATIOS (>50% and >3 unused variables)\n');
    console.log('File | Unused Count | Total Declarations | Unused Ratio');
    console.log('-'.repeat(80));
    
    highRatioFiles.slice(0, 10).forEach(result => {
      const relativeFile = result.filePath.replace(process.cwd() + '/', '');
      const ratio = (result.unusedRatio * 100).toFixed(1);
      console.log(`${relativeFile.slice(0, 50).padEnd(50)} | ${result.unusedCount.toString().padEnd(12)} | ${result.totalDeclarations.toString().padEnd(18)} | ${ratio}%`);
    });
    console.log('');
  }
  
  // Category analysis
  console.log('📂 CATEGORY ANALYSIS\n');
  
  const categories = {
    'Components': results.filter(r => r.filePath.includes('/components/')),
    'Services': results.filter(r => r.filePath.includes('/services/')),
    'Utils': results.filter(r => r.filePath.includes('/utils/')),
    'Types': results.filter(r => r.filePath.includes('/types/')),
    'Data': results.filter(r => r.filePath.includes('/data/')),
    'Hooks': results.filter(r => r.filePath.includes('/hooks/')),
    'Contexts': results.filter(r => r.filePath.includes('/contexts/')),
    'Other': results.filter(r => !['components', 'services', 'utils', 'types', 'data', 'hooks', 'contexts'].some(cat => r.filePath.includes(`/${cat}/`)))
  };
  
  Object.entries(categories).forEach(([category, files]) => {
    if (files.length > 0) {
      const totalUnused = files.reduce((sum, f) => sum + f.unusedCount, 0);
      const totalDeclarations = files.reduce((sum, f) => sum + f.totalDeclarations, 0);
      const avgRatio = totalDeclarations > 0 ? (totalUnused / totalDeclarations * 100).toFixed(1) : '0.0';
      
      console.log(`${category}: ${files.length} files, ${totalUnused} unused variables, ${avgRatio}% unused ratio`);
    }
  });
  
  console.log('');
  
  // Export detailed results to JSON
  const jsonResults = {
    summary: {
      totalFiles,
      filesWithUnused,
      totalUnused,
      totalDeclarations,
      unusedRatio: totalUnused / totalDeclarations
    },
    topFiles: results.slice(0, 20),
    categoryAnalysis: Object.entries(categories).map(([category, files]) => ({
      category,
      fileCount: files.length,
      totalUnused: files.reduce((sum, f) => sum + f.unusedCount, 0),
      totalDeclarations: files.reduce((sum, f) => sum + f.totalDeclarations, 0)
    }))
  };
  
  fs.writeFileSync('./unused-variables-report.json', JSON.stringify(jsonResults, null, 2));
  console.log('📄 Detailed report saved to unused-variables-report.json');
  
  return results;
}

// Run the analysis
if (require.main === module) {
  analyzeProject();
}

module.exports = { analyzeProject, analyzeFile };