import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { updateTasteCorrections } from "@/services/userInteractionsService";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updated = await updateTasteCorrections(session.user.id, body);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Taste correction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
