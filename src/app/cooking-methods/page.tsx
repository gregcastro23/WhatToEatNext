/**
 * TRANSMUTATION HUB — the cooking methods atlas, rebuilt in the
 * "Molecular Alchemy" design language from the stitch Alchemical
 * Culinary Kinetics package.
 *
 * Server-rendered methodology cards (data + curated profiles) with three
 * live client islands: hero telemetry, live transits, and the existing
 * recommender engine in the Reaction Chamber below the fold.
 */
import { Eye, FlaskConical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import HubTelemetry from "@/components/cooking-methods/hub/HubTelemetry";
import LiveTransits from "@/components/cooking-methods/hub/LiveTransits";
import ReactionChamber from "@/components/cooking-methods/hub/ReactionChamber";
import {
  accentClass,
  ElementIcon,
  MaChip,
  MaDataReadout,
} from "@/components/cooking-methods/primitives";
import {
  dryCookingMethods,
  molecularCookingMethods,
  rawCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
  wetCookingMethods,
} from "@/data/cooking/methods";
import { METHOD_PHYSICAL_REFERENCE } from "@/data/cooking/physicalReference";
import { getAlchemicalProfile } from "@/data/cooking/profiles";
import type { CookingMethodData } from "@/types/cookingMethod";
import { elementalSignature } from "@/utils/elemental/signature";

const CATEGORY_GROUPS: Array<{
  id: string;
  title: string;
  subtitle: string;
  methods: Record<string, CookingMethodData>;
}> = [
  {
    id: "dry",
    title: "DRY_HEAT",
    subtitle: "CONDUCTION // RADIATION",
    methods: dryCookingMethods,
  },
  {
    id: "wet",
    title: "WET_HEAT",
    subtitle: "CONVECTION // IMMERSION",
    methods: wetCookingMethods,
  },
  {
    id: "molecular",
    title: "MOLECULAR",
    subtitle: "STRUCTURAL_TRANSMUTATION",
    methods: molecularCookingMethods,
  },
  {
    id: "traditional",
    title: "TRADITIONAL",
    subtitle: "BIOLOGICAL // TEMPORAL",
    methods: traditionalCookingMethods,
  },
  {
    id: "transformation",
    title: "TRANSFORMATION",
    subtitle: "PRESERVATION // EXTRACTION",
    methods: transformationMethods,
  },
  {
    id: "raw",
    title: "RAW",
    subtitle: "NULL_TRANSMUTATION",
    methods: rawCookingMethods,
  },
];

function toDisplayName(id: string, method: CookingMethodData): string {
  const profile = getAlchemicalProfile(id);
  return (profile?.displayName ?? method.name ?? id).replace(/_/g, " ");
}

function MethodCard({
  id,
  method,
}: {
  id: string;
  method: CookingMethodData;
}) {
  const profile = getAlchemicalProfile(id);
  const signature = elementalSignature(method.elementalEffect);
  const topElements = signature.ranked.slice(0, 2);
  const reference = METHOD_PHYSICAL_REFERENCE[id];
  const dominant = (signature.dominant ?? "Fire");

  return (
    <article
      className={`${accentClass(profile?.accent)} ma-panel ma-panel-hover group flex flex-col overflow-hidden rounded-lg md:flex-row`}
    >
      {/* Visual */}
      <div className="relative h-44 shrink-0 border-b border-ma-line/20 md:h-auto md:w-2/5 md:border-b-0 md:border-r">
        {profile?.image ? (
          <>
            <Image
              src={profile.image}
              alt={profile.imageAlt ?? `${toDisplayName(id, method)} schematic diagram`}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover opacity-70 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ma-bg/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="ma-sigil-bg flex h-full min-h-[176px] items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="ma-spin-slower absolute inset-0 rounded-full border border-[var(--ma-accent)]/30" />
              <div className="absolute inset-3 rounded-full border border-dashed border-ma-line/60" />
              <ElementIcon
                element={dominant}
                className="h-9 w-9 text-[var(--ma-accent-soft)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5 md:p-6">
        <div>
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-grimoire text-xl text-ma-fg md:text-2xl">
              {toDisplayName(id, method).toUpperCase()}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {topElements.map((r) => (
                <MaChip key={r.element} tone="accent">
                  <ElementIcon
                    element={r.element}
                    className="h-3 w-3"
                  />
                  +{r.element.toUpperCase()}
                </MaChip>
              ))}
            </div>
          </div>
          {profile ? (
            <p className="mb-2 font-grimoire italic text-[var(--ma-accent-soft)]">
              {profile.epithet}
            </p>
          ) : null}
          <p className="mb-4 font-mono text-sm leading-relaxed text-ma-fg-dim">
            {method.shortDescription ??
              `${(method.description ?? "").split(". ")[0]}.`}
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <MaDataReadout
              label="VOLTAGE (TEMP)"
              value={profile?.kinetics.voltage ?? "—"}
              valueClassName="text-ma-fg text-sm md:text-base"
            />
            <MaDataReadout
              label="CURRENT (FLUX)"
              value={profile?.kinetics.current ?? "—"}
              valueClassName="text-ma-fg text-sm md:text-base"
            />
            {reference ? (
              <MaDataReadout
                label="ENVELOPE"
                value={`${reference.temperatureF.ideal}°F / ${Math.round(((reference.temperatureF.ideal - 32) * 5) / 9)}°C`}
                valueClassName="text-ma-fg text-sm md:text-base"
                className="col-span-2 md:col-span-1"
              />
            ) : null}
          </div>
        </div>
        <div>
          <Link
            href={`/cooking-methods/${id}`}
            className="ma-label inline-flex items-center gap-2 rounded border border-[var(--ma-accent)]/50 px-4 py-2.5 text-[var(--ma-accent-soft)] transition-colors hover:bg-[rgba(var(--ma-accent-rgb),0.08)]"
          >
            <Eye className="h-4 w-4" aria-hidden />
            VIEW_SCHEMATIC
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function CookingMethodsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
      {/* ── Hero ── */}
      <section className="ma-panel relative mb-12 overflow-hidden rounded-lg border-t-2 border-t-ma-cyan/50 p-6 md:p-10">
        <div
          className="ma-sigil-bg pointer-events-none absolute -right-24 -top-24 h-96 w-96 opacity-60"
          aria-hidden
        >
          <div className="ma-spin-slower h-full w-full rounded-full border border-ma-cyan/15" />
          <div className="absolute inset-12 rounded-full border border-dashed border-ma-cyan/10" />
        </div>
        <p className="ma-label relative z-10 mb-3 text-ma-outline">
          ALCHEMICAL_CULINARY_KINETICS // PHASE_SHIFT_V.04
        </p>
        <h1 className="ma-text-glow relative z-10 mb-3 font-grimoire text-4xl font-bold tracking-tight text-ma-ice md:text-6xl">
          TRANSMUTATION HUB
        </h1>
        <p className="relative z-10 mb-8 max-w-2xl font-mono text-sm leading-relaxed text-ma-fg-dim md:text-base">
          Select an elemental vector to initiate molecular restructuring. Live
          planetary telemetry ranks every methodology against the current sky —
          P=IV kinetics, Monica stability, and elemental resonance computed in
          real time.
        </p>
        <HubTelemetry />
      </section>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-9">
          <h2 className="ma-label flex items-center gap-2 text-base text-ma-cyan-bright">
            <FlaskConical className="h-5 w-5" aria-hidden />
            METHODOLOGIES
          </h2>
          {CATEGORY_GROUPS.map((group) => {
            const entries = Object.entries(group.methods);
            if (entries.length === 0) return null;
            return (
              <section key={group.id} id={group.id}>
                <header className="mb-4 flex items-baseline gap-3">
                  <h3 className="font-grimoire text-2xl text-ma-fg">
                    {group.title}
                  </h3>
                  <span className="ma-label text-ma-outline">
                    {group.subtitle}
                  </span>
                  <span className="ma-data ml-auto text-xs text-ma-outline">
                    {String(entries.length).padStart(2, "0")}_PROCEDURES
                  </span>
                </header>
                <div className="space-y-5">
                  {entries.map(([id, method]) => (
                    <MethodCard key={id} id={id} method={method} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── Right rail ── */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <LiveTransits />
          </div>
        </aside>
      </div>

      {/* ── Reaction Chamber ── */}
      <section className="mt-16">
        <header className="ma-rule mb-6 flex items-center gap-3 pb-3">
          <FlaskConical className="h-5 w-5 text-ma-cyan" aria-hidden />
          <h2 className="font-grimoire text-2xl text-ma-fg md:text-3xl">
            REACTION_CHAMBER
          </h2>
          <span className="ma-label text-ma-outline">
            DEEP_ANALYSIS // LIVE_ENGINE
          </span>
        </header>
        <div className="ma-panel rounded-lg p-2 md:p-4">
          <ReactionChamber />
        </div>
      </section>

      <footer className="ma-rule mt-16 border-b-0 border-t pt-8 text-center">
        <p className="ma-label text-ma-outline opacity-70">
          THE LAW OF EQUIVALENT EXCHANGE APPLIES
        </p>
      </footer>
    </div>
  );
}
