# Elemental Logic Fixing Tools

This set of tools helps maintain correct elemental logic throughout the codebase. Our alchemical system relies on each element (Fire, Water, Earth, Air) being treated as independently valuable, without the concept of "opposing" elements.

## Available Tools

### 1. Fix Elemental Logic Script

Automatically scans the codebase and fixes problematic patterns in elemental logic.

```bash
# Using yarn
yarn fix-elemental

# Or directly
node fix-elemental-logic.js
```

### 2. Test Elemental Fix Script

Tests that the fix-elemental-logic.js script correctly identifies and fixes problematic patterns.

```bash
# Using yarn
yarn test-elemental-fix

# Or directly
node test-elemental-logic.js
```

## Elemental Principles Guide

For a detailed explanation of the correct principles to follow when working with elemental logic, see the [Elemental Principles Guide](./elemental-principles-guide.md).

## What Gets Fixed

The fix script identifies and corrects:

1. Functions that treat elements as "opposites" (e.g., Fire opposing Water)
2. Conditional logic that assigns low compatibility scores to certain element combinations
3. "Balancing" logic that tries to balance one element with another
4. Element pair variables like `fireWater` or `earthAir`

## Manual Review

While the script can fix many issues automatically, some complex cases may need manual review. The script will indicate when this is the case.

## When to Run

Run these tools:

1. After major changes to elemental calculation logic
2. When encountering unexpected behavior in element-based recommendations
3. Before introducing new elemental features
4. When onboarding new developers to ensure everyone follows the same principles

## Integration

This toolset is integrated into our package.json scripts for easy access. You can also run the scripts directly. 