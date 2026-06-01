import type { TokenType } from "@/types/economy";

export type TokenCost = Partial<Record<Lowercase<TokenType>, number>>;

export const OPERATION_COSTS = {
  refine_oracle: { substance: 5 },
  // AI recipe ingestion (text/photo → structured recipe via /api/recipes/extract).
  // Live-priced at debit time like refine_oracle. Axis/amount tunable.
  ingest_recipe: { essence: 3 },
} as const satisfies Record<string, TokenCost>;
