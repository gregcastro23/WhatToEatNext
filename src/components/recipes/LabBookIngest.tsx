"use client";

/**
 * Lab Book — recipe ingestion UI.
 *
 * Paste text or upload photo(s) → POST /api/recipes/extract (token-gated,
 * GPT-4o) → preview/edit the extracted + alchemized recipe(s) → save to the
 * personal cookbook (POST /api/users/me/recipes/custom, source "scan").
 * Saved recipes (all of the user's custom recipes) list below with delete.
 */
import { useCallback, useEffect, useState } from "react";

interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

interface AlchemizedRecipe {
  name: string;
  description?: string;
  cuisine?: string;
  yield?: string;
  categories: string[];
  ingredients: string[];
  instructions: string[];
  elementalProperties: ElementalProperties;
  elementalMatchRate: number;
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  aSharp: number;
  alchemicalMatchRate: number;
  source: string;
}

interface SavedRecipe {
  id: string;
  name: string;
  cuisine?: string;
  source?: string;
  createdAt: number;
}

type Mode = "text" | "photo";

const ELEMENT_COLOR: Record<keyof ElementalProperties, string> = {
  Fire: "text-rose-300",
  Water: "text-sky-300",
  Earth: "text-amber-300",
  Air: "text-violet-300",
};

const pct = (n: number) => `${Math.round((n || 0) * 100)}%`;

export default function LabBookIngest() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [previews, setPreviews] = useState<AlchemizedRecipe[]>([]);
  const [saved, setSaved] = useState<SavedRecipe[]>([]);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me/recipes/custom", {
        credentials: "same-origin",
      });
      const data = await res.json();
      if (data?.authenticated && Array.isArray(data.recipes)) {
        setSaved(data.recipes as SavedRecipe[]);
      }
    } catch {
      /* non-fatal — the saved list just stays empty */
    }
  }, []);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const handleExtract = useCallback(async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      let res: Response;
      if (mode === "photo") {
        if (files.length === 0) {
          setError("Choose at least one photo first.");
          return;
        }
        const fd = new FormData();
        for (const f of files) fd.append("images", f);
        res = await fetch("/api/recipes/extract", {
          method: "POST",
          body: fd,
          credentials: "same-origin",
        });
      } else {
        if (!text.trim()) {
          setError("Paste a recipe first.");
          return;
        }
        res = await fetch("/api/recipes/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          credentials: "same-origin",
        });
      }

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setError("Please sign in to ingest recipes.");
        return;
      }
      if (res.status === 402) {
        setError(data?.error ?? "Insufficient Essence tokens.");
        return;
      }
      if (!res.ok || data?.success === false) {
        setError(data?.error ?? "Extraction failed. Please try again.");
        return;
      }

      const recipes = (data?.recipes ?? []) as AlchemizedRecipe[];
      setPreviews(recipes);
      if (recipes.length === 0) {
        setNotice(data?.message ?? "No recipe detected in that input.");
      }
    } catch {
      setError("Something went wrong reaching the extractor.");
    } finally {
      setLoading(false);
    }
  }, [mode, files, text]);

  const updatePreviewName = (idx: number, name: string) => {
    setPreviews((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, name } : r)),
    );
  };

  const handleSave = useCallback(
    async (idx: number) => {
      const recipe = previews[idx];
      if (!recipe) return;
      setSavingIdx(idx);
      setError(null);
      try {
        const res = await fetch("/api/users/me/recipes/custom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            name: recipe.name,
            cuisine: recipe.cuisine,
            source: "scan",
            payload: recipe,
          }),
        });
        if (res.status === 401) {
          setError("Please sign in to save recipes.");
          return;
        }
        if (!res.ok) {
          setError("Failed to save recipe.");
          return;
        }
        const data = (await res.json().catch(() => ({}))) as {
          completedQuests?: Array<{
            questSlug: string;
            tokensAwarded: number;
            tokenType: string;
          }>;
        };
        setPreviews((prev) => prev.filter((_, i) => i !== idx));
        const completed = data.completedQuests ?? [];
        if (completed.length > 0) {
          const totals = completed
            .map(
              (q) =>
                `${q.tokensAwarded} ${q.tokenType === "all" ? "ESMS" : q.tokenType}`,
            )
            .join(" + ");
          setNotice(
            `Saved "${recipe.name}". 🏆 Milestone reached — claim ${totals} in Quests!`,
          );
        } else {
          setNotice(`Saved "${recipe.name}" to your Lab Book.`);
        }
        await loadSaved();
      } catch {
        setError("Failed to save recipe.");
      } finally {
        setSavingIdx(null);
      }
    },
    [previews, loadSaved],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/users/me/recipes/custom?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
        await loadSaved();
      } catch {
        setError("Failed to delete recipe.");
      }
    },
    [loadSaved],
  );

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* ── Input card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 inline-flex rounded-lg border border-white/10 p-0.5">
          {(["text", "photo"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-purple-600 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {m === "text" ? "Paste text" : "Upload photo"}
            </button>
          ))}
        </div>

        {mode === "text" ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Paste a recipe — title, ingredients, and steps…"
            className="w-full resize-y rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white/90 placeholder-white/30 focus:border-purple-500 focus:outline-none"
          />
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-white/70 file:mr-3 file:rounded-md file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-purple-500"
            />
            {files.length > 0 && (
              <p className="mt-2 text-xs text-white/50">
                {files.length} photo{files.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleExtract()}
          disabled={loading}
          className="mt-4 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Extracting…" : "Extract recipe"}
        </button>
        <span className="ml-3 text-xs text-white/40">Costs Essence (🜔)</span>
        <p className="mt-3 text-xs text-white/40">
          Building your Lab Book earns ESMS — milestones at 1, 5, 25 &amp; 100
          recipes (track them in Quests).
        </p>

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        {notice && <p className="mt-3 text-sm text-emerald-300">{notice}</p>}
      </div>

      {/* ── Previews ──────────────────────────────────────────── */}
      {previews.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
            Review &amp; save
          </h2>
          {previews.map((r, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-purple-500/20 bg-white/[0.03] p-5"
            >
              <input
                value={r.name}
                onChange={(e) => updatePreviewName(idx, e.target.value)}
                className="w-full border-b border-white/10 bg-transparent pb-1 text-lg font-semibold text-white focus:border-purple-500 focus:outline-none"
              />
              {(r.yield || r.categories?.length > 0) && (
                <p className="mt-1 text-xs text-white/40">
                  {r.yield ? `Yield: ${r.yield}` : ""}
                  {r.yield && r.categories?.length > 0 ? " · " : ""}
                  {r.categories?.join(", ")}
                </p>
              )}

              {/* alchemical badges */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {(Object.keys(r.elementalProperties) as Array<keyof ElementalProperties>).map(
                  (el) => (
                    <span key={el} className={ELEMENT_COLOR[el]}>
                      {el} {pct(r.elementalProperties[el])}
                    </span>
                  ),
                )}
                <span className="text-white/50">
                  ESMS {r.spirit}/{r.essence}/{r.matter}/{r.substance} (A# {r.aSharp})
                </span>
                <span className="text-white/30">
                  {pct(r.alchemicalMatchRate)} matched
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Ingredients
                  </h3>
                  <ul className="space-y-0.5 text-sm text-white/80">
                    {r.ingredients.map((ing, i) => (
                      <li key={i}>• {ing}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Instructions
                  </h3>
                  <ol className="list-inside list-decimal space-y-0.5 text-sm text-white/80">
                    {r.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSave(idx)}
                  disabled={savingIdx === idx}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {savingIdx === idx ? "Saving…" : "Save to Lab Book"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreviews((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="text-sm text-white/40 hover:text-white/70"
                >
                  Discard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Saved cookbook ────────────────────────────────────── */}
      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
          Your Lab Book ({saved.length})
        </h2>
        {saved.length === 0 ? (
          <p className="text-sm text-white/30">
            Nothing saved yet — extract a recipe above to start your cookbook.
          </p>
        ) : (
          <ul className="divide-y divide-white/5 rounded-2xl border border-white/10">
            {saved.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/90">
                    {r.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {r.source ?? "custom"}
                    {r.cuisine ? ` · ${r.cuisine}` : ""} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(r.id)}
                  className="shrink-0 text-xs text-white/30 hover:text-rose-300"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
