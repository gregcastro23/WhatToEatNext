# 🔧 Comprehensive Manual Fix Prompt - Top Error Files

## 📊 **Current Status**
- **Total Errors**: 6,532
- **Files Requiring Manual Fixes**: 30 files with 50+ errors each
- **Top 3 Files**: recipeBuilding.ts (136), alchemicalEngine.ts (125), recipeFilters.ts (95)
- **Total Errors in Top 30 Files**: ~2,000 errors (30% of all errors)

---

## 🎯 **STRATEGY: Regenerate vs. Fix**

For files with **50+ errors**, it's faster to **REGENERATE** problematic sections than fix line-by-line.

### **When to Regenerate:**
- Section has 10+ consecutive errors
- Entire function/object has structural issues
- Malformed data structures (arrays, objects)
- Pattern applies to entire block (e.g., all properties missing commas)

### **When to Fix:**
- Isolated 1-3 line issues
- Simple pattern replacements
- Already working logic with minor syntax errors

---

## 🔥 **FILE 1: src/lib/alchemicalEngine.ts (125 errors)**

### **Error Pattern Analysis:**
```typescript
// ❌ PROBLEM: Invalid "private readonly," syntax (TS1434, TS1068)
Lines 50, 57, 64, 173: private readonly, propertyName

// ❌ PROBLEM: Octal literals (TS1121)
Lines 78, 86, 94, 102, 110, 118, 126, 134, 142, 150, 158, 166
Pattern: .slice(010) instead of .slice(0, 10)
```

### **🔄 REGENERATION APPROACH:**

**Section 1: Class Properties (Lines 50-170)**
```typescript
// REGENERATE THIS ENTIRE SECTION - Replace with:

export class AlchemicalEngineBase {
  private readonly elementalAffinities: Record<string, string[]> = {
    Fire: ['Air'],
    Air: ['Water'],
    Water: ['Earth'],
    Earth: ['Fire']
  };

  private readonly elementalStrengths: Record<string, number> = {
    Fire: 1,
    Air: 1,
    Water: 1,
    Earth: 1
  };

  private readonly zodiacElements: Record<
    ZodiacSign,
    {
      baseElement: keyof ElementalProperties;
      decans: Array<{
        degrees: [number, number];
        element: keyof ElementalProperties;
        ruler: string;
      }>;
    }
  > = {
    aries: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Mars' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Jupiter' }
      ]
    },
    taurus: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Saturn' }
      ]
    },
    gemini: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Air', ruler: 'Venus' },
        { degrees: [20, 30], element: 'Air', ruler: 'Uranus' }
      ]
    },
    cancer: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Moon' },
        { degrees: [10, 20], element: 'Water', ruler: 'Pluto' },
        { degrees: [20, 30], element: 'Water', ruler: 'Neptune' }
      ]
    },
    leo: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Sun' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Jupiter' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Mars' }
      ]
    },
    virgo: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Saturn' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Venus' }
      ]
    },
    libra: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Air', ruler: 'Uranus' },
        { degrees: [20, 30], element: 'Air', ruler: 'Mercury' }
      ]
    },
    scorpio: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Pluto' },
        { degrees: [10, 20], element: 'Water', ruler: 'Neptune' },
        { degrees: [20, 30], element: 'Water', ruler: 'Moon' }
      ]
    },
    sagittarius: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Jupiter' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Mars' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Sun' }
      ]
    },
    capricorn: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Saturn' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Venus' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Mercury' }
      ]
    },
    aquarius: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Uranus' },
        { degrees: [10, 20], element: 'Air', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Air', ruler: 'Venus' }
      ]
    },
    pisces: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Neptune' },
        { degrees: [10, 20], element: 'Water', ruler: 'Moon' },
        { degrees: [20, 30], element: 'Water', ruler: 'Pluto' }
      ]
    }
  };
}
```

**Expected Error Reduction**: ~100 errors eliminated (80% of file errors)

---

## 🔥 **FILE 2: src/data/unified/recipeBuilding.ts (136 errors)**

### **Error Pattern Analysis:**
```typescript
// ❌ PROBLEM: Octal literals in number ranges (TS1109, TS1005)
Lines 688-700: adjustments.push(2550) should be adjustments.push(25, 50)
Lines 718-730: Similar pattern with negative ranges

// ❌ PROBLEM: Statement syntax errors
Line 723: something(abc) instead of something(a, b, c)
Line 804: Multiple commas in wrong places
Line 823: Invalid variable declaration
```

### **🔄 REGENERATION APPROACH:**

**Section 1: Temperature Adjustment Function (Lines 679-703)**
```typescript
// REGENERATE THIS FUNCTION - Replace with:

private calculateTemperatureAdjustments(
  originalMonica: number | null,
  targetMonica: number
): number[] {
  const adjustments: number[] = [];

  if (!originalMonica) {
    return [-25, -10, 0, 10, 25]; // Default range for exploration
  }

  const monicaDiff = targetMonica - originalMonica;

  if (monicaDiff > 20) {
    // Need significant temperature increase
    adjustments.push(25, 50); // Increase by 25-50°F
  } else if (monicaDiff > 10) {
    // Moderate temperature increase
    adjustments.push(10, 25); // Increase by 10-25°F
  } else if (monicaDiff < -20) {
    // Need temperature decrease for lower Monica
    adjustments.push(-25, -10); // Decrease by 10-25°F
  } else if (monicaDiff < -10) {
    // Slight temperature decrease
    adjustments.push(-15, -5); // Decrease by 5-15°F
  } else {
    // Monica is close to target
    adjustments.push(-5, 5); // Minor adjustments only
  }

  return adjustments;
}
```

**Section 2: Timing Adjustment Function (Lines 705-740)**
```typescript
// REGENERATE THIS FUNCTION - Replace with:

private calculateTimingAdjustments(
  originalMonica: number | null,
  targetMonica: number
): number[] {
  const adjustments: number[] = [];

  if (!originalMonica) {
    return [-15, -5, 0, 5, 15]; // Default timing variations
  }

  const monicaDiff = targetMonica - originalMonica;

  if (Math.abs(monicaDiff) > 15) {
    // Significant Monica difference - larger time adjustments
    adjustments.push(-20, -10, 10, 20); // ±10-20 minutes
  } else if (Math.abs(monicaDiff) > 5) {
    // Moderate difference
    adjustments.push(-10, -5, 5, 10); // ±5-10 minutes
  } else {
    // Close to target
    adjustments.push(-5, 0, 5); // Minor timing tweaks
  }

  return adjustments;
}
```

**Expected Error Reduction**: ~50 errors eliminated (35% of file errors)

---

## 🔥 **FILE 3: src/utils/recipeFilters.ts (95 errors)**

### **Quick Fix Patterns:**
```bash
# Run these sed commands for batch fixes:

# Fix octal literals
sed -i '' 's/\.slice(0\([0-9]\))/\.slice(0, \1)/g' src/utils/recipeFilters.ts

# Fix double commas
sed -i '' 's/,, /, /g' src/utils/recipeFilters.ts

# Fix trailing commas before closing braces
sed -i '' 's/, *}/}/g' src/utils/recipeFilters.ts
```

**Expected Error Reduction**: ~40 errors eliminated (40% of file errors)

---

## 📋 **BATCH FIX SCRIPT FOR TOP 30 FILES**

Create and run this script to fix common patterns across all high-error files:

```bash
#!/bin/bash
# fix-top-files.sh

BACKUP_DIR="./backup-files/manual-fixes-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Top 30 error-prone files
FILES=(
  "src/data/unified/recipeBuilding.ts"
  "src/lib/alchemicalEngine.ts"
  "src/utils/recipeFilters.ts"
  "src/utils/recommendation/methodRecommendation.ts"
  "src/hooks/useEnterpriseIntelligence.ts"
  "src/data/ingredients/fruits/index.ts"
  "src/utils/developmentExperienceOptimizations.ts"
  "src/utils/astrologyUtils.ts"
  "src/utils/ephemerisParser.ts"
  "src/lib/ThermodynamicCalculator.ts"
  "src/data/cuisines/greek.ts"
  "src/hooks/useChakraInfluencedFood.ts"
  "src/utils/numerology.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing: $file"

    # Create backup
    cp "$file" "$BACKUP_DIR/$(basename $file).backup"

    # Apply common fixes
    sed -i '' \
      -e 's/private readonly,/private readonly/g' \
      -e 's/\.slice(0\([0-9]\))/\.slice(0, \1)/g' \
      -e 's/\.slice(0\([0-9][0-9]\))/\.slice(0, \1)/g' \
      -e 's/adjustments\.push(\([0-9]\)\([0-9][0-9]\))/adjustments.push(\1, \2)/g' \
      -e 's/, *}$/}/g' \
      -e 's/, *]$/]/g' \
      "$file"
  fi
done

echo "✅ Batch fixes applied to ${#FILES[@]} files"
echo "📦 Backups in: $BACKUP_DIR"
```

---

## 🎯 **SYSTEMATIC FIX WORKFLOW**

### **Phase 1: Automated Batch Fixes (30 minutes)**
```bash
# 1. Create backup
git add -A && git commit -m "Checkpoint before manual fixes"

# 2. Run batch fix script
bash fix-top-files.sh

# 3. Check progress
yarn track-errors

# Expected: 6,532 → ~5,500 errors (1,000+ eliminated)
```

### **Phase 2: File-by-File Regeneration (2-3 hours)**

For each file in order:

1. **Open file** and identify error clusters
2. **Identify regeneration sections** (10+ consecutive errors)
3. **Copy working section structure** from similar files
4. **Regenerate** the problematic section using templates above
5. **Validate** with `tsc --noEmit | grep filename`
6. **Commit** when file is clean or errors < 10

**Priority Order:**
1. ✅ alchemicalEngine.ts (regenerate class properties)
2. ✅ recipeBuilding.ts (regenerate adjustment functions)
3. ✅ recipeFilters.ts (batch sed fixes)
4. ✅ methodRecommendation.ts (similar to recipeBuilding)
5. Continue through top 30...

### **Phase 3: Validation & Cleanup (30 minutes)**
```bash
# 1. Run full error check
yarn track-errors

# 2. Validate build still works
yarn build

# 3. Commit final state
git add -A && git commit -m "Manual fixes: Eliminated 2,000+ errors from top 30 files"

# Expected: 6,532 → ~4,500 errors (30% reduction)
```

---

## 🏆 **SUCCESS METRICS**

### **Immediate Goals (Today)**
- ✅ Top 3 files reduced to < 20 errors each
- ✅ Top 10 files all < 30 errors each
- ✅ Total errors < 5,500 (15% reduction)

### **Extended Goals (Week)**
- ✅ All files < 50 errors
- ✅ Total errors < 4,000 (38% reduction)
- ✅ Enable `tsc --noEmit` in CI/CD pipeline

---

## 💡 **PRO TIPS**

1. **Use Multi-Cursor Editing**: Fix repeated patterns in VSCode with Alt+Click
2. **Test Incrementally**: Run `tsc --noEmit | grep filename` after each section
3. **Commit Frequently**: Every 50-100 error reduction
4. **Rollback if Stuck**: `git reset --hard HEAD` and try different approach
5. **Ask for Help**: If file is too complex, consider splitting into multiple files

---

## 🚀 **QUICK START COMMAND**

```bash
# Copy this entire block and run it:

# 1. Create manual fix script
cat > fix-top-files.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backup-files/manual-fixes-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

FILES=(
  "src/lib/alchemicalEngine.ts"
  "src/data/unified/recipeBuilding.ts"
  "src/utils/recipeFilters.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/$(basename $file).backup"
    sed -i '' \
      -e 's/private readonly,/private readonly/g' \
      -e 's/\.slice(0\([0-9]\))/\.slice(0, \1)/g' \
      -e 's/\.slice(0\([0-9][0-9]\))/\.slice(0, \1)/g' \
      -e 's/adjustments\.push(\([0-9]\)\([0-9][0-9]\))/adjustments.push(\1, \2)/g' \
      "$file"
    echo "✅ Fixed: $file"
  fi
done
EOF

# 2. Make executable and run
chmod +x fix-top-files.sh
bash fix-top-files.sh

# 3. Check progress
yarn track-errors

# 4. If successful, commit
git add -A && git commit -m "Batch fix: Top 3 files automated patterns"
```

---

**This prompt eliminates 1,000-2,000 errors by focusing on the 20% of files causing 80% of the problems.**
