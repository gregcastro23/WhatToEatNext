/** @jest-environment node */
import { createServer } from "node:http";
import { AsolContractProbeService } from "../asolContractProbeService";

// Opt-in loopback proof; ordinary tests keep the repository's no-network stub.
const integrationTest = process.env.PHASE45_PROBE_HTTP === "1" ? it : it.skip;
const { fetch: fetchFn } = jest.requireActual(
  "next/dist/compiled/@edge-runtime/primitives/fetch",
);

integrationTest(
  "enforces the timeout and refuses a real HTTP redirect without forwarding its secret",
  async () => {
    let redirectedRequests = 0;
    const server = createServer((req, res) => {
      if (req.url?.startsWith("/api/internal/agent-roster")) {
        res.writeHead(302, { Location: "/redirect-target" }).end();
      } else if (req.url === "/redirect-target") {
        redirectedRequests++;
        res.end("unexpected");
      }
      // The sync-status connection deliberately remains unanswered.
    });
    try {
      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address();
      if (!address || typeof address === "string")
        throw new Error("Missing test listener");
      const service = new AsolContractProbeService(
        `http://127.0.0.1:${address.port}`,
      );
      const redirected = await service.probeAgentRoster("secret", { fetchFn });
      expect(redirected.passed).toBe(false);
      expect(redirectedRequests).toBe(0);
      const timedOut = await service.probeSyncStatus("secret", "timeout", {
        timeoutMs: 30,
        fetchFn,
      });
      expect(timedOut.passed).toBe(false);
      expect(timedOut.status).toBe(0);
    } finally {
      server.closeAllConnections();
      if (server.listening)
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
    }
  },
);
