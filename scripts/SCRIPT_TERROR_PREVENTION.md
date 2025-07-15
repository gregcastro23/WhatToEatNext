# 🚫 CRITICAL SCRIPT TERROR PREVENTION RULES - Updated After Phase 16B Disaster

## ⛔ ABSOLUTE PROHIBITIONS

### 🚨 MASS OPERATION BANS
❌ **NEVER** run scripts that affect 100+ files simultaneously
❌ **NEVER** use broad regex patterns across entire codebase
❌ **NEVER** create "fix-all" or "Phase X" scripts that touch multiple subsystems
❌ **NEVER** run scripts without comprehensive dry-run validation
❌ **NEVER** apply untested patterns to critical files

### 🚨 PHASE 16B DISASTER LESSONS - NEW CRITICAL BANS
❌ **NEVER** use regex patterns that remove or modify dots in property access (`obj.property`)
❌ **NEVER** use regex that concatenates property names (`obj.prop` becoming `objprop`)
❌ **NEVER** claim 100% error elimination without manual verification
❌ **NEVER** trust scripts that "eliminate" 1000+ errors in one run
❌ **NEVER** use `$1/$2` capture groups to reconstruct property access patterns
❌ **NEVER** apply "unknown" type casting as a mass solution
❌ **NEVER** ignore that syntax errors mask type errors

### 🚨 PATTERN BANS
❌ **FORBIDDEN PATTERNS**:
   - `find . -name "*.ts" -exec sed -i 's/pattern/replacement/g' {} \;`
   - Scripts that process 50+ files in a single operation
   - Regex replacements with capture groups `$1/$2` across multiple files
   - Mass casing changes without individual file validation
   - "Phase" numbered scripts that sound comprehensive
   - **ANY regex that modifies `\.` (dot) characters in property access**
   - **ANY regex that removes spaces around operators or property access**

## ✅ MANDATORY SCRIPT PROCEDURES

### 1. **SCOPE LIMITATION REQUIREMENTS**
- ✅ **Maximum 2 files per script run** (reduced from 5 after Phase 16B)
- ✅ **Single concern per script** (imports OR types OR syntax, not multiple)
- ✅ **Specific file targeting** (no wildcards in production)
- ✅ **Individual file validation** after each change
- ✅ **Manual verification of all property access patterns**

### 2. **VALIDATION REQUIREMENTS**
```bash
# MANDATORY SEQUENCE - NO EXCEPTIONS
1. yarn build                    # Confirm starting state
2. node script.js --dry-run     # ALWAYS dry run first
3. Review ALL proposed changes  # Manual inspection required
4. Test on 1 file first        # Single file validation
5. yarn build                  # Verify no syntax errors
6. node script.js              # Apply only after approval
7. yarn build                  # Immediate validation
8. git diff                    # Review actual changes
9. Commit immediately          # Preserve working state
```

### 3. **DRY-RUN REQUIREMENTS**
- ✅ **All scripts MUST support `--dry-run`**
- ✅ **Dry-run output MUST show exact changes**
- ✅ **No script runs without dry-run approval**
- ✅ **Changes must be reviewable line-by-line**
- ✅ **Must show before/after for property access patterns**

### 4. **POST-PHASE-16B SAFETY REQUIREMENTS**
- ✅ **Verify TypeScript can still parse files** (`yarn tsc --noEmit`)
- ✅ **Confirm error counts actually decreased** (not masked by syntax errors)
- ✅ **Manual spot-check of property access patterns**
- ✅ **Verify methods still have proper dot notation**

## 🎯 SCRIPT CREATION GUIDELINES

### ✅ SAFE SCRIPT PATTERNS
```javascript
// ✅ GOOD: Specific, targeted, testable
const targetFiles = [
  'src/components/SpecificComponent.tsx'  // Single file only
];

// ✅ GOOD: Manual property access fixes
const fixes = [
  {
    from: 'ingredient.elemental_properties',
    to: 'ingredient.elementalProperties',
    file: 'src/specific/file.ts',
    line: 42
  }
];

// ✅ GOOD: Clear scope and validation
if (DRY_RUN) {
  console.log(`Would modify ${targetFiles.length} files`);
  fixes.forEach(fix => {
    console.log(`${fix.file}:${fix.line} - ${fix.from} → ${fix.to}`);
  });
  return;
}
```

### ❌ DANGEROUS SCRIPT PATTERNS
```javascript
// ❌ BAD: Mass operations
const targetFiles = glob.sync('src/**/*.{ts,tsx}');

// ❌ BAD: Property access destruction
content.replace(/(\w+)\.(\w+)/g, '$1$2');

// ❌ BAD: Unconstrained regex
content.replace(/old/g, 'new');

// ❌ BAD: No dry-run support
fs.writeFileSync(file, newContent);

// ❌ EXTREMELY BAD: Removing dots
content.replace(/\./g, '');
```

## 🚨 RED FLAG INDICATORS

### Stop Immediately If:
- Script affects 10+ files (reduced threshold)
- Using `$1/$2` or complex capture groups for property access
- Script name contains "Phase", "All", "Mass", "Global"
- Claims to eliminate 100+ errors
- Modifies dot operators in any way
- No clear rollback strategy
- Changes cross multiple subsystems
- Regex patterns not tested on sample files
- "Success" seems too good to be true

## ⚡ EMERGENCY PROCEDURES

### If Script Causes Damage:
1. **STOP IMMEDIATELY** - Don't run more scripts
2. **Check git status** - Assess damage scope
3. **Rollback if possible**: `git checkout -- .` or `git reset --hard`
4. **Verify build works**: `yarn build`
5. **Check error counts**: `yarn tsc --noEmit | grep "error TS" | wc -l`
6. **Document the failure** - What went wrong and why
7. **Fix manually** - Address issues individually
8. **Update prevention rules** - Learn from the failure

## 📊 SCRIPT QUALITY CHECKLIST

Before ANY script execution:
- [ ] Affects fewer than 3 files
- [ ] Has comprehensive dry-run mode
- [ ] Changes are reviewable and specific
- [ ] Targets single, well-defined issue
- [ ] Has clear success/failure criteria
- [ ] Includes rollback instructions
- [ ] Tested on sample files first
- [ ] No regex with property access modification
- [ ] Manually verified all dot notation preserved
- [ ] Claims realistic error reduction numbers

## 🔒 PHASE 16B DISASTER ANALYSIS

### What Went Wrong:
- Regex patterns destroyed property access: `obj.property` → `objproperty`
- Method calls corrupted: `string.toLowerCase()` → `stringtoLowerCase()`
- Syntax errors masked the actual TS2339 errors we were trying to fix
- 100% success claim should have been immediately suspicious
- No manual verification of critical changes

### Prevention:
- **NEVER trust massive error reduction claims**
- **ALWAYS manually verify property access patterns**
- **NEVER use regex on dot operators**
- **ALWAYS test syntax compilation after changes**

## 🔒 ENFORCEMENT

### Cursor AI Guidelines:
- **NEVER suggest mass scripts** without explicit user override
- **ALWAYS recommend individual file fixes** over broad operations
- **REQUIRE dry-run demonstration** before script approval
- **WARN about dangerous patterns** in script suggestions
- **SUGGEST alternative approaches** that are safer
- **QUESTION any script claiming >50 error fixes**

### Project Integration:
- Add these rules to project documentation
- Reference in all script directories
- Include in onboarding materials
- Review after any script-related incidents
- **Mandatory review after Phase 16B-type disasters** 