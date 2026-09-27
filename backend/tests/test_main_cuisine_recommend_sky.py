"""The cuisine recommender must not invent a sky when the ephemeris fails.

`GET /cuisines/recommend` (`backend/alchm_kitchen/main.py`, served by Railway)
fills a missing sign and season from the current moment. When the Swiss
Ephemeris call raised, it fell back to `zodiac_sign or 'Libra'` and
`season or 'Autumn'`: a sky with no basis, whatever the date. Now:

- the season is DERIVED from today's month, which never needed the ephemeris;
- the sign is ABSENT (None). It adds no sign term to the scores, and neither
  the response nor its reason strings claim one. A Sun sign the ephemeris
  could not supply is no longer answered with 400 "Invalid zodiac sign: None".

── How this tests it without importing it ──────────────────────────────────

main.py can't be imported in CI (fastapi/sqlalchemy/pyswisseph; CI installs
only pytest, see test_kalchm_parity.py:21-24). So, like
test_main_excluded_bodies.py, this reads main.py's SOURCE with `ast`, EXTRACTS
the endpoint and the helpers that format the sign, and EXECUTES them in an
isolated namespace with the ephemeris, the database and their neighbours
stubbed. Stdlib + pytest only.
"""
import ast
import asyncio
import datetime as _dt
from pathlib import Path
from typing import Any, Dict, List, Optional

import pytest

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"

ENDPOINT = "get_current_moment_cuisine_recommendations"
SCORING = "calculate_cuisine_astrological_compatibility"
NESTED = "get_cuisine_with_nested_data"
SAUCES = "get_sauce_recommendations_for_cuisine"
FUNCS = (ENDPOINT, SCORING, NESTED, SAUCES)

SIGNS = {
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
}
SEASONS = {"spring", "summer", "autumn", "fall", "winter"}

# 15 January: the month says Winter; the old fallback said Autumn.
NOW = _dt.datetime(2026, 1, 15, 12, 0)


def _module():
    return ast.parse(MAIN_PY.read_text())


def _func(name):
    for node in _module().body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == name:
            return node
    raise AssertionError(f"{name} not found in main.py")


def _load(name, namespace):
    """Execute one top-level function from main.py's source into `namespace`.

    main.py imports these typing names at module level, so its annotations
    may use any of them.
    """
    for typing_name, value in (("Any", Any), ("Dict", Dict), ("List", List), ("Optional", Optional)):
        namespace.setdefault(typing_name, value)
    node = _func(name)
    node.decorator_list = []  # drop @app.get — the route table is not under test
    exec(compile(ast.Module(body=[node], type_ignores=[]), str(MAIN_PY), "exec"), namespace)
    return namespace[name]


class _HTTPException(Exception):
    def __init__(self, status_code, detail=None):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class _FixedDatetime(_dt.datetime):
    @classmethod
    def utcnow(cls):
        return cls(NOW.year, NOW.month, NOW.day, NOW.hour, NOW.minute)

    @classmethod
    def now(cls, tz=None):
        return cls.utcnow()


def _failing_ephemeris(*_args, **_kwargs):
    raise RuntimeError("swisseph unavailable")


def _run_endpoint(ephemeris, **params):
    """Call the real endpoint body; return (response, sign/season the scorer got)."""
    seen = {}

    async def scoring(zodiac_sign, season, db):
        seen["scoring"] = (zodiac_sign, season)
        return {"italian": 0.6, "thai": 0.5}

    async def nested(cuisine_id, season, meal_type, zodiac_sign, db):
        return {"cuisine_id": cuisine_id}

    async def log_metric(*_args, **_kwargs):
        return None

    namespace = {
        "Optional": Optional,
        "Session": object,
        "Depends": lambda dependency: None,
        "get_db": None,
        "datetime": _FixedDatetime,
        "HTTPException": _HTTPException,
        "calculate_planetary_positions_swisseph": ephemeris,
        "FOREST_HILLS_COORDINATES": {"latitude": 40.7, "longitude": -73.8},
        SCORING: scoring,
        NESTED: nested,
        "log_system_metric": log_metric,
    }
    endpoint = _load(ENDPOINT, namespace)
    call = dict(zodiac_sign=None, season=None, meal_type=None, limit=3, db=None)
    call.update(params)
    response = asyncio.run(endpoint(**call))
    return response, seen.get("scoring")


def _strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from _strings(item)
    elif isinstance(value, (list, tuple)):
        for item in value:
            yield from _strings(item)


def _claims_no_sign(response):
    """No string in the response names a sign or prints a missing one."""
    for text in _strings(response):
        lowered = text.lower()
        assert "none" not in lowered, f"response prints a missing value: {text!r}"
        assert not any(sign in lowered for sign in SIGNS), f"response claims a sign: {text!r}"


# ── Structure ───────────────────────────────────────────────────────────────


def test_scan_finds_the_endpoint_and_its_helpers():
    # Witness: a renamed function would make the checks below pass vacuously.
    for name in FUNCS:
        assert _func(name).name == name


def _is_sky_literal(node):
    return (
        isinstance(node, ast.Constant)
        and isinstance(node.value, str)
        and node.value.lower() in SIGNS | SEASONS
    )


def test_no_sign_or_season_is_invented_on_failure():
    """No `x or 'Libra'`, no `.get('sign', 'Aries')`, no sky assigned in an except."""
    invented = []
    for name in FUNCS:
        func = _func(name)
        for node in ast.walk(func):
            if isinstance(node, ast.BoolOp) and isinstance(node.op, ast.Or):
                invented += [(name, v.lineno) for v in node.values[1:] if _is_sky_literal(v)]
            if (
                isinstance(node, ast.Call)
                and isinstance(node.func, ast.Attribute)
                and node.func.attr == "get"
                and len(node.args) == 2
                and _is_sky_literal(node.args[1])
            ):
                invented.append((name, node.lineno))
            if isinstance(node, ast.ExceptHandler):
                for inner in ast.walk(node):
                    if isinstance(inner, ast.Assign) and any(
                        isinstance(t, ast.Name) and t.id in ("zodiac_sign", "season")
                        for t in inner.targets
                    ):
                        invented.append((name, inner.lineno))
    assert invented == [], f"main.py invents a sky at {invented}"


# ── Endpoint behaviour ──────────────────────────────────────────────────────


def test_control_a_working_ephemeris_supplies_the_sun_sign():
    ephemeris = lambda *a, **k: {"positions": {"Sun": {"sign": "capricorn"}}}
    response, scored = _run_endpoint(ephemeris)
    assert response["current_moment"]["zodiac_sign"] == "Capricorn"
    assert response["current_moment"]["season"] == "Winter"
    assert scored == ("Capricorn", "Winter")


def test_a_failing_ephemeris_leaves_the_sign_absent_and_derives_the_season():
    response, scored = _run_endpoint(_failing_ephemeris)
    assert response["current_moment"]["zodiac_sign"] is None
    assert response["current_moment"]["season"] == "Winter"  # January, not "Autumn"
    assert scored == (None, "Winter")
    assert response["total_recommendations"] == 2
    _claims_no_sign(response)


def test_an_ephemeris_without_a_sun_sign_is_not_a_client_error():
    response, scored = _run_endpoint(lambda *a, **k: {"positions": {}})
    assert response["current_moment"]["zodiac_sign"] is None
    assert scored == (None, "Winter")
    _claims_no_sign(response)


def test_a_client_sign_with_no_season_gets_the_months_season_when_the_ephemeris_fails():
    response, scored = _run_endpoint(_failing_ephemeris, zodiac_sign="leo")
    assert scored == ("Leo", "Winter")


def test_control_an_invalid_client_sign_is_still_rejected():
    with pytest.raises(_HTTPException) as err:
        _run_endpoint(_failing_ephemeris, zodiac_sign="not-a-sign", season="summer")
    assert err.value.status_code == 400


# ── Helpers that format the sign ────────────────────────────────────────────


def _sauces(available, all_sauces):
    namespace = {
        "List": List, "Dict": Dict, "Any": Any,
        "load_json_file": lambda _name: all_sauces if available else None,
    }
    return _load(SAUCES, namespace)


def test_generic_sauces_without_a_sign_do_not_print_one():
    sauces = asyncio.run(_sauces(False, {})("italian", None, "Winter"))
    assert len(sauces) == 3
    _claims_no_sign(sauces)


def test_catalogue_sauces_without_a_sign_still_match_on_season():
    catalogue = {
        "Ragù": {"cuisine": "italian", "astrologicalInfluences": ["leo"], "seasonality": "winter"},
    }
    sauces = asyncio.run(_sauces(True, catalogue)("italian", None, "Winter"))
    assert [s["sauce_name"] for s in sauces] == ["Ragù"]  # not [] from a None.lower() crash
    _claims_no_sign(sauces)


def test_control_catalogue_sauces_with_a_sign_still_match_on_it():
    catalogue = {
        "Ragù": {"cuisine": "italian", "astrologicalInfluences": ["leo"], "seasonality": "summer"},
    }
    sauces = asyncio.run(_sauces(True, catalogue)("italian", "Leo", "Winter"))
    assert [s["reason"] for s in sauces] == ["Matches Leo energy"]


def test_nested_cuisine_data_without_a_sign_does_not_print_one():
    async def recipes(*_args):
        return []

    async def sauces(*_args):
        return []

    namespace = {
        "Optional": Optional, "Dict": Dict, "Any": Any, "Session": object,
        "CUISINES_AVAILABLE": False, "cuisines": {},
        "get_nested_recipes_for_cuisine": recipes, SAUCES: sauces,
    }
    nested = _load(NESTED, namespace)
    data = asyncio.run(nested("thai", "Winter", None, None, None))
    assert data["seasonal_context"] == "Perfect for Winter"
    _claims_no_sign(data["seasonal_context"])


class _Column:
    """A stand-in model column: comparisons just yield a marker."""

    def __eq__(self, other):
        return ("eq", other)

    def __gt__(self, other):
        return ("gt", other)

    __hash__ = object.__hash__


class _Row:
    def __init__(self, **fields):
        self.__dict__.update(fields)


def test_scoring_without_a_sign_has_no_zodiac_term():
    class ZodiacAffinity:
        zodiac_sign = _Column()
        affinity_strength = _Column()

    class SeasonalAssociation:
        season = _Column()
        strength = _Column()

    queried = []

    class _Query:
        def __init__(self, model):
            queried.append(model.__name__)
            self.model = model

        def filter(self, *_conditions):
            return self

        def all(self):
            if self.model is SeasonalAssociation:
                return [_Row(entity_type="cuisine", entity_id="thai", strength=0.9)]
            return [_Row(entity_type="cuisine", entity_id="italian", affinity_strength=0.9)]

    class _DB:
        def query(self, model):
            return _Query(model)

    namespace = {
        "Dict": Dict, "Session": object, "Optional": Optional,
        "ZodiacAffinity": ZodiacAffinity, "SeasonalAssociation": SeasonalAssociation,
    }
    scoring = _load(SCORING, namespace)
    scores = asyncio.run(scoring(None, "Winter", _DB()))
    assert "ZodiacAffinity" not in queried  # no sign: no zodiac lookup at all
    assert scores["thai"] > scores["italian"]  # ranked on season alone
