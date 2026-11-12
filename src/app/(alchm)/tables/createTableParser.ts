/**
 * Wire parser for `POST /api/tables` as the "Plan a Table" dialog reads it.
 *
 * Producer: src/app/api/tables/route.ts. Success is `201 { success: true,
 * table }` (line 133) where `table` is the non-null `TableRecord` returned by
 * `createTable` (lines 101-131; `id: string` per src/types/table.ts:176-177).
 * Every refusal is `{ success: false, message }` (401 line 55, 400 lines 66/77/
 * 85/97 — the validation 400 also carries `details`, ignored here — and 500
 * lines 129/138); the 429 from `rateLimit` carries `{ error, message }`.
 *
 * The page reads only `success`, `message` and `table.id`, so only those are
 * kept, each only when it has the type the page reads it as. A `table` without
 * a string `id` is dropped, which the page's `!success || !table` check treats
 * as a failed create — the same message the page's catch shows.
 *
 * Throws on a body that is not a JSON object. The page parses inside its
 * existing try/catch, whose message ("Could not create the table.") is the
 * same one the failure branch shows when `message` is absent.
 *
 * @file src/app/(alchm)/tables/createTableParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";

export interface CreateTableResponse {
  success?: boolean;
  message?: string;
  table?: { id: string };
}

/** `parse` for `readJson` on `POST /api/tables`. */
export function parseCreateTableResponse(value: unknown): CreateTableResponse {
  if (!isJsonRecord(value)) {
    throw new TypeError("Create table response must be a JSON object");
  }
  const { success, message, table } = value;
  const tableId = isJsonRecord(table) ? table.id : undefined;
  return {
    ...(typeof success === "boolean" ? { success } : {}),
    ...(typeof message === "string" ? { message } : {}),
    ...(typeof tableId === "string" ? { table: { id: tableId } } : {}),
  };
}
