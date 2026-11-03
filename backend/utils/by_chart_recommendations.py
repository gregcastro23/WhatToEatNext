"""The pieces of the by-chart recommender that need neither FastAPI nor SQLAlchemy.

`POST /api/astrological/recipe-recommendations-by-chart` (backend/alchm_kitchen/main.py) never
got past its first recipe. Three defects lived in the per-recipe loop, and each is fixed here so
a test can state it without booting the app (the request's ranges, which the route trusted a
proxy to enforce, are here too):

1. The recipe object built from `recipes.read_model` carried its elemental properties lowercase
   ({"fire": .., "water": .., "earth": .., "air": ..}: all 1099 public recipes, read from
   production on 2026-11-03). `calculate_total_potency_score` compares the dominant element with
   "Fire"/"Earth"/.. and `calculate_alchemical_quantities` reads `.get("Air", 0.25)`, so neither
   ever matched: every recipe got the same potency and SMES computed from the uniform default,
   whatever the recipe's elements. `engine_elemental_properties` spells them the way the engines
   and the client schema (`RecipeRecommendationElementalPropertiesSchema`) read them.
2. The response read `elemental_properties`, a variable bound only on the database fallback path:
   `UnboundLocalError` for every recipe that has a read model, and the previous recipe's value for
   a fallback recipe that follows one. `recipe_from_read_model` puts the normalized value on the
   recipe itself, so the response reads it from there on both paths.
3. The "Aligns with current environmental energies" text subscripted `lunar_phase_data` even when
   lunar data was not requested (the default), so any recipe whose score passed 1.0 raised
   `TypeError`. `environmental_match_details` names the lunar phase only when there is one.

No imports beyond the standard library, so backend/tests/test_by_chart_recommendations.py runs on
a bare Python.
"""
import datetime
import math
import re
from types import SimpleNamespace
from typing import Any, Dict, Mapping, Optional, Sequence

ENGINE_ELEMENTS = ("Fire", "Water", "Earth", "Air")

# The ranges a chart request must be in. The Next proxy enforces the same ones
# (src/lib/validation/recipeRecommendationRequest.ts; src/__tests__/api/recipeRecommendationsByChartRoute.test.ts
# reads this table), but the backend is reachable without the proxy, and the ephemeris answers
# out-of-range input quietly: hour 99 is another instant, year 99999 is a chart of nothing.
# The year bound is measured: with no ephemeris data files (production's case) the Moshier
# ephemeris computes every body for years 1 to 3000 and fails from about 3100.
# The canonical text form of a UUID. uuid.UUID() would also take "urn:uuid:..." and hyphens in odd
# places, which Postgres's uuid input rejects (a 500 where this is meant to be a 422); the braced and
# unhyphenated forms Postgres does accept are refused here too, the safe direction.
UUID_TEXT = re.compile(r"[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}")

CHART_RANGES = {
    "year": (1, 3000),
    "month": (1, 12),
    "day": (1, 31),
    "hour": (0, 23),
    "minute": (0, 59),
    "latitude": (-90.0, 90.0),
    "longitude": (-180.0, 180.0),
}


def _finite_number(value: Any) -> bool:
    """True for a real, finite int/float. A bool is an int in Python, and is not a share."""
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def engine_elemental_properties(raw: Any) -> Optional[Dict[str, float]]:
    """`raw` as {"Fire", "Water", "Earth", "Air"} floats, or None when it does not hold all four.

    Reads either spelling of each element, capitalized first. A partial or non-numeric entry is
    None rather than a guess: the client schema requires all four numbers, and the engines fall
    back to their own uniform default for a recipe whose elements are unknown.
    """
    if not isinstance(raw, Mapping):
        return None
    properties: Dict[str, float] = {}
    for element in ENGINE_ELEMENTS:
        value = raw[element] if element in raw else raw.get(element.lower())
        if not _finite_number(value):
            return None
        properties[element] = float(value)
    return properties


def recipe_from_read_model(read_model: Mapping[str, Any]) -> SimpleNamespace:
    """The recipe object the potency and quantity engines read, built from a `recipes.read_model`.

    Every key of the document is an attribute. `elementalProperties` (what
    `calculate_total_potency_score` reads) and `elemental_properties` (the second place
    `calculate_alchemical_quantities` looks) both hold the normalized value, so neither carries
    the stored lowercase spelling.
    """
    recipe = SimpleNamespace(**read_model)
    stored = read_model["elemental_properties"] if "elemental_properties" in read_model else read_model.get("elementalProperties")
    elemental_properties = engine_elemental_properties(stored)
    recipe.elementalProperties = elemental_properties
    recipe.elemental_properties = elemental_properties
    return recipe


def environmental_match_details(lunar_phase: Optional[Mapping[str, Any]], season: str) -> str:
    """Why a recipe is an environmental match; names the lunar phase only when one was computed."""
    phase = lunar_phase.get("phase_name") if isinstance(lunar_phase, Mapping) else None
    current = f"{phase} + {season} Season" if phase else f"{season} Season"
    return f"Aligns with current environmental energies! Current: {current}"


def chart_request_problem(
    year: int, month: int, day: int, hour: int, minute: int, latitude: float, longitude: float,
    secondary_chart_ids: Optional[Sequence[str]] = None,
) -> Optional[str]:
    """What is wrong with a chart request, or None.

    Each field must be inside CHART_RANGES (a NaN is not), the date must exist (day 31 of February
    does not), and each secondary chart id must be a UUID in its canonical text form:
    saved_charts.id is a uuid column, so Postgres rejects any other string and the handler would
    answer 500 instead of 422.
    """
    values = {
        "year": year, "month": month, "day": day, "hour": hour, "minute": minute,
        "latitude": latitude, "longitude": longitude,
    }
    for name, (low, high) in CHART_RANGES.items():
        if not low <= values[name] <= high:
            return f"{name} must be between {low} and {high}"
    try:
        datetime.date(year, month, day)
    except ValueError:
        return f"{year:04d}-{month:02d}-{day:02d} is not a calendar date"
    for chart_id in secondary_chart_ids or ():
        if not (isinstance(chart_id, str) and UUID_TEXT.fullmatch(chart_id)):
            return f"secondary_chart_ids must be UUIDs, not {chart_id!r}"
    return None
