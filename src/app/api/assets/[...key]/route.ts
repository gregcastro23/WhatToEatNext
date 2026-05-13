import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

let r2Client: S3Client | null = null;

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  r2Client ??= new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return r2Client;
}

function contentTypeForKey(key: string) {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".avif")) return "image/avif";
  return "application/octet-stream";
}

function assetKeyFromParams(parts: string[]) {
  const key = parts.map(decodeURIComponent).join("/");
  if (!key || key.includes("..") || key.startsWith("/")) return null;
  return key;
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ key: string[] }> },
) {
  const { key: parts } = await props.params;
  const key = assetKeyFromParams(parts ?? []);
  if (!key) {
    return NextResponse.json({ error: "Invalid asset key" }, { status: 400 });
  }

  const bucket = process.env.R2_BUCKET_NAME;
  const client = getR2Client();
  if (!bucket || !client) {
    return NextResponse.json(
      { error: "Asset storage is not configured" },
      { status: 503 },
    );
  }

  try {
    const object = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const bytes = await object.Body?.transformToByteArray();

    if (!bytes) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": object.ContentType ?? contentTypeForKey(key),
        "Cache-Control": `public, max-age=${ONE_WEEK_SECONDS}, stale-while-revalidate=${ONE_WEEK_SECONDS}`,
      },
    });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "$metadata" in error
      ? (error as { $metadata?: { httpStatusCode?: number } }).$metadata
          ?.httpStatusCode
      : undefined;

    return NextResponse.json(
      { error: status === 404 ? "Asset not found" : "Failed to load asset" },
      { status: status === 404 ? 404 : 502 },
    );
  }
}
