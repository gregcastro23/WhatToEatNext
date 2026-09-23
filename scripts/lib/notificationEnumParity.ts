import pkg from "pg";

const { Pool } = pkg;

export const CANONICAL_DB_NOTIFICATION_TYPES = [
  "welcome",
  "login_greeting",
  "daily_insight",
  "commensal_request",
  "commensal_accepted",
  "transit_attunement",
  "table_invite",
  "table_rsvp",
  "table_going_live",
  "table_memory_posted",
  "new_follower",
  "dm_message",
  "circle_message",
  "table_chat_mention",
  "table_join_request",
  "quest_completed",
  "master_quest_broadcast",
  "reaction_received",
  "comment_received",
] as const;

export interface EnumParityResult {
  currentValues: string[];
  missingValues: string[];
  isCompliant: boolean;
  appliedValues?: string[];
}

export async function checkEnumParity(
  pool: InstanceType<typeof Pool>,
  applyFixes = false,
): Promise<EnumParityResult> {
  const result = await pool.query<{ enumlabel: string }>(
    `SELECT e.enumlabel
     FROM pg_enum e
     JOIN pg_type t ON e.enumtypid = t.oid
     WHERE t.typname = 'notification_type'
     ORDER BY e.enumsortorder;`
  );

  const currentValues = result.rows.map((r) => r.enumlabel);
  const currentSet = new Set(currentValues);

  const missingValues = CANONICAL_DB_NOTIFICATION_TYPES.filter(
    (val) => !currentSet.has(val),
  );

  const appliedValues: string[] = [];

  if (applyFixes && missingValues.length > 0) {
    for (const val of missingValues) {
      console.log(`Applying: ALTER TYPE notification_type ADD VALUE IF NOT EXISTS '${val}';`);
      await pool.query(
        `ALTER TYPE notification_type ADD VALUE IF NOT EXISTS '${val}';`
      );
      appliedValues.push(val);
    }
  }

  return {
    currentValues,
    missingValues,
    isCompliant: missingValues.length === 0,
    appliedValues,
  };
}
