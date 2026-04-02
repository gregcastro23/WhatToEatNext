import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    if (!title) {
       return NextResponse.json({ error: "Missing recipe title." }, { status: 400 });
    }

    // Call the Python Alchemical Engine on Port 8001
    // For Vercel, this uses your public Mac Mini URL. Locally, it defaults to localhost:8001.
    const backendUrl = process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL || 'http://localhost:8001';
    
    const response = await fetch(`${backendUrl}/api/generate-alchemical-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
       const errText = await response.text();
       console.error("Backend image generation error:", errText);
       throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    // data contains { url: "...", prompt: "..." }
    return NextResponse.json(data);

  } catch (error) {
    console.error("Nanobanana image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe image" },
      { status: 500 }
    );
  }
}
