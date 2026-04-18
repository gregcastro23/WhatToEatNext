// TODO(phase 5.5): wire to /api/users/me/recipes when auth-gated endpoint exists.
// This component is a pure UX shell backed by localStorage; no user identity, no moderation.
"use client";

import React, { useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "alchm:recipe-social:v1:";

interface LocalSocialState {
  madeIt: boolean;
  rating: number;           // 0–5
  review: string;
  photoDataUrl?: string;    // base64 preview only
}

const DEFAULT: LocalSocialState = { madeIt: false, rating: 0, review: "" };

function readState(recipeId: string): LocalSocialState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + recipeId);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) as Partial<LocalSocialState> } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function writeState(recipeId: string, state: LocalSocialState) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + recipeId, JSON.stringify(state));
  } catch (err) {
    console.warn("social state write failed:", err);
  }
}

// Mock community tips — read-only. Replace with API data once the backend lands.
const MOCK_COMMUNITY_TIPS: Array<{ author: string; tip: string; hearts: number }> = [
  { author: "Kira T.", tip: "Browned the butter instead of just melting it — huge upgrade on the nuttiness.", hearts: 42 },
  { author: "Marcus L.", tip: "If you chill the dough an extra 20 min it holds shape way better in the pan.", hearts: 28 },
  { author: "Dana R.", tip: "Swapped half the salt for miso paste. Ten out of ten.", hearts: 17 },
];

interface Props {
  recipeId: string;
}

export function SocialSection({ recipeId }: Props) {
  const [state, setState] = useState<LocalSocialState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readState(recipeId));
    setHydrated(true);
  }, [recipeId]);

  const update = (partial: Partial<LocalSocialState>) => {
    setState((curr) => {
      const next = { ...curr, ...partial };
      writeState(recipeId, next);
      return next;
    });
  };

  // Local-only "made this" count — starts from a mock base + user's own +1 if toggled.
  const mockBase = useMemo(() => 34 + ((recipeId.charCodeAt(0) ?? 0) % 60), [recipeId]);
  const madeCount = mockBase + (state.madeIt ? 1 : 0);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      update({ photoDataUrl: typeof reader.result === "string" ? reader.result : undefined });
    };
    reader.readAsDataURL(file);
  };

  if (!hydrated) {
    return (
      <div className="glass-card-premium rounded-2xl border border-white/8 p-6">
        <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="glass-card-premium rounded-2xl border border-white/8 p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 flex items-center gap-2">
            <span className="not-italic text-xl">{"\u{1F465}"}</span>
            Community
          </h2>
          <p className="text-xs text-white/60 mt-1">
            <span className="text-amber-300 font-semibold">{madeCount}</span> cooks have made this recipe
          </p>
        </div>
        <button
          type="button"
          onClick={() => update({ madeIt: !state.madeIt })}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
            state.madeIt
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20"
          }`}
        >
          {state.madeIt ? "\u2713 You made this" : "I made this!"}
        </button>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Your rating</h3>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= state.rating;
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={state.rating === star}
                onClick={() => update({ rating: state.rating === star ? 0 : star })}
                className={`text-2xl transition-transform hover:scale-110 ${filled ? "text-amber-400" : "text-white/20 hover:text-amber-500/60"}`}
              >
                {"\u2605"}
              </button>
            );
          })}
          {state.rating > 0 && (
            <span className="ml-2 text-xs text-white/50">{state.rating}/5</span>
          )}
        </div>
      </div>

      {/* Review */}
      <div>
        <label htmlFor="review" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Short review</label>
        <textarea
          id="review"
          value={state.review}
          onChange={(e) => update({ review: e.target.value.slice(0, 500) })}
          placeholder="How did it turn out? (stored locally for now)"
          rows={3}
          className="w-full glass-card-premium border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 resize-none"
        />
        <p className="text-xs text-white/40 mt-1 text-right">{state.review.length}/500</p>
      </div>

      {/* Photo */}
      <div>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Your photo</h3>
        {state.photoDataUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.photoDataUrl} alt="Your upload" className="rounded-lg max-h-48 border border-white/10" />
            <button
              type="button"
              onClick={() => update({ photoDataUrl: undefined })}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white/80 hover:text-rose-300 text-xs"
              aria-label="Remove photo"
            >
              &#x2715;
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 border border-dashed border-white/15 text-sm text-white/60 hover:text-amber-200 hover:border-amber-500/40 cursor-pointer transition-colors">
            <span className="text-lg">{"\u{1F4F7}"}</span>
            Add a photo
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        )}
        <p className="text-xs text-white/40 mt-1 italic">Preview only — uploads coming soon.</p>
      </div>

      {/* Community tips (mock) */}
      <div>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Community Tips</h3>
        <ul className="space-y-2">
          {MOCK_COMMUNITY_TIPS.map((t, i) => (
            <li key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-amber-300">{t.author}</span>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <span className="text-rose-400">{"\u2665"}</span> {t.hearts}
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{t.tip}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/40 mt-2 italic">Mock data — real community feed coming soon.</p>
      </div>
    </div>
  );
}
