/**
 * @file src/lib/mcp/culinaryProfileSecurity.ts
 *
 * Input sanitization, bounded arrays, and allergen removal safeguards
 * for the MCP update_culinary_profile tool and autonomous Muse agents.
 */
import { normalizeDisallowedKey } from "@/lib/cooking/recipeGateAllergens";
import {
  sanitizeSecurityString,
  sanitizeSecurityStringArray,
} from "./httpSecurity";

export interface SanitizedProfilePayload {
  addAllergens: string[];
  removeAllergens: string[];
  addDislikes: string[];
  removeDislikes: string[];
  dietaryFrameworks?: string[];
  kitchenEquipment?: string[];
  setDiet?: string;
  spiceTolerance?: string;
  householdSize?: number;
  confirmAllergenRemoval?: boolean;
}

export interface AllergenRemovalAudit {
  warning?: string;
  criticalNotice?: string;
  removedAllergens: string[];
  blocked?: boolean;
}

export function sanitizeProfilePayload(
  args: Record<string, unknown>,
): SanitizedProfilePayload {
  const payload: SanitizedProfilePayload = {
    addAllergens: sanitizeSecurityStringArray(args.addAllergens, 30, 64),
    removeAllergens: sanitizeSecurityStringArray(args.removeAllergens, 30, 64),
    addDislikes: sanitizeSecurityStringArray(args.addDislikes, 50, 64),
    removeDislikes: sanitizeSecurityStringArray(args.removeDislikes, 50, 64),
  };

  if (Array.isArray(args.dietaryFrameworks)) {
    payload.dietaryFrameworks = sanitizeSecurityStringArray(
      args.dietaryFrameworks,
      20,
      64,
    );
  }
  if (Array.isArray(args.kitchenEquipment)) {
    payload.kitchenEquipment = sanitizeSecurityStringArray(
      args.kitchenEquipment,
      30,
      64,
    );
  }
  if (typeof args.setDiet === "string") {
    payload.setDiet = sanitizeSecurityString(args.setDiet, 64);
  }
  if (typeof args.spiceTolerance === "string") {
    payload.spiceTolerance = sanitizeSecurityString(args.spiceTolerance, 20);
  }
  if (typeof args.householdSize === "number" && Number.isFinite(args.householdSize)) {
    payload.householdSize = Math.max(1, Math.min(20, Math.round(args.householdSize)));
  }
  if (typeof args.confirmAllergenRemoval === "boolean") {
    payload.confirmAllergenRemoval = args.confirmAllergenRemoval;
  }

  return payload;
}

export function auditAllergenRemoval(
  existingAllergens: string[],
  requestedRemovals: string[],
  confirmed = false,
): AllergenRemovalAudit {
  const existingSet = new Set(existingAllergens.map(normalizeDisallowedKey));
  const targeted: string[] = [];

  for (const rem of requestedRemovals) {
    const norm = normalizeDisallowedKey(rem);
    if (existingSet.has(norm)) {
      targeted.push(norm);
    }
  }

  if (targeted.length === 0) {
    return { removedAllergens: [] };
  }

  const listStr = targeted.join(", ");
  if (!confirmed) {
    return {
      removedAllergens: [],
      blocked: true,
      warning: `Allergen removal blocked: Attempted to remove [${listStr}] without confirmation.`,
      criticalNotice:
        "Physical safety protection: Removing allergens requires explicit confirmation. Set 'confirmAllergenRemoval: true' after obtaining explicit user consent.",
    };
  }

  return {
    removedAllergens: targeted,
    blocked: false,
    warning: `Active allergen guardrails were removed from profile: [${listStr}].`,
    criticalNotice:
      "If this action was initiated by an automated agent or prompt without explicit confirmation, reinstate immediately to prevent physical allergen exposure.",
  };
}

