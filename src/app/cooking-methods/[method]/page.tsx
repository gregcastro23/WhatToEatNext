/**
 * Method profile page — "Alchemical Profile" layout from the stitch
 * Alchemical Culinary Kinetics design package: full-bleed hero with
 * scientific diagram, bento grid (Kinetic Profile / Elemental Signature /
 * Astrological Rulership / Molecular Interaction), thermal envelope,
 * and the retained practical reference content, all in the Molecular
 * Alchemy theme.
 */
import {
  Activity,
  ArrowLeft,
  Clock,
  FlaskConical,
  Gauge,
  ScrollText,
  TriangleAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  accentClass,
  ElementBar,
  ElementIcon,
  EquationBlock,
  MaChip,
  MaDataReadout,
  MaPanel,
  MaSectionHeader,
  PlanetEmblem,
} from "@/components/cooking-methods/primitives";
import MolecularGrid from "@/components/cooking-methods/profile/MolecularGrid";
import ReactionTelemetry from "@/components/cooking-methods/profile/ReactionTelemetry";
import {
  allCookingMethods,
  dryCookingMethods,
  molecularCookingMethods,
  rawCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
  wetCookingMethods,
} from "@/data/cooking/methods";
import { METHOD_PHYSICAL_REFERENCE } from "@/data/cooking/physicalReference";
import { getAlchemicalProfile, normalizeMethodKey } from "@/data/cooking/profiles";
import type {
  AlchemicalMethodProfile,
  CookingMethodData,
} from "@/types/cookingMethod";
import { elementalSignature } from "@/utils/elemental/signature";
import type { Metadata } from "next";

const METHODS = allCookingMethods as Record<string, CookingMethodData>;

const CATEGORY_RECORDS: Array<{
  title: string;
  methods: Record<string, CookingMethodData>;
}> = [
  { title: "DRY_HEAT", methods: dryCookingMethods },
  { title: "WET_HEAT", methods: wetCookingMethods },
  { title: "MOLECULAR", methods: molecularCookingMethods },
  { title: "TRADITIONAL", methods: traditionalCookingMethods },
  { title: "TRANSFORMATION", methods: transformationMethods },
  { title: "RAW", methods: rawCookingMethods },
];

function resolveMethodKey(slug: string): string | null {
  const key = normalizeMethodKey(decodeURIComponent(slug));
  if (METHODS[key]) return key;
  const match = Object.keys(METHODS).find(
    (k) => k.toLowerCase() === key.toLowerCase(),
  );
  return match ?? null;
}

function displayName(key: string, method: CookingMethodData): string {
  const profile = getAlchemicalProfile(key);
  return (profile?.displayName ?? method.name ?? key).replace(/_/g, " ");
}

function fallbackProfile(
  method: CookingMethodData,
): Pick<
  AlchemicalMethodProfile,
  "epithet" | "classification" | "tagline" | "accent"
> {
  return {
    epithet: method.culinaryArchetype ?? "The Transmutation",
    classification: "TRANSMUTATION",
    tagline: method.shortDescription ?? method.description ?? "",
    accent: "plasma",
  };
}

export function generateStaticParams() {
  return Object.keys(METHODS).map((method) => ({ method }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ method: string }>;
}): Promise<Metadata> {
  const { method: slug } = await params;
  const key = resolveMethodKey(slug);
  if (!key) return { title: "Cooking method not found" };
  const method = METHODS[key];
  const profile = getAlchemicalProfile(key);
  const name = displayName(key, method);
  const description = (profile?.tagline ?? method.description ?? "").slice(0, 158);
  return {
    title: `${name.charAt(0).toUpperCase()}${name.slice(1)} — ${profile?.epithet ?? "Cooking Method"}`,
    description,
  };
}

// ── Praxis helpers ───────────────────────────────────────────────────────────

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function PraxisList({
  title,
  items,
  bulletClass = "bg-[var(--ma-accent)]",
  cap = 8,
}: {
  title: string;
  items: string[];
  bulletClass?: string;
  cap?: number;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="ma-label mb-3 text-ma-outline">{title}</h4>
      <ul className="space-y-2">
        {items.slice(0, cap).map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 font-mono text-sm leading-relaxed text-ma-fg-dim"
          >
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${bulletClass}`}
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CookingMethodPage({
  params,
}: {
  params: Promise<{ method: string }>;
}) {
  const { method: slug } = await params;
  const key = resolveMethodKey(slug);

  if (!key) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <p className="ma-label mb-4 text-ma-error">SIGNAL_LOST // UNKNOWN_PROCEDURE</p>
        <h1 className="mb-6 font-grimoire text-4xl text-ma-fg">
          Transmutation not found
        </h1>
        <Link
          href="/cooking-methods"
          className="ma-label inline-flex items-center gap-2 rounded border border-ma-cyan/50 px-4 py-2.5 text-ma-cyan-bright transition-colors hover:bg-ma-cyan/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          RETURN_TO_HUB
        </Link>
      </div>
    );
  }

  const method = METHODS[key];
  const profile = getAlchemicalProfile(key);
  const display = profile ?? fallbackProfile(method);
  const name = displayName(key, method);
  const signature = elementalSignature(method.elementalEffect);
  const dominant = (signature.dominant ?? "Fire");
  const reference = METHOD_PHYSICAL_REFERENCE[key];

  const benefits = asStringArray(method.benefits);
  const suitableFor = asStringArray(method.suitable_for);
  const tools = asStringArray(method.toolsRequired);
  const mistakes = asStringArray(method.commonMistakes);
  const expertTips = asStringArray(method.expertTips);
  const safety = asStringArray(method.safetyFeatures);
  const principles = asStringArray(method.scientificPrinciples);
  const favorableZodiac = asStringArray(
    method.astrologicalInfluences?.favorableZodiac,
  );
  const regionalVariations =
    method.regionalVariations && typeof method.regionalVariations === "object"
      ? Object.entries(method.regionalVariations).slice(0, 5)
      : [];
  const optimalTemperatures =
    method.optimalTemperatures && typeof method.optimalTemperatures === "object"
      ? Object.entries(method.optimalTemperatures).slice(0, 8)
      : [];

  const rulers =
    profile?.planetaryRulers ??
    asStringArray(method.astrologicalInfluences?.dominantPlanets)
      .slice(0, 2)
      .map((planet, i) => ({
        planet,
        rank: (i === 0 ? "primary" : "secondary"),
      }));

  const category = CATEGORY_RECORDS.find((c) => key in c.methods);
  const related = category
    ? Object.keys(category.methods).filter((k) => k !== key)
    : [];

  const rankedElements = signature.ranked.filter((r) => r.value > 0.001);

  return (
    <div
      className={`${accentClass(display.accent)} mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12`}
    >
      {/* ── Breadcrumb ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/cooking-methods"
          className="ma-label inline-flex items-center gap-2 text-ma-outline transition-colors hover:text-ma-cyan-bright"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          TRANSMUTATION_HUB
        </Link>
        <div className="flex items-center gap-3">
          <MaChip tone="accent">{display.classification}</MaChip>
          <span className="ma-label hidden text-ma-outline md:block">
            PROCEDURE // {key.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="ma-glow-border relative mb-8 min-h-[420px] overflow-hidden rounded-xl md:min-h-[520px]">
        {profile?.image ? (
          <Image
            src={profile.image}
            alt={profile.imageAlt ?? `${name} scientific schematic`}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="object-cover opacity-80 mix-blend-screen"
          />
        ) : (
          <div className="ma-sigil-bg absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
              <div className="ma-spin-slower absolute inset-0 rounded-full border border-[var(--ma-accent)]/30" />
              <div className="absolute inset-8 rounded-full border border-dashed border-[var(--ma-accent)]/20" />
              <div className="absolute inset-16 rounded-full border border-ma-line/40" />
              <ElementIcon
                element={dominant}
                className="h-16 w-16 text-[var(--ma-accent-soft)]"
              />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ma-bg via-ma-bg/30 to-transparent" />
        <div className="absolute bottom-0 left-0 z-10 w-full p-6 md:p-10">
          <div className="flex items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="ma-label mb-3 text-[var(--ma-accent-soft)]">
                {display.classification}
              </p>
              <h1 className="ma-text-glow mb-2 font-grimoire text-4xl font-bold uppercase tracking-tight text-[var(--ma-accent-soft)] md:text-7xl">
                {name}
              </h1>
              <p className="mb-4 font-grimoire text-xl italic text-ma-fg md:text-2xl">
                {display.epithet}
              </p>
              <p className="max-w-2xl font-mono text-sm leading-relaxed text-ma-fg-dim">
                {display.tagline}
              </p>
            </div>
            {profile?.stateChips && profile.stateChips.length > 0 ? (
              <div className="hidden shrink-0 gap-3 md:flex">
                {profile.stateChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="ma-panel rounded-lg border-l-2 border-l-[var(--ma-accent)] p-4"
                  >
                    <span className="ma-label mb-2 block text-ma-outline">
                      {chip.label}
                    </span>
                    <span className="ma-data text-base text-[var(--ma-accent-soft)]">
                      {chip.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Bento grid ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Kinetic Profile */}
        <MaPanel glow className="p-6 md:col-span-8 md:p-8">
          <MaSectionHeader
            number="01"
            icon={<Activity className="h-5 w-5" aria-hidden />}
            title="KINETIC_PROFILE"
          />
          {profile ? (
            <div className="space-y-6">
              <p className="font-mono text-sm leading-relaxed text-ma-fg-dim">
                {profile.kinetics.prose}
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <MaDataReadout
                  label="VOLTAGE (V)"
                  value={profile.kinetics.voltage}
                  valueClassName="text-[var(--ma-accent-soft)] text-sm md:text-base"
                />
                <MaDataReadout
                  label="CURRENT (I)"
                  value={profile.kinetics.current}
                  valueClassName="text-[var(--ma-accent-soft)] text-sm md:text-base"
                />
                {profile.kinetics.catalyst ? (
                  <MaDataReadout
                    label="CATALYST"
                    value={profile.kinetics.catalyst}
                    valueClassName="text-ma-ember-soft text-sm md:text-base"
                    className="col-span-2 md:col-span-1"
                  />
                ) : null}
              </div>
              <div className="space-y-4">
                {profile.kinetics.equations.map((eq) => (
                  <EquationBlock
                    key={eq.expression}
                    expression={eq.expression}
                    label={eq.label}
                    note={eq.note}
                  />
                ))}
              </div>
              <ReactionTelemetry methodId={key} method={method} />
            </div>
          ) : (
            <ReactionTelemetry methodId={key} method={method} />
          )}
        </MaPanel>

        {/* Right column */}
        <div className="flex flex-col gap-6 md:col-span-4">
          <MaPanel glow className="flex-1 p-6">
            <MaSectionHeader title="ELEMENTAL_SIGNATURE" className="mb-4" />
            <div className="space-y-4">
              {rankedElements.map((r) => (
                <ElementBar
                  key={r.element}
                  element={r.element}
                  percent={r.value * 100}
                  role={profile?.elementalRoles?.[r.element]}
                />
              ))}
            </div>
            <p className="mt-5 font-grimoire italic text-ma-fg-dim">
              This transmutation {signature.label}.
            </p>
            {profile?.descriptorTags && profile.descriptorTags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.descriptorTags.map((tag) => (
                  <MaChip key={tag} tone="accent">
                    {tag}
                  </MaChip>
                ))}
              </div>
            ) : null}
          </MaPanel>

          <MaPanel glow className="p-6">
            <MaSectionHeader title="ASTROLOGICAL_RULERSHIP" className="mb-4" />
            <div className="space-y-5">
              {rulers.length > 0 ? (
                rulers.map((ruler) => (
                  <PlanetEmblem
                    key={ruler.planet}
                    planet={ruler.planet}
                    governs={"governs" in ruler ? ruler.governs : undefined}
                    rank={ruler.rank}
                  />
                ))
              ) : (
                <p className="font-mono text-sm text-ma-outline">
                  No recorded rulership.
                </p>
              )}
            </div>
            {profile?.rulershipNote ? (
              <p className="mt-5 border-t border-ma-line/30 pt-4 font-mono text-xs leading-relaxed text-ma-outline">
                {profile.rulershipNote}
              </p>
            ) : null}
            {favorableZodiac.length > 0 ? (
              <div className="mt-5 border-t border-ma-line/30 pt-4">
                <span className="ma-label mb-3 block text-ma-outline">
                  FAVORABLE_SIGNS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {favorableZodiac.map((sign) => (
                    <MaChip key={sign} tone="outline">
                      {sign}
                    </MaChip>
                  ))}
                </div>
              </div>
            ) : null}
          </MaPanel>
        </div>

        {/* Molecular Interaction */}
        {profile && profile.molecularInteractions.length > 0 ? (
          <MaPanel glow className="p-6 md:col-span-12 md:p-8">
            <MaSectionHeader
              number="02"
              icon={<FlaskConical className="h-5 w-5" aria-hidden />}
              title="MOLECULAR_INTERACTION"
            />
            <MolecularGrid
              interactions={profile.molecularInteractions}
              checklist={profile.checklist}
            />
          </MaPanel>
        ) : null}
      </div>

      {/* ── Thermal envelope ── */}
      {reference ? (
        <MaPanel className="mt-6 p-6 md:p-8">
          <MaSectionHeader
            icon={<Gauge className="h-5 w-5" aria-hidden />}
            title="THERMAL_ENVELOPE"
          />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <MaDataReadout
              label="LOW"
              value={`${reference.temperatureF.low}°F`}
              valueClassName="text-ma-cyan-bright"
            />
            <MaDataReadout
              label="IDEAL"
              value={`${reference.temperatureF.ideal}°F / ${Math.round(((reference.temperatureF.ideal - 32) * 5) / 9)}°C`}
              valueClassName="text-[var(--ma-accent-soft)]"
            />
            <MaDataReadout
              label="HIGH"
              value={`${reference.temperatureF.high}°F`}
              valueClassName="text-ma-ember-soft"
            />
            <MaDataReadout
              label="DURATION"
              value={
                method.duration
                  ? `${method.duration.min}–${method.duration.max} MIN`
                  : "—"
              }
              valueClassName="text-ma-fg"
            />
          </div>
          <p className="mt-4 font-mono text-xs leading-relaxed text-ma-outline">
            {reference.temperatureF.note}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-ma-line/30 pt-4 md:grid-cols-3">
            <MaDataReadout
              label="PRESSURE_MODE"
              value={reference.pressure.mode.toUpperCase()}
              valueClassName="text-ma-fg text-sm"
            />
            <MaDataReadout
              label="GAUGE"
              value={reference.pressure.gaugePsi}
              valueClassName="text-ma-fg text-sm"
            />
            <MaDataReadout
              label="ABSOLUTE"
              value={reference.pressure.absoluteKPa}
              valueClassName="text-ma-fg text-sm"
            />
          </div>
          {reference.temperatureF.proteins ? (
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-ma-line/30 pt-4 md:grid-cols-4">
              {Object.entries(reference.temperatureF.proteins).map(
                ([protein, info]) => (
                  <MaDataReadout
                    key={protein}
                    label={protein.toUpperCase()}
                    value={`${info.temp}°F`}
                    valueClassName="text-ma-fg text-sm"
                  />
                ),
              )}
            </div>
          ) : null}
        </MaPanel>
      ) : null}

      {/* ── Praxis ── */}
      {benefits.length > 0 ||
      suitableFor.length > 0 ||
      tools.length > 0 ||
      mistakes.length > 0 ||
      expertTips.length > 0 ||
      regionalVariations.length > 0 ||
      optimalTemperatures.length > 0 ||
      safety.length > 0 ? (
        <MaPanel className="mt-6 p-6 md:p-8">
          <MaSectionHeader
            icon={<Clock className="h-5 w-5" aria-hidden />}
            title="PRAXIS"
          />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <PraxisList title="BENEFITS" items={benefits} />
            {suitableFor.length > 0 ? (
              <div>
                <h4 className="ma-label mb-3 text-ma-outline">
                  SUITABLE_SUBSTRATES
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {suitableFor.slice(0, 14).map((item) => (
                    <MaChip key={item} tone="outline">
                      {item}
                    </MaChip>
                  ))}
                </div>
              </div>
            ) : null}
            <PraxisList title="INSTRUMENTS" items={tools} cap={10} />
            <PraxisList
              title="COMMON_FAILURES"
              items={mistakes}
              bulletClass="bg-ma-error"
            />
            <PraxisList title="EXPERT_DIRECTIVES" items={expertTips} />
            {regionalVariations.length > 0 ? (
              <div>
                <h4 className="ma-label mb-3 text-ma-outline">
                  REGIONAL_VARIANTS
                </h4>
                <ul className="space-y-2.5">
                  {regionalVariations.map(([region, variants]) => (
                    <li key={region} className="font-mono text-sm">
                      <span className="ma-label text-[var(--ma-accent-soft)]">
                        {region.replace(/_/g, " ").toUpperCase()}
                      </span>{" "}
                      <span className="text-ma-fg-dim">
                        {asStringArray(variants).slice(0, 4).join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {optimalTemperatures.length > 0 ? (
              <div>
                <h4 className="ma-label mb-3 text-ma-outline">
                  OPTIMAL_TEMPERATURES
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {optimalTemperatures.map(([label, temp]) => (
                    <MaDataReadout
                      key={label}
                      label={label.replace(/_/g, " ").toUpperCase()}
                      value={`${temp}°F`}
                      valueClassName="text-ma-fg text-sm"
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {safety.length > 0 ? (
              <div>
                <h4 className="ma-label mb-3 flex items-center gap-2 text-ma-error">
                  <TriangleAlert className="h-4 w-4" aria-hidden />
                  SAFETY_SIGILS
                </h4>
                <ul className="space-y-2">
                  {safety.slice(0, 6).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 font-mono text-sm leading-relaxed text-ma-fg-dim"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ma-error"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </MaPanel>
      ) : null}

      {/* ── Archives ── */}
      {method.history || principles.length > 0 ? (
        <MaPanel className="mt-6 p-6 md:p-8">
          <MaSectionHeader
            icon={<ScrollText className="h-5 w-5" aria-hidden />}
            title="ARCHIVES"
          />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {method.history ? (
              <div>
                <h4 className="ma-label mb-3 text-ma-outline">
                  HISTORICAL_RECORD
                </h4>
                <p className="font-mono text-sm leading-relaxed text-ma-fg-dim">
                  {method.history}
                </p>
              </div>
            ) : null}
            <PraxisList title="SCIENTIFIC_PRINCIPLES" items={principles} />
          </div>
        </MaPanel>
      ) : null}

      {/* ── Related ── */}
      {related.length > 0 ? (
        <footer className="ma-rule mt-10 border-b-0 border-t pt-6">
          <span className="ma-label mb-4 block text-ma-outline">
            RELATED_TRANSMUTATIONS // {category?.title}
          </span>
          <div className="flex flex-wrap gap-2">
            {related.map((relatedKey) => (
              <Link key={relatedKey} href={`/cooking-methods/${relatedKey}`}>
                <MaChip tone="cyan" className="transition-colors hover:bg-ma-cyan/20">
                  {relatedKey.replace(/_/g, " ").toUpperCase()}
                </MaChip>
              </Link>
            ))}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
