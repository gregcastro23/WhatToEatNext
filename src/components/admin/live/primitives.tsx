"use client";

/**
 * Building blocks for the live admin pages (Traffic, Growth, Revenue, Chain,
 * Code Health). Light theme, matching the rest of /admin.
 *
 * Status is never colour alone: every Pill carries a glyph and a word, and a
 * Stat with no value renders an em-dash plus the reason, never a 0.
 *
 * @file src/components/admin/live/primitives.tsx
 */

import Link from "next/link";
import React from "react";
import { fmtAgo } from "@/components/admin/live/format";

export type Tone = "ok" | "warn" | "bad" | "neutral" | "info";

const TONE_CLASS: Record<Tone, string> = {
  ok: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  bad: "bg-rose-50 text-rose-800 border-rose-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
  info: "bg-indigo-50 text-indigo-800 border-indigo-200",
};

const TONE_GLYPH: Record<Tone, string> = { ok: "✓", warn: "!", bad: "✕", neutral: "•", info: "i" };

export function Pill({ tone, children, title }: { tone: Tone; children: React.ReactNode; title?: string | undefined }): React.JSX.Element {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASS[tone]}`}
    >
      <span aria-hidden="true">{TONE_GLYPH[tone]}</span>
      {children}
    </span>
  );
}

interface PanelProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Panel({ title, subtitle, right, children, className = "" }: PanelProps): React.JSX.Element {
  return (
    <section className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <header className="px-4 sm:px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {right && <div className="flex items-center gap-2 flex-wrap">{right}</div>}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

interface StatProps {
  label: string;
  /** null = no measurement; shown as an em-dash with `sub` as the reason. */
  value: string | null;
  sub?: string;
  tone?: Tone;
  href?: string;
}

const STAT_BORDER: Record<Tone, string> = {
  ok: "border-l-emerald-500",
  warn: "border-l-amber-500",
  bad: "border-l-rose-500",
  neutral: "border-l-gray-200",
  info: "border-l-indigo-500",
};

export function Stat({ label, value, sub, tone = "neutral", href }: StatProps): React.JSX.Element {
  const body = (
    <div className={`h-full bg-white rounded-lg border border-gray-200 border-l-4 ${STAT_BORDER[tone]} px-3 py-2.5`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 truncate">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold leading-tight ${value === null ? "text-gray-300" : "text-gray-900"}`}>
        {value ?? "—"}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-gray-500 truncate" title={sub}>{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:shadow-md transition-shadow rounded-lg">
      {body}
    </Link>
  ) : (
    body
  );
}

export function StatGrid({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">{children}</div>;
}

interface PageHeaderProps {
  title: string;
  description: string;
  updatedAt: number | null;
  error: string | null;
  onRefresh: () => void;
  controls?: React.ReactNode;
}

export function PageHeader({ title, description, updatedAt, error, onRefresh, controls }: PageHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-3xl">{description}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {controls}
        {error && <Pill tone="bad" title={error}>Last refresh failed</Pill>}
        <span className="text-[11px] font-mono text-gray-400">
          {updatedAt ? `updated ${fmtAgo(new Date(updatedAt).toISOString())}` : "loading…"}
        </span>
        <button
          type="button"
          onClick={(): void => onRefresh()}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

export function LoadingBlock({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center" role="status">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-rose-200 p-8 text-center" role="alert">
      <p className="text-sm font-semibold text-rose-700">Could not load this page&apos;s data</p>
      <p className="text-xs text-gray-500 mt-1 font-mono break-all">{message}</p>
      <button
        type="button"
        onClick={(): void => onRetry()}
        className="mt-4 px-3 py-1.5 text-xs font-bold rounded bg-rose-600 text-white hover:bg-rose-700"
      >
        Retry
      </button>
    </div>
  );
}

/** A section-level "there is no data, and here is why" message. */
export function Absent({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-xs text-gray-600">
      {children}
    </div>
  );
}

/** Small print stating a number's basis — what it counts and where it comes from. */
export function Basis({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <p className="mt-3 text-[11px] leading-relaxed text-gray-500">{children}</p>;
}

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-indigo-700 hover:text-indigo-900 hover:underline">
      {children}
    </a>
  );
}
