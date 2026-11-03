"""The zodiac signs, spelled the way the database spells them.

`calculate_planetary_positions_swisseph` names each body's sign in lowercase ("pisces").
The Postgres enum `zodiac_sign` (database/init/01-schema.sql) is capitalized ("Pisces"), and
Postgres rejects a lowercase literal for it with `invalid input value for enum zodiac_sign`.
The by-chart recommender bound the lowercase names straight into its query, so it failed
before it read a single row.

No imports beyond the standard library, so backend/tests/test_zodiac_signs.py runs on a bare
Python.
"""
from typing import Any, Mapping, Tuple

ZODIAC_SIGNS = (
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
)


def db_zodiac_signs(positions: Mapping[str, Any]) -> Tuple[str, ...]:
    """The distinct signs the bodies in `positions` occupy, as the `zodiac_sign` enum spells them.

    Sorted, so the same chart always binds the same parameters. An entry with no sign, or
    one that is not a sign, is left out rather than sent to the database to be rejected.
    """
    signs = {
        body["sign"].capitalize()
        for body in positions.values()
        if isinstance(body, Mapping) and isinstance(body.get("sign"), str)
    }
    return tuple(sorted(signs & set(ZODIAC_SIGNS)))
