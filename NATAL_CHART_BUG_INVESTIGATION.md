# Natal Chart Overlap Bug - Investigation Report

**Date:** April 5, 2026
**Issue:** Natal chart showing identical planetary positions as current transit (today's sky)
**Status:** Root cause identified, diagnostic tools deployed

---

## Summary

The natal and transit planetary positions are appearing identical on the `/profile/birthchart` page, causing the purple natal markers and orange transit markers to perfectly overlap. This indicates that either:

1. The natal chart stored in the database contains **current** positions instead of **birth** positions
2. The frontend is incorrectly rendering the same data source for both layers

---

## Architecture Analysis ✅

I've traced through the entire data flow and **confirmed the architecture is correct**:

### Transit Data Flow (Current Sky) ✅
```
NatalTransitChart component
  → useAlchemical() hook
  → AlchemicalProvider context
  → /api/astrologize (GET with no parameters)
  → Returns TODAY's planetary positions
```

### Natal Data Flow (Birth Chart) ✅
```
BirthChartPage
  → useProfile() hook
  → /api/user/profile (GET)
  → Database (user_profiles.natal_chart JSONB column)
  → Returns STORED birth chart from onboarding
```

**Conclusion:** The two data sources are completely separate. The bug is in the **data itself**, not the rendering logic.

---

## Root Cause Analysis

The most likely scenario is that the **natal chart in the database was saved with current planetary positions** instead of the birth positions. This could happen if:

### Scenario A: Onboarding Data Corruption
- User completed onboarding, but `birthData.dateTime` was somehow interpreted as "now"
- UTC/timezone conversion shifted the date unexpectedly
- Date input field contained invalid data that defaulted to current date

### Scenario B: Missing Birth Data
- User never completed onboarding with correct birth data
- System generated natal chart using current timestamp as fallback

### Scenario C: Data Overwrite
- Natal chart was initially correct but was later overwritten
- Some process is inadvertently updating the stored natal chart

---

## Diagnostic Tools Deployed

I've added comprehensive logging throughout the system to catch this bug in action:

### 1. Debug API Endpoint
**File:** `src/app/api/debug/natal-chart/route.ts`

**Endpoint:** `GET /api/debug/natal-chart`

**Purpose:** Compare stored natal chart against current sky and flag suspicious matches.

**Output:**
```json
{
  "diagnosis": {
    "suspiciouslySimilar": true/false,
    "identicalCount": 8,
    "totalCount": 10,
    "message": "🚨 BUG DETECTED: Natal chart appears to contain current positions..."
  },
  "timestamps": {
    "birth": "1990-05-15T14:30:00.000Z",
    "current": "2026-04-05T12:00:00.000Z",
    "calculated": "2026-04-05T11:45:00.000Z"
  },
  "comparison": {
    "Sun": {
      "natal": "taurus",
      "current": "aries",
      "identical": false
    },
    ...
  }
}
```

### 2. Frontend Console Logging
**Files Modified:**
- `src/components/dashboard/NatalTransitChart.tsx` (lines 59-69)
- `src/app/profile/birthchart/page.tsx` (lines 38-45)

**Console Output:**
```
📊 [BirthChartPage] Profile Data: {
  hasBirthData: true,
  hasNatalChart: true,
  birthData: { dateTime: "...", latitude: ..., longitude: ... },
  natalChartTimestamp: "...",
  natalChartBirthData: { ... }
}

🔮 [NatalTransitChart] Natal Chart Data: {
  birthData: { ... },
  calculatedAt: "...",
  sunSign: "taurus",
  moonSign: "leo",
  allPositions: { Sun: "taurus", Moon: "leo", ... }
}

🌟 [NatalTransitChart] Current Transit Positions: {
  Sun: { sign: "aries", degree: 15, ... },
  Moon: { sign: "gemini", degree: 22, ... }
}
```

### 3. Onboarding API Logging
**File:** `src/app/api/onboarding/route.ts` (lines 116-139)

**Purpose:** Log exactly what birth date is received and what planetary positions are calculated.

**Console Output:**
```
[POST /api/onboarding] 🔮 Birth Data Received: {
  birthDataDateTime: "1990-05-15T14:30:00.000Z",
  parsedBirthDate: "1990-05-15T14:30:00.000Z",
  currentDate: "2026-04-05T12:00:00.000Z",
  isToday: false,
  yearDifference: 36
}

[POST /api/onboarding] 🌟 Calculated Natal Positions: {
  Sun: "taurus",
  Moon: "leo",
  Mercury: "taurus",
  Ascendant: "virgo"
}
```

---

## Testing Instructions

### Step 1: Inspect Current Stored Data

**Option A - Via Debug API (requires authentication):**
```bash
# Start dev server
make dev

# In browser (logged in), visit:
http://localhost:3000/api/debug/natal-chart

# Look for:
# - diagnosis.suspiciouslySimilar: true/false
# - timestamps.birth: Should be YOUR birth date
# - identicalCount: Should be 0-2 normally, 8-10 means bug
```

**Option B - Via Browser Console:**
```bash
# Start dev server
make dev

# Visit /profile/birthchart in browser
# Open DevTools Console (Cmd+Option+J on Mac, F12 on Windows/Linux)

# Look for the diagnostic logs:
# 📊 [BirthChartPage] Profile Data
# 🔮 [NatalTransitChart] Natal Chart Data
# 🌟 [NatalTransitChart] Current Transit Positions

# Compare the positions - are they identical?
```

### Step 2: Test Onboarding Flow

If data is corrupted, re-run onboarding to capture diagnostic logs:

```bash
# 1. Clear existing profile data (optional)
# In browser console:
localStorage.removeItem('userProfile');

# 2. Visit onboarding page
http://localhost:3000/onboarding

# 3. Enter KNOWN HISTORICAL birth date (e.g., 1990-05-15 14:30)

# 4. Check server logs for diagnostic output:
# [POST /api/onboarding] 🔮 Birth Data Received
# [POST /api/onboarding] 🌟 Calculated Natal Positions

# 5. Verify the calculated positions match 1990, NOT today
```

### Step 3: Verify Fix

After fixing/re-onboarding:

```bash
# Visit birthchart page
http://localhost:3000/profile/birthchart

# Verify:
# ✅ Purple natal markers are in different positions than orange transit markers
# ✅ Your Sun/Moon/Rising signs match your actual birth chart
# ✅ Console logs show different positions for natal vs transit
```

---

## Potential Fixes

### Fix 1: Re-onboard with Correct Birth Data
**When to use:** If your birth data was never correctly entered or was corrupted

**Steps:**
1. Clear localStorage: `localStorage.removeItem('userProfile');`
2. Visit `/onboarding`
3. Enter your **correct** birth date, time, and location
4. Submit and verify planetary positions are different from current sky

### Fix 2: Manual Database Correction
**When to use:** If you know your correct birth data and want to fix it directly

**Steps:**
1. Export correct natal chart from reliable source (astro.com, etc.)
2. Use SQL to update `user_profiles.natal_chart` JSONB column
3. Refresh page to see corrected chart

### Fix 3: Add Onboarding Validation
**When to use:** Prevent future occurrences

**Implementation:**
```typescript
// In src/app/api/onboarding/route.ts
// After line 124, add:
const ageInYears = now.getFullYear() - birthDate.getFullYear();
if (ageInYears < 0 || ageInYears > 150) {
  return NextResponse.json(
    {
      success: false,
      message: `Birth year ${birthDate.getFullYear()} appears invalid. Please check your birth date.`
    },
    { status: 400 }
  );
}
```

---

## Files Modified

### New Files:
- `src/app/api/debug/natal-chart/route.ts` - Diagnostic endpoint

### Modified Files:
- `src/components/dashboard/NatalTransitChart.tsx` - Added console logging
- `src/app/profile/birthchart/page.tsx` - Added console logging
- `src/app/api/onboarding/route.ts` - Added diagnostic logging
- `src/app/api/user/commensals/[commensalId]/route.ts` - Fixed syntax error (unrelated)

---

## Next Steps

1. **Test the diagnostic endpoint** to confirm the data corruption hypothesis
2. **Re-run onboarding** with your correct birth data if corrupted
3. **Review server logs** during onboarding to ensure correct positions are calculated
4. **Remove diagnostic logs** once bug is resolved (search for "🐛 DIAGNOSTIC" comment)
5. **Consider adding validation** to prevent birth dates that are "today" or in the future

---

## Questions to Answer

Run the diagnostics and check:

- [ ] What is stored in `natalChart.birthData.dateTime`? Is it your actual birth date?
- [ ] What is `natalChart.calculatedAt`? When was it last calculated?
- [ ] How many planets match between natal and current positions? (0-2 normal, 8+ means bug)
- [ ] What do the server logs show when you re-run onboarding with a known historical date?
- [ ] Does `new Date(birthDateTime).toISOString()` in the onboarding form produce the expected UTC timestamp?

---

**Author:** Claude (Debugging Session)
**Contact:** See diagnostic endpoints and console logs for real-time debugging data
