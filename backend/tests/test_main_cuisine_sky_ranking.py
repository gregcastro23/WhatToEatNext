"""The cuisine recommender must rank cuisines by the sky, not by hand-set weights.

`GET /cuisines/recommend` (`backend/alchm_kitchen/main.py`) scored each
cuisine as 0.4·zodiac + 0.4·season + 0.2·base weight. The zodiac and season
terms looked up UUID `entity_id` columns by strings like 'italian', so they
were always 0, and the hand-set base weights (1.0; American 0.8; Russian and
African 0.7) decided the order: the same for every sky. Now:

- each cuisine's score is the cosine similarity between the sky's element
  shares (main.py's own alchemize engine) and the cuisine's profile, which is
  COMPUTED from its dishes (data/json/cuisines.json);
- when the ephemeris fails, the most recent sky the process computed is used
  and marked `cached`, with the time it was computed;
- with no sky at all, the cuisines are unranked: score None, alphabetical.

Like the other test_main_* files this extracts the endpoint and its helpers
from main.py's source and runs them with the ephemeris, the alchemize engine
and the database stubbed, reading the real cuisines.json. Stdlib + pytest only.
"""
import ast
import asyncio
import datetime as _dt
import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

MAIN_PY = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"
CUISINES_JSON = MAIN_PY.parent / "data" / "json" / "cuisines.json"
ENDPOINT = "get_current_moment_cuisine_recommendations"

# Loaded from source when present. The first four and the endpoint exist in
# both the old and the new main.py; the rest are new, the scorer is old.
DEFINITIONS = (
    "DATA_JSON_PATH", "load_json_file_cached", "load_json_file", "normalize_cuisine_id",
    "load_cuisine_records", "RECOMMENDABLE_CUISINES", "SKY_ELEMENTS", "_LAST_SKY",
    "current_sky", "elemental_match", "rank_cuisines_by_sky", "match_reason",
    "calculate_cuisine_astrological_compatibility", ENDPOINT,
)

IDS = ('italian', 'french', 'japanese', 'indian', 'chinese', 'mexican', 'thai',
       'greek', 'korean', 'vietnamese', 'middle-eastern', 'american', 'russian', 'african')
ELEMENTS = ("Fire", "Water", "Earth", "Air")

FIRE_SKY = {"Fire": 0.55, "Water": 0.15, "Earth": 0.15, "Air": 0.15}
WATER_SKY = {"Fire": 0.1, "Water": 0.5, "Earth": 0.25, "Air": 0.15}


def _norm(cuisine_id):
    return "".join(ch for ch in cuisine_id.lower() if ch.isalnum())


PROFILES = {_norm(k): v["elementalProperties"] for k, v in json.loads(CUISINES_JSON.read_text()).items()}


def _cosine(a, b):
    dot = sum(a[e] * b[e] for e in ELEMENTS)
    return dot / (sum(a[e] ** 2 for e in ELEMENTS) ** 0.5 * sum(b[e] ** 2 for e in ELEMENTS) ** 0.5)


def _expected_order(sky):
    """The ranking computed here, independently of main.py."""
    return sorted(IDS, key=lambda c: (-_cosine(sky, PROFILES[_norm(c)]), c))


def _defines(node, name):
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
        return node.name == name
    if isinstance(node, ast.Assign):
        return any(isinstance(t, ast.Name) and t.id == name for t in node.targets)
    if isinstance(node, ast.AnnAssign):
        return isinstance(node.target, ast.Name) and node.target.id == name
    return False


class _HTTPException(Exception):
    def __init__(self, status_code, detail=None):
        super().__init__(detail)
        self.status_code = status_code


def _clock(year, month, day, hour, minute):
    class _Clock(_dt.datetime):
        @classmethod
        def utcnow(cls):
            return cls(year, month, day, hour, minute)

        @classmethod
        def now(cls, tz=None):
            return cls.utcnow()

    return _Clock


class _Column:
    """A stand-in model column for the old DB scorer: comparisons yield markers."""

    def __eq__(self, other):
        return ("eq", other)

    def __gt__(self, other):
        return ("gt", other)

    __hash__ = object.__hash__


class _Model:
    zodiac_sign = _Column()
    affinity_strength = _Column()
    season = _Column()
    strength = _Column()


class _DB:
    """No affinity rows: what the UUID-vs-'italian' join always matched."""

    def query(self, _model):
        return self

    def filter(self, *_conditions):
        return self

    def all(self):
        return []

    def rollback(self):
        pass


class _Server:
    """One process running the endpoint from source; the sky can be changed or broken."""

    def __init__(self):
        self.shares = dict(FIRE_SKY)
        self.ephemeris_works = True

        def ephemeris(*_args):
            if not self.ephemeris_works:
                raise RuntimeError("swisseph unavailable")
            return {"positions": {"Sun": {"sign": "capricorn"}}}

        async def nested(cuisine_id, season, meal_type, zodiac_sign, db):
            return {"cuisine_id": cuisine_id}

        async def log_metric(*_args, **_kwargs):
            return None

        self.namespace = {
            "__file__": str(MAIN_PY), "os": os, "json": json, "lru_cache": lru_cache,
            "Any": Any, "Dict": Dict, "List": List, "Optional": Optional,
            "Session": object, "Depends": lambda dependency: None, "get_db": None,
            "HTTPException": _HTTPException, "datetime": _dt.datetime,
            "calculate_planetary_positions_swisseph": ephemeris,
            "calculate_local_alchemize": lambda request: {"elementalProperties": dict(self.shares)},
            "AlchemizeRequest": lambda **fields: fields,
            "FOREST_HILLS_COORDINATES": {"latitude": 40.7, "longitude": -73.8},
            "get_cuisine_with_nested_data": nested,
            "log_system_metric": log_metric,
            "ZodiacAffinity": _Model, "SeasonalAssociation": _Model,
        }
        nodes = [n for n in ast.parse(MAIN_PY.read_text()).body
                 if any(_defines(n, name) for name in DEFINITIONS)]
        for node in nodes:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == ENDPOINT:
                node.decorator_list = []  # the route table is not under test
        exec(compile(ast.Module(body=nodes, type_ignores=[]), str(MAIN_PY), "exec"), self.namespace)

    def recommend(self, at=(2026, 1, 15, 12, 0), **params):
        self.namespace["datetime"] = _clock(*at)
        call = dict(zodiac_sign=None, season=None, meal_type=None, limit=len(IDS), db=_DB())
        call.update(params)
        return asyncio.run(self.namespace[ENDPOINT](**call))


def _order(response):
    return [r["cuisine_id"] for r in response["cuisine_recommendations"]]


def test_scan_finds_the_endpoint_and_the_loader():
    # Witness: renamed definitions would leave the tests below testing nothing.
    server = _Server()
    for name in ("load_json_file", ENDPOINT):
        assert name in server.namespace


def test_control_every_ranked_cuisine_has_a_derived_profile():
    records = json.loads(CUISINES_JSON.read_text())
    by_norm = {_norm(k): v for k, v in records.items()}
    for cuisine_id in IDS:
        record = by_norm[_norm(cuisine_id)]
        assert set(record["elementalProperties"]) == set(ELEMENTS)
        assert record["elementalProfileBasis"]["recipes"] > 0


def test_the_ranking_follows_the_sky():
    server = _Server()
    fire = _order(server.recommend())
    server.shares = dict(WATER_SKY)
    water = _order(server.recommend())
    assert fire != water  # the old ranking was the same for every sky
    assert fire == _expected_order(FIRE_SKY)
    assert water == _expected_order(WATER_SKY)


def test_no_cuisine_is_held_back_by_a_hand_set_weight():
    # A sky in exactly American proportions: American must come first. The
    # old base weights (American 0.8) always put it 12th of 14.
    server = _Server()
    server.shares = dict(PROFILES["american"])
    assert _order(server.recommend())[0] == "american"


def test_the_score_and_reason_state_the_computed_match():
    top = _Server().recommend()["cuisine_recommendations"][0]
    expected = _cosine(FIRE_SKY, PROFILES[_norm(top["cuisine_id"])])
    assert abs(top["astrological_score"] - expected) < 1e-12
    assert top["compatibility_reason"] == f"Elemental match with today's sky: {round(expected * 100)}%"


def test_a_failing_ephemeris_falls_back_to_the_most_recent_sky():
    server = _Server()
    first = server.recommend(at=(2026, 1, 15, 9, 30))
    server.ephemeris_works = False
    second = server.recommend(at=(2026, 1, 15, 12, 0))

    assert second["current_moment"]["zodiac_sign"] == "Capricorn"  # the cached Sun sign
    assert _order(second) == _order(first)
    sky = second["current_moment"]["sky"]
    assert sky["cached"] is True
    assert sky["computed_at"] == "2026-01-15T09:30:00Z"
    assert sky["elements"] == FIRE_SKY
    reason = second["cuisine_recommendations"][0]["compatibility_reason"]
    assert reason.startswith("Elemental match with the sky as of 2026-01-15 09:30 UTC: ")


def test_with_no_sky_at_all_the_cuisines_are_unranked():
    server = _Server()
    server.ephemeris_works = False  # a fresh process: nothing cached yet
    response = server.recommend()
    assert _order(response) == sorted(IDS)
    for recommendation in response["cuisine_recommendations"]:
        assert recommendation["astrological_score"] is None
        assert recommendation["compatibility_reason"] is None
    assert response["current_moment"]["sky"] is None
