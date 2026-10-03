/**
 * The Recipe Builder link that queues ingredients (omnibar Phase 4, "Cook
 * with this"). One module for the link and its reader, so the parameter name
 * cannot drift; kept free of the builder's ingredient data so the search
 * chunk can import it.
 */
export const PREFILL_PARAM = "ingredients";

export function cookHref(name: string): string {
  return `/recipe-builder?${PREFILL_PARAM}=${encodeURIComponent(name)}`;
}
