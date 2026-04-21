"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// ===== Known technique verbs → canonical form =====
// Keep this list broad; the API resolves to cookingMethod data.
const TECHNIQUE_TERMS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /\b(roast(?:ed|ing)?)\b/i, canonical: "roasting" },
  { pattern: /\b(bak(?:e|ed|ing))\b/i, canonical: "roasting" },
  { pattern: /\b(saut(?:e|é|ed|éed|ing|éing))\b/i, canonical: "stir-frying" },
  { pattern: /\b(sear(?:ed|ing)?)\b/i, canonical: "stir-frying" },
  { pattern: /\b(stir[- ]?fry(?:ing|ed)?|stir[- ]?fried)\b/i, canonical: "stir-frying" },
  { pattern: /\b(fry(?:ing)?|fried|deep[- ]?fry(?:ing)?)\b/i, canonical: "frying" },
  { pattern: /\b(grill(?:ed|ing)?)\b/i, canonical: "grilling" },
  { pattern: /\b(broil(?:ed|ing)?)\b/i, canonical: "broiling" },
  { pattern: /\b(boil(?:ed|ing)?)\b/i, canonical: "boiling" },
  { pattern: /\b(simmer(?:ed|ing)?)\b/i, canonical: "simmering" },
  { pattern: /\b(poach(?:ed|ing)?)\b/i, canonical: "poaching" },
  { pattern: /\b(steam(?:ed|ing)?)\b/i, canonical: "steaming" },
  { pattern: /\b(brais(?:e|ed|ing))\b/i, canonical: "braising" },
  { pattern: /\b(stew(?:ed|ing)?)\b/i, canonical: "stewing" },
  { pattern: /\b(sous[- ]?vide)\b/i, canonical: "sous-vide" },
  { pattern: /\b(pressure[- ]?cook(?:ed|ing)?)\b/i, canonical: "pressure-cooking" },
  { pattern: /\b(ferment(?:ed|ing)?)\b/i, canonical: "fermentation" },
  { pattern: /\b(pickl(?:e|ed|ing))\b/i, canonical: "pickling" },
  { pattern: /\b(cur(?:e|ed|ing))\b/i, canonical: "curing" },
  { pattern: /\b(smok(?:e|ed|ing))\b/i, canonical: "smoking" },
  { pattern: /\b(dehydrat(?:e|ed|ing))\b/i, canonical: "dehydrating" },
  { pattern: /\b(marinat(?:e|ed|ing))\b/i, canonical: "marinating" },
  { pattern: /\b(infus(?:e|ed|ing))\b/i, canonical: "infusing" },
];

// Time phrase: "15 minutes", "1 hour", "30-45 seconds", "2 hours 30 minutes"
const TIME_RE =
  /\b(\d+(?:\.\d+)?)(?:\s*(?:-|to|–)\s*(\d+(?:\.\d+)?))?\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/gi;

// Temperature phrase: "350°F", "180°C", "350 degrees", "350 F"
const TEMP_RE = /\b(\d{2,3})\s*(?:°|degrees?)\s*(F|C|Fahrenheit|Celsius)?\b/gi;

// ===== Token types =====

interface TextToken { type: "text"; value: string; }
interface TechniqueToken { type: "technique"; value: string; canonical: string; }
interface TimeToken { type: "time"; value: string; seconds: number; label: string; }
interface TempToken { type: "temp"; value: string; f?: number; c?: number; }

type Token = TextToken | TechniqueToken | TimeToken | TempToken;

interface Match {
  start: number;
  end: number;
  token: Token;
}

function unitToSeconds(qty: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u.startsWith("h")) return Math.round(qty * 3600);
  if (u.startsWith("min")) return Math.round(qty * 60);
  return Math.round(qty);
}

function buildMatches(text: string): Match[] {
  const matches: Match[] = [];

  // Techniques
  for (const { pattern, canonical } of TECHNIQUE_TERMS) {
    const g = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags  }g`);
    let m: RegExpExecArray | null;
    while ((m = g.exec(text)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        token: { type: "technique", value: m[0], canonical },
      });
      if (m[0].length === 0) g.lastIndex++;
    }
  }

  // Times
  {
    const g = new RegExp(TIME_RE.source, TIME_RE.flags);
    let m: RegExpExecArray | null;
    while ((m = g.exec(text)) !== null) {
      const qty1 = parseFloat(m[1]);
      const qty2 = m[2] ? parseFloat(m[2]) : undefined;
      const unit = m[3];
      // Use the upper bound if range, else single quantity
      const qty = qty2 ?? qty1;
      const seconds = unitToSeconds(qty, unit);
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        token: {
          type: "time",
          value: m[0],
          seconds,
          label: qty2 ? `${qty2} ${unit}` : `${qty1} ${unit}`,
        },
      });
    }
  }

  // Temperatures
  {
    const g = new RegExp(TEMP_RE.source, TEMP_RE.flags);
    let m: RegExpExecArray | null;
    while ((m = g.exec(text)) !== null) {
      const v = parseInt(m[1], 10);
      const unit = m[2]?.toUpperCase().startsWith("C") ? "C" : "F";
      const f = unit === "F" ? v : Math.round((v * 9) / 5 + 32);
      const c = unit === "C" ? v : Math.round(((v - 32) * 5) / 9);
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        token: { type: "temp", value: m[0], f, c },
      });
    }
  }

  // Resolve overlaps: sort by start, drop overlapping later matches
  matches.sort((a, b) => (a.start - b.start) || (b.end - b.start) - (a.end - a.start));
  const resolved: Match[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    resolved.push(m);
    cursor = m.end;
  }
  return resolved;
}

function tokenize(text: string): Token[] {
  const matches = buildMatches(text);
  if (matches.length === 0) return [{ type: "text", value: text }];
  const out: Token[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) {
      out.push({ type: "text", value: text.slice(cursor, m.start) });
    }
    out.push(m.token);
    cursor = m.end;
  }
  if (cursor < text.length) out.push({ type: "text", value: text.slice(cursor) });
  return out;
}

// ===== Inline Timer =====

function formatSeconds(s: number): string {
  if (s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function InlineTimer({ totalSeconds, label }: { totalSeconds: number; label: string }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setDone(true);
          // Audible beep using WebAudio (best-effort)
          try {
            const Ctor = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
              ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (Ctor) {
              const ctx = new Ctor();
              const o = ctx.createOscillator();
              const gain = ctx.createGain();
              o.connect(gain);
              gain.connect(ctx.destination);
              o.frequency.value = 880;
              gain.gain.setValueAtTime(0.2, ctx.currentTime);
              o.start();
              o.stop(ctx.currentTime + 0.4);
            }
          } catch {
            // ignore audio failures
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setDone(false);
    setRemaining(totalSeconds);
  };

  if (!running && remaining === totalSeconds && !done) {
    return (
      <button
        type="button"
        onClick={() => setRunning(true)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors text-xs font-medium align-baseline"
        title={`Start ${label} timer`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        {label}
      </button>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium align-baseline tabular-nums ${
        done
          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
          : "bg-amber-500/15 border-amber-500/40 text-amber-200"
      }`}
    >
      <span className={done ? "" : "animate-pulse"}>
        {done ? "✓ Done!" : formatSeconds(remaining)}
      </span>
      {!done && (
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="text-amber-300/70 hover:text-amber-200"
          aria-label={running ? "Pause" : "Resume"}
        >
          {running ? "⏸" : "▶"}
        </button>
      )}
      <button
        type="button"
        onClick={reset}
        className="text-white/50 hover:text-white"
        aria-label="Reset timer"
        title="Reset"
      >
        ↺
      </button>
    </span>
  );
}

// ===== Main interactive renderer =====

interface InteractiveInstructionProps {
  text: string;
  onTechniqueClick: (canonical: string) => void;
}

export function InteractiveInstruction({ text, onTechniqueClick }: InteractiveInstructionProps) {
  const tokens = useMemo(() => tokenize(text), [text]);

  return (
    <span className="leading-relaxed">
      {tokens.map((t, i) => {
        if (t.type === "text") return <React.Fragment key={i}>{t.value}</React.Fragment>;
        if (t.type === "technique") {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTechniqueClick(t.canonical)}
              className="inline px-1 -mx-0.5 rounded text-orange-300 hover:text-orange-200 hover:bg-orange-500/10 underline decoration-dotted decoration-orange-400/50 hover:decoration-orange-300 underline-offset-4 transition-colors cursor-pointer"
              title={`Learn about ${t.canonical}`}
            >
              {t.value}
            </button>
          );
        }
        if (t.type === "time") {
          return (
            <React.Fragment key={i}>
              <span className="text-white/80">{t.value}</span>
              {" "}
              <InlineTimer totalSeconds={t.seconds} label={t.label} />
            </React.Fragment>
          );
        }
        if (t.type === "temp") {
          const alt = t.f != null && t.c != null ? `${t.f}°F / ${t.c}°C` : t.value;
          return (
            <span
              key={i}
              className="text-sky-300 border-b border-dotted border-sky-500/40 cursor-help"
              title={alt}
            >
              {t.value}
            </span>
          );
        }
        return null;
      })}
    </span>
  );
}
