# Automatic Linting Fix System

## Overview

The Automatic Linting Fix System provides safe, conservative linting fixes with comprehensive validation and automatic rollback capabilities. It's designed to respect domain-specific patterns and maintain code integrity.

## Features

### ✅ Safety First
- **Timestamped Backups**: Every file is backed up before any changes
- **Automatic Rollback**: If any validation fails, the original file is restored
- **Rate Limiting**: Maximum 20 executions per hour with 5-second cooldown
- **Comprehensive Validation**: TypeScript compilation, syntax integrity, and critical pattern preservation

### 🔧 Fix Types Applied
- **ESLint Auto-Fix**: Uses project's `eslint.config.cjs` configuration
- **Trailing Whitespace Removal**: Cleans up line endings
- **Double Semicolon Fixes**: Removes accidental double semicolons
- **Multiple Empty Line Normalization**: Limits to maximum 2 consecutive empty lines
- **Conservative Semicolon Addition**: Only adds semicolons for obvious cases

### 🛡️ Domain-Specific Protection
- **Astrological Calculations**: Preserves planetary position constants and transit dates
- **Fallback Values**: Maintains error handling and fallback mechanisms
- **Campaign System Intelligence**: Protects campaign system patterns and metrics
- **Elemental Properties**: Respects four-element system calculations

## Usage

### Single File Fix
```bash
# Fix a specific file that was just saved
node fix-file-on-save.cjs path/to/your/file.ts

# Or using yarn script
yarn auto-fix path/to/your/file.ts
```

### File Watcher (Development)
```bash
# Watch src directory for changes and auto-fix
yarn auto-fix:watch

# Watch entire project
yarn auto-fix:watch-all
```

### Direct Script Usage
```bash
# Use the core auto-fixer directly
node src/scripts/auto-lint-fixer.cjs path/to/file.ts
```

## System Behavior

### Success Flow
1. **Rate Limit Check**: Ensures execution limits are respected
2. **Backup Creation**: Creates timestamped backup in `.lint-backups/`
3. **ESLint Auto-Fix**: Applies project ESLint configuration fixes
4. **Safe Pattern Fixes**: Applies conservative formatting improvements
5. **Validation Suite**:
   - TypeScript compilation check
   - Syntax integrity validation
   - Critical pattern preservation check
6. **Success**: File is improved and all validations pass

### Failure Flow with Rollback
1. **Validation Failure**: Any validation step fails
2. **Automatic Rollback**: Original file is restored from backup
3. **Safe State**: No broken code is left in the codebase
4. **Logging**: Detailed logs explain what went wrong

## Rate Limiting

The system implements intelligent rate limiting to prevent abuse:

- **Maximum**: 20 executions per hour
- **Cooldown**: 5 seconds between executions
- **Tracking**: Stored in `.lint-rate-limit.json`
- **Automatic Cleanup**: Old execution records are automatically removed

## Validation Checks

### TypeScript Compilation
```bash
yarn tsc --noEmit --skipLibCheck
```
Ensures the file compiles without TypeScript errors.

### Syntax Integrity
- Detects corruption patterns (`undefined undefined`, `null null`)
- Validates JavaScript/TypeScript parsing
- Checks for malformed syntax

### Critical Pattern Preservation
Ensures these patterns are not accidentally removed:
- `RELIABLE_POSITIONS` (astrological constants)
- `TransitDates` (planetary transit data)
- `ElementalProperties` (four-element system)
- `CampaignController` (campaign system intelligence)
- `fallback` patterns (error handling)
- `calculateElementalCompatibility` (core calculations)

## File Structure

```
├── fix-file-on-save.cjs              # Main entry point
├── src/scripts/
│   ├── auto-lint-fixer.cjs           # Core auto-fix logic
│   └── watch-and-fix.cjs             # File watcher system
├── .lint-backups/                    # Timestamped backups
├── .lint-rate-limit.json             # Rate limiting data
└── AUTO_LINT_SYSTEM.md               # This documentation
```

## Integration Examples

### VS Code Integration
Add to your VS Code settings to run on save:
```json
{
  "runOnSave.commands": [
    {
      "match": "\\.(ts|tsx|js|jsx)$",
      "command": "node fix-file-on-save.cjs ${file}",
      "runIn": "terminal"
    }
  ]
}
```

### Git Hook Integration
Add to `.husky/pre-commit`:
```bash
#!/bin/sh
# Auto-fix staged files before commit
for file in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$'); do
  if [ -f "$file" ]; then
    node fix-file-on-save.cjs "$file"
    git add "$file"
  fi
done
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Auto-fix linting issues
  run: |
    for file in $(find src -name "*.ts" -o -name "*.tsx"); do
      yarn auto-fix "$file"
    done
```

## Troubleshooting

### Common Issues

**"Rate limit exceeded"**
- Wait for the cooldown period (5 seconds minimum)
- Check `.lint-rate-limit.json` for execution history

**"TypeScript validation failed"**
- The project has existing TypeScript errors
- Fix compilation errors first, then re-run auto-fix
- Use `yarn tsc --noEmit --skipLibCheck` to see current errors

**"Syntax integrity validation failed"**
- The file has syntax errors that auto-fix couldn't resolve
- Check the backup file in `.lint-backups/` for the original content
- Manual review and fixing may be required

**"Critical patterns validation failed"**
- Auto-fix accidentally modified important domain-specific code
- File was automatically rolled back to preserve functionality
- Review the specific patterns that were affected in the logs

### Logs and Debugging

All operations are logged with prefixes:
- `[AUTO-LINT]` - General information
- `[AUTO-LINT WARN]` - Warnings and rollback notifications
- `[AUTO-LINT ERROR]` - Errors and validation failures
- `[AUTO-LINT SUCCESS]` - Successful operations

### Backup Management

Backups are stored in `.lint-backups/` with timestamps:
```
.lint-backups/
├── MyComponent.tsx.2025-07-31T10-25-03-832Z.backup
├── utils.ts.2025-07-31T10-26-09-989Z.backup
└── ...
```

Clean up old backups periodically:
```bash
yarn clean:backups
```

## Safety Guarantees

1. **No Data Loss**: Every file is backed up before modification
2. **Automatic Rollback**: Failed validations trigger immediate restoration
3. **Conservative Fixes**: Only applies safe, well-tested transformations
4. **Domain Awareness**: Respects astrological and campaign system patterns
5. **Rate Limited**: Prevents system overload and abuse
6. **Comprehensive Validation**: Multiple validation layers ensure code integrity

## Contributing

When modifying the auto-fix system:

1. **Test Thoroughly**: Use the test files to validate changes
2. **Preserve Safety**: Never compromise the rollback mechanisms
3. **Respect Domains**: Maintain awareness of astrological and campaign patterns
4. **Document Changes**: Update this README for new features
5. **Validate Integration**: Test with real project files

## Example Usage Session

```bash
$ node fix-file-on-save.cjs src/components/MyComponent.tsx
🔧 Auto-fixing file: src/components/MyComponent.tsx
[AUTO-LINT] Starting automatic linting fix for: src/components/MyComponent.tsx
[AUTO-LINT] Created backup: .lint-backups/MyComponent.tsx.2025-07-31T10-30-15-123Z.backup
[AUTO-LINT] Applying ESLint auto-fix to: src/components/MyComponent.tsx
[AUTO-LINT] ESLint auto-fix completed successfully
[AUTO-LINT] Removed trailing whitespace
[AUTO-LINT] Fixed double semicolons
[AUTO-LINT] Applied safe pattern fixes
[AUTO-LINT] Validating TypeScript compilation...
[AUTO-LINT SUCCESS] TypeScript validation passed
[AUTO-LINT SUCCESS] Syntax integrity validation passed
[AUTO-LINT SUCCESS] Critical patterns preserved
[AUTO-LINT SUCCESS] Automatic linting fix completed successfully in 1247ms
✅ Successfully auto-fixed: src/components/MyComponent.tsx
   Duration: 1247ms
   ✓ ESLint auto-fix applied
   ✓ Safe pattern fixes applied
   ✓ All validations passed
```

This system provides a robust, safe way to automatically improve code quality while maintaining the integrity of your specialized astrological and campaign system code.
