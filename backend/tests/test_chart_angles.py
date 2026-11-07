"""The chart's Ascendant and Midheaven are those of the observer's location.

`calculate_planetary_positions_swisseph` assigned each body's ecliptic longitude to a local called
`longitude`, which is also the function's parameter: the observer's geographic longitude. The
`swe.houses(julian_day, latitude, longitude)` call after the loop then received the last body's
ecliptic longitude, so the Midheaven was the same for every place on Earth (and the Ascendant
depended on the latitude only). Eleven routes call the function.

The function is imported for real (it needs FastAPI only for `HTTPException`, which is stubbed) and
its angles are compared with `swe.houses` called directly, which shares no code with it.
Needs pyswisseph (pinned in backend/requirements.txt).
"""
import ast
import importlib
import sys
import types
from pathlib import Path

import pytest
import swisseph as swe

MODULE = "backend.utils.celestial_calculations"
SOURCE = Path(__file__).resolve().parents[1] / "utils" / "celestial_calculations.py"
PLACES = {
    "null island": (0.0, 0.0),
    "New York": (40.7, -74.0),
    "Tokyo": (35.7, 139.7),
    "London": (51.5, -0.12),
    "Sydney": (-33.9, 151.2),
}


@pytest.fixture
def chart(monkeypatch):
    stub = types.SimpleNamespace(HTTPException=type("HTTPException", (Exception,), {}))
    monkeypatch.setitem(sys.modules, "fastapi", stub)
    monkeypatch.delitem(sys.modules, MODULE, raising=False)
    module = importlib.import_module(MODULE)
    yield module.calculate_planetary_positions_swisseph
    sys.modules.pop(MODULE, None)  # do not leave a module bound to the stub behind


def direct_angles(latitude, longitude):
    julian_day = swe.julday(1990, 6, 15, 12.0)
    _cusps, ascmc = swe.houses(julian_day, latitude, longitude)
    return ascmc[0] % 360, ascmc[1] % 360


@pytest.mark.parametrize("place", sorted(PLACES))
def test_the_ascendant_and_midheaven_are_those_swisseph_gives_for_the_place(chart, place):
    latitude, longitude = PLACES[place]
    positions = chart(1990, 6, 15, 12, 0, latitude, longitude)["positions"]
    ascendant, midheaven = direct_angles(latitude, longitude)
    assert positions["Ascendant"]["exactLongitude"] == pytest.approx(ascendant, abs=1e-9)
    assert positions["MC"]["exactLongitude"] == pytest.approx(midheaven, abs=1e-9)


def test_the_midheaven_moves_with_the_observers_longitude(chart):
    new_york = chart(1990, 6, 15, 12, 0, 40.7, -74.0)["positions"]["MC"]["exactLongitude"]
    tokyo = chart(1990, 6, 15, 12, 0, 35.7, 139.7)["positions"]["MC"]["exactLongitude"]
    # 213.7 degrees of longitude apart: the Midheaven is tens of degrees apart, not equal.
    assert abs(new_york - tokyo) > 90


@pytest.mark.parametrize("place", sorted(PLACES))
def test_a_sidereal_chart_has_sidereal_angles_like_its_bodies(chart, place):
    latitude, longitude = PLACES[place]
    julian_day = swe.julday(1990, 6, 15, 12.0)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    _cusps, ascmc = swe.houses_ex(julian_day, latitude, longitude, b"P", swe.FLG_SIDEREAL)
    positions = chart(1990, 6, 15, 12, 0, latitude, longitude, "sidereal")["positions"]
    assert positions["Ascendant"]["exactLongitude"] == pytest.approx(ascmc[0] % 360, abs=1e-9)
    assert positions["MC"]["exactLongitude"] == pytest.approx(ascmc[1] % 360, abs=1e-9)
    # and they are the tropical angles less the ayanamsa, the same shift the bodies carry
    tropical = chart(1990, 6, 15, 12, 0, latitude, longitude)["positions"]
    shift = swe.get_ayanamsa_ut(julian_day)
    assert (tropical["Ascendant"]["exactLongitude"] - positions["Ascendant"]["exactLongitude"]) % 360 == pytest.approx(shift, abs=0.01)
    assert (tropical["Sun"]["exactLongitude"] - positions["Sun"]["exactLongitude"]) % 360 == pytest.approx(shift, abs=0.01)


def test_the_bodies_are_unaffected_by_where_the_observer_stands(chart):
    here = chart(1990, 6, 15, 12, 0, 40.7, -74.0)["positions"]
    there = chart(1990, 6, 15, 12, 0, -33.9, 151.2)["positions"]
    for body in ("Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Pluto"):
        assert here[body]["exactLongitude"] == there[body]["exactLongitude"]


def test_no_function_in_the_module_rebinds_a_parameter_called_latitude_or_longitude():
    # A structural guard for the class of defect: pyflakes cannot see an argument being overwritten.
    tree = ast.parse(SOURCE.read_text(encoding="utf-8"))
    rebound = []
    for function in (n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)):
        parameters = {a.arg for a in function.args.args + function.args.kwonlyargs}
        for node in ast.walk(function):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target] if isinstance(node, (ast.AugAssign, ast.AnnAssign)) else []
            for target in targets:
                for name in (n for n in ast.walk(target) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)):
                    if name.id in parameters and name.id in {"latitude", "longitude"}:
                        rebound.append((function.name, name.id, name.lineno))
    assert rebound == []
