"use client";

/**
 * The resistance chain — block widths ARE the resistance shares.
 *
 * The one graphic this tab exists for. Everything about it is load-bearing:
 *
 *  - **Width is the share.** Not a bar chart beside the numbers; the geometry
 *    IS the number. A 0.17 % link must render as a sliver, and it must still be
 *    visible and labelled, because "so small you cannot see it" is the finding.
 *  - **Link count is real.** A roast on a rack has TWO links, not five with
 *    three blanks. The absence of a vessel is a fact about the arrangement.
 *  - **`foodBiot` is nullable and rendered as absent.** A chain with no food has
 *    no Biot number, and printing one — as an early design did — is precisely
 *    the defect this codebase keeps meeting.
 *
 * @file src/app/(alchm)/lab/_solver/ResistanceChain.tsx
 */
import type { BoundaryNetworkResult } from "@/lib/cooking/boundaryNetwork";

/** Minimum rendered width, so a sub-1 % link stays visible and hoverable. */
const MIN_VISIBLE_PERCENT = 1.6;

function biotVerdict(biot: number): string {
  if (biot < 0.1) return "surface-limited";
  if (biot > 10) return "interior-limited";
  return "mixed — neither end dominates";
}

export function ResistanceChain({
  network,
  caption,
}: {
  network: BoundaryNetworkResult;
  caption?: string;
}): React.JSX.Element {
  // Widths are the true shares, floored so a sliver stays visible, then
  // renormalised so the row still fills exactly 100 %. The printed percentage
  // is always the TRUE share — the floor changes the drawing, never the number.
  const floored = network.links.map((l) => Math.max(l.share * 100, MIN_VISIBLE_PERCENT));
  const total = floored.reduce((s, w) => s + w, 0);

  return (
    <figure className="ma-chain">
      <div className="ma-chain__row" role="img" aria-label={caption ?? "resistance chain"}>
        {network.links.map((link, i) => {
          const controlling = link.id === network.controlling.id;
          return (
            <div
              key={link.id}
              className={`ma-chain__block${controlling ? " is-controlling" : ""}`}
              style={{ width: `${(floored[i] / total) * 100}%` }}
              title={`${link.label} — ${(link.share * 100).toFixed(2)} %`}
            >
              <span className="ma-chain__pct">{(link.share * 100).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>

      <ol className="ma-chain__links">
        {network.links.map((link) => {
          const controlling = link.id === network.controlling.id;
          return (
            <li key={link.id} className={controlling ? "is-controlling" : undefined}>
              <span className="ma-chain__label">
                {link.label}
                {controlling ? <em className="ma-chain__tag">controlling</em> : null}
              </span>
              <span className="ma-chain__nums">
                <span>{link.resistanceKperW.toExponential(2)} K·W⁻¹</span>
                <span>{(link.share * 100).toFixed(2)} %</span>
                <span>ΔT {link.dropK.toFixed(1)} K</span>
              </span>
            </li>
          );
        })}
      </ol>

      <dl className="ma-chain__summary">
        <div>
          <dt>total resistance</dt>
          <dd>{network.totalResistanceKperW.toExponential(3)} K·W⁻¹</dd>
        </div>
        <div>
          <dt>conductance UA</dt>
          <dd>{network.uaWperK.toPrecision(3)} W·K⁻¹</dd>
        </div>
        <div>
          <dt>heat flow</dt>
          <dd>{network.heatFlowW.toPrecision(3)} W</dd>
        </div>
        <div>
          <dt>Biot number</dt>
          {/* A chain with no food has no Biot number. Saying so is the point. */}
          <dd>
            {network.foodBiot === null ? (
              <span className="ma-absent">no food in this chain</span>
            ) : (
              <>
                {network.foodBiot.toPrecision(3)}
                <em className="ma-chain__verdict">{biotVerdict(network.foodBiot)}</em>
              </>
            )}
          </dd>
        </div>
      </dl>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
