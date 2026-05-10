import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";

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

    const backendUrl = process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL || "http://localhost:8001";

    const response = await fetch(`${backendUrl}/api/generate-alchemical-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (_err) {
    return NextResponse.json(
      { error: "Failed to generate recipe image" },
      { status: 500 },
    );
  }
}
