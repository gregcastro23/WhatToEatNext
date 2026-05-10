import type { TokenType } from "@/types/economy";

export type TokenCost = Partial<Record<Lowercase<TokenType>, number>>;

export const OPERATION_COSTS = {
  refine_oracle: { substance: 5 },
} as const satisfies Record<string, TokenCost>;
