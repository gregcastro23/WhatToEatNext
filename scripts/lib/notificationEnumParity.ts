import fs from "node:fs";
import path from "node:path";
import type { NotificationType } from "@/types/notification";
import type { Pool } from "pg";

export const CANONICAL_NOTIFICATION_TYPES: readonly NotificationType[] = [
  "welcome",
  "login_greeting",
  "daily_insight",
  "commensal_request",
  "commensal_accepted",
  "quest_completed",
  "master_quest_broadcast",
  "agent_broadcast",
  "transit_attunement",
  "new_follower",
  "table_invite",
  "table_rsvp",
  "table_going_live",
  "table_memory_posted",
  "table_join_request",
  "reaction_received",
  "comment_received",
  "dm_message",
  "circle_message",
  "table_chat_mention",
] as const;

/**
 * Statically extract all notification_type enum values defined in database/init/*.sql migrations.
 */
export function getMigrationNotificationTypes(
  initDir = path.resolve(process.cwd(), "database/init"),
): string[] {
  const values = new Set<string>();
  const files = fs.readdirSync(initDir).filter((f) => f.endsWith(".sql"));

  // 1. Initial enum creation in 13-notifications-schema.sql
  const schemaFile = files.find((f) => f.startsWith("13-"));
  if (schemaFile) {
    const content = fs.readFileSync(path.join(initDir, schemaFile), "utf8");
    const enumBlock = content.match(/CREATE\s+TYPE\s+notification_type\s+AS\s+ENUM\s*\(([^)]+)\)/is);
    if (enumBlock?.[1]) {
      const matches = enumBlock[1].matchAll(/'([^']+)'/g);
      for (const m of matches) {
        if (m[1]) {
          values.add(m[1]);
        }
      }
    }
  }

  // 2. ALTER TYPE notification_type ADD VALUE additions
  const alterRegex = /ALTER\s+TYPE\s+notification_type\s+ADD\s+VALUE(?:\s+IF\s+NOT\s+EXISTS)?\s+'([^']+)'/gi;
  for (const file of files) {
    const content = fs.readFileSync(path.join(initDir, file), "utf8");
    let match: RegExpExecArray | null;
    while ((match = alterRegex.exec(content)) !== null) {
      if (match[1]) {
        values.add(match[1]);
      }
    }
  }

  return Array.from(values).sort();
}

/**
 * Statically extract NotificationType union members from src/types/notification.ts.
 */
export function getTypeScriptNotificationTypes(
  filePath = path.resolve(process.cwd(), "src/types/notification.ts"),
): string[] {
  const content = fs.readFileSync(filePath, "utf8");
  const typeMatch = content.match(/export\s+type\s+NotificationType\s*=\s*([^;]+);/s);
  if (!typeMatch?.[1]) {
    throw new Error(`Could not find export type NotificationType in ${filePath}`);
  }

  const values: string[] = [];
  const itemRegex = /'([^']+)'/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(typeMatch[1])) !== null) {
    if (match[1]) {
      values.push(match[1]);
    }
  }
  return values.sort();
}

export interface EnumParityResult {
  currentValues: string[];
  missingValues: string[];
  isCompliant: boolean;
  appliedValues?: string[];
}

export async function checkEnumParity(
  pool: Pool,
  applyFixes = false,
): Promise<EnumParityResult> {
  const result = await pool.query<{ enumlabel: string }>(
    `SELECT e.enumlabel
     FROM pg_enum e
     JOIN pg_type t ON e.enumtypid = t.oid
     WHERE t.typname = 'notification_type'
     ORDER BY e.enumsortorder;`,
  );

  const currentValues = result.rows.map((r) => r.enumlabel);
  const currentSet = new Set(currentValues);

  const missingValues = CANONICAL_NOTIFICATION_TYPES.filter(
    (val) => !currentSet.has(val),
  );

  const appliedValues: string[] = [];

  if (applyFixes && missingValues.length > 0) {
    for (const val of missingValues) {
      console.log(`Applying: ALTER TYPE notification_type ADD VALUE IF NOT EXISTS '${val}';`);
      await pool.query(
        `ALTER TYPE notification_type ADD VALUE IF NOT EXISTS '${val}';`,
      );
      appliedValues.push(val);
    }
  }

  return {
    currentValues,
    missingValues: missingValues.map((v) => String(v)),
    isCompliant: missingValues.length === 0,
    appliedValues,
  };
}
