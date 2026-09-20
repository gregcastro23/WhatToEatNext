import { z } from "zod";

export interface CoinAmountsWire {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export const CoinAmountsSchema: z.ZodType<CoinAmountsWire> = z.object({
  spirit: z.number(),
  essence: z.number(),
  matter: z.number(),
  substance: z.number(),
});

export interface ShopItemWire {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  isOneTime: boolean;
  baseCost: CoinAmountsWire;
  liveCost: CoinAmountsWire;
  owned: boolean;
}

export const ShopItemSchema: z.ZodType<ShopItemWire> = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().optional().transform((v) => v ?? null),
  category: z.string(),
  isOneTime: z.boolean(),
  baseCost: CoinAmountsSchema,
  liveCost: CoinAmountsSchema,
  owned: z.boolean(),
});

export const ShopItemsResponseSchema = z
  .object({
    items: z.array(ShopItemSchema).optional(),
  })
  .passthrough();

export type ShopItemsResponseWire = z.infer<typeof ShopItemsResponseSchema>;

export const OnchainStatusSchema = z
  .object({
    configured: z.boolean(),
    walletAddress: z.string().nullable(),
    walletLinked: z.boolean(),
    offchain: CoinAmountsSchema,
    onchain: CoinAmountsSchema.nullable(),
    chain: z
      .object({
        chainName: z.string(),
        testnet: z.boolean(),
        explorerBaseUrl: z.string().nullable(),
      })
      .passthrough(),
  })
  .passthrough();

export type OnchainStatusWire = z.infer<typeof OnchainStatusSchema>;

export const SignChallengeSchema = z
  .object({
    domain: z
      .object({
        name: z.string(),
        version: z.string(),
        chainId: z.number(),
        verifyingContract: z.string(),
      })
      .passthrough(),
    types: z.record(z.string(), z.array(z.object({ name: z.string(), type: z.string() }))),
    primaryType: z.string(),
    message: z.record(z.string(), z.unknown()),
  })
  .passthrough();

export type SignChallengeWire = z.infer<typeof SignChallengeSchema>;

export const ShopPurchaseResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    alreadyOwned: z.boolean().optional(),
    reconciled: z.boolean().optional(),
    txHash: z.string().optional(),
    mode: z.string().optional(),
    orderId: z.string().optional(),
    deadline: z.string().optional(),
    challenge: SignChallengeSchema.optional(),
    error: z.string().optional(),
    code: z.string().optional(),
  })
  .passthrough();

export type ShopPurchaseResponseWire = z.infer<typeof ShopPurchaseResponseSchema>;

export const ShopPurchaseSettleResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    txHash: z.string().optional(),
    error: z.string().optional(),
    code: z.string().optional(),
  })
  .passthrough();

export type ShopPurchaseSettleResponseWire = z.infer<typeof ShopPurchaseSettleResponseSchema>;
