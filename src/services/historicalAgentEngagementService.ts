/**
 * Historical Agent Autonomous Engagement Service — hourly participation across
 * recipe reviews/ratings (`recipe_review` + `recipe_reflections`), feed
 * comments (`feed_comments`), and chart-grounded `insight` feed posts.
 *
 * @file src/services/historicalAgentEngagementService.ts
 */

import { isBlockedBetween } from "@/lib/feed/commentEnforcement";
import { _logger } from "@/lib/logger";
import {
  buildCatalogCritiqueText,
  buildHistoricalFeedComment,
  buildHistoricalFeedInsight,
  computeAgentRecipeRating,
} from "@/lib/recipes/historicalAgentCopy";
import { selectRecipesForAgent } from "@/lib/recipes/historicalAgentPersona";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import { feedDatabase } from "@/services/feedDatabaseService";
import {
  ensureReflectionFuel,
  loadCandidatePostsWithCommenters,
  loadExistingReflectionIndex,
  loadHistoricalAgents,
  parseMeta,
  parseNatalPreview,
  toTimestampMs,
  type CandidateFeedPostRow,
  type HistoricalAgentEngagementResult,
  type PreparedAgent,
} from "@/services/historicalAgentEngagementQueries";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import type { Recipe } from "@/types/recipe";

export type { HistoricalAgentEngagementResult };

export interface HistoricalAgentEngagementOptions {
  reviewCount?: number;
  commentCount?: number;
  insightCount?: number;
  deadlineMs?: number;
  now?: Date;
}

function buildReviewMetadata(params: {
  agent: PreparedAgent;
  recipe: Recipe;
  rating: number;
  reviewText: string;
}): Record<string, unknown> {
  const { agent, recipe, rating, reviewText } = params;
  const dominantElement = agent.row.dominant_element ?? "Earth";
  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    review: reviewText,
    rating,
    score: rating,
    source: "historical_reflection",
    agentSlug: agent.slug,
    agentName: agent.displayName,
    dominantElement,
    contentState: "verified",
    mcpCatalog: true,
    planetarySignature: {
      dominantElement,
      natalPositions: parseNatalPreview(agent.row.natal_positions),
    },
  };
}

async function publishReviewForAgent(params: {
  agent: PreparedAgent;
  recipe: Recipe;
  hourKey: string;
  usedCounts: Map<string, number>;
  result: HistoricalAgentEngagementResult;
}): Promise<void> {
  const { agent, recipe, hourKey, usedCounts, result } = params;
  const rating = computeAgentRecipeRating({
    agentElement: agent.row.dominant_element,
    recipe,
    profile: agent.profile,
    slug: agent.slug,
  });
  const reviewText = buildCatalogCritiqueText({
    agentSlug: agent.slug,
    agentName: agent.displayName,
    dominantElement: agent.row.dominant_element,
    profile: agent.profile,
    recipe,
  });

  try {
    const pub = await feedDatabase.publishFeedEvent({
      actorId: agent.row.id,
      eventType: "recipe_review",
      deliveryId: `hist-review:${agent.slug}:${recipe.id}:${hourKey}`,
      skipWebhook: true,
      identity: { share: true, explicit: true },
      metadataPayload: buildReviewMetadata({ agent, recipe, rating, reviewText }),
    });
    if (pub.feedPublished) {
      result.recipesReviewed += 1;
      usedCounts.set(recipe.id, (usedCounts.get(recipe.id) ?? 0) + 1);
    }
    if (pub.recipeCommentSaved) result.reflectionsSaved += 1;
  } catch (err) {
    _logger.error(`[hist-engagement] recipe review failed for ${agent.slug}:`, err);
    result.errors += 1;
  }
}

async function runRecipeReviewsStep(params: {
  agents: PreparedAgent[];
  reviewCount: number;
  hourKey: string;
  deadlineMs: number;
  result: HistoricalAgentEngagementResult;
}): Promise<void> {
  const { agents, reviewCount, hourKey, deadlineMs, result } = params;
  if (reviewCount <= 0 || agents.length === 0) return;

  const [catalog, { reviewedByAgent, usedCounts }] = await Promise.all([
    LocalRecipeService.getAllRecipes(),
    loadExistingReflectionIndex(),
  ]);
  const publicCatalog = catalog.filter((r) => r.isPublic !== false);
  if (publicCatalog.length === 0) return;

  for (const agent of agents) {
    if (result.recipesReviewed >= reviewCount || Date.now() >= deadlineMs) break;
    if (!(await ensureReflectionFuel(agent, result))) continue;

    const already = reviewedByAgent.get(agent.row.id) ?? new Set<string>();
    const available = publicCatalog.filter((r) => !already.has(r.id));
    const [chosen] = selectRecipesForAgent(agent.slug, agent.profile, available, 1, usedCounts, hourKey);
    if (!chosen) continue;

    await publishReviewForAgent({ agent, recipe: chosen, hourKey, usedCounts, result });
  }
}

async function pickCommenterForPost(params: {
  agents: PreparedAgent[];
  post: CandidateFeedPostRow;
  alreadyCommenters: Set<string>;
  startCursor: number;
}): Promise<{ agent: PreparedAgent; nextCursor: number } | null> {
  const { agents, post, alreadyCommenters, startCursor } = params;
  for (let tried = 0; tried < agents.length; tried += 1) {
    const candidate = agents[(startCursor + tried) % agents.length];
    if (!candidate) continue;
    if (candidate.row.id === post.actor_id || alreadyCommenters.has(candidate.row.id)) continue;
    if (await isBlockedBetween(candidate.row.id, post.actor_id)) continue;
    return {
      agent: candidate,
      nextCursor: (startCursor + tried + 1) % agents.length,
    };
  }
  return null;
}

async function runFeedCommentsStep(params: {
  agents: PreparedAgent[];
  commentCount: number;
  deadlineMs: number;
  result: HistoricalAgentEngagementResult;
}): Promise<void> {
  const { agents, commentCount, deadlineMs, result } = params;
  if (commentCount <= 0 || agents.length === 0) return;

  const { posts, commentedByEvent } = await loadCandidatePostsWithCommenters();
  if (posts.length === 0) return;

  let agentCursor = 0;
  for (const post of posts) {
    if (result.feedCommentsPosted >= commentCount || Date.now() >= deadlineMs) break;
    const alreadyCommenters = commentedByEvent.get(post.id) ?? new Set<string>();
    const picked = await pickCommenterForPost({ agents, post, alreadyCommenters, startCursor: agentCursor });
    if (!picked) continue;
    agentCursor = picked.nextCursor;

    const body = buildHistoricalFeedComment({
      commenterName: picked.agent.displayName,
      commenterElement: picked.agent.row.dominant_element,
      postActorName: (post.actor_name ?? "").trim() || "Alchemist",
      eventType: post.event_type,
      metadata: parseMeta(post.metadata_payload),
      profile: picked.agent.profile,
    });

    try {
      const created = await feedCommentsDatabase.createComment(post.id, picked.agent.row.id, body);
      if (created) {
        result.feedCommentsPosted += 1;
        alreadyCommenters.add(picked.agent.row.id);
        commentedByEvent.set(post.id, alreadyCommenters);
      }
    } catch (err) {
      _logger.error(`[hist-engagement] feed comment failed for ${picked.agent.slug}:`, err);
      result.errors += 1;
    }
  }
}

async function publishInsightForAgent(params: {
  agent: PreparedAgent;
  hourBucket: number;
  result: HistoricalAgentEngagementResult;
}): Promise<void> {
  const { agent, hourBucket, result } = params;
  const { insightTitle, insightContent, summary } = buildHistoricalFeedInsight({
    slug: agent.slug,
    dominantElement: agent.row.dominant_element,
    profile: agent.profile,
    hourBucket,
  });

  try {
    const pub = await feedDatabase.publishFeedEvent({
      actorId: agent.row.id,
      eventType: "insight",
      deliveryId: `hist-insight:${agent.slug}:${hourBucket}`,
      skipWebhook: true,
      identity: { share: true, explicit: true },
      metadataPayload: {
        insightTitle, insightContent, summary, actionType: "insight",
        agentSlug: agent.slug, agentName: agent.displayName, mcpCatalog: true,
        planetarySignature: {
          dominantElement: agent.row.dominant_element ?? "Earth",
          natalPositions: parseNatalPreview(agent.row.natal_positions),
        },
      },
    });
    if (pub.feedPublished) result.feedInsightsPosted += 1;
  } catch (err) {
    _logger.error(`[hist-engagement] feed insight failed for ${agent.slug}:`, err);
    result.errors += 1;
  }
}

async function runFeedInsightsStep(params: {
  agents: PreparedAgent[];
  insightCount: number;
  hourBucket: number;
  deadlineMs: number;
  result: HistoricalAgentEngagementResult;
}): Promise<void> {
  const { agents, insightCount, hourBucket, deadlineMs, result } = params;
  if (insightCount <= 0 || agents.length === 0) return;

  const byLeastRecentPost = [...agents].sort(
    (a, b) => toTimestampMs(a.row.last_posted_at) - toTimestampMs(b.row.last_posted_at),
  );

  for (const agent of byLeastRecentPost) {
    if (result.feedInsightsPosted >= insightCount || Date.now() >= deadlineMs) break;
    await publishInsightForAgent({ agent, hourBucket, result });
  }
}

/**
 * Execute one hourly pass of historical-agent recipe reviews/ratings,
 * feed comments, and feed insights within the provided deadline budget.
 */
export async function runHistoricalAgentEngagement(
  options: HistoricalAgentEngagementOptions = {},
): Promise<HistoricalAgentEngagementResult> {
  const now = options.now ?? new Date();
  const hourBucket = Math.floor(now.getTime() / 3_600_000);
  const hourKey = now.toISOString().slice(0, 13);
  const deadlineMs = options.deadlineMs ?? Date.now() + 45_000;
  const result: HistoricalAgentEngagementResult = {
    agentsEligible: 0,
    yieldsClaimed: 0,
    recipesReviewed: 0,
    reflectionsSaved: 0,
    feedCommentsPosted: 0,
    feedInsightsPosted: 0,
    errors: 0,
  };

  const agents = await loadHistoricalAgents();
  result.agentsEligible = agents.length;
  if (agents.length === 0) return result;

  await runRecipeReviewsStep({ agents, reviewCount: options.reviewCount ?? 3, hourKey, deadlineMs, result });
  await runFeedCommentsStep({ agents, commentCount: options.commentCount ?? 3, deadlineMs, result });
  await runFeedInsightsStep({ agents, insightCount: options.insightCount ?? 2, hourBucket, deadlineMs, result });
  return result;
}
