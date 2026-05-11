/**
 * Utility for generating Amazon Associate links.
 *
 * If an ASIN is provided, it generates a direct product link.
 * If no ASIN is available, it generates a search fallback link to ensure
 * an affiliate cookie is still placed when the user clicks through.
 */

import { AMAZON_CONFIG } from "@/lib/amazon/config";

export function getAmazonLink(query: string, asin?: string | null): string {
  const tag = AMAZON_CONFIG.tag;

  if (asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
  }

  const encodedQuery = encodeURIComponent(query);
  return `https://www.amazon.com/s?k=${encodedQuery}&tag=${tag}`;
}

export function getAmazonButtonText(asin?: string | null): string {
  return asin ? "Buy on Amazon" : "Find on Amazon";
}
