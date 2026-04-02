/**
 * Daily Insight Service
 *
 * Generates personalized daily cosmic insights for premium users
 * by comparing their natal chart against current planetary transits.
 *
 * Reuses ChartComparisonService for the actual comparison logic.
 */

import { _logger } from "@/lib/logger";
import { compareCharts } from "@/services/ChartComparisonService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import type { NatalChart } from "@/types/natalChart";
import type { UserNotification } from "@/types/notification";

interface DailyInsightContent {
  title: string;
  message: string;
  metadata: Record<string, any>;
}

/**
 * Generate the content for a daily cosmic insight based on natal chart vs current transits.
 */
export async function generateDailyInsightContent(
  natalChart: NatalChart,
): Promise<DailyInsightContent> {
  const comparison = await compareCharts(natalChart);
  const harmony = comparison.overallHarmony;
  const { favorableElements, harmonicPlanets, recommendations } = comparison.insights;

  // Build a human-readable title based on harmony score
  let title: string;
  if (harmony >= 0.75) {
    title = "Cosmic Harmony is Strong Today";
  } else if (harmony >= 0.55) {
    title = "A Balanced Cosmic Day Ahead";
  } else {
    title = "A Day for Grounding & Comfort";
  }

  // Build the message
  const parts: string[] = [];

  parts.push(
    `Your cosmic alignment score today is ${Math.round(harmony * 100)}%.`,
  );

  if (favorableElements.length > 0) {
    parts.push(
      `${favorableElements.join(" and ")} energies are most aligned with your natal chart right now.`,
    );
  }

  if (harmonicPlanets.length > 0) {
    const planetList = harmonicPlanets.slice(0, 3).join(", ");
    parts.push(`${planetList} are in harmonic resonance with your birth chart.`);
  }

  if (recommendations.length > 0) {
    parts.push(recommendations[0]);
  }

  const message = parts.join(" ");

  const metadata = {
    overallHarmony: harmony,
    elementalHarmony: comparison.elementalHarmony,
    alchemicalAlignment: comparison.alchemicalAlignment,
    planetaryResonance: comparison.planetaryResonance,
    favorableElements,
    harmonicPlanets,
    recommendations,
    dominantElement: comparison.momentChart.dominantElement,
    calculatedAt: comparison.calculatedAt,
  };

  return { title, message, metadata };
}

/**
 * Generate and persist a daily insight notification for a user.
 * Returns null if an insight was already generated today.
 */
export async function generateDailyInsightNotification(
  userId: string,
  natalChart: NatalChart,
): Promise<UserNotification | null> {
  try {
    // Rate limit: one daily insight per user per day
    const alreadyGenerated = await notificationDatabase.hasDailyInsightToday(userId);
    if (alreadyGenerated) {
      _logger.info("Daily insight already generated today", { userId } as any);
      return null;
    }

    const { title, message, metadata } = await generateDailyInsightContent(natalChart);

    const notification = await notificationDatabase.createNotification(
      userId,
      "daily_insight",
      title,
      message,
      { metadata },
    );

    _logger.info("Daily insight generated", {
      userId,
      harmony: metadata.overallHarmony,
    } as any);

    return notification;
  } catch (error) {
    _logger.error("Failed to generate daily insight", error as any);
    return null;
  }
}
