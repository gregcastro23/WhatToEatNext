# Elemental Casing Standardization Scripts

These scripts help enforce consistent naming conventions for astrological, elemental, and alchemical terms throughout the codebase.

## Standardized Casing Conventions

According to our project guidelines, we follow these casing conventions:

- **Planets**: Pascal Case (Sun, Moon, Mercury, etc.)
- **Zodiac Signs**: lowercase (aries, taurus, gemini, etc.)
- **Elements**: Pascal Case (Fire, Water, Earth, Air)
- **Alchemical Properties**: Pascal Case (Spirit, Essence, Matter, Substance)

## Available Scripts

### 1. Fix Elemental Casing

This script scans the entire src directory to standardize casing conventions.

```bash
# Run in dry-run mode first to see what would change
node scripts/elemental-fixes/fix-elemental-casing.js --dry-run

# Run to apply changes
node scripts/elemental-fixes/fix-elemental-casing.js

# Target specific areas of the codebase
node scripts/elemental-fixes/fix-elemental-casing.js --scope=utils,services --dry-run
```

#### Supported Scope Areas

You can use the `--scope` parameter to target specific areas of the codebase:

- `utils`: All utility files in `/src/utils`
- `services`: Service files in `/src/services`
- `components`: React components in `/src/components`
- `hooks`: React hooks in `/src/hooks`
- `types`: Type definitions in `/src/types`
- `constants`: Constants in `/src/constants`
- `lib`: Library code in `/src/lib`
- `data`: Data files in `/src/data`
- `contexts`: Context providers in `/src/contexts`
- `core`: Core alchemical types and engine files

Multiple areas can be specified with commas (no spaces): `--scope=utils,services,hooks`

### 2. Fix Core Alchemical Types

This script specifically targets the core alchemical engine and types files to ensure they follow the standardized casing conventions.

```bash
# Run in dry-run mode first to see what would change
node scripts/elemental-fixes/fix-core-alchemical-types.js --dry-run

# Run to apply changes
node scripts/elemental-fixes/fix-core-alchemical-types.js
```

### 3. Test Casing Script

This script creates a temporary test file with various casing inconsistencies and then runs the fix script on it to verify functionality.

```bash
node scripts/elemental-fixes/test-casing-script.js
```

## Implementation Details

These scripts:

1. Define the correct casing for each type (planets, zodiac signs, elements, alchemical properties)
2. Use regular expressions to find and replace inconsistently cased terms
3. Take care to avoid changing string literals, type definitions, and other places where casing should be preserved
4. Include special handling for ElementalProperties object literals to ensure property names use correct casing

## Excluded Areas

The scripts are designed to avoid modifying:

- String literals (e.g., 'The sun is in Aries')
- Type definitions (e.g., `type ZodiacSign = 'aries' | 'taurus'...`)
- Files in directories like node_modules, .git, .next, etc.

## Best Practices

1. Always run scripts in dry-run mode first to review changes
2. Target smaller areas with the --scope parameter first to make changes more manageable
3. Run a build after applying changes to ensure nothing breaks
4. Commit changes immediately after running the scripts
5. Run the scripts in phases rather than trying to fix everything at once

## Recommended Approach for Fixing the Codebase

1. Start with core types: `node scripts/elemental-fixes/fix-core-alchemical-types.js --dry-run`
2. Move to utils and services: `node scripts/elemental-fixes/fix-elemental-casing.js --scope=utils,services --dry-run`
3. Then fix components and hooks: `node scripts/elemental-fixes/fix-elemental-casing.js --scope=components,hooks --dry-run`
4. Finally check constants and data: `node scripts/elemental-fixes/fix-elemental-casing.js --scope=constants,data --dry-run`

## Why This Matters

Consistent casing makes our code:

1. More readable and maintainable
2. Less prone to bugs from case-sensitivity issues
3. Easier to understand for new developers
4. Consistent with our conceptual model (Planets and Elements as proper nouns, zodiac signs as common nouns) 