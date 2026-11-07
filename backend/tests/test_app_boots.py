"""The deployed app imports, and every route its source declares is registered.

backend/Dockerfile starts `uvicorn backend.alchm_kitchen.main:app`. If importing that module raises, the container never
answers /health. Nothing in CI imported it: the other Python steps read main.py with `ast`, or run a handler's extracted source
against stand-ins, so a misspelled import, a package that requirements.txt does not install, or a bad merge of a 3,200-line
file all passed every step and would have crashed a deploy (the deploy-time migration runner runs first, then uvicorn).

This imports the real module. The CI job that runs it builds its environment from backend/requirements.txt and nothing else
(plus pytest), the way the Docker image does, so a third-party package the app imports but requirements.txt does not provide
fails here, which the static first-party check in test_first_party_imports_resolve.py cannot see. It also checks that
every `@app.get/post/...("/path")` decorator in the source ended up in the live route table, and that no route is
registered twice (the second registration is never reached).

It does not call a route, so it does not need a database, Redis or the network, and it fails if importing the app starts to
need one (the engine is created on first use; an import-time connection would be a new way for a deploy to fail).
Run it where `pip install -r backend/requirements.txt` has run; it is not part of the pytest-only steps.
"""
import ast
import importlib
import importlib.util
import subprocess
import sys
from collections import Counter
from pathlib import Path, PurePosixPath
from typing import Dict, Iterable, List, Set, Tuple

REPO = Path(__file__).resolve().parents[2]
MAIN = Path(__file__).resolve().parents[1] / "alchm_kitchen" / "main.py"
HTTP_METHODS = {"get", "post", "put", "delete", "patch"}
MUST_BE_SERVED = {
    ("GET", "/health"),                                              # what the container's HEALTHCHECK curls
    ("POST", "/api/astrological/recipe-recommendations-by-chart"),   # repaired by #981 and #985
    ("POST", "/api/rituals/generate-cooking-instruction"),           # repaired by #988
}


def declared_routes():
    """(METHOD, path) for every `@app.<method>("<literal path>")` decorator in main.py, read with ast."""
    routes = set()
    for node in ast.walk(ast.parse(MAIN.read_text(encoding="utf-8"))):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        for decorator in node.decorator_list:
            if (
                isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute) and isinstance(decorator.func.value, ast.Name)
                and decorator.func.value.id == "app" and decorator.func.attr in HTTP_METHODS
                and decorator.args and isinstance(decorator.args[0], ast.Constant) and isinstance(decorator.args[0].value, str)
            ):
                routes.add((decorator.func.attr.upper(), decorator.args[0].value))
    return routes


def live_routes():
    main = importlib.import_module("backend.alchm_kitchen.main")
    return [(method, route.path) for route in main.app.routes for method in sorted(getattr(route, "methods", None) or ())]


def test_the_source_declares_the_routes_this_check_expects_to_find():
    declared = declared_routes()
    assert len(declared) >= 30, f"only {len(declared)} route decorators were read from main.py; the reader is wrong"
    assert MUST_BE_SERVED <= declared, f"main.py no longer declares {sorted(MUST_BE_SERVED - declared)}"


def test_the_app_imports_and_every_declared_route_is_registered():
    live = live_routes()
    missing = sorted(declared_routes() - set(live))
    assert not missing, f"declared in main.py but not in the app's route table: {missing}"
    assert MUST_BE_SERVED <= set(live)


def test_no_route_is_registered_twice():
    duplicates = sorted(key for key, count in Counter(live_routes()).items() if count > 1)
    assert not duplicates, f"registered more than once (only the first is reachable): {duplicates}"


def test_importing_the_app_connects_to_nothing():
    importlib.import_module("backend.alchm_kitchen.main")
    connection = importlib.import_module("backend.database.connection")
    assert connection._engine is None, "importing the app created a database engine: that is an import-time connection"


def test_the_app_and_the_engines_share_one_swisseph_module():
    # backend/utils/ephemeris.py sets the ephemeris path once and re-exports `swe`; main.py takes it from there.
    import swisseph

    main = importlib.import_module("backend.alchm_kitchen.main")
    assert main.swe is swisseph


# --- the third-party packages the backend imports are the ones requirements.txt installs ------------------


# (file, import name) -> why. An import of something this environment (requirements.txt + pytest) cannot find.
ALLOWED_NOT_INSTALLED: Dict[Tuple[str, str], str] = {
    ("backend/scripts/add_collective_columns.py", "sqlalchemy_utils"): (
        "a hand-run script from before migration 99, which now adds the columns it added; the image does not install sqlalchemy-utils"
    ),
}


def import_heads(source: str) -> List[Tuple[int, str]]:
    """(line, first component) of every absolute import in the source, wherever the statement sits."""
    heads = []
    for node in ast.walk(ast.parse(source)):
        if isinstance(node, ast.Import):
            heads.extend((node.lineno, alias.name.split(".")[0]) for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            heads.append((node.lineno, node.module.split(".")[0]))
    return heads


def not_installed(sources: Dict[str, str], installed=lambda head: importlib.util.find_spec(head) is not None) -> Set[Tuple[str, str]]:
    """(file, head) for every import that is neither standard library, nor a module of the backend itself (repo root, backend/, or next
    to the importing file), nor findable in this environment. A typo in a third-party name lands here, which the static first-party
    check cannot tell from a third-party package; so does a package the code needs and requirements.txt does not install."""
    paths = [PurePosixPath(path).parts for path in sources]

    def importable_from(directory: Tuple[str, ...]) -> Set[str]:
        """The names a bare import can reach from `directory`: its modules and packages."""
        names = set()
        for parts in paths:
            if parts[: len(directory)] == directory and len(parts) > len(directory):
                names.add(PurePosixPath(parts[len(directory)]).stem if len(parts) == len(directory) + 1 else parts[len(directory)])
        return names

    found = set()
    for path, source in sources.items():
        local = importable_from(PurePosixPath(path).parts[:-1]) | importable_from(("backend",)) | {"backend"}
        for _, head in import_heads(source):
            if head not in sys.stdlib_module_names and head not in local and not installed(head):
                found.add((path, head))
    return found


def tracked_backend_sources() -> Dict[str, str]:
    listing = subprocess.run(["git", "ls-files", "-z", "--", "backend/*.py"], cwd=REPO, capture_output=True, check=True).stdout
    paths = [p for p in listing.decode("utf-8").split("\0") if p]
    # tests import pytest and pyflakes, which this environment does not all have and the image never needs
    return {p: (REPO / p).read_text(encoding="utf-8") for p in paths if not p.startswith("backend/tests/") and not PurePosixPath(p).name.startswith("test_")}


def test_every_third_party_import_in_the_backend_is_installed_by_requirements_txt():
    sources = tracked_backend_sources()
    heads = {head for source in sources.values() for _, head in import_heads(source)}
    assert {"fastapi", "sqlalchemy", "pydantic", "swisseph"} <= heads, "the reader no longer sees the app's own third-party imports"
    found = not_installed(sources)
    new = sorted(found - set(ALLOWED_NOT_INSTALLED))
    stale = sorted(set(ALLOWED_NOT_INSTALLED) - found)
    assert not new, f"imported but not installed by requirements.txt (or misspelled): {new}"
    assert not stale, f"ALLOWED_NOT_INSTALLED entries that are no longer needed, delete them: {stale}"


def test_a_misspelled_or_uninstalled_third_party_name_is_found_and_the_rest_is_not():
    sources = {
        "backend/a.py": "import fastapi\nfrom sqlalchemy import select\nimport swisseph as swe\n",
        "backend/b.py": "import not_a_real_package_xyz\nfrom pydantc import BaseModel\n",
        "backend/c.py": "import os\nfrom backend.a import x\nimport a\nfrom b import y\n",
        "backend/sub/d.py": "import sibling\nfrom sub import d\n",
        "backend/sub/sibling.py": "",
    }
    assert not_installed(sources) == {("backend/b.py", "not_a_real_package_xyz"), ("backend/b.py", "pydantc")}


def test_the_environment_this_runs_in_really_lacks_what_the_allowlist_says_it_lacks():
    # the control for the allowlist: if sqlalchemy_utils were installed here the entry would be stale, and this says why it is not
    assert importlib.util.find_spec("sqlalchemy_utils") is None
    assert importlib.util.find_spec("fastapi") is not None

