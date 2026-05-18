# ADR-002: Two-Tier Pricing (Apprentice / Alchemist)

**Status**: Accepted  
**Date**: 2026-05-09  
**Deciders**: Greg Castro  

---

## Context

The original design had three tiers: Apprentice (free), Practitioner ($9/mo), Alchemist ($19/mo). User interviews revealed:
- The middle tier was confusing ("what does Practitioner actually get me that Apprentice doesn't?")
- The gap between free and premium felt too large, but a $9 tier didn't justify the cognitive overhead
- Token economy (Spirit/Essence currencies) already creates a fine-grained usage throttle within free tier

The `/upgrade` gate needs to convert free users quickly. A three-tier choice creates decision paralysis at the most critical conversion moment.

## Decision

Collapse to **two tiers**:

| Tier | Name | Price | Differentiator |
|---|---|---|---|
| Free | Apprentice | $0 | Daily token allotment, basic recipe access, limited AI calls |
| Paid | Alchemist | $19/mo | Unlimited token allotment, all AI features, group commensal, device sessions |

**Practitioner features** (precision natal timing, advanced aspects) are bundled into the Alchemist tier rather than offered as a separate tier.

The `UpgradeGate` component shows only two options. `TIER_LIMITS` in `src/types/subscription.ts` has entries for `"free"` and `"premium"` (the internal name for Alchemist).

## Consequences

**Positive:**
- Single upgrade CTA — "Become an Alchemist" — no choice paralysis
- Marketing copy is simpler: free vs. everything
- Token economy handles fine-grained limits within free tier naturally

**Negative:**
- Cannot offer a "try premium features for a month" mid-price option without adding a tier back
- Some power users wanted Practitioner features at $9; they must pay $19 or stay free
- `subscription.tier` column in DB is `"free" | "premium"` — Alchemist is the marketing name for `"premium"` internally
