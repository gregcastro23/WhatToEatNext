"""Migration file names keep the order both runners apply them in: two digits (00-99) or three digits (100-999), then a dash.

backend/scripts/run_init_migrations.py (what the Docker image runs before uvicorn) and scripts/migrate.ts (`bun run db:migrate`,
Railway's release command) both sort migration files numerically by their leading integer prefix `(int(prefix), filename)`, and
both exclude macOS Finder conflict copies matching ` \\d+\\.sql$`.

Standard library + pytest only; the names come from `git ls-files`, so an untracked scratch copy is not counted.
"""
import importlib.util
import re
import subprocess
from pathlib import Path
from typing import List

import pytest

REPO = Path(__file__).resolve().parents[2]
NAME = re.compile(r"^(?:\d{2}|[1-9]\d{2})-[a-z0-9][a-z0-9.-]*\.sql$")
MESSAGE = (
    "Both runners apply database/init files in numeric prefix order (two digits 00-99 or three digits 100-999, then a dash and "
    "lowercase words). Keep backend/scripts/run_init_migrations.py and scripts/migrate.ts sorting numerically in lockstep."
)


def _sort_key(name: str):
    match = re.match(r"^(\d+)-", name)
    return (int(match.group(1)) if match else -1, name)


def tracked_names() -> List[str]:
    listing = subprocess.run(["git", "ls-files", "-z", "--", "database/init/*.sql"], cwd=REPO, capture_output=True, check=True).stdout
    return sorted((Path(p).name for p in listing.decode("utf-8").split("\0") if p), key=_sort_key)


def problems(names: List[str]) -> List[str]:
    found = [
        f"{name!r} is not `NN-lowercase-words.sql` (00-99) or `NNN-lowercase-words.sql` (100-999) with a dash and no spaces or capitals"
        for name in names
        if not NAME.match(name)
    ]
    return found


def test_every_migration_name_keeps_the_order_both_runners_apply_it_in():
    names = tracked_names()
    assert len(names) >= 100, f"only {len(names)} migration files were found; the pathspec is wrong"
    assert problems(names) == [], MESSAGE


def test_three_digit_prefixes_sort_after_two_digit_prefixes(tmp_path, monkeypatch):
    spec = importlib.util.spec_from_file_location(
        "run_init_migrations_sort_check",
        REPO / "backend" / "scripts" / "run_init_migrations.py",
    )
    # Stub psycopg2 so importing the runner works in lightweight CI environments
    import sys
    import types

    monkeypatch.setitem(sys.modules, "psycopg2", types.ModuleType("psycopg2"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    for fname in ["100-c.sql", "11-a.sql", "99-b.sql", "101-d.sql", "11-a 2.sql", "99-b 3.sql"]:
        (tmp_path / fname).write_text("-- test\n", encoding="utf-8")
    monkeypatch.setattr(module, "INIT_DIR", tmp_path)
    assert module.list_migration_files() == ["11-a.sql", "99-b.sql", "100-c.sql", "101-d.sql"]


@pytest.mark.parametrize(
    "name",
    [
        "5-one-digit.sql",
        "007-padded-two-digit.sql",
        "1000-four-digits.sql",
        "07-Capital.sql",
        "07 with space.sql",
        "07-trailing.sql 2",
        "07_underscore.sql",
        "07-.sql",
        "07-a.SQL",
    ],
)
def test_a_name_that_is_not_valid_prefix_a_dash_and_lowercase_words_is_refused(name):
    assert problems([name]), name


@pytest.mark.parametrize(
    "names",
    [
        ["01-a.sql", "02-b.sql", "99-z.sql", "100-aa.sql", "101-bb.sql"],
        ["19-a.sql", "19-b.sql"],
        ["95-recipes.sql", "95-restaurant.sql", "96-x.sql"],
    ],
)
def test_ordinary_names_and_repeated_prefixes_are_accepted(names):
    # prefixes are shared by several files today (19, 57, 59, 95, 96): name order within one prefix is the same in both runners
    assert problems(names) == []


def test_the_python_runner_sorts_the_names_numerically():
    source = (REPO / "backend" / "scripts" / "run_init_migrations.py").read_text(encoding="utf-8")
    assert "key=_migration_sort_key" in source, "the Python runner must sort numerically by prefix: " + MESSAGE
    assert r'r" \d+\.sql$"' in source, "the Python runner must exclude all Finder conflict copies: " + MESSAGE


def test_the_ts_runner_sorts_the_names_numerically_too():
    source = (REPO / "scripts" / "migrate.ts").read_text(encoding="utf-8")
    assert ".sort(compareMigrationNames)" in source, "scripts/migrate.ts must sort with compareMigrationNames: " + MESSAGE
    assert "localeCompare" not in source, "a locale-aware sort orders names differently from Python's: " + MESSAGE
