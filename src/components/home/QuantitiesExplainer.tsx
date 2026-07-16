"use client";

import Link from "next/link";

/**
 * The four alchemical quantities, as an orientation panel for first-time
 * visitors.
 *
 * Copy constraint: quantities (Spirit/Essence/Matter/Substance) come from
 * planetary positions; elements (Fire/Water/Earth/Air) come from the signs
 * those planets occupy. They are orthogonal readings of the same chart and must
 * never be presented as the same four things — see the header of
 * `src/utils/planetaryAlchemyMapping.ts`. The `sources` lists below are the
 * planets that contribute each quantity in `PLANETARY_ALCHEMY` there; keep them
 * in sync with that table.
 */
const QUANTITIES = [
  {
    symbol: "\u{1F747}",
    name: "Spirit",
    tagline: "Creative force",
    detail: "Consciousness, vitality, and the spark to improvise.",
    sources: "Sun · Mercury · Jupiter · Saturn",
    tint: "#fbbf24",
  },
  {
    symbol: "\u{1F751}",
    name: "Essence",
    tagline: "Life energy",
    detail: "Emotional flow and flavour connection.",
    sources: "Moon · Venus · Mars · Jupiter · Uranus · Neptune · Pluto",
    tint: "#60a5fa",
  },
  {
    symbol: "\u{1F759}",
    name: "Matter",
    tagline: "Physical form",
    detail: "Grounding, weight, and real nourishment.",
    sources: "Moon · Venus · Mars · Saturn · Uranus · Pluto",
    tint: "#34d399",
  },
  {
    symbol: "\u{1F749}",
    name: "Substance",
    tagline: "Etheric field",
    detail: "Subtle structure — the scarcest of the four.",
    sources: "Mercury · Neptune",
    tint: "#c084fc",
  },
] as const;

const STEPS = [
  ["Read the sky", "Where every planet sits right now, and the sign it occupies."],
  [
    "Take two readings",
    "The planets set the four quantities. Their signs set an elemental balance — Fire, Water, Earth, Air.",
  ],
  [
    "Score against it",
    "The cuisines and ingredients below are ranked on how closely they fit that balance.",
  ],
] as const;

export function QuantitiesExplainer() {
  return (
    <section className="alchm-quanta" aria-labelledby="alchm-quanta-title">
      <style>{`
        .alchm-quanta {
          display: grid;
          gap: 24px;
          padding: clamp(20px, 3.5vw, 30px);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          background: linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005));
          backdrop-filter: blur(12px);
        }
        .alchm-quanta-eyebrow { margin: 0 0 10px; color: var(--accent-2); }
        .alchm-quanta-title {
          margin: 0;
          color: var(--fg);
          font-size: clamp(21px, 3vw, 28px);
          letter-spacing: -0.02em;
          line-height: 1.15;
        }
        .alchm-quanta-intro {
          max-width: 620px;
          margin: 12px 0 0;
          color: var(--fg-dim);
          font-size: 14px;
          line-height: 1.65;
        }
        .alchm-quanta-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }
        .alchm-quanta-card {
          display: grid;
          align-content: start;
          gap: 6px;
          min-width: 0;
          padding: 15px 15px 14px;
          border: 1px solid color-mix(in oklch, var(--q), transparent 78%);
          border-radius: 12px;
          background: color-mix(in oklch, var(--q), transparent 94%);
        }
        .alchm-quanta-head { display: flex; align-items: center; gap: 7px; }
        .alchm-quanta-symbol { color: var(--q); font-size: 17px; line-height: 1; }
        .alchm-quanta-name { color: var(--q); font-size: 13px; font-weight: 650; letter-spacing: -0.01em; }
        .alchm-quanta-tagline { color: var(--fg-mute); font-size: 9px; }
        .alchm-quanta-detail { color: var(--fg-dim); font-size: 11px; line-height: 1.5; }
        .alchm-quanta-sources {
          margin-top: 2px;
          padding-top: 8px;
          border-top: 1px solid var(--line);
          color: var(--fg-mute);
          font-size: 9px;
          line-height: 1.45;
        }
        .alchm-quanta-steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1px;
          margin: 0;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--line);
        }
        .alchm-quanta-step {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 11px;
          min-width: 0;
          padding: 15px;
          background: color-mix(in oklch, var(--bg-elev), transparent 6%);
        }
        .alchm-quanta-step-index { color: var(--accent); font-size: 9px; letter-spacing: 0.1em; }
        .alchm-quanta-step dt { color: var(--fg); font-size: 12px; font-weight: 650; }
        .alchm-quanta-step dd { margin: 4px 0 0; color: var(--fg-mute); font-size: 10px; line-height: 1.5; }
        .alchm-quanta-foot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 18px;
          padding-top: 4px;
        }
        .alchm-quanta-link {
          color: var(--fg-dim);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid var(--line-hi);
          padding-bottom: 2px;
        }
        .alchm-quanta-link:hover { color: var(--fg); border-bottom-color: var(--accent); }
        .alchm-quanta-foot-note { color: var(--fg-mute); font-size: 11px; margin: 0; }
        @media (max-width: 900px) {
          .alchm-quanta-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .alchm-quanta-steps { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .alchm-quanta-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div>
        <p className="t-tag alchm-quanta-eyebrow">THE BASICS · ALCHEMICAL QUANTITIES</p>
        <h2 id="alchm-quanta-title" className="t-display alchm-quanta-title">
          Four quantities, read from the sky
        </h2>
        <p className="alchm-quanta-intro">
          Every reading here starts with the planets overhead. What they
          contribute is measured as four quantities — Spirit, Essence, Matter and
          Substance, or ESMS. They are also the unit of account: generating a
          recipe or a recommendation is priced in ESMS.
        </p>
      </div>

      <div className="alchm-quanta-grid">
        {QUANTITIES.map((q) => (
          <div
            key={q.name}
            className="alchm-quanta-card"
            style={{ ["--q" as string]: q.tint }}
          >
            <div className="alchm-quanta-head">
              <span className="alchm-quanta-symbol" aria-hidden="true">
                {q.symbol}
              </span>
              <span className="alchm-quanta-name">{q.name}</span>
            </div>
            <p className="t-tag alchm-quanta-tagline">{q.tagline}</p>
            <p className="alchm-quanta-detail">{q.detail}</p>
            <p className="t-mono alchm-quanta-sources">{q.sources}</p>
          </div>
        ))}
      </div>

      <dl className="alchm-quanta-steps" aria-label="How a match is made">
        {STEPS.map(([term, detail], index) => (
          <div key={term} className="alchm-quanta-step">
            <span className="t-mono alchm-quanta-step-index" aria-hidden="true">
              0{index + 1}
            </span>
            <div>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="alchm-quanta-foot">
        <Link href="/quantities" className="alchm-quanta-link">
          See the sky&apos;s quantities right now <span aria-hidden="true">→</span>
        </Link>
        <Link href="/login" className="alchm-quanta-link">
          Sign in <span aria-hidden="true">→</span>
        </Link>
        <Link href="/ingredients" className="alchm-quanta-link">
          Shop Amazon ingredients <span aria-hidden="true">→</span>
        </Link>
        <p className="alchm-quanta-foot-note">New accounts start with 60 ESMS.</p>
      </div>
    </section>
  );
}
