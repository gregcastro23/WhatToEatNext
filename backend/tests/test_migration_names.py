"""Migration file names keep the order both runners apply them in: two digits, then a dash; 99 is the last safe prefix.

backend/scripts/run_init_migrations.py (what the Docker image runs before uvicorn) sorts the names with `sorted()`, and
scripts/migrate.ts (`bun run db:migrate`, Railway's release command) with `.sort()`: plain string order, the same in both. With
two-digit prefixes that is numeric order. A file named `100-…` sorts BEFORE `11-…`: on a database built from the folder it would
run early and fail, and on production, where everything below 100 is applied, it would run at once, out of the order its author
numbered it in. `99-transit-history-collective-columns.sql` used the last safe prefix, and nothing else stopped the next one.

This fails the day a name breaks the rule, so the author chooses on purpose: zero-pad every name to three digits (a rename that
needs the `_migrations` ledger of every database rewritten), or make BOTH runners sort numerically (and then change this test). It
also keeps the two runners' file lists the same: the Python one skips names containing " 2." (a Finder copy) and the TS one skips
names ending in " <digits>.sql", so a name with a space would be applied by one runner and not the other; no tracked name has a space.

Standard library + pytest only; the names come from `git ls-files`, so an untracked scratch copy is not counted.
"""
import re
import subprocess
from pathlib import Path
from typing import List

import pytest

REPO = Path(__file__).resolve().parents[2]
NAME = re.compile(r"^(\d{2})-[a-z0-9][a-z0-9.-]*\.sql$")
MESSAGE = (
    "Both runners apply database/init files in plain string order, so only two-digit prefixes keep their numeric order. Zero-pad every "
    "name to three digits (and fix the `_migrations` ledger of every database), or make backend/scripts/run_init_migrations.py AND "
    "scripts/migrate.ts sort numerically, and then change this test in the same pull request."
)


def tracked_names() -> List[str]:
    listing = subprocess.run(["git", "ls-files", "-z", "--", "database/init/*.sql"], cwd=REPO, capture_output=True, check=True).stdout
    return sorted(Path(p).name for p in listing.decode("utf-8").split("\0") if p)


def problems(names: List[str]) -> List[str]:
    found = [f"{name!r} is not `NN-lowercase-words.sql` (two digits, a dash, no spaces or capitals)" for name in names if not NAME.match(name)]
    valid = [name for name in names if NAME.match(name)]
    by_string = sorted(valid)
    by_number = sorted(valid, key=lambda name: (int(name[:2]), name))
    if by_string != by_number:
        found.append("string order and numeric order differ: " + ", ".join(a for a, b in zip(by_string, by_number) if a != b)[:200])
    return found


def test_every_migration_name_keeps_the_order_both_runners_apply_it_in():
    names = tracked_names()
    assert len(names) >= 100, f"only {len(names)} migration files were found; the pathspec is wrong"
    assert problems(names) == [], MESSAGE


def test_a_three_digit_prefix_is_refused_with_the_reason():
    assert problems(["11-a.sql", "99-b.sql", "100-c.sql"]), "a 100- file sorts before 11- as a string: the guard must see it"
    assert any("not `NN-" in line for line in problems(["100-c.sql"]))


@pytest.mark.parametrize("name", ["5-one-digit.sql", "07-Capital.sql", "07 with space.sql", "07-trailing.sql 2", "07_underscore.sql", "07-.sql", "07-a.SQL"])
def test_a_name_that_is_not_two_digits_a_dash_and_lowercase_words_is_refused(name):
    assert problems([name]), name


@pytest.mark.parametrize("names", [["01-a.sql", "02-b.sql", "99-z.sql"], ["19-a.sql", "19-b.sql"], ["95-recipes.sql", "95-restaurant.sql", "96-x.sql"]])
def test_ordinary_names_and_repeated_prefixes_are_accepted(names):
    # prefixes are shared by several files today (19, 57, 59, 95, 96): name order within one prefix is the same in both runners
    assert problems(names) == []


def test_the_python_runner_sorts_the_names_as_strings():
    source = (REPO / "backend" / "scripts" / "run_init_migrations.py").read_text(encoding="utf-8")
    assert re.search(r"return sorted\(\s*p\.name for p in INIT_DIR\.glob\(\"\*\.sql\"\)", source), "the Python runner's file list changed: " + MESSAGE


def test_the_ts_runner_sorts_the_names_as_strings_too():
    source = (REPO / "scripts" / "migrate.ts").read_text(encoding="utf-8")
    assert re.search(r"readdirSync\(INIT_DIR\)[\s\S]{0,200}?\.sort\(\)", source), "scripts/migrate.ts no longer uses a bare .sort(): " + MESSAGE
    assert "localeCompare" not in source, "a locale-aware sort orders names differently from Python's: " + MESSAGE
