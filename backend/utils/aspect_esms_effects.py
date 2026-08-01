"""Planet-pair aspect derivation and ESMS effects.

Python port of ``src/utils/aspectCalculator.ts`` plus
``src/utils/aspectESMSEffects.ts``. Aspect geometry is derived from absolute
longitudes (or sign + degree), then the strongest in-orb aspect per pair is
scaled by the same cosine bell and archetypal ESMS table as TypeScript.
"""

import math
from typing import Any, Dict, List, Optional, Tuple


ESMS_KEYS = ("Spirit", "Essence", "Matter", "Substance")
ZODIAC_ORDER = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]

# Ordered exactly as the TypeScript object: first match wins a strength tie.
ASPECT_DEFINITIONS: Dict[str, Tuple[float, float]] = {
    "conjunction": (0.0, 8.0),
    "opposition": (180.0, 8.0),
    "trine": (120.0, 8.0),
    "square": (90.0, 7.0),
    "sextile": (60.0, 6.0),
    "_quincunx": (150.0, 5.0),
    "_semisextile": (30.0, 4.0),
    "_sesquiquadrate": (135.0, 3.0),
    "_semisquare": (45.0, 3.0),
    "_quintile": (72.0, 2.0),
    "_biquintile": (144.0, 2.0),
    "_septile": (51.428, 2.0),
}

ASPECT_TYPE_ALIASES = {
    "_quincunx": "quincunx",
    "_semisextile": "semi-sextile",
    "_sesquiquadrate": "sesquisquare",
    "_semisquare": "semisquare",
    "_quintile": "quintile",
    "_biquintile": "biquintile",
}

VALID_ASPECT_TYPES = {
    "conjunction", "opposition", "trine", "square", "sextile",
    "quincunx", "inconjunct", "semi-sextile", "semisquare",
    "sesquisquare", "quintile", "biquintile",
}

Effect = Tuple[float, float, float, float]

SUN_MOON_ASPECTS: Dict[str, Effect] = {
    "conjunction": (-0.5, -0.5, 0.0, 0.0),
    "opposition": (0.3, 0.3, 0.0, 0.0),
    "trine": (0.2, 0.2, 0.0, 0.0),
    "square": (-0.1, -0.1, 0.2, 0.0),
    "sextile": (0.1, 0.1, 0.0, 0.0),
    "quincunx": (0.0, 0.0, 0.0, 0.1),
    "inconjunct": (0.0, 0.0, 0.0, 0.1),
    "semi-sextile": (0.0, 0.05, 0.0, 0.0),
    "sesquisquare": (0.0, 0.0, 0.1, 0.0),
    "semisquare": (0.0, 0.0, 0.1, 0.0),
    "quintile": (0.1, 0.05, 0.0, 0.0),
    "biquintile": (0.1, 0.05, 0.0, 0.0),
}

MARS_VENUS_ASPECTS: Dict[str, Effect] = {
    "conjunction": (0.0, 0.4, 0.2, 0.0),
    "opposition": (0.0, -0.2, 0.0, 0.2),
    "trine": (0.0, 0.3, 0.1, 0.0),
    "square": (0.0, -0.1, 0.3, 0.0),
    "sextile": (0.0, 0.2, 0.1, 0.0),
    "quincunx": (0.0, 0.0, 0.0, 0.1),
    "inconjunct": (0.0, 0.0, 0.0, 0.1),
    "semi-sextile": (0.0, 0.1, 0.0, 0.0),
    "sesquisquare": (0.0, 0.0, 0.1, 0.0),
    "semisquare": (0.0, 0.0, 0.1, 0.0),
    "quintile": (0.0, 0.2, 0.1, 0.0),
    "biquintile": (0.0, 0.2, 0.1, 0.0),
}

MERCURY_JUPITER_ASPECTS: Dict[str, Effect] = {
    "conjunction": (0.4, 0.0, 0.0, 0.2),
    "opposition": (0.1, 0.0, 0.0, 0.2),
    "trine": (0.3, 0.0, 0.0, 0.1),
    "square": (-0.1, 0.0, 0.0, -0.1),
    "sextile": (0.2, 0.0, 0.0, 0.1),
    "quincunx": (0.0, 0.0, 0.0, 0.0),
    "inconjunct": (0.0, 0.0, 0.0, 0.0),
    "semi-sextile": (0.1, 0.0, 0.0, 0.0),
    "sesquisquare": (0.0, 0.0, 0.0, -0.05),
    "semisquare": (0.0, 0.0, 0.0, -0.05),
    "quintile": (0.2, 0.0, 0.0, 0.1),
    "biquintile": (0.2, 0.0, 0.0, 0.1),
}

SATURN_SUN_ASPECTS: Dict[str, Effect] = {
    "conjunction": (-0.3, 0.0, 0.4, 0.2),
    "opposition": (0.0, 0.0, 0.2, 0.3),
    "square": (-0.2, 0.0, 0.3, 0.0),
    "trine": (0.1, 0.0, 0.3, 0.2),
    "sextile": (0.1, 0.0, 0.2, 0.1),
    "quincunx": (0.0, 0.0, 0.1, 0.1),
    "inconjunct": (0.0, 0.0, 0.1, 0.1),
    "semi-sextile": (0.0, 0.0, 0.1, 0.0),
    "sesquisquare": (-0.1, 0.0, 0.1, 0.0),
    "semisquare": (-0.1, 0.0, 0.1, 0.0),
    "quintile": (0.1, 0.0, 0.2, 0.0),
    "biquintile": (0.1, 0.0, 0.2, 0.0),
}

DEFAULT_ASPECT_EFFECTS: Dict[str, Effect] = {
    "conjunction": (0.1, 0.1, 0.0, 0.0),
    "opposition": (0.0, 0.0, 0.1, 0.0),
    "trine": (0.05, 0.05, 0.0, 0.0),
    "square": (0.0, 0.0, 0.1, 0.0),
    "sextile": (0.05, 0.0, 0.0, 0.0),
    "quincunx": (0.0, 0.0, 0.0, 0.05),
    "inconjunct": (0.0, 0.0, 0.0, 0.05),
    "semi-sextile": (0.0, 0.0, 0.0, 0.0),
    "sesquisquare": (0.0, 0.0, 0.05, 0.0),
    "semisquare": (0.0, 0.0, 0.05, 0.0),
    "quintile": (0.05, 0.0, 0.0, 0.0),
    "biquintile": (0.05, 0.0, 0.0, 0.0),
}

PLANET_PAIR_ASPECT_EFFECTS: Dict[str, Dict[str, Effect]] = {
    "Moon-Sun": SUN_MOON_ASPECTS,
    "Mars-Venus": MARS_VENUS_ASPECTS,
    "Jupiter-Mercury": MERCURY_JUPITER_ASPECTS,
    "Saturn-Sun": SATURN_SUN_ASPECTS,
}


def _normalize_aspect_type(aspect_type: str) -> Optional[str]:
    normalized = ASPECT_TYPE_ALIASES.get(aspect_type, aspect_type)
    return normalized if normalized in VALID_ASPECT_TYPES else None


def _longitude(position: Dict[str, Any]) -> Optional[float]:
    exact = position.get("exactLongitude")
    if isinstance(exact, (int, float)) and not isinstance(exact, bool):
        return float(exact)
    sign = str(position.get("sign", "")).lower()
    if sign not in ZODIAC_ORDER:
        return None
    degree = position.get("degree", 0.0)
    if not isinstance(degree, (int, float)) or isinstance(degree, bool):
        degree = 0.0
    return ZODIAC_ORDER.index(sign) * 30.0 + float(degree)


def calculate_aspects(positions: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Return the strongest recognized in-orb aspect for every valid pair."""
    normalized: Dict[str, Dict[str, Any]] = {}
    for planet, raw in positions.items():
        if not isinstance(raw, dict) or raw.get("sign") is None:
            continue
        normalized[planet] = raw

    aspects: List[Dict[str, Any]] = []
    planets = list(normalized.keys())
    for i, planet1 in enumerate(planets):
        for planet2 in planets[i + 1:]:
            long1 = _longitude(normalized[planet1])
            long2 = _longitude(normalized[planet2])
            if long1 is None or long2 is None:
                continue
            diff = abs(long1 - long2)
            if diff > 180.0:
                diff = 360.0 - diff

            orb_multiplier = 1.2 if (
                planet1.lower() in {"sun", "moon"}
                or planet2.lower() in {"sun", "moon"}
            ) else 1.0
            best: Optional[Dict[str, Any]] = None
            for aspect_type, (angle, max_orb) in ASPECT_DEFINITIONS.items():
                adjusted_max_orb = max_orb * orb_multiplier
                orb = abs(diff - angle)
                if orb <= adjusted_max_orb:
                    orb_ratio = orb / adjusted_max_orb
                    strength = (1.0 + math.cos(math.pi * orb_ratio)) / 2.0
                    if best is None or strength > best["strength"]:
                        best = {
                            "type": aspect_type,
                            "orb": orb,
                            "strength": strength,
                        }
            if best is None:
                continue
            normalized_type = _normalize_aspect_type(best["type"])
            if normalized_type is None:
                continue
            aspects.append({
                "planet1": planet1,
                "planet2": planet2,
                "type": normalized_type,
                "strength": best["strength"],
            })

    return sorted(aspects, key=lambda aspect: aspect["strength"], reverse=True)


def get_aspect_esms_effect(planet1: str, planet2: str, aspect_type: str) -> Effect:
    p1 = planet1[:1].upper() + planet1[1:].lower()
    p2 = planet2[:1].upper() + planet2[1:].lower()
    pair_key = "-".join(sorted((p1, p2)))
    return PLANET_PAIR_ASPECT_EFFECTS.get(pair_key, DEFAULT_ASPECT_EFFECTS)[aspect_type]


def calculate_aspect_esms_modifications(
    aspects: List[Dict[str, Any]],
) -> Dict[str, float]:
    totals = {key: 0.0 for key in ESMS_KEYS}
    for aspect in aspects:
        effect = get_aspect_esms_effect(
            str(aspect["planet1"]), str(aspect["planet2"]), str(aspect["type"])
        )
        strength = float(aspect.get("strength", 1.0))
        for index, key in enumerate(ESMS_KEYS):
            totals[key] += effect[index] * strength
    return totals
