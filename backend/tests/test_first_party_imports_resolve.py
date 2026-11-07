"""Every first-party import in the backend names a module that exists and a name that module binds.

No CI step imported `backend/alchm_kitchen/main.py` (3,200 lines, the deployed app), and pyflakes, which the
undefined-names gate runs, checks neither that a module exists nor that `from m import name` finds `name` in it. So
`from backend.utils.cooking_ritual import elemental_properties_form_row` would have passed every Python step and
crashed the container at boot: `ImportError` before the first request, with /health never answering.

This reads every tracked backend/*.py with `ast` (nothing is imported or executed, so it needs no dependency but pytest),
finds every import statement, wherever it sits (module level, inside a function, in a try/except, under TYPE_CHECKING),
and fails on a first-party import where:

- the module does not exist (MODULE-MISSING): no such file, package or directory; or
- the module exists but binds no such name at its top level (NAME-MISSING) and the name is not one of its submodules; or
- a file cannot be parsed (UNPARSEABLE), because a file that cannot be read cannot be checked; or
- the importing file is part of what the Docker image runs (BARE-IN-APP) and the import is in the bare style.

Three import styles occur in this repo and all are resolved: `backend.x.y` (from the repo root, how uvicorn and
`python -m backend.scripts.run_init_migrations` import it), bare `utils.x` / `database.x` (from backend/, then from the
importing file's own directory, which is how scripts and tests run with backend/ on sys.path), and relative `.x` / `..x`.
The image sets only PYTHONPATH=/app, so a bare import works in a script and fails in the app: BARE-IN-APP is a bare first-party
import in any file the image's two entry points (ENTRY_POINTS, the Dockerfile's CMD) import, directly or not, at module level or
inside a function. Standard-library and third-party imports are not this gate's business; a name that is not under a
first-party root is skipped (test_app_boots.py checks that the third-party heads in the backend are installed).

What counts as bound at a module's top level: a def, class, assignment (with a value), import alias, a capture in a match case,
a walrus target, the attributes every module has (`__doc__`, `__name__`, ...), and anything bound inside a top-level if / try /
for / while / with, since a conditional definition cannot be decided statically (a `try: import x / except ImportError: x = None`
fallback is a binding); star imports are followed (`__all__` honoured). Not bound: a bare annotation, and names bound only under
`if TYPE_CHECKING:` or `if __name__ == "__main__":`, because neither runs when the module is imported. A module with a module-level
`__getattr__`, or one that star-imports something this gate cannot see into (the standard library, a third-party package),
accepts any name: it would otherwise report names that exist.

Out of scope, so a pass does not mean more than this. Dynamic bindings and imports (`globals()`, `setattr`, `exec`, `importlib`,
`__import__`), and a name unbound again by `del` or defined only in a branch that does not run. Circular imports: every name
exists and the import still fails depending on order; test_app_boots.py catches the cycles on the app's import path. A relative
import is checked as if the importer is loaded under its package (`backend.utils.x`), not as a top-level module. A first-party
file named like a standard-library module (none today) is read as the standard library. A file that parses but does not compile
(`return` outside a function) is the undefined-names gate's to report, which compiles every file; this one only parses it.
Imports outside the tracked backend/*.py (repo-root scripts, notebooks), and whether the imported name is the right kind of thing.
A namespace directory whose name is a pinned requirement (backend/alembic/ has no __init__.py) is read as the installed package,
which is what Python imports: the regular package wins over a namespace portion.

The allowlist is empty and grows only by an edit a reviewer sees; an entry that is no longer needed fails too, so the fix
and the deletion land in one change. The pure functions take a path -> bytes mapping, so the gate's own logic is tested on
small virtual trees below, and a deliberately broken import is shown to fail on the real tree. Shapes where this and real
Python disagreed were found by running 715 generated trees through both; the ones that could occur here are fixed or listed above.
"""
from __future__ import annotations

import ast
import re
import subprocess
import sys
from pathlib import Path, PurePosixPath
from typing import Dict, List, NamedTuple, Optional, Set, Tuple

import pytest

REPO = Path(__file__).resolve().parents[2]

# (file, module as written, name) -> why it is deliberate. A name is "" for a plain `import module`.
ALLOWED: Dict[Tuple[str, str, str], str] = {}

STDLIB = frozenset(sys.stdlib_module_names)
Located = Tuple[str, str]  # (kind: "package" | "file" | "namespace", path)

# What backend/Dockerfile runs: `python -m backend.scripts.run_init_migrations && uvicorn backend.alchm_kitchen.main:app`,
# with PYTHONPATH=/app (so `backend` is importable and `backend/` itself is not on sys.path).
ENTRY_POINTS = ("backend/alchm_kitchen/main.py", "backend/scripts/run_init_migrations.py")
MODULE_ATTRIBUTES = frozenset({"__doc__", "__name__", "__file__", "__spec__", "__loader__", "__package__", "__builtins__", "__cached__"})


class Finding(NamedTuple):
    file: str
    line: int
    kind: str
    module: str
    name: str
    detail: str

    def key(self) -> Tuple[str, str, str]:
        return (self.file, self.module, self.name)

    def __str__(self) -> str:
        what = f"{self.module} {self.name}".strip()
        return f"{self.file}:{self.line}: {self.kind} {what}: {self.detail}"


class Defs:
    """What importing a module binds at its top level."""

    def __init__(self) -> None:
        self.names: Set[str] = set()
        self.all_names: Optional[List[str]] = None  # a literal __all__, else None
        self.accepts_any = False  # a module __getattr__, or a star import from somewhere this cannot see into: any name may exist
        self.unparseable: Optional[str] = None


def literal_strings(node: ast.AST) -> Optional[List[str]]:
    if isinstance(node, (ast.List, ast.Tuple)):
        out = []
        for element in node.elts:
            if isinstance(element, ast.Constant) and isinstance(element.value, str):
                out.append(element.value)
            else:
                return None
        return out
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        left, right = literal_strings(node.left), literal_strings(node.right)
        if left is not None and right is not None:
            return left + right
    return None


def is_main_guard(test: ast.AST) -> bool:
    """`__name__ == "__main__"` in either order. `!=` is the opposite: its body runs when the module is imported."""
    if not (isinstance(test, ast.Compare) and len(test.ops) == 1 and isinstance(test.ops[0], ast.Eq) and len(test.comparators) == 1):
        return False
    sides = [test.left, test.comparators[0]]
    return (
        sum(isinstance(side, ast.Name) and side.id == "__name__" for side in sides) == 1
        and sum(isinstance(side, ast.Constant) and side.value == "__main__" for side in sides) == 1
    )


def is_type_checking(test: ast.AST) -> bool:
    return (isinstance(test, ast.Name) and test.id == "TYPE_CHECKING") or (isinstance(test, ast.Attribute) and test.attr == "TYPE_CHECKING")


class Ref(NamedTuple):
    """One module an import statement names, and where it resolved."""
    node: ast.stmt
    written: str  # as written, with leading dots
    style: str  # "backend" (backend.x), "bare" (x, found under backend/ or next to the importer) or "relative"
    status: str  # "ok", "skip" (standard library or third party) or "missing"
    located: Optional[Located]
    why: str


class Tree:
    """The tracked backend files as a path -> bytes mapping, and the questions the resolver asks of the directory tree."""

    def __init__(self, sources: Dict[str, bytes], requirements: Set[str]) -> None:
        self.sources, self.requirements = sources, requirements
        self.files: Set[str] = set(sources)
        self.dirs: Set[str] = {""}
        for path in sources:
            parent = PurePosixPath(path).parent
            while str(parent) != ".":
                self.dirs.add(str(parent))
                parent = parent.parent
        self.defs: Dict[str, Defs] = {}
        self.trees: Dict[str, Optional[ast.Module]] = {}
        self.busy: Set[str] = set()

    # -- where a dotted module name lives --------------------------------------------------------

    def locate(self, parts: List[str], base: str) -> Tuple[Optional[Located], int]:
        """Resolve dotted `parts` below directory `base` ("" is the repo root), the way Python does: at each step a
        package beats a module file beats a namespace directory. Returns (found, -1) or (None, index of the missing part)."""
        current: Optional[str] = base
        found: Optional[Located] = None
        for index, part in enumerate(parts):
            if current is None:
                return None, index  # `a.b` where a is a plain module: nothing is below it
            directory = f"{current}/{part}" if current else part
            if f"{directory}/__init__.py" in self.files:
                found, current = ("package", f"{directory}/__init__.py"), directory
            elif f"{directory}.py" in self.files:
                found, current = ("file", f"{directory}.py"), None
            elif directory in self.dirs:
                found, current = ("namespace", directory), directory
            else:
                return None, index
        return found, -1

    def resolve_absolute(self, dotted: str, importing: str) -> Tuple[str, Optional[Located], str]:
        """-> ("ok", located, "") | ("skip", None, "") for stdlib / third-party | ("missing", None, why)."""
        parts = dotted.split(".")
        first = parts[0]
        if first in STDLIB:
            return "skip", None, ""
        roots = [""] if first == "backend" else ["backend", str(PurePosixPath(importing).parent)]
        nearest: Optional[Tuple[int, str]] = None
        for base in roots:
            head, _ = self.locate(parts[:1], base)
            if head is None:
                continue
            if head[0] == "namespace" and first.lower().replace("-", "_") in self.requirements:
                continue  # the installed regular package of that name wins over a namespace directory
            found, bad = self.locate(parts, base)
            if found is not None:
                return "ok", found, ""
            if nearest is None or bad > nearest[0]:
                nearest = (bad, base)
        if nearest is None:
            return "skip", None, ""  # not under any first-party root: third-party
        bad, base = nearest
        where = f"under {base}/" if base else "at the repo root"
        return "missing", None, f"no module {'.'.join(parts[:bad + 1])!r} {where}"

    def resolve_relative(self, level: int, module: Optional[str], importing: str) -> Tuple[str, Optional[Located], str]:
        directory = PurePosixPath(importing).parent
        if level - 1 > len(directory.parts):
            return "missing", None, "a relative import that climbs above the repo root"
        for _ in range(level - 1):
            directory = directory.parent
        base = "" if str(directory) == "." else str(directory)
        if not module:
            kind = "package" if f"{base}/__init__.py" in self.files else "namespace"
            return "ok", (kind, f"{base}/__init__.py" if kind == "package" else base), ""
        found, bad = self.locate(module.split("."), base)
        if found is None:
            return "missing", None, f"no module {'.'.join(module.split('.')[:bad + 1])!r} under {base or '.'}/"
        return "ok", found, ""

    # -- what a module binds at top level --------------------------------------------------------

    def parsed(self, path: str) -> Optional[ast.Module]:
        if path not in self.trees:
            try:
                self.trees[path] = ast.parse(self.sources[path], filename=path)
            except (SyntaxError, ValueError, RecursionError):
                self.trees[path] = None
        return self.trees[path]

    def definitions(self, located: Located) -> Defs:
        kind, path = located
        if path in self.defs:
            return self.defs[path]
        defs = self.defs[path] = Defs()
        if kind == "namespace" or path in self.busy:
            return defs
        defs.names.update(MODULE_ATTRIBUTES)
        if kind == "package":
            defs.names.add("__path__")
        self.busy.add(path)
        try:
            tree = self.parsed(path)
            if tree is None:
                defs.unparseable = "does not parse"
                return defs
            stars: List[Tuple[Optional[str], int]] = []
            self.scan_block(tree.body, defs, stars)
            for module, level in stars:
                status, target, _ = self.resolve_relative(level, module, path) if level else self.resolve_absolute(module or "", path)
                if status != "ok" or target is None:
                    defs.accepts_any = True  # the standard library, a third-party package, or a module reported on its own line
                    continue
                if target[0] == "namespace":
                    continue
                starred = self.definitions(target)
                defs.accepts_any = defs.accepts_any or starred.accepts_any
                defs.names.update(starred.all_names if starred.all_names is not None else (n for n in starred.names if not n.startswith("_")))
            return defs
        finally:
            self.busy.discard(path)

    def bind(self, target: ast.AST, defs: Defs) -> None:
        if isinstance(target, ast.Name):
            defs.names.add(target.id)
        elif isinstance(target, (ast.Tuple, ast.List)):
            for element in target.elts:
                self.bind(element, defs)
        elif isinstance(target, ast.Starred):
            self.bind(target.value, defs)

    def walrus(self, node: ast.AST, defs: Defs) -> None:
        """Bind the targets of `:=` in an expression. A lambda has a scope of its own, so what is inside one binds nothing here."""
        stack = [node]
        while stack:
            inner = stack.pop()
            if isinstance(inner, ast.Lambda):
                continue
            if isinstance(inner, ast.NamedExpr):
                self.bind(inner.target, defs)
            stack.extend(ast.iter_child_nodes(inner))

    def scan_block(self, statements: List[ast.stmt], defs: Defs, stars: List[Tuple[Optional[str], int]]) -> None:
        try_types = (ast.Try,) + ((ast.TryStar,) if hasattr(ast, "TryStar") else ())
        for node in statements:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                defs.names.add(node.name)
                if node.name == "__getattr__":
                    defs.accepts_any = True
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    self.bind(target, defs)
                    if isinstance(target, ast.Name) and target.id == "__all__":
                        defs.all_names = literal_strings(node.value)
                    if isinstance(target, ast.Name) and target.id == "__getattr__":
                        defs.accepts_any = True
                self.walrus(node.value, defs)
            elif isinstance(node, ast.AnnAssign):
                if node.value is not None:  # a bare annotation binds nothing at runtime
                    self.bind(node.target, defs)
                    if isinstance(node.target, ast.Name) and node.target.id == "__all__":
                        defs.all_names = literal_strings(node.value)
                    self.walrus(node.value, defs)
            elif isinstance(node, ast.AugAssign):
                self.bind(node.target, defs)
                self.walrus(node.value, defs)
                if isinstance(node.target, ast.Name) and node.target.id == "__all__" and defs.all_names is not None:
                    extra = literal_strings(node.value)
                    defs.all_names = defs.all_names + extra if extra is not None else defs.all_names
            elif isinstance(node, ast.Assert):
                self.walrus(node.test, defs)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    defs.names.add(alias.asname or alias.name.split(".")[0])
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    if alias.name == "*":
                        stars.append((node.module, node.level))
                    else:
                        defs.names.add(alias.asname or alias.name)
            elif isinstance(node, ast.Expr):
                self.walrus(node.value, defs)
                call = node.value
                if (
                    isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute) and isinstance(call.func.value, ast.Name)
                    and call.func.value.id == "__all__" and defs.all_names is not None and call.args
                ):
                    if call.func.attr == "extend" and literal_strings(call.args[0]) is not None:
                        defs.all_names = defs.all_names + (literal_strings(call.args[0]) or [])
                    elif call.func.attr == "append" and isinstance(call.args[0], ast.Constant):
                        defs.all_names = defs.all_names + [call.args[0].value]
            elif isinstance(node, ast.If):
                self.walrus(node.test, defs)
                if not (is_main_guard(node.test) or is_type_checking(node.test)):  # these bind nothing when imported
                    self.scan_block(node.body, defs, stars)
                self.scan_block(node.orelse, defs, stars)
            elif isinstance(node, try_types):
                for block in [node.body, *[handler.body for handler in node.handlers], node.orelse, node.finalbody]:
                    self.scan_block(block, defs, stars)
            elif isinstance(node, (ast.For, ast.AsyncFor)):
                self.bind(node.target, defs)
                self.walrus(node.iter, defs)
                self.scan_block(node.body, defs, stars)
                self.scan_block(node.orelse, defs, stars)
            elif isinstance(node, ast.While):
                self.walrus(node.test, defs)
                self.scan_block(node.body, defs, stars)
                self.scan_block(node.orelse, defs, stars)
            elif isinstance(node, (ast.With, ast.AsyncWith)):
                for item in node.items:
                    self.walrus(item.context_expr, defs)
                    if item.optional_vars is not None:
                        self.bind(item.optional_vars, defs)
                self.scan_block(node.body, defs, stars)
            elif hasattr(ast, "Match") and isinstance(node, ast.Match):
                self.walrus(node.subject, defs)
                for case in node.cases:
                    for pattern in ast.walk(case.pattern):
                        if isinstance(pattern, (ast.MatchAs, ast.MatchStar)) and pattern.name:
                            defs.names.add(pattern.name)
                        elif isinstance(pattern, ast.MatchMapping) and pattern.rest:
                            defs.names.add(pattern.rest)
                    self.scan_block(case.body, defs, stars)

    # -- the check -------------------------------------------------------------------------------

    def refs(self, path: str, tree: ast.Module) -> List[Ref]:
        """Every module an import statement in the file names, wherever the statement sits, resolved."""
        out: List[Ref] = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    status, located, why = self.resolve_absolute(alias.name, path)
                    style = "backend" if alias.name.split(".")[0] == "backend" else "bare"
                    out.append(Ref(node, alias.name, style, status, located, why))
            elif isinstance(node, ast.ImportFrom):
                written = "." * node.level + (node.module or "")
                if node.level:
                    status, located, why = self.resolve_relative(node.level, node.module, path)
                    style = "relative"
                else:
                    status, located, why = self.resolve_absolute(node.module or "", path)
                    style = "backend" if (node.module or "").split(".")[0] == "backend" else "bare"
                out.append(Ref(node, written, style, status, located, why))
        return out

    def check_file(self, path: str) -> List[Finding]:
        tree = self.parsed(path)
        if tree is None:
            try:
                ast.parse(self.sources[path], filename=path)
                reason = "does not parse"
            except (SyntaxError, ValueError, RecursionError) as error:
                return [Finding(path, getattr(error, "lineno", None) or 0, "UNPARSEABLE", "", "", f"{type(error).__name__}: {error}")]
            return [Finding(path, 0, "UNPARSEABLE", "", "", reason)]
        findings: List[Finding] = []
        for ref in self.refs(path, tree):
            node = ref.node
            if ref.status == "missing":
                findings.append(Finding(path, node.lineno, "MODULE-MISSING", ref.written, "", ref.why))
            if not isinstance(node, ast.ImportFrom) or ref.status != "ok" or ref.located is None:
                continue
            defs = self.definitions(ref.located)
            if defs.unparseable or defs.accepts_any:
                continue  # an unparseable target is reported on its own line; an opaque one may supply any name
            kind, target = ref.located
            for alias in node.names:
                if alias.name == "*" or alias.name in defs.names:
                    continue
                directory = target if kind == "namespace" else str(PurePosixPath(target).parent) if kind == "package" else None
                if directory is not None and (f"{directory}/{alias.name}" in self.dirs or f"{directory}/{alias.name}.py" in self.files):
                    continue  # a submodule
                where = target if kind != "namespace" else f"{target}/ (a directory without __init__.py)"
                findings.append(Finding(path, node.lineno, "NAME-MISSING", ref.written, alias.name, f"not bound at top level of {where}"))
        return findings

    def app_closure(self) -> Set[str]:
        """The files the Docker image's entry points import, directly or not (first-party imports followed wherever they sit)."""
        seen: Set[str] = set()
        queue = [path for path in ENTRY_POINTS if path in self.files]

        def reach(candidate: str) -> None:
            queue.append(candidate)
            directory = PurePosixPath(candidate).parent
            while str(directory) != ".":  # importing a.b.c runs a/__init__.py and a/b/__init__.py first
                if f"{directory}/__init__.py" in self.files:
                    queue.append(f"{directory}/__init__.py")
                directory = directory.parent

        while queue:
            path = queue.pop()
            if path in seen:
                continue
            seen.add(path)
            tree = self.parsed(path)
            if tree is None:
                continue
            for ref in self.refs(path, tree):
                if ref.status != "ok" or ref.located is None or ref.located[0] == "namespace":
                    continue
                reach(ref.located[1])
                if isinstance(ref.node, ast.ImportFrom) and ref.located[0] == "package":
                    package = str(PurePosixPath(ref.located[1]).parent)
                    for alias in ref.node.names:  # `from pkg import module` imports pkg/module.py
                        for candidate in (f"{package}/{alias.name}.py", f"{package}/{alias.name}/__init__.py"):
                            if candidate in self.files:
                                reach(candidate)
        return seen

    def bare_imports_in_the_app(self) -> List[Finding]:
        found: List[Finding] = []
        for path in sorted(self.app_closure()):
            tree = self.parsed(path)
            for ref in self.refs(path, tree) if tree is not None else []:
                if ref.style == "bare" and ref.status == "ok":
                    found.append(Finding(
                        path, ref.node.lineno, "BARE-IN-APP", ref.written, "",
                        "found only with backend/ on sys.path, and the image sets PYTHONPATH=/app: write it as `backend." + ref.written + "`",
                    ))
        return found

    def check(self) -> List[Finding]:
        out: List[Finding] = []
        for path in sorted(self.sources):
            out.extend(self.check_file(path))
        out.extend(self.bare_imports_in_the_app())
        return sorted(out, key=lambda f: (f.file, f.line, f.kind, f.name))


def scan(sources: Dict[str, bytes], requirements: Optional[Set[str]] = None) -> List[Finding]:
    return Tree(sources, requirements or set()).check()


class Verdict(NamedTuple):
    new: List[str]
    stale: List[str]


def gate(sources: Dict[str, bytes], requirements: Optional[Set[str]] = None, allowed: Optional[Dict[Tuple[str, str, str], str]] = None) -> Verdict:
    allowed = ALLOWED if allowed is None else allowed
    findings = scan(sources, requirements)
    found_keys = {finding.key() for finding in findings}
    new = [str(finding) for finding in findings if finding.key() not in allowed]
    stale = [f"ALLOWED {key}: no such import problem any more; delete the entry" for key in sorted(allowed) if key not in found_keys]
    return Verdict(new, stale)


def assert_clean(verdict: Verdict) -> None:
    assert not verdict.new and not verdict.stale, (
        "\nfirst-party imports that do not resolve:\n  " + "\n  ".join(verdict.new or ["(none)"])
        + "\nallowances that are no longer needed:\n  " + "\n  ".join(verdict.stale or ["(none)"])
        + "\nFix the module path or the name. If the exception is deliberate, add an entry with a reason to ALLOWED at the top "
        "of this file, where a reviewer will see it; an allowance that is no longer needed is deleted in the change that made it unnecessary."
    )


def requirement_names(text: str) -> Set[str]:
    names: Set[str] = set()
    for line in text.splitlines():
        match = re.match(r"\s*([A-Za-z0-9_.\-]+)", line)
        if match and not line.lstrip().startswith(("#", "-")):
            names.add(match.group(1).lower().replace("-", "_"))
    return names


def tracked_sources() -> Dict[str, bytes]:
    # `backend/*.py`, not `backend/**/*.py`: git's default pathspec lets `*` cross `/`, and the `**` form needs a slash after it,
    # so it silently skips the files directly under backend/. Tracked files only: a scratch copy such as `foo 2.py` never is.
    listing = subprocess.run(["git", "ls-files", "-z", "--", "backend/*.py"], cwd=REPO, capture_output=True, check=True).stdout
    paths = [p for p in listing.decode("utf-8").split("\0") if p]
    return {path: (REPO / path).read_bytes() for path in paths if (REPO / path).is_file()}


def real_requirements() -> Set[str]:
    return requirement_names((REPO / "backend" / "requirements.txt").read_text(encoding="utf-8"))


def virtual(files: Dict[str, str]) -> Dict[str, bytes]:
    return {path: text.encode("utf-8") for path, text in files.items()}


def findings_of(files: Dict[str, str], requirements: Optional[Set[str]] = None) -> List[str]:
    return [f"{f.kind} {f.module} {f.name}".strip() for f in scan(virtual(files), requirements)]


# --- the gate on the real tree ------------------------------------------------------------------


def test_every_first_party_import_in_the_backend_resolves():
    sources = tracked_sources()
    missing = [p for p in ("backend/__init__.py", "backend/alchm_kitchen/main.py", "backend/utils/transit_engine.py") if p not in sources]
    assert not missing, f"the scan no longer reaches {missing}: check the git pathspec in tracked_sources()"
    imports = sum(isinstance(n, (ast.Import, ast.ImportFrom)) for text in sources.values() for n in ast.walk(ast.parse(text)))
    assert imports > 300, f"only {imports} import statements were scanned; the reader is wrong"
    assert_clean(gate(sources, real_requirements()))


def first_import_from(tree: ast.Module, prefix: str) -> ast.ImportFrom:
    return next(
        n for n in tree.body
        if isinstance(n, ast.ImportFrom) and n.level == 0 and (n.module or "").startswith(prefix) and n.lineno == n.end_lineno and n.names[0].name != "*"
    )


def test_a_misspelled_name_in_the_real_apps_imports_fails_the_gate():
    # The control on the real tree: take the first single-line `from backend.… import name` in main.py and misspell the name.
    sources = tracked_sources()
    path = "backend/alchm_kitchen/main.py"
    lines = sources[path].decode("utf-8").split("\n")
    node = first_import_from(ast.parse(sources[path]), "backend.")
    alias = node.names[0]
    broken = lines[node.lineno - 1].replace(alias.name, alias.name + "_typo", 1)
    assert broken != lines[node.lineno - 1]
    lines[node.lineno - 1] = broken
    sources[path] = "\n".join(lines).encode("utf-8")
    verdict = gate(sources, real_requirements())
    assert len(verdict.new) == 1 and "NAME-MISSING" in verdict.new[0] and f"{alias.name}_typo" in verdict.new[0], verdict.new


def test_a_misspelled_module_in_the_real_apps_imports_fails_the_gate():
    sources = tracked_sources()
    path = "backend/alchm_kitchen/main.py"
    text = sources[path].decode("utf-8")
    node = first_import_from(ast.parse(text), "backend.utils.")
    sources[path] = text.replace(f"from {node.module} import", f"from {node.module}_typo import", 1).encode("utf-8")
    verdict = gate(sources, real_requirements())
    assert len(verdict.new) == 1 and "MODULE-MISSING" in verdict.new[0] and f"{node.module}_typo" in verdict.new[0], verdict.new


# --- the gate's own logic, on small virtual trees ----------------------------------------------


def test_a_name_the_module_does_not_define_is_reported_with_its_line():
    [finding] = scan(virtual({"backend/a.py": "X = 1\n", "backend/b.py": "\nfrom backend.a import X, Y\n"}))
    assert (finding.file, finding.line, finding.kind, finding.name) == ("backend/b.py", 2, "NAME-MISSING", "Y")


def test_a_module_that_does_not_exist_is_reported():
    files = {"backend/a.py": "", "backend/b.py": "from backend.nope import X\nimport backend.nope.deeper\n"}
    assert findings_of(files) == ["MODULE-MISSING backend.nope", "MODULE-MISSING backend.nope.deeper"]


def test_a_missing_part_in_the_middle_of_a_dotted_path_is_reported():
    files = {"backend/utils/x.py": "V = 1\n", "backend/b.py": "from backend.utils.y import V\n"}
    assert findings_of(files) == ["MODULE-MISSING backend.utils.y"]


def test_a_module_cannot_be_descended_into():
    files = {"backend/a.py": "X = 1\n", "backend/b.py": "import backend.a.b\n"}
    assert findings_of(files) == ["MODULE-MISSING backend.a.b"]


def test_the_three_import_styles_resolve():
    files = {
        "backend/__init__.py": "",
        "backend/utils/helper.py": "NAME = 1\n",
        "backend/database/__init__.py": "from .models import Model\n",
        "backend/database/models.py": "class Model: ...\n",
        "backend/user.py": (
            "from backend.utils.helper import NAME\n"      # absolute, from the repo root
            "from utils.helper import NAME as again\n"      # bare, from backend/
            "from database import Model\n"                  # bare package, re-exported name
            "from .utils.helper import NAME as third\n"     # relative
        ),
    }
    assert findings_of(files) == []


def test_a_bare_import_also_resolves_next_to_the_importing_file():
    files = {"backend/scripts/tool.py": "VALUE = 1\n", "backend/scripts/run.py": "from tool import VALUE\nfrom tool import MISSING\n"}
    assert findings_of(files) == ["NAME-MISSING tool MISSING"]


def test_a_relative_import_of_a_missing_name_or_module_is_reported():
    files = {
        "backend/p/__init__.py": "", "backend/p/a.py": "A = 1\n",
        "backend/p/b.py": "from .a import A, B\nfrom .nope import C\nfrom . import a, c\n",
    }
    assert findings_of(files) == ["NAME-MISSING .a B", "MODULE-MISSING .nope", "NAME-MISSING . c"]


def test_a_relative_import_that_climbs_above_the_repo_root_is_reported():
    assert findings_of({"backend/a.py": "from ... import x\n"}) == ["MODULE-MISSING ..."]


def test_a_submodule_can_be_imported_by_name():
    files = {
        "backend/utils/ephemeris.py": "swe = 1\n", "backend/utils/sub/__init__.py": "",
        "backend/m.py": "from backend.utils import ephemeris, sub\nfrom backend import utils\n",
    }
    assert findings_of(files) == []


def test_names_bound_by_a_fallback_or_a_condition_count_as_bound():
    source = (
        "try:\n    import swisseph as swe\nexcept ImportError:\n    swe = None\n"
        "if True:\n    A = 1\nelse:\n    B = 2\n"
        "for loop_name in ():\n    pass\n"
        "with open('x') as handle:\n    pass\n"
        "(C, D), *E = (1, 2), 3\n"
        "F: int = 1\n"
        "if (G := 1):\n    pass\n"
    )
    importer = "from backend.a import swe, A, B, loop_name, handle, C, D, E, F, G\n"
    assert findings_of({"backend/a.py": source, "backend/b.py": importer}) == []


def test_a_bare_annotation_and_names_bound_only_under_type_checking_or_main_do_not_count():
    source = (
        "from typing import TYPE_CHECKING\n"
        "annotated: int\n"
        "if TYPE_CHECKING:\n    from x import checked\n"
        "if __name__ == '__main__':\n    entry = 1\n"
    )
    importer = "from backend.a import annotated, checked, entry, TYPE_CHECKING\n"
    assert findings_of({"backend/a.py": source, "backend/b.py": importer}) == [
        "NAME-MISSING backend.a annotated", "NAME-MISSING backend.a checked", "NAME-MISSING backend.a entry"]


def test_star_imports_are_followed_and_all_is_honoured():
    files = {
        "backend/src.py": "public = 1\n_private = 2\n",
        "backend/limited.py": "__all__ = ['listed']\nlisted = 1\nunlisted = 2\n",
        "backend/pkg/__init__.py": "from backend.src import *\nfrom backend.limited import *\n",
        "backend/m.py": "from backend.pkg import public, listed\nfrom backend.pkg import _private, unlisted\n",
    }
    assert findings_of(files) == ["NAME-MISSING backend.pkg _private", "NAME-MISSING backend.pkg unlisted"]


def test_a_module_level___getattr___accepts_any_name():
    files = {"backend/lazy.py": "def __getattr__(name):\n    raise AttributeError(name)\n", "backend/m.py": "from backend.lazy import anything\n"}
    assert findings_of(files) == []


def test_an_import_inside_a_function_or_a_try_is_checked_too():
    source = "def f():\n    from backend.a import nope\n\ntry:\n    from backend.a import also_nope\nexcept ImportError:\n    pass\n"
    assert findings_of({"backend/a.py": "", "backend/m.py": source}) == ["NAME-MISSING backend.a nope", "NAME-MISSING backend.a also_nope"]


def test_stdlib_and_third_party_imports_are_not_this_gates_business():
    source = "import os\nfrom typing import Whatever\nimport fastapi\nfrom fastapi import FastAPI\nimport swisseph as swe\n"
    assert findings_of({"backend/m.py": source}) == []


def test_a_namespace_directory_named_like_a_requirement_is_the_installed_package():
    # backend/alembic/ has no __init__.py: Python imports the installed regular package, not that directory.
    files = {"backend/alembic/env.py": "from alembic import context\n"}
    assert findings_of(files) == ["NAME-MISSING alembic context"], "without the rule, the directory shadows the package"
    assert findings_of(files, requirements={"alembic"}) == []


def test_a_module_file_beats_a_namespace_directory_of_the_same_name():
    files = {"backend/config.py": "SETTING = 1\n", "backend/config/other.py": "", "backend/m.py": "from config import SETTING\n"}
    assert findings_of(files) == []


def test_a_file_that_does_not_parse_fails_closed():
    [finding] = scan(virtual({"backend/bad.py": "def (:\n"}))
    assert finding.kind == "UNPARSEABLE" and finding.file == "backend/bad.py"


def test_a_target_that_does_not_parse_is_reported_once_not_once_per_importer():
    files = {"backend/bad.py": "def (:\n", "backend/a.py": "from backend.bad import x\n", "backend/b.py": "from backend.bad import y\n"}
    assert [f.kind for f in scan(virtual(files))] == ["UNPARSEABLE"]


def test_an_import_cycle_does_not_hang_and_still_reports_the_missing_name():
    files = {"backend/a.py": "from backend.b import *\nA = 1\n", "backend/b.py": "from backend.a import *\nB = 1\n", "backend/m.py": "from backend.a import A, B, C\n"}
    assert findings_of(files) == ["NAME-MISSING backend.a C"]


def test_an_allowed_problem_passes_and_an_unneeded_allowance_fails():
    tree = virtual({"backend/a.py": "", "backend/m.py": "from backend.a import nope\n"})
    key = ("backend/m.py", "backend.a", "nope")
    assert gate(tree, allowed={key: "deliberate"}) == Verdict([], [])
    assert gate(tree, allowed={}).new
    fixed = virtual({"backend/a.py": "nope = 1\n", "backend/m.py": "from backend.a import nope\n"})
    stale = gate(fixed, allowed={key: "deliberate"})
    assert stale.new == [] and len(stale.stale) == 1 and "delete the entry" in stale.stale[0]


def test_the_allowlist_is_empty():
    assert ALLOWED == {}, "an exception needs a reviewer's eyes: say why in the entry, and delete it when the import is fixed"


def test_requirement_names_are_read_the_way_pip_spells_them():
    text = "# comment\nfastapi>=0.115\npython-jose[cryptography]==3.3.0\n-r other.txt\n\nPyJWT==2.11.0\npytz\n"
    assert requirement_names(text) == {"fastapi", "python_jose", "pyjwt", "pytz"}


# --- what the image runs: bare imports are fine in a script and fatal in the app ----------------


def test_the_closure_the_bare_import_rule_follows_really_reaches_the_app_on_the_real_tree():
    # Without this, a closure that came out empty (a wrong entry point, a wrong path) would make the rule pass for nothing.
    tree = Tree(tracked_sources(), real_requirements())
    closure = tree.app_closure()
    assert set(ENTRY_POINTS) <= closure
    assert {"backend/database/models.py", "backend/utils/cooking_ritual.py", "backend/utils/ephemeris.py", "backend/schemas/planetary.py"} <= closure
    assert len(closure) > 25, f"only {len(closure)} files are reached from the image's entry points"
    assert not any(path.startswith("backend/tests/") for path in closure)


def test_the_dockerfile_still_starts_the_entry_points_the_bare_import_rule_follows():
    dockerfile = (REPO / "backend" / "Dockerfile").read_text(encoding="utf-8")
    assert "PYTHONPATH=/app" in dockerfile, "the premise of BARE-IN-APP: backend/ itself is not on sys.path in the image"
    for path in ENTRY_POINTS:
        module = path[: -len(".py")].replace("/", ".")
        assert module in dockerfile or f"{module}:app" in dockerfile, f"the Dockerfile no longer starts {module}: update ENTRY_POINTS"


APP = "backend/alchm_kitchen/main.py"
MIGRATE = "backend/scripts/run_init_migrations.py"


def test_a_bare_import_in_a_file_the_image_runs_is_reported_and_the_same_import_in_a_script_is_not():
    files = {
        APP: "from backend.utils.helper import run\n",
        "backend/utils/helper.py": "def run():\n    from database.models import Model\n    return Model\n",
        "backend/database/__init__.py": "",
        "backend/database/models.py": "class Model: ...\n",
        "backend/scripts/tool.py": "from database.models import Model\n",
    }
    assert findings_of(files) == ["BARE-IN-APP database.models"]
    [finding] = scan(virtual(files))
    assert finding.file == "backend/utils/helper.py" and finding.line == 2 and "backend.database.models" in finding.detail


def test_the_closure_follows_packages_submodules_relative_and_function_level_imports():
    files = {
        APP: "from backend import pkg\ndef late():\n    import backend.other.deeper\n",
        "backend/__init__.py": "",
        "backend/pkg/__init__.py": "from .inner import X\n",
        "backend/pkg/inner.py": "from utils.leaf import Y\nX = 1\n",
        "backend/utils/leaf.py": "Y = 1\n",
        "backend/other/__init__.py": "from utils.leaf import Y\n",
        "backend/other/deeper.py": "",
    }
    assert findings_of(files) == ["BARE-IN-APP utils.leaf", "BARE-IN-APP utils.leaf"]
    assert {f.file for f in scan(virtual(files))} == {"backend/pkg/inner.py", "backend/other/__init__.py"}


def test_a_bare_import_of_a_sibling_module_in_an_app_file_is_reported_too():
    files = {APP: "import sibling\n", "backend/alchm_kitchen/sibling.py": "", MIGRATE: ""}
    assert findings_of(files) == ["BARE-IN-APP sibling"]


def test_a_file_the_entry_points_never_import_may_use_the_bare_style():
    files = {APP: "", MIGRATE: "", "backend/db_init.py": "from database.models import Model\n", "backend/database/models.py": "class Model: ...\n"}
    assert findings_of(files) == []


# --- shapes where the checker and real Python disagreed (found by running generated trees through both) ---


def test_the_main_guard_is_equality_in_either_order_and_never_inequality():
    for guard, binds in [('__name__ == "__main__"', False), ('"__main__" == __name__', False), ('__name__ != "__main__"', True), ('__name__ in ("__main__",)', True)]:
        source = f"if {guard}:\n    X = 1\n"
        found = findings_of({"backend/a.py": source, "backend/b.py": "from backend.a import X\n"})
        assert (found == []) is binds, (guard, found)


def test_the_attributes_every_module_has_can_be_imported_and_a_getattr_assignment_accepts_any_name():
    importer = "from backend.a import __doc__, __name__, __file__\nfrom backend.pkg import __path__\nfrom backend.lazy import anything\n"
    files = {"backend/a.py": "", "backend/pkg/__init__.py": "", "backend/lazy.py": "__getattr__ = lambda name: 1\n", "backend/b.py": importer}
    assert findings_of(files) == []


def test_a_star_import_from_the_standard_library_or_a_third_party_package_accepts_any_name():
    files = {"backend/a.py": "from os.path import *\nfrom fastapi import *\n", "backend/b.py": "from backend.a import join, FastAPI\n"}
    assert findings_of(files) == []
    assert findings_of({"backend/a.py": "from backend.nope import *\n", "backend/b.py": "from backend.a import whatever\n"}) == ["MODULE-MISSING backend.nope"]


def test_walrus_targets_bind_in_every_expression_but_a_lambda_has_a_scope_of_its_own():
    bound = (
        "for _ in (A := [1]):\n    pass\n"
        "assert (B := 1)\n"
        "with (C := open('x')):\n    pass\n"
        "total = 0\ntotal += (D := 2)\n"
        "while (E := 0):\n    pass\n"
    )
    assert findings_of({"backend/a.py": bound, "backend/b.py": "from backend.a import A, B, C, D, E\n"}) == []
    assert findings_of({"backend/a.py": "f = lambda: (G := 1)\n", "backend/b.py": "from backend.a import f, G\n"}) == ["NAME-MISSING backend.a G"]


def test_names_captured_by_a_match_case_are_bound():
    source = "match 1:\n    case int(A):\n        pass\n    case [1, *B]:\n        pass\n    case {'k': 1, **C}:\n        pass\n    case _ as D:\n        pass\n"
    assert findings_of({"backend/a.py": source, "backend/b.py": "from backend.a import A, B, C, D\n"}) == []
