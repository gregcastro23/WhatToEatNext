"use client";

/**
 * useLivePotSimulation — Real-time collaborative kitchen physics hook over SpacetimeDB.
 *
 * Provides real-time synchronization of pot simmer reduction, burner power adjustments,
 * lid seal transitions, and target doneness alarms across chef and line cook devices.
 *
 * Features:
 *  - SpacetimeDB table push subscription (`live_pot`)
 *  - 60 FPS requestAnimationFrame (RAF) timer interpolation between server ticks for smooth gauges
 *  - Full optimistic local simulation fallback for offline / disconnected developer environments
 *
 * @file src/lib/spacetime/hooks/useLivePotSimulation.ts
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Timestamp } from "spacetimedb";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import {
  VAPOUR_ESCAPE_FRACTIONS,
  LATENT_HEAT_SATURATION_100C_J_KG,
  compute_pot_simmer_step,
} from "@/lib/cooking/thermoSimmerMath";
import { isLivePotEnabled } from "@/lib/spacetime/config";
import type { LivePot as StdbLivePotRow } from "@/lib/spacetime/generated/types";

export interface LivePotState {
  potId: string;
  sessionId: string;
  recipeRef: string;
  vesselName: string;
  initialVolL: number;
  currentVolL: number;
  concentrationRatio: number;
  burnerPowerW: number;
  lidSeal: number; // 0 = none, 1 = cracked, 2 = loose, 3 = tight
  targetReductionPct: number;
  isBoiling: boolean;
  alarmTriggered: boolean;
  startTimeMs: number;
  lastTickMs: number;
  ownerHex: string;
}

export interface UseLivePotSimulationResult {
  status: "live_connected" | "optimistic_local" | "connecting";
  isOwner: boolean;
  pot: LivePotState;
  interpolatedVolL: number;
  interpolatedConcentration: number;
  percentReduced: number;
  estimatedMinutesRemaining: number | null;
  createPot: (opts: {
    vesselName?: string;
    initialVolL?: number;
    burnerPowerW?: number;
    lidSeal?: number;
    targetReductionPct?: number;
    recipeRef?: string;
  }) => Promise<void>;
  setControls: (burnerPowerW: number, lidSeal: number) => Promise<void>;
  tickSimulation: () => Promise<void>;
  resetPot: () => Promise<void>;
}

export function useLivePotSimulation(
  sessionId = "default-kitchen"
): UseLivePotSimulationResult {
  const { connection, status: stdbStatus, identityHex } = useSpacetime();
  const enabled = isLivePotEnabled();

  // Optimistic / Local fallback state
  const [localPot, setLocalPot] = useState<LivePotState>(() => ({
    potId: "local-pot",
    sessionId,
    recipeRef: "demi-glace",
    vesselName: "All-Clad 3-Qt Saucier",
    initialVolL: 1.0,
    currentVolL: 1.0,
    concentrationRatio: 1.0,
    burnerPowerW: 1000,
    lidSeal: 0,
    targetReductionPct: 0.5,
    isBoiling: true,
    alarmTriggered: false,
    startTimeMs: Date.now(),
    lastTickMs: Date.now(),
    ownerHex: identityHex ?? "local-chef",
  }));

  // Remote SpacetimeDB state
  const [remotePot, setRemotePot] = useState<LivePotState | null>(null);

  // Active base pot (remote takes precedence when connected)
  const activePot = remotePot ?? localPot;
  const isOwner = identityHex ? activePot.ownerHex === identityHex : true;

  // RAF Interpolated volume state
  const [interpolatedVolL, setInterpolatedVolL] = useState<number>(activePot.currentVolL);
  const [interpolatedConcentration, setInterpolatedConcentration] = useState<number>(
    activePot.concentrationRatio
  );

  // Subscribe to SpacetimeDB `live_pot` table
  useEffect(() => {
    if (!enabled || !connection || stdbStatus !== "connected") {
      setRemotePot(null);
      return;
    }

    const refreshPots = (): void => {
      try {
        const rows = Array.from(connection.db.live_pot.iter());
        const matching = rows.find(
          (r: StdbLivePotRow) => r.sessionId === sessionId
        );

        if (matching) {
          setRemotePot({
            potId: String(matching.potId),
            sessionId: matching.sessionId,
            recipeRef: matching.recipeRef,
            vesselName: matching.vesselName,
            initialVolL: matching.initialVolL,
            currentVolL: matching.currentVolL,
            concentrationRatio: matching.concentrationRatio,
            burnerPowerW: matching.burnerPowerW,
            lidSeal: matching.lidSeal,
            targetReductionPct: matching.targetReductionPct,
            isBoiling: matching.isBoiling,
            alarmTriggered: matching.alarmTriggered,
            startTimeMs: Number(matching.startTime.microsSinceUnixEpoch / 1000n),
            lastTickMs: Number(matching.lastTick.microsSinceUnixEpoch / 1000n),
            ownerHex: matching.owner.toHexString(),
          });
        }
      } catch {
        // Fall back gracefully
      }
    };

    const handleApplied = (): void => { refreshPots(); };
    const handleInsert = (_ctx: unknown, row: StdbLivePotRow): void => {
      if (row.sessionId === sessionId) refreshPots();
    };
    const handleUpdate = (_ctx: unknown, _oldRow: StdbLivePotRow, newRow: StdbLivePotRow): void => {
      if (newRow.sessionId === sessionId) refreshPots();
    };

    connection.db.live_pot.onInsert(handleInsert);
    connection.db.live_pot.onUpdate(handleUpdate);

    connection
      .subscriptionBuilder()
      .onApplied(handleApplied)
      .subscribe([`SELECT * FROM live_pot WHERE session_id = '${sessionId}'`]);

    refreshPots();

    return (): void => {
      connection.db.live_pot.removeOnInsert(handleInsert);
      connection.db.live_pot.removeOnUpdate(handleUpdate);
    };
  }, [connection, stdbStatus, sessionId, enabled]);

  // High-precision RAF animation interpolation loop
  useEffect(() => {
    let animId: number;

    const tickFrame = (): void => {
      const now = Date.now();
      const elapsedSec = Math.max(0, (now - activePot.lastTickMs) / 1000);

      if (activePot.isBoiling && activePot.currentVolL > 0 && elapsedSec > 0) {
        const step = compute_pot_simmer_step({
          initialVolL: activePot.initialVolL,
          currentVolL: activePot.currentVolL,
          burnerPowerW: activePot.burnerPowerW,
          lidSeal: activePot.lidSeal,
          targetReductionPct: activePot.targetReductionPct,
          dtS: elapsedSec,
        });

        setInterpolatedVolL(step.currentVolL);
        setInterpolatedConcentration(step.concentrationRatio);
      } else {
        setInterpolatedVolL(activePot.currentVolL);
        setInterpolatedConcentration(activePot.concentrationRatio);
      }

      animId = requestAnimationFrame(tickFrame);
    };

    animId = requestAnimationFrame(tickFrame);
    return (): void => { cancelAnimationFrame(animId); };
  }, [activePot]);

  // Action: createPot
  const createPot = useCallback(
    async (opts: {
      vesselName?: string;
      initialVolL?: number;
      burnerPowerW?: number;
      lidSeal?: number;
      targetReductionPct?: number;
      recipeRef?: string;
    }): Promise<void> => {
      const vesselName = opts.vesselName ?? "All-Clad 3-Qt Saucier";
      const initialVolL = opts.initialVolL ?? 1.0;
      const burnerPowerW = opts.burnerPowerW ?? 1000;
      const lidSeal = opts.lidSeal ?? 0;
      const targetReductionPct = opts.targetReductionPct ?? 0.5;
      const recipeRef = opts.recipeRef ?? "simmer-reduction";

      if (enabled && connection && stdbStatus === "connected") {
        try {
          await connection.reducers.createLivePot({
            sessionId,
            recipeRef,
            vesselName,
            initialVolL,
            burnerPowerW,
            lidSeal,
            targetReductionPct,
          });
          return;
        } catch {
          // Fall through to local fallback
        }
      }

      // Optimistic local update
      const now = Date.now();
      setLocalPot({
        potId: `local-${now}`,
        sessionId,
        recipeRef,
        vesselName,
        initialVolL,
        currentVolL: initialVolL,
        concentrationRatio: 1.0,
        burnerPowerW,
        lidSeal,
        targetReductionPct,
        isBoiling: true,
        alarmTriggered: false,
        startTimeMs: now,
        lastTickMs: now,
        ownerHex: identityHex ?? "local-chef",
      });
    },
    [connection, stdbStatus, sessionId, enabled, identityHex]
  );

  // Action: setControls
  const setControls = useCallback(
    async (burnerPowerW: number, lidSeal: number): Promise<void> => {
      if (enabled && connection && stdbStatus === "connected" && remotePot) {
        try {
          await connection.reducers.setPotControls({
            potId: BigInt(remotePot.potId),
            burnerPowerW,
            lidSeal,
          });
          return;
        } catch {
          // Fall through to local
        }
      }

      setLocalPot((prev) => ({
        ...prev,
        burnerPowerW,
        lidSeal,
        lastTickMs: Date.now(),
      }));
    },
    [connection, stdbStatus, remotePot, enabled]
  );

  // Action: tickSimulation
  const tickSimulation = useCallback(async (): Promise<void> => {
    const now = Date.now();
    if (enabled && connection && stdbStatus === "connected" && remotePot) {
      try {
        await connection.reducers.tickPotSimulation({
          potId: BigInt(remotePot.potId),
          currentTime: Timestamp.now(),
        });
        return;
      } catch {
        // Fall through
      }
    }

    setLocalPot((prev) => {
      const elapsedSec = Math.max(0, (now - prev.lastTickMs) / 1000);
      const step = compute_pot_simmer_step({
        initialVolL: prev.initialVolL,
        currentVolL: prev.currentVolL,
        burnerPowerW: prev.burnerPowerW,
        lidSeal: prev.lidSeal,
        targetReductionPct: prev.targetReductionPct,
        dtS: elapsedSec,
      });

      return {
        ...prev,
        currentVolL: step.currentVolL,
        concentrationRatio: step.concentrationRatio,
        isBoiling: step.isBoiling,
        alarmTriggered: step.alarmTriggered,
        lastTickMs: now,
      };
    });
  }, [connection, stdbStatus, remotePot, enabled]);

  // Action: resetPot
  const resetPot = useCallback(async (): Promise<void> => {
    await createPot({
      vesselName: activePot.vesselName,
      initialVolL: activePot.initialVolL,
      burnerPowerW: activePot.burnerPowerW,
      lidSeal: activePot.lidSeal,
      targetReductionPct: activePot.targetReductionPct,
    });
  }, [createPot, activePot]);

  // Estimated time remaining to reach target reduction
  const estimatedMinutesRemaining = useMemo((): number | null => {
    if (!activePot.isBoiling || activePot.alarmTriggered || interpolatedVolL <= 0) {
      return 0;
    }
    const targetVol = (1 - activePot.targetReductionPct) * activePot.initialVolL;
    const volToLose = Math.max(0, interpolatedVolL - targetVol);
    const escapeFrac = VAPOUR_ESCAPE_FRACTIONS[activePot.lidSeal] ?? 1.0;
    const lossRateKgS = (activePot.burnerPowerW / LATENT_HEAT_SATURATION_100C_J_KG) * escapeFrac;
    const rhoKgL = 0.95835; // kg/L at 100°C saturation
    const volLossLPerS = lossRateKgS / rhoKgL;

    if (volLossLPerS <= 0) return null;
    const secRemaining = volToLose / volLossLPerS;
    return secRemaining / 60;
  }, [activePot, interpolatedVolL]);

  const percentReduced = Math.min(
    100,
    Math.max(
      0,
      ((activePot.initialVolL - interpolatedVolL) / activePot.initialVolL) * 100
    )
  );

  const status =
    enabled && stdbStatus === "connected" && remotePot
      ? "live_connected"
      : stdbStatus === "connecting"
      ? "connecting"
      : "optimistic_local";

  return {
    status,
    isOwner,
    pot: activePot,
    interpolatedVolL,
    interpolatedConcentration,
    percentReduced,
    estimatedMinutesRemaining,
    createPot,
    setControls,
    tickSimulation,
    resetPot,
  };
}
