# Enhanced Unused Import Cleaner v2.1 - User Guide

## 🚀 Overview

The Enhanced Unused Import Cleaner is a production-ready tool for systematically removing unused imports from TypeScript/JavaScript codebases. It features AST-based parsing, intelligent replacement suggestions, git integration, comprehensive safety checks, and **scalable batch processing** that automatically increases file processing limits as the tool proves its safety.

## ✨ Key Features

### **Advanced Parsing**
- **AST-based import analysis** using Babel parser
- **Multiline import support** with proper comment preservation
- **Import aliasing support** (`import { foo as bar }`)
- **Fallback regex parsing** when AST fails

### **Safety & Reliability**
- **Git stash integration** for easy rollback
- **Syntax validation** before applying changes
- **Pre-flight git status checks**
- **Comprehensive error handling**
- **File corruption protection**

### **Smart Search & Replace**
- **Fuzzy matching** for finding replacement candidates
- **Similarity scoring** with exact vs. approximate matches
- **Intelligent replacement suggestions**
- **Codebase-wide search** for function/class definitions

### **Enhanced User Experience**
- **Colorized output** for better readability
- **Progress tracking** with file-by-file status
- **Interactive prompts** with rollback guidance
- **Detailed diff preview** before applying changes
- **Comprehensive summary reports**

### **Scalable Safety Validation (NEW in v2.1)**
- **Automatic batch size scaling** based on success rate
- **Safety metrics tracking** across multiple runs
- **Confidence building** from 5 → 20+ files per run
- **Real-time error monitoring** and adaptive behavior
- **Team-wide safety profiles** with shared metrics

### **Bash Integration (NEW in v2.1)**
- **Easy-to-use bash wrapper** with full feature access
- **Proper exit codes** for CI/CD integration
- **JSON output mode** for automation
- **Silent mode** for scripting
- **Package.json scripts** for team workflows

## 🔧 Installation & Setup

### Prerequisites
```bash
# Install Babel parser for enhanced AST support
npm install --save-dev @babel/parser

# Ensure you have a working lint command
make lint  # Should work and show ESLint output
```

### Verify Installation
```bash
# Check git status integration
node scripts/typescript-fixes/fix-unused-imports-interactive.js --check-git-status

# Test with dry run
node scripts/typescript-fixes/fix-unused-imports-interactive.js --dry-run
```

## 📋 Usage Examples

### **Package.json Scripts (Recommended)**
```bash
# Start with dry run to preview changes
yarn clean-imports:dry

# Run interactively (prompts for each change)  
yarn clean-imports

# Apply changes automatically (use with caution)
yarn clean-imports:auto

# Check safety metrics and batch size recommendations
yarn clean-imports:metrics
```

### **Bash Wrapper (Alternative)**
```bash
# Start with dry run to see what would be changed
./scripts/typescript-fixes/clean-imports.sh --dry-run

# Run interactively (prompts for each change)
./scripts/typescript-fixes/clean-imports.sh

# Apply changes automatically (use with caution)
./scripts/typescript-fixes/clean-imports.sh --auto-fix

# Custom batch size
./scripts/typescript-fixes/clean-imports.sh --batch 10
```

### **Direct Node.js (Advanced)**
```bash
# Start with dry run to see what would be changed
node scripts/typescript-fixes/fix-unused-imports-interactive.js --dry-run

# Run interactively (prompts for each change)
node scripts/typescript-fixes/fix-unused-imports-interactive.js --interactive

# Apply changes automatically (use with caution)
node scripts/typescript-fixes/fix-unused-imports-interactive.js --auto-fix
```

### **Advanced Options**
```bash
# Limit to 3 files per run (default is 5)
node scripts/typescript-fixes/fix-unused-imports-interactive.js --max-files=3

# Auto-fix with limited scope
node scripts/typescript-fixes/fix-unused-imports-interactive.js --auto-fix --max-files=2

# Check git status only
node scripts/typescript-fixes/fix-unused-imports-interactive.js --check-git-status
```

### **Typical Workflow**
```bash
# 1. Check current git status
git status

# 2. Check safety metrics (NEW in v2.1)
yarn clean-imports:metrics

# 3. Run dry-run to preview changes
yarn clean-imports:dry

# 4. Apply changes interactively
yarn clean-imports

# 5. Review changes
git diff

# 6. Commit or rollback as needed
git add . && git commit -m "Remove unused imports"
# OR
git stash apply stash^{/unused-imports-fix-*}  # Rollback using stash
```

### **Safety Validation Workflow (NEW in v2.1)**
```bash
# Check if the tool is ready for larger batch sizes
yarn clean-imports:metrics

# Validate safety before running
./scripts/typescript-fixes/clean-imports.sh --validate

# Start with conservative batch size for new installations
./scripts/typescript-fixes/clean-imports.sh --batch 3 --dry-run

# As safety score improves, larger batches are automatically used
# Fresh install: 5 files → Good record: 10 files → Excellent: 15-20 files
```

## 🛡️ Safety Features

### **Git Integration**
- **Pre-flight checks**: Warns about uncommitted changes
- **Git stash creation**: Automatic backup before changes
- **Rollback instructions**: Clear guidance for undoing changes
- **Status validation**: Ensures clean working directory

### **Syntax Protection**
- **AST validation**: Ensures syntax correctness before saving
- **Error recovery**: Falls back to regex if AST parsing fails
- **File corruption prevention**: Validates changes before writing
- **Graceful error handling**: Continues processing other files on errors

### **Change Validation**
- **Diff preview**: Shows exactly what will change
- **Interactive confirmation**: Prompts for each removal
- **Import verification**: Confirms variables are actually imports
- **Scope limiting**: Maximum 5 files per run (configurable)

## 📊 Understanding Output

### **Color Coding**
- 🔵 **Blue**: Information and progress updates
- 🟢 **Green**: Successful operations and confirmations
- 🟡 **Yellow**: Warnings and dry-run previews
- 🔴 **Red**: Errors and removals
- 🟣 **Cyan**: File paths and metadata
- ⚪ **White**: General information

### **Status Indicators**
- ✅ **Success**: Operation completed successfully
- ⚠️ **Warning**: Potential issue or fallback used
- ❌ **Error**: Operation failed
- 💡 **Suggestion**: Replacement candidate found
- 🔍 **Processing**: Currently analyzing
- 📋 **Dry Run**: Preview mode active

### **Progress Tracking**
```
📁 [2/5] src/components/Recipe.tsx
  🔍 [1/3] Checking 'unusedFunction'
    💡 Found exact match in: src/utils/helpers.ts
    💡 Suggested import: from '../utils/helpers'
    Replace with suggested import? [y/N] 
```

## 🔄 Rollback & Recovery

### **Using Git Stash (Recommended)**
```bash
# The script creates named stashes automatically
git stash list | grep "unused-imports-fix"

# Rollback using stash name (shown in script output)
git stash apply stash^{/unused-imports-fix-1640995200000}

# View stash contents before applying
git stash show stash^{/unused-imports-fix-1640995200000}
```

### **Manual Rollback**
```bash
# Undo changes to specific files
git checkout -- src/components/Recipe.tsx

# Restore all changes
git restore .

# Reset to last commit (nuclear option)
git reset --hard HEAD
```

### **Recovery Best Practices**
1. **Always run with `--dry-run` first**
2. **Commit other changes before running the script**
3. **Review git diff before committing script changes**
4. **Keep stash names from script output for easy rollback**

## 🧠 Smart Features

### **Intelligent Replacement Detection**
The script searches your codebase for potential replacements:

```typescript
// If 'calculateTotal' is unused, script searches for:
// 1. Exact function definitions
export function calculateTotal() { ... }

// 2. Exact variable definitions  
export const calculateTotal = () => { ... }

// 3. Default exports
export default calculateTotal;

// 4. Named exports in export statements
export { calculateTotal, otherFunction };

// 5. Fuzzy matches (similar names)
export function calculateTotalPrice() { ... }  // 70% similarity
```

### **Replacement Suggestions**
When a match is found, the script provides intelligent suggestions:

```bash
💡 Found exact match in: src/utils/calculations.ts
💡 Suggested import: from '../utils/calculations'
Replace with suggested import? [y/N]
```

### **Multi-Pattern Import Handling**
Supports all TypeScript/JavaScript import patterns:

```typescript
// Default imports
import React from 'react';

// Named imports
import { useState, useEffect } from 'react';

// Aliased imports
import { Component as ReactComponent } from 'react';

// Mixed imports
import React, { useState as state, useEffect } from 'react';

// Namespace imports
import * as React from 'react';

// Multiline imports with comments
import {
  useState, // State management
  useEffect, // Side effects
  useMemo // Memoization
} from 'react';
```

## ⚙️ Configuration

### **Built-in Configuration**
```javascript
const DEFAULT_CONFIG = {
  maxFiles: 5,              // Maximum files to process per run
  requireCleanGit: true,    // Require clean git working directory
  createGitStash: true,     // Create git stash before changes
  enableFuzzySearch: true,  // Enable fuzzy matching for replacements
  preserveFormatting: true, // Preserve code formatting and comments
  validateSyntax: true      // Validate syntax before saving changes
};
```

### **Command Line Overrides**
```bash
# Override max files
--max-files=3

# Skip git checks (not recommended)
--auto-fix

# Force dry run
--dry-run

# Interactive mode (default unless --auto-fix)
--interactive
```

## 🔍 Troubleshooting

### **Common Issues**

#### **"@babel/parser not found"**
```bash
npm install --save-dev @babel/parser
```

#### **"make lint" command fails**
Ensure your project has a working Makefile with a lint target:
```makefile
lint:
	npx eslint src --ext .ts,.tsx,.js,.jsx
```

#### **Git stash failures**
```bash
# Check git status
git status

# Ensure you're in a git repository
git rev-parse --is-inside-work-tree

# Check git configuration
git config --list | grep user
```

#### **AST parsing failures**
The script automatically falls back to regex parsing. Common causes:
- Syntax errors in source files
- Unsupported TypeScript/JavaScript features
- File encoding issues

### **Debug Mode**
Add debug logging by modifying the script:
```javascript
// Add at the top of the script
const DEBUG = process.argv.includes('--debug');

// Use throughout the script
if (DEBUG) console.log('Debug info:', data);
```

### **Performance Issues**
- **Large codebases**: Use `--max-files=1` for slower, more careful processing
- **Many unused imports**: Run in batches rather than all at once
- **Slow file search**: Script automatically limits search to first 100 files

## 📈 Best Practices

### **Workflow Integration**
1. **Run before major refactoring** to clean up existing unused imports
2. **Use in CI/CD pipelines** with `--dry-run` to detect new unused imports
3. **Integrate with pre-commit hooks** for automatic cleanup
4. **Run weekly** as part of code maintenance routine

### **Team Usage**
1. **Document usage** in your project's README
2. **Create team conventions** for when to use auto-fix vs interactive
3. **Set up shared configuration** for consistent behavior
4. **Train team members** on rollback procedures

### **Project Integration**
```bash
# Add to package.json scripts
{
  "scripts": {
    "clean-imports": "node scripts/typescript-fixes/fix-unused-imports-interactive.js --dry-run",
    "clean-imports:fix": "node scripts/typescript-fixes/fix-unused-imports-interactive.js --interactive",
    "clean-imports:auto": "node scripts/typescript-fixes/fix-unused-imports-interactive.js --auto-fix --max-files=3"
  }
}
```

## 🚀 Advanced Usage

### **Batch Processing Large Codebases**
```bash
# Process in small batches
for i in {1..10}; do
  echo "Batch $i"
  node scripts/typescript-fixes/fix-unused-imports-interactive.js --auto-fix --max-files=2
  sleep 1
done
```

### **CI/CD Integration**
```yaml
# GitHub Actions example
- name: Check for unused imports
  run: |
    node scripts/typescript-fixes/fix-unused-imports-interactive.js --dry-run
    if [ $? -ne 0 ]; then
      echo "Unused imports detected. Run the cleanup script locally."
      exit 1
    fi
```

### **Pre-commit Hook**
```bash
#!/bin/bash
# .git/hooks/pre-commit
node scripts/typescript-fixes/fix-unused-imports-interactive.js --dry-run --max-files=1
if [ $? -ne 0 ]; then
  echo "⚠️  Unused imports detected. Consider running the cleanup script."
  echo "   node scripts/typescript-fixes/fix-unused-imports-interactive.js --interactive"
fi
```

## 📚 Technical Details

### **AST vs Regex Parsing**
- **AST (Primary)**: Uses Babel parser for accurate, context-aware parsing
- **Regex (Fallback)**: Simple pattern matching when AST fails
- **Automatic Fallback**: Seamlessly switches between modes

### **Search Algorithm**
1. **Exact Pattern Matching**: Looks for exact function/variable definitions
2. **Export Statement Analysis**: Checks export declarations
3. **Fuzzy Matching**: Uses string similarity for approximate matches
4. **Similarity Scoring**: Ranks results by relevance and exactness

### **Performance Optimizations**
- **Limited File Search**: Searches only first 100 files for performance
- **Early Exit**: Stops processing on first exact match
- **Cached Results**: Reuses search results within same run
- **Minimal Memory Usage**: Processes files one at a time

### **Error Recovery**
- **Graceful Degradation**: Falls back to simpler methods on errors
- **Partial Success**: Continues processing other files on individual failures
- **State Preservation**: Maintains progress tracking through errors
- **Clean Shutdown**: Proper cleanup on interruption

---

## 🤝 Contributing

To improve this script:

1. **Test thoroughly** with various import patterns
2. **Add error handling** for new edge cases
3. **Improve AST parsing** for better accuracy
4. **Enhance search algorithms** for better replacement detection
5. **Add configuration options** for team-specific needs

## 📄 License

This script is part of the WhatToEatNext project and follows the same license terms.

---

**Happy coding! 🎉** This enhanced script will help keep your codebase clean and maintainable by systematically removing unused imports while providing safe, reversible operations.