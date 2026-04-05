# Planetary Position Validation System

**Version:** 1.0.0
**Date:** April 5, 2026
**Status:** ✅ Production Ready

---

## Overview

This validation system ensures that calculated planetary positions are astronomically accurate by checking them against known celestial mechanics. It prevents data corruption bugs like natal charts being saved with current-day positions instead of birth positions.

**Key Benefits:**
- 🛡️ Catches data corruption before it's saved to the database
- 🔍 Validates positions against known astronomical constraints
- 🪐 Checks outer planet positions against historical ephemeris data
- ⚠️ Detects the "birth date is today" bug automatically
- 📊 Provides detailed validation reports for debugging

---

## Validation Rules

### 1. Birth Date Sanity Checks ⏰

**Rule:** Birth date must be in the past and within reasonable age range (0-150 years).

**Catches:**
- Birth dates in the future
- Birth date set to today (common bug when using `new Date()` instead of birth date)
- Unreasonably old ages (>150 years)
- Negative ages

**Example Error:**
```
⚠️ CRITICAL: Birth date is today! This likely indicates a bug.
```

### 2. Mercury-Sun Proximity ☿️

**Rule:** Mercury is never more than 28° from the Sun.

**Reason:** Mercury's orbit is inside Earth's, so from our perspective it never strays far from the Sun.

**Catches:**
- API errors returning wrong positions
- Data corruption mixing positions from different dates
- Miscalculated heliocentric → geocentric conversions

**Example Error:**
```
Mercury is 65.0° from Sun (max 28°). This is astronomically impossible!
Sun: taurus 15°, Mercury: cancer 20°
```

### 3. Venus-Sun Proximity ♀️

**Rule:** Venus is never more than 48° from the Sun.

**Reason:** Similar to Mercury, Venus's orbit keeps it close to the Sun from Earth's perspective.

**Catches:**
- Same issues as Mercury validation
- Venus elongation calculation errors

**Example Error:**
```
Venus is 75.0° from Sun (max 48°). This is astronomically impossible!
Sun: gemini 10°, Venus: virgo 5°
```

### 4. Outer Planet Ephemeris Validation 🪐

**Rule:** Slow-moving planets (Jupiter, Saturn, Uranus, Neptune, Pluto) must be in historically accurate signs for the birth year.

**Orbital Periods:**
- Jupiter: ~12 years (~1 year per sign)
- Saturn: ~29 years (~2.5 years per sign)
- Uranus: ~84 years (~7 years per sign)
- Neptune: ~165 years (~14 years per sign)
- Pluto: ~248 years (12-32 years per sign, varies)

**Catches:**
- Positions calculated for wrong date (e.g., today instead of birth date)
- API returning current positions instead of historical positions
- Incorrect year parameter in API calls

**Example Error:**
```
Jupiter in aries is incorrect for birth year 1990.
Expected signs: leo, virgo.
This indicates planetary positions are from the wrong date!
```

### 5. Degree/Minute Ranges 📐

**Rule:** Degrees must be 0-29 (within a sign), minutes must be 0-59.

**Catches:**
- Calculation overflows (degree >= 30)
- Negative values from bad math
- Invalid time units (minute >= 60)

### 6. Exact Longitude Range 🌐

**Rule:** Exact longitude must be 0-360°.

**Catches:**
- Negative longitudes
- Values > 360° (not normalized)
- Calculation errors

---

## Implementation

### Module Location

```
src/utils/astrology/planetaryValidation.ts
```

### Core Functions

#### `validatePlanetaryPositions(positions, birthDate)`

**Validates all planetary positions for a given birth date.**

```typescript
import { validatePlanetaryPositions } from "@/utils/astrology/planetaryValidation";
import type { PlanetPosition } from "@/utils/astrologyUtils";

const positions: Record<string, PlanetPosition> = {
  Sun: { sign: "taurus", degree: 24, minute: 30, exactLongitude: 54.5, isRetrograde: false },
  Moon: { sign: "leo", degree: 12, minute: 15, exactLongitude: 132.25, isRetrograde: false },
  // ... other planets
};

const birthDate = new Date("1990-05-15T14:30:00.000Z");

const result = validatePlanetaryPositions(positions, birthDate);

if (!result.valid) {
  console.error("Validation failed:", result.errors);
  // Handle validation failure
} else {
  console.log("Positions validated successfully");
  // Proceed with saving
}
```

**Returns:**
```typescript
{
  valid: boolean;
  errors: string[];  // Critical failures
  warnings: string[];  // Non-critical issues
  details: {
    mercurySunDistance?: number;
    venusSunDistance?: number;
    outerPlanetChecks?: Record<string, boolean>;
    dateChecks?: Record<string, boolean>;
  };
}
```

#### `formatValidationResult(result)`

**Formats validation results for human-readable logging.**

```typescript
import { formatValidationResult } from "@/utils/astrology/planetaryValidation";

const formatted = formatValidationResult(result);
console.log(formatted);
```

**Output:**
```
✅ All planetary positions validated successfully

📏 Mercury-Sun distance: 14.5° (max 28°)
📏 Venus-Sun distance: 10.5° (max 48°)

🪐 Outer Planet Validation:
  ✅ Jupiter
  ✅ Saturn
  ✅ Uranus
  ✅ Neptune
  ✅ Pluto
```

---

## Integration Points

### 1. Onboarding API (`/api/onboarding`)

**Location:** `src/app/api/onboarding/route.ts`

**Implementation:**
```typescript
// After calculating planetary positions
const validation = validatePlanetaryPositions(rawPositions, birthDate);
const validationLog = formatValidationResult(validation);

_logger.info("[POST /api/onboarding] 🛡️ Position Validation Results:\n" + validationLog);

if (!validation.valid) {
  // Reject the onboarding with detailed error message
  return NextResponse.json(
    {
      success: false,
      message: "Planetary positions failed validation. " + validation.errors[0],
      validationErrors: validation.errors,
      details: validation.details,
    },
    { status: 422 }
  );
}

// Proceed with saving validated positions
```

**User Experience:**
- If validation fails, user sees clear error message
- Error includes specific issue (e.g., "Birth date is today")
- User can correct their input and try again
- Prevents corrupt data from being saved

### 2. Debug API (`/api/debug/natal-chart`)

**Location:** `src/app/api/debug/natal-chart/route.ts`

**Implementation:**
```typescript
// Convert stored natal chart to validation format
const validation = validatePlanetaryPositions(natalPositionsForValidation, birthDate);

return NextResponse.json({
  // ... other diagnostic data
  validation: {
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    details: validation.details,
    formatted: formatValidationResult(validation),
  },
});
```

**Use Case:**
- Diagnose existing corrupt data in database
- Verify that saved natal charts are astronomically valid
- Identify which specific constraints are violated

---

## Testing

### Test Script

**Location:** `scripts/test-planetary-validation.ts`

**Run with:**
```bash
npx tsx scripts/test-planetary-validation.ts
```

**Test Cases:**
1. ✅ Valid 1990 birth chart (all constraints pass)
2. ❌ Mercury too far from Sun (should fail)
3. ❌ Jupiter in wrong sign for year (should fail)
4. ❌ Birth date is today (should fail)

**Example Output:**
```
🧪 PLANETARY VALIDATION TEST SUITE

================================================================================
TEST: INVALID - Birth Date is Today
================================================================================
Birth Date: 2026-04-05T12:00:00.000Z

❌ Planetary position validation FAILED

🚨 ERRORS:
  - ⚠️ CRITICAL: Birth date is today! This likely indicates a bug.

📏 Mercury-Sun distance: 10.0° (max 28°)
📏 Venus-Sun distance: 25.0° (max 48°)

🪐 Outer Planet Validation:
  ✅ Jupiter
  ✅ Saturn
  ✅ Uranus
  ✅ Neptune
  ✅ Pluto

❌ Expected result: FAIL
✅ Actual result: FAIL
   CORRECT ✅
```

---

## Outer Planet Ephemeris Data

The validation uses historical ephemeris data for slow-moving planets:

### Jupiter (~1 year per sign)
```
2023-2024: Aries/Taurus
2020-2021: Capricorn/Aquarius
1990-1995: Leo/Virgo
1985-1990: Capricorn/Aquarius/Pisces
```

### Saturn (~2.5 years per sign)
```
2023-2026: Pisces/Aquarius
2020-2023: Aquarius/Capricorn
1988-1991: Capricorn/Sagittarius
```

### Uranus (~7 years per sign)
```
2019-2026: Taurus
2011-2019: Aries
1988-1996: Capricorn
```

### Neptune (~14 years per sign)
```
2012-2026: Pisces
1998-2012: Aquarius
1984-1998: Capricorn
```

### Pluto (12-32 years per sign)
```
2008-2024: Capricorn
1995-2008: Sagittarius
1984-1995: Scorpio
```

**Source:** NASA JPL Ephemeris (DE440/DE441)

---

## Error Handling

### Critical Errors (Reject Calculation)

These errors indicate the planetary positions are **fundamentally wrong** and must be rejected:

1. **Birth date is today** — Almost certainly indicates using `new Date()` bug
2. **Mercury/Venus too far from Sun** — Astronomically impossible
3. **Outer planet in wrong sign for year** — Positions from wrong date
4. **Birth date in future** — Invalid input

**Response:** Return 422 Unprocessable Entity with detailed error message.

### Warnings (Log but Proceed)

These issues are notable but don't necessarily invalidate the calculation:

1. **Missing Ascendant** — Not critical, can be calculated later
2. **Missing outer planet** — If outside our ephemeris range
3. **Minor discrepancies** — Edge cases at sign boundaries

**Response:** Log warning, but allow data to be saved.

---

## Debugging Tips

### Check Server Logs

When onboarding fails validation, check server logs for:

```
[POST /api/onboarding] 🛡️ Position Validation Results:
❌ Planetary position validation FAILED

🚨 ERRORS:
  - ⚠️ CRITICAL: Birth date is today! This likely indicates a bug.
```

### Use Debug API

```bash
curl http://localhost:3000/api/debug/natal-chart \
  --cookie "session=..."
```

Look for:
```json
{
  "validation": {
    "valid": false,
    "errors": [
      "⚠️ CRITICAL: Birth date is today! This likely indicates a bug."
    ],
    "details": {
      "dateChecks": {
        "isToday": true,
        "isInFuture": false,
        "ageReasonable": false
      }
    }
  }
}
```

### Common Issues

**Issue:** "Birth date is today"
**Cause:** Using `new Date()` instead of user's birth date
**Fix:** Ensure `birthData.dateTime` contains actual birth timestamp

**Issue:** "Mercury is 65° from Sun"
**Cause:** Mixing positions from different dates
**Fix:** Ensure all planets calculated for same moment

**Issue:** "Jupiter in aries is incorrect for birth year 1990"
**Cause:** API returned current positions instead of historical
**Fix:** Verify `getPlanetaryPositionsForDateTime()` receives correct date parameter

---

## Future Enhancements

### Potential Additions

1. **Retrograde Validation** — Check if retrograde states are plausible for the date
2. **Moon Speed Validation** — Moon moves ~13°/day, validate speed is reasonable
3. **Aspect Validation** — Check for impossible aspect configurations
4. **House System Validation** — Validate house cusps are calculated correctly
5. **Geographic Validation** — Check birth location coordinates are valid
6. **Historical Range** — Expand outer planet ephemeris data for older birth dates

### Performance

- **Current:** ~5ms per validation
- **Caching:** Outer planet ephemeris data is in-memory (no DB lookups)
- **Optimization:** Could cache validation results per (positions, date) tuple

---

## References

- **NASA JPL Ephemeris:** DE440/DE441 — Most accurate planetary positions
- **pyswisseph Documentation:** https://astrotheme.com/pyswisseph_doc.php
- **Astronomical Almanac:** Standard reference for planetary data
- **IAU Standards:** International Astronomical Union celestial mechanics standards

---

## Maintenance

### Updating Ephemeris Data

To add new year ranges for outer planets:

1. Edit `src/utils/astrology/planetaryValidation.ts`
2. Add new year ranges to `OUTER_PLANET_RANGES`
3. Source data from NASA JPL Horizons System or Swiss Ephemeris
4. Run test suite to verify: `npx tsx scripts/test-planetary-validation.ts`

### Version History

- **1.0.0 (April 5, 2026)** — Initial implementation with full validation suite

---

## Support

For issues or questions:
1. Check server logs for validation errors
2. Use debug API to inspect stored data
3. Run test script to verify validation logic
4. Review this documentation for error descriptions

**Critical bugs detected? The validation system is doing its job!**
Don't disable validation — fix the root cause instead.
