"""POST /api/tokens/calculate rules its planetary hour with backend/utils/planetary_hours.py.

The route carried a copy of the hour calculation (see test_planetary_hours.py for what was wrong with it):
the weekday read as an index into the Chaldean order (right on Tuesday only), every night hour answered "Moon",
and a request datetime with a timezone (what TokensClient sends: `toISOString()` ends in Z) raised TypeError
against the naive sunrise, which a bare `except Exception` swallowed, so the answer was always "Sun" with the
06:00-18:00 day. The route is deployed and has a typed client (src/lib/api/alchm-client.ts,
src/services/TokensClient.ts) that nothing else in src/ calls.

main.py can't be imported here (FastAPI, SQLAlchemy), so its source is read with `ast` and the route and its two
models are run in a namespace that has what it needs, the real engines included. The expected rulers are worked
by hand in test_planetary_hours.py (BY_HAND). Needs pyswisseph and pydantic (the CI step installs them).
"""
import ast
import asyncio
import datetime
from pathlib import Path
from typing import Dict, Optional

from pydantic import BaseModel

import backend.utils.planetary_hours as planetary_hours
from backend.alchm_kitchen.thermodynamics import compute_kalchm_monica, planetary_hour_esms
from backend.config.celestial_config import FOREST_HILLS_COORDINATES
from backend.schemas.planetary import CelestialCoordinates

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"


def load_token_route():
    """main.py can't be imported here (FastAPI, SQLAlchemy): its source is read with `ast` and the route and its
    two models are run in a namespace that has what it needs, the real engines included."""
    tree = ast.parse(MAIN_PY.read_text(encoding="utf-8"))
    wanted = {"calculate_token_rates_endpoint", "TokenRatesRequest", "TokenRatesResult"}
    nodes = [n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and n.name in wanted]
    assert {n.name for n in nodes} == wanted
    for node in nodes:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            node.decorator_list = []  # @app.post: the route table is not under test
    namespace = {
        "BaseModel": BaseModel, "Optional": Optional, "Dict": Dict, "datetime": datetime.datetime,
        "FOREST_HILLS_COORDINATES": FOREST_HILLS_COORDINATES, "CelestialCoordinates": CelestialCoordinates,
        "planetary_hour_esms": planetary_hour_esms, "compute_kalchm_monica": compute_kalchm_monica,
    }
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(MAIN_PY), "exec"), namespace)
    return namespace


def token_rates(when, location=None):
    namespace = load_token_route()
    request = namespace["TokenRatesRequest"](datetime=when, location=location)
    return asyncio.run(namespace["calculate_token_rates_endpoint"](request))


NEW_YORK = {"latitude": 40.7128, "longitude": -74.0060}


def test_the_route_rules_a_request_datetime_with_a_timezone():
    # TokensClient sends toISOString(), which ends in Z. The route compared it with a naive sunrise, the
    # TypeError was swallowed, and the answer was always "Sun" with the 06:00-18:00 rule.
    result = token_rates("2025-06-21T17:30:00Z", NEW_YORK)  # 13:30 EDT on a Saturday
    assert (result.planetaryHour, result.isDaytime) == ("Moon", True)


def test_the_route_rules_a_request_datetime_without_one_as_utc():
    result = token_rates("2025-06-21T17:30:00", NEW_YORK)
    assert (result.planetaryHour, result.isDaytime) == ("Moon", True)


def test_the_route_does_not_answer_moon_for_every_night_hour():
    result = token_rates("2025-06-22T01:00:00Z", NEW_YORK)  # 21:00 EDT on Saturday: night hour 12, Mercury
    assert (result.planetaryHour, result.isDaytime) == ("Mercury", False)


def test_the_route_takes_day_and_night_from_the_sun_not_from_the_utc_hour():
    # 06:00 UTC is 02:00 EDT: night, though the fallback rule (06:00-18:00 by the request's own clock) says day.
    result = token_rates("2025-06-21T06:00:00Z", NEW_YORK)
    assert result.isDaytime is False


def test_the_route_uses_the_requested_place_not_forest_hills():
    # The same instant is day in Tokyo (02:00 UTC = 11:00 JST) and night in New York (22:00 EDT the day before).
    tokyo = token_rates("2025-06-21T02:00:00Z", {"latitude": 35.6762, "longitude": 139.6503})
    new_york = token_rates("2025-06-21T02:00:00Z", NEW_YORK)
    assert tokyo.isDaytime is True and new_york.isDaytime is False


def test_the_route_falls_back_where_the_sun_does_not_rise():
    result = token_rates("2025-12-21T12:00:00Z", {"latitude": 69.6492, "longitude": 18.9553})
    assert (result.planetaryHour, result.isDaytime) == ("Sun", True)  # the 06:00-18:00 fallback and the Sun


def test_the_route_falls_back_without_pyswisseph(monkeypatch):
    monkeypatch.setattr(planetary_hours, "swe", None)
    result = token_rates("2025-06-21T23:00:00Z", NEW_YORK)
    assert (result.planetaryHour, result.isDaytime) == ("Sun", False)


def test_the_route_defaults_to_forest_hills():
    assert token_rates("2025-06-21T17:30:00Z").planetaryHour == token_rates("2025-06-21T17:30:00Z", NEW_YORK).planetaryHour == "Moon"
