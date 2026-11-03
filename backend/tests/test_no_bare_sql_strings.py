"""No SQLAlchemy `execute()` in the backend is handed a bare SQL string.

SQLAlchemy 2 (pinned `>=2.0.36`) raises ObjectNotExecutableError for `session.execute("SELECT 1")`;
the string must be wrapped in `text()`. Nine call sites were not (six in database/test_connection.py,
the connection module's own health_check() and two migration scripts), and pyflakes cannot see it:
it is a type error, not an undefined name. A psycopg2 cursor takes a bare string, so a receiver named `cur` or
`cursor`, or the result of `.cursor()`, is taken for one.

What it cannot see: it reads string literals and f-strings only, so a variable that holds a string,
or a call that returns one, passes. What it wrongly flags: a bare string handed to some other
object's `execute()` (a mock, a client library); list that call in ALLOWED with a reason, as the
undefined-name gate's allowlists do (an entry that no longer matches fails). Do not rename the
receiver to `cur` to get past it: that would exempt a SQLAlchemy connection called `cur`.
Standard library + pytest only (read with `ast`).
"""
import ast
import subprocess
from pathlib import Path
from typing import Dict, Tuple

REPO = Path(__file__).resolve().parents[2]
CURSORS = {"cur", "cursor"}

# (file, receiver) -> why a bare string is deliberate there. Empty: every tracked call that passes
# one is on a psycopg2 cursor.
ALLOWED: Dict[Tuple[str, str], str] = {}


def tracked_backend_python():
    listing = subprocess.run(["git", "ls-files", "-z", "--", "backend/*.py"], cwd=REPO, capture_output=True, check=True).stdout
    return [p for p in listing.decode("utf-8").split("\0") if p and "/alembic/" not in p]


def bare_sql_strings(source: str):
    """(line, receiver) of every `<receiver>.execute(<str or f-string>, ...)` that is not on a cursor."""
    found = []
    for node in ast.walk(ast.parse(source)):
        if not (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "execute" and node.args):
            continue
        first = node.args[0]
        is_string = isinstance(first, ast.JoinedStr) or (isinstance(first, ast.Constant) and isinstance(first.value, str))
        receiver = ast.unparse(node.func.value)
        if is_string and receiver not in CURSORS and not receiver.endswith(".cursor()"):
            found.append((node.lineno, receiver))
    return found


def check(sources: Dict[str, str], allowed: Dict[Tuple[str, str], str]):
    """(offenders by file, allowances that matched nothing) for these sources."""
    offenders: Dict[str, list] = {}
    used = set()
    for path, source in sources.items():
        found = []
        for line, receiver in bare_sql_strings(source):
            if (path, receiver) in allowed:
                used.add((path, receiver))
            else:
                found.append((line, receiver))
        if found:
            offenders[path] = found
    return offenders, set(allowed) - used


def test_the_backend_passes_no_bare_sql_string_to_a_sqlalchemy_execute():
    sources = {path: (REPO / path).read_text(encoding="utf-8") for path in tracked_backend_python()}
    offenders, stale = check(sources, ALLOWED)
    assert offenders == {}, "wrap the SQL in sqlalchemy.text(), or list the call in ALLOWED with a reason: " + str(offenders)
    assert stale == set(), f"ALLOWED entries that no longer match anything: {sorted(stale)}"


def test_an_allowance_lets_a_call_through_and_a_stale_one_is_reported():
    sources = {"backend/x.py": 'redis.execute("SELECT 1")\n'}
    assert check(sources, {}) == ({"backend/x.py": [(1, "redis")]}, set())
    assert check(sources, {("backend/x.py", "redis"): "a client library, not SQLAlchemy"}) == ({}, set())
    stale = {("backend/y.py", "redis"): "gone"}
    assert check(sources, stale) == ({"backend/x.py": [(1, "redis")]}, {("backend/y.py", "redis")})


def test_the_check_sees_what_it_is_meant_to():
    assert bare_sql_strings('session.execute("SELECT 1")\n') == [(1, "session")]
    assert bare_sql_strings('conn.execute(f"SELECT {x}", {})\n') == [(1, "conn")]
    assert bare_sql_strings('session.execute(\n    "SELECT name"\n).fetchall()\n') == [(1, "session")]
    assert bare_sql_strings('session.execute(text("SELECT 1"))\n') == []
    assert bare_sql_strings("session.execute(query, params)\n") == []
    assert bare_sql_strings('cur.execute("SELECT 1")\nconn.cursor().execute("SELECT 2")\n') == []
    # a receiver is not exempt just because its name is short: only cursors are
    assert bare_sql_strings('c.execute("SELECT 1")\n') == [(1, "c")]
