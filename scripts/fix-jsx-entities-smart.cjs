#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sourceDir: './src',
  extensions: ['.tsx', '.jsx'],
  dryRun: process.argv.includes('--dry-run'),
  createBackup: true,
  excludePatterns: ['node_modules', '.next', 'dist', 'build']
};

// Track fix metrics
const metrics = {
  filesProcessed: 0,
  filesModified: 0,
  entitiesFixed: 0,
  errors: []
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
    debug: '→'
  }[type] || '•';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function createBackup(filePath) {
  if (!CONFIG.createBackup) return null;
  
  const backupPath = `${filePath}.backup-entities-${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function getAllReactFiles(dir) {
  const files = [];
  
  function scanDirectory(directory) {
    try {
      const items = fs.readdirSync(directory);
      
      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!CONFIG.excludePatterns.some(pattern => item.includes(pattern))) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          if (CONFIG.extensions.some(ext => fullPath.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      log(`Error scanning directory ${directory}: ${error.message}`, 'error');
    }
  }
  
  scanDirectory(dir);
  return files;
}

function findJSXElements(content) {
  const jsxElements = [];
  
  // Find JSX elements (tags that look like HTML/JSX)
  const jsxPattern = /<([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9-]*)[^>]*>[\s\S]*?<\/\1>/g;
  
  let jsxMatch;
  while ((jsxMatch = jsxPattern.exec(content)) !== null) {
    jsxElements.push({
      start: jsxMatch.index,
      end: jsxMatch.index + jsxMatch[0].length,
      content: jsxMatch[0],
      tagName: jsxMatch[1]
    });
  }
  
  // Also find self-closing JSX elements
  const selfClosingPattern = /<([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9-]*)[^>]*\/>/g;
  
  let selfClosingMatch;
  while ((selfClosingMatch = selfClosingPattern.exec(content)) !== null) {
    jsxElements.push({
      start: selfClosingMatch.index,
      end: selfClosingMatch.index + selfClosingMatch[0].length,
      content: selfClosingMatch[0],
      tagName: selfClosingMatch[1],
      selfClosing: true
    });
  }
  
  return jsxElements.sort((a, b) => a.start - b.start);
}

function findJSXTextContent(jsxElement) {
  if (jsxElement.selfClosing) return [];
  
  const textContent = [];
  const tagName = jsxElement.tagName;
  
  // Extract text content between opening and closing tags
  const openingTagEnd = jsxElement.content.indexOf('>') + 1;
  const closingTagStart = jsxElement.content.lastIndexOf(`</${tagName}>`);
  
  if (openingTagEnd > 0 && closingTagStart > openingTagEnd) {
    const innerContent = jsxElement.content.substring(openingTagEnd, closingTagStart);
    
    // Find text nodes (content not inside nested tags)
    const textPattern = />[^<]*[&'"]/g;
    let textMatch;
    
    while ((textMatch = textPattern.exec(innerContent)) !== null) {
      const textStart = jsxElement.start + openingTagEnd + textMatch.index;
      textContent.push({
        start: textStart,
        end: textStart + textMatch[0].length,
        content: textMatch[0],
        absoluteStart: textStart,
        absoluteEnd: textStart + textMatch[0].length
      });
    }
  }
  
  return textContent;
}

function fixEntitiesInJSX(content) {
  let modifiedContent = content;
  let fixCount = 0;
  const fixes = [];
  
  // Find all JSX elements
  const jsxElements = findJSXElements(modifiedContent);
  
  for (const jsxElement of jsxElements) {
    const textNodes = findJSXTextContent(jsxElement);
    
    for (const textNode of textNodes) {
      let nodeContent = textNode.content;
      let originalNodeContent = nodeContent;
      
      // Fix unescaped ampersands (not already escaped)
      nodeContent = nodeContent.replace(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
      
      // Fix unescaped single quotes in contractions (don't -> don&apos;t)
      nodeContent = nodeContent.replace(/([a-zA-Z])'/g, '$1&apos;');
      
      // Fix unescaped double quotes
      nodeContent = nodeContent.replace(/([a-zA-Z])"/g, '$1&quot;');
      
      if (nodeContent !== originalNodeContent) {
        fixes.push({
          start: textNode.absoluteStart,
          end: textNode.absoluteEnd,
          original: originalNodeContent,
          fixed: nodeContent
        });
        fixCount++;
      }
    }
  }
  
  // Apply fixes in reverse order to maintain position indices
  fixes.sort((a, b) => b.start - a.start);
  
  for (const fix of fixes) {
    modifiedContent = 
      modifiedContent.substring(0, fix.start) +
      fix.fixed +
      modifiedContent.substring(fix.end);
      
    log(`  Fixed: ${fix.original.trim()} → ${fix.fixed.trim()}`, 'debug');
  }
  
  return { content: modifiedContent, fixCount };
}

function fixFileEntities(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const result = fixEntitiesInJSX(originalContent);
    
    // Only write file if changes were made
    if (result.fixCount > 0) {
      if (CONFIG.dryRun) {
        log(`[DRY RUN] Would fix ${result.fixCount} entities in ${path.relative(process.cwd(), filePath)}`, 'info');
      } else {
        // Create backup before modifying
        const backupPath = createBackup(filePath);
        if (backupPath) {
          log(`  Created backup: ${path.basename(backupPath)}`, 'debug');
        }
        
        // Write the fixed content
        fs.writeFileSync(filePath, result.content, 'utf8');
        log(`Fixed ${result.fixCount} entities in ${path.relative(process.cwd(), filePath)}`, 'info');
      }
      
      metrics.filesModified++;
      metrics.entitiesFixed += result.fixCount;
    }
    
    metrics.filesProcessed++;
    return result.fixCount;
    
  } catch (error) {
    const errorMsg = `Error processing ${filePath}: ${error.message}`;
    log(errorMsg, 'error');
    metrics.errors.push(errorMsg);
    return 0;
  }
}

function validateFixes() {
  log('Validating fixes...');
  
  try {
    const { execSync } = require('child_process');
    execSync('yarn tsc --noEmit --skipLibCheck', { 
      stdio: 'ignore',
      timeout: 30000
    });
    log('TypeScript validation passed', 'info');
    return true;
  } catch (error) {
    log('TypeScript validation failed - review changes carefully', 'warn');
    return false;
  }
}

function main() {
  log('Starting smart JSX entities fix script...');
  log(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE FIX'}`);
  
  // Find all React files
  const reactFiles = getAllReactFiles(CONFIG.sourceDir);
  log(`Found ${reactFiles.length} React component files`);
  
  if (reactFiles.length === 0) {
    log('No React files found to process', 'warn');
    return;
  }
  
  // Process each file
  let totalFixesApplied = 0;
  for (const file of reactFiles) {
    const fixes = fixFileEntities(file);
    totalFixesApplied += fixes;
    
    if (metrics.filesProcessed % 20 === 0) {
      log(`Progress: ${metrics.filesProcessed}/${reactFiles.length} files processed`);
    }
  }
  
  // Validate fixes if not in dry run mode
  if (!CONFIG.dryRun && metrics.filesModified > 0) {
    validateFixes();
  }
  
  // Final summary
  log('\n=== Smart JSX Entities Fix Complete ===');
  log(`Files processed: ${metrics.filesProcessed}`);
  log(`Files modified: ${metrics.filesModified}`);
  log(`Entities fixed: ${metrics.entitiesFixed}`);
  
  if (metrics.errors.length > 0) {
    log(`Errors encountered: ${metrics.errors.length}`, 'error');
    metrics.errors.forEach(error => log(`  - ${error}`, 'error'));
  }
  
  if (totalFixesApplied > 0) {
    log(`\n✓ Successfully fixed ${totalFixesApplied} unescaped entities in JSX!`);
    if (!CONFIG.dryRun) {
      log('Backup files created for all modified files');
      log('Run "git diff" to review changes');
    }
  } else {
    log('No unescaped entities found in JSX content', 'info');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixFileEntities, findJSXElements };