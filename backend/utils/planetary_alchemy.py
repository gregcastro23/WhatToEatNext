"""
Planetary Alchemy & ESMS Physics Engine - Python Implementation

Authoritative source for ESMS properties (Spirit, Essence, Matter, Substance),
Sectarian logic (Day vs Night), dynamic Ascendant positional vessel,
and geocentric distance physics (M/r^2 inertia, M/r^3 tidal pull).

Strictly adheres to Unified Physics Model v2 specifications.
"""

import math
from typing import Dict, Any, Tuple, Optional

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

# Mean Geocentric Distances (in AU) for Inverse Physics (r^2 / r^3)
PLANET_MEAN_DISTANCES: Dict[str, float] = {
    "Sun":       1.000,
    "Moon":      1.000, # normalized relative geocentric baseline
    "Mercury":   1.000,
    "Venus":     0.723,
    "Mars":      1.524,
    "Jupiter":   5.204,
    "Saturn":    9.582,
    "Uranus":   19.200,
    "Neptune":  30.050,
    "Pluto":    39.480,
    "Ascendant": 1.000,
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

def get_gravitational_inertia(planet: str, distance_au: Optional[float] = None) -> float:
    """
    Computes true gravitational inertia M / r^2.
    Uses log-normalized weight for mass M, and geocentric distance r in AU.
    """
    mass = get_normalized_alchm_weight(planet)
    r = distance_au if (distance_au is not None and distance_au > 0) else PLANET_MEAN_DISTANCES.get(planet, 1.0)
    return mass / (r ** 2)

def get_tidal_pull(planet: str, distance_au: Optional[float] = None) -> float:
    """
    Computes tidal pull M / r^3.
    """
    mass = get_normalized_alchm_weight(planet)
    r = distance_au if (distance_au is not None and distance_au > 0) else PLANET_MEAN_DISTANCES.get(planet, 1.0)
    return mass / (r ** 3)

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
