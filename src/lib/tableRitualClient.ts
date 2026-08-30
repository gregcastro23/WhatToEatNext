import { isTableRitualResponse } from "@/types";
import type { TableRitualResponse } from "@/types";

/** Preserve the invite-link fallback semantics while clamping hostile values. */
export function parseTablePercentage(value: string | null | undefined): number {
  const parsed = Number(value);
  const withFallback = parsed === 0 || Number.isNaN(parsed) ? 25 : parsed;
  return Math.max(0, Math.min(100, withFallback));
}

/** Read and validate the shared adept/premium table response boundary. */
export async function readTableRitualResponse(
  response: Response,
): Promise<TableRitualResponse> {
  const data: unknown = await response.json();
  if (!isTableRitualResponse(data)) {
    throw new Error("Table response did not match the expected contract");
  }
  return data;
}
