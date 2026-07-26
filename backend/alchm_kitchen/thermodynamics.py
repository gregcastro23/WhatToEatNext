"""The kalchm / monica engine — the ONE implementation in the Python runtime.

Deliberately a standalone module with **no framework imports**. It is pure
arithmetic, and the cross-runtime parity gate that guards it
(``backend/tests/test_kalchm_parity.py``) must be runnable on a bare Python
without FastAPI, SQLAlchemy or pyswisseph installed. When this lived inside
``main.py`` the test could not be collected at all — importing it pulled in the
whole web application — which is precisely the shape of gate that ends up
skipped in CI and then reported as green.

Pinned to the TypeScript canonical engine
(``src/data/unified/alchemicalCalculations.ts``) by shared golden vectors in
``backend/tests/kalchm_golden_vectors.json``.
"""
import math

# ── The kalchm/monica engine constants, ported from TypeScript ───────────────
#
# This is the SECOND runtime that computes kalchm, so these must stay pinned to
# src/data/unified/alchemicalCalculations.ts. The shared golden vectors in
# backend/tests/test_kalchm_parity.py assert both runtimes agree bit-for-bit;
# change a value here and that test fails.
#
# DERIVED, not tuned: the midpoint of a MEASURED bimodal gap in |ln kalchm| over
# the single-body grid (11 planets x 12 signs x 30 degrees x 2 sects = 7920
# points, a census not a sample). The degenerate cluster ends at exactly 0 and
# the healthy values begin at 0.21878586815274545. The TS side re-derives both
# endpoints in src/__tests__/monicaLnEpsilonDerivation.test.ts and FAILS if the
# grid moves — update this literal in lockstep, never independently.
MONICA_LN_EPSILON = 0.10939293407637272

# The harmonic-ideal monica (golden ratio), returned for a perfectly balanced
# (degenerate) alchemical state. monica is TOTAL: it is always finite, and this
# engine never returns None or NaN.
MONICA_EQUILIBRIUM = 1.618

# Divide-by-zero guard for reactivity. Not derived — reactivity has no bimodal
# structure to place it in; its only requirement is being small relative to real
# reactivities, which it is.
KALCHM_EPSILON = 0.01

# Floor for the heat/entropy/reactivity denominators, matching
# THERMO_DEN_FLOOR in src/data/unified/alchemicalCalculations.ts. Unlike the
# kalchm denominator (which cannot reach 0 because x^x >= 0.6922), these three
# ARE genuinely reachable at 0, so a guard is required. It must be a FLOOR and
# not the truthiness fallback `(den or 1)` this file used: `or 1` substitutes
# 1 for a zero denominator, which is 100x smaller than the floored value and
# therefore understates the quantity by 100x at exactly the point where it
# matters most.
THERMO_DEN_FLOOR = 0.01


def compute_kalchm_monica(
    spirit: float,
    essence: float,
    matter: float,
    substance: float,
    reactivity: float,
    gregs_energy: float,
) -> tuple:
    """The ONE kalchm/monica implementation in the Python runtime.

    kalchm = (S^S * E^E) / (M^M * Su^Su),  monica = -gregsEnergy / (reactivity * ln kalchm)

    Mirrors ``calculateKalchm`` / ``calculateMonica`` in
    ``src/data/unified/alchemicalCalculations.ts``. Every behaviour below was
    measured against that module over shared golden vectors; see
    ``backend/tests/test_kalchm_parity.py``.

    Three defects this replaces, each verified before removal:

    1. ``(kalchm_denominator or 1)`` — a truthiness fallback. It was unreachable
       for real input (x^x has a global minimum of 0.6922006275556402 at x=1/e,
       so the denominator is never 0 for non-negative axes) and actively WRONG
       for a negative one, because a complex denominator of 0+0j is falsy.
    2. Unclamped negatives. Python's ``**`` returns a COMPLEX number for a
       negative base with a fractional exponent — ``(-0.5) ** (-0.5)`` is
       ``8.66e-17-1.414j`` — where JS ``Math.pow`` returns NaN. That complex
       value then raised ``TypeError: '>' not supported between instances of
       'complex' and 'int'``, surfacing as an HTTP 500. Clamping negatives to 0
       makes the two runtimes agree in TYPE as well as value.
    3. ``monica = 1.0`` — a fabricated literal, neither the equilibrium constant
       nor an honest absence. Worse, the guard was the bare ``ln_k != 0``, which
       excludes only the single point ln_k == 0 and does nothing about ln_k
       merely SMALL: at kalchm = 1.00002 it returned -49999.5 where canonical
       returns phi, a ~31000x error that is finite and plausible-looking, so it
       survives every downstream ``isfinite`` check and reaches the database.
    """
    # Clamp NEGATIVES only. Zero passes through untouched because 0**0 is
    # exactly 1 — the true limit of x^x — so a zeroed axis needs no handling.
    def non_neg(x: float) -> float:
        return x if x > 0 else 0.0

    s = non_neg(spirit)
    e = non_neg(essence)
    m = non_neg(matter)
    sub = non_neg(substance)

    kalchm = ((s ** s) * (e ** e)) / ((m ** m) * (sub ** sub))
    if not math.isfinite(kalchm) or kalchm <= 0:
        return 1.0, MONICA_EQUILIBRIUM

    # A degenerate BAND, not a bare `!= 0`. Inside it the chart is at
    # equilibrium and monica is the golden ratio rather than a divergence.
    ln_k = math.log(kalchm)
    if abs(ln_k) < MONICA_LN_EPSILON:
        return kalchm, MONICA_EQUILIBRIUM

    safe_reactivity = reactivity
    if abs(reactivity) < KALCHM_EPSILON:
        safe_reactivity = math.copysign(KALCHM_EPSILON, reactivity if reactivity else 1.0)

    monica = -gregs_energy / (safe_reactivity * ln_k)
    # Totality: never NaN, never None, never infinite.
    return kalchm, (monica if math.isfinite(monica) else MONICA_EQUILIBRIUM)


# ── Planet -> ESMS, by sect ─────────────────────────────────────────────────
#
# The SECOND copy of this table in the project. The first is
# `PLANETARY_SECTARIAN_ESMS` in src/utils/planetaryAlchemyMapping.ts, which is
# canonical: it is what the chart engine, RealAlchemizeService and all three
# agent-monica constructions read.
#
# A second copy is a divergence hazard of exactly the kind this module exists to
# contain — a Python reactivity formula silently drifted from its TypeScript
# original for months and was 3.17x wrong. So this copy is NOT trusted on sight:
# backend/tests/kalchm_golden_vectors.json carries the table as generated FROM
# the TypeScript source, and test_kalchm_parity.py asserts this dict equals it
# entry for entry, both sects. If someone edits one side only, that test fails.
#
# Ascendant is not a planet. It is the GROUNDING VESSEL: without it a single
# body contributes to at most one axis, three axes are 0, and kalchm collapses to
# a degenerate value carrying no information. It is what makes a one-body
# reading meaningful, and it is why it is 1 on every axis in both sects.
PLANETARY_SECTARIAN_ESMS: dict[str, dict[str, dict[str, float]]] = {
    "Sun":       {"diurnal": {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 0}},
    "Moon":      {"diurnal": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 0, "Matter": 1, "Substance": 0}},
    "Mercury":   {"diurnal": {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 0, "Matter": 0, "Substance": 1}},
    "Venus":     {"diurnal": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 0, "Matter": 1, "Substance": 0}},
    "Mars":      {"diurnal": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 0, "Matter": 1, "Substance": 0}},
    "Jupiter":   {"diurnal": {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 0}},
    "Saturn":    {"diurnal": {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 0, "Matter": 1, "Substance": 0}},
    "Uranus":    {"diurnal": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 0, "Matter": 1, "Substance": 0}},
    "Neptune":   {"diurnal": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 0, "Matter": 0, "Substance": 1}},
    "Pluto":     {"diurnal": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 0},
                  "nocturnal": {"Spirit": 0, "Essence": 0, "Matter": 1, "Substance": 0}},
    "Ascendant": {"diurnal": {"Spirit": 1, "Essence": 1, "Matter": 1, "Substance": 1},
                  "nocturnal": {"Spirit": 1, "Essence": 1, "Matter": 1, "Substance": 1}},
}

AXES = ("Spirit", "Essence", "Matter", "Substance")


def planetary_hour_esms(ruler: str, is_daytime: bool) -> dict[str, float]:
    """ESMS for a single ruling planet, grounded by the Ascendant vessel.

    This is the SINGLE-BODY construction (§18c), the same shape the TypeScript
    side uses for a one-placement agent: the planet's own sectarian row plus the
    Ascendant vessel. The vessel is not decoration — drop it and Matter and
    Substance are both 0 for most rulers, which sends the denominator to 1 and
    makes kalchm depend on the numerator alone.

    An unknown ruler returns the vessel by itself rather than raising: this feeds
    a rate endpoint, and a KeyError there would be a 500. The vessel alone is
    ESMS (1,1,1,1) -> kalchm 1.0, which is honestly degenerate rather than wrong.
    """
    sect = "diurnal" if is_daytime else "nocturnal"
    vessel = PLANETARY_SECTARIAN_ESMS["Ascendant"][sect]
    row = PLANETARY_SECTARIAN_ESMS.get(ruler, {}).get(sect)
    if row is None:
        return {a: float(vessel[a]) for a in AXES}
    return {a: float(row[a] + vessel[a]) for a in AXES}
