/**
 * Cook-photo storage — user dish photos for cooked-it feed posts, stored in
 * the same R2 bucket the recipe-NFT hero images use (SERVER ONLY).
 *
 * Input is the data URL the existing /api/food-lab/upload endpoint already
 * produces (validated jpeg/png/webp, ≤5MB). We persist it under
 * cook-photos/<userId>/<hash>.<ext> and return the public URL — a feed row
 * carries a short URL instead of half a megabyte of base64 JSONB.
 */

import { createHash } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || "alchm-assets";
const R2_DOMAIN = (process.env.NEXT_PUBLIC_R2_DOMAIN || "https://assets.alchm.kitchen").replace(/\/$/, "");

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function cookPhotoStorageConfigured(): boolean {
  return Boolean(CF_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

let _s3: S3Client | null = null;
function r2(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      region: "auto",
      endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID as string,
        secretAccessKey: R2_SECRET_ACCESS_KEY as string,
      },
    });
  }
  return _s3;
}

/**
 * Persist a dish-photo data URL to R2. Returns the public URL, or null when
 * storage is unconfigured, the payload is malformed, or the write fails —
 * callers post the card without a photo rather than failing the share.
 */
export async function storeCookPhoto(userId: string, dataUrl: string): Promise<string | null> {
  if (!cookPhotoStorageConfigured()) return null;
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mime, b64] = match;
  const buf = Buffer.from(b64, "base64");
  if (buf.length === 0 || buf.length > MAX_BYTES) return null;

  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 24);
  const key = `cook-photos/${userId}/${hash}.${MIME_EXT[mime]}`;
  try {
    await r2().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: new Uint8Array(buf),
        ContentType: mime,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${R2_DOMAIN}/${key}`;
  } catch (err) {
    console.error("[cookPhotoStorage] R2 put failed:", err);
    return null;
  }
}

/**
 * Persist a table-memory photo data URL to R2. Same validation/cap as
 * storeCookPhoto (5MB, jpeg/png/webp); key prefix `table-photos/<tableId>/`
 * (docs/plans/tables-program-sequencing.md Reconciliation 3 — the shared R2
 * key-prefix convention). Returns the public URL, or null on any failure so
 * callers can fail the upload without failing the table mutation it's
 * attached to.
 */
export async function storeTablePhoto(tableId: string, dataUrl: string): Promise<string | null> {
  if (!cookPhotoStorageConfigured()) return null;
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mime, b64] = match;
  const buf = Buffer.from(b64, "base64");
  if (buf.length === 0 || buf.length > MAX_BYTES) return null;

  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 24);
  const key = `table-photos/${tableId}/${hash}.${MIME_EXT[mime]}`;
  try {
    await r2().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: new Uint8Array(buf),
        ContentType: mime,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${R2_DOMAIN}/${key}`;
  } catch (err) {
    console.error("[cookPhotoStorage] R2 put failed (table photo):", err);
    return null;
  }
}

/**
 * Persist a chat-message photo data URL to R2. Same validation/cap as
 * storeCookPhoto (5MB, jpeg/png/webp); key prefix `chat-photos/<userId>/`
 * (docs/plans/tables-program-sequencing.md Reconciliation 3). Returns the
 * public URL, or null on any failure — the send route fails the message
 * cleanly rather than posting a message missing its photo.
 */
export async function storeChatPhoto(userId: string, dataUrl: string): Promise<string | null> {
  if (!cookPhotoStorageConfigured()) return null;
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mime, b64] = match;
  const buf = Buffer.from(b64, "base64");
  if (buf.length === 0 || buf.length > MAX_BYTES) return null;

  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 24);
  const key = `chat-photos/${userId}/${hash}.${MIME_EXT[mime]}`;
  try {
    await r2().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: new Uint8Array(buf),
        ContentType: mime,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${R2_DOMAIN}/${key}`;
  } catch (err) {
    console.error("[cookPhotoStorage] R2 put failed (chat photo):", err);
    return null;
  }
}
