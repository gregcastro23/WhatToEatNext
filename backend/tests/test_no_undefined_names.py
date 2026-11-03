"""No new undefined names in the backend's Python.

An undefined name is a NameError waiting for the first call that reaches it, and no test
called these: `get_seasonal_modifiers()` raised on every call since the day it was written
(a missing import), and `get_transit_details()` called a function defined nowhere in the repo,
so every route that asks for transit details raised on every request (pyswisseph is in
requirements.txt, so it is installed in production). A static check finds such names without
running the code.

This runs pyflakes over every tracked backend/*.py and fails on:
- an undefined name that is not in ALLOWED_UNDEFINED (also a local used before it is
  assigned, and a name in `__all__` that does not exist: pyflakes skips that check in an
  `__init__.py`, where it matters most, so it is repeated here);
- a file that does not compile, on the Python this job runs (3.11, the version
  backend/Dockerfile runs too). A file that cannot be read cannot be checked, so a syntax
  error must not become a way to hide a name;
- a star import, which makes pyflakes say "may be undefined" instead of deciding.

The allowlists below are today's debt, one reason each. They grow only by an edit a reviewer
sees, and they shrink the same way: an entry that is no longer needed (the name was fixed, a
count fell, the file parses now) fails too, so the fix and the deletion land in one change.

What a pass does NOT mean. pyflakes counts a name as defined if it is bound anywhere in its
scope, so a name bound on only some paths is invisible: a conditional definition,
`try: import x / except ImportError: pass`, a TYPE_CHECKING import used at runtime, a loop
variable after an empty loop. (The by-chart recommender read `elemental_properties`, bound only
on its database-fallback path: an UnboundLocalError this gate could not see.) Wrong arity, a
wrong attribute and `from os import nope` are out of scope too. `# noqa` is not honoured: the
allowlists are the one place an exception is made. Only tracked backend/*.py is scanned.

Needs pyflakes (pinned in the CI step) as well as pytest. The pure functions below take file
contents, so the gate's own logic is tested without touching the tree.
"""
from __future__ import annotations

import io
import subprocess
import tokenize
import warnings
from collections import defaultdict
from pathlib import Path, PurePosixPath
from typing import Any, Dict, List, NamedTuple, Optional, Tuple

import pytest
from pyflakes import api

REPO = Path(__file__).resolve().parents[2]

# (file, name) -> (how many uses, why). A use that is not listed, or one more than listed, fails.
ALLOWED_UNDEFINED: Dict[Tuple[str, str], Tuple[int, str]] = {
    ("backend/alchm_kitchen/main.py", "logger"): (
        1,
        "the planetary-positions route's except handler calls logger.error, but main.py never "
        "defines logger: the handler raises NameError instead of the HTTPException it means to",
    ),
    ("backend/utils/celestial_calculations.py", "planets"): (
        1,
        "the pyephem fallback's aspect loop reads planets.keys(), but planets is not defined "
        "in that function: the fallback raises whenever it runs",
    ),
    ("backend/utils/transit_engine.py", "calculate_current_elemental_balance"): (
        1,
        "called by get_transit_details() but defined nowhere in the repo, so it never returns "
        "(every route that asks for transit details raises)",
    ),
}

# file -> why it does not compile (and so cannot be checked). No import statement refers to these.
ALLOWED_UNPARSEABLE: Dict[str, str] = {
    "backend/utils/security.py": (
        "a literal newline inside an f-string at line 77; backend/database/models.py:482-484 "
        "point callers at this file for birth-data encryption"
    ),
    "backend/scripts/extract_typescript_data.py": "an unterminated string literal at line 77",
    "backend/database/test_connection.py": (
        "two statements run together on line 52; backend/scripts/init_database.py:58 runs this "
        "file as the last step of database initialisation, which therefore cannot finish"
    ),
}

# file -> why it star-imports. pyflakes cannot decide names in such a file, so it is not checked
# for undefined names at all while the entry stands.
ALLOWED_STAR_IMPORTS: Dict[str, str] = {
    "backend/database/__init__.py": (
        "`from .models import *` re-exports the ORM models (main.py does "
        "`from backend.database import Recipe, ...`); this file is unchecked while it stands"
    ),
}

RUNTIME_ERRORS = {
    "UndefinedName": "undefined name",
    "UndefinedLocal": "local variable used before assignment",
    "UndefinedExport": "name in __all__ is not defined",
}

Finding = Tuple[str, Optional[int], str]  # (pyflakes message class, line, name)


class Scan(NamedTuple):
    undefined: Dict[Tuple[str, str], List[Tuple[int, str]]]  # (file, name) -> [(line, kind)]
    unparseable: Dict[str, str]  # file -> why
    star_imports: Dict[str, int]  # file -> line


class Verdict(NamedTuple):
    new: List[str]
    stale: List[str]


class Collector:
    """pyflakes' reporter interface, keeping only what the gate needs."""

    def __init__(self) -> None:
        self.findings: List[Finding] = []
        self.unparseable: Optional[str] = None

    def flake(self, message: Any) -> None:
        kind = type(message).__name__
        if kind in RUNTIME_ERRORS or kind == "ImportStarUsed":
            self.findings.append((kind, message.lineno, str(message.message_args[0])))

    def syntaxError(self, filename: str, msg: str, lineno: Optional[int], offset: object, text: object) -> None:
        self.unparseable = f"line {lineno}: {msg}"

    def unexpectedError(self, filename: str, msg: object) -> None:
        self.unparseable = f"pyflakes could not read it: {msg}"


def decode(raw: bytes) -> str:
    """The source text as the interpreter reads it: a BOM and a coding cookie are honoured."""
    encoding, _ = tokenize.detect_encoding(io.BytesIO(raw).readline)
    return raw.decode(encoding)


def collect(text: str, path: str) -> Collector:
    collector = Collector()
    api.check(text, path, collector)
    return collector


def compile_problem(text: str, path: str) -> Optional[str]:
    """What compile() rejects and ast.parse accepts (`return` outside a function, say), which
    pyflakes therefore does not report, but which makes the module impossible to import."""
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")  # an invalid escape sequence is a warning, not a failure
        try:
            compile(text, path, "exec", dont_inherit=True)
        except (SyntaxError, ValueError, RecursionError) as error:
            return f"does not compile: {error}"
    return None


def init_exports(text: str, path: str) -> List[Finding]:
    """`__all__` names that do not exist, in an `__init__.py`, where pyflakes skips the check
    (a package may list submodules it never imports; allowlist one if that is deliberate)."""
    renamed = str(PurePosixPath(path).with_name("_init_.py"))
    return [finding for finding in collect(text, renamed).findings if finding[0] == "UndefinedExport"]


def scan(sources: Dict[str, bytes]) -> Scan:
    undefined: Dict[Tuple[str, str], List[Tuple[int, str]]] = defaultdict(list)
    unparseable: Dict[str, str] = {}
    star_imports: Dict[str, int] = {}
    for path, raw in sorted(sources.items()):
        try:
            text = decode(raw)
        except (SyntaxError, UnicodeDecodeError, LookupError) as error:
            unparseable[path] = f"cannot be decoded: {error}"
            continue
        try:
            collector = collect(text, path)
        except RecursionError:
            # Valid Python, nested deeply enough to exhaust pyflakes' recursion (compile() copes): still a
            # file the gate cannot check, so it is reported by name, not allowed to crash the scan.
            unparseable[path] = "pyflakes could not read it: nested too deeply (RecursionError)"
            continue
        problem = collector.unparseable
        if problem is None:
            problem = compile_problem(text, path)
        if problem is not None:
            unparseable[path] = problem
            continue
        findings = collector.findings
        if PurePosixPath(path).name == "__init__.py":
            findings = findings + init_exports(text, path)
        for kind, line, name in findings:
            if kind == "ImportStarUsed":
                star_imports.setdefault(path, line or 0)
            else:
                undefined[(path, name)].append((line or 0, kind))
    return Scan(dict(undefined), unparseable, star_imports)


def compare(
    found: Scan,
    allowed_undefined: Dict[Tuple[str, str], Tuple[int, str]],
    allowed_unparseable: Dict[str, str],
    allowed_star_imports: Dict[str, str],
) -> Verdict:
    new: List[str] = []
    stale: List[str] = []
    for (path, name), uses in sorted(found.undefined.items()):
        allowance = allowed_undefined.get((path, name), (0, ""))[0]
        if len(uses) > allowance:
            where = ", ".join(f"line {line} ({RUNTIME_ERRORS[kind]})" for line, kind in uses)
            new.append(f"{path}: {name!r} at {where}; {allowance} allowed")
    for (path, name), (allowance, _reason) in sorted(allowed_undefined.items()):
        count = len(found.undefined.get((path, name), []))
        if count < allowance:
            stale.append(f"ALLOWED_UNDEFINED {path} {name!r}: {allowance} allowed, {count} found; lower or delete it")
    for path, why in sorted(found.unparseable.items()):
        if path not in allowed_unparseable:
            new.append(f"{path}: cannot be checked ({why})")
    for path in sorted(allowed_unparseable):
        if path not in found.unparseable:
            stale.append(f"ALLOWED_UNPARSEABLE {path}: it compiles now (or is gone); delete the entry")
    for path, line in sorted(found.star_imports.items()):
        if path not in allowed_star_imports:
            new.append(f"{path}:{line}: star import, so names in this file cannot be checked")
    for path in sorted(allowed_star_imports):
        if path not in found.star_imports:
            stale.append(f"ALLOWED_STAR_IMPORTS {path}: no star import any more; delete the entry")
    return Verdict(new, stale)


def gate(
    sources: Dict[str, bytes],
    allowed_undefined: Optional[Dict[Tuple[str, str], Tuple[int, str]]] = None,
    allowed_unparseable: Optional[Dict[str, str]] = None,
    allowed_star_imports: Optional[Dict[str, str]] = None,
) -> Verdict:
    """The scan compared with the allowlists (the module's own, unless a test passes others)."""
    return compare(
        scan(sources),
        ALLOWED_UNDEFINED if allowed_undefined is None else allowed_undefined,
        ALLOWED_UNPARSEABLE if allowed_unparseable is None else allowed_unparseable,
        ALLOWED_STAR_IMPORTS if allowed_star_imports is None else allowed_star_imports,
    )


def assert_clean(verdict: Verdict) -> None:
    assert not verdict.new and not verdict.stale, (
        "\nproblems the check cannot allow:\n  "
        + "\n  ".join(verdict.new or ["(none)"])
        + "\nallowances that are no longer needed:\n  "
        + "\n  ".join(verdict.stale or ["(none)"])
        + "\nFix the name. A file that does not compile must compile on Python 3.11, the version "
        "this job and backend/Dockerfile run. A star import must be replaced by the names it brings. "
        "If an exception is deliberate (a name defined through exec or globals(), say), add an entry "
        "with a reason to the allowlists at the top of this file, where a reviewer will see it. An "
        "allowance that is no longer needed is deleted in the change that made it unnecessary. "
        "`# noqa` is not honoured."
    )


def assert_reaches_top_level(sources: Dict[str, bytes]) -> None:
    missing = [p for p in ("backend/__init__.py", "backend/alchm_kitchen/main.py") if p not in sources]
    assert not missing, f"the scan no longer reaches {missing}: check the git pathspec in tracked_sources()"


def tracked_sources() -> Dict[str, bytes]:
    # `backend/*.py`, not `backend/**/*.py`: git's default pathspec lets `*` cross `/`, and the
    # `**` form needs a slash after it, so it silently skips the files directly under backend/.
    # Tracked files only: an untracked file (not yet `git add`ed) is not scanned locally, and a
    # scratch copy such as `foo 2.py` never is. A tracked file deleted from the working tree is skipped.
    listing = subprocess.run(
        ["git", "ls-files", "-z", "--", "backend/*.py"], cwd=REPO, capture_output=True, check=True
    ).stdout
    paths = [p for p in listing.decode("utf-8").split("\0") if p]
    return {path: (REPO / path).read_bytes() for path in paths if (REPO / path).is_file()}


def check(sources: Dict[str, str]) -> Verdict:
    """The gate with an empty allowlist, for the tests below."""
    return gate({path: text.encode("utf-8") for path, text in sources.items()}, {}, {}, {})


# --- the gate on the real tree --------------------------------------------------------------


def test_no_undefined_names_beyond_the_allowlist():
    sources = tracked_sources()
    assert_reaches_top_level(sources)
    assert_clean(gate(sources))


def test_a_bad_file_added_to_the_real_tree_fails_the_gate():
    sources = tracked_sources()
    sources["backend/injected.py"] = b"def f():\n    return nope\n"
    with pytest.raises(AssertionError, match="backend/injected.py.*'nope'"):
        assert_clean(gate(sources))


# --- the gate's own logic -------------------------------------------------------------------


def test_a_new_undefined_name_is_reported_with_its_line():
    verdict = check({"backend/new.py": "def f():\n    return missing_name\n"})
    assert len(verdict.new) == 1
    assert "backend/new.py" in verdict.new[0] and "'missing_name'" in verdict.new[0] and "line 2" in verdict.new[0]


def test_names_that_are_defined_are_not_reported():
    source = (
        "import os\n"
        "try:\n    import swisseph as swe\nexcept ImportError:\n    swe = None\n"
        "def f(a, *rest, key=1):\n    b = [c for c in a]\n    return len(b), os.sep, swe, rest, key\n"
        "class K:\n    value = 1\n    def m(self):\n        return self.value\n"
    )
    assert check({"backend/ok.py": source}).new == []


def test_a_local_used_before_it_is_assigned_is_reported_under_its_own_key():
    found = scan({"backend/m.py": b"x = 0\ndef f():\n    print(x)\n    x = 1\n"})
    assert found.undefined == {("backend/m.py", "x"): [(3, "UndefinedLocal")]}
    assert any("local variable used before assignment" in line for line in compare(found, {}, {}, {}).new)


def test_an_export_that_does_not_exist_is_reported():
    verdict = check({"backend/exports.py": "__all__ = ['nope']\n"})
    assert any("name in __all__ is not defined" in line for line in verdict.new)


def test_an_export_that_does_not_exist_is_reported_in_an_init_too():
    # pyflakes skips this check for a file named __init__.py; the gate repeats it.
    assert any("name in __all__" in line for line in check({"backend/pkg/__init__.py": "__all__ = ['nope']\n"}).new)
    assert check({"backend/pkg/__init__.py": "from os import sep\n__all__ = ['sep']\nprint(__path__)\n"}).new == []


def test_an_allowed_name_passes_and_one_more_use_does_not():
    two_uses = "def f():\n    a = logger\n    b = logger\n    return a, b\n"
    found = scan({"backend/m.py": two_uses.encode()})

    assert compare(found, {("backend/m.py", "logger"): (2, "why")}, {}, {}).new == []
    over = compare(found, {("backend/m.py", "logger"): (1, "why")}, {}, {})
    assert len(over.new) == 1 and "1 allowed" in over.new[0]


def test_an_entry_that_is_no_longer_needed_fails_the_gate():
    clean = {"backend/m.py": b"logger = None\n"}
    verdict = gate(clean, {("backend/m.py", "logger"): (1, "why")}, {"backend/gone.py": "why"}, {"backend/star.py": "why"})

    assert verdict.new == []
    assert len(verdict.stale) == 3
    with pytest.raises(AssertionError, match="no longer needed"):
        assert_clean(verdict)


def test_a_file_that_does_not_parse_is_reported_unless_allowed():
    broken = scan({"backend/broken.py": b"def f(:\n"})

    assert "cannot be checked" in compare(broken, {}, {}, {}).new[0]
    assert compare(broken, {}, {"backend/broken.py": "why"}, {}).new == []
    assert "cannot be checked" in check({"backend/nul.py": "x = 1\x00\n"}).new[0]


def test_a_file_that_parses_but_does_not_compile_is_reported():
    # ast.parse (so pyflakes) accepts a `return` outside a function; compile() and the import do not.
    verdict = check({"backend/late.py": "return 1\n"})
    assert len(verdict.new) == 1 and "does not compile" in verdict.new[0]


@pytest.mark.filterwarnings("ignore::DeprecationWarning", "ignore::SyntaxWarning")
def test_an_invalid_escape_sequence_is_a_warning_not_a_failure():
    assert check({"backend/escape.py": "pattern = '\\d+'\n"}).new == []


def test_the_source_is_decoded_the_way_the_interpreter_reads_it():
    assert check({"backend/bom.py": "\ufeffx = 1\n"}).new == []
    latin = b"# -*- coding: latin-1 -*-\nx = '\xe9'\n"
    assert gate({"backend/latin.py": latin}, {}, {}, {}).new == []
    undeclared = gate({"backend/bad.py": b"x = '\xe9'\n"}, {}, {}, {})
    assert "cannot be decoded" in undeclared.new[0]


def test_a_star_import_is_reported_unless_allowed():
    found = scan({"backend/star.py": b"from os.path import *\n"})

    assert found.star_imports == {"backend/star.py": 1}
    assert "star import" in compare(found, {}, {}, {}).new[0]
    assert compare(found, {}, {}, {"backend/star.py": "why"}).new == []


def test_a_pyflakes_failure_on_a_file_fails_closed(monkeypatch):
    def broken_check(text, path, reporter):
        reporter.unexpectedError(path, "problem decoding source")
        return 1

    monkeypatch.setattr(api, "check", broken_check)
    found = scan({"backend/deep.py": b"x = 1\n"})
    assert found.unparseable == {"backend/deep.py": "pyflakes could not read it: problem decoding source"}
    collector = Collector()
    collector.unexpectedError("f", "boom")
    assert collector.unparseable == "pyflakes could not read it: boom"


def test_a_file_pyflakes_recurses_too_deeply_on_fails_closed_by_name(monkeypatch):
    def too_deep(text, path):
        raise RecursionError("maximum recursion depth exceeded")

    monkeypatch.setitem(globals(), "collect", too_deep)  # scan() looks `collect` up at call time
    found = scan({"backend/deep.py": b"x = 1\n"})
    assert found.unparseable == {"backend/deep.py": "pyflakes could not read it: nested too deeply (RecursionError)"}
    with pytest.raises(AssertionError, match="backend/deep.py"):
        assert_clean(gate({"backend/deep.py": b"x = 1\n"}, {}, {}, {}))


def test_the_real_input_that_crashed_pyflakes_is_reported_by_name():
    # `1 + 1 + ... + 1` compiles, and pyflakes recurses once per term (Python 3.11's default limit).
    deep = "x = " + " + ".join(["1"] * 1000) + "\n"
    try:
        compile(deep, "deep.py", "exec")
        api.check(deep, "deep.py", Collector())
    except RecursionError:
        pass
    else:
        pytest.skip("this interpreter's recursion limits differ; the monkeypatched test above covers the branch")
    assert "RecursionError" in scan({"backend/deep.py": deep.encode()}).unparseable["backend/deep.py"]


def test_the_scan_must_reach_the_files_directly_under_backend():
    with pytest.raises(AssertionError, match="pathspec"):
        assert_reaches_top_level({"backend/sub/x.py": b""})
