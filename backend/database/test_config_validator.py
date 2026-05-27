"""Quick contract test for `DatabaseConfig.validate_database_url`.

Specifically validates the PgBouncer allowlist added in May 2026 — the
hostname rewrite must leave `pgbouncer.railway.internal` alone so the
pooler is actually reachable, while preserving the legacy safeguard for
arbitrary `.railway.internal` hostnames.

Run with:
  cd backend && python -m database.test_config_validator
"""

from __future__ import annotations

import sys

# Allow `from database.config import ...` when invoked from backend/.
sys.path.insert(0, ".")

from database.config import DatabaseConfig  # noqa: E402


PASSWORD = "secret"


def expect(label: str, actual: str, expected: str) -> None:
    if actual != expected:
        print(f"FAIL: {label}\n  expected: {expected}\n  got:      {actual}")
        sys.exit(1)
    print(f"OK:   {label}")


def main() -> None:
    # Case 1: PgBouncer hostname must pass through unmodified.
    out = DatabaseConfig.validate_database_url(
        f"postgresql://postgres:{PASSWORD}@pgbouncer.railway.internal:6432/railway"
    )
    expect(
        "pgbouncer hostname is preserved",
        out,
        f"postgresql://postgres:{PASSWORD}@pgbouncer.railway.internal:6432/railway",
    )

    # Case 2: Postgres hostname stays as-is (no-op rewrite).
    out = DatabaseConfig.validate_database_url(
        f"postgresql://postgres:{PASSWORD}@postgres.railway.internal:5432/railway"
    )
    expect(
        "postgres hostname is preserved",
        out,
        f"postgresql://postgres:{PASSWORD}@postgres.railway.internal:5432/railway",
    )

    # Case 3: Unknown internal hostname is rewritten to postgres
    # (legacy safeguard).
    out = DatabaseConfig.validate_database_url(
        f"postgresql://postgres:{PASSWORD}@some-stale-host.railway.internal:5432/railway"
    )
    expect(
        "unknown internal hostname is rewritten to postgres",
        out,
        f"postgresql://postgres:{PASSWORD}@postgres.railway.internal:5432/railway",
    )

    # Case 4: postgres:// scheme is normalized to postgresql://.
    out = DatabaseConfig.validate_database_url(
        f"postgres://postgres:{PASSWORD}@pgbouncer.railway.internal:6432/railway"
    )
    expect(
        "postgres:// scheme is normalized to postgresql://",
        out,
        f"postgresql://postgres:{PASSWORD}@pgbouncer.railway.internal:6432/railway",
    )

    print("\nall good")


if __name__ == "__main__":
    main()
