"""The by-chart recommender, RUN: its real source, with stand-ins for what needs a server.

`POST /api/astrological/recipe-recommendations-by-chart` had many independent defects, each hidden
by the one before it (no recipe ever reached the loop that held the later ones). Tests of the
pieces cannot show that the pieces compose, and main.py cannot be imported without FastAPI and
SQLAlchemy. So this reads the handler and `RecipeRecommendationRequest` out of main.py with `ast`,
and `ChartData` and `CollectiveSynastryEngine` out of collective_engine.py, and executes them
against:
- REAL: the potency and quantity engines, the lunar modifier, the sign spelling, recipe-shaping and
  request-validation helpers, pydantic, and (where a test says so) the planetary hour;
- STAND-INS: the database session (rows shaped like the SELECT, recipes shaped like production's
  `recipes.read_model`, ORM columns that RECORD the conditions the handler filters on), the HTTP
  layer, and what reads the clock or the ephemeris (transit details, planetary hour, lunar phase,
  cooking windows, the chart), so the numbers are exact.

A stand-in must not smooth over the types the real thing returns: the rows carry uuid.UUID ids and
alternate float and Decimal affinities (see RECIPE_IDS).

Needs pydantic (pinned in backend/requirements.txt) next to pytest; the polar-latitude test also
needs astral.
"""
import ast
import asyncio
import datetime
import re
import types
import uuid
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Optional

import pytest
from pydantic import BaseModel, ValidationError, model_validator

import backend.utils.transit_engine as transit_engine
from backend.config.celestial_config import FOREST_HILLS_COORDINATES
from backend.schemas.planetary import CelestialCoordinates
from backend.utils.alchemical_quantities import calculate_alchemical_quantities
from backend.utils.by_chart_recommendations import (
    chart_request_problem,
    environmental_match_details,
    recipe_from_read_model,
)
from backend.utils.lunar_engine import get_lunar_modifier
from backend.utils.seasonal_engine import get_seasonal_modifiers
from backend.utils.transit_engine import calculate_total_potency_score, get_zodiac_sign_and_element
from backend.utils.zodiac_signs import db_zodiac_signs

REPO = Path(__file__).resolve().parents[2]
MAIN = REPO / "backend" / "alchm_kitchen" / "main.py"
COLLECTIVE = REPO / "backend" / "utils" / "collective_engine.py"
CLIENT_SCHEMA = REPO / "src" / "lib" / "validation" / "astrologySchemas.ts"

WINDOW = {"date": "2026-11-03", "mansion": "Uttara Phalguni", "food_type": "Simple & Wholesome", "start_time": "20:51"}
PHASE = {"phase_name": "Waxing Gibbous", "illumination_fraction": 0.7}
FALLBACK_ELEMENTS = types.SimpleNamespace(fire=0.7, water=0.1, earth=0.1, air=0.1)

# Production's shape: lowercase element keys. Dominant element -> stored values.
STORED = {
    "Fire": {"fire": 0.7, "water": 0.1, "earth": 0.1, "air": 0.1},
    "Water": {"fire": 0.1, "water": 0.6, "earth": 0.2, "air": 0.1},
    "Earth": {"fire": 0.1, "water": 0.1, "earth": 0.6, "air": 0.2},
    "Air": {"fire": 0.1, "water": 0.1, "earth": 0.2, "air": 0.6},
}
# calculate_total_potency_score with no transit, no planetary hour and the Sun in a Water sign:
# 0.2 + 0.3 * (1.0 if the recipe's element is Water else 0.5) + 0.3 * parity(Fire 1, Air .7, Earth .5, Water .3)
POTENCY = {"Fire": 0.65, "Water": 0.59, "Earth": 0.5, "Air": 0.56}
# Each recipe's affinity per matching ingredient (four of them), so the ranking is not a tie.
AFFINITY = {"Fire": 0.9, "Water": 0.8, "Earth": 0.7, "Air": 0.6, "fallback": 0.5}
RANKED = ["Fire", "Water", "Earth", "Air", "fallback"]


# --- reading the real source -----------------------------------------------------------------


def extract(path: Path, names: List[str], namespace: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the named top-level classes and functions of `path` in `namespace`, decorators dropped."""
    tree = ast.parse(path.read_text(encoding="utf-8"))
    nodes = [n for n in tree.body if isinstance(n, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)) and n.name in names]
    assert [n.name for n in nodes] == names, f"{path.name}: expected {names}, found {[n.name for n in nodes]}"
    for node in nodes:
        node.decorator_list = []
    module = ast.Module(body=nodes, type_ignores=[])
    ast.fix_missing_locations(module)
    exec(compile(module, str(path), "exec"), namespace)
    return namespace


class HTTPException(Exception):
    def __init__(self, status_code: int, detail: Any = None):
        super().__init__(f"{status_code}: {detail}")
        self.status_code, self.detail = status_code, detail


class Column:
    """An ORM column that records what it is compared with, instead of building SQL."""

    def __init__(self, label: str):
        self.label = label

    def __eq__(self, other):
        return ("==", self.label, other)

    def __ne__(self, other):
        return ("!=", self.label, other)

    __hash__ = None


class Recipe:
    id = Column("Recipe.id")


class ElementalPropertiesORM:
    entity_type = Column("ElementalProperties.entity_type")
    entity_id = Column("ElementalProperties.entity_id")


class SavedChart:
    id = Column("SavedChart.id")


class Chain:
    def __init__(self, db, result):
        self.db, self.result = db, result

    def filter(self, *conditions):
        self.db.filters.extend(conditions)
        return self

    def first(self):
        return self.result


class FakeDb:
    def __init__(self, rows, saved_chart=None):
        self.rows, self.saved_chart, self.executed, self.filters = rows, saved_chart, [], []

    def execute(self, statement, params=None):
        self.executed.append(params)
        return types.SimpleNamespace(fetchall=lambda: self.rows)

    def query(self, model):
        found = {
            Recipe: types.SimpleNamespace(name="fallback recipe", description=None),
            ElementalPropertiesORM: FALLBACK_ELEMENTS,
            SavedChart: self.saved_chart,
        }
        assert model in found, f"unexpected ORM query for {model}"
        return Chain(self, found[model])


def chart_with(signs_by_body):
    """A stand-in for the chart function: the shape and spelling the real one returns (lowercase signs)."""
    calls = []

    def chart(year, month, day, hour, minute, latitude=0.0, longitude=0.0):
        calls.append((year, month, day, hour, minute, latitude, longitude))
        return {"positions": {body: {"sign": sign, "exactLongitude": 10.0 * i} for i, (body, sign) in enumerate(signs_by_body.items())}}

    chart.calls = calls
    return chart


CHART = {"Sun": "gemini", "Moon": "pisces", "Mars": "gemini", "Ascendant": "cancer"}


def constant_season(zodiac="Scorpio", **boosts):
    """get_seasonal_modifiers with nothing boosted, so every seasonal modifier is exactly 1.0 unless a test says."""
    return lambda: {"current_zodiac": zodiac, **{element: boosts.get(element, []) for element in ("fire", "earth", "air", "water")}}


def load(planetary_hour=None, engine_profile=None, chart=None, season=None, real_planetary_hour=False):
    namespace: Dict[str, Any] = {
        # typing / web / database stand-ins
        "BaseModel": BaseModel, "model_validator": model_validator, "Optional": Optional, "List": List, "Dict": Dict,
        "Any": Any, "Session": object, "Depends": lambda dependency: None, "get_db": None,
        "HTTPException": HTTPException, "text": lambda sql: sql,
        "Recipe": Recipe, "ElementalPropertiesORM": ElementalPropertiesORM, "SavedChart": SavedChart,
        # the clock and the ephemeris, made exact
        "calculate_planetary_positions_swisseph": chart or chart_with(CHART),
        "get_current_lunar_phase": lambda: dict(PHASE),
        "get_optimal_cooking_windows": lambda days=1: [dict(WINDOW)],
        "get_transit_details": lambda: {"dominant_transit": None, "sun_element": "Water", "current_elemental_balance": {}},
        "get_planetary_hour": (
            transit_engine.get_planetary_hour if real_planetary_hour
            else planetary_hour if callable(planetary_hour)
            else (lambda coordinates: planetary_hour)
        ),
        # the real thing
        "get_lunar_modifier": get_lunar_modifier, "get_seasonal_modifiers": season or get_seasonal_modifiers,
        "calculate_total_potency_score": calculate_total_potency_score,
        "calculate_alchemical_quantities": calculate_alchemical_quantities,
        "get_zodiac_sign_and_element": get_zodiac_sign_and_element,
        "db_zodiac_signs": db_zodiac_signs, "environmental_match_details": environmental_match_details,
        "recipe_from_read_model": recipe_from_read_model, "chart_request_problem": chart_request_problem,
        "CelestialCoordinates": CelestialCoordinates, "FOREST_HILLS_COORDINATES": FOREST_HILLS_COORDINATES,
        "datetime": datetime,
    }
    extract(COLLECTIVE, ["ChartData", "CollectiveSynastryEngine"], namespace)
    if engine_profile is not None:
        class StandInEngine:
            def __init__(self, db_session):
                pass

            async def calculate_collective_elemental_deficits(self, charts):
                return {"collective_deficit_analysis": {"harmonizing_profile": engine_profile}}

        namespace["CollectiveSynastryEngine"] = StandInEngine
    handler_namespace = {**namespace}
    extract(MAIN, ["RecipeRecommendationRequest", "get_recipe_recommendations_by_chart"], handler_namespace)
    return handler_namespace


# --- the data ---------------------------------------------------------------------------------

SIGNS = ["Gemini", "Pisces", "Cancer", "Gemini"]
CATEGORIES = ["Fruits", "Vegetables", "Vegetables", "Vegetables"]  # Waxing Gibbous boosts Fruits only

# The types a raw text() query hands back, which a stand-in must not smooth over: SQLAlchemy's
# psycopg2 dialect returns uuid.UUID for a uuid column, and psycopg2 returns a Decimal for the
# NUMERIC(3,2) that 01-schema.sql declares for affinity_strength (production's column is real,
# which comes back as a float). The rows below carry both, alternately.
RECIPE_IDS = {name: uuid.uuid5(uuid.NAMESPACE_DNS, f"by-chart.test/{name}") for name in (*STORED, "fallback")}
NAME_OF = {str(recipe_id): name for name, recipe_id in RECIPE_IDS.items()}
A_CHART_ID = str(uuid.uuid5(uuid.NAMESPACE_DNS, "by-chart.test/saved-chart"))


def affinity(value, i):
    return Decimal(str(value)) if i % 2 else float(value)


def rows_for(name, read_model, first_ingredient="plain ingredient", names=None, value=None):
    ingredients = names or [first_ingredient, "ingredient 1", "ingredient 2", "ingredient 3"]
    value = AFFINITY[name] if value is None else value
    return [
        (RECIPE_IDS[name], f"recipe {name}", None, "italian", read_model,
         ingredients[i], CATEGORIES[i], SIGNS[i], affinity(value, i))
        for i in range(4)
    ]


def read_model(element):
    return {
        "id": str(RECIPE_IDS[element]), "name": f"recipe {element}",
        "elemental_properties": STORED[element], "nutritional_profile": None,
    }


def all_rows(window_ingredient="plain ingredient"):
    rows = []
    for element in STORED:
        rows += rows_for(element, read_model(element), window_ingredient if element == "Water" else "plain ingredient")
    rows += rows_for("fallback", None)  # no read model: served through the database fallback
    return rows


def run(handler_namespace, db, **request_fields):
    fields = {"year": 1990, "month": 6, "day": 15, "hour": 12, "minute": 0, "latitude": 40.7, "longitude": -74.0}
    request = handler_namespace["RecipeRecommendationRequest"](**{**fields, **request_fields})
    return asyncio.run(handler_namespace["get_recipe_recommendations_by_chart"](request, db=db))


def by_id(result):
    return {NAME_OF[r["recipe_id"]]: r for r in result["recommendations"]}


# --- the handler -------------------------------------------------------------------------------


@pytest.mark.parametrize("lunar", [False, True])
def test_the_handler_runs_the_whole_loop_with_and_without_lunar_data(lunar):
    db = FakeDb(all_rows())
    result = run(load(), db, include_lunar_data=lunar)

    recs = by_id(result)
    assert sorted(recs) == ["Air", "Earth", "Fire", "Water", "fallback"]
    # the chart's signs reach the query in the database's spelling, once
    assert db.executed == [{"zodiac_signs": ("Cancer", "Gemini", "Pisces")}]
    season = get_seasonal_modifiers()["current_zodiac"]
    expected_text = (
        f"Aligns with current environmental energies! Current: Waxing Gibbous + {season} Season" if lunar
        else f"Aligns with current environmental energies! Current: {season} Season"
    )
    assert result["lunar_phase"] == (PHASE if lunar else None)
    for rec in recs.values():
        assert rec["isEnvironmentalMatch"] is True and rec["environmentalMatchDetails"] == expected_text


@pytest.mark.parametrize("lunar", [False, True])
def test_the_recommendations_are_ranked_by_the_exact_weighted_score(lunar):
    result = run(load(season=constant_season()), FakeDb(all_rows()), include_lunar_data=lunar)

    assert [NAME_OF[r["recipe_id"]] for r in result["recommendations"]] == RANKED
    fruit = get_lunar_modifier(PHASE["phase_name"], "Fruits") if lunar else 1.0
    vegetable = get_lunar_modifier(PHASE["phase_name"], "Vegetables") if lunar else 1.0
    assert fruit > vegetable if lunar else fruit == vegetable == 1.0
    for rec in result["recommendations"]:
        name = NAME_OF[rec["recipe_id"]]
        expected = AFFINITY[name] * (fruit + 3 * vegetable)  # the product, four ingredients, seasonal modifier 1.0
        assert rec["weighted_environmental_score"] == pytest.approx(expected)
        mods = rec["matching_ingredients"]
        assert [m["lunar_modifier"] for m in mods] == [fruit, vegetable, vegetable, vegetable]
        assert all(m["seasonal_modifier"] == 1.0 for m in mods)
        assert [m["base_affinity"] for m in mods] == pytest.approx([AFFINITY[name]] * 4)
        assert all(type(m["base_affinity"]) is float for m in mods)  # the driver's Decimal leaves as a float


def test_the_seasonal_modifier_follows_the_ingredient_and_the_season():
    names = ["fresh ginger", "brown rice", "basil", "cucumber"]  # fire, earth, air, water boost lists
    boosts = {"fire": ["ginger"], "earth": ["rice"], "air": ["basil"], "water": ["cucumber"]}
    expected = {"Aries": [1.2, 0.9, 0.9, 0.9], "Taurus": [0.9, 1.2, 0.9, 0.9],
                "Gemini": [0.9, 0.9, 1.2, 0.9], "Cancer": [0.9, 0.9, 0.9, 1.2]}
    for zodiac, modifiers in expected.items():
        rows = rows_for("Fire", read_model("Fire"), names=names)
        rec = by_id(run(load(season=constant_season(zodiac, **boosts)), FakeDb(rows)))["Fire"]
        assert [m["seasonal_modifier"] for m in rec["matching_ingredients"]] == modifiers, zodiac
    plain = by_id(run(load(season=constant_season("Aries", **boosts)), FakeDb(rows_for("Fire", read_model("Fire")))))["Fire"]
    assert [m["seasonal_modifier"] for m in plain["matching_ingredients"]] == [1.0] * 4


def test_each_recommendation_carries_its_own_elements_and_is_scored_on_them():
    recs = by_id(run(load(), FakeDb(all_rows())))
    for element in STORED:
        rec = recs[element]
        stored = STORED[element]
        assert rec["elementalProperties"] == {name.capitalize(): value for name, value in stored.items()}
        assert rec["total_potency_score"] == pytest.approx(POTENCY[element])
        assert rec["essence_score"] == pytest.approx(stored["water"] * 0.7)
    # the recipe served through the database fallback has the fallback's elements, not a neighbour's
    assert recs["fallback"]["elementalProperties"] == {"Fire": 0.7, "Water": 0.1, "Earth": 0.1, "Air": 0.1}
    assert recs["fallback"]["total_potency_score"] == pytest.approx(POTENCY["Fire"])
    assert len({round(r["total_potency_score"], 6) for r in recs.values()}) == 4


def test_the_fallback_asks_the_database_for_exactly_that_recipe_and_nothing_else():
    db = FakeDb(all_rows())
    run(load(), db)
    fallback_id = RECIPE_IDS["fallback"]
    assert sorted(db.filters, key=str) == sorted([
        ("==", "Recipe.id", fallback_id),
        ("==", "ElementalProperties.entity_type", "recipe"),
        ("==", "ElementalProperties.entity_id", fallback_id),
    ], key=str)


def test_a_read_model_that_is_not_an_object_takes_the_database_fallback():
    rows = rows_for("Water", '"{\\"id\\": \\"double-encoded\\"}"')  # what a json.dumps'd value stored as jsonb reads back as
    rec = by_id(run(load(), FakeDb(rows)))["Water"]
    assert rec["elementalProperties"] == {"Fire": 0.7, "Water": 0.1, "Earth": 0.1, "Air": 0.1}


def test_a_cooking_window_attaches_to_the_recipe_with_an_ingredient_of_its_food_type():
    recs = by_id(run(load(), FakeDb(all_rows("Simple & Wholesome porridge"))))
    assert recs["Water"]["optimal_cooking_window"] == WINDOW
    assert sorted(k for k, r in recs.items() if r["optimal_cooking_window"] is None) == ["Air", "Earth", "Fire", "fallback"]


def test_the_requests_coordinates_reach_the_chart_function():
    chart = chart_with(CHART)
    run(load(chart=chart), FakeDb(all_rows()), latitude=-33.9, longitude=151.2)
    assert chart.calls == [(1990, 6, 15, 12, 0, -33.9, 151.2)]


def test_a_chart_that_names_no_sign_skips_the_query_instead_of_sending_an_empty_in_list():
    db = FakeDb(all_rows())
    namespace = load(chart=lambda *a: {"positions": {"Ascendant": {"exactLongitude": 1.0}}})
    assert run(namespace, db)["recommendations"] == []
    assert db.executed == []


def test_a_chart_with_one_sign_still_runs_the_query_with_a_one_element_tuple():
    db = FakeDb(all_rows())
    run(load(chart=chart_with({"Sun": "gemini", "Moon": "gemini"})), db)
    assert db.executed == [{"zodiac_signs": ("Gemini",)}]


def test_the_recommendations_carry_every_field_the_client_schema_requires():
    # src/lib/validation/astrologySchemas.ts parses this response on the client.
    source = CLIENT_SCHEMA.read_text(encoding="utf-8")
    block = source.split("export const RecipeRecommendationSchema = z", 1)[1].split(".passthrough()", 1)[0]
    wanted = set(re.findall(r"^    (\w+):", block, re.M))
    assert len(wanted) >= 15, wanted
    rec = next(iter(by_id(run(load(), FakeDb(all_rows()))).values()))
    assert wanted <= set(rec), f"missing from the response: {sorted(wanted - set(rec))}"


# --- the request is validated where the route is reachable without the proxy -----------------

VALID = {"year": 1990, "month": 6, "day": 15, "hour": 12, "minute": 0, "latitude": 40.7, "longitude": -74.0}


@pytest.mark.parametrize(
    "change",
    [
        {"hour": 24}, {"hour": -1}, {"minute": 60}, {"month": 0}, {"month": 13}, {"day": 0}, {"day": 32},
        {"month": 2, "day": 30}, {"year": 2023, "month": 2, "day": 29}, {"month": 4, "day": 31},
        {"year": 0}, {"year": 3001}, {"year": 99999},
        {"latitude": 90.1}, {"latitude": -90.1}, {"longitude": 180.1}, {"longitude": -180.1}, {"latitude": float("nan")},
        {"secondary_chart_ids": ["chart-1"]}, {"secondary_chart_ids": [A_CHART_ID, "not-a-uuid"]},
        {"secondary_chart_ids": ["urn:uuid:" + A_CHART_ID]},
        {"year": True}, {"month": True}, {"hour": True}, {"latitude": True}, {"longitude": True},  # pydantic reads true as 1
    ],
    ids=str,
)
def test_a_request_outside_the_ranges_is_refused_before_the_handler_runs(change):
    with pytest.raises(ValidationError):
        load()["RecipeRecommendationRequest"](**{**VALID, **change})


@pytest.mark.parametrize(
    "change",
    [
        {"year": 1, "month": 1, "day": 1}, {"year": 3000, "month": 12, "day": 31}, {"hour": 0, "minute": 0},
        {"hour": 23, "minute": 59}, {"latitude": 90.0}, {"latitude": -90.0}, {"longitude": 180.0}, {"longitude": -180.0},
        {"year": 2024, "month": 2, "day": 29}, {"secondary_chart_ids": [A_CHART_ID]}, {"secondary_chart_ids": []},
    ],
    ids=str,
)
def test_a_request_at_the_edges_of_the_ranges_is_accepted(change):
    assert load()["RecipeRecommendationRequest"](**{**VALID, **change}).year >= 1


# --- the collective branch ---------------------------------------------------------------------


def saved_chart():
    # Production's saved_charts rows hold birth_time as HH:MM:SS (read 2026-11-03), birth_date as a timestamp.
    return types.SimpleNamespace(
        birth_date=datetime.datetime(1985, 3, 3, tzinfo=datetime.timezone.utc), birth_time="08:30:00",
        birth_latitude=51.5, birth_longitude=-0.12, timezone_str="Europe/London",
    )


def test_secondary_charts_reach_the_collective_engine_and_its_verdict_adjusts_the_potency():
    # Spirit-boosting (Kinetic) in a Fire planetary hour multiplies potency by 1.2.
    namespace = load(planetary_hour="Sun", engine_profile="Spirit-boosting (Kinetic)")
    plain = by_id(run(load(planetary_hour="Sun"), FakeDb(all_rows())))
    db = FakeDb(all_rows(), saved_chart())
    boosted = by_id(run(namespace, db, secondary_chart_ids=[A_CHART_ID]))
    assert ("==", "SavedChart.id", A_CHART_ID) in db.filters
    for element in STORED:
        assert boosted[element]["collective_potency_modifier_applied"] == 1.2
        assert boosted[element]["total_potency_score"] == pytest.approx(plain[element]["total_potency_score"] * 1.2)
        assert plain[element]["collective_potency_modifier_applied"] == 1.0


def test_a_secondary_chart_that_is_not_found_is_skipped_not_fatal():
    namespace = load(engine_profile="Spirit-boosting (Kinetic)")
    db = FakeDb(all_rows(), saved_chart=None)
    result = run(namespace, db, secondary_chart_ids=[A_CHART_ID])
    assert len(result["recommendations"]) == 5
    assert ("==", "SavedChart.id", A_CHART_ID) in db.filters


def test_the_real_collective_engine_takes_a_neutral_participant_without_raising():
    # `chart=` goes through load(): the engine's globals are the dict it was executed in, not a copy of it.
    namespace = load(planetary_hour="Venus", chart=lambda *a: {"positions": {"Sun": {"exactLongitude": 84.5}}})
    ChartData, Engine = namespace["ChartData"], namespace["CollectiveSynastryEngine"]
    charts = [
        ChartData(year=1985, month=3, day=3, hour=8, minute=30, latitude=51.5, longitude=-0.12, timezone_str="Europe/London"),
        ChartData(year=1990, month=6, day=15, hour=12, minute=0, latitude=40.7, longitude=-74.0, timezone_str="America/New_York"),
    ]
    engine = Engine(None)
    snapshot = asyncio.run(engine._get_individual_elemental_snapshot(charts[0]))
    # A participant with no recipe profile is neutral to the potency score: not scored as Fire-dominant.
    assert snapshot["potency_and_physics"]["thermo_rating"] == 0.5
    assert snapshot["natal_sun_element"] == "Air"  # 84.5 deg is Gemini
    analysis = asyncio.run(engine.calculate_collective_elemental_deficits(charts))
    assert analysis["collective_deficit_analysis"]["harmonizing_profile"] in {
        "Spirit-boosting (Kinetic)", "Matter-grounding (Stabilizing)", "Balanced & Harmonious",
    }
    assert set(analysis["collective_smes_averages"]) >= {"spirit_score", "matter_score", "essence_score", "substance_score"}


def test_only_a_valueerror_from_the_planetary_hour_is_taken_for_an_unknown_hour():
    def an_astral_bug(coordinates):
        raise RuntimeError("an astral bug")

    def no_sunrise(coordinates):
        raise ValueError("Sun is always below the horizon on this day, at this location.")

    def chart(*args):
        return {"positions": {"Sun": {"exactLongitude": 84.5}}}

    def snapshot_with(hour_function):
        namespace = load(planetary_hour=hour_function, chart=chart)
        participant = namespace["ChartData"](
            year=1985, month=3, day=3, hour=8, minute=30, latitude=51.5, longitude=-0.12, timezone_str="Europe/London"
        )
        return asyncio.run(namespace["CollectiveSynastryEngine"](None)._get_individual_elemental_snapshot(participant))

    assert snapshot_with(no_sunrise)["planetary_hour_ruler"] is None
    with pytest.raises(RuntimeError, match="an astral bug"):
        snapshot_with(an_astral_bug)


def test_a_participant_with_invalid_coordinates_is_an_error_not_an_unknown_planetary_hour():
    # CelestialCoordinates validates its range; only the planetary-hour computation may fail quietly.
    namespace = load(real_planetary_hour=True, chart=lambda *a: {"positions": {"Sun": {"exactLongitude": 84.5}}})
    participant = namespace["ChartData"](
        year=1985, month=3, day=3, hour=8, minute=30, latitude=95.0, longitude=18.96, timezone_str="Europe/Oslo"
    )
    with pytest.raises(ValidationError):
        asyncio.run(namespace["CollectiveSynastryEngine"](None)._get_individual_elemental_snapshot(participant))


def test_a_participant_born_where_the_sun_does_not_rise_does_not_fail_the_whole_request(monkeypatch):
    assert transit_engine.sun is not None, "astral is not installed; the CI step installs it"

    class Midwinter(datetime.datetime):
        @classmethod
        def now(cls, tz=None):
            return cls(2026, 12, 21, 12, 0, tzinfo=tz)

    monkeypatch.setattr(transit_engine, "datetime", types.SimpleNamespace(datetime=Midwinter, timedelta=datetime.timedelta))
    tromso = CelestialCoordinates(latitude=69.65, longitude=18.96)
    with pytest.raises(ValueError):  # the precondition: the real function does raise there
        transit_engine.get_planetary_hour(tromso)

    namespace = load(real_planetary_hour=True, chart=lambda *a: {"positions": {"Sun": {"exactLongitude": 84.5}}})
    participant = namespace["ChartData"](
        year=1985, month=3, day=3, hour=8, minute=30, latitude=69.65, longitude=18.96, timezone_str="Europe/Oslo"
    )
    snapshot = asyncio.run(namespace["CollectiveSynastryEngine"](None)._get_individual_elemental_snapshot(participant))
    assert snapshot["planetary_hour_ruler"] is None
    assert snapshot["potency_and_physics"]["total_potency_score"] > 0
