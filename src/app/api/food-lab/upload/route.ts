/**
 * Food Lab Image Upload API
 * POST /api/food-lab/upload
 *
 * Accepts a multipart/form-data request with an image file.
 * Converts the file to a base64 data URL and returns it.
 * For production, swap the base64 storage for a cloud storage provider (S3, Cloudinary, etc.).
 */

import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/validateRequest";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid form data" },
      { status: 400 },
    );
  }

  const file = formData.get("image") as File | null;
  if (!file) {
    return NextResponse.json(
      { success: false, message: "No image file provided (field name: image)" },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: `Unsupported image type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, message: `Image too large (max 5 MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB)` },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  return NextResponse.json({
    success: true,
    dataUrl,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  });
}
