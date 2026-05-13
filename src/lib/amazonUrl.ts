/**
 * Utility for generating Amazon Associate links.
 *
 * If an ASIN is provided, it generates a direct product link.
 * If no ASIN is available, it generates a search fallback link to ensure
 * an affiliate cookie is still placed when the user clicks through.
 */

import { AMAZON_CONFIG } from "@/lib/amazon/config";

interface AmazonLinkOptions {
  searchIndex?: "amazonfresh" | "grocery" | "aps";
}

export function getAmazonLink(
  query: string,
  asin?: string | null,
  options: AmazonLinkOptions = {},
): string {
  const tag = AMAZON_CONFIG.tag;

  if (asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
  }

  const params = new URLSearchParams({
    k: query,
    tag,
  });

  if (options.searchIndex) params.set("i", options.searchIndex);

  return `https://www.amazon.com/s?${params.toString()}`;
}

export function getAmazonButtonText(asin?: string | null): string {
  return asin ? "Buy on Amazon" : "Find on Amazon";
}
