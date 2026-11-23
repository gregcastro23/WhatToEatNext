"""Migrations run on a real PostgreSQL, applied by the real deploy-time runner.

Nothing in CI executed a `database/init` migration. `99-transit-history-collective-columns.sql` was read by reviewers and run
by hand on a scratch database, but a migration is code that runs once, on production, before uvicorn starts: if it fails the
container never becomes healthy (the runner exits 1 and the Dockerfile's `&&` stops there). The runner itself is tested with a
fake psycopg2 (test_run_init_migrations.py), which cannot show that a file applies, that a no-transaction file works through
psycopg2's autocommit switch (the path migration 88 crashed a deploy on), or that the ORM agrees with the table the migrations leave.

`database/init` is NOT a chain that builds a database from nothing: applied to an empty database the runner fails at the sixth
file (06 sets a `user_role` of 'ALCHEMIST' that 01's enum does not have), and production was bootstrapped, not built from it
(`--bootstrap=…` marks the early files applied). So a migration is tested the way it will run: on the prerequisite tables it
touches, in the state production has them. Add a test here for the next migration that changes an existing table; the helpers
below are the pattern (`apply` runs files through the runner into an isolated schema, `columns` reads what they left).

Needs a disposable PostgreSQL (CI: the `backend-runtime` job's service container, PostgreSQL 18, the version production runs)
in $MIGRATION_TEST_DATABASE_URL. It does not skip without one: a gate that skips is not a gate. (The one exception is the lock-timeout
test, which needs two sessions: set MIGRATION_TEST_SINGLE_SESSION=1 to skip it on a single-session server such as PGlite; CI never does.) Each test works in its own schema,
created and dropped here, with the runner's connections pointed at it, so nothing else in the database is touched.
"""
import importlib
import os
import re
import sys
import uuid
from pathlib import Path
from typing import Dict, List, Tuple

import psycopg2
import pytest

REPO = Path(__file__).resolve().parents[2]
INIT = REPO / "database" / "init"
URL_VARIABLE = "MIGRATION_TEST_DATABASE_URL"
REAL_CONNECT = psycopg2.connect  # the runner's connect is wrapped below; this one is not

M03 = "03-transit-history-schema.sql"
M04 = "04-add-potency-columns.sql"
M05 = "05-add-alchemical-quantities-columns.sql"
M99 = "99-transit-history-collective-columns.sql"
M107 = "107-economy-debit-refusals.sql"
TRANSIT_HISTORY_BASE = [M03, M04, M05]  # how production's transit_history was built, before 99


@pytest.fixture(scope="session")
def database_url() -> str:
    value = os.environ.get(URL_VARIABLE)
    if not value:
        pytest.fail(
            f"{URL_VARIABLE} is not set. These tests need a disposable PostgreSQL (CI: the backend-runtime job's service container); "
            "point it at a throwaway database only, never at one that matters.",
            pytrace=False,
        )
    return value


@pytest.fixture
def schema(database_url: str):
    name = f"migration_test_{uuid.uuid4().hex[:12]}"
    admin = REAL_CONNECT(database_url)
    admin.autocommit = True
    with admin.cursor() as cur:
        cur.execute(f'CREATE SCHEMA "{name}"')
    try:
        yield name
    finally:
        with admin.cursor() as cur:
            cur.execute("SET lock_timeout = '30s'")  # a connection that leaked a lock fails the teardown instead of hanging the job
            cur.execute(f'DROP SCHEMA "{name}" CASCADE')
        admin.close()


def connect(url: str, schema: str):
    """A connection whose unqualified names resolve in `schema` only (set as a command, not a startup option, so any server honours it)."""
    conn = REAL_CONNECT(url)
    with conn.cursor() as cur:
        cur.execute(f'SET search_path TO "{schema}"')
    conn.commit()
    return conn


def sql(url: str, schema: str, statement: str, args=None) -> List[tuple]:
    conn = connect(url, schema)
    try:
        with conn.cursor() as cur:
            cur.execute(statement, args)
            result = cur.fetchall() if cur.description else []
        conn.commit()
        return result
    finally:
        conn.close()


def real_files(*names: str) -> Dict[str, str]:
    return {name: (INIT / name).read_text(encoding="utf-8") for name in names}


@pytest.fixture
def apply(database_url, schema, tmp_path, monkeypatch, capsys):
    """apply({filename: sql}) runs the real run_init_migrations over exactly those files, into this test's schema.
    Returns (exit code, what it printed). Files already in the schema's `_migrations` are skipped, as in a deploy."""
    runner = importlib.import_module("backend.scripts.run_init_migrations")
    counter = {"n": 0}

    limits: Dict[str, str] = {}

    def connect_into_schema(url, *args, **kwargs):
        conn = connect(url, schema)
        if limits:
            with conn.cursor() as cur:
                cur.execute(f"SET statement_timeout TO '{limits['statement_timeout']}'")
            conn.commit()
        return conn

    def run(files: Dict[str, str], statement_timeout: str = "") -> Tuple[int, str]:
        """`statement_timeout` bounds the runner's own statements, so a migration that waits forever fails the test instead of hanging it."""
        limits.clear()
        if statement_timeout:
            limits["statement_timeout"] = statement_timeout
        counter["n"] += 1
        folder = tmp_path / f"init{counter['n']}"
        folder.mkdir()
        for name, text in files.items():
            (folder / name).write_text(text, encoding="utf-8")
        monkeypatch.setattr(runner, "INIT_DIR", folder)
        monkeypatch.setattr(runner.psycopg2, "connect", connect_into_schema)
        monkeypatch.setenv("DATABASE_URL", database_url)
        monkeypatch.setattr(sys, "argv", ["run_init_migrations"])
        capsys.readouterr()
        code = runner.main()
        out, err = capsys.readouterr()
        return code, out + err

    return run


def columns(url: str, schema: str, table: str = "transit_history") -> Dict[str, Tuple[str, str, object]]:
    """column -> (data_type, is_nullable, column_default), as information_schema reports what the migrations left."""
    found = sql(
        url, schema,
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns "
        "WHERE table_schema = %s AND table_name = %s",
        (schema, table),
    )
    return {name: (data_type, nullable, default) for name, data_type, nullable, default in found}


def ledger(url: str, schema: str) -> List[str]:
    return [row[0] for row in sql(url, schema, 'SELECT filename FROM _migrations ORDER BY filename COLLATE "C"')]  # Python's sorted() order, whatever the server's locale


def relfilenode(url: str, schema: str) -> int:
    return sql(url, schema, "SELECT relfilenode FROM pg_class WHERE oid = to_regclass('transit_history')")[0][0]


COLLECTIVE = {"is_collective": ("boolean", "NO", "false"), "participant_count": ("integer", "NO", "1")}


# --- migration 99: transit_history.is_collective and participant_count ------------------------


def test_99_adds_both_columns_to_the_table_production_has(database_url, schema, apply):
    code, out = apply(real_files(*TRANSIT_HISTORY_BASE))
    assert code == 0, out
    assert not {"is_collective", "participant_count"} & set(columns(database_url, schema)), "the base files must leave the table as production has it"
    sql(database_url, schema, "INSERT INTO transit_history (recipe_id, ritual_instruction) VALUES ('r1', 'a ritual logged before the columns existed')")
    before = relfilenode(database_url, schema)

    code, out = apply(real_files(*TRANSIT_HISTORY_BASE, M99))
    assert code == 0, out
    assert f"applying {M99}" in out and "done. applied 1 new migration" in out, out
    assert {name: columns(database_url, schema)[name] for name in COLLECTIVE} == COLLECTIVE
    assert sql(database_url, schema, "SELECT is_collective, participant_count FROM transit_history") == [(False, 1)], (
        "a row logged before the columns existed is a ritual for one"
    )
    assert relfilenode(database_url, schema) == before, "ADD COLUMN with a constant default must not rewrite the table"
    assert ledger(database_url, schema) == sorted([*TRANSIT_HISTORY_BASE, M99])


def test_99_is_a_no_op_the_second_time_through_the_runner_and_when_re_executed(database_url, schema, apply):
    apply(real_files(*TRANSIT_HISTORY_BASE, M99))
    sql(database_url, schema, "INSERT INTO transit_history (recipe_id, ritual_instruction, is_collective, participant_count) VALUES ('r', 'x', TRUE, 3)")
    snapshot = (
        columns(database_url, schema),
        sql(database_url, schema, "SELECT attname, attnum FROM pg_attribute WHERE attrelid = to_regclass('transit_history') AND attnum > 0 AND NOT attisdropped ORDER BY attnum"),
        sql(database_url, schema, "SELECT * FROM transit_history"),
        relfilenode(database_url, schema),
    )

    code, out = apply(real_files(*TRANSIT_HISTORY_BASE, M99))
    assert code == 0 and "up to date" in out, out

    # the runner will not offer the file again; the file itself must still be safe to execute (a repair, a re-bootstrap)
    sql(database_url, schema, (INIT / M99).read_text(encoding="utf-8"))
    again = (
        columns(database_url, schema),
        sql(database_url, schema, "SELECT attname, attnum FROM pg_attribute WHERE attrelid = to_regclass('transit_history') AND attnum > 0 AND NOT attisdropped ORDER BY attnum"),
        sql(database_url, schema, "SELECT * FROM transit_history"),
        relfilenode(database_url, schema),
    )
    assert again == snapshot


HAND_MADE = {
    # backend/scripts/phase7_migration.py: nullable columns with defaults
    "phase7_migration.py": (
        "ALTER TABLE transit_history ADD COLUMN IF NOT EXISTS is_collective BOOLEAN DEFAULT FALSE;"
        "ALTER TABLE transit_history ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 1;",
        {"is_collective": ("boolean", "YES", "false"), "participant_count": ("integer", "YES", "1")},
    ),
    # backend/scripts/add_collective_columns.py: ends NOT NULL with the same defaults
    "add_collective_columns.py": (
        "ALTER TABLE transit_history ADD COLUMN is_collective BOOLEAN NOT NULL DEFAULT FALSE;"
        "ALTER TABLE transit_history ADD COLUMN participant_count INTEGER NOT NULL DEFAULT 1;",
        COLLECTIVE,
    ),
}


@pytest.mark.parametrize("script", sorted(HAND_MADE))
def test_99_leaves_columns_a_hand_run_script_already_made_as_they_are(database_url, schema, apply, script):
    patch, expected = HAND_MADE[script]
    apply(real_files(*TRANSIT_HISTORY_BASE))
    sql(database_url, schema, patch)
    sql(database_url, schema, "INSERT INTO transit_history (recipe_id, ritual_instruction) VALUES ('r', 'x')")

    code, out = apply(real_files(*TRANSIT_HISTORY_BASE, M99))
    assert code == 0, out
    assert {name: columns(database_url, schema)[name] for name in COLLECTIVE} == expected, "an existing column is left exactly as it is"
    assert sql(database_url, schema, "SELECT is_collective, participant_count FROM transit_history") == [(False, 1)]


def test_99_adds_only_the_column_that_is_missing(database_url, schema, apply):
    apply(real_files(*TRANSIT_HISTORY_BASE))
    sql(database_url, schema, "ALTER TABLE transit_history ADD COLUMN is_collective BOOLEAN DEFAULT FALSE")
    code, out = apply(real_files(*TRANSIT_HISTORY_BASE, M99))
    assert code == 0, out
    found = columns(database_url, schema)
    assert found["is_collective"] == ("boolean", "YES", "false"), "the column that was there is untouched"
    assert found["participant_count"] == COLLECTIVE["participant_count"], "the one that was missing is added"


def test_the_guard_in_99_is_what_lets_it_run_on_a_table_that_has_the_columns(database_url, schema, apply):
    # The control for the test above: without the catalog check, the plain ALTER fails on exactly that table.
    apply(real_files(*TRANSIT_HISTORY_BASE))
    sql(database_url, schema, HAND_MADE["add_collective_columns.py"][0])
    with pytest.raises(psycopg2.errors.DuplicateColumn):
        sql(database_url, schema, "ALTER TABLE transit_history ADD COLUMN is_collective BOOLEAN NOT NULL DEFAULT FALSE")


def test_99_fails_loudly_rather_than_invent_a_table_when_transit_history_is_missing(database_url, schema, apply):
    # What a database where 03 is marked applied but the table is gone would do: the runner exits 1, so the deploy stops
    # before uvicorn instead of serving a route that cannot log. (This cannot happen on a database built from database/init.)
    code, out = apply(real_files(M99))
    assert code == 1 and f"FAILED {M99}" in out and "transit_history" in out, out
    assert ledger(database_url, schema) == [], "a failed migration is not recorded as applied"


def test_a_blocked_99_fails_at_its_lock_timeout_instead_of_stalling_the_table(database_url, schema, apply):
    # The file's own claim: "lock_timeout turns a blocked ALTER into a failed deploy rather than a stalled table". An open writer
    # on transit_history blocks the ALTER (it needs ACCESS EXCLUSIVE); with no lock_timeout the migration would wait for as long
    # as the writer does, with every other query on the table queued behind it. The statement_timeout is the test's own backstop:
    # it makes a missing lock_timeout fail with a different message instead of hanging the run.
    if os.environ.get("MIGRATION_TEST_SINGLE_SESSION"):
        pytest.skip("a single-session server (PGlite) cannot hold a lock in one connection while the migration waits in another; CI does not set this")
    apply(real_files(*TRANSIT_HISTORY_BASE))
    text = (INIT / M99).read_text(encoding="utf-8")
    assert "SET LOCAL lock_timeout = '10s';" in text, "the file no longer sets the lock_timeout this test shortens"
    writer = connect(database_url, schema)
    try:
        with writer.cursor() as cur:
            cur.execute("LOCK TABLE transit_history IN ROW EXCLUSIVE MODE")
        code, out = apply({**real_files(*TRANSIT_HISTORY_BASE), M99: text.replace("'10s'", "'1s'")}, statement_timeout="15s")
    finally:
        writer.rollback()
        writer.close()
    assert code == 1 and f"FAILED {M99}" in out and "lock timeout" in out, out
    assert M99 not in ledger(database_url, schema) and "is_collective" not in columns(database_url, schema)


def test_the_orm_agrees_with_the_table_the_migrations_leave(database_url, schema, apply):
    from backend.database.models import TransitHistory

    code, out = apply(real_files(*TRANSIT_HISTORY_BASE, M99))
    assert code == 0, out
    found = columns(database_url, schema)
    mapped = TransitHistory.__table__.columns
    assert set(mapped.keys()) == set(found), f"the model and the migrated table disagree on columns: {set(mapped.keys()) ^ set(found)}"
    for name, (data_type, nullable, default) in COLLECTIVE.items():
        column = mapped[name]
        assert found[name] == (data_type, nullable, default)
        assert column.nullable is (nullable == "YES")
        assert str(column.server_default.arg) == default, f"{name}: the model's server_default is not the migration's DEFAULT"
        assert {"boolean": "BOOLEAN", "integer": "INTEGER"}[data_type] in str(column.type).upper()


# --- the runner on a real server ------------------------------------------------------------


NO_TRANSACTION = {
    # declared with the directive, nothing in it needs autocommit
    "directive": "-- migrate:no-transaction\nCREATE TABLE IF NOT EXISTS probe (id integer);\n",
    # detected from CONCURRENTLY alone, which PostgreSQL refuses inside a transaction block
    "concurrently": "CREATE TABLE IF NOT EXISTS probe (id integer);\nCREATE INDEX CONCURRENTLY IF NOT EXISTS probe_id_idx ON probe (id);\n",
}


@pytest.mark.parametrize("how", sorted(NO_TRANSACTION))
def test_a_no_transaction_migration_first_in_line_applies_through_psycopg2(database_url, schema, apply, how):
    # The runner switches the connection to autocommit for such a file, which psycopg2 refuses inside an open transaction: migration 88
    # failed a deploy on exactly this, because reading `_migrations` had left one open. Both ways of opting out are covered, and the
    # file is the FIRST one in line, which is where that failed.
    files = {"01-first.sql": NO_TRANSACTION[how]}
    code, out = apply(files)
    assert code == 0 and "[no-txn]" in out, out
    assert ledger(database_url, schema) == ["01-first.sql"]
    assert sql(database_url, schema, "SELECT count(*) FROM pg_tables WHERE schemaname = %s AND tablename = 'probe'", (schema,)) == [(1,)]
    if how == "concurrently":
        assert sql(database_url, schema, "SELECT count(*) FROM pg_indexes WHERE schemaname = %s AND indexname = 'probe_id_idx'", (schema,)) == [(1,)]
    code, out = apply(files)
    assert code == 0 and "up to date" in out, out


def test_a_comment_that_mentions_concurrently_does_not_make_a_file_no_transaction(database_url, schema, apply):
    code, out = apply({"01-plain.sql": "-- we never use CREATE INDEX CONCURRENTLY here, it cannot run in a transaction\nCREATE TABLE plain (id integer);\n"})
    assert code == 0 and "[no-txn]" not in out and "applying 01-plain.sql..." in out, out


def test_the_runner_stops_at_the_first_failing_file_and_keeps_what_came_before(database_url, schema, apply):
    files = {
        "01-good.sql": "CREATE TABLE kept (id integer);\n",
        "02-bad.sql": "CREATE TABLE half_made (id integer);\nSELECT * FROM a_table_that_does_not_exist;\n",
        "03-never.sql": "CREATE TABLE never (id integer);\n",
    }
    code, out = apply(files)
    assert code == 1 and "FAILED 02-bad.sql" in out, out
    assert ledger(database_url, schema) == ["01-good.sql"]
    tables = {row[0] for row in sql(database_url, schema, "SELECT tablename FROM pg_tables WHERE schemaname = %s", (schema,))}
    assert tables == {"_migrations", "kept"}, f"the failed file must roll back entirely and the later one must not run: {tables}"


# --- migration 107: economy_debit_refusals (sync-debit's 402 counter) --------------------------


REFUSAL_SERVICE = REPO / "src" / "services" / "debitRefusalService.ts"
HOUR_13 = "2026-11-23T13:00:00Z"


def service_sql(name: str) -> str:
    """The statement the app actually sends, cut out of the service source: a hand copy could validate something else."""
    found = re.search(rf"export const {name} = `(.*?)`;", REFUSAL_SERVICE.read_text(encoding="utf-8"), re.S)
    assert found, f"{name} is no longer an exported template literal in {REFUSAL_SERVICE.name}"
    return found.group(1)


def refusal_row(**override) -> dict:
    row = {"hour": HOUR_13, "reason": "insufficient_value", "refusals": 2, "empty_basket": 1, "shortfall_value_sum": 5, "shortfall_value_n": 2}
    row.update(override)
    return row


def insert_refusal(url: str, schema: str, **override) -> None:
    row = refusal_row(**override)
    sql(
        url, schema,
        "INSERT INTO economy_debit_refusals (hour, reason, refusals, empty_basket, shortfall_value_sum, shortfall_value_n) "
        "VALUES (%(hour)s, %(reason)s, %(refusals)s, %(empty_basket)s, %(shortfall_value_sum)s, %(shortfall_value_n)s)",
        row,
    )


def refusal_constraints(url: str, schema: str) -> List[tuple]:
    return sql(
        url, schema,
        "SELECT contype, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = to_regclass('economy_debit_refusals') ORDER BY contype, pg_get_constraintdef(oid)",
    )


def test_107_creates_the_table_and_the_runner_records_it(database_url, schema, apply):
    code, out = apply(real_files(M107))
    assert code == 0 and f"applying {M107}" in out and "done. applied 1 new migration" in out, out
    assert {name: found[0] for name, found in columns(database_url, schema, "economy_debit_refusals").items()} == {
        "hour": "timestamp with time zone",
        "reason": "text",
        "refusals": "integer",
        "empty_basket": "integer",
        "shortfall_value_sum": "numeric",
        "shortfall_value_n": "integer",
        "updated_at": "timestamp with time zone",
    }
    assert ledger(database_url, schema) == [M107]
    primary = [definition for kind, definition in refusal_constraints(database_url, schema) if kind == "p"]
    assert primary == ["PRIMARY KEY (hour, reason)"]


# Each row differs from the control row in exactly one field, so the failure can only be that field's rule.
REFUSED_ROWS = {
    "an hour that is not a whole UTC hour": {"hour": "2026-11-23T13:30:00Z"},
    "an hour with seconds": {"hour": "2026-11-23T13:00:01Z"},
    "a reason the writer does not know": {"reason": "bogus"},
    "more empty payers than refusals": {"empty_basket": 3},
    "a negative refusal count": {"refusals": -1, "empty_basket": 0, "shortfall_value_n": 0},
    "more measured shortfalls than refusals": {"shortfall_value_n": 3},
    "a negative shortfall total": {"shortfall_value_sum": -1},
    "a negative empty-payer count": {"empty_basket": -1},
    "a negative measured-shortfall count": {"shortfall_value_n": -1},
}


@pytest.mark.parametrize("what", sorted(REFUSED_ROWS))
def test_107_refuses_a_row_that_breaks_its_one_rule(database_url, schema, apply, what):
    assert apply(real_files(M107))[0] == 0
    insert_refusal(database_url, schema)  # the control: the same row without the one broken field is accepted
    with pytest.raises(psycopg2.errors.CheckViolation):
        insert_refusal(database_url, schema, **{"hour": "2026-11-23T14:00:00Z", **REFUSED_ROWS[what]})
    assert sql(database_url, schema, "SELECT count(*) FROM economy_debit_refusals") == [(1,)]


def test_107_accepts_every_hour_of_the_day_and_every_reason_the_writer_sends(database_url, schema, apply):
    assert apply(real_files(M107))[0] == 0
    reasons = ["insufficient_value", "rates_unavailable", "no_balance", "auto_swap_off", "lost_race"]
    for hour in range(24):
        for reason in reasons:
            insert_refusal(database_url, schema, hour=f"2026-11-23T{hour:02d}:00:00Z", reason=reason)
    assert sql(database_url, schema, "SELECT count(*) FROM economy_debit_refusals") == [(120,)]
    with pytest.raises(psycopg2.errors.UniqueViolation):
        insert_refusal(database_url, schema)


def test_107_is_a_no_op_the_second_time_through_the_runner_and_when_re_executed(database_url, schema, apply):
    apply(real_files(M107))
    insert_refusal(database_url, schema)
    snapshot = (
        columns(database_url, schema, "economy_debit_refusals"),
        refusal_constraints(database_url, schema),
        sql(database_url, schema, "SELECT * FROM economy_debit_refusals"),
    )

    code, out = apply(real_files(M107))
    assert code == 0 and "up to date" in out, out

    # the runner will not offer the file again; the file itself must still be safe to execute (a repair, a re-bootstrap)
    sql(database_url, schema, (INIT / M107).read_text(encoding="utf-8"))
    assert (
        columns(database_url, schema, "economy_debit_refusals"),
        refusal_constraints(database_url, schema),
        sql(database_url, schema, "SELECT * FROM economy_debit_refusals"),
    ) == snapshot


def prepared(url: str, schema: str, name: str, types: str, statement: str, calls: List[tuple]) -> List[List[tuple]]:
    """PREPARE the statement as the app sends it (it uses $n placeholders), then EXECUTE it once per call on the same session.

    The name is made unique and the statement is deallocated afterwards: a single-session server (PGlite) keeps prepared statements
    across connections, so a second run, or a failed one, would otherwise fail with DuplicatePreparedStatement."""
    name = f"{name}_{uuid.uuid4().hex[:8]}"
    conn = connect(url, schema)
    try:
        results = []
        with conn.cursor() as cur:
            cur.execute(f"PREPARE {name}({types}) AS {statement}")
            for args in calls:
                placeholders = ", ".join(["%s"] * len(args))
                cur.execute(f"EXECUTE {name}({placeholders})", args)
                results.append(cur.fetchall() if cur.description else [])
        conn.commit()
        return results
    finally:
        try:
            conn.rollback()
            with conn.cursor() as cur:
                cur.execute(f"DEALLOCATE {name}")
            conn.commit()
        except psycopg2.Error:
            pass  # the PREPARE itself failed, so there is nothing to deallocate
        conn.close()


def test_107_the_recorder_upserts_and_the_reader_reads_what_it_wrote(database_url, schema, apply):
    assert apply(real_files(M107))[0] == 0
    record = service_sql("RECORD_DEBIT_REFUSAL_SQL")
    read = service_sql("READ_DEBIT_REFUSALS_SQL")
    # (hour, reason, empty payer 0/1, shortfall, measured 0/1): the order the service binds them in
    prepared(database_url, schema, "record_refusal", "timestamptz, text, int, numeric, int", record, [
        (HOUR_13, "insufficient_value", 1, 4.5, 1),
        (HOUR_13, "insufficient_value", 1, 0.5, 1),
        (HOUR_13, "auto_swap_off", 0, 0, 0),
        ("2026-11-23T14:00:00Z", "insufficient_value", 1, 2, 1),
    ])
    rows = sql(database_url, schema, "SELECT reason, refusals, empty_basket, shortfall_value_sum::float8, shortfall_value_n FROM economy_debit_refusals WHERE hour = %s::timestamptz ORDER BY reason", (HOUR_13,))
    assert rows == [("auto_swap_off", 1, 0, 0.0, 0), ("insufficient_value", 2, 2, 5.0, 2)]
    assert sql(database_url, schema, "SELECT count(*) FROM economy_debit_refusals") == [(3,)], "two hours and three (hour, reason) pairs, not four rows"

    (window,) = prepared(database_url, schema, "read_refusals", "timestamptz", read, [("2026-11-23T14:00:00Z",)])
    assert [(reason, refusals, empty, total, n) for _hour, reason, refusals, empty, total, n in window] == [("insufficient_value", 1, 1, 2.0, 1)]
    (everything,) = prepared(database_url, schema, "read_all_refusals", "timestamptz", read, [(HOUR_13,)])
    assert [reason for _hour, reason, *_rest in everything] == ["auto_swap_off", "insufficient_value", "insufficient_value"]
