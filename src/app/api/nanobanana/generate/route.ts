import { createHash } from "crypto";
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
      const cached = await redisGet(cacheKey);
      if (cached) {
        console.debug("[NanoBanana] Serving cached image result");
        return NextResponse.json(JSON.parse(cached));
      }
    } catch (err) {
      console.warn("[NanoBanana] Redis read failed:", err);
    }

    const agentBaseUrl =
      process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL || "https://agents.alchm.kitchen";

    const response = await fetch(`${agentBaseUrl}/api/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Cache the successful result
    if (data.url) {
      await redisSet(cacheKey, JSON.stringify(data), CACHE_TTL).catch((err) =>
        console.warn("[NanoBanana] Redis write failed:", err),
      );
    }

    return NextResponse.json(data);
  } catch (_err) {
    console.error("[NanoBanana] Generation failed:", _err);
    return NextResponse.json({ error: "Failed to generate recipe image" }, { status: 500 });
  }
}
