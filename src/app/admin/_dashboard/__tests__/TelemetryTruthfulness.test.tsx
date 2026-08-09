import { render, screen } from "@testing-library/react";
import {
  APIHeatmap,
  CosmicYieldEconomy,
  RecipeQualityInspector,
} from "@/app/admin/_dashboard/extras";
import { FALLBACK_DATA } from "@/app/admin/_dashboard/data";

describe("admin telemetry truthfulness", () => {
  it("marks missing route-volume and database telemetry instead of inventing traffic", () => {
    render(<APIHeatmap db={FALLBACK_DATA.dbObservability} />);

    expect(screen.getByText("◌ NOT INSTRUMENTED")).toBeInTheDocument();
    expect(
      screen.getByText(/Database slow-query telemetry is unavailable/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/1\.3M requests/)).not.toBeInTheDocument();
  });

  it("uses ledger aggregates while disclosing absent token time-series and Gini data", () => {
    render(
      <CosmicYieldEconomy
        data={{
          inCirculation: 1_000,
          minted30d: 300,
          burned30d: 100,
          netFlow30d: 200,
          sinks24h: [],
          topHolders: [{ handle: "@holder", balance: 250 }],
          live: true,
        }}
      />,
    );

    expect(
      screen.getByText("Daily time-series telemetry is not yet persisted."),
    ).toBeInTheDocument();
    expect(screen.getByText("25.0%")).toBeInTheDocument();
    expect(
      screen.getByText(/A true Gini coefficient requires/),
    ).toBeInTheDocument();
    expect(screen.queryByText("0.42")).not.toBeInTheDocument();
  });

  it("shows an honest empty state when no live recipe-quality data exists", () => {
    render(<RecipeQualityInspector trending={{ recipes: [], live: false }} />);

    expect(screen.getByText("○ NO SOURCE")).toBeInTheDocument();
    expect(screen.getByText(/No live recipe-quality rows/)).toBeInTheDocument();
    expect(
      screen.queryByText(/Braised cheek · pomegranate/),
    ).not.toBeInTheDocument();
  });
});
