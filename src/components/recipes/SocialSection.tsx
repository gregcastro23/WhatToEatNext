"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_PREFIX = "alchm:recipe-social:v1:";

interface LocalSocialState {
  madeIt: boolean;
  rating: number;           // 0–5
  review: string;
  photoDataUrl?: string;    // base64 preview only
}

interface CommunityTip {
  author: string;
  rating: number;
  tip: string;
  postedAt: string;
}

const DEFAULT: LocalSocialState = { madeIt: false, rating: 0, review: "" };

function readLocalState(recipeId: string): LocalSocialState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + recipeId);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) as Partial<LocalSocialState> } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function writeLocalState(recipeId: string, state: LocalSocialState) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + recipeId, JSON.stringify(state));
  } catch (err) {
    console.warn("social state write failed:", err);
  }
}

interface Props {
  recipeId: string;
}

export function SocialSection({ recipeId }: Props) {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  const [state, setState] = useState<LocalSocialState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [madeCount, setMadeCount] = useState<number>(0);
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [saving, setSaving] = useState(false);

  // Debounce review saves so each keystroke doesn't POST.
  const reviewDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load: pull remote state when authed; otherwise localStorage.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Always keep a local snapshot as instant fallback.
      const local = readLocalState(recipeId);
      if (!cancelled) setState(local);

      if (status === "loading") return;

      try {
        const res = await fetch(`/api/users/me/recipes/${encodeURIComponent(recipeId)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.authenticated) {
          const remote: LocalSocialState = {
            madeIt: !!data.madeIt,
            rating: typeof data.rating === "number" ? data.rating : 0,
            review: typeof data.review === "string" ? data.review : "",
            photoDataUrl: local.photoDataUrl,
          };
          setState(remote);
          writeLocalState(recipeId, remote);
        }
        if (typeof data.madeCount === "number") setMadeCount(data.madeCount);
      } catch (err) {
        console.warn("social load failed, using localStorage:", err);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [recipeId, status]);

  // Community tips
  useEffect(() => {
    let cancelled = false;
    async function loadTips() {
      try {
        const res = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}/community-tips`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.tips)) setTips(data.tips);
      } catch {
        // silent — community tips are non-critical
      }
    }
    void loadTips();
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  async function persistRemote(next: LocalSocialState) {
    if (!isAuthed) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/me/recipes/${encodeURIComponent(recipeId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          madeIt: next.madeIt,
          rating: next.rating,
          review: next.review,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      if (typeof data.madeCount === "number") setMadeCount(data.madeCount);
    } catch (err) {
      console.warn("social save failed (cached locally):", err);
    } finally {
      setSaving(false);
    }
  }

  const update = (partial: Partial<LocalSocialState>, opts?: { debounceRemote?: boolean }) => {
    setState((curr) => {
      const next = { ...curr, ...partial };
      writeLocalState(recipeId, next);

      if (isAuthed) {
        if (opts?.debounceRemote) {
          if (reviewDebounce.current) clearTimeout(reviewDebounce.current);
          reviewDebounce.current = setTimeout(() => {
            void persistRemote(next);
          }, 600);
        } else {
          void persistRemote(next);
        }
      }
      return next;
    });
  };

  // Optimistic made-count adjustment for unauthed users so they see +1 feedback.
  const displayedMadeCount = useMemo(() => {
    if (isAuthed) return madeCount;
    return madeCount + (state.madeIt ? 1 : 0);
  }, [isAuthed, madeCount, state.madeIt]);

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
            <span className="text-amber-300 font-semibold">{displayedMadeCount}</span>{" "}
            {displayedMadeCount === 1 ? "cook has" : "cooks have"} made this recipe
          </p>
        </div>
        <button
          type="button"
          onClick={() => update({ madeIt: !state.madeIt })}
          disabled={saving}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 ${
            state.madeIt
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20"
          }`}
        >
          {state.madeIt ? "\u2713 You made this" : "I made this!"}
        </button>
      </div>

      {!isAuthed && (
        <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/70">
          <Link href="/login" className="text-amber-300 hover:text-amber-200 font-semibold">
            Sign in
          </Link>{" "}
          to save your notes across devices. For now they live on this device only.
        </div>
      )}

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
          onChange={(e) => update({ review: e.target.value.slice(0, 500) }, { debounceRemote: true })}
          placeholder={isAuthed ? "How did it turn out?" : "How did it turn out? (stored locally)"}
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

      {/* Community tips — real feed from user_recipe_interactions */}
      <div>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Community Tips</h3>
        {tips.length === 0 ? (
          <p className="text-xs text-white/40 italic">
            No reviews yet. Be the first to rate 4+ stars and leave a note.
          </p>
        ) : (
          <ul className="space-y-2">
            {tips.map((t, i) => (
              <li key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-amber-300">{t.author}</span>
                  <span className="text-xs text-white/50 flex items-center gap-1">
                    <span className="text-amber-400">{"\u2605"}</span> {t.rating}/5
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{t.tip}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {session?.user?.email && (
        <p className="text-[11px] text-white/30">
          Signed in as {session.user.email}. Changes sync to your account.
        </p>
      )}
    </div>
  );
}
