"""The elemental balance of a set of ecliptic longitudes.

`get_transit_details()` in transit_engine.py has called `calculate_current_elemental_balance`
since the file was written, and nothing defined it, so the function could never return and every
route that asks for transit details failed. This is what it computes, and on what basis.

Basis: each body counts once, for the element of the sign it stands in (Aries is Fire, Taurus
Earth, Gemini Air, Cancer Water, and the same four again for the rest of the zodiac), and the
counts are normalized to shares that sum to 1. That is the method of the Next app's local engine
(`computeLocalRecommendations` in src/app/api/cuisines/recommend/route.ts: the same sign-to-element
table, one count per body, equal weights). The BODIES differ: that engine counts every body it has
positions for, the nodes included, while this one counts what `get_planetary_positions` supplies
(Sun, Mars, Venus, Saturn), so the shares are not the same numbers. Every body has the same
weight: no ruling in this repo says a transiting body counts for more or less than another.

No imports beyond the standard library, so backend/tests/test_elemental_balance.py runs on a bare
Python (transit_engine.py itself needs pydantic).
"""
from typing import Dict, Iterable

ELEMENTS = ("Fire", "Water", "Earth", "Air")

# The sign a longitude falls in is longitude // 30; its element repeats every four signs.
_ELEMENT_OF_SIGN_INDEX = ("Fire", "Earth", "Air", "Water")


def elemental_balance_from_longitudes(longitudes: Iterable[float]) -> Dict[str, float]:
    """Share of the bodies at `longitudes` (degrees) standing in each element's signs.

    The shares sum to 1.0; with no bodies every share is 0.0.
    """
    counts = {element: 0 for element in ELEMENTS}
    total = 0
    for longitude in longitudes:
        # The wrap keeps sign_index in 0..11 for the reader; the `% 4` below would absorb whole
        # turns of the zodiac anyway.
        sign_index = int((longitude % 360.0) // 30)
        counts[_ELEMENT_OF_SIGN_INDEX[sign_index % 4]] += 1
        total += 1
    return {element: counts[element] / total if total else 0.0 for element in ELEMENTS}
