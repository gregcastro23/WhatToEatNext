import { NextResponse } from "next/server";
import { ASSET_DOMAIN } from "@/constants";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";
import type { NextRequest } from "next/server";

const RATE_LIMIT = { window: 60_000, max: 10, bucket: "nanobanana-generate" };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rl = rateLimit(req, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Missing recipe title." }, { status: 400 });
    }

    const agentBaseUrl = process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL || "https://agents.alchm.kitchen";

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
    
    // Ensure the URL uses the assets subdomain if it's an alchm.kitchen URL
    if (data.url && typeof data.url === "string" && data.url.includes("alchm.kitchen") && !data.url.includes(ASSET_DOMAIN.replace("https://", ""))) {
      data.url = data.url.replace("alchm.kitchen", ASSET_DOMAIN.replace("https://", ""));
    }

    return NextResponse.json(data);

  } catch (_err) {
    return NextResponse.json(
      { error: "Failed to generate recipe image" },
      { status: 500 },
    );
  }
}
