"""The cooking-ritual route, RUN: its real source, with stand-ins for what needs a server.

`POST /api/rituals/generate-cooking-instruction` had never been run. It failed at the first
statement that touched a database row, and each defect hid the next. main.py cannot be imported
without FastAPI and SQLAlchemy, so, like test_by_chart_handler.py, this reads `RitualRequest` and
`generate_cooking_instruction` out of main.py with `ast` and executes them against:
- REAL: the potency and quantity engines, the ritual text, `CelestialCoordinates` and pydantic;
- STAND-INS: the database session (rows carrying the types the real driver returns, ORM columns
  that RECORD the conditions the handler filters on, an ORM model that rejects an unknown keyword
  the way SQLAlchemy's constructor does), the HTTP layer, and what reads the clock or the
  ephemeris (transit details, planetary hour, cooking windows), so the numbers are exact.

Types the stand-ins must not smooth over (each measured, not assumed): a recipe row's `id` is a
uuid.UUID, `nutritional_profile` a dict (JSONB), `category` a str; an `elemental_properties` row
read through the ORM's `Float` columns carries floats even when the database column is the
numeric(4,3) that database/init/01-schema.sql declares (a raw text() query would hand back
Decimal, which is why the by-chart route converts), and `bool(row)` is True, so an ORM row is a
truthy object with no `.values()`.

Needs pydantic (pinned in backend/requirements.txt) next to pytest.
"""
import ast
import asyncio
import re
import types
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import pytest
from pydantic import BaseModel

from backend.config.celestial_config import FOREST_HILLS_COORDINATES
from backend.schemas.planetary import CelestialCoordinates
from backend.utils.alchemical_quantities import calculate_alchemical_quantities
from backend.utils.cooking_ritual import elemental_properties_from_row
from backend.utils.transit_engine import calculate_total_potency_score, get_cooking_ritual

REPO = Path(__file__).resolve().parents[2]
MAIN = REPO / "backend" / "alchm_kitchen" / "main.py"
MODELS = REPO / "backend" / "database" / "models.py"
MIGRATIONS = REPO / "database" / "init"

# The clock- and ephemeris-reading functions, made exact. They are stand-ins for the moment, not for the maths.
TRANSIT = {"dominant_transit": "Mars", "sun_element": "Water", "current_elemental_balance": {"Fire": 0.3, "Water": 0.2, "Earth": 0.3, "Air": 0.2}}
WINDOW = {"date": "2026-11-03", "mansion": "Uttara Phalguni", "food_type": "Simple & Wholesome", "start_time": "20:51"}
HOUR_RULER = "Sun"  # a Fire ruler

RECIPE_ID = uuid.uuid5(uuid.NAMESPACE_DNS, "ritual.test/recipe")
OTHER_ID = uuid.uuid5(uuid.NAMESPACE_DNS, "ritual.test/other")

# calculate_total_potency_score with the transit above (Mars, so the alignment term is 1.0), the Sun in a Water
# sign and the planetary hour ruled by the Sun (a Fire ruler):
#   0.4 * 1.0  +  0.3 * (1.0 if the recipe's element is Water else 0.5)  +  0.3 * parity(Fire 1, Air .7, Earth .5, Water .3, none .5)
#   +  0.25 if the recipe's element is Fire (the ruler's element)
POTENCY_FIRE = 0.4 + 0.3 * 0.5 + 0.3 * 1.0 + 0.25     # 1.10
POTENCY_WATER = 0.4 + 0.3 * 1.0 + 0.3 * 0.3           # 0.79
POTENCY_NEUTRAL = 0.4 + 0.3 * 0.5 + 0.3 * 0.5         # 0.70: no element profile at all

# The quantity engine rounds each score to 4 decimals, so a hand-computed score is within half a unit of the last one.
ROUNDED = 5e-5

FIRE = {"fire": 0.7, "water": 0.1, "earth": 0.1, "air": 0.1}
WATER = {"fire": 0.1, "water": 0.6, "earth": 0.2, "air": 0.1}


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


def model_columns(class_name: str) -> List[str]:
    """The mapped columns of an ORM class in models.py: the `name: Mapped[..] = mapped_column(..)` lines."""
    tree = ast.parse(MODELS.read_text(encoding="utf-8"))
    cls = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == class_name)
    columns = [
        node.target.id
        for node in cls.body
        if isinstance(node, ast.AnnAssign) and isinstance(node.value, ast.Call) and getattr(node.value.func, "id", None) == "mapped_column"
    ]
    assert columns, f"{class_name}: no mapped columns found, the reader is wrong"
    return columns


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

    __hash__ = None


class Recipe:
    id = Column("Recipe.id")


class ElementalPropertiesORM:
    entity_type = Column("ElementalProperties.entity_type")
    entity_id = Column("ElementalProperties.entity_id")


class TransitHistory:
    """The log row. Like SQLAlchemy's declarative constructor it refuses a keyword that is not a mapped column.

    The column list is read from models.py, so the stand-in cannot drift from the model it stands in for.
    """

    COLUMNS = model_columns("TransitHistory")

    def __init__(self, **values):
        for name in values:
            if name not in self.COLUMNS:
                raise TypeError(f"{name!r} is an invalid keyword argument for TransitHistory")
        self.__dict__.update(values)


class Chain:
    def __init__(self, db, result):
        self.db, self.result = db, result

    def filter(self, *conditions):
        self.db.filters.extend(conditions)
        return self

    def first(self):
        return self.result


class FakeDb:
    def __init__(self, recipe, elements=None, commit_error=None):
        self.recipe, self.elements, self.commit_error = recipe, elements, commit_error
        self.filters: List[Any] = []
        self.added: List[Any] = []
        self.commits = 0

    def query(self, model):
        found = {Recipe: self.recipe, ElementalPropertiesORM: self.elements}
        assert model in found, f"unexpected ORM query for {model}"
        return Chain(self, found[model])

    def add(self, row):
        self.added.append(row)

    def commit(self):
        if self.commit_error:
            raise self.commit_error
        self.commits += 1


def recipe_row(**overrides):
    """A `recipes` row as db.query(Recipe) hands it back (the columns the route reads)."""
    columns = dict(
        id=RECIPE_ID, name="Spaghetti alla Carbonara", description=None, cuisine="Italian", category="main",
        nutritional_profile={"calories": 450}, read_model=None,
    )
    return types.SimpleNamespace(**{**columns, **overrides})


def elemental_row(values):
    """An `elemental_properties` row as the ORM hands it back: an object with float attributes, no .values()."""
    return types.SimpleNamespace(**values)


def load(transit=None, windows=None):
    namespace: Dict[str, Any] = {
        "BaseModel": BaseModel, "Optional": Optional, "List": List, "Dict": Dict, "Any": Any,
        "Session": object, "Depends": lambda dependency: None, "get_db": None, "HTTPException": HTTPException,
        "Recipe": Recipe, "ElementalPropertiesORM": ElementalPropertiesORM, "TransitHistory": TransitHistory,
        # the clock and the ephemeris, made exact
        "get_transit_details": lambda: dict(TRANSIT if transit is None else transit),
        "get_planetary_hour": lambda coordinates: HOUR_RULER,
        "get_optimal_cooking_windows": lambda days=1: [dict(WINDOW)] if windows is None else windows,
        # the real thing
        "get_cooking_ritual": get_cooking_ritual,
        "elemental_properties_from_row": elemental_properties_from_row,
        "calculate_total_potency_score": calculate_total_potency_score,
        "calculate_alchemical_quantities": calculate_alchemical_quantities,
        "CelestialCoordinates": CelestialCoordinates, "FOREST_HILLS_COORDINATES": FOREST_HILLS_COORDINATES,
    }
    return extract(MAIN, ["RitualRequest", "generate_cooking_instruction"], namespace)


def run(namespace, db, **request_fields):
    request = namespace["RitualRequest"](**{"recipe_id": str(RECIPE_ID), **request_fields})
    return asyncio.run(namespace["generate_cooking_instruction"](request, db=db))


def logged(db):
    assert len(db.added) == 1, f"expected exactly one log row, got {len(db.added)}"
    return db.added[0]


# --- the handler runs and logs ----------------------------------------------------------------


def test_an_individual_ritual_is_returned_and_logged_once():
    db = FakeDb(recipe_row())
    result = run(load(), db)

    ritual = get_cooking_ritual(recipe_row(), "Mars")
    assert result["recipe_id"] == str(RECIPE_ID)
    assert result["dominant_transit"] == "Mars"
    assert result["ritual_instruction"] == ritual
    assert result["suggested_timestamp"] is None  # "Simple & Wholesome" is not in the category "main"
    assert result["current_elemental_balance"] == TRANSIT["current_elemental_balance"]
    assert result["total_potency_score"] == pytest.approx(POTENCY_NEUTRAL)

    row = logged(db)
    assert db.commits == 1
    assert (row.recipe_id, row.dominant_transit, row.ritual_instruction) == (str(RECIPE_ID), "Mars", ritual)
    assert row.potency_score == pytest.approx(POTENCY_NEUTRAL)
    assert (row.is_collective, row.participant_count) == (False, 1)
    # the ESMS scores and ratings are the engines' own, for this recipe
    potency = calculate_total_potency_score(types.SimpleNamespace(elementalProperties=None), "Mars", "Water", HOUR_RULER)
    quantities = calculate_alchemical_quantities(types.SimpleNamespace(nutritional_profile={"calories": 450}), potency.kinetic_rating, HOUR_RULER, potency.thermo_rating)
    assert (row.kinetic_rating, row.thermo_rating) == (potency.kinetic_rating, potency.thermo_rating)
    assert (row.spirit_score, row.essence_score, row.matter_score, row.substance_score) == (
        quantities.spirit_score, quantities.essence_score, quantities.matter_score, quantities.substance_score,
    )


def test_a_collective_ritual_logs_that_it_was_collective_and_for_how_many():
    db = FakeDb(recipe_row())
    run(load(), db, secondary_chart_ids=[str(OTHER_ID), str(uuid.uuid4())])

    row = logged(db)
    assert db.commits == 1
    assert (row.is_collective, row.participant_count) == (True, 3)  # the caller plus two secondary charts


def test_a_cooking_window_whose_food_type_is_in_the_recipes_category_is_suggested():
    db = FakeDb(recipe_row(category="Simple & Wholesome soups"))
    assert run(load(), db)["suggested_timestamp"] == "2026-11-03T20:51:00"


def test_no_suggested_time_when_the_lunar_oracle_has_no_windows():
    db = FakeDb(recipe_row(category="Simple & Wholesome soups"))
    assert run(load(windows={"error": "pyswisseph is not installed."}), db)["suggested_timestamp"] is None


def test_an_empty_secondary_chart_list_is_an_individual_ritual():
    db = FakeDb(recipe_row())
    run(load(), db, secondary_chart_ids=[])
    assert (logged(db).is_collective, logged(db).participant_count) == (False, 1)


def test_the_recipe_and_its_elements_are_looked_up_by_the_requested_id_and_nothing_else():
    db = FakeDb(recipe_row())
    run(load(), db)
    assert db.filters == [
        ("==", "Recipe.id", str(RECIPE_ID)),
        ("==", "ElementalProperties.entity_type", "recipe"),
        ("==", "ElementalProperties.entity_id", str(RECIPE_ID)),
    ]


def test_the_log_row_stand_in_refuses_an_unknown_column_as_the_orm_does():
    # A control: without it, a stand-in that accepts anything would pass the tests above whatever the handler sent.
    with pytest.raises(TypeError, match="'no_such_column' is an invalid keyword argument for TransitHistory"):
        TransitHistory(recipe_id="x", no_such_column=1)
    assert {"is_collective", "participant_count"} <= set(TransitHistory.COLUMNS)


# --- the log table: the model and the migrations ---------------------------------------------


def migration_columns(table: str) -> Dict[str, str]:
    """Column name -> declaration, for every column the database/init migrations create or add, in order."""
    columns: Dict[str, str] = {}
    for path in sorted(MIGRATIONS.glob("*.sql")):
        sql = re.sub(r"--[^\n]*", "", path.read_text(encoding="utf-8"))
        for create in re.finditer(rf"CREATE TABLE(?: IF NOT EXISTS)?\s+{table}\s*\((.*?)\n\)\s*;", sql, re.S | re.I):
            for line in create.group(1).split("\n"):
                declaration = line.strip().rstrip(",").strip()
                name = declaration.split(" ")[0].lower() if declaration else ""
                if name and name not in {"constraint", "primary", "unique", "foreign", "check"}:
                    columns[name] = declaration
        for alter in re.finditer(rf"ALTER TABLE\s+{table}\b(.*?);", sql, re.S | re.I):
            for clause in re.finditer(r"ADD COLUMN(?: IF NOT EXISTS)?\s+(\w+)\s+([^,]+)", alter.group(1), re.I):
                columns[clause.group(1).lower()] = f"{clause.group(1)} {' '.join(clause.group(2).split())}"
    return columns


def test_every_mapped_column_of_the_log_table_is_built_by_a_migration():
    built = migration_columns("transit_history")
    assert {"id", "recipe_id", "ritual_instruction", "spirit_score"} <= set(built), f"the reader found {sorted(built)}"
    missing = [column for column in TransitHistory.COLUMNS if column not in built]
    assert not missing, (
        f"TransitHistory maps {missing}, which no database/init migration creates: a database built from the "
        "migrations lacks them, and the route's INSERT names them"
    )


def test_the_collective_columns_are_added_not_null_with_the_defaults_the_old_rows_mean():
    built = migration_columns("transit_history")
    # Every row logged before the columns existed was a single-participant ritual: FALSE and 1 say so.
    assert re.fullmatch(r"is_collective BOOLEAN NOT NULL DEFAULT FALSE", built["is_collective"], re.I), built["is_collective"]
    assert re.fullmatch(r"participant_count INTEGER NOT NULL DEFAULT 1", built["participant_count"], re.I), built["participant_count"]


# --- the recipe's elements reach the engines as the dict they read ----------------------------


@pytest.mark.parametrize("stored, potency", [(FIRE, POTENCY_FIRE), (WATER, POTENCY_WATER)], ids=["fire", "water"])
def test_a_recipe_with_an_elemental_properties_row_is_scored_on_its_elements(stored, potency):
    # The ORM row is an object with no .values(): handing it to the engine raised AttributeError.
    db = FakeDb(recipe_row(), elemental_row(stored))
    result = run(load(), db)

    assert result["total_potency_score"] == pytest.approx(potency)
    row = logged(db)
    assert row.potency_score == pytest.approx(potency)
    # The quantity engine reads the same elements (its formulas, each term named): spirit = .5 kinetic + .25 air + .25 fire;
    # essence = .7 water (the Sun is no Water ruler, so no bonus); matter = .6 calories/1000 + .4 earth; substance = .5 thermo + .25 earth + .25 water.
    assert row.spirit_score == pytest.approx(row.kinetic_rating * 0.5 + stored["air"] * 0.25 + stored["fire"] * 0.25, abs=ROUNDED)
    assert row.essence_score == pytest.approx(stored["water"] * 0.7, abs=ROUNDED)
    assert row.matter_score == pytest.approx(0.45 * 0.6 + stored["earth"] * 0.4, abs=ROUNDED)
    assert row.substance_score == pytest.approx(row.thermo_rating * 0.5 + stored["earth"] * 0.25 + stored["water"] * 0.25, abs=ROUNDED)


def test_two_recipes_with_different_elements_do_not_score_alike():
    # The failure this guards is silence: a neutral profile for everyone is a valid answer to the engines.
    fire = run(load(), FakeDb(recipe_row(), elemental_row(FIRE)))["total_potency_score"]
    water = run(load(), FakeDb(recipe_row(), elemental_row(WATER)))["total_potency_score"]
    neutral = run(load(), FakeDb(recipe_row(), None))["total_potency_score"]
    assert len({round(fire, 6), round(water, 6), round(neutral, 6)}) == 3


@pytest.mark.parametrize(
    "row",
    [None, elemental_row({"fire": 0.7, "water": 0.1, "earth": 0.1}), elemental_row({**FIRE, "air": None}),
     elemental_row({**FIRE, "air": float("nan")}), elemental_row({**FIRE, "fire": float("inf")}), elemental_row({**FIRE, "water": "0.1"})],
    ids=["no row", "no air", "air is None", "air is NaN", "fire is inf", "water is a string"],
)
def test_no_complete_finite_row_is_no_profile_not_a_guess(row):
    assert elemental_properties_from_row(row) is None


def test_the_engines_spelling_comes_from_the_columns():
    assert elemental_properties_from_row(elemental_row(WATER)) == {"Fire": 0.1, "Water": 0.6, "Earth": 0.2, "Air": 0.1}
