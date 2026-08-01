"""
Planetary Alchemy & ESMS Physics Engine - Python Implementation

Authoritative source for ESMS properties (Spirit, Essence, Matter, Substance),
Sectarian logic (Day vs Night), dynamic Ascendant positional vessel,
and geocentric distance physics (M/r^2 inertia, M/r^3 tidal pull).

Strictly adheres to Unified Physics Model v2 specifications.
"""

import math
from typing import Dict, Any, List, Tuple, Optional

from backend.utils.aspect_esms_effects import (
    calculate_aspect_esms_modifications,
    calculate_aspects,
)
from backend.utils.dignity_scales import get_dignity_esms_multiplier

# Classical + Modern 10 Bodies + Ascendant Grounding Vessel
ESMS_PLANETS = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
]

# Baseline ESMS allocations per planet (Axiomatic)
PLANETARY_ALCHEMY: Dict[str, Dict[str, float]] = {
    "Sun":     {"Spirit": 1.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0},
    "Moon":    {"Spirit": 0.0, "Essence": 1.0, "Matter": 1.0, "Substance": 0.0},
    "Mercury": {"Spirit": 1.0, "Essence": 0.0, "Matter": 0.0, "Substance": 1.0},
    "Venus":   {"Spirit": 0.0, "Essence": 1.0, "Matter": 1.0, "Substance": 0.0},
    "Mars":    {"Spirit": 0.0, "Essence": 1.0, "Matter": 1.0, "Substance": 0.0},
    "Jupiter": {"Spirit": 1.0, "Essence": 1.0, "Matter": 0.0, "Substance": 0.0},
    "Saturn":  {"Spirit": 1.0, "Essence": 0.0, "Matter": 1.0, "Substance": 0.0},
    "Uranus":  {"Spirit": 0.0, "Essence": 1.0, "Matter": 1.0, "Substance": 0.0},
    "Neptune": {"Spirit": 0.0, "Essence": 1.0, "Matter": 0.0, "Substance": 1.0},
    "Pluto":   {"Spirit": 0.0, "Essence": 1.0, "Matter": 1.0, "Substance": 0.0},
}

# Sectarian ESMS Allocation (Diurnal vs Nocturnal)
PLANETARY_SECTARIAN_ESMS: Dict[str, Dict[str, Dict[str, float]]] = {
    "Sun": {
        "diurnal":   {"Spirit": 1.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 1.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0}, # Sun always Spirit
    },
    "Moon": {
        "diurnal":   {"Spirit": 0.0, "Essence": 1.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 0.0, "Matter": 1.0, "Substance": 0.0},
    },
    "Mercury": {
        "diurnal":   {"Spirit": 1.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 0.0, "Matter": 0.0, "Substance": 1.0},
    },
    "Venus": {
        "diurnal":   {"Spirit": 0.0, "Essence": 1.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 0.0, "Matter": 1.0, "Substance": 0.0},
    },
    "Mars": {
        "diurnal":   {"Spirit": 0.0, "Essence": 1.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 0.0, "Matter": 1.0, "Substance": 0.0},
    },
    "Jupiter": {
        "diurnal":   {"Spirit": 1.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 1.0, "Matter": 0.0, "Substance": 0.0},
    },
    "Saturn": {
        "diurnal":   {"Spirit": 1.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 0.0, "Matter": 1.0, "Substance": 0.0},
    },
    "Uranus": {
        "diurnal":   {"Spirit": 0.0, "Essence": 1.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 0.0, "Matter": 1.0, "Substance": 0.0},
    },
    "Neptune": {
        "diurnal":   {"Spirit": 0.0, "Essence": 1.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 0.0, "Matter": 0.0, "Substance": 1.0},
    },
    "Pluto": {
        "diurnal":   {"Spirit": 0.0, "Essence": 1.0, "Matter": 0.0, "Substance": 0.0},
        "nocturnal": {"Spirit": 0.0, "Essence": 0.0, "Matter": 1.0, "Substance": 0.0},
    },
    "Ascendant": {
        "diurnal":   {"Spirit": 1.0, "Essence": 1.0, "Matter": 1.0, "Substance": 1.0},
        "nocturnal": {"Spirit": 1.0, "Essence": 1.0, "Matter": 1.0, "Substance": 1.0},
    },
}

# Zodiac Sign to Element Mapping
ZODIAC_ELEMENTS: Dict[str, str] = {
    "aries": "Fire", "taurus": "Earth", "gemini": "Air", "cancer": "Water",
    "leo": "Fire", "virgo": "Earth", "libra": "Air", "scorpio": "Water",
    "sagittarius": "Fire", "capricorn": "Earth", "aquarius": "Air", "pisces": "Water",
}

# Orbital Period Weights for Alchm Thermodynamics (log10 normalized)
PLANET_ALCHM_PERIODS: Dict[str, float] = {
    "Pluto":      247.94,
    "Neptune":    164.79,
    "Uranus":      84.01,
    "Saturn":      29.46,
    "Jupiter":     11.86,
    "Mars":         1.88,
    "Sun":          1.00,
    "Venus":        0.615,
    "Mercury":      0.241,
    "Moon":         0.075,
    "Ascendant":    0.003, # 1 day physical vessel anchor
}

# Relative masses (Earth = 1.0) — ported verbatim from src/data/planets.ts
# PLANET_WEIGHTS. The RULED canonical mass basis for the Lambda(r) tensor
# ("physical mass, both runtimes" — spec §7). The old inertia here was
# ORBITAL-PERIOD-based, which diverged from TS by up to 2x per body.
PLANET_MASS_WEIGHTS: Dict[str, float] = {
    "Sun":     333054.2532,
    "Jupiter":    317.8165,
    "Saturn":      95.1608,
    "Neptune":     17.1467,
    "Uranus":      14.5362,
    "Earth":        1.0000,
    "Venus":        0.8150,
    "Mars":         0.1070,
    "Mercury":      0.0550,
    "Moon":         0.0123,
    "Pluto":        0.0022,
}

# Mean geocentric distances r-bar (AU) — BASIS: MEASURED over the 2026 epoch
# (astronomy-engine GeoVector, 6-hour grid, 1460 samples; the TS conformance
# suite re-derives them, and test_esms_conformance.py pins this table equal to
# the golden fixture's copy). Replaces PLANET_MEAN_DISTANCES, whose Moon/Mercury
# "1.000" entries were a silent fudge hiding the dimensional incoherence of
# M/r^2 with raw AU (real Moon distance made the live natal ESMS 99.99% Moon).
PLANET_MEAN_GEOCENTRIC_AU: Dict[str, float] = {
    "Sun":      1.0001517506922113,
    "Moon":     0.002571016680904456,
    "Mercury":  1.0527771261580632,
    "Venus":    1.0162138470401183,
    "Mars":     1.9442585501420186,
    "Jupiter":  5.429789190115696,
    "Saturn":   9.484384119258557,
    "Uranus":  19.49876988921305,
    "Neptune": 29.88354939796314,
    "Pluto":   35.52718536398905,
}

_PERIOD_LOG_MIN = math.log10(0.003)    # Ascendant (1 day)
_PERIOD_LOG_MAX = math.log10(247.94)   # Pluto

# The Ascendant is the "Physical Vessel" grounding anchor, not an orbiting body.
# RULED weight 1.0 — the SAME special case TypeScript applies on every period-scale
# path (src/utils/planetaryAlchemyMapping.ts `calculateESMSWithDegrees`:
# "fixed (+1) to anchor the system"; RealAlchemizeService.ts twice). This port
# originally DROPPED that special case, and because the period table's 0.003 entry
# IS the log-scale minimum, the normalizer returned exactly 0.0 for the Ascendant.
# The vessel — the mechanism that exists to prevent day-chart Matter/Substance
# collapse — was silently multiplied by zero, and 11/20 golden conformance charts
# (every diurnal one) collapsed to Matter = Substance = 0 (MEASURED 2026-07-31).
# Never derive this weight from the period table: an extremum-anchored scale
# annihilates whatever sits at its extremum.
ASCENDANT_VESSEL_WEIGHT = 1.0

def get_normalized_alchm_weight(planet: str) -> float:
    """Computes logarithmic weight [0, 1] based on orbital period.

    The Ascendant bypasses the period scale entirely — see ASCENDANT_VESSEL_WEIGHT.
    """
    if planet == "Ascendant":
        return ASCENDANT_VESSEL_WEIGHT
    period = PLANET_ALCHM_PERIODS.get(planet, 1.0)
    log_val = math.log10(max(period, 1e-9))
    return (log_val - _PERIOD_LOG_MIN) / (_PERIOD_LOG_MAX - _PERIOD_LOG_MIN)

# The inertial mass scale — physical mass, log-normalized, zero anchored OFF the
# charted set (RULED: one decade below Pluto, so no charted body is annihilated
# the way the period scale annihilated the Ascendant — see PR #683). Pluto lands
# at ~0.109, Sun at exactly 1.0. Mirrors inertialMassWeight in
# src/utils/planetaryAlchemyMapping.ts; the conformance fixtures pin the two.
_INERTIAL_LOG_MIN = math.log10(0.0022 / 10.0)  # one decade below Pluto — RULED
_INERTIAL_LOG_MAX = math.log10(333054.2532)    # Sun

def get_inertial_mass_weight(planet: str) -> float:
    """Physical-mass log weight for the Lambda(r) tensor. Ascendant is the RULED
    vessel anchor 1.0; see ASCENDANT_VESSEL_WEIGHT."""
    if planet == "Ascendant":
        return ASCENDANT_VESSEL_WEIGHT
    rel_mass = PLANET_MASS_WEIGHTS.get(planet, 1.0)
    return (math.log10(max(rel_mass, 1e-9)) - _INERTIAL_LOG_MIN) / (_INERTIAL_LOG_MAX - _INERTIAL_LOG_MIN)

def get_gravitational_inertia(planet: str, distance_au: Optional[float] = None) -> float:
    """
    Gravitational inertia under the RULED Lambda tensor (spec §7, option C):

        Lambda = diag( Mhat_k * (rbar_k / r_k)^2 )

    Dimensionless by construction. With no live distance, r = rbar and the
    factor is exactly 1 — the weight itself. The old M / r^2 with raw AU let the
    Moon's real distance (0.00257 AU) produce inertia 43,043 vs the Sun's 0.51,
    making live natal ESMS 99.99% Moon and overflowing canonical kalchm into the
    phi fallback (MEASURED — spec §7).
    """
    mass = get_inertial_mass_weight(planet)
    rbar = PLANET_MEAN_GEOCENTRIC_AU.get(planet)
    if rbar is None:
        return mass  # Ascendant / unknown: no distance concept, factor 1
    r = distance_au if (distance_au is not None and distance_au > 0) else rbar
    return mass * (rbar / r) ** 2

def get_tidal_pull(planet: str, distance_au: Optional[float] = None) -> float:
    """
    Tidal pull under the same RULED tensor: Mhat * (rbar / r)^3.
    """
    mass = get_inertial_mass_weight(planet)
    rbar = PLANET_MEAN_GEOCENTRIC_AU.get(planet)
    if rbar is None:
        return mass
    r = distance_au if (distance_au is not None and distance_au > 0) else rbar
    return mass * (rbar / r) ** 3

def calculate_positional_ascendant_vessel(sign: str, degree: float = 0.0) -> Dict[str, float]:
    """
    Calculates dynamic Ascendant Grounding Vessel based on sign element and decan.
    Prevents Day chart Matter/Substance collapse while introducing continuous positional modulation.
    Decans: 1st (0-10 deg), 2nd (10-20 deg), 3rd (20-30 deg).
    """
    sign_clean = sign.strip().lower()
    element = ZODIAC_ELEMENTS.get(sign_clean, "Earth")
    
    deg = max(0.0, min(29.999, float(degree)))
    decan_index = int(deg // 10)  # 0, 1, or 2
    
    # Base baseline: all ESMS receive at least 0.5 grounding
    vessel = {"Spirit": 0.5, "Essence": 0.5, "Matter": 0.5, "Substance": 0.5}
    
    # Element primary bias
    if element == "Fire":
        vessel["Spirit"] += 0.5
        vessel["Substance"] += 0.25
    elif element == "Earth":
        vessel["Matter"] += 0.5
        vessel["Substance"] += 0.25
    elif element == "Water":
        vessel["Essence"] += 0.5
        vessel["Matter"] += 0.25
    elif element == "Air":
        vessel["Spirit"] += 0.25
        vessel["Substance"] += 0.5
        
    # Decan secondary modulation
    if decan_index == 0:
        vessel["Matter"] += 0.1
    elif decan_index == 1:
        vessel["Essence"] += 0.1
    else:
        vessel["Spirit"] += 0.1
        
    return vessel


def calculate_alchemical_from_planets(
    planetary_positions: Dict[str, Any],
    is_diurnal: bool = True,
    aspects: Optional[List[Dict[str, Any]]] = None,
    inject_ascendant: bool = False,
) -> Dict[str, float]:
    """The canonical cross-runtime ESMS engine.

    Layer 1 is sectarian identity, Layer 2 is the +10/+7 dignity multiplier,
    and Layer 3 is the strength-weighted aspect field derived from the supplied
    longitudes. Every body uses the non-annihilating inertial mass scale and the
    ruled relative-distance tensor ``Mhat * (rbar/r)^2``.
    """
    totals = {"Spirit": 0.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0}
    sect_key = "diurnal" if is_diurnal else "nocturnal"
    positions = dict(planetary_positions)
    if inject_ascendant and "Ascendant" not in positions:
        positions["Ascendant"] = {"sign": "aries", "degree": 0.0}

    for body, raw_position in positions.items():
        body_clean = body.strip().title()
        if body_clean not in ESMS_PLANETS and body_clean != "Ascendant":
            continue

        if isinstance(raw_position, str):
            position = {"sign": raw_position}
        elif isinstance(raw_position, dict):
            position = raw_position
        else:
            continue

        sign = str(position.get("sign", "")).strip()
        if not sign:
            continue
        try:
            degree = float(position.get("degree", 0.0))
        except (TypeError, ValueError):
            degree = 0.0
        distance_au = position.get("distance", position.get("distanceAu"))
        if distance_au is not None:
            try:
                distance_au = float(distance_au)
            except (TypeError, ValueError):
                distance_au = None

        if body_clean == "Ascendant":
            base_esms = calculate_positional_ascendant_vessel(sign, degree)
        else:
            base_esms = PLANETARY_SECTARIAN_ESMS[body_clean][sect_key]
        inertia = get_gravitational_inertia(body_clean, distance_au)
        dignity_multiplier = get_dignity_esms_multiplier(body_clean, sign)

        for key in totals:
            totals[key] += base_esms[key] * inertia * dignity_multiplier

    aspect_positions = {
        body: position
        for body, position in planetary_positions.items()
        if (
            (body.strip().title() in ESMS_PLANETS or body.strip().title() == "Ascendant")
            and isinstance(position, dict)
        )
    }
    resolved_aspects = aspects if aspects is not None else calculate_aspects(aspect_positions)
    aspect_modifications = calculate_aspect_esms_modifications(resolved_aspects)
    for key in totals:
        totals[key] += aspect_modifications[key]

    return totals
