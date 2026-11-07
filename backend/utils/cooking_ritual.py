"""The pieces of the cooking-ritual route that need neither FastAPI nor SQLAlchemy.

`POST /api/rituals/generate-cooking-instruction` (backend/alchm_kitchen/main.py) had never been run.
Its defects hid one another, and the ones that live in logic rather than wiring are fixed here so a
test can state them without booting the app (backend/tests/test_ritual_handler.py runs the handler
itself against stand-ins).

Only the standard library and the by-chart helpers (themselves standard-library only), so the tests
run on a bare Python.
"""
from typing import Any, Dict, Optional

from backend.utils.by_chart_recommendations import engine_elemental_properties

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
