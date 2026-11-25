"use client";

/**
 * One AI recipe at a time from the homepage bar: never automatic, a request
 * lock, a 90 s timeout, and one idempotency key per distinct request so a
 * retry after an uncertain failure replays instead of charging again.
 */
import { useRef, useState } from "react";
import { z } from "zod";
import { readJson, safeReadJson } from "@/lib/api/json";
import { requestSignature, type PantryRecipeRequest } from "@/lib/recipe-builder/pantryRecipeRequest";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";

const TIMEOUT_MS = 90_000;

const ResultSchema = cosmicRecipeSchema.extend({
  payment: z
    .object({ charged: z.boolean() })
    .passthrough()
    .optional(),
  demoRemaining: z.number().optional(),
});

export type AiRecipe = z.infer<typeof ResultSchema>;

const ErrorSchema = z.object({ message: z.string().optional(), error: z.string().optional() });

export interface AiFailure {
  message: string;
  signIn: boolean;
}

export function failureFor(status: number, body: z.infer<typeof ErrorSchema> | null): AiFailure {
  const said = body?.message ?? null;
  if (status === 401) return { message: "Today's free AI recipes are used up. Sign in to create more.", signIn: true };
  if (status === 402) return { message: said ?? "You need more ESMS tokens for another AI recipe.", signIn: false };
  if (status === 409) return { message: said ?? "That request is already running. Wait a moment, then retry.", signIn: false };
  if (status === 429) return { message: "Too many requests. Wait a minute, then retry.", signIn: false };
  return { message: said ?? "The recipe service did not answer. Retrying is safe.", signIn: false };
}

export interface AiRecipeState {
  recipe: AiRecipe | null;
  loading: boolean;
  failure: AiFailure | null;
  create: (request: PantryRecipeRequest) => void;
}

async function post(request: PantryRecipeRequest, idempotencyKey: string): Promise<AiRecipe | AiFailure> {
  const response = await fetch("/api/generate-cosmic-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...request, idempotencyKey }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) return failureFor(response.status, await safeReadJson(response, null, ErrorSchema.parse));
  return readJson(response, (value) => ResultSchema.parse(value));
}

function isFailure(value: AiRecipe | AiFailure): value is AiFailure {
  return "signIn" in value;
}

export function useAiRecipe(): AiRecipeState {
  const [recipe, setRecipe] = useState<AiRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<AiFailure | null>(null);
  const busy = useRef(false);
  const key = useRef<{ signature: string; value: string } | null>(null);
  const create = (request: PantryRecipeRequest): void => {
    if (busy.current) return;
    busy.current = true;
    const signature = requestSignature(request);
    if (key.current?.signature !== signature) key.current = { signature, value: `home-${crypto.randomUUID()}` };
    setLoading(true);
    setFailure(null);
    post(request, key.current.value)
      .then((result) => {
        if (isFailure(result)) {
          setFailure(result);
        } else {
          key.current = null;
          setRecipe(result);
        }
      })
      .catch(() => setFailure({ message: "The recipe service did not answer in time. Retrying is safe.", signIn: false }))
      .finally(() => {
        busy.current = false;
        setLoading(false);
      });
  };
  return { recipe, loading, failure, create };
}
