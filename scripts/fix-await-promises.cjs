#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getPromiseErrors() {
  try {
    execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout || '';
    const lines = output.split('\n');
    const errors = [];
    
    for (const line of lines) {
      // Match Promise property access and Promise type errors
      if (line.includes('Promise<') && (line.includes('TS2339') || line.includes('TS2345'))) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: match[4],
            message: match[5],
            fullLine: line
          });
        }
      }
    }
    
    return errors;
  }
}

function fixPromiseAwaits(dryRun = false) {
  log('\n🔍 Scanning for Promise await issues...', 'cyan');
  
  const errors = getPromiseErrors();
  
  if (errors.length === 0) {
    log('✅ No Promise await errors found!', 'green');
    return { fixed: 0, total: 0 };
  }
  
  log(`Found ${errors.length} Promise-related errors`, 'yellow');
  
  // Group errors by file
  const errorsByFile = {};
  for (const error of errors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }
  
  let totalFixed = 0;
  
  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    if (!fs.existsSync(filePath)) {
      log(`⚠️  File not found: ${filePath}`, 'yellow');
      continue;
    }
    
    log(`\n📝 Processing ${path.basename(filePath)} (${fileErrors.length} errors)...`, 'blue');
    
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fixedInFile = 0;
    
    // Sort errors by line number in reverse
    fileErrors.sort((a, b) => b.line - a.line);
    
    for (const error of fileErrors) {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        let fixed = false;
        
        // Handle different patterns based on error message
        if (error.message.includes("Property") && error.message.includes("does not exist on type 'Promise<")) {
          // Extract the property name from the error message
          const propMatch = error.message.match(/Property '(\w+)'/);
          if (propMatch) {
            const property = propMatch[1];
            
            // Find the expression accessing the property
            const accessPattern = new RegExp(`(\\w+)\\.${property}\\b`);
            const accessMatch = line.match(accessPattern);
            
            if (accessMatch) {
              const varName = accessMatch[1];
              
              // Check if it's already awaited
              if (!line.includes(`await ${varName}`)) {
                // Add await to the variable
                const awaitedVar = `(await ${varName})`;
                const newLine = line.replace(new RegExp(`\\b${varName}\\.${property}\\b`), `${awaitedVar}.${property}`);
                
                // Make sure we're in an async context
                if (newLine !== line) {
                  lines[lineIndex] = newLine;
                  fixed = true;
                }
              }
            }
          }
        } else if (error.message.includes("Argument of type 'Promise<")) {
          // Handle Promise being passed where non-Promise expected
          const argPattern = /Argument of type 'Promise<(.+?)>' is not assignable to parameter of type '(.+?)'/;
          const argMatch = error.message.match(argPattern);
          
          if (argMatch) {
            // Find function calls on this line
            const funcCallPattern = /(\w+)\(([^)]+)\)/g;
            let match;
            let newLine = line;
            
            while ((match = funcCallPattern.exec(line)) !== null) {
              const args = match[2];
              // Check if any argument looks like it might be a Promise
              const promiseVarPattern = /\b(\w+)\b/g;
              let varMatch;
              
              while ((varMatch = promiseVarPattern.exec(args)) !== null) {
                const varName = varMatch[1];
                // Skip if already awaited
                if (!args.includes(`await ${varName}`)) {
                  // Try adding await
                  const awaitedArgs = args.replace(new RegExp(`\\b${varName}\\b`), `await ${varName}`);
                  newLine = newLine.replace(args, awaitedArgs);
                  fixed = true;
                  break;
                }
              }
              
              if (fixed) break;
            }
            
            if (fixed) {
              lines[lineIndex] = newLine;
            }
          }
        }
        
        if (fixed) {
          fixedInFile++;
          log(`  ✓ Line ${error.line}: Added await for Promise access`, 'green');
        } else {
          log(`  ⚠️  Line ${error.line}: Needs manual review - ${error.message.substring(0, 60)}...`, 'yellow');
        }
      }
    }
    
    if (fixedInFile > 0 && !dryRun) {
      const newContent = lines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      log(`  💾 Saved ${fixedInFile} fixes to ${path.basename(filePath)}`, 'green');
      totalFixed += fixedInFile;
    } else if (dryRun) {
      log(`  🔍 Would fix ${fixedInFile} errors (dry run)`, 'cyan');
      totalFixed += fixedInFile;
    }
  }
  
  return { fixed: totalFixed, total: errors.length };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  log('🚀 Promise Await Fixer', 'bright');
  log('=' .repeat(50), 'cyan');
  
  if (dryRun) {
    log('🔍 Running in DRY RUN mode - no files will be modified', 'yellow');
  }
  
  log('\n📋 Patterns to fix:', 'cyan');
  log('  • Promise property access without await', 'blue');
  log('  • Promise arguments where non-Promise expected', 'blue');
  log('  • Async function calls missing await', 'blue');
  
  try {
    // Create backup with git stash
    if (!dryRun) {
      log('\n📦 Creating git stash backup...', 'cyan');
      try {
        execSync('git stash push -m "fix-await-promises-backup"', { stdio: 'pipe' });
        log('✅ Backup created successfully', 'green');
      } catch (e) {
        log('⚠️  Could not create git stash (working directory might be clean)', 'yellow');
      }
    }
    
    const result = fixPromiseAwaits(dryRun);
    
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 Summary:', 'bright');
    log(`  Total Promise errors found: ${result.total}`, 'blue');
    log(`  Successfully fixed: ${result.fixed}`, 'green');
    log(`  Remaining to fix manually: ${result.total - result.fixed}`, result.total - result.fixed > 0 ? 'yellow' : 'green');
    
    if (!dryRun && result.fixed > 0) {
      log('\n🔨 Rebuilding to verify fixes...', 'cyan');
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        log('✅ Build successful!', 'green');
      } catch (e) {
        log('⚠️  Build still has errors - continuing campaign', 'yellow');
      }
    }
    
    if (dryRun && result.fixed > 0) {
      log('\n💡 Run without --dry-run to apply these fixes', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixPromiseAwaits };