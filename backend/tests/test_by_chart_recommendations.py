"""The by-chart recommender's helpers, and the wiring that keeps main.py using them.

`POST /api/astrological/recipe-recommendations-by-chart` never got past its first recipe. The
defects are described in backend/utils/by_chart_recommendations.py; the helpers are tested here
on a bare Python. main.py cannot be imported without FastAPI and SQLAlchemy, so the wiring is
read with `ast`, like the other deployed-server tests in this directory. The handler itself is
RUN, with stand-ins for the web and database layers, by test_by_chart_handler.py.
Standard library + pytest only.
"""
import ast
import math
from decimal import Decimal
from pathlib import Path

import pytest

from backend.utils.by_chart_recommendations import (
    CHART_RANGES,
    chart_request_problem,
    engine_elemental_properties,
    environmental_match_details,
    recipe_from_read_model,
)

BACKEND = Path(__file__).resolve().parents[1]
MAIN = BACKEND / "alchm_kitchen" / "main.py"
COLLECTIVE = BACKEND / "utils" / "collective_engine.py"
HANDLER = "get_recipe_recommendations_by_chart"

# The shape recipes.read_model holds for every public recipe in production (read 2026-11-03):
# lowercase element keys, one float each.
STORED = {"air": 0.23888888888888887, "fire": 0.14444444444444446, "earth": 0.3333333333333333, "water": 0.2833333333333334}
CAPITALIZED = {"Fire": 0.14444444444444446, "Water": 0.2833333333333334, "Earth": 0.3333333333333333, "Air": 0.23888888888888887}


# --- engine_elemental_properties ------------------------------------------------------------


def test_the_stored_lowercase_spelling_becomes_the_spelling_the_engines_read():
    assert engine_elemental_properties(STORED) == CAPITALIZED


def test_the_capitalized_spelling_is_taken_as_it_is_and_wins_over_a_lowercase_twin():
    assert engine_elemental_properties(CAPITALIZED) == CAPITALIZED
    assert engine_elemental_properties({**STORED, "Fire": 0.5})["Fire"] == 0.5


def test_a_zero_share_is_kept_not_treated_as_missing():
    assert engine_elemental_properties({"fire": 0.0, "water": 1.0, "earth": 0, "air": 0.0}) == {
        "Fire": 0.0, "Water": 1.0, "Earth": 0.0, "Air": 0.0,
    }


@pytest.mark.parametrize(
    "raw",
    [
        None,
        "fire",
        [0.25, 0.25, 0.25, 0.25],
        {},
        {"fire": 0.5, "water": 0.5},                                  # partial
        {**STORED, "air": None},
        {**STORED, "air": "0.2"},
        {**STORED, "air": True},                                      # a bool is not a share
        {**STORED, "air": math.nan},
        {**STORED, "air": math.inf},
        {**STORED, "air": Decimal("0.2")},
    ],
)
def test_anything_that_is_not_all_four_finite_numbers_is_none(raw):
    assert engine_elemental_properties(raw) is None


# --- recipe_from_read_model -----------------------------------------------------------------


def read_model(**extra):
    return {"id": "bca4f37d", "name": "Soup", "elemental_properties": STORED, "nutritional_profile": None, **extra}


def test_the_recipe_object_carries_every_key_of_the_read_model_and_its_id():
    recipe = recipe_from_read_model(read_model(cuisine="italian"))
    assert (recipe.id, recipe.name, recipe.cuisine, recipe.nutritional_profile) == ("bca4f37d", "Soup", "italian", None)


def test_both_places_the_engines_look_hold_the_capitalized_value():
    recipe = recipe_from_read_model(read_model())
    # calculate_total_potency_score reads .elementalProperties; calculate_alchemical_quantities
    # reads .elementalProperties and then .elemental_properties.
    assert recipe.elementalProperties == CAPITALIZED
    assert recipe.elemental_properties == CAPITALIZED


def test_a_camel_case_document_is_read_too_and_a_recipe_without_elements_gets_none():
    camel = {"id": "x", "elementalProperties": CAPITALIZED}
    assert recipe_from_read_model(camel).elementalProperties == CAPITALIZED
    bare = recipe_from_read_model({"id": "x"})
    assert bare.elementalProperties is None and bare.elemental_properties is None


# --- environmental_match_details ------------------------------------------------------------


def test_the_text_names_the_phase_and_the_season_when_there_is_a_phase():
    text = environmental_match_details({"phase_name": "Waning Crescent", "illumination_fraction": 0.1}, "Scorpio")
    assert text == "Aligns with current environmental energies! Current: Waning Crescent + Scorpio Season"


@pytest.mark.parametrize("lunar", [None, {}, {"phase_name": None}, {"phase_name": ""}, "Full Moon"])
def test_the_text_names_only_the_season_when_lunar_data_was_not_computed(lunar):
    assert environmental_match_details(lunar, "Scorpio") == "Aligns with current environmental energies! Current: Scorpio Season"


# --- main.py is wired to the helpers --------------------------------------------------------


def parse(path):
    return ast.parse(path.read_text(encoding="utf-8"))


def handler_node():
    return next(n for n in parse(MAIN).body if isinstance(n, ast.AsyncFunctionDef) and n.name == HANDLER)


def called_names(node):
    return {c.func.id for c in ast.walk(node) if isinstance(c, ast.Call) and isinstance(c.func, ast.Name)}


def test_the_handler_binds_the_signs_in_the_database_spelling():
    handler = handler_node()
    assert "db_zodiac_signs" in called_names(handler)
    assigned = {
        t.id
        for n in ast.walk(handler)
        if isinstance(n, ast.Assign) and isinstance(n.value, ast.Call)
        and isinstance(n.value.func, ast.Name) and n.value.func.id == "db_zodiac_signs"
        for t in n.targets if isinstance(t, ast.Name)
    }
    bound = {
        v.id
        for d in ast.walk(handler) if isinstance(d, ast.Dict)
        for k, v in zip(d.keys, d.values)
        if isinstance(k, ast.Constant) and k.value == "zodiac_signs" and isinstance(v, ast.Name)
    }
    assert assigned and assigned <= bound, "the :zodiac_signs parameter must be what db_zodiac_signs returned"


def test_the_handler_builds_its_recipe_and_its_text_with_the_helpers():
    assert {"recipe_from_read_model", "environmental_match_details"} <= called_names(handler_node())


def test_the_response_reads_the_elemental_properties_off_the_recipe_on_both_paths():
    handler = handler_node()
    values = [
        v for d in ast.walk(handler) if isinstance(d, ast.Dict)
        for k, v in zip(d.keys, d.values) if isinstance(k, ast.Constant) and k.value == "elementalProperties"
    ]
    assert len(values) == 1
    value = values[0]
    assert isinstance(value, ast.Attribute) and value.attr == "elementalProperties"
    assert isinstance(value.value, ast.Name) and value.value.id == "full_recipe"


def test_a_name_imported_into_main_is_not_rebound_by_a_class_there():
    # `class ElementalProperties(BaseModel)` rebound the ORM model imported above it, so every
    # db.query(ElementalProperties) raised AttributeError: entity_type.
    tree = parse(MAIN)
    imported = {
        (alias.asname or alias.name)
        for node in tree.body if isinstance(node, ast.ImportFrom) and (node.module or "").startswith("backend")
        for alias in node.names
    }
    classes = {node.name for node in tree.body if isinstance(node, ast.ClassDef)}
    assert imported & classes == set()


def test_no_database_query_in_main_goes_through_a_pydantic_model():
    tree = parse(MAIN)
    models = {
        node.name for node in tree.body if isinstance(node, ast.ClassDef)
        and any(isinstance(b, ast.Name) and b.id == "BaseModel" for b in node.bases)
    }
    queried = {
        call.args[0].id for call in ast.walk(tree)
        if isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute) and call.func.attr == "query"
        and call.args and isinstance(call.args[0], ast.Name)
    }
    assert queried & models == set()
    assert "ElementalPropertiesORM" in queried, "the by-chart fallback and the other readers query through the alias"


def test_the_collective_engines_neutral_recipe_has_no_elements_rather_than_a_non_dict():
    # The class it used had fire/water/earth/air attributes: not a dict, not iterable, so the
    # potency engine raised AttributeError at the first participant.
    classes = {n.name: n for n in ast.walk(parse(COLLECTIVE)) if isinstance(n, ast.ClassDef)}
    assert "DummyElementalProperties" not in classes
    assigned = [
        n.value for n in classes["DummyRecipe"].body
        if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "elementalProperties" for t in n.targets)
    ]
    assert len(assigned) == 1 and isinstance(assigned[0], ast.Constant) and assigned[0].value is None


# --- chart_request_problem ------------------------------------------------------------------

VALID = dict(year=1990, month=6, day=15, hour=12, minute=0, latitude=40.7, longitude=-74.0)


def problem(**change):
    return chart_request_problem(**{**VALID, **change})


def test_an_ordinary_request_has_no_problem():
    assert problem() is None
    assert problem(secondary_chart_ids=["0198f3c1-2f4a-7c11-9e33-abcdef012345"]) is None
    assert problem(secondary_chart_ids=[]) is None and problem(secondary_chart_ids=None) is None


@pytest.mark.parametrize("name", sorted(CHART_RANGES))
def test_each_field_accepts_both_edges_of_its_range_and_refuses_just_outside(name):
    low, high = CHART_RANGES[name]
    step = 1 if isinstance(low, int) else 0.0001
    # January has 31 days, so the edges of `day` and `year` are real dates
    base = {"year": dict(month=1, day=1), "day": dict(month=1)}.get(name, {})
    assert problem(**{**base, name: low}) is None and problem(**{**base, name: high}) is None
    for outside in (low - step, high + step):
        assert name in (problem(**{**base, name: outside}) or ""), (name, outside)


def test_the_ranges_are_the_ones_the_proxy_enforces():
    assert CHART_RANGES == {
        "year": (1, 3000), "month": (1, 12), "day": (1, 31), "hour": (0, 23), "minute": (0, 59),
        "latitude": (-90.0, 90.0), "longitude": (-180.0, 180.0),
    }


@pytest.mark.parametrize("change", [{"latitude": float("nan")}, {"longitude": float("nan")}])
def test_a_nan_is_refused(change):
    assert problem(**change)


@pytest.mark.parametrize(
    "when,valid",
    [((2024, 2, 29), True), ((2023, 2, 29), False), ((1900, 2, 29), False), ((2000, 2, 29), True),
     ((2024, 2, 30), False), ((2024, 4, 31), False), ((2024, 4, 30), True), ((2024, 12, 31), True)],
)
def test_the_date_must_exist(when, valid):
    year, month, day = when
    assert (problem(year=year, month=month, day=day) is None) is valid


GOOD_ID = "0198f3c1-2f4a-7c11-9e33-abcdef012345"


@pytest.mark.parametrize(
    "bad",
    [
        "chart-1", "", "0198f3c1", "not-a-uuid", 5, None,
        # strings uuid.UUID() accepts and Postgres's uuid input rejects, which a 422 must catch first
        "urn:uuid:" + GOOD_ID, "1-2345678-0000-0000-0000-000000000000",
        # forms Postgres accepts but the canonical text form does not (the safe direction)
        "{" + GOOD_ID + "}", GOOD_ID.replace("-", ""), GOOD_ID + "0", " " + GOOD_ID,
    ],
)
def test_a_secondary_chart_id_must_be_a_uuid_in_its_canonical_text_form(bad):
    assert "UUID" in (problem(secondary_chart_ids=[GOOD_ID, bad]) or "")


@pytest.mark.parametrize("good", [GOOD_ID, GOOD_ID.upper(), "00000000-0000-0000-0000-000000000000"])
def test_a_canonical_uuid_is_accepted_in_either_case(good):
    assert problem(secondary_chart_ids=[good]) is None


# --- more wiring ------------------------------------------------------------------------------


def test_the_handler_gives_the_chart_function_the_requests_coordinates():
    calls = [
        c for c in ast.walk(handler_node())
        if isinstance(c, ast.Call) and isinstance(c.func, ast.Name) and c.func.id == "calculate_planetary_positions_swisseph"
    ]
    assert len(calls) == 1
    passed = [ast.unparse(a) for a in calls[0].args]
    assert passed[-2:] == ["request.latitude", "request.longitude"], passed


def test_the_request_model_validates_before_and_after_through_the_shared_helper():
    tree = parse(MAIN)
    model = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == "RecipeRecommendationRequest")
    by_mode = {}
    for function in (f for f in model.body if isinstance(f, ast.FunctionDef)):
        for decorator in function.decorator_list:
            if isinstance(decorator, ast.Call) and getattr(decorator.func, "id", "") == "model_validator":
                by_mode[next(k.value.value for k in decorator.keywords if k.arg == "mode")] = function
    assert set(by_mode) == {"before", "after"}
    assert "chart_request_problem" in called_names(by_mode["after"])
