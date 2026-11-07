"""The pieces of the cooking-ritual route that need neither FastAPI nor SQLAlchemy.

`POST /api/rituals/generate-cooking-instruction` (backend/alchm_kitchen/main.py) had never been run.
Its defects hid one another, and the ones that live in logic rather than wiring are fixed here so a
test can state them without booting the app (backend/tests/test_ritual_handler.py runs the handler
itself against stand-ins).

Only the standard library and the by-chart helpers (themselves standard-library only), so the tests
run on a bare Python.
"""
from typing import Any, Dict, Mapping, Optional

from backend.utils.by_chart_recommendations import UUID_TEXT, engine_elemental_properties, recipe_from_read_model

ELEMENT_COLUMNS = ("fire", "water", "earth", "air")


def elemental_properties_from_row(row: Any) -> Optional[Dict[str, float]]:
    """An `elemental_properties` row as the engines read a recipe's elements, or None.

    The route assigned the ORM row itself to `recipe.elementalProperties`. The row is an object with
    fire/water/earth/air attributes: `calculate_total_potency_score` calls `.values()` on what it is
    given, so every recipe that had a row raised `AttributeError: ... has no attribute 'values'`, and
    `calculate_alchemical_quantities` ignores anything that is not a dict. The engines read
    {"Fire", "Water", "Earth", "Air"} floats, spelled that way, and treat None as "no profile" (a
    neutral score). None therefore also covers a row with a share that is missing or not a finite
    number, rather than a guess.
    """
    if row is None:
        return None
    return engine_elemental_properties({name: getattr(row, name, None) for name in ELEMENT_COLUMNS})


def read_model_elemental_properties(read_model: Any) -> Optional[Dict[str, float]]:
    """The elements a recipe's `recipes.read_model` document carries, as the engines read them, or None.

    The route looked only in the `elemental_properties` table, which had no rows in production when it
    was last measured (2026-11-03), while all 1099 public recipes carried their elements in the read
    model (lowercase keys: {"fire": .., "water": .., ...}). Every recipe was therefore scored as if
    nothing were known about it, which is a valid answer to the engines and a wrong one here. The
    by-chart route reads the same document the same way (`recipe_from_read_model`), so the two routes
    score one recipe on one set of elements.

    None when the read model is missing, is not an object (a double-encoded JSON string, say), or does
    not hold all four finite shares; the caller then asks the table.
    """
    if not isinstance(read_model, Mapping):
        return None
    return recipe_from_read_model(read_model).elementalProperties


def ritual_request_problem(recipe_id: Any) -> Optional[str]:
    """What is wrong with a ritual request, or None.

    `recipe_id` must be a UUID in its canonical text form. recipes.id is a uuid column, so Postgres
    rejects any other string ("invalid input syntax for type uuid", SQLSTATE 22P02) and the handler
    answered 500, with the SQL statement and its parameters in the body; a client that sent a slug
    needs a 422 that says what was wrong. The same check, for the same reason, guards the by-chart
    route's secondary chart ids (UUID_TEXT).
    """
    if not (isinstance(recipe_id, str) and UUID_TEXT.fullmatch(recipe_id)):
        return f"recipe_id must be a UUID, not {recipe_id!r}"
    return None
