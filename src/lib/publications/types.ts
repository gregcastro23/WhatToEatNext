/**
 * Shared publication contracts and truthful receipt types.
 *
 * Scoped to authenticated integration principal, operation, and caller delivery key.
 *
 * @file src/lib/publications/types.ts
 */

export type PublicationOperation = "feed_publish" | "weekly_menu_publish";
export type PublicationStatus = "in_flight" | "completed" | "failed";

export type RecipeCommentStatus =
  | "not_requested"
  | "pending"
  | "saved"
  | "failed"
  | "unknown";

export type LegacyInteractionStatus =
  | "not_requested"
  | "saved"
  | "no_op"
  | "failed";

export interface RecipeReflectionProvenance {
  substitutions?: unknown[];
  instructionReviewRequired?: boolean;
  baseRecipeId?: string;
  baseRecipeName?: string;
  unverifiedReadings?: string[];
  [key: string]: unknown;
}

export interface RecipeReflectionRecord {
  id: string;
  recipeId: string;
  authorId: string;
  publicationId?: string | null;
  feedEventId?: string | null;
  deliveryKey?: string | null;
  source: string;
  contentState: "proposed" | "verified" | "rejected";
  review: string;
  score: number | null;
  isAgent: boolean;
  instructionReviewRequired: boolean;
  provenance: RecipeReflectionProvenance;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
  hidden: boolean;
}

export interface DetailedPublicationReceipt {
  success: boolean;
  contractVersion: "1.0";
  deliveryId?: string;
  publicationId?: string;
  operation?: PublicationOperation;
  agentEmail?: string;
  eventType?: string;
  event?: { id: string };
  feedPublished: boolean;
  recipeCommentStatus: RecipeCommentStatus;
  recipeCommentSaved?: boolean;
  recipeReflectionId?: string;
  recipeReflection?: { id: string };
  menu?: { id: string; weekStartDate?: string };
  menuId?: string;
  legacyInteractionStatus: LegacyInteractionStatus;
  deduplicated?: boolean;
  details?: Record<string, unknown>;
  error?: string;
  errorCode?: string;
  [key: string]: unknown;
}

export interface AgentPublicationRow {
  id: string;
  principal_id: string;
  operation: PublicationOperation;
  delivery_key: string;
  payload_fingerprint: string;
  actor_id: string;
  status: PublicationStatus;
  feed_event_id: string | null;
  recipe_reflection_id: string | null;
  menu_id: string | null;
  feed_published: boolean;
  recipe_comment_status: RecipeCommentStatus;
  legacy_interaction_status: LegacyInteractionStatus;
  receipt_payload: DetailedPublicationReceipt;
  error_message: string | null;
  locked_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}
