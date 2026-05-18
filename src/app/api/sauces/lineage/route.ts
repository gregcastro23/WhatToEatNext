/**
 * GET /api/sauces/lineage?root=<id>
 *
 * Returns the derivation graph for the requested mother sauce: the root node
 * plus its variants (depth 1) and edges from root → each variant. Source data
 * lives in `backend/alchm_kitchen/data/json/sauces.json`.
 *
 * `root` is required (400 otherwise) and is matched case-insensitively against
 * both the key and the human-readable `name` so callers can pass either.
 *
 * Response contract: SauceLineageResponseSchema in src/lib/schemas/dashboard.ts.
 */

import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { SauceLineageResponseSchema } from "@/lib/schemas/dashboard";

export const dynamic = "force-dynamic";

const SAUCES_JSON_PATH = path.join(
  process.cwd(),
  "backend",
  "alchm_kitchen",
  "data",
  "json",
  "sauces.json",
);

interface RawSauce {
  name?: string;
  base?: string;
  cuisine?: string;
  variants?: string[] | null;
}

let saucesCache: Record<string, RawSauce> | null = null;

function loadSauces(): Record<string, RawSauce> {
  if (saucesCache) return saucesCache;
  const raw = fs.readFileSync(SAUCES_JSON_PATH, "utf-8");
  saucesCache = JSON.parse(raw) as Record<string, RawSauce>;
  return saucesCache;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findRoot(
  data: Record<string, RawSauce>,
  rootParam: string,
): { key: string; entry: RawSauce } | null {
  const needle = rootParam.toLowerCase();
  // Direct key hit first.
  for (const [key, entry] of Object.entries(data)) {
    if (key.toLowerCase() === needle) return { key, entry };
  }
  // Then fuzzy-match against the slugified name.
  for (const [key, entry] of Object.entries(data)) {
    if (entry?.name && slugify(entry.name) === slugify(rootParam)) {
      return { key, entry };
    }
  }
  // Finally a substring match on either key or name.
  for (const [key, entry] of Object.entries(data)) {
    if (
      key.toLowerCase().includes(needle) ||
      (entry?.name && entry.name.toLowerCase().includes(needle))
    ) {
      return { key, entry };
    }
  }
  return null;
}

export async function GET(request: Request) {
  const rl = await rateLimit(request, {
    window: 60_000,
    max: 60,
    bucket: "sauces-lineage",
  });
  if (!rl.allowed) return rl.response!;

  try {
    const { searchParams } = new URL(request.url);
    const rootParam = searchParams.get("root");
    if (!rootParam || !rootParam.trim()) {
      return NextResponse.json(
        { error: "Query parameter `root` is required (e.g. ?root=bechamel)." },
        { status: 400 },
      );
    }

    const sauces = loadSauces();
    const match = findRoot(sauces, rootParam.trim());
    if (!match) {
      return NextResponse.json(
        { error: `Unknown sauce root: ${rootParam}` },
        { status: 404 },
      );
    }

    const { key: rootKey, entry: rootEntry } = match;
    const rootId = rootKey;
    const rootLabel = rootEntry.name ?? rootKey;
    const variants = Array.isArray(rootEntry.variants) ? rootEntry.variants : [];

    const usedIds = new Set<string>([rootId]);
    const nodes = [{ id: rootId, label: rootLabel, depth: 0 }];
    const edges: Array<{ from: string; to: string }> = [];

    for (const variantLabel of variants) {
      let vid = slugify(variantLabel);
      // Disambiguate if a slug collision occurs across variants.
      if (usedIds.has(vid)) {
        let i = 2;
        while (usedIds.has(`${vid}-${i}`)) i++;
        vid = `${vid}-${i}`;
      }
      usedIds.add(vid);
      nodes.push({ id: vid, label: variantLabel, depth: 1 });
      edges.push({ from: rootId, to: vid });
    }

    const maxDepth = nodes.reduce((d, n) => Math.max(d, n.depth), 0);

    const body = SauceLineageResponseSchema.parse({
      root: rootId,
      nodes,
      edges,
      stats: {
        depth: maxDepth,
        nodes: nodes.length,
        variants: variants.length,
      },
    });

    return NextResponse.json(body);
  } catch (error) {
    console.error("[sauces/lineage] Error:", error);
    return NextResponse.json(
      { error: "Failed to load sauce lineage" },
      { status: 500 },
    );
  }
}
