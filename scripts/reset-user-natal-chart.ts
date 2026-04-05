import { Pool } from "pg";

interface Args {
  email?: string;
  userId?: string;
  apply: boolean;
}

interface UserRow {
  id: string;
  email: string;
  onboarding_complete: boolean | null;
  auth_onboarding_complete: boolean | null;
  birth_data: Record<string, unknown> | null;
  natal_chart: Record<string, unknown> | null;
  saved_chart_count: number;
}

let pool: Pool | null = null;

function parseArgs(argv: string[]): Args {
  const args: Args = { apply: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--email") {
      args.email = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--user-id") {
      args.userId = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--apply") {
      args.apply = true;
    }
  }

  return args;
}

function assertArgs(args: Args): void {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!args.email && !args.userId) {
    throw new Error("Pass either --email <email> or --user-id <uuid>");
  }

  if (args.email && args.userId) {
    throw new Error("Pass only one of --email or --user-id");
  }
}

async function lookupUser(args: Args): Promise<UserRow | null> {
  const identifierClause = args.email ? "u.email = $1" : "u.id::text = $1";
  const identifierValue = args.email?.toLowerCase() ?? args.userId!;

  const result = await executeQuery<UserRow>(
    `SELECT
        u.id,
        u.email,
        up.onboarding_completed AS onboarding_complete,
        u."onboardingComplete" AS auth_onboarding_complete,
        up.birth_data,
        up.natal_chart,
        (
          SELECT COUNT(*)
          FROM saved_charts sc
          WHERE sc.owner_id = u.id
            AND sc.chart_type IN ('primary', 'cosmic_identity')
        )::int AS saved_chart_count
     FROM users u
     LEFT JOIN user_profiles up ON up.user_id = u.id
     WHERE ${identifierClause}
     LIMIT 1`,
    [identifierValue],
  );

  return (result.rows[0] as UserRow | undefined) ?? null;
}

function summarizeUser(user: UserRow): void {
  const birthDateTime =
    typeof user.birth_data?.dateTime === "string" ? user.birth_data.dateTime : null;
  const calculatedAt =
    typeof user.natal_chart?.calculatedAt === "string" ? user.natal_chart.calculatedAt : null;

  console.log(JSON.stringify({
    userId: user.id,
    email: user.email,
    hasBirthData: !!user.birth_data && Object.keys(user.birth_data).length > 0,
    hasNatalChart: !!user.natal_chart && Object.keys(user.natal_chart).length > 0,
    onboardingCompleted: user.onboarding_complete,
    authOnboardingComplete: user.auth_onboarding_complete,
    birthDateTime,
    calculatedAt,
    savedChartCount: user.saved_chart_count,
  }, null, 2));
}

async function resetUser(user: UserRow): Promise<void> {
  await executeQuery(
    `UPDATE users
     SET profile = jsonb_set(
           COALESCE(profile, '{}'::jsonb) - 'birthData' - 'natalChart' - 'birth_data' - 'natal_chart',
           '{onboardingComplete}',
           'false'::jsonb,
           true
         ),
         "onboardingComplete" = false,
         "birthDate" = NULL,
         "birthTime" = NULL,
         "birthLocation" = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [user.id],
  );

  await executeQuery(
    `UPDATE user_profiles
     SET birth_data = '{}'::jsonb,
         natal_chart = '{}'::jsonb,
         onboarding_completed = false,
         onboarding_completed_at = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1`,
    [user.id],
  );

  await executeQuery(
    `DELETE FROM saved_charts
     WHERE owner_id = $1
       AND chart_type IN ('primary', 'cosmic_identity')`,
    [user.id],
  );
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  return pool;
}

async function executeQuery<T>(query: string, params: unknown[] = []) {
  return getPool().query(query, params) as unknown as Promise<{ rows: T[] }>;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  assertArgs(args);

  const user = await lookupUser(args);
  if (!user) {
    throw new Error("User not found");
  }

  console.log("Current stored chart state:");
  summarizeUser(user);

  if (!args.apply) {
    console.log("\nDry run only. Re-run with --apply to clear stored natal chart data.");
    return;
  }

  await resetUser(user);

  const updatedUser = await lookupUser(args);
  if (!updatedUser) {
    throw new Error("User disappeared after reset");
  }

  console.log("\nStored chart state after reset:");
  summarizeUser(updatedUser);
  console.log(
    "\nNext step: reload /profile. If the browser still shows onboarding complete, sign out and sign back in so the JWT refreshes.",
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Failed to reset natal chart",
  );
  process.exit(1);
}).finally(async () => {
  if (pool) {
    await pool.end();
  }
});
