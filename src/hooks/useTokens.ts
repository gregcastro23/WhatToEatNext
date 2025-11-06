import { useCallback, useMemo, useState } from "react";
import type {
  TokenRatesInput,
  TokenRatesResult,
} from "@/services/TokensClient";
import { tokensClient } from "@/services/TokensClient";

export function useTokens(initial?: TokenRatesInput) {
  const [result, setResult] = useState<TokenRatesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRates = useCallback(
    async (input?: TokenRatesInput) => {
      setLoading(true);
      setError(null);
      try {
        const payload: TokenRatesInput = {
          datetime: input?.datetime ?? initial?.datetime,
          location: input?.location ?? initial?.location,
          elemental: input?.elemental ?? initial?.elemental,
          esms: input?.esms ?? initial?.esms,
          planetaryPositions:
            input?.planetaryPositions ?? initial?.planetaryPositions,
        };
        const data = await tokensClient.calculateRates(payload);
        setResult(data);
        setLoading(false);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
        throw err;
      }
    },
    [
      initial?.datetime,
      initial?.location,
      initial?.elemental,
      initial?.esms,
      initial?.planetaryPositions,
    ],
  );

  return useMemo(
    () => ({ result, loading, error, calculateRates }),
    [result, loading, error, calculateRates],
  );
}

export default useTokens;
