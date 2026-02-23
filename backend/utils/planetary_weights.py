"""
Planetary Weight Constants
==========================

Single source of truth for each planet's physical mass used in alchemical
score calculations.  All values are sourced from NASA fact sheets.

Three scales are provided:
  - ``PLANET_MASS_KG``         — raw mass in kilograms
  - ``PLANET_MASS_RELATIVE``   — relative to Earth (Earth = 1.0)
  - ``PLANET_MASS_NORMALIZED`` — log-scaled to 0–1 so that the Sun maps to
                                  1.0 and Pluto maps near 0.0, preventing
                                  the gas giants from completely dominating
                                  score multiplications.

Usage::

    from backend.utils.planetary_weights import get_planet_weight, PLANET_MASS_NORMALIZED

    weight = get_planet_weight("Jupiter")          # normalized (default)
    weight = get_planet_weight("Jupiter", "relative")  # relative to Earth
    weight = get_planet_weight("Jupiter", "kg")    # raw kg
"""

import math
from typing import Dict

# ---------------------------------------------------------------------------
# Raw mass in kilograms (NASA planetary fact sheets)
# ---------------------------------------------------------------------------
PLANET_MASS_KG: Dict[str, float] = {
    "Sun":     1.989_000e30,
    "Moon":    7.342_000e22,
    "Mercury": 3.285_000e23,
    "Venus":   4.867_000e24,
    "Earth":   5.972_000e24,   # Reference – not a scoring planet but useful
    "Mars":    6.390_000e23,
    "Jupiter": 1.898_000e27,
    "Saturn":  5.683_000e26,
    "Uranus":  8.681_000e25,
    "Neptune": 1.024_000e26,
    "Pluto":   1.309_000e22,
}

# ---------------------------------------------------------------------------
# Relative to Earth (Earth = 1.0)
# ---------------------------------------------------------------------------
_EARTH_MASS_KG: float = PLANET_MASS_KG["Earth"]

PLANET_MASS_RELATIVE: Dict[str, float] = {
    planet: round(mass / _EARTH_MASS_KG, 4)
    for planet, mass in PLANET_MASS_KG.items()
}

# ---------------------------------------------------------------------------
# Inline normalization helper — converts actual relative mass to [0, 1]
# ---------------------------------------------------------------------------
# Range anchors (Pluto = min, Sun = max)
_LOG_MIN: float = math.log10(PLANET_MASS_RELATIVE["Pluto"])   # ≈ -2.658
_LOG_MAX: float = math.log10(PLANET_MASS_RELATIVE["Sun"])     # ≈  5.524
_LOG_RANGE: float = _LOG_MAX - _LOG_MIN


def normalize_planet_weight(relative_mass: float) -> float:
    """Normalize an actual relative-to-Earth planetary mass to [0, 1] via log₁₀.

    Parameters
    ----------
    relative_mass:
        Mass relative to Earth (e.g. ``317.8165`` for Jupiter, ``1.0`` for Earth).

    Returns
    -------
    float
        Score between 0.0 (Pluto) and 1.0 (Sun).
    """
    if relative_mass <= 0:
        return 0.0
    return round((math.log10(relative_mass) - _LOG_MIN) / _LOG_RANGE, 4)


# ---------------------------------------------------------------------------
# Log-normalized to 0–1 (derived from actual relative masses)
# ---------------------------------------------------------------------------
PLANET_MASS_NORMALIZED: Dict[str, float] = {
    planet: normalize_planet_weight(rel)
    for planet, rel in PLANET_MASS_RELATIVE.items()
}

# ---------------------------------------------------------------------------
# Public helper
# ---------------------------------------------------------------------------

def get_planet_weight(planet: str, scale: str = "normalized") -> float:
    """Return the weight constant for *planet* on the requested *scale*.

    Parameters
    ----------
    planet:
        Name of the planetary body (e.g. ``"Sun"``, ``"Moon"``, ``"Mars"``).
        Case-sensitive; must match a key in :data:`PLANET_MASS_KG`.
    scale:
        One of:
        * ``"normalized"``  — log-normalized 0–1 (default, recommended for scoring)
        * ``"relative"``    — mass relative to Earth (Earth = 1.0)
        * ``"kg"``          — raw mass in kilograms

    Returns
    -------
    float
        The planetary mass value on the requested scale.
        Falls back to ``0.5`` (normalized), ``1.0`` (relative), or ``5.972e24``
        (kg) when *planet* is not recognised.
    """
    defaults = {"normalized": 0.5, "relative": 1.0, "kg": _EARTH_MASS_KG}
    tables = {
        "normalized": PLANET_MASS_NORMALIZED,
        "relative":   PLANET_MASS_RELATIVE,
        "kg":         PLANET_MASS_KG,
    }
    table = tables.get(scale, PLANET_MASS_NORMALIZED)
    default = defaults.get(scale, 0.5)
    return table.get(planet, default)
