import { render, screen } from "@testing-library/react";
import { ContractProbeCard } from "../ConnectivitySection";
import type { ContractProbeSummary } from "@/services/admin/adminAgentsTypes";

it.each<[ContractProbeSummary["verdict"], string]>([
  ["healthy", "Receiver Healthy"],
  ["degraded", "Receiver Degraded"],
  ["unreachable", "Receiver Unreachable"],
])("displays the %s receiver scope and evidence", (verdict, label) => {
  const check = { passed: false, status: 404 };
  render(
    <ContractProbeCard
      probe={{
        success: verdict === "healthy",
        verdict,
        vantage: "wten-internal-receiver",
        destination: "https://wten.example.com",
        timeoutMs: 3000,
        timestamp: "2026-10-14T12:00:00Z",
        checks: {
          agentRosterAuth: check,
          syncStatusAuth: check,
          vesselAuth: { ...check, message: "Vessel ledger unverified" },
          checkSharedAuth: check,
          negativeControls: {
            passed: false,
            allRejectedWith401: false,
            statuses: {},
          },
        },
      }}
    />,
  );
  expect(screen.getByText(label)).toBeInTheDocument();
  expect(
    screen.getByText(/wten-internal-receiver.*wten.example.com.*3000 ms/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /ASOL delivery, signing, queues, and retries are untested/,
    ),
  ).toBeInTheDocument();
  expect(screen.getByText("Vessel ledger unverified")).toBeInTheDocument();
});
