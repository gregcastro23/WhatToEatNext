/**
 * Shared narration for `feed_events` rows.
 *
 * Three surfaces (mini Live Network Feed widget, /feed page, /profile/[userId]
 * recent-activity) used to maintain three nearly-identical switch statements;
 * any new event type required edits across all three. They now compose against
 * this helper instead.
 *
 * Inputs are intentionally narrow: just `event_type` + the raw
 * `metadata_payload` JSONB. We extract a small set of well-known fields
 * (recipeName, targetName, topic, message, agentRole, etc.) and degrade to a
 * sensible title-cased fallback when none are present.
 */

export type FeedMetadata = Record<string, unknown> | null | undefined;

export interface FeedNarration {
  /** Single-character/emoji glyph for the leading icon slot. */
  icon: string;
  /** Past-tense verb phrase, joined to actor name: "<actor> <action>". */
  action: string;
  /** Short noun phrase suitable for a "Recent Activity" bullet point. */
  label: string;
  /** Optional href target — e.g. recipe permalink or PA chat. */
  href?: string;
}

function getString(meta: FeedMetadata, key: string): string | undefined {
  const value = meta?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function getNumber(meta: FeedMetadata, key: string): number | undefined {
  const value = meta?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function titleCase(input: string): string {
  return input
    .replaceAll(/[._]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * Heuristic narration for events whose `event_type` is one of the canonical
 * WTEN types OR a PA-emitted free-form type (e.g. "agent_chat",
 * "sous_chef.suggest_pairing"). Always returns a usable result; never throws.
 */
export function narrateFeedEvent(
  eventType: string | undefined,
  metadata: FeedMetadata,
): FeedNarration {
  const type = (eventType ?? "").trim();

  switch (type) {
    case "claim_daily":
      return {
        icon: "⚗️",
        action: "claimed their daily alchemical yield.",
        label: "Claimed daily yield",
      };

    case "commensal_request": {
      const targetName = getString(metadata, "targetName");
      return {
        icon: "🤝",
        action: targetName
          ? `sent a dining companion request to ${targetName}.`
          : "sent a dining companion request.",
        label: targetName
          ? `Dining request → ${targetName}`
          : "Sent a dining companion request",
      };
    }

    case "recipe_generation": {
      const recipeName = getString(metadata, "recipeName");
      const recipeId =
        getString(metadata, "recipeId") ?? getString(metadata, "recipe_id");
      const href = recipeId ? `/recipes/${recipeId}` : undefined;
      return {
        icon: "🍽️",
        action: recipeName
          ? `transmuted ingredients into ${recipeName}.`
          : "transmuted ingredients into a new recipe.",
        label: recipeName ? `Created recipe: ${recipeName}` : "Created a recipe",
        href,
      };
    }

    case "insight": {
      const title = getString(metadata, "insightTitle");
      return {
        icon: "👁️",
        action: title
          ? `channeled an alchemical insight: "${title}".`
          : "channeled a new alchemical insight.",
        label: title ? `Insight: ${title}` : "Channeled an insight",
      };
    }

    case "lab_entry": {
      const dishName = getString(metadata, "dishName");
      return {
        icon: "📓",
        action: dishName
          ? `recorded a new experiment: ${dishName}.`
          : "recorded a new experiment in their lab book.",
        label: dishName ? `Lab entry: ${dishName}` : "Lab experiment",
      };
    }

    case "made_it": {
      const recipeName = getString(metadata, "recipeName");
      const recipeId =
        getString(metadata, "recipeId") ?? getString(metadata, "recipe_id");
      const rating = getNumber(metadata, "rating");
      const base = recipeName ? `prepared ${recipeName}` : "prepared a community recipe";
      return {
        icon: "✅",
        action: rating ? `${base} and gave it ${rating} stars.` : `${base}.`,
        label: recipeName ? `Made: ${recipeName}` : "Made a community recipe",
        href: recipeId ? `/recipes/${recipeId}` : undefined,
      };
    }

    // --- PA-emitted agent events ---------------------------------------

    case "chat":
    case "agent_chat":
    case "agent.chat": {
      const targetName =
        getString(metadata, "targetName") ??
        getString(metadata, "withAgent") ??
        getString(metadata, "partnerName");
      const topic =
        getString(metadata, "topic") ??
        getString(metadata, "subject") ??
        getString(metadata, "summary");
      const messageExcerpt =
        getString(metadata, "messageExcerpt") ??
        getString(metadata, "message");

      const action = targetName
        ? topic
          ? `consulted with ${targetName} about ${topic}.`
          : `shared a thought with ${targetName}.`
        : topic
          ? `held a discourse on ${topic}.`
          : messageExcerpt
            ? `recorded a message: "${truncate(messageExcerpt, 80)}".`
            : "held an agent discourse.";

      const label = targetName
        ? topic
          ? `Discourse with ${targetName} · ${topic}`
          : `Discourse with ${targetName}`
        : topic
          ? `Discourse: ${topic}`
          : "Agent discourse";

      return { icon: "💬", action, label };
    }

    default:
      break;
  }

  // Role-prefixed PA events (e.g. "sous_chef.suggest_pairing",
  // "pantry.audit", "lineage.trace"). Surface the role + verb cleanly.
  if (type.includes(".")) {
    const [role, ...rest] = type.split(".");
    const verb = rest.join(".").replaceAll("_", " ");
    const item = getString(metadata, "item") ?? getString(metadata, "subject");
    const niceRole = titleCase(role);
    return {
      icon: "✨",
      action: item
        ? `${niceRole}: ${verb} (${item}).`
        : `${niceRole}: ${verb}.`,
      label: item ? `${niceRole} · ${verb} — ${item}` : `${niceRole} · ${verb}`,
    };
  }

  // Last-resort fallback: extract any common context fields rather than
  // emitting raw "agent_chat" text.
  const summary =
    getString(metadata, "summary") ??
    getString(metadata, "description") ??
    getString(metadata, "messageExcerpt") ??
    getString(metadata, "message");

  const fallbackLabel = type
    ? titleCase(type)
    : summary
      ? truncate(summary, 80)
      : "Network activity";

  return {
    icon: "✨",
    action: summary
      ? `${type ? `${titleCase(type)} — ` : ""}${truncate(summary, 100)}`
      : type
        ? `${titleCase(type)}.`
        : "recorded network activity.",
    label: fallbackLabel,
  };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
