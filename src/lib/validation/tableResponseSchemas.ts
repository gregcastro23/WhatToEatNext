/**
 * Client-side validators for the /api/tables responses the table surfaces
 * read. Each schema is drift-guarded against its server type (pattern in
 * src/lib/admin/schemas/drift.ts); the server imports are type-only.
 *
 * @file src/lib/validation/tableResponseSchemas.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type {
  CompositeSnapshot,
  TableComment,
  TableCommentListResponse,
  TableDetail,
  TableInvite,
  TableMember,
  TableMemoryPayload,
  TableMenuItem,
  TablePhoto,
  TableRecord,
  TableVenue,
} from "@/types/table";

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

// ─── Table Sub-Entities ───────────────────────────────────────────────────

export const TableVenueSchema = z.object({
  type: z.enum(["home", "restaurant", "other"]),
  restaurantId: z.string().exactOptional(),
  name: z.string().exactOptional(),
  address: z.string().exactOptional(),
});

type _TableVenueDrift = AssertTrue<ServerSatisfies<TableVenue, z.infer<typeof TableVenueSchema>>>;

export const TableMenuItemSchema = z.object({
  name: z.string(),
  recipeRef: z.string().exactOptional(),
  course: z.string().exactOptional(),
  status: z.union([z.enum(["upcoming", "prep", "cooking", "served", "completed"]), z.string()]).exactOptional(),
});

type _TableMenuItemDrift = AssertTrue<ServerSatisfies<TableMenuItem, z.infer<typeof TableMenuItemSchema>>>;

export const TableMemberSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  userId: z.string().exactOptional(),
  manualCompanionChartId: z.string().exactOptional(),
  role: z.enum(["host", "guest"]),
  rsvpStatus: z.enum(["invited", "joined", "declined"]),
  joinedVia: z.enum(["host", "link", "qr", "invite", "search", "manual"]).exactOptional(),
  invitedBy: z.string().exactOptional(),
  displayName: z.string().exactOptional(),
  rsvpAt: z.string().exactOptional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string().exactOptional(),
  avatarUrl: z.string().exactOptional(),
  isAgent: z.boolean().exactOptional(),
});

type _TableMemberDrift = AssertTrue<ServerSatisfies<TableMember, z.infer<typeof TableMemberSchema>>>;

export const TablePhotoSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  uploaderId: z.string(),
  url: z.string(),
  createdAt: z.string(),
});

type _TablePhotoDrift = AssertTrue<ServerSatisfies<TablePhoto, z.infer<typeof TablePhotoSchema>>>;

export const TableInviteSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  token: z.string(),
  url: z.string(),
  createdBy: z.string(),
  maxUses: z.number(),
  useCount: z.number(),
  expiresAt: z.string(),
  revokedAt: z.string().nullable().exactOptional(),
  createdAt: z.string(),
});

type _TableInviteDrift = AssertTrue<ServerSatisfies<TableInvite, z.infer<typeof TableInviteSchema>>>;

// ─── Runtime Type Predicates for Complex Nested Payloads ───────────────────

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function isCompositeSnapshot(val: unknown): val is CompositeSnapshot {
  return (
    isRecord(val) &&
    val["version"] === 1 &&
    typeof val["computedAt"] === "string" &&
    typeof val["compositeChart"] === "object" &&
    val["compositeChart"] !== null
  );
}

function isTableMemoryPayload(val: unknown): val is TableMemoryPayload {
  return (
    isRecord(val) &&
    val["card"] === "table_memory" &&
    typeof val["tableId"] === "string"
  );
}

// ─── Table Record & Detail ────────────────────────────────────────────────

export const TableRecordSchema = z.object({
  id: z.string(),
  hostId: z.string(),
  title: z.string(),
  description: z.string().exactOptional(),
  scheduledAt: z.string(),
  venue: TableVenueSchema,
  status: z.enum(["planned", "live", "memory", "cancelled"]),
  visibility: z.enum(["public", "commensals", "private"]),
  compositeSnapshot: z.custom<CompositeSnapshot>(isCompositeSnapshot).nullable().exactOptional(),
  compositeUpdatedAt: z.string().nullable().exactOptional(),
  menu: z.array(TableMenuItemSchema),
  memory: z.custom<TableMemoryPayload>(isTableMemoryPayload).nullable().exactOptional(),
  wentLiveAt: z.string().nullable().exactOptional(),
  closedAt: z.string().nullable().exactOptional(),
  feedEventId: z.string().nullable().exactOptional(),
  seatCap: z.number().nullable().exactOptional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TableRecordView = z.infer<typeof TableRecordSchema>;

type _TableRecordDrift = AssertTrue<ServerSatisfies<TableRecord, TableRecordView>>;

export const TableDetailSchema = TableRecordSchema.extend({
  members: z.array(TableMemberSchema),
  photos: z.array(TablePhotoSchema),
  invites: z.array(TableInviteSchema).exactOptional(),
});

export type TableDetailView = z.infer<typeof TableDetailSchema>;

type _TableDetailDrift = AssertTrue<ServerSatisfies<TableDetail, TableDetailView>>;

// ─── Tables API Responses ─────────────────────────────────────────────────

export const TablesApiResponseSchema = z.object({
  success: z.boolean().exactOptional(),
  tables: z.array(TableRecordSchema).exactOptional(),
  message: z.string().exactOptional(),
});

export type TablesApiResponseView = z.infer<typeof TablesApiResponseSchema>;

export const TableDetailApiResponseSchema = z.object({
  success: z.boolean().exactOptional(),
  table: TableDetailSchema.exactOptional(),
  viewerId: z.string().nullable().exactOptional(),
  message: z.string().exactOptional(),
  joinedCount: z.number().exactOptional(),
});

export type TableDetailApiResponseView = z.infer<typeof TableDetailApiResponseSchema>;
