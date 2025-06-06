const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const SRC_DIR = path.resolve(process.cwd(), 'src')
const TARGET_FILES = [
  path.resolve(SRC_DIR, 'App.tsx')
  path.resolve(SRC_DIR, 'services/AstrologicalService.ts')
  path.resolve(SRC_DIR, 'components/moonDisplay.tsx')
]

// Helper to compute relative path between files
function calculateRelativePath(fromFilePath, toModulePath) {
  // Remove the @/ prefix and add src/ to get the actual file path
  const actualModulePath = path.join(SRC_DIR, toModulePath.replace(/^@\//, '))
  
  // Get the directory of the importing file
  const fromFileDir = path.dirname(fromFilePath)
  
  // Calculate the relative path from the importing file to the module
  let relativePath = path.relative(fromFileDir, actualModulePath)
  
  // Ensure it starts with ./ or ../ 
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`
  }
  
  // Remove file extension if present
  const moduleDir = path.dirname(actualModulePath)
  const moduleBasename = path.basename(actualModulePath, path.extname(actualModulePath))
  
  // Check if the import is for a directory or a file
  if (fs.existsSync(actualModulePath)) {
    // It's a file - keep the path as is
    return relativePath
  } else if (fs.existsSync(path.join(moduleDir, moduleBasename, 'index.ts')) || 
             fs.existsSync(path.join(moduleDir, moduleBasename, 'index.tsx')) ||
             fs.existsSync(path.join(moduleDir, moduleBasename, 'index.js')) ||
             fs.existsSync(path.join(moduleDir, moduleBasename, 'index.jsx'))) {
    // It's a directory with an index file
    return relativePath
  } else if (fs.existsSync(moduleDir)) {
    // It's a directory without an index file
    return relativePath
  }
  
  // Module doesn't exist, keep the original import
  console.warn(`Warning: Could not resolve module ${toModulePath}`)
  return null
}

// Process a single file
async function processFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8')
    
    // Create a backup of the file
    const backupPath = `${filePath}.bak`
    await writeFileAsync(backupPath, content, 'utf8')
    console.log(`Created backup at ${backupPath}`)
    
    // Various regex patterns to catch different import styles
    const importPatterns = [
      // Standard import with named exports: import { X } from '@/path'
      /import\s+(?:{[^}]*}|\*\s+as\s+[a-zA-Z0-9_]+|[a-zA-Z0-9_]+)\s+from\s+['"](@\/[^'"]+)['"]/g
      
      // Type import: import type { X } from '@/path'
      /import\s+type\s+{[^}]*}\s+from\s+['"](@\/[^'"]+)['"]/g
      
      // Dynamic import: import('@/path')
      /import\s*\(\s*['"](@\/[^'"]+)['"]\s*\)/g
    ]
    
    let updatedContent = content
    let changes = 0
    
    // Track successfully processed modules to handle duplicate imports
    const processedModules = new Set()
    
    // Process each import pattern
    for (const pattern of importPatterns) {
      let match
      
      // Reset the regex index for each pattern
      pattern.lastIndex = 0
      
      const matches = []
      while ((match = pattern.exec(content)) !== null) {
        matches.push({
          fullMatch: match[0]
          modulePath: match[1]
        })
      }
      
      console.log(`\nFound imports for ${path.relative(SRC_DIR, filePath)})
      
      for (const { fullMatch, modulePath } of matches) {
        // Skip already processed modules to avoid duplicate replacements
        if (processedModules.has(modulePath)) continue
        
        const relativePath = calculateRelativePath(filePath, modulePath)
        
        if (relativePath) {
          // Replace all occurrences of this module path in the file
          const regex = new RegExp(`(['"])${modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g')
          updatedContent = updatedContent.replace(regex, `$1${relativePath}$2`)
          
          // Track this module as processed
          processedModules.add(modulePath)
          changes++
          console.log(`  ${modulePath} -> ${relativePath}`)
        }
      }
    }
    
    // Write the updated file
    await writeFileAsync(filePath, updatedContent, 'utf8')
    console.log(`\nUpdated ${changes} imports in ${filePath}`)
    
    return changes
  } catch (error) {
    console.error(`Error processing file ${filePath}, error)
    return 0
  }
}

// Main execution function
async function run() {
  try {
    console.log(`Converting imports in ${TARGET_FILES.length} test files...`)
    
    let totalChanges = 0
    
    for (const file of TARGET_FILES) {
      console.log(`\nProcessing: ${path.relative(process.cwd(), file)}`)
      const changes = await processFile(file)
      totalChanges += changes
    }
    
    console.log(`\nConversion completed! Made ${totalChanges} import changes across ${TARGET_FILES.length} files.`)
  } catch (error) {
    console.error('Error running script:', error)
    process.exit(1)
  }
}

// Execute the script
run(); 