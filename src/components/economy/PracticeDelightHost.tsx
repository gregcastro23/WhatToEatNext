"use client";

/**
 * The delight host — the only place invisible practice rewards become visible.
 *
 * Globally mounted (providers tree, like MasterQuestBroadcastListener). Listens
 * for PRACTICE_REWARD_EVENT from anywhere (firePractice results, server-granted
 * cooked-it rewards) and reveals the moment: a warm toast with the causal hint,
 * a token-rain splash in the reward's coin, and a site-wide balance refresh via
 * the existing tokenEconomy event bus. No other UI acknowledges practices exist.
 */

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { TokenRainParticles } from "@/components/economy/TokenRainParticles";
import { useToast } from "@/components/ToastProvider";
import { emitTokenEconomyUpdate } from "@/hooks/useTokenEconomy";
import {
  PRACTICE_REWARD_EVENT,
  discoverSurface,
  type PracticeReward,
} from "@/lib/economy/practiceClient";
import { DISCOVERABLE_SURFACES } from "@/lib/economy/practices";
import type { TokenType } from "@/types/economy";

const COIN_SYMBOLS: Record<string, string> = {
  Spirit: "🝇",
  Essence: "🝑",
  Matter: "🝙",
  Substance: "🝉",
};

const TOKEN_TYPES = new Set(["Spirit", "Essence", "Matter", "Substance"]);

function formatAmount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function PracticeDelightHost(): JSX.Element {
  const { showToast } = useToast();
  const [splash, setSplash] = useState(false);
  const [splashCoin, setSplashCoin] = useState<TokenType[]>(["Spirit"]);
  // Rewards can arrive faster than the 2.4s rain — queue so each gets its moment.
  const queue = useRef<PracticeReward[]>([]);
  const playing = useRef(false);

  const playNext = useCallback(() => {
    const reward = queue.current.shift();
    if (!reward) {
      playing.current = false;
      return;
    }
    playing.current = true;

    const symbol = COIN_SYMBOLS[reward.tokenType] ?? "✨";
    showToast(`+${formatAmount(reward.amount)} ${symbol} — ${reward.hint}`, "success", {
      duration: 4200,
    });
    if (TOKEN_TYPES.has(reward.tokenType)) {
      setSplashCoin([reward.tokenType as TokenType]);
      setSplash(true);
    }
    const coinKey = reward.tokenType.toLowerCase() as Lowercase<TokenType>;
    emitTokenEconomyUpdate({ source: "quest", credits: { [coinKey]: reward.amount } });
  }, [showToast]);

  useEffect(() => {
    const onReward = (e: Event) => {
      const detail = (e as CustomEvent<PracticeReward>).detail;
      if (!detail || typeof detail.amount !== "number" || detail.amount <= 0) return;
      queue.current.push(detail);
      if (!playing.current) playNext();
    };
    window.addEventListener(PRACTICE_REWARD_EVENT, onReward);
    return () => window.removeEventListener(PRACTICE_REWARD_EVENT, onReward);
  }, [playNext]);

  // Exploration firsts: the first-ever visit to each major surface quietly
  // pays once. One pathname watcher here covers every route — no per-page
  // wiring, nothing rendered.
  const pathname = usePathname();
  const { status } = useSession();
  useEffect(() => {
    if (status !== "authenticated" || !pathname) return;
    const segment = pathname.split("/").filter(Boolean)[0];
    if (segment && DISCOVERABLE_SURFACES.has(segment)) {
      discoverSurface(segment);
    }
  }, [pathname, status]);

  return (
    <TokenRainParticles
      trigger={splash}
      tokenTypes={splashCoin}
      count={14}
      onComplete={() => {
        setSplash(false);
        // Small gap so back-to-back rains read as distinct moments.
        setTimeout(playNext, 250);
      }}
    />
  );
}
