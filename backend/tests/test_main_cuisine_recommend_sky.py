"""The cuisine recommender must not invent a sky when the ephemeris fails.

`GET /cuisines/recommend` (`backend/alchm_kitchen/main.py`, served by Railway)
fills a missing sign and season from the current moment. When the Swiss
Ephemeris call raised, it fell back to `zodiac_sign or 'Libra'` and
`season or 'Autumn'`: a sky with no basis, whatever the date. Now:

- the season is DERIVED from today's month, which never needed the ephemeris;
- the sign comes from the most recent sky the process computed, which the
  response marks `cached` (see test_main_cuisine_sky_ranking.py). With no
  sky at all it is ABSENT (None), and neither the response nor its reason
  strings claim one. A Sun sign the ephemeris could not supply is no longer
  answered with 400 "Invalid zodiac sign: None".

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
SKY = "current_sky"
NESTED = "get_cuisine_with_nested_data"
SAUCES = "get_sauce_recommendations_for_cuisine"
FUNCS = (ENDPOINT, SKY, NESTED, SAUCES)
# The endpoint's own helpers, run from source alongside it.
HELPERS = (
    "RECOMMENDABLE_CUISINES", "SKY_ELEMENTS", "_LAST_SKY", "normalize_cuisine_id",
    SKY, "elemental_match", "rank_cuisines_by_sky", "match_reason",
)

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


def _defines(node, name):
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
        return node.name == name
    if isinstance(node, ast.Assign):
        return any(isinstance(t, ast.Name) and t.id == name for t in node.targets)
    if isinstance(node, ast.AnnAssign):
        return isinstance(node.target, ast.Name) and node.target.id == name
    return False


def _load(name, namespace, *helpers):
    """Execute top-level definitions from main.py's source into `namespace`.

    main.py imports these typing names at module level, so its annotations
    may use any of them.
    """
    for typing_name, value in (("Any", Any), ("Dict", Dict), ("List", List), ("Optional", Optional)):
        namespace.setdefault(typing_name, value)
    wanted = (*helpers, name)
    nodes = [n for n in _module().body if any(_defines(n, w) for w in wanted)]
    for node in nodes:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            node.decorator_list = []  # drop @app.get — the route table is not under test
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(MAIN_PY), "exec"), namespace)
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


# A sky's element shares, as calculate_local_alchemize reports them.
SKY_SHARES = {"Fire": 0.4, "Water": 0.2, "Earth": 0.3, "Air": 0.1}


def _run_endpoint(ephemeris, **params):
    """Call the real endpoint body; return (response, sign/season it settled on)."""
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
        "calculate_local_alchemize": lambda request: {"elementalProperties": dict(SKY_SHARES)},
        "AlchemizeRequest": lambda **fields: fields,
        "load_cuisine_records": lambda: {},
        "FOREST_HILLS_COORDINATES": {"latitude": 40.7, "longitude": -73.8},
        NESTED: nested,
        "log_system_metric": log_metric,
    }
    endpoint = _load(ENDPOINT, namespace, *HELPERS)
    call = dict(zodiac_sign=None, season=None, meal_type=None, limit=3, db=None)
    call.update(params)
    response = asyncio.run(endpoint(**call))
    moment = response["current_moment"]
    return response, (moment["zodiac_sign"], moment["season"])


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
    # A fresh process has no earlier sky to fall back to.
    response, scored = _run_endpoint(_failing_ephemeris)
    assert response["current_moment"]["zodiac_sign"] is None
    assert response["current_moment"]["season"] == "Winter"  # January, not "Autumn"
    assert scored == (None, "Winter")
    assert response["total_recommendations"] == 3
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
        "load_cuisine_records": lambda: {},
        "get_nested_recipes_for_cuisine": recipes, SAUCES: sauces,
    }
    nested = _load(NESTED, namespace, "normalize_cuisine_id")
    data = asyncio.run(nested("thai", "Winter", None, None, None))
    assert data["seasonal_context"] == "Perfect for Winter"
    _claims_no_sign(data["seasonal_context"])
