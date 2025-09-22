import type { AgentRecommendation, RuneAgentInput, RuneAgentResult, RuneResult } from '@/services/RuneAgentClient';
import { runeAgentClient } from '@/services/RuneAgentClient';
import { useCallback, useMemo, useState } from 'react';

export function useRuneAgent(initial?: RuneAgentInput) {
  const [result, setResult] = useState<RuneAgentResult | null>(null)
  const [rune, setRune] = useState<RuneResult | null>(null)
  const [agent, setAgent] = useState<AgentRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateComplete = useCallback(async (input?: RuneAgentInput) => {
    setLoading(true)
    setError(null)
    try {
      const payload: RuneAgentInput = {
        datetime: input?.datetime ?? initial?.datetime,
        location: input?.location ?? initial?.location,
        context: input?.context ?? initial?.context,
        preferences: input?.preferences ?? initial?.preferences,
      };
      const data = await runeAgentClient.generateComplete(payload)
      setResult(data)
      setRune(data.rune)
      setAgent(data.agent)
      setLoading(false)
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err;
    }
  }, [initial?.datetime, initial?.location, initial?.context, initial?.preferences])

  const generateRuneOnly = useCallback(async (input?: RuneAgentInput) => {
    setLoading(true)
    setError(null)
    try {
      const payload: RuneAgentInput = {
        datetime: input?.datetime ?? initial?.datetime,
        location: input?.location ?? initial?.location,
        context: input?.context ?? initial?.context,
        preferences: input?.preferences ?? initial?.preferences,
      };
      const data = await runeAgentClient.generateRuneOfMoment(payload)
      setRune(data)
      setLoading(false)
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err;
    }
  }, [initial?.datetime, initial?.location, initial?.context, initial?.preferences])

  const generateAgentOnly = useCallback(async (input?: RuneAgentInput) => {
    setLoading(true)
    setError(null)
    try {
      const payload: RuneAgentInput = {
        datetime: input?.datetime ?? initial?.datetime,
        location: input?.location ?? initial?.location,
        context: input?.context ?? initial?.context,
        preferences: input?.preferences ?? initial?.preferences,
      };
      const data = await runeAgentClient.generateAgentRecommendations(payload)
      setAgent(data)
      setLoading(false)
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err;
    }
  }, [initial?.datetime, initial?.location, initial?.context, initial?.preferences])

  return useMemo(() => ({
    result,
    rune,
    agent,
    loading,
    error,
    generateComplete,
    generateRuneOnly,
    generateAgentOnly
  }), [result, rune, agent, loading, error, generateComplete, generateRuneOnly, generateAgentOnly])
}

export default useRuneAgent;
