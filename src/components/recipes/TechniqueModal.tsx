"use client";

import React, { useEffect, useState, useCallback } from "react";

interface TechniqueData {
  name?: string;
  description?: string;
  shortDescription?: string;
  culinaryArchetype?: string;
  elementalEffect?: { Fire?: number; Water?: number; Earth?: number; Air?: number };
  duration?: { min?: number; max?: number };
  suitable_for?: string[];
  benefits?: string[];
  toolsRequired?: string[];
  commonMistakes?: string[];
  pairingSuggestions?: string[];
  chemicalChanges?: Record<string, boolean>;
  optimalTemperatures?: Record<string, number>;
  nutrientRetention?: Record<string, number>;
  history?: string;
  modernVariations?: string[];
  scientificPrinciples?: string[];
  expertTips?: string[];
  doneness_indicators?: Record<string, string>;
  timingConsiderations?: Record<string, string>;
  astrologicalInfluences?: {
    dominantPlanets?: string[];
    favorableZodiac?: string[];
  };
}

interface ApiResponse {
  success: boolean;
  technique?: TechniqueData;
  canonicalKey?: string;
  error?: string;
}

interface TechniqueModalProps {
  techniqueName: string | null;
  onClose: () => void;
}

const ELEMENT_COLORS: Record<string, { bar: string; text: string; icon: string }> = {
  Fire:  { bar: "bg-red-500",  text: "text-red-400",  icon: "\u{1F525}" },
  Water: { bar: "bg-blue-500", text: "text-blue-400", icon: "\u{1F4A7}" },
  Earth: { bar: "bg-amber-600", text: "text-amber-400", icon: "\u{1F30D}" },
  Air:   { bar: "bg-sky-400",  text: "text-sky-400",   icon: "\u{1F4A8}" },
};

function formatDuration(d?: { min?: number; max?: number }): string {
  if (!d || d.min == null || d.max == null) return "";
  const fmt = (m: number) => {
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  };
  if (d.min === d.max) return fmt(d.min);
  return `${fmt(d.min)} – ${fmt(d.max)}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-4 border-b border-white/5 last:border-b-0">
      <h3 className="text-[11px] uppercase tracking-[0.14em] text-white/50 font-semibold mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function TechniqueModal({ techniqueName, onClose }: TechniqueModalProps) {
  const open = Boolean(techniqueName);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!techniqueName) {
      setData(null);
      return;
    }
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/techniques/${encodeURIComponent(techniqueName)}`,
          { signal: controller.signal },
        );
        const json = (await res.json()) as ApiResponse;
        if (!res.ok || !json.success) {
          setError(json.error || "Technique not found");
          setData(null);
          return;
        }
        setData(json);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setError("Couldn't load technique details");
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
    return () => controller.abort();
  }, [techniqueName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  const t = data?.technique;
  const displayName = t?.name ?? techniqueName ?? "Technique";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${displayName} technique details`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a12] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a0a12]/90 border-b border-white/10">
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-amber-400/70 font-bold">
                  Technique
                </span>
                {t?.culinaryArchetype && (
                  <span className="text-[10px] text-white/40 italic">
                    • {t.culinaryArchetype}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 capitalize leading-tight">
                {displayName}
              </h2>
              {t?.shortDescription && (
                <p className="text-sm text-white/60 mt-1.5 italic">{t.shortDescription}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-sm text-white/40">Loading technique…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-white/50">{error}</p>
          </div>
        )}

        {!isLoading && !error && t && (
          <div className="pb-4">
            {t.description && (
              <Section title="Overview">
                <p className="text-sm text-white/75 leading-relaxed">{t.description}</p>
                {t.duration && (
                  <p className="text-xs text-white/40 mt-3">
                    Typical duration:{" "}
                    <span className="text-amber-300 font-medium">
                      {formatDuration(t.duration)}
                    </span>
                  </p>
                )}
              </Section>
            )}

            {t.elementalEffect && (
              <Section title="Elemental Signature">
                <div className="space-y-2">
                  {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
                    const v = t.elementalEffect?.[el] ?? 0;
                    const cfg = ELEMENT_COLORS[el];
                    const pct = Math.round(Math.min(100, Math.max(0, v * 100)));
                    return (
                      <div key={el} className="flex items-center gap-3">
                        <span className="w-5 text-center text-base">{cfg.icon}</span>
                        <span className={`w-14 text-xs font-medium ${cfg.text}`}>{el}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cfg.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs text-white/50 tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {t.scientificPrinciples && t.scientificPrinciples.length > 0 && (
              <Section title="Science">
                <ul className="space-y-1.5">
                  {t.scientificPrinciples.map((p, i) => (
                    <li key={i} className="text-sm text-white/70 flex gap-2">
                      <span className="text-blue-400 shrink-0">◆</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {t.benefits && t.benefits.length > 0 && (
              <Section title="Benefits">
                <ul className="space-y-1.5">
                  {t.benefits.map((b, i) => (
                    <li key={i} className="text-sm text-white/70 flex gap-2">
                      <span className="text-emerald-400 shrink-0">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {t.optimalTemperatures && Object.keys(t.optimalTemperatures).length > 0 && (
              <Section title="Optimal Temperatures">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(t.optimalTemperatures).map(([k, v]) => (
                    <div
                      key={k}
                      className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <div className="text-xs text-white/50 capitalize">{k.replace(/_/g, " ")}</div>
                      <div className="text-base font-bold text-amber-300 tabular-nums">
                        {v}°F
                        <span className="text-xs text-white/40 ml-1">
                          / {Math.round(((v - 32) * 5) / 9)}°C
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {t.doneness_indicators && Object.keys(t.doneness_indicators).length > 0 && (
              <Section title="Doneness Indicators">
                <dl className="space-y-2">
                  {Object.entries(t.doneness_indicators).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-white/50 capitalize font-semibold">
                        {k.replace(/_/g, " ")}
                      </dt>
                      <dd className="text-sm text-white/70 mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}

            {t.commonMistakes && t.commonMistakes.length > 0 && (
              <Section title="Common Mistakes to Avoid">
                <ul className="space-y-1.5">
                  {t.commonMistakes.slice(0, 8).map((m, i) => (
                    <li key={i} className="text-sm text-white/70 flex gap-2">
                      <span className="text-red-400 shrink-0">⚠</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {t.expertTips && t.expertTips.length > 0 && (
              <Section title="Expert Tips">
                <ul className="space-y-1.5">
                  {t.expertTips.slice(0, 8).map((tip, i) => (
                    <li key={i} className="text-sm text-white/70 flex gap-2">
                      <span className="text-amber-400 shrink-0">★</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {t.toolsRequired && t.toolsRequired.length > 0 && (
              <Section title="Tools & Equipment">
                <div className="flex flex-wrap gap-1.5">
                  {t.toolsRequired.slice(0, 12).map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {t.suitable_for && t.suitable_for.length > 0 && (
              <Section title="Best For">
                <div className="flex flex-wrap gap-1.5">
                  {t.suitable_for.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 capitalize"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
