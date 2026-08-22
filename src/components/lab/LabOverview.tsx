import Link from "next/link";
import type { JSX } from "react";
import { NAV_IA, type PrimaryKey } from "@/config/navigation";
import { SYSTEM_DESCRIPTORS } from "./systems";

/**
 * The one page in each lab that shows both models at once.
 *
 * Every other lab route commits to a single system and badges itself. This one
 * exists to answer the question the badges raise — "why are there two?" — and
 * it is the reason `system` is left undefined on the overview entries in
 * NAV_IA: an overview that badged itself would be claiming to be one of the
 * things it is comparing.
 *
 * The `answers` / `cannot` pairing is deliberate. Stating only what a model is
 * good for invites the reader to assume it is good for everything else too,
 * and that assumption is precisely what let ESMS sit under a heading reading
 * THERMODYNAMICS for as long as it did.
 *
 * @file src/components/lab/LabOverview.tsx
 */

interface ModelCard {
  system: "real" | "alchm";
  href: string;
  answers: string[];
  cannot: string;
}

const CONTENT: Record<
  Extract<PrimaryKey, "kitchenLab" | "celestialLab">,
  { lede: string; cards: ModelCard[] }
> = {
  kitchenLab: {
    lede:
      "Two ways of describing the same pan of food. One is measured against nature; the other is a model this project defines. They are kept on separate pages because their numbers look alike and mean entirely different things.",
    cards: [
      {
        system: "real",
        href: "/kitchen-lab/physics",
        answers: [
          "How long until the centre reaches 60 °C?",
          "Which boundary is actually limiting the rate?",
          "How much water leaves, and what does that cost in energy?",
          "Where does water boil at this elevation?",
        ],
        cannot:
          "It cannot tell you what to cook. Nothing here knows about your chart, the hour, or your taste.",
      },
      {
        system: "alchm",
        href: "/kitchen-lab/alchm",
        answers: [
          "Which ingredients align with the current sky?",
          "What is this dish's Spirit / Essence / Matter / Substance?",
          "Which cuisines resonate with tonight?",
        ],
        cannot:
          "It cannot predict a temperature, a time, or a mass. No quantity here is measurable with an instrument.",
      },
    ],
  },
  celestialLab: {
    lede:
      "Two ways of describing the same sky. The mechanics are astronomy — positions, aspects and orbs you could check against any ephemeris. The alchm quantities are derived FROM those positions by rules this project defines.",
    cards: [
      {
        system: "real",
        href: "/celestial-lab/mechanics",
        answers: [
          "Where is each body right now, to the arc-minute?",
          "Which aspects are applying, and how many days to exact?",
          "Is the chart diurnal or nocturnal?",
        ],
        cannot:
          "It cannot tell you what any of it means. Position is not interpretation.",
      },
      {
        system: "alchm",
        href: "/celestial-lab/alchm",
        answers: [
          "What are the ESMS quantities for this moment?",
          "How do the Monica and Kalchm constants fall out?",
          "How does essential dignity fold onto the elements?",
        ],
        cannot:
          "It cannot be checked against an almanac. These quantities exist because this project defines them, not because they were observed.",
      },
    ],
  },
};

export function LabOverview({
  lab,
}: {
  lab: Extract<PrimaryKey, "kitchenLab" | "celestialLab">;
}): JSX.Element {
  const section = NAV_IA[lab];
  const { lede, cards } = CONTENT[lab];

  return (
    <div className="px-4 py-8 sm:px-6">
      <p className="max-w-3xl text-sm leading-relaxed text-white/60">{lede}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {cards.map((card) => {
          const d = SYSTEM_DESCRIPTORS[card.system];
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group flex flex-col rounded-xl border ${d.border} ${d.bg} p-5 transition hover:border-white/25`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${d.dot}`}
                  aria-hidden="true"
                />
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${d.text}`}
                >
                  {d.label}
                </h2>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {d.claim}
              </p>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
                Questions it answers
              </p>
              <ul className="mt-2 space-y-1.5">
                {card.answers.map((a) => (
                  <li
                    key={a}
                    className="flex gap-2 text-sm leading-relaxed text-white/75"
                  >
                    <span aria-hidden="true" className="text-white/25">
                      ·
                    </span>
                    {a}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
                What it cannot do
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                {card.cannot}
              </p>

              <span className="mt-5 text-sm font-medium text-white/70 group-hover:text-white">
                Open →
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
          Everything in this lab
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {section.routes
            .filter((r) => r.path !== section.path)
            .map((r) => (
              <li key={r.path}>
                <Link
                  href={r.path}
                  className="flex flex-col rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 transition hover:border-white/20"
                >
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    {r.system ? (
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${
                          r.system === "real" ? "bg-emerald-400" : "bg-violet-400"
                        }`}
                      />
                    ) : null}
                    {r.label}
                  </span>
                  <span className="mt-0.5 text-xs text-white/40">{r.hint}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
