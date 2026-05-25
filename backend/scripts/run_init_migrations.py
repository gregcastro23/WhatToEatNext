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
import sys
from pathlib import Path

import psycopg2

INIT_DIR = Path(__file__).resolve().parents[2] / "database" / "init"


def list_migration_files() -> list[str]:
    return sorted(
        p.name for p in INIT_DIR.glob("*.sql") if " 2." not in p.name
    )


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
            if dry_run:
                print(f"[migrate] DRY-RUN would apply {f} ({len(sql)} bytes)")
                continue
            print(f"[migrate] applying {f}...")
            try:
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
