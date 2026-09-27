"""A cuisine with no record must not be given an elemental profile.

`get_cuisine_with_nested_data` (`backend/alchm_kitchen/main.py`) builds each
cuisine in the `GET /cuisines/recommend` response. When it has no record for
the cuisine, it made one up with a balanced profile of 0.25 per element. That
is every response in production: its `cuisines` import names a TypeScript
module (`src/data/cuisines`), which Python cannot import. Now:

- the profile is ABSENT (`elemental_properties: None`). The frontend readers
  already skip a missing profile (parseCuisineResponse, RecommendationsPanel);
- a record without a profile is also None, not `{}`, which reads as a profile
  with nothing in it.

Like test_main_cuisine_recommend_sky.py, this extracts the function from
main.py's source with `ast` and runs it with its neighbours stubbed, so it
needs only the stdlib and pytest.
"""
import ast
import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"

NESTED = "get_cuisine_with_nested_data"
ELEMENTS = {"fire", "water", "earth", "air"}


def _func(name):
    for node in ast.parse(MAIN_PY.read_text()).body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == name:
            return node
    raise AssertionError(f"{name} not found in main.py")


def _nested(cuisines):
    async def recipes(*_args):
        return []

    async def sauces(*_args):
        return []

    namespace = {
        "Any": Any, "Dict": Dict, "List": List, "Optional": Optional, "Session": object,
        "CUISINES_AVAILABLE": bool(cuisines), "cuisines": cuisines,
        "get_nested_recipes_for_cuisine": recipes,
        "get_sauce_recommendations_for_cuisine": sauces,
    }
    node = _func(NESTED)
    exec(compile(ast.Module(body=[node], type_ignores=[]), str(MAIN_PY), "exec"), namespace)
    return namespace[NESTED]


def _call(cuisines, cuisine_id):
    return asyncio.run(_nested(cuisines)(cuisine_id, "Winter", None, None, None))


def test_scan_finds_the_function():
    # Witness: a renamed function would make the scan below pass vacuously.
    assert _func(NESTED).name == NESTED


def test_no_elemental_profile_is_written_as_a_literal():
    """No `{'Fire': 0.25, ...}` and no `.get('elementalProperties', <default>)`."""
    invented = []
    for node in ast.walk(_func(NESTED)):
        if isinstance(node, ast.Dict):
            keys = {k.value.lower() for k in node.keys if isinstance(k, ast.Constant) and isinstance(k.value, str)}
            if keys & ELEMENTS and all(
                isinstance(v, ast.Constant) and isinstance(v.value, (int, float)) for v in node.values
            ):
                invented.append(node.lineno)
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "get"
            and node.args
            and isinstance(node.args[0], ast.Constant)
            and node.args[0].value == "elementalProperties"
            and len(node.args) == 2
            and not (isinstance(node.args[1], ast.Constant) and node.args[1].value is None)
        ):
            invented.append(node.lineno)
    assert invented == [], f"main.py invents an elemental profile at lines {invented}"


def test_a_cuisine_without_a_record_has_no_elemental_profile():
    data = _call({}, "thai")
    assert data["elemental_properties"] is None  # not 0.25 each
    assert data["name"] == "Thai"


def test_a_record_without_a_profile_is_none_not_empty():
    data = _call({"thai": {"name": "Thai"}}, "thai")
    assert data["elemental_properties"] is None  # not {}


def test_control_a_record_with_a_profile_passes_it_through():
    profile = {"Fire": 0.4, "Water": 0.3, "Earth": 0.2, "Air": 0.1}
    data = _call({"thai": {"name": "Thai", "elementalProperties": profile}}, "thai")
    assert data["elemental_properties"] == profile
