#!/usr/bin/env node

/**
 * Component Props Fix Script
 * 
 * This script fixes component props type issues including:
 * 1. Adding missing Props interfaces for components
 * 2. Fixing props type mismatches in component definitions
 * 3. Adding type annotations to functional components
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Base path for our operations
const BASE_PATH = process.cwd();

/**
 * Logger function with verbosity control
 */
function log(message, type = 'info') {
  const prefix = {
    info: '\x1b[34m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    warning: '\x1b[33m[WARNING]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
  }[type] || '\x1b[34m[INFO]\x1b[0m';
  
  if (type === 'error' || type === 'success' || VERBOSE) {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Analyzes a component's props usage and creates a type definition
 */
function analyzeComponentProps(filePath, componentName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const propsUsage = new Map();
    
    // Look for props destructuring
    const destructuringRegex = new RegExp(`const\\s+${componentName}\\s*=\\s*\\(\\{([^}]*)\\}\\)`, 'g');
    const destructuringMatch = destructuringRegex.exec(content);
    
    if (destructuringMatch && destructuringMatch[1]) {
      const propsStr = destructuringMatch[1];
      const propsList = propsStr.split(',').map(prop => prop.trim());
      
      for (const prop of propsList) {
        // Handle default values and type annotations in destructuring
        const [propName, defaultValue] = prop.split('=').map(p => p.trim());
        let propType = 'any';
        
        // Try to infer the type
        if (defaultValue) {
          if (defaultValue === 'true' || defaultValue === 'false') {
            propType = 'boolean';
          } else if (!isNaN(defaultValue) && defaultValue !== '') {
            propType = 'number';
          } else if ((defaultValue.startsWith('"') && defaultValue.endsWith('"')) ||
                     (defaultValue.startsWith("'") && defaultValue.endsWith("'"))) {
            propType = 'string';
          } else if (defaultValue.startsWith('[') && defaultValue.endsWith(']')) {
            propType = 'any[]';
          } else if (defaultValue.startsWith('{') && defaultValue.endsWith('}')) {
            propType = 'Record<string, unknown>';
          }
        }
        
        // Check if there's a type annotation in the code
        const typeRegex = new RegExp(`${propName}\\s*:\\s*(\\w+)`, 'g');
        const typeMatch = content.match(typeRegex);
        
        if (typeMatch) {
          propType = typeMatch[0].split(':')[1].trim();
        }
        
        propsUsage.set(propName, propType);
      }
    }
    
    return propsUsage;
  } catch (error) {
    log(`Error analyzing props for component ${componentName}: ${error.message}`, 'error');
    return new Map();
  }
}

/**
 * Process a file to fix component props type issues
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modifications = [];

    // Only process .tsx files
    if (!filePath.endsWith('.tsx')) {
      return 0;
    }

    // Fix 1: Add Props interface for components that don't have one
    const componentWithoutPropsTypeFixes = [
      // Find components without type annotations
      {
        pattern: /const\s+(\w+)\s*=\s*\(\{([^}]*)\}\)\s*=>\s*{/g,
        replacement: (match, componentName, propsStr) => {
          // Check if there's already a Props interface for this component
          const hasPropsInterface = content.includes(`interface ${componentName}Props`) || 
                                   content.includes(`type ${componentName}Props`);
          
          if (!hasPropsInterface && propsStr.trim() !== '') {
            // Analyze props usage
            const propsUsage = analyzeComponentProps(filePath, componentName);
            
            if (propsUsage.size > 0) {
              // Generate Props interface
              let propsInterface = `interface ${componentName}Props {\n`;
              
              for (const [propName, propType] of propsUsage.entries()) {
                propsInterface += `  ${propName}: ${propType};\n`;
              }
              
              propsInterface += `}\n\n`;
              
              // Add the Props interface before the component
              const componentPosition = content.indexOf(match);
              content = content.slice(0, componentPosition) + 
                      propsInterface + 
                      content.slice(componentPosition);
              
              // Add the type annotation to the component
              const newComponentDef = `const ${componentName} = ({ ${propsStr} }: ${componentName}Props) => {`;
              
              modifications.push(`Added Props interface for ${componentName}`);
              return newComponentDef;
            }
          }
          
          return match;
        }
      }
    ];

    // Fix 2: Fix type mismatches in props destructuring
    const propsTypeMismatchFixes = [
      // Find component props with type mismatches
      {
        pattern: /interface\s+(\w+)Props\s*{([^}]*)}/g,
        replacement: (match, componentName, propsDefinition) => {
          // Look for component usage with props
          const componentUsageRegex = new RegExp(`<${componentName}([^>]*)>`, 'g');
          const componentUsages = [];
          let usageMatch;
          
          while ((usageMatch = componentUsageRegex.exec(content)) !== null) {
            componentUsages.push(usageMatch[1]);
          }
          
          // Check for props that are used but not defined
          let propsDefinitionModified = propsDefinition;
          let modified = false;
          
          for (const usage of componentUsages) {
            // Extract prop assignments
            const propAssignmentRegex = /(\w+)=(?:{([^}]*)}|"([^"]*)"|'([^']*)'|\d+|true|false)/g;
            let propMatch;
            
            while ((propMatch = propAssignmentRegex.exec(usage)) !== null) {
              const propName = propMatch[1];
              
              // Check if prop is defined in the interface
              if (!propsDefinitionModified.includes(`${propName}:`)) {
                // Add the missing prop with inferred type
                const propValue = propMatch[2] || propMatch[3] || propMatch[4] || propMatch[0].split('=')[1];
                let propType = 'any';
                
                if (propValue === 'true' || propValue === 'false') {
                  propType = 'boolean';
                } else if (!isNaN(propValue) && propValue !== '') {
                  propType = 'number';
                } else if (propValue.includes('"') || propValue.includes("'")) {
                  propType = 'string';
                } else if (propValue.includes('[') && propValue.includes(']')) {
                  propType = 'any[]';
                } else if (propValue.includes('{') && propValue.includes('}')) {
                  propType = 'Record<string, unknown>';
                }
                
                propsDefinitionModified += `\n  ${propName}: ${propType};`;
                modified = true;
                modifications.push(`Added missing prop ${propName}: ${propType} to ${componentName}Props interface`);
              }
            }
          }
          
          if (modified) {
            return `interface ${componentName}Props {${propsDefinitionModified}}`;
          }
          
          return match;
        }
      }
    ];

    // Fix 3: Fix recommendation component props
    const recommendationComponentFixes = [
      // Specific fix for recommendation components
      {
        pattern: /interface\s+([\w]+RecommendationProps)\s*{([^}]*)}/g,
        replacement: (match, interfaceName, propsDefinition) => {
          // Add common props needed for recommendation components
          let modified = false;
          let updatedProps = propsDefinition;
          
          const commonProps = [
            { name: 'currentSeason', type: 'Season' },
            { name: 'currentTime', type: 'Date' },
            { name: 'planetaryHour', type: 'PlanetName | string' },
            { name: 'filters', type: 'Record<string, unknown>' }
          ];
          
          for (const prop of commonProps) {
            if (!updatedProps.includes(`${prop.name}:`)) {
              updatedProps += `\n  ${prop.name}?: ${prop.type};`;
              modified = true;
              modifications.push(`Added missing ${prop.name} to ${interfaceName}`);
            }
          }
          
          if (modified) {
            return `interface ${interfaceName} {${updatedProps}}`;
          }
          
          return match;
        }
      }
    ];

    // Apply all fixes
    const allFixes = [...componentWithoutPropsTypeFixes, ...propsTypeMismatchFixes, ...recommendationComponentFixes];
    
    for (const fix of allFixes) {
      content = content.replace(fix.pattern, fix.replacement);
    }

    // Write changes if content was modified and we're not in dry run mode
    if (content !== originalContent) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`Fixed component props in: ${path.relative(BASE_PATH, filePath)}`, 'success');
        
        if (VERBOSE) {
          modifications.forEach(mod => log(`  - ${mod}`, 'info'));
        }
      } else {
        log(`Would fix component props in: ${path.relative(BASE_PATH, filePath)}`, 'info');
        
        if (VERBOSE) {
          modifications.forEach(mod => log(`  - ${mod}`, 'info'));
        }
      }
      return 1; // Return 1 to indicate a file was modified
    }
    return 0; // Return 0 to indicate no changes were made
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`, 'error');
    return 0;
  }
}

/**
 * Find all TypeScript React files in the codebase
 */
async function findTsxFiles() {
  return glob('src/**/*.tsx', { ignore: ['**/node_modules/**', '**/.next/**'] });
}

/**
 * Main function
 */
async function main() {
  log('Starting component props fix script' + (DRY_RUN ? ' (DRY RUN)' : ''), 'info');
  
  const tsxFiles = await findTsxFiles();
  log(`Found ${tsxFiles.length} TSX files to process`, 'info');
  
  let modifiedCount = 0;
  
  for (const file of tsxFiles) {
    modifiedCount += processFile(file);
  }
  
  if (DRY_RUN) {
    log(`Dry run completed. Would modify ${modifiedCount} files.`, 'success');
  } else {
    log(`Component props fixes completed. Modified ${modifiedCount} files.`, 'success');
  }
}

// Run the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
}); 