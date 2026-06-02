import { Client } from "pg";
import { writeFileSync } from "fs";

// One-off: dump users + accounts from the legacy Neon DB (pre-Railway migration).
// Provide the connection string via env — never hardcode credentials:
//   NEON_DATABASE_URL=postgresql://… bun run scripts/migrate-neon-users.ts
const NEON_URI = process.env.NEON_DATABASE_URL;
if (!NEON_URI) {
  console.error(
    "❌  Set NEON_DATABASE_URL to the legacy Neon connection string before running.",
  );
  process.exit(1);
}

async function run() {
  const neon = new Client({ connectionString: NEON_URI });
  await neon.connect();

  console.log("Connected to Neon. Fetching users...");
  const usersRes = await neon.query(`
    SELECT id, name, email, "emailVerified", image, role, is_active, created_at, updated_at
    FROM users
  `);

  console.log("Fetching accounts...");
  const accountsRes = await neon.query(`
    SELECT id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state, created_at, updated_at
    FROM accounts
  `);

  const users = usersRes.rows;
  const accounts = accountsRes.rows;

  console.log(`Found ${users.length} users and ${accounts.length} accounts.`);

  writeFileSync("neon-users-dump.json", JSON.stringify(users, null, 2));
  writeFileSync("neon-accounts-dump.json", JSON.stringify(accounts, null, 2));

  console.log("Dumped to neon-users-dump.json and neon-accounts-dump.json");
  await neon.end();
}

run().catch(console.error);
