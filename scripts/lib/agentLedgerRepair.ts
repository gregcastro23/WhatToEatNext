/** Shared, complete balance/ledger comparison and one-time initialization repair. */
export interface AgentLedgerQueryClient {
  query(sql: string, values?: unknown[]): Promise<{
    rows: Record<string, unknown>[];
    rowCount?: number | null;
  }>;
}

/** Missing ledger axes count as zero; orphan ledger rows remain defects even at net zero. */
export const AGENT_LEDGER_DRIFT_SQL = `
  WITH balance_axes AS (
    SELECT b.user_id, a.token_type, a.balance
      FROM token_balances b
      CROSS JOIN LATERAL (VALUES
        ('Spirit', b.spirit::numeric), ('Essence', b.essence::numeric),
        ('Matter', b.matter::numeric), ('Substance', b.substance::numeric)
      ) AS a(token_type, balance)
  ), ledger AS (
    SELECT user_id, token_type, sum(amount)::numeric AS total
      FROM token_transactions GROUP BY user_id, token_type
  ), paired AS (
    SELECT coalesce(b.user_id, l.user_id) AS user_id,
           coalesce(b.token_type, l.token_type) AS token_type,
           coalesce(l.total, 0::numeric) AS ledger, b.balance,
           b.user_id IS NULL AS orphan
      FROM balance_axes b
      FULL OUTER JOIN ledger l
        ON l.user_id = b.user_id AND l.token_type = b.token_type
  )
  SELECT p.user_id::text, u.name, u.is_agent, p.token_type,
         p.ledger::text, p.balance::text,
         (p.balance - p.ledger)::text AS owed,
         (p.ledger - p.balance)::text AS delta, p.orphan,
         p.token_type IN ('Spirit', 'Essence', 'Matter', 'Substance') AS valid_axis
    FROM paired p LEFT JOIN users u ON u.id = p.user_id
   WHERE p.orphan OR p.balance IS NULL OR p.ledger <> p.balance
   ORDER BY p.user_id, p.token_type`;

export interface AgentLedgerDriftRow {
  user_id: string;
  name: string | null;
  is_agent: boolean;
  token_type: string;
  ledger: string;
  balance: string | null;
  owed: string | null;
  delta: string | null;
  orphan: boolean;
  valid_axis: boolean;
}

const DECIMAL = /^-?\d+(?:\.\d+)?$/;

function decimal(value: unknown, field: string): string {
  if (typeof value !== "string" || !DECIMAL.test(value)) {
    throw new Error(`Invalid exact decimal ${field} returned by ledger detector`);
  }
  return value;
}

function parseRow(row: Record<string, unknown>): AgentLedgerDriftRow {
  if (typeof row.user_id !== "string" || typeof row.token_type !== "string" ||
      (row.name !== null && typeof row.name !== "string") ||
      (row.is_agent !== null && typeof row.is_agent !== "boolean") ||
      typeof row.orphan !== "boolean" || typeof row.valid_axis !== "boolean") {
    throw new Error("Invalid identity or status returned by ledger detector");
  }
  return {
    user_id: row.user_id, name: row.name, is_agent: row.is_agent === true,
    token_type: row.token_type, ledger: decimal(row.ledger, "ledger"),
    balance: row.balance === null ? null : decimal(row.balance, "balance"),
    owed: row.owed === null ? null : decimal(row.owed, "owed"),
    delta: row.delta === null ? null : decimal(row.delta, "delta"),
    orphan: row.orphan, valid_axis: row.valid_axis,
  };
}

export async function readAgentLedgerDrift(client: AgentLedgerQueryClient): Promise<AgentLedgerDriftRow[]> {
  const result = await client.query(AGENT_LEDGER_DRIFT_SQL);
  return result.rows.map(parseRow);
}

/** Display totals without converting monetary values to binary floating point. */
function sumDecimals(amounts: string[]): string {
  const scale = amounts.reduce((largest, amount) =>
    Math.max(largest, amount.split(".")[1]?.length ?? 0), 0);
  let total = 0n;
  for (const amount of amounts) {
    const [whole = "0", fraction = ""] = amount.split(".");
    total += BigInt(whole + fraction.padEnd(scale, "0"));
  }
  const digits = total.toString().padStart(scale + 1, "0");
  return scale === 0 ? digits : `${digits.slice(0, -scale)}.${digits.slice(-scale)}`;
}

export interface AgentLedgerRepairResult {
  rows: AgentLedgerDriftRow[];
  inserted: number;
  committed: boolean;
  totalOwed: string;
}

/** Caller owns the connection. Dry runs issue no writes and always roll back. */
export async function repairAgentLedger(
  client: AgentLedgerQueryClient,
  options: { write: boolean },
): Promise<AgentLedgerRepairResult> {
  await client.query(options.write ? "BEGIN" : "BEGIN READ ONLY");
  try {
    if (options.write) {
      // Block all balance/ledger DML until comparison, credits and verification finish.
      // Existing writers must finish before this snapshot is read; readers may continue.
      await client.query("LOCK TABLE token_balances, token_transactions IN SHARE ROW EXCLUSIVE MODE");
    }
    const rows = await readAgentLedgerDrift(client);
    if (rows.some((row) => row.orphan || row.balance === null || !row.valid_axis)) {
      throw new Error("REFUSING: orphan ledger rows, missing balances or unknown token axes require investigation");
    }
    if (rows.some((row) => !row.is_agent)) {
      throw new Error("REFUSING: drifted rows belong to non-agents");
    }
    const amounts: string[] = [];
    for (const row of rows) {
      if (row.owed === null || row.owed.startsWith("-") || !/[1-9]/.test(row.owed)) {
        throw new Error("REFUSING: non-positive owed amount (balance <= ledger)");
      }
      amounts.push(row.owed);
    }
    const totalOwed = sumDecimals(amounts);
    let inserted = 0;
    if (options.write) {
      for (const row of rows) {
        const result = await client.query(`
          INSERT INTO token_transactions (
            transaction_group_id, user_id, token_type, amount, source_type,
            source_id, description, idempotency_key, created_at
          ) VALUES (
            uuid_generate_v4(), $1, $2, $3::decimal, 'initial_grant',
            'asol_esms_sync', 'Historical agent ESMS balance seed reconciliation', $4, now()
          ) ON CONFLICT (idempotency_key) DO NOTHING RETURNING id`,
        [row.user_id, row.token_type, row.owed, `reconcile_agent_esms_seed:${row.user_id}:${row.token_type}`]);
        inserted += result.rows.length;
      }
      if ((await readAgentLedgerDrift(client)).length > 0) {
        throw new Error("REFUSING TO COMMIT: drift remains after initialization credits");
      }
    }
    await client.query(options.write ? "COMMIT" : "ROLLBACK");
    return { rows, inserted, committed: options.write, totalOwed };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  }
}
