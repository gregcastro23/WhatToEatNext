import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CUISINES_METADATA } from "@/data/cuisines/index";
import { cuisineToSlug, slugToCuisineKey } from "@/utils/cuisineSlug";

const CuisineRestaurantFinder = dynamic(
  () => import("@/components/RestaurantDiscovery/CuisineRestaurantFinder"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500/50" />
      </div>
    ),
  },
);

type ElementName = "Fire" | "Water" | "Earth" | "Air";

const ELEMENT_GLYPH: Record<ElementName, { emoji: string; chip: string; glow: string }> = {
  Fire:  { emoji: "🔥", chip: "bg-rose-500/15 text-rose-200 border-rose-400/30",       glow: "bg-rose-600/15" },
  Water: { emoji: "💧", chip: "bg-blue-500/15 text-blue-200 border-blue-400/30",       glow: "bg-blue-600/15" },
  Earth: { emoji: "🌿", chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30", glow: "bg-emerald-600/15" },
  Air:   { emoji: "💨", chip: "bg-sky-500/15 text-sky-200 border-sky-400/30",          glow: "bg-sky-600/15" },
};

export function generateStaticParams() {
  return Object.entries(CUISINES_METADATA).map(([key, meta]) => ({
    slug: cuisineToSlug(meta.name ?? key),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const key = slugToCuisineKey(slug);
  if (!key) return { title: "Cuisine — Alchm Kitchen" };
  const meta = CUISINES_METADATA[key];
  const name = meta?.name ?? key;
  return {
    title: `${name} cuisine — Alchm Kitchen`,
    description: meta?.description ?? `${name} culinary tradition.`,
  };
}

export default async function CuisineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const key = slugToCuisineKey(slug);
  if (!key) notFound();

  const meta = CUISINES_METADATA[key];
  const name = meta?.name ?? key;
  const description = meta?.description ?? "";

  const props = meta?.elementalProperties ?? {};
  const ordered = (Object.entries(props) as Array<[ElementName, number]>).sort(
    (a, b) => b[1] - a[1],
  );
  const dominant: ElementName = ordered[0]?.[0] ?? "Earth";
  const dominantDecoration = ELEMENT_GLYPH[dominant];

  return (
    <main className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto pb-16">
        <Link
          href="/cuisines"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-300/70 hover:text-purple-200 mb-6"
        >
          <span aria-hidden>←</span> All cuisines
        </Link>

        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c14]/80 backdrop-blur-xl p-8 md:p-10 mb-8">
          <div
            className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20 ${dominantDecoration.glow}`}
            aria-hidden
          />
          <div className="relative z-10">
            <div className="text-6xl mb-4" aria-hidden>
              {dominantDecoration.emoji}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 leading-tight pb-2">
              {name}
            </h1>
            {description && (
              <p className="mt-4 text-lg text-white/60 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}

            <ul className="mt-6 flex flex-wrap gap-2">
              {ordered.map(([element, value]) => {
                const dec = ELEMENT_GLYPH[element];
                return (
                  <li
                    key={element}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${dec.chip}`}
                  >
                    <span aria-hidden>{dec.emoji}</span>
                    {element}
                    <span className="opacity-60">{(value * 100).toFixed(0)}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </header>

        <section>
          <CuisineRestaurantFinder initialCuisineType={name} />
        </section>
      </div>
    </main>
  );
}
