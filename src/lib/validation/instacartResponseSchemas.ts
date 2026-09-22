import { z } from "zod";

export const InstacartLinkResponseSchema = z
  .object({
    products_link_url: z.string().optional(),
    url: z.string().optional(),
  })
  .passthrough()
  .refine((data) => Boolean(data.url || data.products_link_url), {
    message: "Expected either url or products_link_url in Instacart response",
  });

export type InstacartLinkResponseWire = z.infer<typeof InstacartLinkResponseSchema>;

export const InstacartRetailerSchema = z
  .object({
    retailer_key: z.string(),
    name: z.string(),
    retailer_logo_url: z.string().optional().default(""),
  })
  .passthrough();

export type InstacartRetailerWire = z.infer<typeof InstacartRetailerSchema>;

export const InstacartRetailersResponseSchema = z
  .object({
    retailers: z.array(InstacartRetailerSchema),
  })
  .passthrough();

export type InstacartRetailersResponseWire = z.infer<typeof InstacartRetailersResponseSchema>;

export function toDomainInstacartRetailer(wire: InstacartRetailerWire): {
  retailer_key: string;
  name: string;
  retailer_logo_url: string;
} {
  return {
    retailer_key: wire.retailer_key,
    name: wire.name,
    retailer_logo_url: wire.retailer_logo_url,
  };
}
