"""A cuisine with no record must not be given an elemental profile.

`get_cuisine_with_nested_data` (`backend/alchm_kitchen/main.py`) builds each
cuisine in the `GET /cuisines/recommend` response. When it had no record for
the cuisine, it made one up with a balanced profile of 0.25 per element. That
was every response in production: its `cuisines` import named a TypeScript
module (`src/data/cuisines`), which Python cannot import. Now:

- records come from data/json/cuisines.json, whose profiles are COMPUTED from
  each cuisine's dishes, with the recipe count in `elemental_basis`;
- a cuisine with no record has no profile (`elemental_properties: None`), and
  a record without a profile is None too, not `{}`;
- the group endpoint, which the same import kept switched off, leaves out a
  cuisine without a full profile instead of assuming 0.25 per element, and
  gives no harmony instead of assuming 0.5 for a missing SMES score.

Like test_main_cuisine_recommend_sky.py, this extracts the function from
main.py's source with `ast` and runs it with its neighbours stubbed, so it
needs only the stdlib and pytest.
"""
import ast
import asyncio
import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"

NESTED = "get_cuisine_with_nested_data"
GROUP = "get_group_recommendations"
HARMONY = "elemental_smes_harmony"
ELEMENTS = {"fire", "water", "earth", "air"}
LOADERS = ("DATA_JSON_PATH", "load_json_file_cached", "load_json_file", "load_cuisine_records")


def _func(name):
    for node in ast.parse(MAIN_PY.read_text()).body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == name:
            return node
    raise AssertionError(f"{name} not found in main.py")


def _defines(node, names):
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
        return node.name in names
    if isinstance(node, ast.Assign):
        return any(isinstance(t, ast.Name) and t.id in names for t in node.targets)
    return False


def _exec(names, namespace):
    """Execute main.py's top-level definitions named in `names` into `namespace`."""
    for typing_name, value in (("Any", Any), ("Dict", Dict), ("List", List), ("Optional", Optional)):
        namespace.setdefault(typing_name, value)
    nodes = [n for n in ast.parse(MAIN_PY.read_text()).body if _defines(n, names)]
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(MAIN_PY), "exec"), namespace)
    return namespace


def _nested(cuisines=None):
    """The nested-data builder over `cuisines`, or over the real cuisines.json when None."""
    async def recipes(*_args):
        return []

    async def sauces(*_args):
        return []

    namespace = {
        "Session": object, "__file__": str(MAIN_PY), "os": os, "json": json, "lru_cache": lru_cache,
        "get_nested_recipes_for_cuisine": recipes,
        "get_sauce_recommendations_for_cuisine": sauces,
    }
    names = {NESTED, "normalize_cuisine_id"}
    if cuisines is None:
        names |= set(LOADERS)
    else:
        norm = lambda key: "".join(ch for ch in key.lower() if ch.isalnum())
        namespace["load_cuisine_records"] = lambda: {norm(k): v for k, v in cuisines.items()}
        # The globals the previous main.py read instead, so a red run compares like with like
        namespace.update(CUISINES_AVAILABLE=bool(cuisines), cuisines=cuisines)
    return _exec(names, namespace)[NESTED]


def _call(cuisines, cuisine_id):
    return asyncio.run(_nested(cuisines)(cuisine_id, "Winter", None, None, None))


def test_scan_finds_the_functions():
    # Witness: a renamed function would make the scans below pass vacuously.
    assert _func(NESTED).name == NESTED
    assert _func(GROUP).name == GROUP


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


def test_the_group_endpoint_assumes_no_element_or_smes_score():
    """No `.get("Fire", 0.25)` and no `.get("spirit_score", 0.5)` defaults."""
    invented = []
    for node in ast.walk(_func(GROUP)):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "get"
            and len(node.args) == 2
            and isinstance(node.args[0], ast.Constant)
            and isinstance(node.args[0].value, str)
            and (node.args[0].value.lower() in ELEMENTS or node.args[0].value.endswith("_score"))
            and isinstance(node.args[1], ast.Constant)
            and isinstance(node.args[1].value, (int, float))
        ):
            invented.append((node.args[0].value, node.lineno))
    assert invented == [], f"the group endpoint assumes values at {invented}"


def test_records_come_from_the_cuisines_json_with_their_basis():
    records = {"".join(ch for ch in k.lower() if ch.isalnum()): v
               for k, v in json.loads((MAIN_PY.parent / "data" / "json" / "cuisines.json").read_text()).items()}
    data = _call(None, "middle-eastern")
    record = records["middleeastern"]
    assert data["name"] == record["name"]
    assert data["description"] == record["description"]
    assert data["elemental_properties"] == record["elementalProperties"]
    assert data["elemental_basis"] == record["elementalProfileBasis"]


def test_a_missing_smes_score_gives_no_harmony():
    harmony = _exec({HARMONY, "ELEMENT_SMES_WEIGHTS"}, {})[HARMONY]
    profile = {"Fire": 0.4, "Water": 0.3, "Earth": 0.2, "Air": 0.1}
    smes = {"spirit_score": 0.8, "essence_score": 0.6, "matter_score": 0.4}  # no substance_score
    assert harmony(profile, smes) is None  # not a 0.5 stand-in
    smes["substance_score"] = 0.2
    assert abs(harmony(profile, smes) - (0.4 * 0.8 * 0.3 + 0.3 * 0.6 * 0.3 + 0.2 * 0.4 * 0.2 + 0.1 * 0.2 * 0.2)) < 1e-12
