/**
 * Avatar storage — user profile avatars in the same R2 bucket the cook photos
 * use (SERVER ONLY). Near-clone of src/lib/feed/cookPhotoStorage.ts: data-URL
 * in (validated jpeg/png/webp, ≤5MB), sha256 content key, null-on-failure.
 *
 * Keys live under avatars/<userId>/<hash>.<ext>. deleteAvatarObject only
 * deletes keys under the CALLER's own avatars/<userId>/ prefix — a crafted
 * URL can never delete another user's object (or a cook photo).
 */

import { createHash } from "crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

export function avatarStorageConfigured(): boolean {
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
 * Persist an avatar data URL to R2. Returns the public URL, or null when
 * storage is unconfigured, the payload is malformed/oversized, or the write
 * fails — the route surfaces that as a client error instead of half-saving.
 */
export async function storeAvatar(userId: string, dataUrl: string): Promise<string | null> {
  if (!avatarStorageConfigured()) return null;
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mime, b64] = match;
  const buf = Buffer.from(b64, "base64");
  if (buf.length === 0 || buf.length > MAX_BYTES) return null;

  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 24);
  const key = `avatars/${userId}/${hash}.${MIME_EXT[mime]}`;
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
    console.error("[avatarStorage] R2 put failed:", err);
    return null;
  }
}

/**
 * The R2 key a stored avatar URL refers to, ONLY when it sits under the
 * caller's own avatars/<userId>/ prefix — anything else returns null.
 * Exported for tests; routes should call deleteAvatarObject.
 */
export function ownAvatarKey(userId: string, url: string): string | null {
  const prefix = `${R2_DOMAIN}/avatars/${userId}/`;
  if (!url.startsWith(prefix)) return null;
  const key = url.slice(R2_DOMAIN.length + 1);
  // Defense in depth: no traversal / query tricks past the prefix check.
  if (key.includes("..") || key.includes("?") || key.includes("#")) return null;
  return key;
}

/**
 * Best-effort delete of a previously stored avatar object. Refuses (false)
 * any URL outside the caller's own avatars/<userId>/ prefix. Failures are
 * logged and swallowed — a stale object is cheaper than a failed request.
 */
export async function deleteAvatarObject(userId: string, url: string): Promise<boolean> {
  if (!avatarStorageConfigured()) return false;
  const key = ownAvatarKey(userId, url);
  if (!key) return false;
  try {
    await r2().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch (err) {
    console.error("[avatarStorage] R2 delete failed:", err);
    return false;
  }
}
