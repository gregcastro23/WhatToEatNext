"""Deployment-time migration runner (Python).

Mirror of `scripts/migrate.ts` for the Railway Python backend container. The TS
runner is canonical for local use; this script is what the prod backend
executes on startup before uvicorn so every deploy catches up on any unapplied
`database/init/*.sql` files. Keep the two scripts in sync if you change the
contract — both read the same `_migrations` tracking table.

Usage (inside the Docker container, with DATABASE_URL set):
  python -m backend.scripts.run_init_migrations
  python -m backend.scripts.run_init_migrations --dry-run

The runner exits 0 when everything is applied or up to date. It exits non-zero
on the first migration that errors, leaving prior commits intact.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

import psycopg2

INIT_DIR = Path(__file__).resolve().parents[2] / "database" / "init"


def list_migration_files() -> list[str]:
    return sorted(
        p.name for p in INIT_DIR.glob("*.sql") if " 2." not in p.name
    )


# ── No-transaction migrations ─────────────────────────────────────────────
# Most migrations run inside a transaction (the file + its _migrations row commit
# atomically). But some statements are illegal inside a transaction block —
# notably CREATE/DROP INDEX CONCURRENTLY. A migration opts out by declaring
# `-- migrate:no-transaction`, or is auto-detected when it contains CONCURRENTLY.
# Such migrations run statement-by-statement in autocommit and MUST be idempotent
# (IF NOT EXISTS), since a mid-file failure is not rolled back.
_NO_TXN_DIRECTIVE = "migrate:no-transaction"


def _strip_sql_comments(sql: str) -> str:
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)
    sql = re.sub(r"--[^\n]*", "", sql)
    return sql


def _needs_no_transaction(sql: str) -> bool:
    if _NO_TXN_DIRECTIVE in sql.lower():
        return True
    # Detect CONCURRENTLY only in executable SQL, not in comments (so a migration
    # that merely mentions it in a comment isn't misclassified).
    return bool(re.search(r"\bconcurrently\b", _strip_sql_comments(sql), re.IGNORECASE))


def _split_sql_statements(sql: str) -> list[str]:
    """Split into statements on top-level `;`, respecting '...' string literals,
    $tag$...$tag$ dollar-quotes, and -- / /* */ comments."""
    statements: list[str] = []
    buf: list[str] = []
    i, n = 0, len(sql)
    in_squote = in_line_comment = in_block_comment = False
    dollar_tag: str | None = None
    while i < n:
        ch = sql[i]
        pair = sql[i : i + 2]
        if in_line_comment:
            buf.append(ch)
            if ch == "\n":
                in_line_comment = False
            i += 1
        elif in_block_comment:
            buf.append(ch)
            if pair == "*/":
                buf.append("/")
                in_block_comment = False
                i += 2
            else:
                i += 1
        elif dollar_tag is not None:
            if sql.startswith(dollar_tag, i):
                buf.append(dollar_tag)
                i += len(dollar_tag)
                dollar_tag = None
            else:
                buf.append(ch)
                i += 1
        elif in_squote:
            buf.append(ch)
            if ch == "'":
                if sql[i + 1 : i + 2] == "'":
                    buf.append("'")
                    i += 2
                    continue
                in_squote = False
            i += 1
        elif pair == "--":
            in_line_comment = True
            buf.append(pair)
            i += 2
        elif pair == "/*":
            in_block_comment = True
            buf.append(pair)
            i += 2
        elif ch == "'":
            in_squote = True
            buf.append(ch)
            i += 1
        elif ch == "$" and (m := re.match(r"\$[A-Za-z0-9_]*\$", sql[i:])):
            dollar_tag = m.group(0)
            buf.append(dollar_tag)
            i += len(dollar_tag)
        elif ch == ";":
            stmt = "".join(buf).strip()
            if stmt:
                statements.append(stmt)
            buf = []
            i += 1
        else:
            buf.append(ch)
            i += 1
    tail = "".join(buf).strip()
    if tail:
        statements.append(tail)
    return statements


def _apply_no_transaction(conn, filename: str, sql: str) -> None:
    """Apply a migration outside a transaction: each statement autocommits on its
    own, then the file is marked applied. For CONCURRENTLY and friends. Requires
    no open transaction on entry (the caller commits after every file)."""
    prev_autocommit = conn.autocommit
    conn.autocommit = True
    try:
        for stmt in _split_sql_statements(sql):
            if not _strip_sql_comments(stmt).strip():
                continue
            with conn.cursor() as cur:
                cur.execute(stmt)
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO _migrations (filename) VALUES (%s) ON CONFLICT DO NOTHING",
                (filename,),
            )
    finally:
        conn.autocommit = prev_autocommit


def main() -> int:
    dry_run = "--dry-run" in sys.argv[1:]
    bootstrap_arg = next(
        (a for a in sys.argv[1:] if a.startswith("--bootstrap=")), None
    )
    bootstrap = (
        [s.strip() for s in bootstrap_arg.split("=", 1)[1].split(",") if s.strip()]
        if bootstrap_arg
        else None
    )

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("[migrate] DATABASE_URL is not set", file=sys.stderr)
        return 1
    if not INIT_DIR.is_dir():
        print(f"[migrate] migration dir not found: {INIT_DIR}", file=sys.stderr)
        return 1

    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS _migrations (
                  filename   TEXT PRIMARY KEY,
                  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            conn.commit()

            if bootstrap:
                print(f"[migrate] bootstrap: marking {len(bootstrap)} file(s) as applied")
                for f in bootstrap:
                    cur.execute(
                        "INSERT INTO _migrations (filename) VALUES (%s) ON CONFLICT DO NOTHING",
                        (f,),
                    )
                conn.commit()

            cur.execute("SELECT filename FROM _migrations")
            applied = {row[0] for row in cur.fetchall()}

        files = list_migration_files()
        pending = [f for f in files if f not in applied]
        if not pending:
            print(f"[migrate] up to date ({len(files)} files, {len(applied)} applied)")
            return 0

        print(f"[migrate] {len(pending)} pending: {', '.join(pending)}")
        for f in pending:
            sql = (INIT_DIR / f).read_text(encoding="utf-8")
            no_txn = _needs_no_transaction(sql)
            if dry_run:
                mode = "no-txn" if no_txn else "txn"
                print(f"[migrate] DRY-RUN would apply {f} ({len(sql)} bytes, {mode})")
                continue
            print(f"[migrate] applying {f}{' [no-txn]' if no_txn else ''}...")
            try:
                if no_txn:
                    _apply_no_transaction(conn, f, sql)
                else:
                    with conn.cursor() as cur:
                        cur.execute(sql)
                        cur.execute(
                            "INSERT INTO _migrations (filename) VALUES (%s) ON CONFLICT DO NOTHING",
                            (f,),
                        )
                    conn.commit()
                print(f"[migrate]   ok {f}")
            except Exception as err:  # noqa: BLE001
                conn.rollback()
                print(f"[migrate]   FAILED {f}: {err}", file=sys.stderr)
                return 1

        print(f"[migrate] done. applied {len(pending)} new migration(s).")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(main())
