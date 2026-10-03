/**
 * Client-side validators for the /api/tables responses the table surfaces
 * read. Each schema is drift-guarded against its server type (pattern in
 * src/lib/admin/schemas/drift.ts); the server imports are type-only.
 *
 * @file src/lib/validation/tableResponseSchemas.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { TableComment, TableCommentListResponse } from "@/types/table";

// ─── Comments — GET /api/tables/[tableId]/comments ────────────────────────

/**
 * Every TableComment field; guarded both ways so readers keep the domain
 * type. `authorName` is omitted (never null) when the author has no name.
 */
export const TableCommentSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  authorId: z.string(),
  authorName: z.string().exactOptional(),
  body: z.string(),
  createdAt: z.string(),
});

type _TableCommentDrift = AssertTrue<ServerSatisfies<TableComment, z.infer<typeof TableCommentSchema>>>;
type _TableCommentExact = AssertTrue<ServerSatisfies<z.infer<typeof TableCommentSchema>, TableComment>>;

export const TableCommentListResponseSchema = z.object({
  success: z.literal(true),
  comments: z.array(TableCommentSchema),
});

type _TableCommentListDrift = AssertTrue<
  ServerSatisfies<TableCommentListResponse, z.infer<typeof TableCommentListResponseSchema>>
>;
