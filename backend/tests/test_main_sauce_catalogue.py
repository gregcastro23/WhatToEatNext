"""The cuisine recommender's sauces must come from the sauce catalogue.

`get_sauce_recommendations_for_cuisine` (`backend/alchm_kitchen/main.py`)
read its catalogue from `from src.data.sauces import allSauces`, a TypeScript
module Python cannot import. The ImportError was caught, so in production the
catalogue was never used and every cuisine got the hard-coded generic list.
The catalogue now comes from `data/json/sauces.json`, an exact copy of the
TypeScript `allSauces` that main.py already serves at `/api/v1/sauces`.

Once the catalogue loads, three matching bugs decide what it returns:
- seasonality "all" (13 of 18 sauces) never matched a season;
- sign matching was case-sensitive, and the influences mix "Aries" and "leo";
- the 0.8 (sign and season) vs 0.6 (one of them) score did not order the
  results, so a two-way match could be cut by the top-3 limit.

This runs the helper the way production does: main.py's own JSON loader,
reading the real sauces.json, and any module-level catalogue import main.py
still has. Stdlib + pytest only, like the other test_main_* files.
"""
import ast
import asyncio
import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"
SAUCES_JSON = MAIN_PY.parent / "data" / "json" / "sauces.json"

HELPER = "get_sauce_recommendations_for_cuisine"
LOADERS = ("load_json_file_cached", "load_json_file")


def _module():
    return ast.parse(MAIN_PY.read_text())


def _catalogue_nodes(module):
    """main.py's module-level statements that set up the sauce catalogue."""
    nodes = []
    for node in module.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id == "DATA_JSON_PATH" for t in node.targets
        ):
            nodes.append(node)
        elif isinstance(node, ast.FunctionDef) and node.name in LOADERS:
            nodes.append(node)
        elif isinstance(node, ast.Try) and any(
            isinstance(inner, ast.ImportFrom) and (inner.module or "").endswith("sauces")
            for inner in ast.walk(node)
        ):
            nodes.append(node)  # the old TypeScript import, run as production ran it
    return nodes


def _helper():
    module = _module()
    body = _catalogue_nodes(module) + [
        n for n in module.body if isinstance(n, ast.AsyncFunctionDef) and n.name == HELPER
    ]
    namespace = {
        "__file__": str(MAIN_PY), "os": os, "json": json, "lru_cache": lru_cache,
        "Any": Any, "Dict": Dict, "List": List, "Optional": Optional,
    }
    exec(compile(ast.Module(body=body, type_ignores=[]), str(MAIN_PY), "exec"), namespace)
    return namespace[HELPER]


def _recommend(cuisine_id, zodiac_sign, season):
    return asyncio.run(_helper()(cuisine_id, zodiac_sign, season))


CATALOGUE = json.loads(SAUCES_JSON.read_text())


def _catalogue_for(cuisine):
    return {s["name"]: s for s in CATALOGUE.values() if s["cuisine"].lower() == cuisine}


def test_scan_finds_the_helper_and_the_loader():
    # Witness: a renamed function would leave the tests below testing nothing.
    module = _module()
    names = {n.name for n in module.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}
    assert {HELPER, *LOADERS} <= names
    assert any(isinstance(n, ast.Assign) for n in _catalogue_nodes(module))


def test_control_the_catalogue_file_is_the_18_sauces():
    assert len(CATALOGUE) == 18
    assert all(s["cuisine"] and s["seasonality"] for s in CATALOGUE.values())


def test_italian_sauces_come_from_the_catalogue():
    italian = _catalogue_for("italian")
    sauces = _recommend("italian", None, "Winter")
    assert len(sauces) == 3
    for sauce in sauces:
        assert sauce["sauce_name"] in italian, f"not a catalogue sauce: {sauce}"
        assert sauce["description"] == italian[sauce["sauce_name"]]["description"]


def test_an_all_season_sauce_matches_every_season():
    thai = _catalogue_for("thai")
    assert {s["seasonality"] for s in thai.values()} == {"all"}  # the premise
    for season in ("Spring", "Summer", "Autumn", "Winter"):
        sauces = _recommend("thai", None, season)
        assert [s["sauce_name"] for s in sauces] and all(s["sauce_name"] in thai for s in sauces)


def test_a_sign_matches_whatever_its_case_in_the_catalogue():
    # Thai Red Curry lists "Aries", capitalised; Marinara lists "leo".
    red = _recommend("thai", "Aries", "Winter")[0]
    assert red["sauce_name"] == CATALOGUE["thaiRedCurry"]["name"]
    assert red["reason"] == "Matches Aries energy"
    marinara = _recommend("italian", "Leo", "Winter")[0]
    assert marinara["sauce_name"] == CATALOGUE["marinara"]["name"]


def test_a_sign_and_season_match_outranks_the_top_3_limit():
    # Béchamel ("all", "cancer") is 5th of the 6 Italian sauces in catalogue order,
    # behind three Winter-only matches (Marinara, Carbonara, Ragù).
    sauces = _recommend("italian", "Cancer", "Winter")
    assert sauces[0]["sauce_name"] == CATALOGUE["bechamel"]["name"]
    assert sauces[0]["compatibility_score"] > sauces[1]["compatibility_score"]


def test_control_a_cuisine_with_no_matching_sauce_keeps_the_generic_list():
    # French sauces are spring or autumn/winter only; none suits Summer.
    sauces = _recommend("french", None, "Summer")
    assert [s["sauce_name"] for s in sauces] == ["Béarnaise", "Hollandaise", "Béchamel"]


def test_a_cuisine_with_no_sauces_gets_none_not_a_placeholder():
    # Korean is in neither the catalogue nor the hard-coded list. It got a
    # sauce named "Traditional Sauce".
    assert _recommend("korean", None, "Winter") == []
