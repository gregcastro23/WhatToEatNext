// End-to-end behaviour of the changed economy statements, against production,
// in a transaction that is ALWAYS rolled back. Statements are read out of the
// module source so this tests what ships, not a hand copy.
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";

const src = readFileSync("src/services/TokenEconomyService.ts", "utf8");
const yields = src.match(/const DAILY_YIELD_SOURCES = \[([\s\S]*?)\]/)[1].match(/"[^"]+"/g)
  .map((s) => `'${s.slice(1, -1)}'`).join(", ");
const creditSql = (col) => src.match(/return `WITH inserted[\s\S]*?RETURNING \*`;/)[0]
  .replace(/^return `/, "").replace(/`;$/, "")
  .replace(/\$\{DAILY_YIELD_SOURCES_SQL\}/g, yields).replace(/\$\{column\}/g, col);
const debitSql = (col) => src.match(/return `WITH check_balance[\s\S]*?RETURNING \*`;/)[0]
  .replace(/^return `/, "").replace(/`;$/, "").replace(/\$\{column\}/g, col);
const getBalSql = src.match(/`INSERT INTO token_balances \(user_id\) VALUES \(\$1\)\s*\n\s*ON CONFLICT[\s\S]*?RETURNING \*`/)[0]
  .replace(/^`/, "").replace(/`$/, "");

const c = new pg.Client({ connectionString: process.env.DATABASE_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let bad = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const no = (m) => { console.error(`  FAIL ${m}`); bad++; };

const mkUser = async (label) => {
  const id = randomUUID();
  await c.query(
    `INSERT INTO users (id, email, password_hash, role, is_active, email_verified, is_agent,
                        name, profile, preferences, login_count, created_at, updated_at)
     VALUES ($1,$2,'NO_LOGIN','USER'::user_role,true,true,false,$3,'{}'::jsonb,'{}'::jsonb,0,now(),now())`,
    [id, `econ-${id}@example.invalid`, label]);
  return id;
};
const spirit = async (id) => {
  const r = await c.query(`SELECT spirit FROM token_balances WHERE user_id=$1`, [id]);
  return r.rows.length ? Number(r.rows[0].spirit) : null;
};

try {
  await c.query("BEGIN");

  // ── getBalances ──────────────────────────────────────────────────────────
  console.log("\ngetBalances (single statement, insert-or-return)");
  const u = await mkUser("econ probe");
  const first = await c.query(getBalSql, [u]);
  first.rows.length === 1 && Number(first.rows[0].spirit) === 0
    ? ok("creates the row and RETURNS it (spirit 0)")
    : no(`returned ${first.rows.length} rows / spirit ${first.rows[0]?.spirit}`);
  const second = await c.query(getBalSql, [u]);
  second.rows.length === 1
    ? ok("second call returns the SAME row — the DO NOTHING/RETURNING gap is closed")
    : no(`re-read returned ${second.rows.length} rows`);

  // ── credit then debit ────────────────────────────────────────────────────
  console.log("\ncredit then debit");
  await c.query(creditSql("spirit"), [u, "Spirit", 10, "signup_grant", null, "probe", randomUUID(), `p:${u}:1`]);
  (await spirit(u)) === 10 ? ok("credit of 10 applied") : no(`balance ${await spirit(u)} after credit`);

  const d1 = await c.query(debitSql("spirit"), [u, "Spirit", 4, "recipe_ingestion", null, randomUUID(), "probe debit"]);
  (d1.rowCount === 1 && (await spirit(u)) === 6)
    ? ok("debit of 4 applied — balance 6")
    : no(`debit returned ${d1.rowCount} rows, balance ${await spirit(u)}`);

  const d2 = await c.query(debitSql("spirit"), [u, "Spirit", 100, "recipe_ingestion", null, randomUUID(), "overdraw"]);
  (d2.rowCount === 0 && (await spirit(u)) === 6)
    ? ok("debit of 100 REFUSED, balance untouched")
    : no(`overdraw returned ${d2.rowCount} rows, balance ${await spirit(u)}`);

  // ── the case the removed CTE pretended to handle ────────────────────────
  console.log("\ndebit for a user with NO balance row");
  const v = await mkUser("no balance");
  const d3 = await c.query(debitSql("spirit"), [v, "Spirit", 5, "recipe_ingestion", null, randomUUID(), "no row"]);
  const vs = await spirit(v);
  (d3.rowCount === 0 && vs === null)
    ? ok("fails CLOSED — 0 rows, and no balance row conjured into existence")
    : no(`returned ${d3.rowCount} rows and balance ${vs} (expected 0 / null)`);
  const led = await c.query(`SELECT count(*) n FROM token_transactions WHERE user_id=$1`, [v]);
  Number(led.rows[0].n) === 0
    ? ok("and no ledger row was written for the refused debit")
    : no(`${led.rows[0].n} ledger rows written for a refused debit`);

  // ── the invariant ───────────────────────────────────────────────────────
  const inv = await c.query(
    `SELECT b.spirit, COALESCE(sum(t.amount),0) AS ledger FROM token_balances b
       LEFT JOIN token_transactions t ON t.user_id=b.user_id AND t.token_type='Spirit'
      WHERE b.user_id=$1 GROUP BY b.spirit`, [u]);
  String(inv.rows[0].spirit) === String(inv.rows[0].ledger)
    ? ok(`ledger === balance (${inv.rows[0].ledger})`)
    : no(`ledger ${inv.rows[0].ledger} !== balance ${inv.rows[0].spirit}`);
} finally {
  await c.query("ROLLBACK");
  await c.end();
}
console.log(bad === 0 ? "\nPASS — all economy statements behave correctly (rolled back)\n" : `\nFAILED: ${bad}\n`);
process.exit(bad === 0 ? 0 : 1);
