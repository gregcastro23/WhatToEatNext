# Wave 11 Quick Start Guide

## 🚀 **Immediate Commands to Run**

```bash
# 1. Get current explicit-any count
yarn lint 2>&1 | grep -c "@typescript-eslint/no-explicit-any"

# 2. Identify top targets for Wave 11
yarn lint --format json --max-warnings 10000 2>/dev/null | jq -r '.[] | select(.messages[]?.ruleId == "@typescript-eslint/no-explicit-any") | .filePath' | sort | uniq -c | sort -nr | head -15

# 3. Verify build stability
make build
```

## 📊 **Current Status**
- **Baseline:** 1,182 explicit-any warnings
- **Target:** <1,130 explicit-any warnings (4.4% reduction goal)
- **Last Commit:** `fcc1be5a` - Wave 10 completion

## 🎯 **Wave 11 Targets**
Select 3-5 files with 10+ any types each from the identification command above.

## 🛠️ **Proven Patterns to Apply**

### **Progressive Casting (100% Success Rate)**
```typescript
// Replace this:
(object as any).property

// With this:
(object as unknown as { property: PropertyType }).property
```

### **Service Layer Patterns**
```typescript
// Enterprise service casting
const service = ServiceClass as unknown as {
  initialize: (config: Record<string, unknown>) => Promise<void>;
  execute: (params: ParamType) => Promise<ResultType>;
}
```

### **Component State Patterns**
```typescript
// State with structured interfaces
const [state, setState] = useState<Record<string, unknown> | null>(null)
```

## ✅ **Quality Control Checklist**
- [ ] Build passes after each file (`make build`)
- [ ] No new TypeScript errors (`yarn tsc --noEmit --skipLibCheck`)
- [ ] Linting passes on modified files
- [ ] Functionality preserved
- [ ] Legitimate any types preserved with ESLint comments

## 📚 **Full Documentation**
See `CONTINUE_EXPLICIT_ANY_CAMPAIGN_WAVE_11.md` for complete details.

---

**Goal:** Eliminate 50+ explicit-any warnings while maintaining 100% build stability.
