const fs = require('fs')
const path = require('path')
const util = require('util')
const { glob } = require('glob')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

const SRC_DIR = path.resolve(process.cwd(), 'src')
const FILE_PATTERN = '**/*.{ts,tsx,js,jsx}'

// Skip node_modules and test files
const EXCLUDE_PATTERNS = [
  '**/node_modules/**'
  '**/__tests__/**'
  '**/*.test.{ts,tsx,js,jsx}'
  '**/*.spec.{ts,tsx,js,jsx}'
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
    
    // Create a backup of the file if needed
    const backupPath = `${filePath}.bak`
    if (!fs.existsSync(backupPath)) {
      await writeFileAsync(backupPath, content, 'utf8')
    }
    
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
        }
      }
    }
    
    if (changes > 0) {
      await writeFileAsync(filePath, updatedContent, 'utf8')
      console.log(`Updated ${changes} imports in ${filePath}`)
    }
    
    return changes
  } catch (error) {
    console.error(`Error processing file ${filePath}, error)
    return 0
  }
}

// Main execution function
async function run() {
  try {
    // glob is now a promise-based function in newer versions
    const files = await glob(FILE_PATTERN, {
      cwd: SRC_DIR
      ignore: EXCLUDE_PATTERNS
      absolute: true
    })
    
    console.log(`Found ${files.length} files to process`)
    
    let totalChanges = 0
    let processedFiles = 0
    
    for (const file of files) {
      const changes = await processFile(file)
      totalChanges += changes
      processedFiles++
      
      // Log progress periodically
      if (processedFiles % 50 === 0) {
        console.log(`Processed ${processedFiles}/${files.length} files...`)
      }
    }
    
    console.log(`\nCompleted! Processed ${files.length} files and made ${totalChanges} import changes.`)
  } catch (error) {
    console.error('Error running script:', error)
    process.exit(1)
  }
}

// Execute the script
run(); 