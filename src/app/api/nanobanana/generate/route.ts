import { createHash } from "crypto";
import { getServiceUrl } from "@/lib/serviceUrls";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";
import { redisGet, redisSet } from "@/lib/redis";
import type { NextRequest } from "next/server";

const RATE_LIMIT = { window: 60_000, max: 10, bucket: "nanobanana-generate" };
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(req, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing recipe title." }, { status: 400 });
    }

    // Generate a unique cache key based on the content
    const hash = createHash("sha256")
      .update(`${title}|${description || ""}`)
      .digest("hex")
      .substring(0, 16);
    const cacheKey = `gen_image:${hash}`;

    // Try to get cached result
    try {
      const cached = await redisGet<unknown>(cacheKey);
      if (cached) {
        console.debug("[NanoBanana] Serving cached image result");
        return NextResponse.json(cached);
      }
    } catch (err) {
      console.warn("[NanoBanana] Redis read failed:", err);
    }

    // PA's image-gen route is served by the Python backend at
    // api.agents.alchm.kitchen — the bare agents.alchm.kitchen host is the
    // Next.js UI and does not serve /api/generate-image (would 404 silently).
    const agentBaseUrl = getServiceUrl("planetaryAgentsApi");

    // /api/generate-image expects { prompt }, not { title, description }.
    const promptParts = [
      `Professional food photography of "${title}".`,
      description ? `${description}.` : "",
      "Beautifully plated, natural lighting, restaurant-quality, ultra-realistic, high detail. No text, labels, or watermarks.",
    ].filter(Boolean);
    const imagePrompt = promptParts.join(" ");

    const response = await fetch(`${agentBaseUrl}/api/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: imagePrompt }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Cache the successful result
    if (data.url) {
      await redisSet(cacheKey, data, CACHE_TTL).catch((err) =>
        console.warn("[NanoBanana] Redis write failed:", err),
      );
    }

    return NextResponse.json(data);
  } catch (_err) {
    console.error("[NanoBanana] Generation failed:", _err);
    return NextResponse.json({ error: "Failed to generate recipe image" }, { status: 500 });
  }
}
