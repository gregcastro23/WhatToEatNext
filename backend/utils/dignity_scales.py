"""SUPERSEDED sign-level +10/+7/0/-7/-10 ESMS dignity scale.

NO LONGER WIRED TO ANYTHING. Layer 2 of the cross-runtime ESMS contract is now
``backend/utils/dignity_manifest.py`` (degree-level 5-fold), which
``planetary_alchemy.py`` calls instead. This module has zero importers as of
that change; it is retained only because its tables document the previous
scale, and its ``get_dignity_type`` precedence chain is the behaviour
``to_legacy_dignity_type`` in the manifest reproduces exactly (verified 240/240
across both resolutions).

Do NOT edit this expecting an effect on ESMS output — there is no caller.

Asymmetry worth knowing: the TypeScript counterpart ``src/utils/dignityScales.ts``
is NOT dead. It still drives ``agentMonica``, ``agentMonicaTwoBody`` and the
``NatalTransitChart`` sign vector, which were left on the sign-level scale when
the ESMS engine moved to the manifest. Those call sites are a separate
migration.
"""

from typing import Dict, List


DIGNITY_ESMS_SCALE: Dict[str, int] = {
    "Domicile": 10,
    "Exaltation": 7,
    "Neutral": 0,
    "Detriment": -7,
    "Fall": -10,
}

RULERSHIPS: Dict[str, List[str]] = {
    "sun": ["leo"],
    "moon": ["cancer"],
    "mercury": ["gemini", "virgo"],
    "venus": ["taurus", "libra"],
    "mars": ["aries", "scorpio"],
    "jupiter": ["sagittarius", "pisces"],
    "saturn": ["capricorn", "aquarius"],
    "uranus": ["aquarius"],
    "neptune": ["pisces"],
    "pluto": ["scorpio"],
}

EXALTATIONS: Dict[str, str] = {
    "sun": "aries",
    "moon": "taurus",
    "mercury": "virgo",
    "venus": "pisces",
    "mars": "capricorn",
    "jupiter": "cancer",
    "saturn": "libra",
    "uranus": "scorpio",
    "neptune": "leo",
    "pluto": "sagittarius",
}

FALLS: Dict[str, str] = {
    "sun": "libra",
    "moon": "scorpio",
    "mercury": "pisces",
    "venus": "virgo",
    "mars": "cancer",
    "jupiter": "capricorn",
    "saturn": "aries",
    "uranus": "taurus",
    "neptune": "aquarius",
    "pluto": "gemini",
}

SIGNS = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]


def get_dignity_type(planet: str, sign: str) -> str:
    """Return the same dignity type as the TypeScript lookup."""
    planet_lower = str(planet).lower()
    sign_lower = str(sign).lower()
    rulerships = RULERSHIPS.get(planet_lower, [])
    detriments = [SIGNS[(SIGNS.index(rule) + 6) % 12] for rule in rulerships]

    if sign_lower in rulerships:
        return "Domicile"
    if EXALTATIONS.get(planet_lower) == sign_lower:
        return "Exaltation"
    if sign_lower in detriments:
        return "Detriment"
    if FALLS.get(planet_lower) == sign_lower:
        return "Fall"
    return "Neutral"


def get_dignity_esms_multiplier(planet: str, sign: str) -> float:
    dignity_type = get_dignity_type(planet, sign)
    return 1.0 + DIGNITY_ESMS_SCALE[dignity_type] / 100.0
