"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { readJson } from "@/lib/api/json";
import {
  AdaptationErrorSchema,
  AdaptationSuccessSchema,
} from "@/lib/recipes/savedAdaptationSchemas";
import type { JSX } from "react";
import type { z } from "zod";

type SaveResult = z.infer<typeof AdaptationSuccessSchema>;
class AdaptationRejected extends Error {}

async function submit(
  recipeId: string,
  requestId: string,
): Promise<SaveResult> {
  const response = await fetch(
    `/api/recipes/${encodeURIComponent(recipeId)}/adapt`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentSlug: "leonardo-da-vinci",
        mode: "vegetarian",
        clientRequestId: requestId,
      }),
    },
  );
  if (!response.ok) {
    let message = `Server rejected the request (HTTP ${response.status}).`;
    try {
      const failure = await readJson(response, {
        parse: AdaptationErrorSchema.parse,
      });
      message = failure.error;
    } catch {
      // An unreadable rejection is still a rejection, not a confirmed save.
    }
    throw new AdaptationRejected(message);
  }
  const result = await readJson(response, { parse: AdaptationSuccessSchema.parse });
  if (result.version.receipt.original.id !== recipeId)
    throw new Error("Save confirmation refers to a different source recipe.");
  return result;
}

interface VersionAction {
  busy: boolean;
  error: string | null;
  saved: SaveResult | null;
  save: () => Promise<void>;
}
function useVersionAction(recipeId: string): VersionAction {
  const pending = useRef<{ recipeId: string; requestId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ recipeId: string; message: string } | null>(null);
  const [saved, setSaved] = useState<SaveResult | null>(null);
  async function save(): Promise<void> {
    if (pending.current?.recipeId !== recipeId)
      pending.current = { recipeId, requestId: crypto.randomUUID() };
    const { requestId } = pending.current;
    setBusy(true);
    setError(null);
    try {
      setSaved(await submit(recipeId, requestId));
      if (pending.current.requestId === requestId) pending.current = null;
    } catch (error) {
      setError({ recipeId, message: error instanceof AdaptationRejected
          ? error.message
          : "Save confirmation is unavailable. Retry the same action to check for the saved version." });
    } finally {
      setBusy(false);
    }
  }
  return { busy, error: error?.recipeId === recipeId ? error.message : null, saved, save };
}

function SavedStatus({ result }: { result: SaveResult }): JSX.Element {
  const message =
    result.publication === "published"
      ? "Adapted action published to the feed"
      : result.publication === "unknown"
        ? "Feed publication could not be confirmed"
        : "Saved; not published to the feed";
  return (
    <p role="status" className="text-xs text-white/80">
      <Link
        href={`/recipes/versions/${result.version.id}`}
        className="underline"
      >
        View saved version
      </Link>{" "}
      · {message}
    </p>
  );
}

export function SavedAdaptationButton({
  recipeId,
}: {
  recipeId: string;
}): JSX.Element {
  const { busy, error, saved, save } = useVersionAction(recipeId);
  return (
    <div className="space-y-2 border-t border-purple-500/20 pt-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          save().catch(() => {});
        }}
        className="rounded-lg border border-purple-400/30 px-3 py-2 text-xs text-purple-100 disabled:opacity-50"
      >
        {busy
          ? "Creating a saved version…"
          : "Make Leonardo’s vegetarian version"}
      </button>
      <p className="text-[11px] text-white/50">
        Uses his saved chart and food preferences. A concrete edited recipe must
        pass text screening before it can be saved.
      </p>
      {error && (
        <p role="alert" className="text-xs text-amber-200">
          {error}
        </p>
      )}
      {saved?.version.receipt.original.id === recipeId && (
        <SavedStatus result={saved} />
      )}
    </div>
  );
}
